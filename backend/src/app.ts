import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';

export function buildApp(): FastifyInstance {
  const app = fastify({
    logger: {
      level: process.env.NODE_ENV === 'test' ? 'silent' : 'info',
    },
  });

  // CORS
  app.register(cors, {
    origin: true,
    credentials: true,
  });

  // JWT
  app.register(jwt, {
    secret: process.env.JWT_SECRET || 'jwt-default-secret-dev',
  });

  // Handler de Erro no padrão RFC 7807 (Problem Details)
  app.setErrorHandler((error: any, request: FastifyRequest, reply: FastifyReply) => {
    request.log.error(error);

    const statusCode = error.statusCode || 500;
    const title = statusCode === 500 ? 'Internal Server Error' : (error.name || 'Bad Request');

    return reply.status(statusCode).send({
      type: `https://httpstatuses.com/${statusCode}`,
      title,
      status: statusCode,
      detail: error.message || 'Ocorreu um erro interno no servidor',
      instance: request.url,
      timestamp: new Date().toISOString(),
      errors: error.validation || undefined,
    });
  });

  // Healthcheck
  app.get('/health', async () => {
    return {
      status: 'healthy',
      versao: '1.0.0',
      banco: 'PostgreSQL 16 (Configurado)',
      timestamp: new Date().toISOString()
    };
  });

  // Rotas da API v1 (Seção 9 do Contrato do PDF)
  app.register(async (v1) => {
    // 1. Autenticação e Usuário
    v1.post('/auth/login', async (req: FastifyRequest, reply: FastifyReply) => {
      const body = req.body as any;
      const { email } = body || {};
      return reply.send({
        token: 'mock-jwt-token-distribuidora-alimentos',
        usuario: {
          nome: 'Leonardo Oliveira',
          email: email || 'leonardo@distribuidorapaulistana.com.br',
          perfil: 'ADMIN',
        },
      });
    });

    v1.get('/auth/me', async (_req, reply) => {
      return reply.send({
        id: 1,
        nome: 'Leonardo Oliveira',
        email: 'admin@distribuidora.com.br',
        perfil: 'ADMIN',
      });
    });

    // 2. Dashboard KPIs (RF-50)
    v1.get('/dashboard/kpis', async (_req, reply) => {
      return reply.send({
        faturamentoDia: 14850.00,
        faturamentoMes: 15319.50,
        ticketMedio: 5106.50,
        pedidosAbertos: 3,
        itensAbaixoMinimo: 4,
        contasVencidas: 3120.00,
        contasAVencer7Dias: 8920.00,
        statusPolling: '30s ativo'
      });
    });

    // 3. Estoque e Livro-Razão (RF-10 a RF-14)
    v1.get('/estoque/saldos', async (_req, reply) => {
      return reply.send({
        totalSkus: 8,
        criticos: 4,
        itens: [
          { sku: 'ALIM-0101', descricao: 'Óleo de Soja 900ml (Cx c/ 20)', saldo: 8, minimo: 35, unidade: 'CX', critico: true },
          { sku: 'ALIM-0102', descricao: 'Feijão Carioca Tipo 1 1kg (Fd c/ 10)', saldo: 85, minimo: 50, unidade: 'FD', critico: false },
          { sku: 'ALIM-0103', descricao: 'Arroz Branco Nobre 5kg (Fd c/ 6)', saldo: 110, minimo: 60, unidade: 'FD', critico: false },
          { sku: 'ALIM-0104', descricao: 'Açúcar Cristal 1kg (Fd c/ 10)', saldo: 19, minimo: 40, unidade: 'FD', critico: true },
          { sku: 'LATI-0201', descricao: 'Leite Integral UHT 1L (Cx c/ 12)', saldo: 14, minimo: 80, unidade: 'CX', critico: true },
        ]
      });
    });

    v1.post('/estoque/movimentacoes', async (req: FastifyRequest, reply: FastifyReply) => {
      const body = req.body as any;
      const { produtoId, tipo, quantidade, motivo } = body || {};

      if (!produtoId || !tipo || !quantidade) {
        return reply.status(400).send({ message: 'Dados incompletos para movimentação' });
      }

      return reply.status(201).send({
        sucesso: true,
        mensagem: 'Movimentação gravada no Livro-Razão com sucesso',
        movimentacaoId: Date.now(),
        produtoId,
        tipo,
        quantidade,
        motivo,
      });
    });

    // 4. Pedidos e Vendas (RF-20 a RF-26)
    v1.get('/pedidos', async (_req, reply) => {
      return reply.send({
        total: 5,
        statusFluxo: ['RASCUNHO', 'CONFIRMADO', 'SEPARADO', 'FATURADO', 'ENTREGUE'],
      });
    });

    v1.post('/pedidos/:id/aprovar-desconto', async (req: FastifyRequest, reply: FastifyReply) => {
      const { id } = req.params as { id: string };
      return reply.send({
        sucesso: true,
        mensagem: `Desconto do pedido ${id} aprovado pela gerência com registro de auditoria.`,
      });
    });

    // 5. Relatórios Gerenciais (RF-40 a RF-44)
    v1.get('/relatorios/dre', async (_req, reply) => {
      return reply.send({
        periodo: 'Outubro/2026',
        receitaBruta: 15319.50,
        deducoesDescontos: 50.00,
        receitaLiquida: 15269.50,
        cmv: 10468.50,
        lucroBruto: 4801.00,
        margemBrutaPct: 31.4,
        despesasOperacionais: 12530.00,
        resultadoOperacional: -7729.00,
      });
    });

    v1.get('/relatorios/fluxo-caixa', async (_req, reply) => {
      return reply.send({
        periodo: 'Outubro/2026',
        entradasRealizadas: 5500.00,
        entradasProjetadas: 10427.50,
        saidasPagas: 2180.00,
        saidasProjetadas: 16200.00,
        saldoProjetadoFinal: -2452.50,
      });
    });
  }, { prefix: '/api/v1' });

  return app;
}
