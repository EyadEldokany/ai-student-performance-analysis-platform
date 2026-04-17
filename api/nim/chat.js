const NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;

  if (!NVIDIA_API_KEY) {
    return res
      .status(500)
      .json({ error: "NVIDIA API key is not configured on the server." });
  }

  const { messages, model, temperature, max_tokens, top_p } = req.body ?? {};

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
        error:
          data?.error?.message ||
          data?.message ||
          "NVIDIA API request failed.",
        details: data,
      });
    }

    return res.json(data);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to reach NVIDIA API.",
      details:
        error instanceof Error ? error.message : "Unknown server error",
    });
  }
}
