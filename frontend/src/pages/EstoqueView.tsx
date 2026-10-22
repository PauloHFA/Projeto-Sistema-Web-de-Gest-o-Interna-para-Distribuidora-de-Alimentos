import React, { useState, useEffect } from 'react';
import {
  Package,
  PlusCircle,
  ArrowUpCircle,
  ArrowDownCircle,
  AlertTriangle,
  History,
  Search,
  Filter,
  Download,
  CheckCircle2,
  XCircle,
  RotateCcw
} from 'lucide-react';
import { ERPStore } from '../services/store';
import { Produto, MovimentacaoEstoque, TipoMovimentacao } from '../types';

export const EstoqueView: React.FC = () => {
  const [state, setState] = useState(ERPStore.getState());
  const [tabInterna, setTabInterna] = useState<'saldos' | 'livro-razao'>('saldos');
  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('TODAS');
  
  // Estado do Modal de Nova Movimentação
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoSelecionadoId, setProdutoSelecionadoId] = useState<number>(state.produtos[0]?.id || 1);
  const [tipoMov, setTipoMov] = useState<TipoMovimentacao>('ENTRADA');
  const [quantidade, setQuantidade] = useState<string>('10');
  const [motivo, setMotivo] = useState('');
  const [usuario, setUsuario] = useState('Almoxarife João');
  const [mensagemFeedback, setMensagemFeedback] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  useEffect(() => {
    return ERPStore.subscribe(() => {
      setState({ ...ERPStore.getState() });
    });
  }, []);

  const categorias = ['TODAS', ...Array.from(new Set(state.produtos.map(p => p.categoria)))];

  const produtosFiltrados = state.produtos.filter(p => {
    const matchBusca = p.descricao.toLowerCase().includes(busca.toLowerCase()) || p.sku.toLowerCase().includes(busca.toLowerCase());
    const matchCat = filtroCategoria === 'TODAS' || p.categoria === filtroCategoria;
    return matchBusca && matchCat;
  });

  const movimentacoesFiltradas = state.movimentacoes.filter(m => {
    return m.produtoDescricao.toLowerCase().includes(busca.toLowerCase()) || m.origem.toLowerCase().includes(busca.toLowerCase());
  });

  const handleSalvarMovimentacao = (e: React.FormEvent) => {
    e.preventDefault();
    const qtdNum = Number(quantidade);
    if (isNaN(qtdNum) || qtdNum <= 0) {
      setMensagemFeedback({ tipo: 'erro', texto: 'Informe uma quantidade válida superior a zero.' });
      return;
    }

    const resultado = ERPStore.registrarMovimentacao(
      produtoSelecionadoId,
      tipoMov,
      qtdNum,
      motivo,
      'Painel de Controle de Estoque',
      usuario
    );

    if (resultado.success) {
      setMensagemFeedback({ tipo: 'sucesso', texto: resultado.message });
      setMotivo('');
      setQuantidade('10');
      setTimeout(() => {
        setModalAberto(false);
        setMensagemFeedback(null);
      }, 1500);
    } else {
      setMensagemFeedback({ tipo: 'erro', texto: resultado.message });
    }
  };

  const exportarCSV = () => {
    const cabecalho = ['SKU', 'Descricao', 'Categoria', 'Unidade', 'SaldoAtual', 'EstoqueMinimo', 'CustoMedio', 'PrecoVenda'];
    const linhas = state.produtos.map(p => [
      `"${p.sku}"`,
      `"${p.descricao}"`,
      `"${p.categoria}"`,
      `"${p.unidade}"`,
      p.saldoAtual,
      p.estoqueMinimo,
      p.custoMedio.toFixed(2),
      p.precoVenda.toFixed(2)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [cabecalho.join(','), ...linhas.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventario_estoque_${new Date().toISOString().substring(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Topo com Ações e Design Refinado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/60">
              <Package className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Controle Operacional de Estoque</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Modelo de <strong>Livro-Razão (Ledger)</strong>: todo saldo é calculado exclusivamente pela soma das movimentações físicas imutáveis.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={exportarCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" /> Exportar CSV
          </button>
          <button
            onClick={() => setModalAberto(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/25 transition"
          >
            <PlusCircle className="w-4 h-4" /> Registrar Movimentação
          </button>
        </div>
      </div>

      {/* Navegação entre Saldos e Livro-Razão */}
      <div className="flex border-b border-slate-200/80 gap-6">
        <button
          onClick={() => setTabInterna('saldos')}
          className={`pb-3.5 text-xs font-bold transition-all relative ${
            tabInterna === 'saldos'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Saldos Físicos e Nível Mínimo ({state.produtos.length})
        </button>
        <button
          onClick={() => setTabInterna('livro-razao')}
          className={`pb-3.5 text-xs font-bold transition-all relative flex items-center gap-1.5 ${
            tabInterna === 'livro-razao'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-3.5 h-3.5" /> Livro-Razão de Movimentações ({state.movimentacoes.length})
        </button>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por descrição, SKU ou lote..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
          />
        </div>
        {tabInterna === 'saldos' && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="py-2 px-3 text-xs bg-white border border-slate-200/90 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs font-medium"
            >
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ABA 1: TABELA DE SALDOS DE ESTOQUE */}
      {tabInterna === 'saldos' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/70">
                <tr>
                  <th className="py-3.5 px-6">SKU</th>
                  <th className="py-3.5 px-6">Produto</th>
                  <th className="py-3.5 px-6">Categoria</th>
                  <th className="py-3.5 px-6 text-center">Unidade</th>
                  <th className="py-3.5 px-6 text-right">Custo Médio</th>
                  <th className="py-3.5 px-6 text-right">Preço Venda</th>
                  <th className="py-3.5 px-6 text-center">Saldo Físico</th>
                  <th className="py-3.5 px-6 text-center">Mínimo</th>
                  <th className="py-3.5 px-6 text-center">Status</th>
                  <th className="py-3.5 px-6 text-center">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {produtosFiltrados.map(prod => {
                  const isCritico = prod.saldoAtual <= prod.estoqueMinimo;
                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-6 font-mono font-bold text-slate-800">{prod.sku}</td>
                      <td className="py-3.5 px-6 font-semibold text-slate-900">{prod.descricao}</td>
                      <td className="py-3.5 px-6 text-slate-500">{prod.categoria}</td>
                      <td className="py-3.5 px-6 text-center">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold text-[11px]">
                          {prod.unidade}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right text-slate-600 font-mono">
                        {prod.custoMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="py-3.5 px-6 text-right font-bold text-slate-900 font-mono">
                        {prod.precoVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <span className={`font-mono font-extrabold text-sm ${
                          isCritico ? 'text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/60' : 'text-slate-800'
                        }`}>
                          {prod.saldoAtual}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-center font-mono font-medium text-slate-500">{prod.estoqueMinimo}</td>
                      <td className="py-3.5 px-6 text-center">
                        {isCritico ? (
                          <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 font-bold px-2.5 py-0.5 rounded-full text-[11px] border border-rose-200/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                            Abaixo do Mínimo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full text-[11px] border border-emerald-200/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Regular
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setProdutoSelecionadoId(prod.id);
                              setTipoMov('ENTRADA');
                              setModalAberto(true);
                            }}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                            title="Entrada rápida"
                          >
                            <ArrowUpCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setProdutoSelecionadoId(prod.id);
                              setTipoMov('SAIDA');
                              setModalAberto(true);
                            }}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Saída rápida"
                          >
                            <ArrowDownCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 2: LIVRO-RAZÃO */}
      {tabInterna === 'livro-razao' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              Histórico Contínuo e Auditável de Movimentações
            </h3>
            <span className="text-[11px] text-slate-400">Imutável para fins de conciliação fiscal e inventário</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/70">
                <tr>
                  <th className="py-3.5 px-6">Data / Hora</th>
                  <th className="py-3.5 px-6">Produto</th>
                  <th className="py-3.5 px-6">Tipo</th>
                  <th className="py-3.5 px-6 text-center">Quantidade</th>
                  <th className="py-3.5 px-6">Origem / Documento</th>
                  <th className="py-3.5 px-6">Motivo</th>
                  <th className="py-3.5 px-6">Usuário</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movimentacoesFiltradas.map(mov => {
                  const isPositivo = mov.quantidade > 0;
                  return (
                    <tr key={mov.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-6 text-slate-500 font-mono text-[11px]">{mov.criadoEm}</td>
                      <td className="py-3.5 px-6 font-semibold text-slate-900">{mov.produtoDescricao}</td>
                      <td className="py-3.5 px-6">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          mov.tipo === 'ENTRADA' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                          mov.tipo === 'SAIDA' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                          mov.tipo === 'PERDA_AVARIA' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                          'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {mov.tipo}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-center font-mono font-bold text-sm">
                        <span className={isPositivo ? 'text-emerald-600' : 'text-rose-600'}>
                          {isPositivo ? `+${mov.quantidade}` : mov.quantidade}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-slate-700 font-medium">{mov.origem}</td>
                      <td className="py-3.5 px-6 text-slate-500 italic">{mov.motivo}</td>
                      <td className="py-3.5 px-6 text-slate-800 font-semibold">{mov.usuario}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL DE REGISTRO DE MOVIMENTAÇÃO */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-blue-600" /> Registrar Movimentação no Livro-Razão
              </h3>
              <button
                onClick={() => setModalAberto(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSalvarMovimentacao} className="p-6 space-y-4">
              {mensagemFeedback && (
                <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
                  mensagemFeedback.tipo === 'sucesso' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {mensagemFeedback.tipo === 'sucesso' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                  <span>{mensagemFeedback.texto}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Produto Alimentício</label>
                <select
                  value={produtoSelecionadoId}
                  onChange={(e) => setProdutoSelecionadoId(Number(e.target.value))}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  {state.produtos.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.sku} - {p.descricao} (Saldo: {p.saldoAtual} {p.unidade})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Tipo de Movimentação</label>
                  <select
                    value={tipoMov}
                    onChange={(e) => setTipoMov(e.target.value as TipoMovimentacao)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold"
                  >
                    <option value="ENTRADA">ENTRADA (Compra/Recebimento)</option>
                    <option value="SAIDA">SAÍDA (Venda Manual/Consumo)</option>
                    <option value="AJUSTE">AJUSTE (Balanço/Inventário)</option>
                    <option value="PERDA_AVARIA">PERDA / AVARIA (Vencido)</option>
                    <option value="DEVOLUCAO">DEVOLUÇÃO (Retorno Cliente)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {tipoMov === 'AJUSTE' ? 'Novo Saldo Físico' : 'Quantidade'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Motivo / Justificativa (Obrigatório)</label>
                <input
                  type="text"
                  placeholder="Ex: Recebimento de compra conforme NF 1234, contagem física..."
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  required
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Responsável pelo Lançamento</label>
                <input
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition"
                >
                  Gravar no Livro-Razão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
