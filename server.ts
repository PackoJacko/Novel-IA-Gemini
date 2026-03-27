import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import { Anthropic } from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

async function startServer() {
  console.log("[Server] Starting server initialization...");
  try {
    const app = express();
    const PORT = 3000;

    app.use(cors());
    app.use(express.json());

    console.log("[Server] Registering API routes...");

    // Health check
    app.get("/api/health", (req, res) => {
      console.log("[Server] Health check hit");
      res.json({ status: "ok", message: "Server is running", timestamp: new Date().toISOString() });
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
      console.log(`[Server] >>> SUCCESS: Server running on http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error("[Server] >>> CRITICAL ERROR during startup:", err);
    process.exit(1);
  }
}

startServer();
