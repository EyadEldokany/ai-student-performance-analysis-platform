import cors from "cors";
import express from "express";

const app = express();
const PORT = process.env.PORT || 3001;
const NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const NVIDIA_API_KEY =
  process.env.NVIDIA_API_KEY ||
  "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";

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    aiConfigured: Boolean(NVIDIA_API_KEY),
  });
});

app.post("/api/nim/chat", async (req, res) => {
  const { messages, model, temperature, max_tokens, top_p } = req.body ?? {};

  if (!NVIDIA_API_KEY || typeof NVIDIA_API_KEY !== "string") {
    return res.status(500).json({ error: "NVIDIA API key is not configured on the server." });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Messages array is required." });
  }

  try {
    const response = await fetch(NVIDIA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${NVIDIA_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
        top_p,
      }),
    });

    const rawText = await response.text();
    let data = null;

    try {
      data = rawText ? JSON.parse(rawText) : null;
    } catch {
      data = { raw: rawText };
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || data?.message || "NVIDIA API request failed.",
        details: data,
      });
    }

    return res.json(data);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to reach NVIDIA API.",
      details: error instanceof Error ? error.message : "Unknown server error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`NVIDIA proxy server listening on http://localhost:${PORT}`);
});
