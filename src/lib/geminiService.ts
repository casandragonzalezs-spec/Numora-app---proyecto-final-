import { GoogleGenAI } from "@google/genai";

import { getAI } from "./gemini";

export interface NewsArticle {
  source: string;
  time: string;
  title: string;
  category: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  content: string;
  impact: string;
  sentimentScore: number; // 0 to 100
}

export async function generateStockNews(symbol: string): Promise<NewsArticle[]> {
  if (!symbol) return [];

  try {
    const prompt = `Generate EXACTLY 5 realistic and varied financial news articles for the stock symbol ${symbol}. 
    DO NOT return fewer than 5 articles.
    Each article must include:
    - source: (e.g., Bloomberg, Reuters, CNBC, WSJ)
    - time: (e.g., "Hace 5 min", "Hace 1 hora")
    - title: A compelling financial headline in Spanish
    - category: (e.g., Technical, Fundamental, Macro, Regulatory)
    - sentiment: (Positive, Negative, or Neutral)
    - content: A 2-sentence summary of the news in Spanish
    - impact: A brief description of market impact in Spanish
    - sentimentScore: A number from 0 to 100 (where 0 is very negative, 100 is very positive, 50 is neutral)

    Format the output as a JSON array of objects. Respond ONLY with the JSON.`;

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });
    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const cleanedText = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error generating news with Gemini:", error);
    // Fallback static news if Gemini fails
    return [
      {
        source: "Market Intelligence",
        time: "Ahora",
        title: `Análisis técnico para ${symbol} muestra consolidación`,
        category: "Technical",
        sentiment: "Neutral",
        content: `El precio de ${symbol} se mantiene en un rango lateral mientras los traders esperan nuevos catalizadores económicos.`,
        impact: "Neutral - Baja volatilidad esperada",
        sentimentScore: 50
      },
      {
        source: "Reuters",
        time: "Hace 15 min",
        title: `Inversionistas institucionales aumentan posiciones en ${symbol}`,
        category: "Fundamental",
        sentiment: "Positive",
        content: `Informes recientes sugieren un renovado interés de fondos de cobertura en el sector, beneficiando directamente a ${symbol}.`,
        impact: "Positivo - Aumento de liquidez",
        sentimentScore: 75
      },
      {
        source: "Bloomberg",
        time: "Hace 1 hora",
        title: `Perspectivas del sector impactan el desempeño de ${symbol}`,
        category: "Macro",
        sentiment: "Neutral",
        content: `La volatilidad global en los mercados emergentes está influyendo en la cotización de activos como ${symbol}.`,
        impact: "Neutral - Monitoreo de tasas requerido",
        sentimentScore: 48
      },
      {
        source: "CNBC",
        time: "Hace 2 horas",
        title: `Reporte trimestral de ${symbol} supera expectativas`,
        category: "Fundamental",
        sentiment: "Positive",
        content: `La compañía reportó ganancias por acción por encima del consenso, impulsando la confianza de los analistas.`,
        impact: "Alcista - Fuerte soporte en niveles actuales",
        sentimentScore: 82
      },
      {
        source: "WSJ",
        time: "Hace 3 horas",
        title: `Nuevas regulaciones podrían afectar a empresas como ${symbol}`,
        category: "Regulatory",
        sentiment: "Negative",
        content: `El escrutinio gubernamental sobre las prácticas del sector plantea desafíos a corto plazo para el crecimiento.`,
        impact: "Bajista - Riesgo de cumplimiento incrementado",
        sentimentScore: 35
      }
    ];
  }
}
