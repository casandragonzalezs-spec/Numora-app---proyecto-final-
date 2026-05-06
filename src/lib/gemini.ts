import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

export const getAI = () => {
  if (!aiInstance) {
    // Vite will replace this at build time via the 'define' config
    const apiKey = process.env.GEMINI_API_KEY || "";
    
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing. Check your environment settings.");
    }
    
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};
