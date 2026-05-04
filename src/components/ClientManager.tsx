import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Users, Search, Folder, Trash2, ChevronRight, Hash } from 'lucide-react';
import { Client } from '../types';
import { storageService } from '../services/storageService';

interface ClientManagerProps {
  onSelectClient: (client: Client) => void;
  selectedClientId?: string;
}

export const ClientManager: React.FC<ClientManagerProps> = ({ onSelectClient, selectedClientId }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newClient, setNewClient] = useState({ cnpj: '', razaoSocial: '' });

  useEffect(() => {
    setClients(storageService.getClients());
  }, []);

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (newClient.cnpj && newClient.razaoSocial) {
      const saved = storageService.saveClient(newClient);
      setClients([...clients, saved]);
      setNewClient({ cnpj: '', razaoSocial: '' });
      setShowAddForm(false);
    }
  };

  const handleDeleteClient = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir este cliente e todo o histórico?')) {
      storageService.deleteClient(id);
      setClients(clients.filter(c => c.id !== id));
    }
  };

  const filteredClients = clients.filter(c => 
    c.razaoSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cnpj.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600/10 p-2 rounded-lg">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Gestão de Carteira</h3>
            <p className="text-[10px] text-slate-500 font-mono italic">ORGANIZAÇÃO POR CLIENTES E PASTAS</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Novo Registro
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text"
          placeholder="Buscar por Razão Social ou CNPJ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all"
        />
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/50 backdrop-blur-sm"
          >
            <form 
              onSubmit={handleAddClient}
              className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md space-y-6 border border-slate-200"
            >
              <div className="flex justify-between items-center">
                <h4 className="text-xl font-bold text-slate-900">Novo Cliente Contábil</h4>
                <button type="button" onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Razão Social</label>
                  <input 
                    required
                    type="text"
                    value={newClient.razaoSocial}
                    onChange={(e) => setNewClient({ ...newClient, razaoSocial: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
                    placeholder="Ex: Empresa de Alimentos LTDA"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">CNPJ</label>
                  <input 
                    required
                    type="text"
                    value={newClient.cnpj}
                    onChange={(e) => setNewClient({ ...newClient, cnpj: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
                    placeholder="00.000.000/0000-00"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
              >
                Cadastrar Cliente
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => (
          <motion.div
            key={client.id}
            whileHover={{ y: -4 }}
            onClick={() => onSelectClient(client)}
            className={`cursor-pointer p-6 rounded-2xl border transition-all relative group ${
              selectedClientId === client.id 
                ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600/20' 
                : 'bg-white border-slate-200 hover:border-blue-600 shadow-sm'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${selectedClientId === client.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                <Folder className="w-5 h-5" />
              </div>
              <button 
                onClick={(e) => handleDeleteClient(e, client.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-rose-300 hover:text-rose-600 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <h4 className="font-bold text-slate-900 line-clamp-1 mb-1">{client.razaoSocial}</h4>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-4">
              <Hash className="w-3 h-3" />
              {client.cnpj}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Acessar Pasta</span>
              <ChevronRight className={`w-4 h-4 transition-transform ${selectedClientId === client.id ? 'translate-x-1 text-blue-600' : 'text-slate-300'}`} />
            </div>
          </motion.div>
        ))}

        {filteredClients.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl">
            <Users className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm font-medium">Nenhum cliente encontrado.</p>
            <p className="text-xs">Inicie cadastrando uma nova empresa para auditoria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
