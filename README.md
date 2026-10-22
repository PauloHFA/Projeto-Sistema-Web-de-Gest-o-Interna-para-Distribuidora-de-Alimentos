# 🏢 Sistema Web de Gestão Interna para Distribuidora de Alimentos (ERP)

> Sistema web de gestão operacional, estoque por livro-razão (ledger), faturamento, controladoria financeira (DRE), controle de acesso por papel (RBAC) e central de relatórios executivos para distribuidoras de alimentos.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff.svg)](https://vitejs.dev/)
[![Fastify](https://img.shields.io/badge/Fastify-4.27-black.svg)](https://fastify.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-100%25%20Passing-brightgreen.svg)]()

---

## 📌 Visão Geral do Projeto

Este projeto foi concebido e estruturado a partir dos requisitos reais de negócio para modernizar uma **distribuidora de alimentos com 45 funcionários**, substituindo planilhas manuais de Excel por um sistema web centralizado, seguro e de alto desempenho.

Diferente de sistemas com CRUDs genéricos, a aplicação foi construída sobre princípios contábeis e de cadeia de suprimentos rigorosos:
- **Estoque com modelo Livro-Razão (Stock Ledger):** O saldo físico nunca é editado diretamente; ele é calculado como a soma das movimentações físicas imutáveis, com prevenção de saldo negativo.
- **Transacionalidade no Faturamento:** A passagem do pedido para faturado debita o estoque físico e gera automaticamente os títulos a receber no contas a receber com vencimento estipulado.
- **DRE Gerencial Automático:** Apuração em tempo real de Receita Bruta, Deduções, Receita Líquida, CMV (Custo das Mercadorias Vendidas) e Lucro Bruto / Operacional sem digitação manual.
- **Matriz de Permissões RBAC com Telas HTTP 403:** Isolamento estrito de módulos entre os perfis Admin, Gerente, Vendas, Estoque e Financeiro.
- **Alçadas de Desconto:** Pedidos com desconto superior a 10% exigem visto formal do Gerente para prosseguir.
- **Multi-Negócio / Filiais:** Suporte para o proprietário cadastrar e alternar entre filiais ou outros negócios do mesmo segmento em 1 clique.

---

## 🛠️ Stack Tecnológica

### Frontend
- **React 18** com **TypeScript** e **Vite** (build ultra-rápido)
- **Tailwind CSS** para estilização com tipografia corporativa (*Plus Jakarta Sans* e *JetBrains Mono*)
- **Recharts** para gráficos executivos interativos (Área de faturamento vs. compras e barras de ponto de reposição)
- **Lucide Icons** para iconografia
- **TanStack Query** e persistência reativa

### Backend
- **Node.js** com **TypeScript** e **Fastify** (alta performance de I/O)
- **Prisma ORM** com migrações versionadas e tipagem estrita
- Tratamento unificado de erros segundo a **RFC 7807** (*Problem Details for HTTP APIs*)
- Autenticação e autorização por papel (RBAC) via tokens JWT

### Banco de Dados & Infraestrutura
- **PostgreSQL 16** estruturado com enums, chaves estrangeiras, índices de busca e tipos `NUMERIC(14,2)` para integridade monetária
- **Docker & Docker Compose** para orquestração de banco local persistente

### Testes Automatizados
- **Node.js Native Test Runner** para suíte de testes unitários das regras de negócio

---

## 📦 Módulos do Sistema

### 1. 📊 Dashboard Executivo (KPIs em Tempo Real)
- Cartões com faturamento do mês, ticket médio, itens abaixo do estoque mínimo e contas a pagar.
- Gráfico de área: evolução diária de vendas faturadas vs. reposições de compras.
- Gráfico de barras: monitoramento de risco de ruptura (saldo atual vs. ponto de reposição).
- *Polling* automático de 30 segundos com indicador de sincronização ativa.

### 2. 📦 Controle Físico de Estoque & Livro-Razão (Ledger)
- Catálogo de alimentos com SKU, descrição, custo médio, preço de venda e saldo.
- Registro de movimentações: **Entrada** (compra), **Saída** (venda), **Ajuste** (balanço/inventário), **Perda/Avaria** e **Devolução**.
- **Regra RF-14:** Bloqueio e alerta impeditivo caso uma saída resulte em saldo negativo.
- **Aba Livro-Razão:** Histórico imutável de todas as movimentações com usuário, data, quantidade e justificativa.
- Exportação de inventário completo em planilha `.CSV`.

### 3. 🛒 Gestão de Vendas & Pedidos
- Pipeline Kanban por status: `RASCUNHO` $\to$ `CONFIRMADO` $\to$ `SEPARADO` $\to$ `FATURADO` $\to$ `ENTREGUE`.
- Emissão de pedidos com múltiplos alimentos, cálculo dinâmico de subtotais e limites de crédito do cliente.
- **Alçada Gerencial (RF-23):** Desconto > 10% trava o pedido até a aprovação de um perfil Gerente/Admin.
- Ao faturar, o sistema debita as quantidades do estoque e gera o título a receber automaticamente.
- Visualização de espelho gerencial do pedido para conferência.

### 4. 💵 Contas a Pagar & Contas a Receber
- Contas a Receber alimentadas pelos faturamentos dos pedidos com baixa de recebimento.
- Contas a Pagar com categorias do plano de contas contábil (CMV, Despesa Operacional, Fretes, Salários).
- Resumo de saldos em carteira, títulos quitados e saldo líquido projetado.

### 5. 📑 Central de Emissão de Relatórios
- **DRE Gerencial Completo:** Demonstração do resultado com margens operacionais calculadas em tempo real.
- **Fluxo de Caixa:** Realizado em caixa vs. projetado em carteira com saldo acumulado.
- **Curva ABC & Ranking:** Top produtos por faturamento, quantidade vendida e margem individual.
- **Posição de Estoque:** Avaliação a preço de custo vs. potencial de venda no mercado.
- **Inadimplência:** Títulos vencidos e valores em atraso.
- **Emissão Timbrada (PDF / Impressão):** Layout oficial para impressão A4 com dados da empresa e espaço de visto para a diretoria.
- **Download em Excel (.CSV):** Exportação direta de qualquer demonstrativo.

### 6. 🛡️ Controle de Acesso por Papel (RBAC)
- Simulador rápido de perfis no topo da interface:
  - `ADMIN` (Acesso total)
  - `GERENTE` (Aprova alçadas, DRE, fluxo de caixa e relatórios)
  - `VENDAS` (Emite pedidos e consulta clientes/estoque; bloqueado para finanças e DRE)
  - `ESTOQUE` (Lança movimentações e inventário; bloqueado para financeiro)
  - `FINANCEIRO` (Contas a pagar/receber, conciliação e DRE)
- Telas formais de **HTTP 403 (Acesso Proibido)** quando um usuário tenta acessar recursos fora de sua alçada.

### 7. 🏢 Gestão de Negócios / Filiais
- Permite ao proprietário cadastrar e alternar entre matriz, filiais ou depósitos em um clique no cabeçalho.

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- **Node.js** (v20 ou superior)
- **npm** (v10 ou superior)
- **Docker Desktop** (opcional, para rodar o banco PostgreSQL)

### 1. Clonar o Repositório
```bash
git clone https://github.com/PauloHFA/Projeto-Freelancer-Sistema-Web-de-Gest-o-Interna-para-Distribuidora-de-Alimentos.git
cd Projeto-Freelancer-Sistema-Web-de-Gest-o-Interna-para-Distribuidora-de-Alimentos
```

### 2. Inicializar o Banco de Dados (PostgreSQL via Docker)
```bash
# Sobe o contêiner do PostgreSQL na porta 5432 com volume persistente
npm run db:up
```

### 3. Rodar o Backend (API REST Fastify)
```bash
cd backend
npm install
npm run dev
```
> Servidor da API rodando em: `http://localhost:3333`  
> Health check: `http://localhost:3333/health`

### 4. Rodar o Frontend (Interface Web React)
Em outro terminal:
```bash
cd frontend
npm install
npm run dev
```
> Interface Web acessível em: `http://localhost:5173`

---

## 🧪 Execução da Suíte de Testes Automatizados

O projeto conta com testes unitários cobrindo as fórmulas contábeis e travas operacionais:

```bash
cd backend
npm run test
```

Resultados cobertos:
- `✔` Cálculo do saldo físico como soma algébrica das movimentações (Livro-Razão)
- `✔` Bloqueio de saída com saldo negativo (RF-14)
- `✔` Identificação de nível de ruptura abaixo do estoque mínimo (RF-12)
- `✔` Alçada de desconto gerencial acima de 10% (RF-23)
- `✔` Apuração da DRE Gerencial (Receita Líquida, CMV e Margens) (RF-40)
- `✔` Verificação atômica de disponibilidade de estoque antes do faturamento (RF-24)

---

## 📂 Estrutura de Diretórios

```
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Modelagem relacional tipada do ERP
│   │   └── seed.ts             # Carga inicial de perfis e categorias
│   ├── src/
│   │   ├── __tests__/          # Suíte de testes automatizados de regras de negócio
│   │   ├── app.ts              # Configuração do Fastify, CORS, JWT e RFC 7807
│   │   ├── server.ts           # Inicialização do servidor HTTP
│   │   └── config/             # Configurações de banco e ambiente
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/         # Menus, alternador de negócios e telas HTTP 403
│   │   ├── pages/
│   │   │   ├── DashboardView.tsx   # Gráficos Recharts e KPIs
│   │   │   ├── EstoqueView.tsx     # Livro-razão e controle físico
│   │   │   ├── PedidosView.tsx     # Pipeline Kanban e alçadas
│   │   │   ├── FinanceiroView.tsx  # Contas a pagar/receber
│   │   │   ├── RelatoriosView.tsx  # DRE e Emissão oficial em PDF/CSV
│   │   │   └── CadastrosView.tsx   # Clientes, fornecedores e produtos
│   │   ├── services/
│   │   │   └── store.ts        # Gerenciamento reativo de estado e regras de negócio
│   │   ├── types/              # Definições TypeScript de todo o domínio
│   │   ├── App.tsx             # Layout mestre com RBAC e navegação
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── database/
│   └── schema.sql              # DDL completo em PostgreSQL nativo com enums e views
├── docker-compose.yml          # Orquestração do PostgreSQL 16
├── .gitignore                  # Arquivos ignorados (node_modules, .env, PDFs)
└── README.md                   # Documentação do projeto
```

---

## 👨‍💻 Autor
Desenvolvido por **Paulo HFA** para demonstração de arquitetura sênior de software para sistemas de gestão empresarial.
