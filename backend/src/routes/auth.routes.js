const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/auth.controller");
const { registerRules, loginRules } = require("../validators");

router.post("/register", registerRules, register);
router.post("/login", loginRules, login);

module.exports = router;

