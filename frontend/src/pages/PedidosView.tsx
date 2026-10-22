import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  PlusCircle,
  CheckCircle,
  Truck,
  FileText,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  XCircle,
  Trash2,
  Calendar,
  Layers,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { ERPStore } from '../services/store';
import { Pedido, ItemPedido, StatusPedido } from '../types';

export const PedidosView: React.FC = () => {
  const [state, setState] = useState(ERPStore.getState());
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [pedidoModalAberto, setPedidoModalAberto] = useState(false);
  const [visualizarPedido, setVisualizarPedido] = useState<Pedido | null>(null);
  const [mensagemFeedback, setMensagemFeedback] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Formulário de Novo Pedido
  const [clienteId, setClienteId] = useState<number>(state.clientes[0]?.id || 1);
  const [condicaoPagamento, setCondicaoPagamento] = useState('Boleto 28 dias');
  const [descontoPercentual, setDescontoPercentual] = useState<number>(0);
  const [itensNovoPedido, setItensNovoPedido] = useState<Array<{ produtoId: number; quantidade: number }>>([
    { produtoId: state.produtos[0]?.id || 1, quantidade: 5 },
  ]);

  useEffect(() => {
    return ERPStore.subscribe(() => {
      setState({ ...ERPStore.getState() });
    });
  }, []);

  const clienteAtual = state.clientes.find(c => c.id === clienteId);
  const usuarioLogado = state.usuario;
  const podeAprovarDescontos = ERPStore.temPermissao('APROVAR_DESCONTO');

  const pedidosFiltrados = state.pedidos.filter(p => {
    if (filtroStatus === 'TODOS') return true;
    return p.status === filtroStatus;
  });

  const handleAddItem = () => {
    setItensNovoPedido([...itensNovoPedido, { produtoId: state.produtos[0]?.id || 1, quantidade: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (itensNovoPedido.length > 1) {
      setItensNovoPedido(itensNovoPedido.filter((_, i) => i !== index));
    }
  };

  const calcularTotaisFormulario = () => {
    let bruto = 0;
    itensNovoPedido.forEach(item => {
      const prod = state.produtos.find(p => p.id === item.produtoId);
      if (prod) {
        bruto += prod.precoVenda * item.quantidade;
      }
    });
    const descontoValor = (bruto * descontoPercentual) / 100;
    const liquido = bruto - descontoValor;
    return { bruto, descontoValor, liquido };
  };

  const { bruto, descontoValor, liquido } = calcularTotaisFormulario();

  const handleCriarPedido = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteAtual) return;

    const itensProcessados: ItemPedido[] = itensNovoPedido.map(item => {
      const prod = state.produtos.find(p => p.id === item.produtoId)!;
      return {
        produtoId: prod.id,
        descricao: prod.descricao,
        unidade: prod.unidade,
        quantidade: item.quantidade,
        precoUnitario: prod.precoVenda,
        desconto: 0,
        subtotal: prod.precoVenda * item.quantidade,
      };
    });

    ERPStore.criarPedido({
      clienteId: clienteAtual.id,
      clienteNome: clienteAtual.razaoSocial,
      vendedorNome: clienteAtual.vendedor || usuarioLogado.nome,
      status: 'RASCUNHO',
      itens: itensProcessados,
      totalBruto: bruto,
      desconto: descontoValor,
      totalLiquido: liquido,
      condicaoPagamento,
      descontoAprovado: descontoPercentual <= 10,
      observacoes: descontoPercentual > 10 ? 'Aguardando aprovação de desconto pelo Gerente' : undefined,
    });

    setMensagemFeedback({ tipo: 'sucesso', texto: 'Pedido criado com sucesso no status RASCUNHO!' });
    setTimeout(() => {
      setPedidoModalAberto(false);
      setMensagemFeedback(null);
    }, 1200);
  };

  const handleAvancarStatus = (pedidoId: number) => {
    const res = ERPStore.avancarStatusPedido(pedidoId);
    if (res.success) {
      setMensagemFeedback({ tipo: 'sucesso', texto: res.message });
    } else {
      setMensagemFeedback({ tipo: 'erro', texto: res.message });
    }
    setTimeout(() => setMensagemFeedback(null), 3500);
  };

  const handleAprovarDesconto = (pedidoId: number) => {
    const res = ERPStore.aprovarDesconto(pedidoId);
    if (res.success) {
      setMensagemFeedback({ tipo: 'sucesso', texto: res.message });
    } else {
      setMensagemFeedback({ tipo: 'erro', texto: res.message });
    }
    setTimeout(() => setMensagemFeedback(null), 3000);
  };

  const handleCancelar = (pedidoId: number) => {
    if (confirm('Deseja realmente cancelar este pedido?')) {
      const res = ERPStore.cancelarPedido(pedidoId);
      if (res.success) {
        setMensagemFeedback({ tipo: 'sucesso', texto: res.message });
      } else {
        setMensagemFeedback({ tipo: 'erro', texto: res.message });
      }
      setTimeout(() => setMensagemFeedback(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Topo do Módulo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/60">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Gestão de Vendas & Pedidos</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pipeline operacional com verificação de estoque e alçadas de aprovação gerencial de descontos (RF-23).
          </p>
        </div>

        <button
          onClick={() => setPedidoModalAberto(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/25 transition"
        >
          <PlusCircle className="w-4 h-4" /> Emitir Novo Pedido
        </button>
      </div>

      {mensagemFeedback && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm animate-in fade-in duration-200 ${
          mensagemFeedback.tipo === 'sucesso' ? 'bg-emerald-50 text-emerald-900 border border-emerald-300' : 'bg-rose-50 text-rose-900 border border-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            {mensagemFeedback.tipo === 'sucesso' ? <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" /> : <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
            <span>{mensagemFeedback.texto}</span>
          </div>
          <button onClick={() => setMensagemFeedback(null)} className="text-slate-400 hover:text-slate-700 font-bold">&times;</button>
        </div>
      )}

      {/* Filtro do Pipeline */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200/80 pb-3">
        {['TODOS', 'RASCUNHO', 'CONFIRMADO', 'SEPARADO', 'FATURADO', 'ENTREGUE', 'CANCELADO'].map(st => {
          const count = st === 'TODOS' ? state.pedidos.length : state.pedidos.filter(p => p.status === st).length;
          return (
            <button
              key={st}
              onClick={() => setFiltroStatus(st)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                filtroStatus === st
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'bg-white text-slate-600 border border-slate-200/90 hover:bg-slate-50'
              }`}
            >
              {st} ({count})
            </button>
          );
        })}
      </div>

      {/* Lista de Pedidos */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/70">
              <tr>
                <th className="py-3.5 px-6">Nº Pedido</th>
                <th className="py-3.5 px-6">Cliente</th>
                <th className="py-3.5 px-6">Data</th>
                <th className="py-3.5 px-6">Itens</th>
                <th className="py-3.5 px-6 text-right">Valor Total</th>
                <th className="py-3.5 px-6 text-center">Status Atual</th>
                <th className="py-3.5 px-6 text-center">Alçada & Fluxo</th>
                <th className="py-3.5 px-6 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pedidosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Nenhum pedido encontrado neste status.
                  </td>
                </tr>
              ) : (
                pedidosFiltrados.map(p => {
                  const percentualDesconto = p.totalBruto > 0 ? (p.desconto / p.totalBruto) * 100 : 0;
                  const precisaAprovacao = percentualDesconto > 10 && !p.descontoAprovado;

                  const getProximoStatusLabel = (st: StatusPedido) => {
                    if (st === 'RASCUNHO') return 'Confirmar Pedido';
                    if (st === 'CONFIRMADO') return 'Enviar p/ Separação';
                    if (st === 'SEPARADO') return 'Faturar e Baixar Estoque';
                    if (st === 'FATURADO') return 'Marcar como Entregue';
                    return null;
                  };

                  const proximaAcao = getProximoStatusLabel(p.status);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-blue-600">{p.numero}</td>
                      <td className="py-4 px-6 font-semibold text-slate-900">{p.clienteNome}</td>
                      <td className="py-4 px-6 text-slate-500 font-mono text-[11px]">{p.criadoEm}</td>
                      <td className="py-4 px-6 text-slate-600">
                        {p.itens.reduce((acc, i) => acc + i.quantidade, 0)} itens ({p.itens.length} SKUs)
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-slate-900 font-mono">
                        {p.totalLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          p.status === 'RASCUNHO' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                          p.status === 'CONFIRMADO' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                          p.status === 'SEPARADO' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                          p.status === 'FATURADO' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                          p.status === 'ENTREGUE' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                          'bg-rose-50 text-rose-800 border-rose-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            p.status === 'ENTREGUE' ? 'bg-emerald-500' :
                            p.status === 'FATURADO' ? 'bg-purple-500' :
                            p.status === 'SEPARADO' ? 'bg-amber-500' :
                            p.status === 'CONFIRMADO' ? 'bg-blue-500' :
                            'bg-slate-400'
                          }`} />
                          {p.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {/* Se tem desconto > 10% pendente de aprovação gerencial */}
                        {precisaAprovacao ? (
                          podeAprovarDescontos ? (
                            <button
                              onClick={() => handleAprovarDesconto(p.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs shadow-xs transition"
                              title="Você tem alçada para aprovar este desconto"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Aprovar Desconto ({percentualDesconto.toFixed(0)}%)
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                              Visto do Gerente Pendente
                            </span>
                          )
                        ) : proximaAcao ? (
                          <button
                            onClick={() => handleAvancarStatus(p.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/80 rounded-xl text-xs font-bold transition shadow-2xs"
                          >
                            <span>{proximaAcao}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-emerald-600 font-bold text-xs flex items-center justify-center gap-1 font-medium">
                            <CheckCircle2 className="w-4 h-4" /> Concluído
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setVisualizarPedido(p)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Visualizar Espelho do Pedido"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          {p.status !== 'FATURADO' && p.status !== 'ENTREGUE' && p.status !== 'CANCELADO' && (
                            <button
                              onClick={() => handleCancelar(p.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Cancelar Pedido"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE EMISSÃO DE NOVO PEDIDO */}
      {pedidoModalAberto && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-blue-600" /> Emissão de Pedido de Venda
              </h3>
              <button onClick={() => setPedidoModalAberto(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleCriarPedido} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Cliente</label>
                  <select
                    value={clienteId}
                    onChange={(e) => setClienteId(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    {state.clientes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.razaoSocial} (Limite: {c.limiteCredito.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Condição de Pagamento</label>
                  <select
                    value={condicaoPagamento}
                    onChange={(e) => setCondicaoPagamento(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Boleto 28 dias">Boleto 28 dias</option>
                    <option value="Boleto 14 dias">Boleto 14 dias</option>
                    <option value="Boleto 21 dias">Boleto 21 dias</option>
                    <option value="PIX à Vista (3% desc)">PIX à Vista</option>
                  </select>
                </div>
              </div>

              {/* Itens do Pedido */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Itens do Pedido</h4>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                  >
                    + Adicionar Item
                  </button>
                </div>

                {itensNovoPedido.map((item, idx) => {
                  const prod = state.produtos.find(p => p.id === item.produtoId);
                  const sub = prod ? prod.precoVenda * item.quantidade : 0;
                  return (
                    <div key={idx} className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div className="flex-1">
                        <select
                          value={item.produtoId}
                          onChange={(e) => {
                            const newItens = [...itensNovoPedido];
                            newItens[idx].produtoId = Number(e.target.value);
                            setItensNovoPedido(newItens);
                          }}
                          className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                        >
                          {state.produtos.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.sku} - {p.descricao} (R$ {p.precoVenda.toFixed(2)} | Saldo: {p.saldoAtual})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-24">
                        <input
                          type="number"
                          min="1"
                          value={item.quantidade}
                          onChange={(e) => {
                            const newItens = [...itensNovoPedido];
                            newItens[idx].quantidade = Number(e.target.value);
                            setItensNovoPedido(newItens);
                          }}
                          className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg font-bold text-center"
                        />
                      </div>

                      <div className="w-28 text-right font-mono font-bold text-slate-800 text-xs">
                        {sub.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Desconto */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-700 block">Desconto Comercial (%)</label>
                  {descontoPercentual > 10 && (
                    <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-1 mt-0.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Desconto &gt; 10% exigirá aprovação formal do Gerente (RF-23)
                    </span>
                  )}
                </div>
                <div className="w-24">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={descontoPercentual}
                    onChange={(e) => setDescontoPercentual(Number(e.target.value))}
                    className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg font-bold text-center"
                  />
                </div>
              </div>

              {/* Resumo */}
              <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs text-right">
                <div className="text-slate-500">Total Bruto: <span className="font-semibold text-slate-800">{bruto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                {descontoValor > 0 && (
                  <div className="text-amber-600">Desconto ({descontoPercentual}%): <span className="font-semibold">-{descontoValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                )}
                <div className="text-base font-extrabold text-slate-900 font-mono">
                  Total Líquido: {liquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setPedidoModalAberto(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
                >
                  Salvar Pedido (Rascunho)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE ESPELHO DO PEDIDO */}
      {visualizarPedido && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Espelho do Pedido {visualizarPedido.numero}</h3>
                <p className="text-xs text-slate-400">Documento Interno Gerencial (Não Fiscal)</p>
              </div>
              <button onClick={() => setVisualizarPedido(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">
                &times;
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-400">Cliente:</p>
                <p className="font-bold text-slate-900">{visualizarPedido.clienteNome}</p>
              </div>
              <div>
                <p className="text-slate-400">Condição de Pagamento:</p>
                <p className="font-bold text-slate-900">{visualizarPedido.condicaoPagamento}</p>
              </div>
              <div>
                <p className="text-slate-400">Vendedor:</p>
                <p className="font-bold text-slate-900">{visualizarPedido.vendedorNome}</p>
              </div>
              <div>
                <p className="text-slate-400">Status Atual:</p>
                <span className="font-bold text-blue-600">{visualizarPedido.status}</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold">
                  <tr>
                    <th className="p-2.5">Item</th>
                    <th className="p-2.5 text-center">Qtd</th>
                    <th className="p-2.5 text-right">Unitário</th>
                    <th className="p-2.5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visualizarPedido.itens.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-medium">{it.descricao}</td>
                      <td className="p-2.5 text-center font-mono">{it.quantidade} {it.unidade}</td>
                      <td className="p-2.5 text-right font-mono">{it.precoUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                      <td className="p-2.5 text-right font-mono font-bold">{it.subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-right text-xs space-y-1">
              <div>Total Líquido: <span className="text-base font-extrabold text-slate-900 font-mono">{visualizarPedido.totalLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setVisualizarPedido(null)}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-xl"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
