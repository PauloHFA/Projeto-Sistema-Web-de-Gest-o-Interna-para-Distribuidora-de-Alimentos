import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  PlusCircle,
  CreditCard,
  Building
} from 'lucide-react';
import { ERPStore } from '../services/store';

export const FinanceiroView: React.FC = () => {
  const [state, setState] = useState(ERPStore.getState());
  const [tabFinanceira, setTabFinanceira] = useState<'receber' | 'pagar'>('receber');
  const [modalNovaContaPagar, setModalNovaContaPagar] = useState(false);

  // Form Conta a Pagar
  const [fornecedorNome, setFornecedorNome] = useState('');
  const [categoria, setCategoria] = useState('Despesa Operacional');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [vencimento, setVencimento] = useState(new Date().toISOString().substring(0, 10));

  useEffect(() => {
    return ERPStore.subscribe(() => {
      setState({ ...ERPStore.getState() });
    });
  }, []);

  const totalReceberPendente = state.contasReceber
    .filter(c => c.status === 'PENDENTE' || c.status === 'ATRASADO')
    .reduce((acc, c) => acc + c.valor, 0);

  const totalRecebido = state.contasReceber
    .filter(c => c.status === 'PAGO')
    .reduce((acc, c) => acc + c.valorPago, 0);

  const totalPagarPendente = state.contasPagar
    .filter(c => c.status === 'PENDENTE')
    .reduce((acc, c) => acc + c.valor, 0);

  const totalPago = state.contasPagar
    .filter(c => c.status === 'PAGO')
    .reduce((acc, c) => acc + c.valorPago, 0);

  const saldoProjetado = totalReceberPendente - totalPagarPendente;

  const handleBaixarRecebimento = (id: number) => {
    ERPStore.baixarContaReceber(id);
  };

  const handleBaixarPagamento = (id: number) => {
    ERPStore.baixarContaPagar(id);
  };

  const handleSalvarContaPagar = (e: React.FormEvent) => {
    e.preventDefault();
    const valNum = Number(valor);
    if (!valNum || valNum <= 0) return;

    ERPStore.adicionarContaPagar({
      fornecedorNome: fornecedorNome || 'Diversos',
      categoria,
      descricao,
      valor: valNum,
      vencimento,
    });

    setModalNovaContaPagar(false);
    setDescricao('');
    setValor('');
  };

  return (
    <div className="space-y-6">
      {/* Topo com Indicadores */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60">
              <DollarSign className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Contas a Pagar & Receber</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Fluxo financeiro integrado às compras de fornecedores e faturamentos de pedidos.
          </p>
        </div>

        {tabFinanceira === 'pagar' && (
          <button
            onClick={() => setModalNovaContaPagar(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm shadow-rose-500/25 transition"
          >
            <PlusCircle className="w-4 h-4" /> Lançar Nova Despesa
          </button>
        )}
      </div>

      {/* Cards de Métricas Financeiras */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
          <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>A Receber (Previsão)</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2 font-mono">
            {totalReceberPendente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Realizado (Já pago): <span className="font-semibold text-slate-700 font-mono">{totalRecebido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />
          <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>A Pagar (Previsão)</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-600 mt-2 font-mono">
            {totalPagarPendente.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Realizado (Já quitado): <span className="font-semibold text-slate-700 font-mono">{totalPago.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
          <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Saldo Líquido Projetado</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-extrabold mt-2 font-mono ${saldoProjetado >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
            {saldoProjetado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <p className="text-xs text-slate-400 mt-1">Diferencial a receber menos despesas</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200/80 gap-6">
        <button
          onClick={() => setTabFinanceira('receber')}
          className={`pb-3.5 text-xs font-bold transition-all ${
            tabFinanceira === 'receber' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Contas a Receber ({state.contasReceber.length})
        </button>
        <button
          onClick={() => setTabFinanceira('pagar')}
          className={`pb-3.5 text-xs font-bold transition-all ${
            tabFinanceira === 'pagar' ? 'text-rose-600 border-b-2 border-rose-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Contas a Pagar ({state.contasPagar.length})
        </button>
      </div>

      {/* TABELA: CONTAS A RECEBER */}
      {tabFinanceira === 'receber' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/70">
                <tr>
                  <th className="py-3.5 px-6">Origem / Pedido</th>
                  <th className="py-3.5 px-6">Cliente</th>
                  <th className="py-3.5 px-6">Vencimento</th>
                  <th className="py-3.5 px-6">Forma Pagto</th>
                  <th className="py-3.5 px-6 text-right">Valor</th>
                  <th className="py-3.5 px-6 text-center">Status</th>
                  <th className="py-3.5 px-6 text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.contasReceber.map(c => {
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-blue-600">{c.pedidoNumero || 'Faturamento Direto'}</td>
                      <td className="py-4 px-6 font-semibold text-slate-900">{c.clienteNome}</td>
                      <td className="py-4 px-6 text-slate-500 font-mono">{c.vencimento}</td>
                      <td className="py-4 px-6 text-slate-600">{c.formaPagamento}</td>
                      <td className="py-4 px-6 text-right font-bold text-slate-900 font-mono">
                        {c.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                          c.status === 'PAGO' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                          c.status === 'ATRASADO' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                          'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            c.status === 'PAGO' ? 'bg-emerald-500' :
                            c.status === 'ATRASADO' ? 'bg-rose-500' : 'bg-amber-500'
                          }`} />
                          {c.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {c.status !== 'PAGO' ? (
                          <button
                            onClick={() => handleBaixarRecebimento(c.id)}
                            className="px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg font-bold text-xs transition"
                          >
                            Dar Baixa (Recebido)
                          </button>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">Pago em {c.pagoEm?.substring(0, 10)}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TABELA: CONTAS A PAGAR */}
      {tabFinanceira === 'pagar' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/70">
                <tr>
                  <th className="py-3.5 px-6">Fornecedor / Favorecido</th>
                  <th className="py-3.5 px-6">Categoria</th>
                  <th className="py-3.5 px-6">Descrição</th>
                  <th className="py-3.5 px-6">Vencimento</th>
                  <th className="py-3.5 px-6 text-right">Valor</th>
                  <th className="py-3.5 px-6 text-center">Status</th>
                  <th className="py-3.5 px-6 text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.contasPagar.map(c => {
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-900">{c.fornecedorNome}</td>
                      <td className="py-4 px-6 text-slate-500">{c.categoria}</td>
                      <td className="py-4 px-6 text-slate-700 font-medium">{c.descricao}</td>
                      <td className="py-4 px-6 text-slate-500 font-mono">{c.vencimento}</td>
                      <td className="py-4 px-6 text-right font-bold text-rose-600 font-mono">
                        {c.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                          c.status === 'PAGO' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'PAGO' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {c.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {c.status !== 'PAGO' ? (
                          <button
                            onClick={() => handleBaixarPagamento(c.id)}
                            className="px-3 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg font-bold text-xs transition"
                          >
                            Registrar Pagamento
                          </button>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">Quitado em {c.pagoEm?.substring(0, 10)}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL NOVA CONTA A PAGAR */}
      {modalNovaContaPagar && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6">
            <h3 className="font-extrabold text-slate-900 text-sm mb-4">Lançar Nova Obrigação (Conta a Pagar)</h3>
            <form onSubmit={handleSalvarContaPagar} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fornecedor / Beneficiário</label>
                <input
                  type="text"
                  required
                  value={fornecedorNome}
                  onChange={(e) => setFornecedorNome(e.target.value)}
                  placeholder="Ex: Companhia de Energia, Posto de Combustível..."
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Categoria Contábil (DRE)</label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="CMV (Fornecedor)">CMV (Fornecedor de Mercadorias)</option>
                  <option value="Despesa Operacional">Despesa Operacional (Aluguel, Luz, Água)</option>
                  <option value="Fretes e Logística">Fretes e Logística de Entrega</option>
                  <option value="Salários e Encargos">Salários e Pró-Labore</option>
                  <option value="Manutenção e TI">Manutenção e Sistemas</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descrição</label>
                <input
                  type="text"
                  required
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex: Fatura mensal, manutenção empilhadeira..."
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    placeholder="0,00"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Vencimento</label>
                  <input
                    type="date"
                    required
                    value={vencimento}
                    onChange={(e) => setVencimento(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalNovaContaPagar(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm"
                >
                  Confirmar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
