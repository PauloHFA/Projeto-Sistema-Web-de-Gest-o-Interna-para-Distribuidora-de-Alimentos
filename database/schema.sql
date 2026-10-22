-- ============================================================================
-- PROJETO FREELANCER: SISTEMA WEB DE GESTÃO INTERNA PARA DISTRIBUIDORA DE ALIMENTOS
-- Esquema Inicial do Banco de Dados PostgreSQL
-- ============================================================================

-- Extensão para UUID se necessário
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. TIPOS ENUMERADOS
-- ----------------------------------------------------------------------------
CREATE TYPE status_pedido AS ENUM (
    'RASCUNHO',
    'CONFIRMADO',
    'SEPARADO',
    'FATURADO',
    'ENTREGUE',
    'CANCELADO'
);

CREATE TYPE tipo_movimentacao_estoque AS ENUM (
    'ENTRADA',       -- Compras, recebimento de fornecedor
    'SAIDA',         -- Faturamento de vendas
    'AJUSTE',        -- Acertos de inventário
    'PERDA_AVARIA',  -- Perecíveis vencidos ou produtos danificados
    'DEVOLUCAO'      -- Retorno de mercadoria de cliente
);

CREATE TYPE status_financeiro AS ENUM (
    'PENDENTE',
    'PARCIAL',
    'PAGO',
    'CANCELADO'
);

CREATE TYPE tipo_categoria_financeira AS ENUM (
    'RECEITA',
    'DESPESA'
);

CREATE TYPE grupo_dre AS ENUM (
    'RECEITA_BRUTA',
    'DEDUCOES',
    'CMV',
    'DESPESA_OPERACIONAL',
    'OUTRAS'
);

-- ----------------------------------------------------------------------------
-- 2. CONTROLE DE ACESSO (RBAC) E USUÁRIOS
-- ----------------------------------------------------------------------------
CREATE TABLE perfis (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,       -- 'ADMIN', 'GERENTE', 'VENDAS', 'ESTOQUE', 'FINANCEIRO'
    descricao TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permissoes (
    id SERIAL PRIMARY KEY,
    recurso VARCHAR(50) NOT NULL,            -- ex: 'pedido', 'estoque', 'financeiro'
    acao VARCHAR(50) NOT NULL,               -- ex: 'criar', 'ler', 'atualizar', 'excluir', 'aprovar_desconto'
    descricao TEXT,
    CONSTRAINT uq_recurso_acao UNIQUE (recurso, acao)
);

CREATE TABLE perfis_permissoes (
    perfil_id INTEGER NOT NULL REFERENCES perfis(id) ON DELETE CASCADE,
    permissao_id INTEGER NOT NULL REFERENCES permissoes(id) ON DELETE CASCADE,
    PRIMARY KEY (perfil_id, permissao_id)
);

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    perfil_id INTEGER NOT NULL REFERENCES perfis(id),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 3. CADASTROS BÁSICOS (CLIENTES, FORNECEDORES, PRODUTOS)
-- ----------------------------------------------------------------------------
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    razao_social VARCHAR(150) NOT NULL,
    nome_fantasia VARCHAR(150),
    documento VARCHAR(20) NOT NULL UNIQUE,   -- CPF ou CNPJ (validado)
    email VARCHAR(150),
    telefone VARCHAR(30),
    endereco_completo JSONB,
    limite_credito NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    condicao_pagamento VARCHAR(50),
    vendedor_id INTEGER REFERENCES usuarios(id),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fornecedores (
    id SERIAL PRIMARY KEY,
    razao_social VARCHAR(150) NOT NULL,
    nome_fantasia VARCHAR(150),
    documento VARCHAR(20) NOT NULL UNIQUE,   -- CNPJ
    email VARCHAR(150),
    telefone VARCHAR(30),
    endereco_completo JSONB,
    prazo_pagamento_padrao VARCHAR(50),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categorias_produto (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE produtos (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    descricao VARCHAR(200) NOT NULL,
    categoria_id INTEGER REFERENCES categorias_produto(id),
    unidade VARCHAR(10) NOT NULL DEFAULT 'UN', -- 'KG', 'CX', 'UN', 'PCT'
    preco_venda NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    custo_medio NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    estoque_minimo NUMERIC(14,3) NOT NULL DEFAULT 0.000,
    controla_validade BOOLEAN NOT NULL DEFAULT FALSE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 4. ESTOQUE (LIVRO-RAZÃO / LEDGER IMUTÁVEL)
-- ----------------------------------------------------------------------------
CREATE TABLE movimentacoes_estoque (
    id BIGSERIAL PRIMARY KEY,
    produto_id INTEGER NOT NULL REFERENCES produtos(id),
    tipo tipo_movimentacao_estoque NOT NULL,
    quantidade NUMERIC(14,3) NOT NULL,       -- Positiva para entrada/ajuste+, Negativa para saída/perda
    custo_unitario NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    origem_tipo VARCHAR(50),                 -- 'PEDIDO', 'INVENTARIO', 'COMPRA', 'AVARIA'
    origem_id BIGINT,                        -- ID do pedido, inventário, etc.
    usuario_id INTEGER REFERENCES usuarios(id),
    lote VARCHAR(50),                        -- Opcional (se contratado lote/validade)
    validade DATE,                           -- Opcional (FEFO)
    motivo TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Visão agregada de saldos atuais de estoque
CREATE OR REPLACE VIEW visao_saldos_estoque AS
SELECT 
    p.id AS produto_id,
    p.sku,
    p.descricao,
    p.unidade,
    p.estoque_minimo,
    p.preco_venda,
    p.custo_medio,
    COALESCE(SUM(m.quantidade), 0.000) AS saldo_atual,
    CASE 
        WHEN COALESCE(SUM(m.quantidade), 0.000) <= p.estoque_minimo THEN TRUE 
        ELSE FALSE 
    END AS alerta_minimo
FROM produtos p
LEFT JOIN movimentacoes_estoque m ON p.id = m.produto_id
WHERE p.ativo = TRUE
GROUP BY p.id, p.sku, p.descricao, p.unidade, p.estoque_minimo, p.preco_venda, p.custo_medio;

-- ----------------------------------------------------------------------------
-- 5. PEDIDOS E VENDAS
-- ----------------------------------------------------------------------------
CREATE TABLE pedidos (
    id BIGSERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id),
    vendedor_id INTEGER NOT NULL REFERENCES usuarios(id),
    status status_pedido NOT NULL DEFAULT 'RASCUNHO',
    total_bruto NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    desconto_percentual NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    desconto_valor NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    total_liquido NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    desconto_aprovado_por INTEGER REFERENCES usuarios(id),
    condicao_pagamento VARCHAR(50),
    observacoes TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE itens_pedido (
    id BIGSERIAL PRIMARY KEY,
    pedido_id BIGINT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    produto_id INTEGER NOT NULL REFERENCES produtos(id),
    quantidade NUMERIC(14,3) NOT NULL,
    preco_unitario NUMERIC(14,2) NOT NULL,
    desconto NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    subtotal NUMERIC(14,2) NOT NULL,
    CONSTRAINT chk_quantidade_positiva CHECK (quantidade > 0)
);

CREATE TABLE pedidos_historico (
    id BIGSERIAL PRIMARY KEY,
    pedido_id BIGINT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    status status_pedido NOT NULL,
    usuario_id INTEGER REFERENCES usuarios(id),
    observacao TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 6. FINANCEIRO (CONTAS A RECEBER, CONTAS A PAGAR, DRE)
-- ----------------------------------------------------------------------------
CREATE TABLE categorias_financeiras (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    tipo tipo_categoria_financeira NOT NULL,
    grupo_dre grupo_dre NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE contas_receber (
    id BIGSERIAL PRIMARY KEY,
    pedido_id BIGINT REFERENCES pedidos(id),
    cliente_id INTEGER NOT NULL REFERENCES clientes(id),
    parcela INTEGER NOT NULL DEFAULT 1,
    total_parcelas INTEGER NOT NULL DEFAULT 1,
    valor NUMERIC(14,2) NOT NULL,
    vencimento DATE NOT NULL,
    valor_pago NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    pago_em TIMESTAMP WITH TIME ZONE,
    forma_pagamento VARCHAR(50),
    status status_financeiro NOT NULL DEFAULT 'PENDENTE',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contas_pagar (
    id BIGSERIAL PRIMARY KEY,
    fornecedor_id INTEGER REFERENCES fornecedores(id),
    categoria_id INTEGER NOT NULL REFERENCES categorias_financeiras(id),
    descricao VARCHAR(200) NOT NULL,
    parcela INTEGER NOT NULL DEFAULT 1,
    total_parcelas INTEGER NOT NULL DEFAULT 1,
    valor NUMERIC(14,2) NOT NULL,
    vencimento DATE NOT NULL,
    valor_pago NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    pago_em TIMESTAMP WITH TIME ZONE,
    status status_financeiro NOT NULL DEFAULT 'PENDENTE',
    recorrente BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 7. AUDITORIA E IMPORTAÇÃO DE PLANILHAS
-- ----------------------------------------------------------------------------
CREATE TABLE auditoria (
    id BIGSERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    acao VARCHAR(50) NOT NULL,               -- 'CRIAR', 'ALTERAR', 'EXCLUIR', 'BAIXAR', 'AJUSTAR_ESTOQUE'
    entidade VARCHAR(50) NOT NULL,           -- 'pedidos', 'movimentacoes_estoque', 'contas_receber'
    entidade_id BIGINT,
    antes JSONB,
    depois JSONB,
    ip VARCHAR(45),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE importacoes (
    id SERIAL PRIMARY KEY,
    origem VARCHAR(100) NOT NULL,            -- ex: 'planilha_produtos.xlsx'
    arquivo_nome VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,             -- 'PENDENTE', 'PROCESSANDO', 'CONCLUIDO', 'FALHA'
    resumo JSONB,                            -- { "total": 500, "importados": 498, "erros": 2 }
    usuario_id INTEGER REFERENCES usuarios(id),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 8. ÍNDICES DE PERFORMANCE E PESQUISA
-- ----------------------------------------------------------------------------
CREATE INDEX idx_clientes_documento ON clientes(documento);
CREATE INDEX idx_clientes_ativo ON clientes(ativo);
CREATE INDEX idx_produtos_sku ON produtos(sku);
CREATE INDEX idx_produtos_categoria ON produtos(categoria_id);
CREATE INDEX idx_movimentacoes_produto ON movimentacoes_estoque(produto_id);
CREATE INDEX idx_movimentacoes_criado_em ON movimentacoes_estoque(criado_em);
CREATE INDEX idx_pedidos_status ON pedidos(status);
CREATE INDEX idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX idx_pedidos_criado_em ON pedidos(criado_em);
CREATE INDEX idx_contas_receber_vencimento ON contas_receber(vencimento, status);
CREATE INDEX idx_contas_pagar_vencimento ON contas_pagar(vencimento, status);
CREATE INDEX idx_auditoria_entidade ON auditoria(entidade, entidade_id);

-- ----------------------------------------------------------------------------
-- 9. DADOS INICIAIS (SEED BÁSICO)
-- ----------------------------------------------------------------------------
INSERT INTO perfis (nome, descricao) VALUES
('ADMIN', 'Acesso irrestrito a todos os módulos e configurações'),
('GERENTE', 'Acesso gerencial, aprovação de descontos e relatórios'),
('VENDAS', 'Criação de pedidos, consulta de clientes e saldos de estoque'),
('ESTOQUE', 'Gestão de movimentações físicas, recebimentos e inventário'),
('FINANCEIRO', 'Contas a pagar, contas a receber, fluxo de caixa e DRE');

INSERT INTO categorias_financeiras (nome, tipo, grupo_dre) VALUES
('Venda de Mercadorias', 'RECEITA', 'RECEITA_BRUTA'),
('Devoluções de Vendas', 'DESPESA', 'DEDUCOES'),
('Descontos Concedidos', 'DESPESA', 'DEDUCOES'),
('Custo das Mercadorias Vendidas (CMV)', 'DESPESA', 'CMV'),
('Fretes e Entregas', 'DESPESA', 'DESPESA_OPERACIONAL'),
('Salários e Encargos', 'DESPESA', 'DESPESA_OPERACIONAL'),
('Despesas com Instalações (Energia, Água, Aluguel)', 'DESPESA', 'DESPESA_OPERACIONAL'),
('Manutenção e Operações', 'DESPESA', 'DESPESA_OPERACIONAL'),
('Despesas Administrativas e Sistemas', 'DESPESA', 'DESPESA_OPERACIONAL');

