import React from 'react';
import { motion } from 'motion/react';
import { History, Calendar, FileType, ChevronRight, Clock, Trash2 } from 'lucide-react';
import { ClientAudit, AuditMode } from '../types';

interface AuditHistoryProps {
  audits: ClientAudit[];
  activeMode: AuditMode;
  onSelectAudit: (audit: ClientAudit) => void;
  onNewAudit: () => void;
}

export const AuditHistory: React.FC<AuditHistoryProps> = ({ audits, activeMode, onSelectAudit, onNewAudit }) => {
  const filteredAudits = audits.filter(a => a.mode === activeMode);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 p-3 rounded-xl">
            <History className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">
              Histórico: {activeMode === AuditMode.BALANCETE ? 'Balancetes' : 'Escriturações SPED'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">PROCESSAMENTOS REALIZADOS NESTE MÓDULO</p>
          </div>
        </div>
        <button 
          onClick={onNewAudit}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <FileType className="w-4 h-4" />
          Nova Auditoria
        </button>
      </div>

      <div className="space-y-3">
        {filteredAudits.map((audit, idx) => (
          <motion.div
            key={audit.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => onSelectAudit(audit)}
            className="group flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:border-blue-600 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center gap-6">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-[10px] leading-tight text-center ${
                audit.type === 'ECD' 
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                  : audit.type === 'ECF'
                  ? 'bg-blue-50 text-blue-600 border border-blue-100'
                  : 'bg-purple-50 text-purple-600 border border-purple-100'
              }`}>
                {audit.type === 'BALANCETE' ? 'BALAN\nCETE' : audit.type}
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {audit.mode === AuditMode.BALANCETE ? 'Verificação de Balancete' : `Auditoria SPED ${audit.type}`}
                  </h4>
                  {audit.mode === AuditMode.BALANCETE && (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-[9px] font-black uppercase">Patrimonial</span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3" />
                    {audit.period}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(audit.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-xl font-bold text-slate-900 leading-none">{audit.report.summary.totalIssues}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Alertas IA</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
        ))}

        {filteredAudits.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 bg-white border border-slate-200 border-dashed rounded-3xl">
            <History className="w-12 h-12 mb-4 opacity-10" />
            <p className="text-sm font-bold">Nenhuma auditoria realizada neste módulo.</p>
            <p className="text-xs mt-1">Inicie o processamento para este cliente no módulo {activeMode}.</p>
            <button 
              onClick={onNewAudit}
              className="mt-6 px-6 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors"
            >
              Começar Agora
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
