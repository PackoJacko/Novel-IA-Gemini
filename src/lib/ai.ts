import { GoogleGenAI } from "@google/genai";
import Anthropic from "@anthropic-ai/sdk";
import { AISettings } from "../types";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

export async function callAI(
  messages: { role: string; content: string }[], 
  systemInstruction = "", 
  maxTokens = 2000,
  settings?: AISettings
) {
  const provider = settings?.provider || 'gemini';
  
  if (provider === 'claude') {
    const apiKey = settings?.claudeApiKey || import.meta.env.VITE_CLAUDE_API_KEY;
    if (!apiKey) {
      throw new Error("Claude API Key is missing. Please add it in the book settings.");
    }

    const anthropic = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true // Since we are calling from the frontend
    });

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: maxTokens,
      system: systemInstruction,
      messages: messages.map(m => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content
      })) as any,
    });

    // Extract text content
    const text = response.content
      .filter(c => c.type === 'text')
      .map(c => (c as any).text)
      .join('\n');

    return text || "";
  } else {
    // Default to Gemini
    if (!GEMINI_API_KEY) {
      throw new Error("Gemini API Key is missing.");
    }

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
  }
}
