/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum SPEDType {
  ECD = 'ECD',
  ECF = 'ECF',
}

export enum AuditMode {
  SPED = 'SPED',
  BALANCETE = 'BALANCETE',
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: number;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: number;
}

export interface Client {
  id: string;
  cnpj: string;
  razaoSocial: string;
  setor?: string;
  createdAt: number;
}

export interface ClientAudit {
  id: string;
  clientId: string;
  type: SPEDType | 'BALANCETE';
  mode: AuditMode;
  period: string; // e.g., "2023-01-01 to 2023-12-31"
  timestamp: number;
  report: AuditReport;
}

export interface AuditIssue {
  type: 'INTEGRITY' | 'MAPPING' | 'ANOMALY' | 'LOGIC';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  record: string; // e.g., "I155"
  description: string;
  technicalExplanation: string;
  suggestion: string;
  isPredictive?: boolean; // If true, it means this ECD error will cause an ECF failure
}

export interface AuditReport {
  summary: {
    totalIssues: number;
    integrityIssues: number;
    mappingIssues: number;
    anomalies: number;
    comparisonFound: boolean;
    period: string; // Extracted from Register 0000 (DT_INI and DT_FIN)
    clientInfo: {
      cnpj: string;
      razaoSocial: string;
    };
  };
  details: AuditIssue[];
  conclusion: string;
}
