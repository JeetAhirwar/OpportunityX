const env = require("../config/env");
const gemini = require("./ai.gemini.provider");
const openrouter = require("./ai.openrouter.provider");
const groq = require("./ai.groq.provider");
const openai = require("./ai.openai.provider");

const MAX_TEXT = 6000;
const PROVIDERS = {
  gemini,
  openrouter,
  groq,
  openai,
};

const FRIENDLY_UNAVAILABLE = "AI helper is temporarily unavailable. Please try again later.";
const FRIENDLY_QUOTA = "Free AI quota is currently unavailable. Please try again later or switch provider.";

const sanitizeText = (value, max = MAX_TEXT) =>
  String(value || "")
    .replace(/(password|token|secret|api[_-]?key)\s*[:=]\s*\S+/gi, "$1: [redacted]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

const providerOrder = () => {
  const configured = [env.aiProvider, ...env.aiFallbackProviders]
    .map((provider) => String(provider || "").trim().toLowerCase())
    .filter(Boolean);
  return [...new Set(configured)].filter((provider) => PROVIDERS[provider]);
};

const unavailable = (message = FRIENDLY_UNAVAILABLE, category = "provider_unavailable") => ({
  success: false,
  unavailable: true,
  fallback: true,
  provider: null,
  message,
  category,
});

const cleanJsonText = (text) => {
  const trimmed = String(text || "").trim();
  const withoutFence = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  const firstObject = withoutFence.indexOf("{");
  const lastObject = withoutFence.lastIndexOf("}");
  const firstArray = withoutFence.indexOf("[");
  const lastArray = withoutFence.lastIndexOf("]");

  if (firstObject >= 0 && lastObject > firstObject) return withoutFence.slice(firstObject, lastObject + 1);
  if (firstArray >= 0 && lastArray > firstArray) return withoutFence.slice(firstArray, lastArray + 1);
  return withoutFence;
};

const parseJson = (text, fallback) => {
  try {
    return JSON.parse(cleanJsonText(text));
  } catch {
    const parsedFallback = fallback(text);
    return {
      ...parsedFallback,
      limitations: [
        ...(Array.isArray(parsedFallback.limitations) ? parsedFallback.limitations : []),
        "AI returned a non-JSON response; OpportunityX used a structured fallback.",
      ],
    };
  }
};

const safeLogProviderFailure = (provider, error) => {
  const category = error?.category || "provider_error";
  console.warn(`AI provider failed: provider=${provider} category=${category}`);
};

const generateAIResponse = async ({
  systemPrompt,
  userPrompt,
  temperature = 0.4,
  maxTokens = 800,
  jsonMode = false,
  metadata = {},
}) => {
  const system = sanitizeText(systemPrompt, 2500);
  const user = sanitizeText(userPrompt);
  const failures = [];

  for (const providerName of providerOrder()) {
    const provider = PROVIDERS[providerName];
    try {
      const result = await provider.generate({
        systemPrompt: system,
        userPrompt: user,
        temperature,
        maxTokens,
        jsonMode,
        metadata,
      });
      return {
        success: true,
        provider: result.provider,
        model: result.model,
        text: result.text,
      };
    } catch (error) {
      const category = error?.category || "provider_error";
      failures.push({ provider: providerName, category });
      safeLogProviderFailure(providerName, error);
    }
  }

  const quotaFailed = failures.some((failure) => failure.category === "quota_or_rate_limit");
  return unavailable(quotaFailed ? FRIENDLY_QUOTA : FRIENDLY_UNAVAILABLE, quotaFailed ? "quota_or_rate_limit" : "provider_unavailable");
};

const callProvider = async ({ system, user, temperature, maxTokens, jsonMode, metadata }) => {
  const result = await generateAIResponse({
    systemPrompt: system,
    userPrompt: user,
    temperature,
    maxTokens,
    jsonMode,
    metadata,
  });
  if (!result.success) return result;
  return {
    unavailable: false,
    provider: result.provider,
    model: result.model,
    text: result.text,
  };
};

const jsonPrompt = async (prompt, fallback) => {
  const result = await generateAIResponse({
    systemPrompt: "You are OpportunityX hiring intelligence. Return concise, valid JSON only. Do not include secrets, sensitive private data, or unsupported claims.",
    userPrompt: prompt,
    temperature: 0.25,
    maxTokens: 1200,
    jsonMode: true,
  });
  if (!result.success) return result;
  return parseJson(result.text, fallback);
};

module.exports = {
  callProvider,
  generateAIResponse,
  jsonPrompt,
  parseJson,
  sanitizeText,
  unavailable,
  FRIENDLY_UNAVAILABLE,
  FRIENDLY_QUOTA,
};
