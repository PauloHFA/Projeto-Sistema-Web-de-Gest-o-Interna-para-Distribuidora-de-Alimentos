import {
  Produto,
  MovimentacaoEstoque,
  Pedido,
  ContaReceber,
  ContaPagar,
  Cliente,
  Fornecedor,
  Negocio,
  UsuarioPerfil,
  PerfilUsuario
} from '../types';

const STORAGE_KEY = 'distribuidora_erp_data_v3';

export interface AppState {
  negocios: Negocio[];
  negocioAtivoId: number;
  usuario: UsuarioPerfil;
  produtos: Produto[];
  movimentacoes: MovimentacaoEstoque[];
  pedidos: Pedido[];
  contasReceber: ContaReceber[];
  contasPagar: ContaPagar[];
  clientes: Cliente[];
  fornecedores: Fornecedor[];
}

export const PERFIS_DISPONIVEIS: Record<PerfilUsuario, UsuarioPerfil> = {
  ADMIN: {
    nome: 'Leonardo Oliveira',
    email: 'leonardo@distribuidorapaulistana.com.br',
    cargo: 'Diretor / Administrador Geral',
    perfil: 'ADMIN',
    avatar: 'LO',
    notificacoesEstoque: true,
    notificacoesFinanceiro: true,
  },
  GERENTE: {
    nome: 'Roberto Mendes',
    email: 'roberto.gerente@distribuidora.com',
    cargo: 'Gerente Geral de Operações',
    perfil: 'GERENTE',
    avatar: 'RM',
    notificacoesEstoque: true,
    notificacoesFinanceiro: true,
  },
  VENDAS: {
    nome: 'Carlos Souza',
    email: 'carlos.vendas@distribuidora.com',
    cargo: 'Executivo de Vendas',
    perfil: 'VENDAS',
    avatar: 'CS',
    notificacoesEstoque: false,
    notificacoesFinanceiro: false,
  },
  ESTOQUE: {
    nome: 'João Almoxarife',
    email: 'joao.estoque@distribuidora.com',
    cargo: 'Líder de Estoque & Inventário',
    perfil: 'ESTOQUE',
    avatar: 'JA',
    notificacoesEstoque: true,
    notificacoesFinanceiro: false,
  },
  FINANCEIRO: {
    nome: 'Juliana Costa',
    email: 'juliana.financeiro@distribuidora.com',
    cargo: 'Controladora Financeira',
    perfil: 'FINANCEIRO',
    avatar: 'JC',
    notificacoesEstoque: false,
    notificacoesFinanceiro: true,
  },
};

const INITIAL_NEGOCIOS: Negocio[] = [
  {
    id: 1,
    nome: 'Distribuidora Central Paulistana (Matriz)',
    tipo: 'Distribuidora de Alimentos e Mercearia',
    cidadeUf: 'São Paulo - SP',
    cnpj: '45.123.890/0001-12',
    ativo: true,
  },
  {
    id: 2,
    nome: 'Distribuidora Campinas Express (Filial)',
    tipo: 'Distribuidora de Laticínios e Grãos',
    cidadeUf: 'Campinas - SP',
    cnpj: '45.123.890/0002-95',
    ativo: true,
  },
];

const INITIAL_PRODUTOS: Produto[] = [
  { id: 1, sku: 'ALIM-0101', descricao: 'Óleo de Soja 900ml (Cx c/ 20)', categoria: 'Mercearia Básica', unidade: 'CX', precoVenda: 145.00, custoMedio: 108.00, estoqueMinimo: 35, saldoAtual: 8, ativo: true },
  { id: 2, sku: 'ALIM-0102', descricao: 'Feijão Carioca Tipo 1 1kg (Fd c/ 10)', categoria: 'Grãos e Cereais', unidade: 'FD', precoVenda: 89.90, custoMedio: 62.00, estoqueMinimo: 50, saldoAtual: 85, ativo: true },
  { id: 3, sku: 'ALIM-0103', descricao: 'Arroz Branco Nobre 5kg (Fd c/ 6)', categoria: 'Grãos e Cereais', unidade: 'FD', precoVenda: 185.00, custoMedio: 135.00, estoqueMinimo: 60, saldoAtual: 110, ativo: true },
  { id: 4, sku: 'ALIM-0104', descricao: 'Açúcar Cristal 1kg (Fd c/ 10)', categoria: 'Mercearia Básica', unidade: 'FD', precoVenda: 48.50, custoMedio: 34.00, estoqueMinimo: 40, saldoAtual: 19, ativo: true },
  { id: 5, sku: 'LATI-0201', descricao: 'Leite Integral UHT 1L (Cx c/ 12)', categoria: 'Laticínios', unidade: 'CX', precoVenda: 68.00, custoMedio: 49.50, estoqueMinimo: 80, saldoAtual: 14, ativo: true },
  { id: 6, sku: 'BEBI-0301', descricao: 'Café Torrado e Moído 500g (Cx c/ 20)', categoria: 'Matinais', unidade: 'CX', precoVenda: 340.00, custoMedio: 260.00, estoqueMinimo: 25, saldoAtual: 42, ativo: true },
  { id: 7, sku: 'MASS-0401', descricao: 'Macarrão Espaguete com Ovos 500g (Cx c/ 24)', categoria: 'Massas e Farinhas', unidade: 'CX', precoVenda: 98.00, custoMedio: 68.00, estoqueMinimo: 30, saldoAtual: 55, ativo: true },
  { id: 8, sku: 'CONS-0501', descricao: 'Molho de Tomate Sachê 300g (Cx c/ 24)', categoria: 'Conservas e Molhos', unidade: 'CX', precoVenda: 58.00, custoMedio: 39.00, estoqueMinimo: 45, saldoAtual: 12, ativo: true },
];

const INITIAL_CLIENTES: Cliente[] = [
  { id: 1, razaoSocial: 'Supermercado Progresso Ltda', nomeFantasia: 'Super Progresso', documento: '12.345.678/0001-90', email: 'compras@progresso.com.br', telefone: '(11) 3456-7890', limiteCredito: 25000.00, vendedor: 'Carlos Souza', ativo: true },
  { id: 2, razaoSocial: 'Padaria e Confeitaria Estrela de Ouro', nomeFantasia: 'Padaria Estrela', documento: '98.765.432/0001-11', email: 'contato@estreladeouro.com', telefone: '(11) 2233-4455', limiteCredito: 8000.00, vendedor: 'Carlos Souza', ativo: true },
  { id: 3, razaoSocial: 'Mercearia e Açougue São Bento', nomeFantasia: 'Mercado São Bento', documento: '45.678.901/0001-22', email: 'gerencia@saobento.com.br', telefone: '(11) 98765-4321', limiteCredito: 15000.00, vendedor: 'Carlos Souza', ativo: true },
  { id: 4, razaoSocial: 'Restaurante Sabor Caseiro Eireli', nomeFantasia: 'Restaurante Sabor', documento: '33.222.111/0001-44', email: 'financeiro@saborcaseiro.com', telefone: '(11) 4567-8910', limiteCredito: 10000.00, vendedor: 'Carlos Souza', ativo: true },
];

const INITIAL_FORNECEDORES: Fornecedor[] = [
  { id: 1, razaoSocial: 'Moinho Aliança Alimentos S/A', nomeFantasia: 'Moinho Aliança', documento: '11.222.333/0001-55', email: 'vendas@moinhoalianca.com.br', telefone: '(41) 3344-5566', prazoPagamento: '28 dias', ativo: true },
  { id: 2, razaoSocial: 'Cooperativa Agropecuária Central', nomeFantasia: 'Coop Central Lácteos', documento: '22.333.444/0001-66', email: 'comercial@coopcentral.com.br', telefone: '(31) 2233-7788', prazoPagamento: '21 dias', ativo: true },
  { id: 3, razaoSocial: 'Indústria de Óleos Vegetais Paulistana', nomeFantasia: 'Óleos Paulistana', documento: '33.444.555/0001-77', email: 'pedidos@oleos.com.br', telefone: '(19) 3876-5432', prazoPagamento: '30 dias', ativo: true },
];

const INITIAL_MOVIMENTACOES: MovimentacaoEstoque[] = [
  { id: 101, produtoId: 1, produtoDescricao: 'Óleo de Soja 900ml (Cx c/ 20)', tipo: 'ENTRADA', quantidade: 50, custoUnitario: 108.00, origem: 'NF 1290 - Óleos Paulistana', motivo: 'Compra de Fornecedor', usuario: 'Almoxarife João', criadoEm: '2026-10-18 09:30' },
  { id: 102, produtoId: 1, produtoDescricao: 'Óleo de Soja 900ml (Cx c/ 20)', tipo: 'SAIDA', quantidade: -40, custoUnitario: 108.00, origem: 'Pedido #1001', motivo: 'Faturamento de Venda', usuario: 'Sistema Automático', criadoEm: '2026-10-19 14:15' },
  { id: 103, produtoId: 1, produtoDescricao: 'Óleo de Soja 900ml (Cx c/ 20)', tipo: 'PERDA_AVARIA', quantidade: -2, custoUnitario: 108.00, origem: 'Inventário / Avaria', motivo: 'Caixa danificada no transporte', usuario: 'Gerente Roberto', criadoEm: '2026-10-20 11:00' },
  { id: 104, produtoId: 5, produtoDescricao: 'Leite Integral UHT 1L (Cx c/ 12)', tipo: 'ENTRADA', quantidade: 100, custoUnitario: 49.50, origem: 'NF 4432 - Coop Central', motivo: 'Compra de Reposição', usuario: 'Almoxarife João', criadoEm: '2026-10-15 08:20' },
  { id: 105, produtoId: 5, produtoDescricao: 'Leite Integral UHT 1L (Cx c/ 12)', tipo: 'SAIDA', quantidade: -86, custoUnitario: 49.50, origem: 'Pedido #1002 e #1003', motivo: 'Faturamentos de Clientes', usuario: 'Sistema Automático', criadoEm: '2026-10-21 16:40' },
];

const INITIAL_PEDIDOS: Pedido[] = [
  {
    id: 1,
    numero: 'PED-1001',
    clienteId: 1,
    clienteNome: 'Supermercado Progresso Ltda',
    vendedorNome: 'Carlos Souza',
    status: 'ENTREGUE',
    itens: [
      { produtoId: 1, descricao: 'Óleo de Soja 900ml (Cx c/ 20)', unidade: 'CX', quantidade: 30, precoUnitario: 145.00, desconto: 0, subtotal: 4350.00 },
      { produtoId: 3, descricao: 'Arroz Branco Nobre 5kg (Fd c/ 6)', unidade: 'FD', quantidade: 20, precoUnitario: 185.00, desconto: 50.00, subtotal: 3650.00 },
    ],
    totalBruto: 8050.00,
    desconto: 50.00,
    totalLiquido: 8000.00,
    condicaoPagamento: 'Boleto 28 dias',
    criadoEm: '2026-10-19 14:15',
  },
  {
    id: 2,
    numero: 'PED-1002',
    clienteId: 2,
    clienteNome: 'Padaria e Confeitaria Estrela de Ouro',
    vendedorNome: 'Carlos Souza',
    status: 'FATURADO',
    itens: [
      { produtoId: 5, descricao: 'Leite Integral UHT 1L (Cx c/ 12)', unidade: 'CX', quantidade: 25, precoUnitario: 68.00, desconto: 0, subtotal: 1700.00 },
      { produtoId: 4, descricao: 'Açúcar Cristal 1kg (Fd c/ 10)', unidade: 'FD', quantidade: 15, precoUnitario: 48.50, desconto: 0, subtotal: 727.50 },
    ],
    totalBruto: 2427.50,
    desconto: 0,
    totalLiquido: 2427.50,
    condicaoPagamento: 'Boleto 14 dias',
    criadoEm: '2026-10-21 10:20',
  },
  {
    id: 3,
    numero: 'PED-1003',
    clienteId: 3,
    clienteNome: 'Mercearia e Açougue São Bento',
    vendedorNome: 'Carlos Souza',
    status: 'SEPARADO',
    itens: [
      { produtoId: 2, descricao: 'Feijão Carioca Tipo 1 1kg (Fd c/ 10)', unidade: 'FD', quantidade: 20, precoUnitario: 89.90, desconto: 0, subtotal: 1798.00 },
      { produtoId: 6, descricao: 'Café Torrado e Moído 500g (Cx c/ 20)', unidade: 'CX', quantidade: 5, precoUnitario: 340.00, desconto: 50.00, subtotal: 1650.00 },
    ],
    totalBruto: 3498.00,
    desconto: 50.00,
    totalLiquido: 3448.00,
    condicaoPagamento: 'Boleto 21 dias',
    criadoEm: '2026-10-22 09:15',
  },
  {
    id: 4,
    numero: 'PED-1004',
    clienteId: 4,
    clienteNome: 'Restaurante Sabor Caseiro Eireli',
    vendedorNome: 'Carlos Souza',
    status: 'CONFIRMADO',
    itens: [
      { produtoId: 7, descricao: 'Macarrão Espaguete com Ovos 500g (Cx c/ 24)', unidade: 'CX', quantidade: 10, precoUnitario: 98.00, desconto: 0, subtotal: 980.00 },
      { produtoId: 8, descricao: 'Molho de Tomate Sachê 300g (Cx c/ 24)', unidade: 'CX', quantidade: 8, precoUnitario: 58.00, desconto: 0, subtotal: 464.00 },
    ],
    totalBruto: 1444.00,
    desconto: 0,
    totalLiquido: 1444.00,
    condicaoPagamento: 'PIX à Vista',
    criadoEm: '2026-10-22 10:45',
  },
  {
    id: 5,
    numero: 'PED-1005',
    clienteId: 1,
    clienteNome: 'Supermercado Progresso Ltda',
    vendedorNome: 'Carlos Souza',
    status: 'RASCUNHO',
    itens: [
      { produtoId: 3, descricao: 'Arroz Branco Nobre 5kg (Fd c/ 6)', unidade: 'FD', quantidade: 15, precoUnitario: 185.00, desconto: 0, subtotal: 2775.00 },
    ],
    totalBruto: 2775.00,
    desconto: 0,
    totalLiquido: 2775.00,
    condicaoPagamento: 'Boleto 30 dias',
    criadoEm: '2026-10-22 11:30',
  },
];

const INITIAL_CONTAS_RECEBER: ContaReceber[] = [
  { id: 1, pedidoId: 1, pedidoNumero: 'PED-1001', clienteNome: 'Supermercado Progresso Ltda', valor: 8000.00, vencimento: '2026-11-16', status: 'PENDENTE', valorPago: 0, formaPagamento: 'Boleto' },
  { id: 2, pedidoId: 2, pedidoNumero: 'PED-1002', clienteNome: 'Padaria e Confeitaria Estrela de Ouro', valor: 2427.50, vencimento: '2026-11-04', status: 'PENDENTE', valorPago: 0, formaPagamento: 'Boleto' },
  { id: 3, clienteNome: 'Restaurante Bom Paladar', valor: 3120.00, vencimento: '2026-10-20', status: 'ATRASADO', valorPago: 0, formaPagamento: 'Boleto' },
  { id: 4, clienteNome: 'Mercado Central da Vila', valor: 5500.00, vencimento: '2026-10-18', status: 'PAGO', valorPago: 5500.00, pagoEm: '2026-10-18 15:30', formaPagamento: 'TED' },
];

const INITIAL_CONTAS_PAGAR: ContaPagar[] = [
  { id: 1, fornecedorNome: 'Óleos Paulistana S/A', categoria: 'CMV (Fornecedor)', descricao: 'NF 1290 - Lote Óleo de Soja', valor: 5400.00, vencimento: '2026-11-15', status: 'PENDENTE', valorPago: 0 },
  { id: 2, fornecedorNome: 'Coop Central Lácteos', categoria: 'CMV (Fornecedor)', descricao: 'NF 4432 - Lote Leite UHT', valor: 4950.00, vencimento: '2026-11-05', status: 'PENDENTE', valorPago: 0 },
  { id: 3, fornecedorNome: 'Imobiliária Santa Cruz', categoria: 'Despesa Operacional', descricao: 'Aluguel do Galpão Logístico', valor: 4500.00, vencimento: '2026-10-25', status: 'PENDENTE', valorPago: 0 },
  { id: 4, fornecedorNome: 'CPFL Energia Elétrica', categoria: 'Despesa Operacional', descricao: 'Energia Galpão e Câmaras Frias', valor: 2180.00, vencimento: '2026-10-21', status: 'PAGO', valorPago: 2180.00, pagoEm: '2026-10-21 11:20' },
  { id: 5, fornecedorNome: 'Transportes Rápidos Ltda', categoria: 'Fretes e Logística', descricao: 'Frete Terceirizado Região Metropolitana', valor: 1350.00, vencimento: '2026-10-22', status: 'PENDENTE', valorPago: 0 },
];

export class ERPStore {
  private static state: AppState = ERPStore.loadState();
  private static listeners: Array<() => void> = [];

  private static loadState(): AppState {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Erro ao ler estado do storage:', e);
      }
    }
    return {
      negocios: INITIAL_NEGOCIOS,
      negocioAtivoId: 1,
      usuario: PERFIS_DISPONIVEIS.ADMIN,
      produtos: INITIAL_PRODUTOS,
      movimentacoes: INITIAL_MOVIMENTACOES,
      pedidos: INITIAL_PEDIDOS,
      contasReceber: INITIAL_CONTAS_RECEBER,
      contasPagar: INITIAL_CONTAS_PAGAR,
      clientes: INITIAL_CLIENTES,
      fornecedores: INITIAL_FORNECEDORES,
    };
  }

  private static persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ERPStore.state));
    ERPStore.notify();
  }

  public static subscribe(listener: () => void) {
    ERPStore.listeners.push(listener);
    return () => {
      ERPStore.listeners = ERPStore.listeners.filter(l => l !== listener);
    };
  }

  private static notify() {
    ERPStore.listeners.forEach(l => l());
  }

  public static getState(): AppState {
    return ERPStore.state;
  }

  // --- CONTROLE DE ACESSO (RBAC) ---
  public static alternarPerfilUsuario(perfil: PerfilUsuario) {
    if (PERFIS_DISPONIVEIS[perfil]) {
      ERPStore.state.usuario = { ...PERFIS_DISPONIVEIS[perfil] };
      ERPStore.persist();
    }
  }

  public static temPermissao(recurso: 'DRE' | 'FINANCEIRO' | 'ESTOQUE' | 'PEDIDOS' | 'APROVAR_DESCONTO'): boolean {
    const papel = ERPStore.state.usuario.perfil;
    if (papel === 'ADMIN') return true;
    if (papel === 'GERENTE') return true;

    if (papel === 'VENDAS') {
      return recurso === 'PEDIDOS' || recurso === 'ESTOQUE';
    }
    if (papel === 'ESTOQUE') {
      return recurso === 'ESTOQUE';
    }
    if (papel === 'FINANCEIRO') {
      return recurso === 'FINANCEIRO' || recurso === 'DRE';
    }
    return false;
  }

  // --- GESTÃO DE NEGÓCIOS / UNIDADES ---
  public static adicionarNegocio(novo: Omit<Negocio, 'id' | 'ativo'>): Negocio {
    const id = Date.now();
    const negocioCriado: Negocio = {
      ...novo,
      id,
      ativo: true,
    };
    ERPStore.state.negocios.push(negocioCriado);
    ERPStore.state.negocioAtivoId = id;
    ERPStore.persist();
    return negocioCriado;
  }

  public static alternarNegocio(negocioId: number) {
    if (ERPStore.state.negocios.some(n => n.id === negocioId)) {
      ERPStore.state.negocioAtivoId = negocioId;
      ERPStore.persist();
    }
  }

  public static getNegocioAtivo(): Negocio {
    return (
      ERPStore.state.negocios.find(n => n.id === ERPStore.state.negocioAtivoId) ||
      ERPStore.state.negocios[0]
    );
  }

  public static atualizarPerfil(dados: Partial<UsuarioPerfil>) {
    ERPStore.state.usuario = {
      ...ERPStore.state.usuario,
      ...dados,
    };
    ERPStore.persist();
  }

  // --- CONTROLE DE ESTOQUE ---
  public static registrarMovimentacao(
    produtoId: number,
    tipo: MovimentacaoEstoque['tipo'],
    quantidade: number,
    motivo: string,
    origem: string = 'Lançamento Manual',
    usuario?: string
  ): { success: boolean; message: string } {
    const prod = ERPStore.state.produtos.find(p => p.id === produtoId);
    if (!prod) return { success: false, message: 'Produto não encontrado' };

    const qtdAbsoluta = Math.abs(quantidade);
    let qtdCalculada = qtdAbsoluta;

    if (tipo === 'SAIDA' || tipo === 'PERDA_AVARIA') {
      qtdCalculada = -qtdAbsoluta;
      if (prod.saldoAtual + qtdCalculada < 0) {
        return {
          success: false,
          message: `Saldo insuficiente! Saldo atual é ${prod.saldoAtual} ${prod.unidade}. A saída de ${qtdAbsoluta} resultaria em saldo negativo.`
        };
      }
    } else if (tipo === 'AJUSTE') {
      qtdCalculada = quantidade - prod.saldoAtual;
    }

    prod.saldoAtual += qtdCalculada;

    const novaMov: MovimentacaoEstoque = {
      id: Date.now(),
      produtoId: prod.id,
      produtoDescricao: prod.descricao,
      tipo,
      quantidade: qtdCalculada,
      custoUnitario: prod.custoMedio,
      origem,
      motivo: motivo || (tipo === 'ENTRADA' ? 'Entrada no estoque' : 'Movimentação operacional'),
      usuario: usuario || ERPStore.state.usuario.nome,
      criadoEm: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    ERPStore.state.movimentacoes.unshift(novaMov);
    ERPStore.persist();

    return { success: true, message: `Movimentação registrada com sucesso! Novo saldo: ${prod.saldoAtual} ${prod.unidade}` };
  }

  // --- PEDIDOS E VENDAS ---
  public static criarPedido(novoPedido: Omit<Pedido, 'id' | 'numero' | 'criadoEm'>): Pedido {
    const id = Date.now();
    const numero = `PED-${Math.floor(1000 + Math.random() * 9000)}`;
    const pedidoCompleto: Pedido = {
      ...novoPedido,
      id,
      numero,
      criadoEm: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    ERPStore.state.pedidos.unshift(pedidoCompleto);
    ERPStore.persist();
    return pedidoCompleto;
  }

  public static aprovarDesconto(pedidoId: number): { success: boolean; message: string } {
    if (!ERPStore.temPermissao('APROVAR_DESCONTO')) {
      return { success: false, message: 'Apenas usuários com perfil GERENTE ou ADMIN podem aprovar descontos acima de 10%.' };
    }
    const pedido = ERPStore.state.pedidos.find(p => p.id === pedidoId);
    if (!pedido) return { success: false, message: 'Pedido não encontrado.' };

    pedido.descontoAprovado = true;
    ERPStore.persist();
    return { success: true, message: `Desconto do pedido ${pedido.numero} aprovado por ${ERPStore.state.usuario.nome}!` };
  }

  public static avancarStatusPedido(pedidoId: number): { success: boolean; message: string } {
    const pedido = ERPStore.state.pedidos.find(p => p.id === pedidoId);
    if (!pedido) return { success: false, message: 'Pedido não encontrado' };

    // Regra RF-23: se o pedido tem desconto > 10% e não foi aprovado pelo gerente, trava no CONFIRMAR
    if (pedido.status === 'RASCUNHO' && pedido.desconto > 0 && ((pedido.desconto / pedido.totalBruto) * 100) > 10 && !pedido.descontoAprovado) {
      return {
        success: false,
        message: 'Aprovação pendente! Este pedido possui mais de 10% de desconto e exige aprovação formal do Gerente antes de avançar (Regra RF-23).'
      };
    }

    const statusFlow: Pedido['status'][] = ['RASCUNHO', 'CONFIRMADO', 'SEPARADO', 'FATURADO', 'ENTREGUE'];
    const currentIndex = statusFlow.indexOf(pedido.status);

    if (currentIndex === -1 || currentIndex >= statusFlow.length - 1) {
      return { success: false, message: `Pedido já está no status final (${pedido.status})` };
    }

    const proximoStatus = statusFlow[currentIndex + 1];

    if (proximoStatus === 'FATURADO') {
      for (const item of pedido.itens) {
        const prod = ERPStore.state.produtos.find(p => p.id === item.produtoId);
        if (!prod || prod.saldoAtual < item.quantidade) {
          return {
            success: false,
            message: `Não é possível faturar! Estoque insuficiente para "${item.descricao}". Saldo atual: ${prod?.saldoAtual || 0}, exigido: ${item.quantidade}`
          };
        }
      }

      for (const item of pedido.itens) {
        ERPStore.registrarMovimentacao(
          item.produtoId,
          'SAIDA',
          item.quantidade,
          `Faturamento do Pedido ${pedido.numero}`,
          `Pedido ${pedido.numero}`,
          'Faturamento Automático'
        );
      }

      const dataVenc = new Date();
      dataVenc.setDate(dataVenc.getDate() + 28);
      const novaConta: ContaReceber = {
        id: Date.now(),
        pedidoId: pedido.id,
        pedidoNumero: pedido.numero,
        clienteNome: pedido.clienteNome,
        valor: pedido.totalLiquido,
        vencimento: dataVenc.toISOString().substring(0, 10),
        status: 'PENDENTE',
        valorPago: 0,
        formaPagamento: pedido.condicaoPagamento || 'Boleto 28 dias',
      };
      ERPStore.state.contasReceber.unshift(novaConta);
    }

    pedido.status = proximoStatus;
    ERPStore.persist();
    return { success: true, message: `Status do pedido ${pedido.numero} atualizado para ${proximoStatus}!` };
  }

  public static cancelarPedido(pedidoId: number): { success: boolean; message: string } {
    const pedido = ERPStore.state.pedidos.find(p => p.id === pedidoId);
    if (!pedido) return { success: false, message: 'Pedido não encontrado' };

    if (pedido.status === 'FATURADO' || pedido.status === 'ENTREGUE') {
      return { success: false, message: 'Não é possível cancelar pedidos já faturados/entregues diretamente.' };
    }

    pedido.status = 'CANCELADO';
    ERPStore.persist();
    return { success: true, message: `Pedido ${pedido.numero} cancelado.` };
  }

  // --- FINANCEIRO ---
  public static baixarContaReceber(id: number) {
    const conta = ERPStore.state.contasReceber.find(c => c.id === id);
    if (conta) {
      conta.status = 'PAGO';
      conta.valorPago = conta.valor;
      conta.pagoEm = new Date().toISOString().replace('T', ' ').substring(0, 16);
      ERPStore.persist();
    }
  }

  public static baixarContaPagar(id: number) {
    const conta = ERPStore.state.contasPagar.find(c => c.id === id);
    if (conta) {
      conta.status = 'PAGO';
      conta.valorPago = conta.valor;
      conta.pagoEm = new Date().toISOString().replace('T', ' ').substring(0, 16);
      ERPStore.persist();
    }
  }

  public static adicionarContaPagar(nova: Omit<ContaPagar, 'id' | 'valorPago' | 'status'>) {
    const conta: ContaPagar = {
      ...nova,
      id: Date.now(),
      valorPago: 0,
      status: 'PENDENTE',
    };
    ERPStore.state.contasPagar.unshift(conta);
    ERPStore.persist();
  }

  // --- CADASTROS ---
  public static adicionarProduto(prod: Omit<Produto, 'id' | 'saldoAtual' | 'ativo'>) {
    const novoProduto: Produto = {
      ...prod,
      id: Date.now(),
      saldoAtual: 0,
      ativo: true,
    };
    ERPStore.state.produtos.push(novoProduto);
    ERPStore.persist();
  }

  public static alternarStatusProduto(id: number) {
    const prod = ERPStore.state.produtos.find(p => p.id === id);
    if (prod) {
      prod.ativo = !prod.ativo;
      ERPStore.persist();
    }
  }

  public static adicionarCliente(cliente: Omit<Cliente, 'id' | 'ativo'>) {
    const novo: Cliente = {
      ...cliente,
      id: Date.now(),
      ativo: true,
    };
    ERPStore.state.clientes.push(novo);
    ERPStore.persist();
  }

  public static resetarParaPadrao() {
    localStorage.removeItem(STORAGE_KEY);
    ERPStore.state = ERPStore.loadState();
    ERPStore.persist();
  }
}
