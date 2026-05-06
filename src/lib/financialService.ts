import { GoogleGenAI, Type } from "@google/genai";
import { db, auth } from "./firebase";
import { collection, addDoc, query, getDocs, orderBy, onSnapshot } from "firebase/firestore";

// Removed aiInstance as we use the server proxy API instead.
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: any[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface FinancialData {
  liquidez: number;
  apalancamiento: number;
  rentabilidad: number;
  margenEbitda: number;
  riesgoSintetico: number;
}

export interface BenchmarkData {
  avgLiquidez: number;
  avgApalancamiento: number;
  avgMargenEbitda: number;
}

export interface HistoricalDataItem {
  date: string;
  revenue: number;
  ebitda: number;
  netIncome: number;
}

export interface MLPrediction {
  metric: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
}

export interface Report {
  id: string;
  userId: string;
  fileName: string;
  companyName: string;
  ticker?: string;
  period: string;
  sector: string;
  data: FinancialData;
  benchmark: BenchmarkData;
  analysis: string;
  historicalData: HistoricalDataItem[];
  mlPredictions: MLPrediction[];
  investmentRecommendation: {
    verdict: 'COMPRA' | 'MANTENER' | 'VENTA' | 'ESPECULATIVO';
    score: number;
    justification: string;
  };
  mlModels?: {
    knn?: { signal: string; confidence: number; sentiment: string };
    randomForest?: { prediction: number; trend: string; precision: number };
    lstm?: { dataPoints: number[]; trendForecast: string; errorMargin: number };
  };
  createdAt: string;
}

function safeJsonParse(text: string) {
  try {
    const cleanText = text.replace(/```json\n?|```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.warn("Standard JSON parse failed, trying extraction:", e);
    const startIdx = text.indexOf('{');
    const endIdx = text.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      try {
        const extracted = text.substring(startIdx, endIdx + 1);
        return JSON.parse(extracted);
      } catch (innerError) {
        console.error("JSON extraction failed:", innerError);
      }
    }
    // Final attempt: fallback if we see what looks like a JSON array
    const startArrIdx = text.indexOf('[');
    const endArrIdx = text.lastIndexOf(']');
    if (startArrIdx !== -1 && endArrIdx !== -1 && endArrIdx > startArrIdx) {
      try {
        const extracted = text.substring(startArrIdx, endArrIdx + 1);
        return JSON.parse(extracted);
      } catch (innerError) {
         console.error("JSON array extraction failed:", innerError);
      }
    }
    throw e;
  }
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

import { getAI } from "./gemini";

export const chatWithReport = async (report: Report, question: string): Promise<string> => {
  try {
    const ai = getAI();
    const systemInstruction = `Eres Numora, un CFO y Analista experto. Analizas a ${report.companyName} (${report.ticker}).`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{
        role: "user",
        parts: [{
          text: `PREGUNTA USUARIO: ${question}\n\nREPORTE: ${JSON.stringify(report)}`
        }]
      }],
      config: {
        systemInstruction
      }
    });

    return response.text || "No se pudo generar una respuesta.";
  } catch (error) {
    console.error("Chat with report error:", error);
    return "Error analizando el reporte con IA.";
  }
};

export const chatWithAdvisor = async (
  question: string, 
  history: ChatMessage[],
  botStatus: any,
  onAction?: (action: string, data: any) => void
): Promise<string> => {
  try {
    const ai = getAI();
    const systemInstruction = `Eres el Consultor IA de Numora. Bot Status: ${JSON.stringify(botStatus)}.`;
    
    const contents = history.map(h => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }]
    }));
    
    contents.push({
      role: "user",
      parts: [{ text: question }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents,
      config: {
        systemInstruction
      }
    });

    return response.text || "Operación procesada.";
  } catch (error) {
    console.error("Advisor chat error:", error);
    return "Error en la consulta al asesor.";
  }
};

export const researchCompany = async (companyName: string): Promise<Partial<Report>> => {
  try {
    const ai = getAI();
    const prompt = `Analiza profundamente a ${companyName}.
    Responde ÚNICAMENTE con un JSON estrictamente con esta estructura:
    {
      "ticker": "TICKER",
      "companyName": "Nombre completo",
      "period": "2024",
      "sector": "Sector de la empresa",
      "liquidez": 1.5,
      "apalancamiento": 2.1,
      "rentabilidad": 15.2,
      "margenEbitda": 22.5,
      "riesgoSintetico": 4,
      "benchmark": {
        "avgLiquidez": 1.4,
        "avgApalancamiento": 2.0,
        "avgMargenEbitda": 20.0
      },
      "historicalData": [
        { "date": "2023-Q1", "revenue": 1000, "ebitda": 200, "netIncome": 150 }
      ],
      "mlPredictions": [
        { "metric": "Revenue", "currentValue": 1000, "predictedValue": 1100, "confidence": 85, "trend": "UP" }
      ],
      "investmentRecommendation": {
        "verdict": "COMPRA",
        "score": 85,
        "justification": "Justificación clara"
      },
      "analysis": "# Análisis profundo en Markdown"
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" }
    });

    const parsedResult = safeJsonParse(response.text || "{}");
    
    return {
      fileName: "IA Research Request",
      companyName: parsedResult.companyName || companyName,
      ticker: parsedResult.ticker || "N/A",
      period: parsedResult.period || "2024",
      sector: parsedResult.sector || "Unknown",
      data: {
        liquidez: parsedResult.liquidez || 1.5,
        apalancamiento: parsedResult.apalancamiento || 2.1,
        rentabilidad: parsedResult.rentabilidad || 15.2,
        margenEbitda: parsedResult.margenEbitda || 22.5,
        riesgoSintetico: parsedResult.riesgoSintetico || 4
      },
      benchmark: {
        avgLiquidez: parsedResult.benchmark?.avgLiquidez || 1.4,
        avgApalancamiento: parsedResult.benchmark?.avgApalancamiento || 2.0,
        avgMargenEbitda: parsedResult.benchmark?.avgMargenEbitda || 20.0
      },
      historicalData: parsedResult.historicalData || [],
      mlPredictions: parsedResult.mlPredictions || [],
      investmentRecommendation: parsedResult.investmentRecommendation || { verdict: "MANTENER", score: 60, justification: "Resultados estables." },
      analysis: parsedResult.analysis || "# Análisis Generado",
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Research error:", error);
    throw error;
  }
};

export const analyzeFinancialReport = async (fileBase64: string, mimeType: string, fileName: string): Promise<Partial<Report>> => {
  try {
    const prompt = `Analiza este reporte financiero (PDF o imagen). 
    Responde ÚNICAMENTE con un JSON estrictamente con esta estructura:
    {
      "ticker": "TICKER",
      "companyName": "Nombre",
      "period": "Q3 2024",
      "sector": "Sector",
      "liquidez": 1.5,
      "apalancamiento": 2.1,
      "rentabilidad": 15.2,
      "margenEbitda": 22.5,
      "riesgoSintetico": 4,
      "benchmark": {
        "avgLiquidez": 1.4,
        "avgApalancamiento": 2.0,
        "avgMargenEbitda": 20.0
      },
      "historicalData": [
        { "date": "2023", "revenue": 1000, "ebitda": 200, "netIncome": 150 }
      ],
      "mlPredictions": [
        { "metric": "Forward EPS", "currentValue": 5.2, "predictedValue": 5.8, "confidence": 90, "trend": "UP" }
      ],
      "investmentRecommendation": {
        "verdict": "COMPRA",
        "score": 88,
        "justification": "Basado en fundamentos sólidos."
      },
      "analysis": "# Análisis del Reporte\nContenido..."
    }`;

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{
        role: "user",
        parts: [
          { text: prompt },
          { inlineData: { data: fileBase64, mimeType } }
        ]
      }],
      config: { responseMimeType: "application/json" }
    });

    const parsedResult = safeJsonParse(response.text || "{}");
    
    return {
      fileName,
      companyName: parsedResult.companyName || "Analizada",
      ticker: parsedResult.ticker || "N/A",
      period: parsedResult.period || "Periodo Reportado",
      sector: parsedResult.sector || "Sector",
      data: {
        liquidez: parsedResult.liquidez || 0,
        apalancamiento: parsedResult.apalancamiento || 0,
        rentabilidad: parsedResult.rentabilidad || 0,
        margenEbitda: parsedResult.margenEbitda || 0,
        riesgoSintetico: parsedResult.riesgoSintetico || 5
      },
      benchmark: {
        avgLiquidez: parsedResult.benchmark?.avgLiquidez || 0,
        avgApalancamiento: parsedResult.benchmark?.avgApalancamiento || 0,
        avgMargenEbitda: parsedResult.benchmark?.avgMargenEbitda || 0
      },
      historicalData: parsedResult.historicalData || [],
      mlPredictions: parsedResult.mlPredictions || [],
      investmentRecommendation: parsedResult.investmentRecommendation || { verdict: "MANTENER", score: 50, justification: "Análisis completado." },
      analysis: parsedResult.analysis || "# Resultados del Análisis",
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Analyze report error:", error);
    throw error;
  }
};

export const battleStocks = async (tickers: string[]): Promise<any> => {
  try {
    const prompt = `Battle Mode entre ${tickers.join(' vs ')}. Compara métricas, futuro y técnico. 
    Responde SOLO con un JSON estrictamente con esta estructura:
    {
      "winner": "TICKER_DEL_GANADOR",
      "victoryMargin": "Descripción corta",
      "battleNarrative": "Resumen de la batalla",
      "technicalVerdict": "Análisis técnico final",
      "competitors": [
        {
          "ticker": "TICKER",
          "score": 85,
          "pros": ["fortaleza 1", "fortaleza 2"],
          "cons": ["debilidad 1"]
        }
      ]
    }`;

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" }
    });

    return safeJsonParse(response.text || "{}");
  } catch (error) {
    console.error("Battle error:", error);
    throw error;
  }
};

export const saveReport = async (userId: string, reportData: Partial<Report>) => {
  const path = `users/${userId}/reports`;
  const cleanData = JSON.parse(JSON.stringify({
    ...reportData,
    userId,
    createdAt: reportData.createdAt || new Date().toISOString()
  }));

  try {
    const docRef = await addDoc(collection(db, path), cleanData);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const getReports = (userId: string, callback: (reports: Report[]) => void) => {
  const path = `users/${userId}/reports`;
  const q = query(collection(db, path), orderBy("createdAt", "desc"));
  
  return onSnapshot(q, (snapshot) => {
    const reports = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Report));
    callback(reports);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
};
