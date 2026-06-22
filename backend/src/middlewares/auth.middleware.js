const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const env = require("../config/env");
const { authorize } = require("./role.middleware");

const protect = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    const token = authorization?.startsWith("Bearer ")
      ? authorization.split(" ")[1]
      : null;

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, env.jwtSecret);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ success: false, message: "User no longer exists" });
    }
    if (!req.user.isActive) {
      return res.status(401).json({ success: false, message: "Account is inactive" });
    }

    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }
};

module.exports = { protect, authorize };
