const jwt = require("jsonwebtoken");
const env = require("../config/env");

module.exports = (user) =>
  jwt.sign(
    {
      id: user._id,
      tv: user.tokenVersion || 0,
      jti: require("crypto").randomUUID(),
    },
    env.jwtSecret,
    { expiresIn: env.accessTokenExpiry }
  );
