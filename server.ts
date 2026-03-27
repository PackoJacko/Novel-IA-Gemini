import express from "express";
console.log("[Server] Starting server.ts...");
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  console.log("[Server] Initializing routes...");

  // Health check
  app.get("/api/health", (req, res) => {
    console.log("[Server] Health check requested");
    res.json({ status: "ok", message: "Server is running" });
  });

  // API route for Claude proxy
  app.post("/api/ai/claude", async (req, res) => {
    const { messages, systemInstruction, maxTokens, apiKey, model } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: "Claude API Key is missing." });
    }

    try {
      const anthropic = new Anthropic({
        apiKey,
      });

      const response = await anthropic.messages.create({
        model: model || "claude-3-5-sonnet-latest",
        max_tokens: maxTokens || 2000,
        system: systemInstruction,
        messages: messages.map((m: any) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.content
        })),
      });

      const text = response.content
        .filter(c => c.type === 'text')
        .map(c => (c as any).text)
        .join('\n');

      res.json({ text });
    } catch (error: any) {
      console.error("[Server AI] Claude Error:", error);
      res.status(500).json({ error: error.message || "Error calling Claude API" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
