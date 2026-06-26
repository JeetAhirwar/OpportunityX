const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const required = (name, legacyName) => {
  const value = process.env[name] || (legacyName && process.env[legacyName]);
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

module.exports = Object.freeze({
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 8000),
  mongodbUri: required("MONGODB_URI", "MONGO_URI"),
  jwtSecret: required("JWT_SECRET"),
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || "7d",
  corsOrigins: (process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:8080")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  clientUrl: process.env.CLIENT_URL || "http://localhost:8080",
  smtp: Object.freeze({
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  }),
  emailFrom: process.env.EMAIL_FROM || "OpportunityX <no-reply@opportunityx.local>",
  aiProvider: process.env.AI_PROVIDER || "gemini",
  aiFallbackProviders: (process.env.AI_FALLBACK_PROVIDERS || "openrouter,groq,openai")
    .split(",")
    .map((provider) => provider.trim().toLowerCase())
    .filter(Boolean),
  aiDailyLimitPerUser: Number(process.env.AI_DAILY_LIMIT_PER_USER || 50),
  geminiApiKey: /^replace_/i.test(process.env.GEMINI_API_KEY || "") ? "" : process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.AI_MODEL || process.env.GEMINI_MODEL || "gemini-1.5-flash",
  openrouterApiKey: /^replace_/i.test(process.env.OPENROUTER_API_KEY || "") ? "" : process.env.OPENROUTER_API_KEY || "",
  openrouterModel: process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat",
  groqApiKey: /^replace_/i.test(process.env.GROQ_API_KEY || "") ? "" : process.env.GROQ_API_KEY || "",
  groqModel: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
  openaiApiKey: /^replace_/i.test(process.env.OPENAI_API_KEY || "") ? "" : process.env.OPENAI_API_KEY || "",
  openaiModel: process.env.OPENAI_MODEL || "gpt-4.1-mini",
  aiModel: process.env.AI_MODEL || "gemini-1.5-flash",
  socketCorsOrigins: (process.env.SOCKET_CORS_ORIGIN || process.env.CORS_ORIGIN || "http://localhost:8080")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
});
