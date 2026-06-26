const env = require("../config/env");

const MAX_TEXT = 6000;

const sanitizeText = (value, max = MAX_TEXT) =>
  String(value || "")
    .replace(/(password|token|secret|api[_-]?key)\s*[:=]\s*\S+/gi, "$1: [redacted]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

const unavailable = () => ({
  unavailable: true,
  message: "AI is unavailable because OPENAI_API_KEY is not configured on the backend.",
});

const extractText = (data) => {
  if (typeof data?.output_text === "string") return data.output_text;
  const output = Array.isArray(data?.output) ? data.output : [];
  return output
    .flatMap((item) => Array.isArray(item.content) ? item.content : [])
    .map((part) => part.text || "")
    .join("\n")
    .trim();
};

const parseJson = (text, fallback) => {
  try {
    const trimmed = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    return JSON.parse(trimmed);
  } catch {
    return fallback(text);
  }
};

const callProvider = async ({ system, user }) => {
  if (!env.openaiApiKey) return unavailable();

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.aiModel,
      input: [
        { role: "system", content: sanitizeText(system, 2000) },
        { role: "user", content: sanitizeText(user) },
      ],
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.error?.message || "AI provider request failed");
    error.statusCode = response.status >= 500 ? 502 : response.status;
    throw error;
  }

  return { unavailable: false, text: extractText(data) };
};

const jsonPrompt = async (prompt, fallback) => {
  const result = await callProvider({
    system: "You are OpportunityX hiring intelligence. Return concise, valid JSON only. Do not include secrets, sensitive private data, or unsupported claims.",
    user: prompt,
  });
  if (result.unavailable) return result;
  return parseJson(result.text, fallback);
};

module.exports = {
  callProvider,
  jsonPrompt,
  sanitizeText,
  unavailable,
};
