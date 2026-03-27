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

    if (settings?.useDirectClaude) {
      console.log("[AI] Using Direct Claude Mode (Browser Fetch)");
      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "dangerously-allow-browser": "true" // This is for the SDK, but we're using fetch
          },
          body: JSON.stringify({
            model: settings?.claudeModel || "claude-3-5-sonnet-20241022",
            max_tokens: maxTokens,
            system: systemInstruction,
            messages: messages.map(m => ({
              role: m.role === "user" ? "user" : "assistant",
              content: m.content
            })),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || "Error calling Anthropic API directly");
        }

        const data = await response.json();
        return data.content[0].text || "";
      } catch (error: any) {
        console.error("[AI] Direct Claude Error:", error);
        throw new Error(`Error de Claude (Directo): ${error.message || "Error de CORS o red"}. El modo directo suele fallar en navegadores por seguridad. Usa el modo normal (Proxy).`);
      }
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
          model: settings?.claudeModel,
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
