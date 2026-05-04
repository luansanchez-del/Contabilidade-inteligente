import { Client, ClientAudit } from '../types';

const CLIENTS_KEY = 'audit_ai_clients';
const AUDITS_KEY = 'audit_ai_audits';

export const storageService = {
  getClients: (): Client[] => {
    const clients = localStorage.getItem(CLIENTS_KEY);
    return clients ? JSON.parse(clients) : [];
  },

  saveClient: (client: Omit<Client, 'id' | 'createdAt'>): Client => {
    const clients = storageService.getClients();
    const newClient: Client = {
      ...client,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
    };
    clients.push(newClient);
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
    return newClient;
  },

  getClientByCnpj: (cnpj: string): Client | undefined => {
    return storageService.getClients().find(c => c.cnpj === cnpj);
  },

  getAuditsByClient: (clientId: string): ClientAudit[] => {
    const audits = localStorage.getItem(AUDITS_KEY);
    const allAudits: ClientAudit[] = audits ? JSON.parse(audits) : [];
    return allAudits.filter(a => a.clientId === clientId).sort((a, b) => b.timestamp - a.timestamp);
  },

  saveAudit: (audit: Omit<ClientAudit, 'id' | 'timestamp'>): ClientAudit => {
    const audits = localStorage.getItem(AUDITS_KEY);
    const allAudits: ClientAudit[] = audits ? JSON.parse(audits) : [];
    const newAudit: ClientAudit = {
      ...audit,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    allAudits.push(newAudit);
    localStorage.setItem(AUDITS_KEY, JSON.stringify(allAudits));
    return newAudit;
  },

  deleteClient: (clientId: string) => {
    const clients = storageService.getClients().filter(c => c.id !== clientId);
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
    
    const audits = localStorage.getItem(AUDITS_KEY);
    if (audits) {
      const allAudits: ClientAudit[] = JSON.parse(audits);
      const filteredAudits = allAudits.filter(a => a.clientId !== clientId);
      localStorage.setItem(AUDITS_KEY, JSON.stringify(filteredAudits));
    }
  }
};
