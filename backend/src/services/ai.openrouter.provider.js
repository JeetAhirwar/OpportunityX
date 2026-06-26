const env = require("../config/env");
const { ProviderError, classifyProviderError, parseProviderJson } = require("./ai.provider-error");

const name = "openrouter";

const configured = () => Boolean(env.openrouterApiKey);
const model = () => env.openrouterModel || "deepseek/deepseek-chat";

const generate = async ({ systemPrompt, userPrompt, temperature = 0.4, maxTokens = 800, jsonMode = false }) => {
  if (!configured()) throw new ProviderError("OpenRouter API key is not configured", "missing_key", 503);

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.openrouterApiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": env.clientUrl,
      "X-Title": "OpportunityX",
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
    const message = data?.error?.message || "OpenRouter request failed";
    throw new ProviderError(message, classifyProviderError(response.status, message), response.status);
  }

  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new ProviderError("OpenRouter returned an empty response", "malformed_response", 502);
  return { provider: name, model: model(), text };
};

module.exports = {
  name,
  configured,
  generate,
};
