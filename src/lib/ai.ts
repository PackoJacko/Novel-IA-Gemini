import { GoogleGenAI } from "@google/genai";
import { AISettings } from "../types";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

export async function callAI(
  messages: { role: string; content: string }[], 
  systemInstruction = "", 
  maxTokens = 2000,
  settings?: AISettings
) {
  const provider = settings?.provider || 'gemini';
  console.log(`[AI] Calling ${provider}...`, { systemInstruction, maxTokens });
  
  if (provider === 'claude') {
    const apiKey = settings?.claudeApiKey || import.meta.env.VITE_CLAUDE_API_KEY;
    if (!apiKey) {
      throw new Error("Claude API Key is missing. Please add it in the settings modal.");
    }

    try {
      const response = await fetch("/api/ai/claude", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages,
          systemInstruction,
          maxTokens,
          apiKey,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error calling Claude API via server proxy");
      }

      const data = await response.json();
      return data.text || "";
    } catch (error: any) {
      console.error("[AI] Claude Proxy Error:", error);
      throw new Error(`Error de Claude (Proxy): ${error.message || "Error desconocido"}`);
    }
  } else {
    // Default to Gemini
    if (!GEMINI_API_KEY) {
      throw new Error("Gemini API Key is missing.");
    }

    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      
      const contents = messages.map(m => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents,
        config: {
          systemInstruction,
          maxOutputTokens: maxTokens,
        },
      });

      return response.text || "";
    } catch (error: any) {
      console.error("[AI] Gemini Error:", error);
      throw new Error(`Error de Gemini: ${error.message || "Error desconocido"}`);
    }
  }
}
