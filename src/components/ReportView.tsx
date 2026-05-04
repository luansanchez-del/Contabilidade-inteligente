import React from 'react';
import { motion } from 'motion/react';
import { AuditReport, AuditIssue } from '../types';
import { AlertTriangle, Info, AlertCircle, CheckCircle2, ChevronRight, ArrowDownRight, Terminal, ShieldCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ReportViewProps {
  report: AuditReport;
}

const severityColors = {
  HIGH: 'text-rose-600 bg-rose-50 border-rose-100',
  MEDIUM: 'text-amber-600 bg-amber-50 border-amber-100',
  LOW: 'text-blue-600 bg-blue-50 border-blue-100',
};

const typeIcons = {
  INTEGRITY: <AlertCircle className="w-4 h-4" />,
  MAPPING: <Info className="w-4 h-4" />,
  ANOMALY: <AlertTriangle className="w-4 h-4" />,
  LOGIC: <ArrowDownRight className="w-4 h-4" />,
};

export const ReportView: React.FC<ReportViewProps> = ({ report }) => {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Inconsistências', value: report.summary.totalIssues, icon: <AlertCircle className="text-rose-600" />, sub: 'Identificadas por IA' },
          { label: 'Erros Integridade', value: report.summary.integrityIssues, icon: <AlertTriangle className="text-amber-500" />, sub: 'Registros I155/K155' },
          { label: 'Falhas Mapeamento', value: report.summary.mappingIssues, icon: <Info className="text-blue-600" />, sub: 'Registro I051' },
          { label: 'Anomalias/Riscos', value: report.summary.anomalies, icon: <Terminal className="text-slate-600" />, sub: 'Lançamentos Atípicos' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white border border-slate-200 p-5 rounded-xl flex flex-col gap-1 relative overflow-hidden group hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start">
              <span className="text-3xl font-bold text-slate-900 tracking-tighter">{stat.value}</span>
              <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-slate-100 transition-colors">
                {stat.icon}
              </div>
            </div>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-tight">{stat.label}</span>
            <span className="text-[10px] text-slate-400 italic italic">{stat.sub}</span>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="px-6 py-4 bg-white border border-slate-200 rounded-t-xl border-b-0 flex justify-between items-center shadow-sm">
            <h2 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
              <span className="text-blue-600">☰</span> Lista de Inconsistências Detectadas
            </h2>
            {report.summary.comparisonFound && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-tight">Cruzamento Inter-Período Ativo</span>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            {report.details.map((issue, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + idx * 0.05 }}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden group shadow-sm hover:shadow-md transition-all"
              >
                <div className="p-6 border-b border-slate-50 flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${severityColors[issue.severity]}`}>
                        {issue.severity === 'HIGH' ? 'CRÍTICO' : issue.severity === 'MEDIUM' ? 'ATENÇÃO' : 'INFO'}
                      </span>
                      {issue.isPredictive && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-blue-200 bg-blue-50 text-blue-700 animate-pulse">
                          IMPACTO NA ECF
                        </span>
                      )}
                      <span className="text-[10px] font-mono font-bold text-slate-400">REGISTRO {issue.record}</span>
                    </div>
                    <h3 className="text-slate-900 font-bold leading-tight group-hover:text-blue-700 transition-colors">
                      {issue.description}
                    </h3>
                  </div>
                  <div className="p-2 text-slate-400 bg-slate-50 rounded-md">
                    {typeIcons[issue.type]}
                  </div>
                </div>
                
                <div className="p-6 bg-slate-50/50 space-y-4">
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Insight Técnico da IA</p>
                    <p className="text-sm text-slate-600 leading-relaxed pl-4 border-l-2 border-slate-200">
                      {issue.technicalExplanation}
                    </p>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-blue-700 uppercase mb-2">Sugestão de Correção (ERP)</p>
                    <div className="bg-white p-3 rounded-lg border border-slate-200 text-sm text-slate-600 italic">
                      {issue.suggestion}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <aside className="bg-white border border-slate-200 rounded-xl p-6 sticky top-24 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Conclusão da Auditoria</h3>
            </div>
            
            <div className="markdown-body text-xs">
              <ReactMarkdown>
                {report.conclusion}
              </ReactMarkdown>
            </div>
            
            <div className="mt-8 space-y-3">
              <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-lg shadow-slate-200 hover:bg-slate-800 transition-colors">
                GERAR RELATÓRIO FINAL
              </button>
              <button className="w-full py-3 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors">
                EXPORTAR JSON
              </button>
              <p className="text-[10px] text-center text-slate-400 mt-4 leading-normal">
                Processado em <span className="font-bold">1.2s</span> via Gemini 1.5 Pro Neural Engine
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
