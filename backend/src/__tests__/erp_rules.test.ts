import { describe, it } from 'node:test';
import assert from 'node:assert';

// ----------------------------------------------------------------------------
// SUÍTE DE TESTES AUTOMATIZADOS: REGRAS DE NEGÓCIO DO ERP
// Distribuidora de Alimentos (Execução Nativa Node.js Test Runner)
// ----------------------------------------------------------------------------

describe('Regra RF-14 & RF-11: Livro-Razão e Controle de Saldo de Estoque', () => {
  it('deve calcular o saldo como a soma das movimentações físicas de entrada e saída', () => {
    const movimentacoes = [
      { tipo: 'ENTRADA', quantidade: 50 },
      { tipo: 'SAIDA', quantidade: -20 },
      { tipo: 'ENTRADA', quantidade: 30 },
      { tipo: 'PERDA_AVARIA', quantidade: -5 },
    ];

    const saldoCalculado = movimentacoes.reduce((acc, mov) => acc + mov.quantidade, 0);
    assert.strictEqual(saldoCalculado, 55);
  });

  it('deve bloquear operação de saída que resulte em saldo negativo (RF-14)', () => {
    const saldoAtual = 15;
    const tentativaSaida = 20;

    const podeDarSaida = (saldoAtual - tentativaSaida) >= 0;
    assert.strictEqual(podeDarSaida, false);

    const validaOperacao = (saldo: number, saida: number) => {
      if (saldo - saida < 0) {
        throw new Error('Saldo insuficiente para atender a saída solicitada.');
      }
      return saldo - saida;
    };

    assert.throws(
      () => validaOperacao(saldoAtual, tentativaSaida),
      /Saldo insuficiente para atender a saída solicitada/
    );
  });

  it('deve identificar produto em nível de ruptura quando o saldo for menor ou igual ao mínimo (RF-12)', () => {
    const estoqueMinimo = 25;
    const saldoAtualCritico = 18;
    const saldoAtualRegular = 40;

    const isAlertaCritico = (saldo: number, minimo: number) => saldo <= minimo;

    assert.strictEqual(isAlertaCritico(saldoAtualCritico, estoqueMinimo), true);
    assert.strictEqual(isAlertaCritico(saldoAtualRegular, estoqueMinimo), false);
  });
});

describe('Regra RF-23: Alçadas de Aprovação de Desconto Comercial', () => {
  it('deve exigir aprovação do Gerente caso o desconto comercial ultrapasse 10%', () => {
    const percentualMaximoVendedor = 10;

    const verificarNecessidadeAprovacao = (desconto: number) => {
      return desconto > percentualMaximoVendedor;
    };

    assert.strictEqual(verificarNecessidadeAprovacao(5), false);
    assert.strictEqual(verificarNecessidadeAprovacao(10), false);
    assert.strictEqual(verificarNecessidadeAprovacao(12.5), true);
  });
});

describe('Regra RF-40: Apuração Contábil da DRE Gerencial', () => {
  it('deve calcular corretamente Receita Líquida, Lucro Bruto e Resultado Operacional', () => {
    const receitaBruta = 50000.00;
    const deducoesDescontos = 2500.00;
    const cmv = 28000.00;
    const despesasOperacionais = 11000.00;

    const receitaLiquida = receitaBruta - deducoesDescontos;
    const lucroBruto = receitaLiquida - cmv;
    const resultadoOperacional = lucroBruto - despesasOperacionais;
    const margemOperacionalPct = (resultadoOperacional / receitaLiquida) * 100;

    assert.strictEqual(receitaLiquida, 47500.00);
    assert.strictEqual(lucroBruto, 19500.00);
    assert.strictEqual(resultadoOperacional, 8500.00);
    assert.strictEqual(Number(margemOperacionalPct.toFixed(2)), 17.89);
  });
});

describe('Regra RF-24: Transacionalidade do Faturamento', () => {
  it('deve validar disponibilidade de estoque para todos os itens antes do faturamento', () => {
    const estoqueDisponivel: Record<string, number> = {
      'OLEO_SOJA': 50,
      'ARROZ_5KG': 10,
    };

    const pedidoItens = [
      { sku: 'OLEO_SOJA', quantidade: 20 },
      { sku: 'ARROZ_5KG', quantidade: 15 },
    ];

    const podeFaturar = pedidoItens.every(
      item => (estoqueDisponivel[item.sku] || 0) >= item.quantidade
    );

    assert.strictEqual(podeFaturar, false);
  });
});

