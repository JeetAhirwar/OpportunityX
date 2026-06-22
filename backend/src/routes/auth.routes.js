const express = require("express");
const router = express.Router();
const {
  register,
  login,
  me,
  logout,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.controller");
const { protect } = require("../middlewares/auth.middleware");
const {
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
} = require("../validators");

router.post("/register", registerRules, register);
router.post("/login", loginRules, login);
router.get("/me", protect, me);
router.post("/logout", protect, logout);
router.post("/forgot-password", forgotPasswordRules, forgotPassword);
router.post("/reset-password", resetPasswordRules, resetPassword);

module.exports = router;

