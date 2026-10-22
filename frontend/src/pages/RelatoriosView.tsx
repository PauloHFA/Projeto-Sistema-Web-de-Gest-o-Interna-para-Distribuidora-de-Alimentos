import React, { useState, useEffect, useRef } from 'react';
import {
  FileBarChart,
  Download,
  Printer,
  Calendar,
  Filter,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Package,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  SlidersHorizontal,
  X,
  Building2
} from 'lucide-react';
import { ERPStore } from '../services/store';

type TipoRelatorio = 'dre' | 'ranking' | 'fluxo_caixa' | 'estoque_posicao' | 'inadimplencia';
type PeriodoFiltro = 'mes_atual' | 'mes_anterior' | 'ultimos_30' | 'ano_todo';

export const RelatoriosView: React.FC = () => {
  const [state, setState] = useState(ERPStore.getState());
  const [tipoRelatorio, setTipoRelatorio] = useState<TipoRelatorio>('dre');
  const [periodo, setPeriodo] = useState<PeriodoFiltro>('mes_atual');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('TODAS');
  
  // Estado para Modal de Emissão Formal / Impressão PDF
  const [modalImpressaoAberto, setModalImpressaoAberto] = useState(false);

  useEffect(() => {
    return ERPStore.subscribe(() => {
      setState({ ...ERPStore.getState() });
    });
  }, []);

  const negocioAtivo = ERPStore.getNegocioAtivo();
  const hojeFormatada = new Date().toLocaleDateString('pt-BR');
  const horaFormatada = new Date().toLocaleTimeString('pt-BR');

  // --- CÁLCULO DO DRE (RF-40) ---
  const pedidosConcluidos = state.pedidos.filter(p => p.status === 'FATURADO' || p.status === 'ENTREGUE');
  const receitaBruta = pedidosConcluidos.reduce((acc, p) => acc + p.totalBruto, 0);
  const deducoesDescontos = pedidosConcluidos.reduce((acc, p) => acc + p.desconto, 0);
  const receitaLiquida = receitaBruta - deducoesDescontos;

  let cmvTotal = 0;
  pedidosConcluidos.forEach(p => {
    p.itens.forEach(it => {
      const prod = state.produtos.find(pr => pr.id === it.produtoId);
      if (prod) cmvTotal += prod.custoMedio * it.quantidade;
    });
  });

  const lucroBruto = receitaLiquida - cmvTotal;
  const margemBrutaPct = receitaLiquida > 0 ? (lucroBruto / receitaLiquida) * 100 : 0;

  const despesasOperacionais = state.contasPagar
    .filter(c => c.categoria !== 'CMV (Fornecedor)')
    .reduce((acc, c) => acc + c.valor, 0);

  const resultadoOperacional = lucroBruto - despesasOperacionais;
  const margemOperacionalPct = receitaLiquida > 0 ? (resultadoOperacional / receitaLiquida) * 100 : 0;

  // --- CÁLCULO DO RANKING DE PRODUTOS (RF-42) ---
  const rankingMap = new Map<number, { id: number; descricao: string; sku: string; categoria: string; qtd: number; faturamento: number; cmv: number }>();
  pedidosConcluidos.forEach(p => {
    p.itens.forEach(it => {
      const prod = state.produtos.find(pr => pr.id === it.produtoId);
      if (categoriaFiltro !== 'TODAS' && prod?.categoria !== categoriaFiltro) return;

      const existing = rankingMap.get(it.produtoId) || {
        id: it.produtoId,
        descricao: it.descricao,
        sku: prod?.sku || '',
        categoria: prod?.categoria || 'Geral',
        qtd: 0,
        faturamento: 0,
        cmv: 0,
      };
      existing.qtd += it.quantidade;
      existing.faturamento += it.subtotal;
      existing.cmv += (prod?.custoMedio || 0) * it.quantidade;
      rankingMap.set(it.produtoId, existing);
    });
  });
  const rankingProdutos = Array.from(rankingMap.values()).sort((a, b) => b.faturamento - a.faturamento);

  // --- CÁLCULO FLUXO DE CAIXA (REALIZADO VS PROJETADO - RF-41) ---
  const entradasRealizadas = state.contasReceber.filter(c => c.status === 'PAGO').reduce((acc, c) => acc + c.valorPago, 0);
  const entradasProjetadas = state.contasReceber.filter(c => c.status === 'PENDENTE').reduce((acc, c) => acc + c.valor, 0);

  const saidasRealizadas = state.contasPagar.filter(c => c.status === 'PAGO').reduce((acc, c) => acc + c.valorPago, 0);
  const saidasProjetadas = state.contasPagar.filter(c => c.status === 'PENDENTE').reduce((acc, c) => acc + c.valor, 0);

  const saldoLiquidoRealizado = entradasRealizadas - saidasRealizadas;
  const saldoLiquidoProjetado = (entradasRealizadas + entradasProjetadas) - (saidasRealizadas + saidasProjetadas);

  // --- AVALIAÇÃO PATRIMONIAL DE ESTOQUE ---
  const valorTotalEstoqueCusto = state.produtos.reduce((acc, p) => acc + (p.saldoAtual * p.custoMedio), 0);
  const valorTotalEstoqueVenda = state.produtos.reduce((acc, p) => acc + (p.saldoAtual * p.precoVenda), 0);

  // --- INADIMPLÊNCIA ---
  const dataHoje = new Date().toISOString().substring(0, 10);
  const titulosInadimplentes = state.contasReceber.filter(c => c.status === 'ATRASADO' || (c.status === 'PENDENTE' && c.vencimento < dataHoje));
  const totalInadimplencia = titulosInadimplentes.reduce((acc, c) => acc + (c.valor - c.valorPago), 0);

  // Função para Exportação CSV
  const handleExportarCSV = () => {
    let cabecalho: string[] = [];
    let linhas: any[][] = [];
    let nomeArquivo = '';

    if (tipoRelatorio === 'dre') {
      nomeArquivo = `DRE_Gerencial_${periodo}.csv`;
      cabecalho = ['Descricao Conta', 'Valor (R$)', '% Participacao'];
      linhas = [
        ['(+) RECEITA BRUTA DE VENDAS', receitaBruta.toFixed(2), ''],
        ['(-) Deducoes e Descontos', (-deducoesDescontos).toFixed(2), ''],
        ['(=) RECEITA LIQUIDA OPERACIONAL', receitaLiquida.toFixed(2), '100%'],
        ['(-) Custo das Mercadorias Vendidas (CMV)', (-cmvTotal).toFixed(2), `${((cmvTotal/receitaLiquida)*100).toFixed(1)}%`],
        ['(=) LUCRO BRUTO', lucroBruto.toFixed(2), `${margemBrutaPct.toFixed(1)}%`],
        ['(-) Despesas Operacionais', (-despesasOperacionais).toFixed(2), `${((despesasOperacionais/receitaLiquida)*100).toFixed(1)}%`],
        ['(=) RESULTADO LIQUIDO GERENCIAL', resultadoOperacional.toFixed(2), `${margemOperacionalPct.toFixed(1)}%`],
      ];
    } else if (tipoRelatorio === 'ranking') {
      nomeArquivo = `Ranking_Curva_ABC_${periodo}.csv`;
      cabecalho = ['SKU', 'Produto', 'Categoria', 'Quantidade Faturada', 'Faturamento Bruto', 'CMV', 'Lucro Bruto', 'Margem (%)'];
      linhas = rankingProdutos.map(r => [
        r.sku,
        `"${r.descricao}"`,
        `"${r.categoria}"`,
        r.qtd,
        r.faturamento.toFixed(2),
        r.cmv.toFixed(2),
        (r.faturamento - r.cmv).toFixed(2),
        r.faturamento > 0 ? (((r.faturamento - r.cmv) / r.faturamento) * 100).toFixed(1) : '0'
      ]);
    } else if (tipoRelatorio === 'fluxo_caixa') {
      nomeArquivo = `Fluxo_de_Caixa_${periodo}.csv`;
      cabecalho = ['Movimento', 'Realizado (R$)', 'Projetado (R$)', 'Total Acumulado'];
      linhas = [
        ['Entradas (Vendas e Clientes)', entradasRealizadas.toFixed(2), entradasProjetadas.toFixed(2), (entradasRealizadas + entradasProjetadas).toFixed(2)],
        ['Saídas (Fornecedores e Despesas)', (-saidasRealizadas).toFixed(2), (-saidasProjetadas).toFixed(2), (-(saidasRealizadas + saidasProjetadas)).toFixed(2)],
        ['SALDO LIQUIDO OPERACIONAL', saldoLiquidoRealizado.toFixed(2), (entradasProjetadas - saidasProjetadas).toFixed(2), saldoLiquidoProjetado.toFixed(2)]
      ];
    } else if (tipoRelatorio === 'estoque_posicao') {
      nomeArquivo = `Posicao_Fisico_Financeira_Estoque.csv`;
      cabecalho = ['SKU', 'Produto', 'Unidade', 'Saldo Fisico', 'Custo Medio', 'Preco Venda', 'Total Custo', 'Total Venda Potencial'];
      linhas = state.produtos.map(p => [
        p.sku,
        `"${p.descricao}"`,
        p.unidade,
        p.saldoAtual,
        p.custoMedio.toFixed(2),
        p.precoVenda.toFixed(2),
        (p.saldoAtual * p.custoMedio).toFixed(2),
        (p.saldoAtual * p.precoVenda).toFixed(2)
      ]);
    } else {
      nomeArquivo = `Relatorio_Inadimplencia.csv`;
      cabecalho = ['Cliente', 'Documento Origem', 'Vencimento', 'Valor Devido', 'Status'];
      linhas = titulosInadimplentes.map(t => [
        `"${t.clienteNome}"`,
        t.pedidoNumero || 'Faturamento Direto',
        t.vencimento,
        (t.valor - t.valorPago).toFixed(2),
        t.status
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [cabecalho.join(','), ...linhas.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', nomeArquivo);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Bar de Emissão com Filtros e Ações */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/60">
                <FileBarChart className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Central de Emissão de Relatórios</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Gere demonstrativos contábeis, fluxo de caixa e inventário gerencial com exportação em PDF e Excel.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setModalImpressaoAberto(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 rounded-xl border border-slate-200/90 shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5 text-blue-600" />
              Visualizar & Imprimir PDF
            </button>
            <button
              onClick={handleExportarCSV}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/25 transition"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar em Excel (.CSV)
            </button>
          </div>
        </div>

        {/* Barra de Filtros de Emissão */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Competência:
            </span>
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value as PeriodoFiltro)}
              className="text-xs py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="mes_atual">Mês Vigente (Outubro/2026)</option>
              <option value="mes_anterior">Mês Anterior (Setembro/2026)</option>
              <option value="ultimos_30">Últimos 30 Dias Corridos</option>
              <option value="ano_todo">Ano Corrente (Acumulado 2026)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Empresa Emissora:</span>
            <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
              {negocioAtivo.nome.split('(')[0].trim()}
            </span>
          </div>
        </div>
      </div>

      {/* Navegação entre os 5 Tipos de Relatórios do Sistema */}
      <div className="flex border-b border-slate-200/80 gap-6 overflow-x-auto">
        <button
          onClick={() => setTipoRelatorio('dre')}
          className={`pb-3.5 text-xs font-bold transition-all shrink-0 ${
            tipoRelatorio === 'dre' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          1. DRE Gerencial (Resultado)
        </button>

        <button
          onClick={() => setTipoRelatorio('fluxo_caixa')}
          className={`pb-3.5 text-xs font-bold transition-all shrink-0 ${
            tipoRelatorio === 'fluxo_caixa' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          2. Fluxo de Caixa (Realizado vs. Projetado)
        </button>

        <button
          onClick={() => setTipoRelatorio('ranking')}
          className={`pb-3.5 text-xs font-bold transition-all shrink-0 ${
            tipoRelatorio === 'ranking' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          3. Curva ABC & Ranking ({rankingProdutos.length} SKUs)
        </button>

        <button
          onClick={() => setTipoRelatorio('estoque_posicao')}
          className={`pb-3.5 text-xs font-bold transition-all shrink-0 ${
            tipoRelatorio === 'estoque_posicao' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          4. Posição Físico-Financeira do Estoque
        </button>

        <button
          onClick={() => setTipoRelatorio('inadimplencia')}
          className={`pb-3.5 text-xs font-bold transition-all shrink-0 ${
            tipoRelatorio === 'inadimplencia' ? 'text-rose-600 border-b-2 border-rose-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          5. Inadimplência & Títulos Vencidos
        </button>
      </div>

      {/* 1. DRE GERENCIAL */}
      {tipoRelatorio === 'dre' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4.5 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Demonstrativo de Resultado do Exercício
              </h3>
              <p className="text-[11px] text-slate-400">Regime de competência baseado nas vendas faturadas</p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-800 font-extrabold px-3 py-1 rounded-full border border-emerald-200/60 font-mono">
              Margem Operacional Líquida: {margemOperacionalPct.toFixed(1)}%
            </span>
          </div>
          <div className="p-6">
            <table className="w-full text-xs">
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/70 font-semibold text-slate-800">
                  <td className="py-3.5 px-4 font-bold">(+) RECEITA BRUTA DE VENDAS</td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                    {receitaBruta.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-400 font-mono">-</td>
                </tr>
                <tr className="hover:bg-slate-50/70 text-slate-600">
                  <td className="py-2.5 px-4 pl-8">(-) Deduções e Descontos Concedidos</td>
                  <td className="py-2.5 px-4 text-right font-mono text-rose-600 font-medium">
                    -{deducoesDescontos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-400 font-mono">
                    {receitaBruta > 0 ? `${((deducoesDescontos / receitaBruta) * 100).toFixed(1)}%` : '0%'}
                  </td>
                </tr>
                <tr className="bg-blue-50/40 font-bold text-slate-900 border-y border-blue-100">
                  <td className="py-3.5 px-4 text-blue-900">(=) RECEITA LÍQUIDA OPERACIONAL</td>
                  <td className="py-3.5 px-4 text-right font-mono text-sm text-blue-700 font-extrabold">
                    {receitaLiquida.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-blue-800 font-bold">100.0%</td>
                </tr>
                <tr className="hover:bg-slate-50/70 text-slate-600">
                  <td className="py-2.5 px-4 pl-8">(-) Custo das Mercadorias Vendidas (CMV Médio)</td>
                  <td className="py-2.5 px-4 text-right font-mono text-rose-600 font-medium">
                    -{cmvTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-500 font-mono">
                    {receitaLiquida > 0 ? `${((cmvTotal / receitaLiquida) * 100).toFixed(1)}%` : '0%'}
                  </td>
                </tr>
                <tr className="bg-emerald-50/40 font-bold text-slate-900 border-y border-emerald-100">
                  <td className="py-3.5 px-4 text-emerald-950">(=) LUCRO BRUTO</td>
                  <td className="py-3.5 px-4 text-right font-mono text-sm text-emerald-700 font-extrabold">
                    {lucroBruto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-emerald-800 font-bold">
                    {margemBrutaPct.toFixed(1)}%
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/70 text-slate-600">
                  <td className="py-2.5 px-4 pl-8">(-) Despesas Operacionais e Administrativas</td>
                  <td className="py-2.5 px-4 text-right font-mono text-rose-600 font-medium">
                    -{despesasOperacionais.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-500 font-mono">
                    {receitaLiquida > 0 ? `${((despesasOperacionais / receitaLiquida) * 100).toFixed(1)}%` : '0%'}
                  </td>
                </tr>
                <tr className="bg-slate-950 text-white font-extrabold text-sm rounded-xl">
                  <td className="py-4 px-5 rounded-l-xl">(=) RESULTADO LÍQUIDO OPERACIONAL</td>
                  <td className={`py-4 px-5 text-right font-mono text-base ${resultadoOperacional >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {resultadoOperacional.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="py-4 px-5 text-right font-mono rounded-r-xl">
                    {margemOperacionalPct.toFixed(1)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. FLUXO DE CAIXA (REALIZADO VS PROJETADO) */}
      {tipoRelatorio === 'fluxo_caixa' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200/80">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Entradas Realizadas</span>
              <p className="text-xl font-extrabold text-emerald-700 font-mono mt-1">
                {entradasRealizadas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
              <span className="text-[11px] text-emerald-600 mt-1 block">+ {entradasProjetadas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} a receber</span>
            </div>

            <div className="p-4 bg-rose-50 rounded-xl border border-rose-200/80">
              <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">Saídas Pagas</span>
              <p className="text-xl font-extrabold text-rose-700 font-mono mt-1">
                {saidasRealizadas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
              <span className="text-[11px] text-rose-600 mt-1 block">+ {saidasProjetadas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} a pagar</span>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200/80">
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">Saldo Final Acumulado</span>
              <p className={`text-xl font-extrabold font-mono mt-1 ${saldoLiquidoProjetado >= 0 ? 'text-blue-700' : 'text-rose-700'}`}>
                {saldoLiquidoProjetado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
              <span className="text-[11px] text-blue-600 mt-1 block">Projeção considerando títulos vincendos</span>
            </div>
          </div>

          <table className="w-full text-xs text-left">
            <thead className="bg-[#f8fafc] text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/70">
              <tr>
                <th className="py-3 px-4">Grupo de Movimento</th>
                <th className="py-3 px-4 text-right">Realizado em Caixa</th>
                <th className="py-3 px-4 text-right">Projetado (Carteira)</th>
                <th className="py-3 px-4 text-right">Total Consolidado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3.5 px-4 font-semibold text-emerald-900">(+) Recebimentos de Clientes</td>
                <td className="py-3.5 px-4 text-right font-mono text-emerald-700 font-bold">{entradasRealizadas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td className="py-3.5 px-4 text-right font-mono text-slate-600">{entradasProjetadas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td className="py-3.5 px-4 text-right font-mono text-emerald-800 font-bold">{(entradasRealizadas + entradasProjetadas).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-rose-900">(-) Pagamentos (Fornecedores & Operação)</td>
                <td className="py-3.5 px-4 text-right font-mono text-rose-700 font-bold">-{saidasRealizadas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td className="py-3.5 px-4 text-right font-mono text-slate-600">-{saidasProjetadas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td className="py-3.5 px-4 text-right font-mono text-rose-800 font-bold">{-((saidasRealizadas + saidasProjetadas)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
              </tr>
              <tr className="bg-slate-900 text-white font-bold">
                <td className="py-3.5 px-4">(=) Saldo Líquido do Período</td>
                <td className="py-3.5 px-4 text-right font-mono">{saldoLiquidoRealizado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td className="py-3.5 px-4 text-right font-mono">{(entradasProjetadas - saidasProjetadas).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td className="py-3.5 px-4 text-right font-mono text-emerald-400 font-extrabold">{saldoLiquidoProjetado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* 3. RANKING DE PRODUTOS */}
      {tipoRelatorio === 'ranking' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/70">
                <tr>
                  <th className="py-3.5 px-6">Posição</th>
                  <th className="py-3.5 px-6">SKU</th>
                  <th className="py-3.5 px-6">Produto</th>
                  <th className="py-3.5 px-6 text-center">Qtd. Faturada</th>
                  <th className="py-3.5 px-6 text-right">Faturamento Bruto</th>
                  <th className="py-3.5 px-6 text-right">CMV Total</th>
                  <th className="py-3.5 px-6 text-right">Margem de Lucro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rankingProdutos.map((p, idx) => {
                  const lucro = p.faturamento - p.cmv;
                  const margem = p.faturamento > 0 ? (lucro / p.faturamento) * 100 : 0;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-400 font-mono">#{idx + 1}</td>
                      <td className="py-4 px-6 font-mono font-bold text-slate-800">{p.sku}</td>
                      <td className="py-4 px-6 font-semibold text-slate-900">{p.descricao}</td>
                      <td className="py-4 px-6 text-center font-bold text-slate-700 font-mono">{p.qtd}</td>
                      <td className="py-4 px-6 text-right font-bold text-slate-900 font-mono">
                        {p.faturamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="py-4 px-6 text-right text-rose-600 font-mono">
                        {p.cmv.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="font-bold text-emerald-600 font-mono">
                          {lucro.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>{' '}
                        <span className="text-[11px] text-slate-400 font-medium font-mono">({margem.toFixed(1)}%)</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. POSIÇÃO FÍSICO-FINANCEIRA DO ESTOQUE */}
      {tipoRelatorio === 'estoque_posicao' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Valor do Estoque a Preço de Custo</span>
              <p className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
                {valorTotalEstoqueCusto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
              <span className="text-xs text-slate-400 mt-1 block">Patrimônio imobilizado em mercadorias</span>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">Valor Potencial de Venda</span>
              <p className="text-2xl font-extrabold text-emerald-800 font-mono mt-1">
                {valorTotalEstoqueVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
              <span className="text-xs text-emerald-600 mt-1 block">Margem bruta projetada de {(valorTotalEstoqueVenda - valorTotalEstoqueCusto).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
          </div>

          <table className="w-full text-xs text-left">
            <thead className="bg-[#f8fafc] text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/70">
              <tr>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Produto</th>
                <th className="py-3 px-4 text-center">Saldo Físico</th>
                <th className="py-3 px-4 text-right">Custo Médio</th>
                <th className="py-3 px-4 text-right">Total a Custo</th>
                <th className="py-3 px-4 text-right">Preço Venda</th>
                <th className="py-3 px-4 text-right">Total em Venda</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.produtos.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">{p.sku}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{p.descricao}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold">{p.saldoAtual} {p.unidade}</td>
                  <td className="py-3 px-4 text-right font-mono">{p.custoMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">{(p.saldoAtual * p.custoMedio).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  <td className="py-3 px-4 text-right font-mono">{p.precoVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">{(p.saldoAtual * p.precoVenda).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. INADIMPLÊNCIA */}
      {tipoRelatorio === 'inadimplencia' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-6 space-y-6">
          <div className="flex justify-between items-center p-4 bg-rose-50 rounded-xl border border-rose-200">
            <div>
              <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block">Total de Títulos em Atraso</span>
              <p className="text-2xl font-extrabold text-rose-700 font-mono mt-1">
                {totalInadimplencia.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            <span className="px-3 py-1 bg-rose-200 text-rose-900 font-extrabold text-xs rounded-full">
              {titulosInadimplentes.length} cliente{titulosInadimplentes.length === 1 ? '' : 's'} com pendência
            </span>
          </div>

          <table className="w-full text-xs text-left">
            <thead className="bg-[#f8fafc] text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/70">
              <tr>
                <th className="py-3 px-4">Cliente Devedor</th>
                <th className="py-3 px-4">Origem / Documento</th>
                <th className="py-3 px-4">Vencimento Original</th>
                <th className="py-3 px-4 text-right">Valor em Aberto</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {titulosInadimplentes.map(t => (
                <tr key={t.id} className="hover:bg-rose-50/30">
                  <td className="py-3 px-4 font-bold text-slate-900">{t.clienteNome}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{t.pedidoNumero || 'Faturamento Direto'}</td>
                  <td className="py-3 px-4 font-mono text-rose-600 font-semibold">{t.vencimento}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-rose-700">{(t.valor - t.valorPago).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                      Vencido
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL DE PRÉ-VISUALIZAÇÃO FORMAL DE IMPRESSÃO / SALVAR PDF */}
      {modalImpressaoAberto && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] overflow-y-auto p-8 animate-in zoom-in-95 duration-150">
            {/* Barra de Ações Superior do Modal */}
            <div className="flex justify-between items-center pb-4 mb-6 border-b border-slate-200 print:hidden">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Visualização do Documento Oficial para Impressão
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleImprimir}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition"
                >
                  <Printer className="w-3.5 h-3.5" /> Enviar para Impressora / Salvar PDF
                </button>
                <button
                  onClick={() => setModalImpressaoAberto(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* DOCUMENTO OFICIAL FORMATADO */}
            <div className="space-y-6 text-slate-900 bg-white p-4 print:p-0">
              {/* Cabeçalho Timbrado */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                <div>
                  <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-900">
                    {negocioAtivo.nome}
                  </h1>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">
                    CNPJ: {negocioAtivo.cnpj} | {negocioAtivo.tipo}
                  </p>
                  <p className="text-xs text-slate-500">{negocioAtivo.cidadeUf}</p>
                </div>
                <div className="text-right text-xs">
                  <span className="inline-block px-2.5 py-1 bg-slate-100 rounded text-slate-800 font-bold border border-slate-300">
                    RELATÓRIO GERENCIAL
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1">Emissão: {hojeFormatada} às {horaFormatada}</p>
                  <p className="text-[11px] text-slate-500">Emitido por: {state.usuario.nome}</p>
                </div>
              </div>

              {/* Título do Relatório */}
              <div className="text-center py-2 bg-slate-50 border border-slate-200 rounded-lg">
                <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-800">
                  {tipoRelatorio === 'dre' && 'Demonstrativo do Resultado do Exercício (DRE)'}
                  {tipoRelatorio === 'fluxo_caixa' && 'Fluxo de Caixa Operacional (Realizado e Projetado)'}
                  {tipoRelatorio === 'ranking' && 'Curva ABC de Vendas e Margem por Produto'}
                  {tipoRelatorio === 'estoque_posicao' && 'Posição de Estoque Físico e Financeiro'}
                  {tipoRelatorio === 'inadimplencia' && 'Relatório de Títulos Vencidos e Inadimplência'}
                </h2>
                <p className="text-[11px] text-slate-500">Competência de Referência: Outubro/2026</p>
              </div>

              {/* Conteúdo Dinâmico no Documento */}
              {tipoRelatorio === 'dre' && (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-100 border-b border-slate-200 font-bold">
                      <tr>
                        <th className="p-2.5 text-left">Estrutura de Contas</th>
                        <th className="p-2.5 text-right">Valor Líquido (R$)</th>
                        <th className="p-2.5 text-right">% Receita</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr><td className="p-2.5 font-bold">(+) Receita Bruta de Vendas</td><td className="p-2.5 text-right font-mono font-bold">{receitaBruta.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td><td className="p-2.5 text-right font-mono">-</td></tr>
                      <tr><td className="p-2.5 pl-6 text-slate-600">(-) Descontos Concedidos</td><td className="p-2.5 text-right font-mono text-rose-600">-{deducoesDescontos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td><td className="p-2.5 text-right font-mono">{((deducoesDescontos/receitaBruta)*100).toFixed(1)}%</td></tr>
                      <tr className="bg-slate-50 font-bold"><td className="p-2.5">(=) Receita Líquida Operacional</td><td className="p-2.5 text-right font-mono text-blue-700">{receitaLiquida.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td><td className="p-2.5 text-right font-mono">100.0%</td></tr>
                      <tr><td className="p-2.5 pl-6 text-slate-600">(-) Custo das Mercadorias Vendidas (CMV)</td><td className="p-2.5 text-right font-mono text-rose-600">-{cmvTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td><td className="p-2.5 text-right font-mono">{((cmvTotal/receitaLiquida)*100).toFixed(1)}%</td></tr>
                      <tr className="bg-slate-50 font-bold"><td className="p-2.5">(=) Lucro Bruto</td><td className="p-2.5 text-right font-mono text-emerald-700">{lucroBruto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td><td className="p-2.5 text-right font-mono">{margemBrutaPct.toFixed(1)}%</td></tr>
                      <tr><td className="p-2.5 pl-6 text-slate-600">(-) Despesas Operacionais</td><td className="p-2.5 text-right font-mono text-rose-600">-{despesasOperacionais.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td><td className="p-2.5 text-right font-mono">{((despesasOperacionais/receitaLiquida)*100).toFixed(1)}%</td></tr>
                      <tr className="bg-slate-900 text-white font-bold"><td className="p-3">(=) Resultado Líquido Gerencial</td><td className="p-3 text-right font-mono">{resultadoOperacional.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td><td className="p-3 text-right font-mono">{margemOperacionalPct.toFixed(1)}%</td></tr>
                    </tbody>
                  </table>
                </div>
              )}

              {tipoRelatorio !== 'dre' && (
                <div className="border border-slate-200 rounded-lg p-4 text-xs text-center text-slate-600">
                  Os dados detalhados selecionados foram consolidados e serão impressos conforme a listagem completa da tela.
                </div>
              )}

              {/* Rodapé de Validação e Assinatura */}
              <div className="pt-10 grid grid-cols-2 gap-8 text-center text-xs text-slate-600">
                <div className="border-t border-slate-400 pt-2">
                  <p className="font-bold text-slate-800">{state.usuario.nome}</p>
                  <p className="text-[11px] text-slate-500">{state.usuario.cargo}</p>
                </div>
                <div className="border-t border-slate-400 pt-2">
                  <p className="font-bold text-slate-800">Diretoria Executiva</p>
                  <p className="text-[11px] text-slate-500">Visto / Homologação</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
