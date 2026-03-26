import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

export async function callAI(messages: { role: string; content: string }[], systemInstruction = "", maxTokens = 1000) {
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. If you are running this locally or on GitHub/Vercel, ensure you have set VITE_GEMINI_API_KEY in your environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Convert messages to Gemini format
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
}
