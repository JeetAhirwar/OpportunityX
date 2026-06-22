const crypto = require("crypto");
const User = require("../models/user.model");
const generateToken = require("../utils/generateToken");
const env = require("../config/env");
const { sendPasswordResetEmail } = require("../services/email.service");

const safeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  isVerified: user.isVerified,
});

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password, role });
    return res.status(201).json({
      token: generateToken(user._id),
      user: safeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: "This account has been deactivated" });
    }

    // Verification is reported but not enforced until OpportunityX has a
    // complete send/verify email flow for existing users.
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    return res.json({
      token: generateToken(user._id),
      user: safeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.me = async (req, res) => {
  return res.json({ user: safeUser(req.user) });
};

exports.logout = async (_req, res) => {
  return res.json({ success: true, message: "Logged out successfully" });
};

exports.forgotPassword = async (req, res) => {
  const genericMessage = "If an account exists for that email, a password reset link has been sent.";
  try {
    const user = await User.findOne({ email: req.body.email })
      .select("+resetPasswordToken +resetPasswordExpires");

    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
      await user.save({ validateBeforeSave: false });

      const resetUrl = `${env.clientUrl.replace(/\/$/, "")}/reset-password/${resetToken}`;
      try {
        await sendPasswordResetEmail({
          email: user.email,
          name: user.name,
          resetUrl,
        });
      } catch (emailError) {
        console.error(`Password reset email failed: ${emailError.message}`);
      }
    }

    return res.json({ success: true, message: genericMessage });
  } catch (error) {
    console.error(`Forgot password failed: ${error.message}`);
    return res.json({ success: true, message: genericMessage });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const tokenHash = crypto.createHash("sha256").update(req.body.token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!user) {
      return res.status(400).json({ message: "Reset token is invalid or has expired" });
    }

    user.password = req.body.password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Unable to reset password" });
  }
};

exports.safeUser = safeUser;
