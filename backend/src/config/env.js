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
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
});
