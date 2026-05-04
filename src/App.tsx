import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { FileUploader } from './components/FileUploader';
import { ReportView } from './components/ReportView';
import { ClientManager } from './components/ClientManager';
import { AuditHistory } from './components/AuditHistory';
import { analyzeSPEDFile, analyzeBalancete } from './services/geminiService';
import { storageService } from './services/storageService';
import { AuditReport, SPEDType, AuditMode, Client, ClientAudit } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Shield, FileSearch, ArrowLeft, FolderOpen, LayoutDashboard } from 'lucide-react';

enum ViewState {
  CLIENT_LIST,
  CLIENT_DETAIL,
  REPORT
}

export default function App() {
  const [activeMode, setActiveMode] = useState<AuditMode>(AuditMode.SPED);
  const [view, setView] = useState<ViewState>(ViewState.CLIENT_LIST);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [currentHistory, setCurrentHistory] = useState<ClientAudit[]>([]);
  const [currentReport, setCurrentReport] = useState<AuditReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (selectedClient) {
      const history = storageService.getAuditsByClient(selectedClient.id);
      setCurrentHistory(history);
    }
  }, [selectedClient, view, activeMode]);

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setView(ViewState.CLIENT_DETAIL);
  };

  const handleModeChange = (mode: AuditMode) => {
    setActiveMode(mode);
    setView(ViewState.CLIENT_LIST);
    setSelectedClient(null);
    setCurrentReport(null);
  };

  const handleFileReady = async (content: string, type: SPEDType | 'BALANCETE', mode: AuditMode, previousContent?: string) => {
    setIsAnalyzing(true);
    setCurrentReport(null);
    
    try {
      let result: AuditReport;
      
      // If we already have a client selected, we can try to find previous context
      let previous: ClientAudit | undefined = undefined;
      if (selectedClient) {
        const history = storageService.getAuditsByClient(selectedClient.id);
        previous = history.find(h => h.mode === mode && h.type === type);
      }

      if (mode === AuditMode.BALANCETE) {
        result = await analyzeBalancete(content, previous?.report);
      } else {
        result = await analyzeSPEDFile(content, type as SPEDType, previous?.report, previousContent);
      }
      
      // Auto-identify client from analysis result
      const cnpj = result.summary.clientInfo.cnpj;
      const razaoSocial = result.summary.clientInfo.razaoSocial;

      let client = selectedClient;
      
      if (!client) {
        // Try finding existing client by CNPJ
        const existingClient = storageService.getClientByCnpj(cnpj);
        if (existingClient) {
          client = existingClient;
        } else {
          // Register new client
          client = storageService.saveClient({
            cnpj,
            razaoSocial,
            setor: "Auditado via IA"
          });
        }
        setSelectedClient(client);
      }

      // Extract period from result summary
      const periodFound = result.summary.period || "Período Indefinido";

      // Save the audit
      storageService.saveAudit({
        clientId: client!.id,
        type,
        mode,
        period: periodFound,
        report: result
      });

      setCurrentReport(result);
      setView(ViewState.REPORT);
    } catch (error) {
      console.error(error);
      alert("Erro ao processar arquivo. Verifique se o conteúdo é válido para análise.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-950 flex flex-col">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeMode={activeMode} onModeChange={handleModeChange} />

        <main className="flex-1 overflow-y-auto px-8 py-10 space-y-10">
          {/* Module Banner */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-8">
            <div className="flex items-center gap-4">
              {view !== ViewState.CLIENT_LIST && (
                <button 
                  onClick={() => setView(view === ViewState.REPORT ? ViewState.CLIENT_DETAIL : ViewState.CLIENT_LIST)}
                  className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all shadow-sm"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
              )}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <LayoutDashboard className={`w-4 h-4 ${activeMode === AuditMode.SPED ? 'text-blue-600' : 'text-purple-600'}`} />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {activeMode === AuditMode.SPED ? 'Portal do SPED Fiscal' : 'Auditoria Patrimonial Mensal'}
                  </span>
                </div>
                <h2 className="text-3xl font-sans font-black tracking-tight text-slate-900">
                  {view === ViewState.CLIENT_LIST && "Painel de Processamento"}
                  {view === ViewState.CLIENT_DETAIL && selectedClient?.razaoSocial}
                  {view === ViewState.REPORT && "Relatório Diagnóstico IA"}
                </h2>
                {selectedClient && (
                  <div className="flex items-center gap-2 mt-1 font-mono">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <FolderOpen className="w-3 h-3 text-blue-600" />
                      CNPJ: {selectedClient.cnpj}
                    </span>
                    {view === ViewState.REPORT && currentReport && (
                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1 before:content-['•'] before:mr-1">
                        PERÍODO: {currentReport.summary.period}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <section className="relative">
            <AnimatePresence mode="wait">
              {view === ViewState.CLIENT_LIST && (
                <motion.div
                  key="client-list"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-12"
                >
                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="text-center mb-10">
                       <h3 className="text-2xl font-black text-slate-900 mb-2">Novo Processamento Direto</h3>
                       <p className="text-slate-500 text-sm">Arraste seu arquivo para análise e identificação automática do cliente.</p>
                    </div>
                    <FileUploader mode={activeMode} onFileReady={handleFileReady} isAnalyzing={isAnalyzing} />
                  </div>

                  <div className="pt-8">
                     <div className="flex items-center gap-4 mb-6">
                        <div className="h-[1px] flex-1 bg-slate-200" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ou selecione na carteira</span>
                        <div className="h-[1px] flex-1 bg-slate-200" />
                     </div>
                     <ClientManager onSelectClient={handleSelectClient} selectedClientId={selectedClient?.id} />
                  </div>
                </motion.div>
              )}

              {view === ViewState.CLIENT_DETAIL && selectedClient && (
                <motion.div
                  key="client-detail"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-12"
                >
                  <AuditHistory 
                    audits={currentHistory} 
                    activeMode={activeMode}
                    onSelectAudit={(a) => { setCurrentReport(a.report); setView(ViewState.REPORT); }}
                    onNewAudit={() => {}} 
                  />
                  
                  <div className="pt-12 border-t border-slate-200">
                    <div className="text-center mb-12">
                      <h3 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Central de Processamento</h3>
                      <p className="text-slate-500 font-medium italic">Selecione o arquivo da escrituração (.txt) para iniciar a auditoria neural.</p>
                    </div>
                    <FileUploader mode={activeMode} onFileReady={handleFileReady} isAnalyzing={isAnalyzing} />
                  </div>
                </motion.div>
              )}

              {view === ViewState.REPORT && currentReport && (
                <motion.div
                  key="report-view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <ReportView report={currentReport} />
                  <div className="mt-12 flex justify-center">
                     <button 
                      onClick={() => setView(ViewState.CLIENT_DETAIL)}
                      className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center gap-2"
                     >
                       <ArrowLeft className="w-5 h-5" />
                       Voltar ao Painel do Cliente
                     </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </main>
      </div>

      <footer className="border-t border-slate-200 bg-white py-6 px-8 flex justify-between items-center text-slate-400 text-[10px] font-bold uppercase tracking-widest shrink-0">
          <p>© 2026 AUDITAI CONTÁBIL - INTELIGÊNCIA FISCAL APLICADA</p>
          <div className="flex gap-4">
            <span className="text-emerald-500 flex items-center gap-1">
              <Shield className="w-3 h-3" /> SISTEMA SEGURO
            </span>
          </div>
      </footer>
    </div>
  );
}
