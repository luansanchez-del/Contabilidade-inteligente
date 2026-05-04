import React, { useState, useCallback } from 'react';
import { Upload, FileType, CheckCircle2, AlertCircle, BookOpen, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SPEDType, AuditMode } from '../types';

interface FileUploaderProps {
  mode: AuditMode;
  onFileReady: (content: string, type: SPEDType | 'BALANCETE', mode: AuditMode, previousContent?: string) => void;
  isAnalyzing: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ mode, onFileReady, isAnalyzing }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedType, setSelectedType] = useState<SPEDType>(SPEDType.ECD);
  const [error, setError] = useState<string | null>(null);
  const [prevFileContent, setPrevFileContent] = useState<string | undefined>(undefined);

  const handlePrevFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPrevFileContent(ev.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else {
      setIsDragging(false);
    }
  }, []);

  const processFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.txt') && !file.name.toLowerCase().endsWith('.csv')) {
      setError('Por favor, selecione um arquivo .txt ou .csv.');
      return;
    }
    
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileReady(
        content, 
        mode === AuditMode.BALANCETE ? 'BALANCETE' : selectedType, 
        mode, 
        prevFileContent
      );
    };
    reader.readAsText(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [selectedType, mode, prevFileContent]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-end">
        <div className="space-y-4">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contexto de Auditoria</label>
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl w-fit shadow-md text-slate-100 text-xs font-bold uppercase tracking-wider">
            {mode === AuditMode.SPED ? (
              <><BookOpen className="w-4 h-4 text-blue-400" /> Auditoria SPED Digital</>
            ) : (
              <><BarChart3 className="w-4 h-4 text-purple-400" /> Auditoria Patrimonial</>
            )}
          </div>
        </div>

        {mode === AuditMode.SPED && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Escrituração</label>
            <div className="flex gap-2 p-1 bg-white border border-slate-200 rounded-xl w-fit shadow-sm">
              <button
                onClick={() => setSelectedType(SPEDType.ECD)}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  selectedType === SPEDType.ECD ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                ECD
              </button>
              <button
                onClick={() => setSelectedType(SPEDType.ECF)}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  selectedType === SPEDType.ECF ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                ECF
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 w-full md:w-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase text-right tracking-wider">Saldo Comparativo</span>
            <label className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
              prevFileContent ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}>
              <FileType className="w-4 h-4" />
              {prevFileContent ? 'Saldo Carregado' : 'Carregar Anterior'}
              <input type="file" className="hidden" accept=".txt,.csv" onChange={handlePrevFile} />
            </label>
            {prevFileContent && <button onClick={() => setPrevFileContent(undefined)} className="text-[9px] text-rose-500 font-bold hover:underline text-right uppercase">Remover</button>}
        </div>
      </div>

      <motion.label
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
        className={`relative flex flex-col items-center justify-center w-full h-80 border-2 border-dashed rounded-3xl cursor-pointer transition-all ${
          isDragging ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300 bg-white hover:bg-slate-50'
        } ${isAnalyzing ? 'opacity-50 pointer-events-none' : 'shadow-sm'}`}
      >
        <input type="file" className="hidden" accept=".txt,.csv" onChange={handleChange} />
        
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
          <div className={`p-5 rounded-2xl mb-4 transition-colors ${isDragging ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
            <Upload className="w-8 h-8" />
          </div>
          <p className="mb-2 text-xl font-sans font-bold text-slate-800">
            Arraste seu arquivo <span className={mode === AuditMode.BALANCETE ? 'text-purple-600' : 'text-blue-600'}>
              {mode === AuditMode.BALANCETE ? 'de Balancete' : selectedType}
            </span> aqui
          </p>
          <p className="text-sm text-slate-500 font-medium max-w-sm">
            Clique para selecionar ou arraste o arquivo estruturado (.txt ou .csv)
          </p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute bottom-6 flex items-center gap-2 text-rose-600 bg-rose-50 px-4 py-2 rounded-full border border-rose-200"
            >
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs font-bold">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {isAnalyzing && (
          <div className="absolute inset-0 bg-white/90 rounded-3xl flex flex-col items-center justify-center backdrop-blur-sm z-20">
            <div className={`w-12 h-12 border-4 ${mode === AuditMode.BALANCETE ? 'border-purple-600' : 'border-blue-600'} border-t-transparent rounded-full animate-spin mb-4`} />
            <p className={`${mode === AuditMode.BALANCETE ? 'text-purple-600' : 'text-blue-600'} font-bold animate-pulse text-sm`}>PROCESSANDO INTELIGÊNCIA FISCAL...</p>
            <p className="text-xs text-slate-400 mt-2">Isso pode levar alguns segundos dependendo do tamanho do arquivo</p>
          </div>
        )}
      </motion.label>
    </div>
  );
};
