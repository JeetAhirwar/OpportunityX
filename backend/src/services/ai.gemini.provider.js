const env = require("../config/env");
const { ProviderError, classifyProviderError, parseProviderJson } = require("./ai.provider-error");

const name = "gemini";

const configured = () => Boolean(env.geminiApiKey);
const model = () => env.geminiModel || "gemini-1.5-flash";

const generate = async ({ systemPrompt, userPrompt, temperature = 0.4, maxTokens = 800, jsonMode = false }) => {
  if (!configured()) throw new ProviderError("Gemini API key is not configured", "missing_key", 503);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model())}:generateContent?key=${encodeURIComponent(env.geminiApiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
          ...(jsonMode ? { responseMimeType: "application/json" } : {}),
        },
      }),
    }
  );

  const data = await parseProviderJson(response);
  if (!response.ok) {
    const message = data?.error?.message || "Gemini request failed";
    throw new ProviderError(message, classifyProviderError(response.status, message), response.status);
  }

  const text = (data?.candidates?.[0]?.content?.parts || [])
    .map((part) => part.text || "")
    .join("\n")
    .trim();

  if (!text) throw new ProviderError("Gemini returned an empty response", "malformed_response", 502);
  return { provider: name, model: model(), text };
};

module.exports = {
  name,
  configured,
  generate,
};
