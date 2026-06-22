const jwt = require("jsonwebtoken");
const env = require("../config/env");
const User = require("../models/user.model");

module.exports = async (socket, next) => {
  try {
    // Browser clients pass the same OpportunityX JWT through socket.auth.token.
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Unauthorized"));
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(decoded.id).select("-password");
    if (!user || !user.isActive) return next(new Error("Unauthorized"));
    socket.user = user;
    next();
  } catch {
    next(new Error("Invalid token"));
  }
};
