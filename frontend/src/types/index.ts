export type UnidadeMedida = 'UN' | 'CX' | 'KG' | 'FD' | 'LT';

export type PerfilUsuario = 'ADMIN' | 'GERENTE' | 'VENDAS' | 'ESTOQUE' | 'FINANCEIRO';

export interface Negocio {
  id: number;
  nome: string;
  tipo: string;
  cidadeUf: string;
  cnpj: string;
  ativo: boolean;
}

export interface UsuarioPerfil {
  nome: string;
  email: string;
  cargo: string;
  perfil: PerfilUsuario;
  avatar: string;
  notificacoesEstoque: boolean;
  notificacoesFinanceiro: boolean;
}

export interface Produto {
  id: number;
  sku: string;
  descricao: string;
  categoria: string;
  unidade: UnidadeMedida;
  precoVenda: number;
  custoMedio: number;
  estoqueMinimo: number;
  saldoAtual: number;
  ativo: boolean;
}

export type TipoMovimentacao = 'ENTRADA' | 'SAIDA' | 'AJUSTE' | 'PERDA_AVARIA' | 'DEVOLUCAO';

export interface MovimentacaoEstoque {
  id: number;
  produtoId: number;
  produtoDescricao: string;
  tipo: TipoMovimentacao;
  quantidade: number;
  custoUnitario: number;
  origem: string;
  motivo: string;
  usuario: string;
  criadoEm: string;
}

export type StatusPedido = 'RASCUNHO' | 'CONFIRMADO' | 'SEPARADO' | 'FATURADO' | 'ENTREGUE' | 'CANCELADO';

export interface ItemPedido {
  produtoId: number;
  descricao: string;
  unidade: string;
  quantidade: number;
  precoUnitario: number;
  desconto: number;
  subtotal: number;
}

export interface Pedido {
  id: number;
  numero: string;
  clienteId: number;
  clienteNome: string;
  vendedorNome: string;
  status: StatusPedido;
  itens: ItemPedido[];
  totalBruto: number;
  desconto: number;
  totalLiquido: number;
  condicaoPagamento: string;
  descontoAprovado?: boolean;
  observacoes?: string;
  criadoEm: string;
}

export type StatusFinanceiro = 'PENDENTE' | 'PAGO' | 'ATRASADO' | 'CANCELADO';

export interface ContaReceber {
  id: number;
  pedidoId?: number;
  pedidoNumero?: string;
  clienteNome: string;
  valor: number;
  vencimento: string;
  status: StatusFinanceiro;
  valorPago: number;
  pagoEm?: string;
  formaPagamento: string;
}

export interface ContaPagar {
  id: number;
  fornecedorNome: string;
  categoria: string;
  descricao: string;
  valor: number;
  vencimento: string;
  status: StatusFinanceiro;
  valorPago: number;
  pagoEm?: string;
}

export interface Cliente {
  id: number;
  razaoSocial: string;
  nomeFantasia: string;
  documento: string;
  email: string;
  telefone: string;
  limiteCredito: number;
  vendedor: string;
  ativo: boolean;
}

export interface Fornecedor {
  id: number;
  razaoSocial: string;
  nomeFantasia: string;
  documento: string;
  email: string;
  telefone: string;
  prazoPagamento: string;
  ativo: boolean;
}
