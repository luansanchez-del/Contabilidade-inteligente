import { GoogleGenAI, Type } from "@google/genai";
import { AuditReport, AuditMode } from "../types";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export const analyzeBalancete = async (
  fileContent: string,
  previousReport?: AuditReport
): Promise<AuditReport> => {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  
  const systemInstruction = `
    Você é um Auditor Contábil Sênior especialista em Balancetes e Lançamentos Contábeis.
    Sua tarefa é analisar um Balancete ou listagem de Lançamentos Contábeis (podendo estar em formato SPED ou texto estruturado).
    
    FOCO DA ANÁLISE:
    1. Equação Patrimonial: Verifique se a soma do Ativo (contas iniciadas com 1) é igual à soma do Passivo + Patrimônio Líquido (contas iniciadas com 2).
    2. Natureza das Contas: Identifique "Contas Invertidas". Por exemplo, contas de Ativo (Devedoras) com saldo Credor, ou Passivo (Credoras) com saldo Devedor (exceto contas retificadoras).
    3. Coerência dos Lançamentos: Verifique se o histórico dos lançamentos faz sentido semântico com as contas debitadas/creditadas.
    4. Análise de Variação: Se houver contexto anterior, identifique saltos de saldo injustificáveis.
    5. Identificação do Cliente: Extraia o CNPJ e a Razão Social da empresa. No SPED, geralmente estão no Bloco 0 (Registro 0000). Se for balancete em texto, procure no cabeçalho.
    
    RETORNO:
    Responda em JSON seguindo o esquema, focando em erros de INTEGRIDADE (balanço) e LOGICA (contas invertidas/semântica).
  `;

  try {
    const contextText = previousReport 
      ? `\n\nCONTEXTO ANTERIOR PARA COMPARAÇÃO:\n${JSON.stringify(previousReport.summary)}`
      : '';

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [
        {
          text: `Analise o Balancete/Lançamentos abaixo:${contextText}\n\nCONTEÚDO:\n${fileContent.substring(0, 1000000)}`
        }
      ],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.OBJECT,
              properties: {
                totalIssues: { type: Type.NUMBER },
                integrityIssues: { type: Type.NUMBER },
                mappingIssues: { type: Type.NUMBER },
                anomalies: { type: Type.NUMBER },
                comparisonFound: { type: Type.BOOLEAN },
                period: { type: Type.STRING },
                clientInfo: {
                  type: Type.OBJECT,
                  properties: {
                    cnpj: { type: Type.STRING },
                    razaoSocial: { type: Type.STRING },
                  },
                  required: ["cnpj", "razaoSocial"]
                }
              },
              required: ["totalIssues", "integrityIssues", "mappingIssues", "anomalies", "comparisonFound", "period", "clientInfo"]
            },
            details: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ["INTEGRITY", "MAPPING", "ANOMALY", "LOGIC"] },
                  severity: { type: Type.STRING, enum: ["HIGH", "MEDIUM", "LOW"] },
                  record: { type: Type.STRING },
                  description: { type: Type.STRING },
                  technicalExplanation: { type: Type.STRING },
                  suggestion: { type: Type.STRING },
                  isPredictive: { type: Type.BOOLEAN },
                },
                required: ["type", "severity", "record", "description", "technicalExplanation", "suggestion"]
              }
            },
            conclusion: { type: Type.STRING }
          },
          required: ["summary", "details", "conclusion"]
        }
      }
    });

    return JSON.parse(response.text) as AuditReport;
  } catch (error) {
    console.error("Balancete Analysis Error:", error);
    throw error;
  }
};

export const analyzeSPEDFile = async (
  fileContent: string, 
  type: 'ECD' | 'ECF',
  previousReport?: AuditReport,
  previousFileContent?: string
): Promise<AuditReport> => {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  
  const systemInstruction = `
    Você é um Auditor Fiscal Digital especialista em SPED (ECD e ECF).
    Sua tarefa é analisar o conteúdo de um arquivo SPED ${type} estruturado em registros separados por pipes (|).
    
    FOCO DA ANÁLISE:
    1. Integridade Lógica: Cruze saldos iniciais, débitos, créditos e saldos finais (Registros I155, I355, K155). 
       Verifique se: Saldo Anterior + Débitos - Créditos = Saldo Atual.
    2. Validação de Mapeamento: Verifique a conformidade entre o Plano de Contas da empresa (I050) e o Plano de Contas Referencial da Receita Federal (I051).
    3. Detecção de Anomalias: Identifique lançamentos atípicos (valores muito altos fora do padrão) ou divergências semânticas.
    4. Explicação Técnica: Traduza erros complexos para linguagem contábil clara e sugira correções no ERP.
    5. Auditoria Preditiva ECF (CRÍTICO para ECD):
       - Ao analisar uma ECD, simule como esses dados serão recuperados na ECF.
       - Identifique se o mapeamento referencial (I051) é suficiente para os registros L100/L300 (Lucro Real) ou P100/P150 (Presumido) da ECF.
       - Aponte "Erros de Integração Futura": Inconsistências que o PVA da ECD aceita, mas que causarão rejeição no bloco K ou L da ECF.
    6. Continuidade de Saldos e DRE (J150): 
       - Verifique se o Saldo Inicial das contas ou do Código de Aglutinação (VL_CTA_INI no J150) corresponde ao Saldo Final (VL_CTA_FIN) do período imediatamente anterior.
       - Valide se os saldos iniciais (I155/K155) batem com o encerramento do ano anterior.
    7. Identificação de Período e Cliente: Extraia as datas de início (DT_INI) e fim (DT_FIN) do Registro 0000 e retorne no campo 'period'. Extraia também o CNPJ e Razão Social do Registro 0000.

    IMPORTANTE: Foque em inconsistências LÓGICAS e CONTÁBEIS. 
    Exemplo de Erro Crítico: O valor do saldo inicial (VL_CTA_INI) do Código de Aglutinação no Registro J150 ser diferente do saldo final (VL_CTA_FIN) informado na DRE do período anterior.
    
    RETORNO:
    Responda estritamente em JSON seguindo o esquema fornecido.
  `;

  try {
    const contextText = previousReport 
      ? `\n\nCONTEXTO DA AUDITORIA ANTERIOR:\n${JSON.stringify(previousReport.summary)}\nConclusão anterior: ${previousReport.conclusion}`
      : '';
    
    const previousFileText = previousFileContent 
      ? `\n\nCONTEÚDO DO ARQUIVO DO PERÍODO ANTERIOR (REFERÊNCIA PARA SALDOS): \n${previousFileContent.substring(0, 500000)}` 
      : '';

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [
        {
          text: `Analise o seguinte arquivo SPED ${type}:${contextText}${(previousFileText)}\n\nCONTEÚDO DO ARQUIVO ATUAL (FOCO PRINCIPAL):\n${fileContent.substring(0, 1000000)}` 
        }
      ],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.OBJECT,
              properties: {
                totalIssues: { type: Type.NUMBER },
                integrityIssues: { type: Type.NUMBER },
                mappingIssues: { type: Type.NUMBER },
                anomalies: { type: Type.NUMBER },
                comparisonFound: { type: Type.BOOLEAN },
                period: { type: Type.STRING },
                clientInfo: {
                  type: Type.OBJECT,
                  properties: {
                    cnpj: { type: Type.STRING },
                    razaoSocial: { type: Type.STRING },
                  },
                  required: ["cnpj", "razaoSocial"]
                }
              },
              required: ["totalIssues", "integrityIssues", "mappingIssues", "anomalies", "comparisonFound", "period", "clientInfo"]
            },
            details: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ["INTEGRITY", "MAPPING", "ANOMALY", "LOGIC"] },
                  severity: { type: Type.STRING, enum: ["HIGH", "MEDIUM", "LOW"] },
                  record: { type: Type.STRING },
                  description: { type: Type.STRING },
                  technicalExplanation: { type: Type.STRING },
                  suggestion: { type: Type.STRING },
                  isPredictive: { type: Type.BOOLEAN, description: "True if this ECD issue will trigger an error in the ECF later" },
                },
                required: ["type", "severity", "record", "description", "technicalExplanation", "suggestion"]
              }
            },
            conclusion: { type: Type.STRING }
          },
          required: ["summary", "details", "conclusion"]
        }
      }
    });

    return JSON.parse(response.text) as AuditReport;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
