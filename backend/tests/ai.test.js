const test = require("node:test");
const assert = require("node:assert/strict");

process.env.MONGODB_URI ||= "mongodb://127.0.0.1:27017/opportunityx-test";
process.env.JWT_SECRET ||= "test-only-secret";

const serviceModules = [
  "../src/config/env",
  "../src/services/ai.service",
  "../src/services/ai.gemini.provider",
  "../src/services/ai.openrouter.provider",
  "../src/services/ai.groq.provider",
  "../src/services/ai.openai.provider",
  "../src/services/ai.provider-error",
];

const loadAiService = (overrides = {}) => {
  Object.assign(process.env, {
    AI_PROVIDER: "gemini",
    AI_FALLBACK_PROVIDERS: "openrouter,groq,openai",
    AI_MODEL: "gemini-1.5-flash",
    GEMINI_API_KEY: "replace_with_gemini_api_key",
    OPENROUTER_API_KEY: "replace_with_openrouter_api_key",
    OPENROUTER_MODEL: "deepseek/deepseek-chat",
    GROQ_API_KEY: "replace_with_groq_api_key",
    GROQ_MODEL: "llama-3.1-8b-instant",
    OPENAI_API_KEY: "replace_with_openai_api_key",
    OPENAI_MODEL: "gpt-4.1-mini",
    ...overrides,
  });
  for (const modulePath of serviceModules) {
    delete require.cache[require.resolve(modulePath)];
  }
  return require("../src/services/ai.service");
};

const rateLimit = require("../src/middlewares/rate-limit.middleware");

test("AI service returns a friendly fallback when no provider keys are configured", async () => {
  const { callProvider } = loadAiService({
    AI_PROVIDER: "gemini",
    AI_FALLBACK_PROVIDERS: "openrouter,groq,openai",
  });

  const result = await callProvider({ system: "system", user: "hello" });
  assert.equal(result.unavailable, true);
  assert.equal(result.fallback, true);
  assert.equal(result.provider, null);
  assert.equal(result.message, "AI helper is temporarily unavailable. Please try again later.");
});

test("AI service falls back to the next provider when primary quota fails", async () => {
  const originalFetch = global.fetch;
  const calls = [];
  global.fetch = async (url) => {
    calls.push(String(url));
    if (String(url).includes("generativelanguage")) {
      return {
        ok: false,
        status: 429,
        json: async () => ({ error: { message: "quota exceeded" } }),
      };
    }
    return {
      ok: true,
      status: 200,
      json: async () => ({ choices: [{ message: { content: "Fallback provider response" } }] }),
    };
  };

  try {
    const { callProvider } = loadAiService({
      AI_PROVIDER: "gemini",
      AI_FALLBACK_PROVIDERS: "groq",
      GEMINI_API_KEY: "test-gemini-key",
      GROQ_API_KEY: "test-groq-key",
    });

    const result = await callProvider({ system: "system", user: "hello" });
    assert.equal(result.unavailable, false);
    assert.equal(result.provider, "groq");
    assert.equal(result.text, "Fallback provider response");
    assert.equal(calls.length, 2);
  } finally {
    global.fetch = originalFetch;
  }
});

test("AI service returns quota fallback when every attempted provider is rate limited", async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: false,
    status: 429,
    json: async () => ({ error: { message: "rate limit exceeded" } }),
  });

  try {
    const { callProvider } = loadAiService({
      AI_PROVIDER: "gemini",
      AI_FALLBACK_PROVIDERS: "groq",
      GEMINI_API_KEY: "test-gemini-key",
      GROQ_API_KEY: "test-groq-key",
    });

    const result = await callProvider({ system: "system", user: "hello" });
    assert.equal(result.unavailable, true);
    assert.equal(result.category, "quota_or_rate_limit");
    assert.equal(result.message, "Free AI quota is currently unavailable. Please try again later or switch provider.");
  } finally {
    global.fetch = originalFetch;
  }
});

test("rate limiter blocks requests over the configured maximum", async () => {
  const limiter = rateLimit({ windowMs: 60000, max: 1, keyPrefix: `test-${Date.now()}` });
  const req = { ip: "127.0.0.1" };
  const first = await new Promise((resolve) => limiter(req, {}, () => resolve("next")));
  assert.equal(first, "next");

  let statusCode = 0;
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(payload) {
      return payload;
    },
  };
  limiter(req, res, () => undefined);
  assert.equal(statusCode, 429);
});
