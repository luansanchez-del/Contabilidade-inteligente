import { FileText, ShieldCheck } from 'lucide-react';

export const Header = () => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="bg-blue-700 w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xl">
          A
        </div>
        <div>
          <h1 className="font-sans font-bold text-base text-slate-900 leading-none">AuditAI Contábil</h1>
          <p className="text-xs text-slate-500 mt-1">Camada de Inteligência Artificial para SPED (ECD/ECF)</p>
        </div>
      </div>
      <nav className="flex items-center gap-6">
        <a href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Dashboard</a>
        <a href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Histórico</a>
        <div className="h-4 w-[1px] bg-slate-200" />
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-sm">
          <FileText className="w-4 h-4" />
          Nova Auditoria
        </button>
      </nav>
    </header>
  );
};
