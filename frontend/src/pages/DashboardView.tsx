import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  TrendingUp,
  PackageCheck,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { ERPStore } from '../services/store';

export const DashboardView: React.FC = () => {
  const [state, setState] = useState(ERPStore.getState());
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    return ERPStore.subscribe(() => {
      setState({ ...ERPStore.getState() });
      setLastUpdated(new Date().toLocaleTimeString());
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsRefreshing(true);
      setTimeout(() => {
        setState({ ...ERPStore.getState() });
        setLastUpdated(new Date().toLocaleTimeString());
        setIsRefreshing(false);
      }, 500);
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const pedidosFaturadosOuEntregues = state.pedidos.filter(p => p.status === 'FATURADO' || p.status === 'ENTREGUE');
  const totalFaturadoMes = pedidosFaturadosOuEntregues.reduce((acc, p) => acc + p.totalLiquido, 0);
  const ticketMedio = pedidosFaturadosOuEntregues.length > 0 ? totalFaturadoMes / pedidosFaturadosOuEntregues.length : 0;
  
  const produtosAbaixoMinimo = state.produtos.filter(p => p.ativo && p.saldoAtual <= p.estoqueMinimo);

  const contasPagarPendentes = state.contasPagar.filter(c => c.status === 'PENDENTE');
  const totalPagar = contasPagarPendentes.reduce((acc, c) => acc + c.valor, 0);

  const vendasSemanais = [
    { dia: 'Seg', vendas: 12400, compras: 9200 },
    { dia: 'Ter', vendas: 18900, compras: 5400 },
    { dia: 'Qua', vendas: 15600, compras: 8100 },
    { dia: 'Qui', vendas: 22100, compras: 12000 },
    { dia: 'Sex', vendas: 27800, compras: 4500 },
    { dia: 'Sáb', vendas: 9400, compras: 1100 },
  ];

  const dadosEstoqueTop = state.produtos.slice(0, 6).map(p => ({
    name: p.sku,
    descricao: p.descricao,
    saldo: p.saldoAtual,
    minimo: p.estoqueMinimo,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs backdrop-blur-md">
          <p className="font-bold text-slate-300 border-b border-slate-800 pb-1.5 mb-1.5">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-mono font-bold text-white">
                {typeof entry.value === 'number' && entry.value > 100
                  ? entry.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                  : `${entry.value} un`}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner de Resumo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Painel Executivo da Distribuidora</h2>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-md border border-blue-200">
              Tempo Real
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Métricas de faturamento, saldo físico calculado por livro-razão e fluxo de reposição.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 font-medium">
            <span className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
            <span>Polling Ativo (30s)</span>
            <span className="text-slate-400">|</span>
            <span className="font-mono text-slate-700 font-semibold">{lastUpdated}</span>
          </div>
          <button
            onClick={() => {
              setIsRefreshing(true);
              setTimeout(() => {
                setState({ ...ERPStore.getState() });
                setLastUpdated(new Date().toLocaleTimeString());
                setIsRefreshing(false);
              }, 400);
            }}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-xl transition"
            title="Atualizar métricas agora"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid de 4 Cards de KPIs com Design Premium */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Faturamento */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Faturamento do Mês</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
              {totalFaturadoMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/60">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> +14.2%
              </span>
              <span className="text-[11px] text-slate-400">vs. mês anterior</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Ticket Médio */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ticket Médio</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
              {ticketMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] text-slate-500 font-medium">
                {pedidosFaturadosOuEntregues.length} pedidos expedidos
              </span>
            </div>
          </div>
        </div>

        {/* KPI 3: Itens Críticos */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-rose-500" />
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estoque Crítico</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-amber-600 tracking-tight font-mono">
              {produtosAbaixoMinimo.length} {produtosAbaixoMinimo.length === 1 ? 'Produto' : 'Produtos'}
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center text-[11px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200/60">
                Abaixo do mínimo
              </span>
              <span className="text-[11px] text-slate-400">Risco de ruptura</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Contas a Pagar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-red-600" />
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contas a Pagar</span>
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl group-hover:scale-110 transition-transform">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-rose-600 tracking-tight font-mono">
              {totalPagar.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] text-slate-500 font-medium">
                {contasPagarPendentes.length} obrigações agendadas
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Gráficos Executivos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico 1: Vendas Faturadas vs Compras */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                Fluxo de Faturamento vs. Reposições
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Comparativo diário de vendas e compras operacionais</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Esta Semana
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={vendasSemanais} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaVendas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="areaCompras" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="dia" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tickFormatter={(v) => `R$${v/1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: 15, fontSize: 12 }} />
                <Area type="monotone" dataKey="vendas" name="Vendas Faturadas" stroke="#2563eb" strokeWidth={2.5} fill="url(#areaVendas)" />
                <Area type="monotone" dataKey="compras" name="Compras / Entradas" stroke="#f59e0b" strokeWidth={2.5} fill="url(#areaCompras)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Saldo Físico vs Mínimo */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="mb-6">
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Estoque Físico vs. Ponto de Pedido</h3>
            <p className="text-xs text-slate-400 mt-0.5">Níveis de segurança por código de produto</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosEstoqueTop} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: 15, fontSize: 12 }} />
                <Bar dataKey="saldo" name="Saldo Físico" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="minimo" name="Estoque Mínimo" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabela de Produtos em Nível Crítico com Estilo Sofisticado */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-200/60">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Alerta de Reposição Urgente (Estoque Crítico)</h3>
              <p className="text-[11px] text-slate-400">Produtos com saldo menor ou igual ao estoque mínimo de segurança</p>
            </div>
          </div>
          <span className="text-xs bg-rose-50 text-rose-700 font-bold px-3 py-1 rounded-full border border-rose-200/60">
            {produtosAbaixoMinimo.length} produtos em risco
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8fafc] text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/70">
              <tr>
                <th className="py-3.5 px-6">SKU</th>
                <th className="py-3.5 px-6">Descrição Comercial</th>
                <th className="py-3.5 px-6">Categoria</th>
                <th className="py-3.5 px-6 text-center">Saldo Atual</th>
                <th className="py-3.5 px-6 text-center">Estoque Mínimo</th>
                <th className="py-3.5 px-6 text-center">Déficit</th>
                <th className="py-3.5 px-6 text-right">Custo Médio Unitário</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {produtosAbaixoMinimo.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Estoque regularizado. Nenhum item abaixo do nível de segurança!
                  </td>
                </tr>
              ) : (
                produtosAbaixoMinimo.map(p => {
                  const deficit = p.estoqueMinimo - p.saldoAtual;
                  return (
                    <tr key={p.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-slate-800">{p.sku}</td>
                      <td className="py-4 px-6 font-semibold text-slate-900">{p.descricao}</td>
                      <td className="py-4 px-6 text-slate-500">{p.categoria}</td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center gap-1 font-mono font-extrabold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200/50">
                          {p.saldoAtual} {p.unidade}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center font-mono font-medium text-slate-600">
                        {p.estoqueMinimo} {p.unidade}
                      </td>
                      <td className="py-4 px-6 text-center font-mono font-bold text-amber-700">
                        -{deficit} {p.unidade}
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-medium text-slate-800">
                        {p.custoMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
