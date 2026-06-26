const env = require("../config/env");
const { ProviderError, classifyProviderError, parseProviderJson } = require("./ai.provider-error");

const name = "groq";

const configured = () => Boolean(env.groqApiKey);
const model = () => env.groqModel || "llama-3.1-8b-instant";

const generate = async ({ systemPrompt, userPrompt, temperature = 0.4, maxTokens = 800, jsonMode = false }) => {
  if (!configured()) throw new ProviderError("Groq API key is not configured", "missing_key", 503);

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.groqApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model(),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature,
      max_tokens: maxTokens,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  const data = await parseProviderJson(response);
  if (!response.ok) {
    const message = data?.error?.message || "Groq request failed";
    throw new ProviderError(message, classifyProviderError(response.status, message), response.status);
  }

  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new ProviderError("Groq returned an empty response", "malformed_response", 502);
  return { provider: name, model: model(), text };
};

module.exports = {
  name,
  configured,
  generate,
};
