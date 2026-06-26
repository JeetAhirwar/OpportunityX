const test = require("node:test");
const assert = require("node:assert/strict");

process.env.MONGODB_URI ||= "mongodb://127.0.0.1:27017/opportunityx-test";
process.env.JWT_SECRET ||= "test-only-secret";
process.env.OPENAI_API_KEY = "replace_with_openai_api_key";

const { callProvider } = require("../src/services/ai.service");
const rateLimit = require("../src/middlewares/rate-limit.middleware");

test("AI service returns unavailable when OPENAI_API_KEY is missing", async () => {
  const result = await callProvider({ system: "system", user: "hello" });
  assert.equal(result.unavailable, true);
  assert.match(result.message, /OPENAI_API_KEY/);
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
