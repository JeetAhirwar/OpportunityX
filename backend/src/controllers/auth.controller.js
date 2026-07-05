const crypto = require("crypto");
const User = require("../models/user.model");
const generateToken = require("../utils/generateToken");
const env = require("../config/env");
const emailService = require("../services/email.service");
const notificationService = require("../services/notification.service");
const { TYPES } = notificationService;
const { EMAIL_TYPES } = emailService;

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
    emailService.send({
      to: user.email,
      type: EMAIL_TYPES.AUTH_WELCOME,
      data: { name: user.name },
      dedupeKey: `welcome:${user._id}`,
    });
    emailService.send({
      to: user.email,
      type: role === "recruiter" ? EMAIL_TYPES.RECRUITER_REGISTERED : EMAIL_TYPES.CANDIDATE_REGISTRATION_SUCCESSFUL,
      data: { name: user.name },
      dedupeKey: `registration:${user._id}:${role}`,
    });
    if (role === "recruiter") {
      await notificationService.notifyAdmins({
        io: req.app.get("io"),
        sender: user._id,
        type: TYPES.RECRUITER_REGISTERED,
        title: "New Recruiter Registration",
        message: `${user.name} registered as a recruiter and may need verification review.`,
        entityType: "user",
        entityId: user._id,
        link: "/admin/approvals",
        priority: "high",
        dedupeKey: `recruiter-registered:${user._id}`,
      });
      await emailService.sendToAdmins({
        type: EMAIL_TYPES.ADMIN_NEW_RECRUITER_REGISTERED,
        data: { recruiterName: user.name, recruiterEmail: user.email },
        dedupeKey: `admin-new-recruiter:${user._id}`,
      });
    }
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
        await emailService.sendPasswordResetEmail({
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
    emailService.send({
      to: user.email,
      type: EMAIL_TYPES.AUTH_RESET_PASSWORD,
      data: { name: user.name },
      dedupeKey: `password-reset:${user._id}:${Date.now()}`,
    });

    return res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Unable to reset password" });
  }
};

exports.safeUser = safeUser;
