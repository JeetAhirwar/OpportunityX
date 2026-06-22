const jwt = require("jsonwebtoken");
const env = require("../config/env");

module.exports = (id) =>
  jwt.sign({ id }, env.jwtSecret, { expiresIn: env.accessTokenExpiry });
