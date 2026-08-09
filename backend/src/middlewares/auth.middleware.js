const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const env = require("../config/env");
const tokenService = require("../services/token.service");
const { authorize } = require("./role.middleware");

const extractToken = (req) => {
  const authorization = req.headers.authorization;
  return authorization?.startsWith("Bearer ")
    ? authorization.split(" ")[1]
    : null;
};

const loadUser = async (decoded) => {
  const user = await User.findById(decoded.id).select("-password");
  if (!user) return null;
  if (!user.isActive) return null;
  if (Number(decoded.tv || 0) !== Number(user.tokenVersion || 0)) return null;
  return user;
};

const protect = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, env.jwtSecret);

    if (await tokenService.isTokenRevoked(token)) {
      return res.status(401).json({ success: false, message: "Not authorized, session revoked" });
    }

    const user = await loadUser(decoded);
    if (!user) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (token) {
      const decoded = jwt.verify(token, env.jwtSecret);
      if (!(await tokenService.isTokenRevoked(token))) {
        const user = await loadUser(decoded);
        if (user) req.user = user;
      }
    }
  } catch {
    // Invalid or expired token: treat request as anonymous.
  }
  return next();
};

module.exports = { authorize, extractToken, optionalAuth, protect };
