const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const TokenBlacklist = require("../models/token-blacklist.model");
const env = require("../config/env");

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const revokeToken = async (token) => {
  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    await TokenBlacklist.create({
      tokenHash: hashToken(token),
      expiresAt: new Date(decoded.exp * 1000),
    });
  } catch {
    // Token is already invalid or expired; nothing to revoke.
  }
};

const isTokenRevoked = async (token) =>
  Boolean(await TokenBlacklist.exists({ tokenHash: hashToken(token) }));

module.exports = {
  hashToken,
  isTokenRevoked,
  revokeToken,
};
