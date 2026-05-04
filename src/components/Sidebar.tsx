import React from 'react';
import { BookOpen, BarChart3, Settings, ShieldCheck } from 'lucide-react';
import { AuditMode } from '../types';

interface SidebarProps {
  activeMode: AuditMode;
  onModeChange: (mode: AuditMode) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeMode, onModeChange }) => {
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-64px)] sticky top-16">
      <div className="p-6">
        <div className="px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mb-4">
          Módulos de Auditoria
        </div>
        
        <nav className="space-y-1">
          <button
            onClick={() => onModeChange(AuditMode.SPED)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
              activeMode === AuditMode.SPED 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            Painel SPED
          </button>
          
          <button
            onClick={() => onModeChange(AuditMode.BALANCETE)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
              activeMode === AuditMode.BALANCETE 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Balancete / Patrimonial
          </button>
        </nav>

        <div className="mt-12">
          <div className="px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black mb-4">
            Gestão de Riscos
          </div>
          <nav className="space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 transition-all font-bold text-sm">
              <ShieldCheck className="w-5 h-5" />
              Compliance Fiscal
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 transition-all font-bold text-sm">
              <Settings className="w-5 h-5" />
              Configurações
            </button>
          </nav>
        </div>
      </div>

      <div className="mt-auto p-6">
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Processamento IA</p>
          <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-mono">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            GEMINI 1.5 PRO ONLINE
          </div>
        </div>
      </div>
    </aside>
  );
};
