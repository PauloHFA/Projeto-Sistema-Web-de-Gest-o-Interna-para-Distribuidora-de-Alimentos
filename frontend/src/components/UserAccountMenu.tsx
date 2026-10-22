import React, { useState, useEffect } from 'react';
import {
  Building2,
  ChevronDown,
  PlusCircle,
  Check,
  Settings,
  User,
  ShieldCheck,
  MapPin,
  Sparkles,
  Users
} from 'lucide-react';
import { ERPStore, PERFIS_DISPONIVEIS } from '../services/store';
import { Negocio, PerfilUsuario } from '../types';

export const UserAccountMenu: React.FC = () => {
  const [state, setState] = useState(ERPStore.getState());
  const [menuAberto, setMenuAberto] = useState(false);
  const [modalNovoNegocio, setModalNovoNegocio] = useState(false);
  const [modalPerfil, setModalPerfil] = useState(false);

  // Form Novo Negócio
  const [nomeNegocio, setNomeNegocio] = useState('');
  const [tipoNegocio, setTipoNegocio] = useState('Distribuidora de Alimentos e Mercearia');
  const [cidadeUf, setCidadeUf] = useState('');
  const [cnpj, setCnpj] = useState('');

  useEffect(() => {
    return ERPStore.subscribe(() => {
      setState({ ...ERPStore.getState() });
    });
  }, []);

  const negocioAtivo = ERPStore.getNegocioAtivo();

  const handleSalvarNovoNegocio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeNegocio.trim()) return;

    ERPStore.adicionarNegocio({
      nome: nomeNegocio.trim(),
      tipo: tipoNegocio,
      cidadeUf: cidadeUf.trim() || 'São Paulo - SP',
      cnpj: cnpj.trim() || '00.000.000/0001-00',
    });

    setModalNovoNegocio(false);
    setNomeNegocio('');
    setCidadeUf('');
    setCnpj('');
    setMenuAberto(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {/* Seletor de Perfil Ativo (RBAC Simulator) */}
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 rounded-xl p-1">
          {(Object.keys(PERFIS_DISPONIVEIS) as PerfilUsuario[]).map((p) => {
            const isAtivo = state.usuario.perfil === p;
            return (
              <button
                key={p}
                onClick={() => ERPStore.alternarPerfilUsuario(p)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                  isAtivo
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
                }`}
                title={`Alternar para perfil ${p} (${PERFIS_DISPONIVEIS[p].nome})`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Seletor de Negócio Ativo */}
        <button
          onClick={() => setMenuAberto(!menuAberto)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition shadow-xs"
        >
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="max-w-[180px] truncate">
            <p className="text-xs font-bold text-slate-900 truncate leading-tight">{negocioAtivo.nome}</p>
            <p className="text-[10px] text-slate-500 truncate leading-tight">{negocioAtivo.cidadeUf}</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </button>

        {/* Botão de Perfil / Usuário */}
        <button
          onClick={() => setModalPerfil(true)}
          className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition"
          title={`Usuário: ${state.usuario.nome} (${state.usuario.perfil})`}
        >
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs border border-slate-700">
            {state.usuario.avatar}
          </div>
        </button>
      </div>

      {/* DROPDOWN DE SELEÇÃO E GERENCIAMENTO DE NEGÓCIOS */}
      {menuAberto && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuAberto(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Negócios da Sua Conta
              </span>
              <p className="text-xs text-slate-600">Alterne entre suas unidades ou cadastre uma nova filial</p>
            </div>

            <div className="p-2 space-y-1 max-h-60 overflow-y-auto">
              {state.negocios.map(neg => {
                const isSelected = neg.id === state.negocioAtivoId;
                return (
                  <button
                    key={neg.id}
                    onClick={() => {
                      ERPStore.alternarNegocio(neg.id);
                      setMenuAberto(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition ${
                      isSelected
                        ? 'bg-blue-50 border border-blue-200 text-blue-900'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold truncate leading-tight">{neg.nome}</p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-2.5 h-2.5" /> {neg.cidadeUf}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="shrink-0 p-1 text-blue-600">
                        <Check className="w-4 h-4 font-bold" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-2.5 bg-slate-50 border-t border-slate-200">
              <button
                onClick={() => {
                  setMenuAberto(false);
                  setModalNovoNegocio(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition"
              >
                <PlusCircle className="w-4 h-4" />
                Adicionar Outro Negócio / Filial
              </button>
            </div>
          </div>
        </>
      )}

      {/* MODAL: ADICIONAR OUTRO NEGÓCIO */}
      {modalNovoNegocio && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">Cadastrar Novo Negócio / Filial</h3>
              </div>
              <button
                onClick={() => setModalNovoNegocio(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSalvarNovoNegocio} className="space-y-3.5 my-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome do Negócio / Fantasia *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Distribuidora Alimentos Vale do Paraíba"
                  value={nomeNegocio}
                  onChange={(e) => setNomeNegocio(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Segmento de Atividade
                </label>
                <select
                  value={tipoNegocio}
                  onChange={(e) => setTipoNegocio(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  <option value="Distribuidora de Alimentos e Mercearia">Distribuidora de Alimentos e Mercearia</option>
                  <option value="Distribuidora de Bebidas e Laticínios">Distribuidora de Bebidas e Laticínios</option>
                  <option value="Hortifrúti e Produtos Perecíveis">Hortifrúti e Produtos Perecíveis</option>
                  <option value="Congelados e Frigoríficos">Congelados e Frigoríficos</option>
                  <option value="Depósito / Filial Logística">Depósito / Filial Logística</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cidade / UF</label>
                  <input
                    type="text"
                    placeholder="Ex: Santos - SP"
                    value={cidadeUf}
                    onChange={(e) => setCidadeUf(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">CNPJ</label>
                  <input
                    type="text"
                    placeholder="00.000.000/0001-00"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalNovoNegocio(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
                >
                  Salvar e Ativar Negócio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PREFERÊNCIAS E SIMULAÇÃO RBAC */}
      {modalPerfil && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">Controle de Perfil & Permissões (RBAC)</h3>
              </div>
              <button
                onClick={() => setModalPerfil(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 my-4">
              <p className="text-xs text-slate-500">
                Selecione o perfil que deseja simular para testar a matriz de segurança implementada no backend e na interface:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(Object.keys(PERFIS_DISPONIVEIS) as PerfilUsuario[]).map((p) => {
                  const perfilInfo = PERFIS_DISPONIVEIS[p];
                  const isCurrent = state.usuario.perfil === p;
                  return (
                    <button
                      key={p}
                      onClick={() => {
                        ERPStore.alternarPerfilUsuario(p);
                        setModalPerfil(false);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isCurrent
                          ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-mono font-bold text-xs text-slate-900">{p}</span>
                        {isCurrent && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                      </div>
                      <p className="text-[11px] font-semibold text-slate-700 truncate">{perfilInfo.nome}</p>
                      <p className="text-[10px] text-slate-400 truncate">{perfilInfo.cargo}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setModalPerfil(false)}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-xl"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
