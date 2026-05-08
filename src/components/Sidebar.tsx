import { Cloud, BarChart3, FileJson } from 'lucide-react';
import { AuditMode } from '../types';
import { motion } from 'motion/react';

interface SidebarProps {
  activeMode: AuditMode | string;
  onModeChange: (mode: AuditMode | string) => void;
}

export const Sidebar = ({ activeMode, onModeChange }: SidebarProps) => {
  const modes = [
    { id: 'SPED', label: 'Portal SPED', icon: FileJson, description: 'Auditoria SPED Fiscal' },
    { id: 'BALANCETE', label: 'Balancete', icon: BarChart3, description: 'Auditoria Patrimonial' },
    { id: 'WEATHER', label: 'Clima', icon: Cloud, description: 'Dashboard de Tempo' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen overflow-y-auto sticky top-0 flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
          Módulos
        </h3>
        <div className="space-y-2">
          {modes.map(mode => {
            const Icon = mode.icon;
            const isActive = activeMode === mode.id;
            return (
              <motion.button
                key={mode.id}
                onClick={() => onModeChange(mode.id as any)}
                whileHover={{ x: 4 }}
                className={`w-full p-3 rounded-lg transition-all text-left group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm leading-none">{mode.label}</p>
                    <p className={`text-xs mt-1 ${
                      isActive ? 'text-blue-100' : 'text-slate-500'
                    }`}>
                      {mode.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Quick Info */}
      <div className="flex-1" />
      <div className="p-6 border-t border-slate-200 text-center">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Versão 1.0
        </p>
        <p className="text-[10px] text-slate-500 mt-2">
          Sistema de Auditoria + Clima
        </p>
      </div>
    </aside>
  );
};
