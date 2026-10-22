import { PrismaClient, TipoCategoriaFinanceira, GrupoDRE } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando carga de dados (seed)...');

  // 1. Criar Perfis
  const perfis = [
    { nome: 'ADMIN', descricao: 'Acesso irrestrito a todos os módulos e configurações' },
    { nome: 'GERENTE', descricao: 'Acesso gerencial, relatórios executivos e aprovação de descontos' },
    { nome: 'VENDAS', descricao: 'Criação e consulta de pedidos e clientes' },
    { nome: 'ESTOQUE', descricao: 'Movimentação física, inventário e conferência' },
    { nome: 'FINANCEIRO', descricao: 'Contas a pagar/receber, DRE e fluxo de caixa' },
  ];

  const perfisMap: Record<string, number> = {};
  for (const p of perfis) {
    const perfil = await prisma.perfil.upsert({
      where: { nome: p.nome },
      update: {},
      create: p,
    });
    perfisMap[p.nome] = perfil.id;
  }

  // 2. Criar Usuário Administrador Padrão
  const salt = await bcrypt.genSalt(10);
  const senhaHash = await bcrypt.hash('admin123', salt);

  await prisma.usuario.upsert({
    where: { email: 'admin@distribuidora.com.br' },
    update: {},
    create: {
      nome: 'Administrador do Sistema',
      email: 'admin@distribuidora.com.br',
      senhaHash,
      perfilId: perfisMap['ADMIN'],
      ativo: true,
    },
  });

  // 3. Categorias Financeiras para o DRE Simplificado
  const categoriasFinanceiras = [
    { nome: 'Venda de Mercadorias', tipo: TipoCategoriaFinanceira.RECEITA, grupoDRE: GrupoDRE.RECEITA_BRUTA },
    { nome: 'Devoluções de Vendas', tipo: TipoCategoriaFinanceira.DESPESA, grupoDRE: GrupoDRE.DEDUCOES },
    { nome: 'Descontos Concedidos', tipo: TipoCategoriaFinanceira.DESPESA, grupoDRE: GrupoDRE.DEDUCOES },
    { nome: 'Custo de Mercadorias Vendidas (CMV)', tipo: TipoCategoriaFinanceira.DESPESA, grupoDRE: GrupoDRE.CMV },
    { nome: 'Fretes e Logística', tipo: TipoCategoriaFinanceira.DESPESA, grupoDRE: GrupoDRE.DESPESA_OPERACIONAL },
    { nome: 'Salários e Encargos', tipo: TipoCategoriaFinanceira.DESPESA, grupoDRE: GrupoDRE.DESPESA_OPERACIONAL },
    { nome: 'Aluguel, Água e Energia', tipo: TipoCategoriaFinanceira.DESPESA, grupoDRE: GrupoDRE.DESPESA_OPERACIONAL },
    { nome: 'Despesas Administrativas', tipo: TipoCategoriaFinanceira.DESPESA, grupoDRE: GrupoDRE.DESPESA_OPERACIONAL },
  ];

  for (const cat of categoriasFinanceiras) {
    await prisma.categoriaFinanceira.upsert({
      where: { nome: cat.nome },
      update: {},
      create: cat,
    });
  }

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

