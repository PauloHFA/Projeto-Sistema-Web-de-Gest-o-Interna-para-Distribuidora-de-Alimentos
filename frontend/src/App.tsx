import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  DollarSign,
  FileBarChart,
  Users,
  RefreshCcw,
  Sparkles,
  Building2,
  ChevronRight,
  Activity,
  Lock
} from 'lucide-react';
import { DashboardView } from './pages/DashboardView';
import { EstoqueView } from './pages/EstoqueView';
import { PedidosView } from './pages/PedidosView';
import { FinanceiroView } from './pages/FinanceiroView';
import { RelatoriosView } from './pages/RelatoriosView';
import { CadastrosView } from './pages/CadastrosView';
import { UserAccountMenu } from './components/UserAccountMenu';
import { AcessoNegado403 } from './components/AcessoNegado403';
import { ERPStore } from './services/store';

type Tab = 'dashboard' | 'pedidos' | 'estoque' | 'financeiro' | 'relatorios' | 'cadastros';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [state, setState] = useState(ERPStore.getState());

  useEffect(() => {
    return ERPStore.subscribe(() => {
      setState({ ...ERPStore.getState() });
    });
  }, []);

  const negocioAtivo = ERPStore.getNegocioAtivo();
  const usuario = state.usuario;
  const produtosCriticos = state.produtos.filter(p => p.ativo && p.saldoAtual <= p.estoqueMinimo).length;
  const pedidosPendentes = state.pedidos.filter(p => p.status !== 'ENTREGUE' && p.status !== 'CANCELADO').length;

  // Verificações de Permissão por Perfil (RBAC - Seção 4)
  const temPermissaoFinanceiro = ERPStore.temPermissao('FINANCEIRO');
  const temPermissaoRelatorios = ERPStore.temPermissao('DRE');

  const handleResetData = () => {
    if (confirm('Deseja restaurar os dados de demonstração do sistema para o estado original?')) {
      ERPStore.resetarParaPadrao();
      window.location.reload();
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 antialiased overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Sidebar Lateral Enterprise */}
      <aside className="w-68 bg-[#0b1329] text-slate-300 flex flex-col justify-between border-r border-slate-800/80 shadow-2xl z-20">
        <div>
          {/* Top Header da Marca */}
          <div className="p-5 border-b border-slate-800/70 bg-[#0d1733]/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center font-extrabold text-white shadow-lg shadow-blue-500/25 border border-blue-400/30 text-base tracking-wider">
                ERP
              </div>
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-bold text-white text-sm tracking-tight truncate">
                    {negocioAtivo.nome.split('(')[0].trim()}
                  </h1>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-blue-400 font-medium truncate mt-0.5">
                  <Building2 className="w-3 h-3 text-blue-400 shrink-0" />
                  <span className="truncate">{negocioAtivo.cidadeUf}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Menus Organizados por Sessão */}
          <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-210px)]">
            {/* Sessão 1: Visão Geral */}
            <div>
              <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">
                Painel Gerencial
              </p>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    activeTab === 'dashboard'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <LayoutDashboard className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-white' : 'text-slate-400'}`} />
                    <span>Dashboard Executivo</span>
                  </div>
                  {activeTab === 'dashboard' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                </button>
              </nav>
            </div>

            {/* Sessão 2: Operação */}
            <div>
              <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">
                Operação & Vendas
              </p>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('pedidos')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    activeTab === 'pedidos'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShoppingCart className={`w-4 h-4 ${activeTab === 'pedidos' ? 'text-white' : 'text-slate-400'}`} />
                    <span>Pedidos & Vendas</span>
                  </div>
                  {pedidosPendentes > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      activeTab === 'pedidos' ? 'bg-blue-800 text-white' : 'bg-slate-800 text-blue-400'
                    }`}>
                      {pedidosPendentes}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('estoque')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    activeTab === 'estoque'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Package className={`w-4 h-4 ${activeTab === 'estoque' ? 'text-white' : 'text-slate-400'}`} />
                    <span>Estoque & Alertas</span>
                  </div>
                  {produtosCriticos > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      {produtosCriticos} crítico{produtosCriticos > 1 ? 's' : ''}
                    </span>
                  )}
                </button>
              </nav>
            </div>

            {/* Sessão 3: Controladoria */}
            <div>
              <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">
                Financeiro & Gestão
              </p>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('financeiro')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    activeTab === 'financeiro'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <DollarSign className={`w-4 h-4 ${activeTab === 'financeiro' ? 'text-white' : 'text-slate-400'}`} />
                    <span>Contas Pagar / Receber</span>
                  </div>
                  {!temPermissaoFinanceiro && (
                    <Lock className="w-3.5 h-3.5 text-slate-600" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('relatorios')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    activeTab === 'relatorios'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileBarChart className={`w-4 h-4 ${activeTab === 'relatorios' ? 'text-white' : 'text-slate-400'}`} />
                    <span>DRE & Relatórios</span>
                  </div>
                  {!temPermissaoRelatorios && (
                    <Lock className="w-3.5 h-3.5 text-slate-600" />
                  )}
                </button>
              </nav>
            </div>

            {/* Sessão 4: Cadastros */}
            <div>
              <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">
                Cadastros Centrais
              </p>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('cadastros')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    activeTab === 'cadastros'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Users className={`w-4 h-4 ${activeTab === 'cadastros' ? 'text-white' : 'text-slate-400'}`} />
                    <span>Clientes & Catálogo</span>
                  </div>
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Rodapé da Sidebar */}
        <div className="p-4 border-t border-slate-800/80 bg-[#0a1024]/60 space-y-3">
          <button
            onClick={handleResetData}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium border border-slate-700/60 transition"
            title="Restaura os dados originais fictícios do teste"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            Resetar Estoque Teste
          </button>

          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 px-1">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Perfil: <strong className="text-blue-400 font-mono">{usuario.perfil}</strong>
            </span>
            <span className="font-mono text-slate-600">RBAC Ativo</span>
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#f8fafc]">
        {/* Header Superior Corporativo */}
        <header className="h-16 bg-white border-b border-slate-200/90 px-8 flex items-center justify-between shadow-xs sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="hover:text-slate-600 cursor-pointer">Distribuidora ERP</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="font-semibold text-slate-700 capitalize">
                {activeTab === 'dashboard' && 'Dashboard Executivo'}
                {activeTab === 'pedidos' && 'Gestão de Vendas & Pedidos'}
                {activeTab === 'estoque' && 'Controle Físico de Estoque'}
                {activeTab === 'financeiro' && 'Fluxo de Contas a Pagar e Receber'}
                {activeTab === 'relatorios' && 'DRE Gerencial e Curva ABC'}
                {activeTab === 'cadastros' && 'Cadastros Centrais'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200/80 rounded-full text-xs text-slate-600">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-medium text-[11px]">Sincronização Ativa</span>
            </div>

            <UserAccountMenu />
          </div>
        </header>

        {/* Área de Visualização com Tratamento de Permissões RBAC */}
        <section className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'pedidos' && <PedidosView />}
            {activeTab === 'estoque' && <EstoqueView />}
            {activeTab === 'cadastros' && <CadastrosView />}

            {/* Módulos com Verificação Estrita de Permissão */}
            {activeTab === 'financeiro' && (
              temPermissaoFinanceiro ? (
                <FinanceiroView />
              ) : (
                <AcessoNegado403 recursoNome="Financeiro (Contas a Pagar e Receber)" perfisPermitidos={['ADMIN', 'GERENTE', 'FINANCEIRO']} />
              )
            )}

            {activeTab === 'relatorios' && (
              temPermissaoRelatorios ? (
                <RelatoriosView />
              ) : (
                <AcessoNegado403 recursoNome="DRE & Relatórios Gerenciais" perfisPermitidos={['ADMIN', 'GERENTE', 'FINANCEIRO']} />
              )
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
