import React from 'react';
import { ShieldAlert, Lock, ArrowRight, UserCheck } from 'lucide-react';
import { ERPStore, PERFIS_DISPONIVEIS } from '../services/store';
import { PerfilUsuario } from '../types';

interface AcessoNegadoProps {
  recursoNome: string;
  perfisPermitidos: PerfilUsuario[];
}

export const AcessoNegado403: React.FC<AcessoNegadoProps> = ({ recursoNome, perfisPermitidos }) => {
  const usuario = ERPStore.getState().usuario;

  return (
    <div className="bg-white rounded-2xl border border-rose-200/80 shadow-sm p-12 text-center max-w-2xl mx-auto my-8 animate-in fade-in zoom-in-95 duration-200">
      <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-200 shadow-sm">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <span className="inline-block px-3 py-1 bg-rose-100 text-rose-800 text-xs font-mono font-bold rounded-full mb-3">
        HTTP 403 • ACESSO NÃO AUTORIZADO (RBAC)
      </span>

      <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
        Acesso Restrito ao Módulo de {recursoNome}
      </h2>

      <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
        O seu perfil atual (<strong className="text-slate-800">{usuario.perfil} - {usuario.cargo}</strong>) não possui a permissão necessária no formato <code className="bg-slate-100 px-1 py-0.5 rounded text-rose-700 font-mono text-[11px]">{recursoNome.toLowerCase()}:ler</code> definida na matriz de acessos (Seção 4).
      </p>

      <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-left max-w-md mx-auto">
        <p className="font-bold text-slate-700 flex items-center gap-1.5 mb-2">
          <Lock className="w-3.5 h-3.5 text-slate-500" /> Perfis com autorização para este recurso:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {perfisPermitidos.map(p => (
            <span key={p} className="px-2.5 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-md border border-blue-200 font-mono text-[10px]">
              {p}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center gap-3">
        <span className="text-xs text-slate-400 font-medium">
          Deseja simular outro perfil para testar as permissões de acesso?
        </span>
        <div className="flex flex-wrap justify-center gap-2">
          {perfisPermitidos.map(p => (
            <button
              key={p}
              onClick={() => ERPStore.alternarPerfilUsuario(p)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition shadow-xs"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              Alternar para {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

