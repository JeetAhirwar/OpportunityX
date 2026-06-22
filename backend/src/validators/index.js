const { body, param, query, validationResult } = require("express-validator");

/**
 * Runs validation result check — attach after validation chains
 */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ──────────────────────────────────────────
// Auth validators
// ──────────────────────────────────────────
const registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 100 }),
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("role")
    .optional()
    .isIn(["candidate", "recruiter"])
    .withMessage("Role must be candidate or recruiter"),
  handleValidation,
];

const loginRules = [
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidation,
];

// ──────────────────────────────────────────
// Job validators
// ──────────────────────────────────────────
const createJobRules = [
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 200 }),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("company").trim().notEmpty().withMessage("Company is required"),
  body("location").trim().notEmpty().withMessage("Location is required"),
  body("jobType")
    .optional()
    .isIn(["full-time", "part-time", "contract", "internship"]),
  body("experienceLevel")
    .optional()
    .isIn(["junior", "mid", "senior", "lead"]),
  body("workMode")
    .optional()
    .isIn(["remote", "hybrid", "onsite"]),
  body("salary.min").optional().isNumeric().withMessage("Salary min must be a number"),
  body("salary.max").optional().isNumeric().withMessage("Salary max must be a number"),
  handleValidation,
];

// ──────────────────────────────────────────
// Application validators
// ──────────────────────────────────────────
const applyRules = [
  param("jobId").isMongoId().withMessage("Invalid job ID"),
  body("coverLetter")
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage("Cover letter must be under 5000 characters"),
  handleValidation,
];

const updateStatusRules = [
  param("id").isMongoId().withMessage("Invalid application ID"),
  body("status")
    .isIn(["reviewed", "shortlisted", "interview", "offer", "rejected"])
    .withMessage("Invalid status"),
  handleValidation,
];

// ──────────────────────────────────────────
// Profile validators
// ──────────────────────────────────────────
const profileRules = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ min: 2, max: 100 }),
  body("phone").matches(/^[0-9]{10}$/).withMessage("Enter valid 10-digit phone number"),
  body("location").trim().notEmpty().withMessage("Location is required"),
  body("bio").trim().isLength({ min: 20 }).withMessage("Bio must be at least 20 characters"),
  body("skills").isArray({ min: 1 }).withMessage("At least one skill is required"),
  handleValidation,
];

// ──────────────────────────────────────────
// Admin validators
// ──────────────────────────────────────────
const updateRoleRules = [
  param("id").isMongoId().withMessage("Invalid user ID"),
  body("role")
    .isIn(["candidate", "recruiter", "admin"])
    .withMessage("Invalid role"),
  handleValidation,
];

const mongoIdParam = [
  param("id").isMongoId().withMessage("Invalid ID"),
  handleValidation,
];

module.exports = {
  registerRules,
  loginRules,
  createJobRules,
  applyRules,
  updateStatusRules,
  profileRules,
  updateRoleRules,
  mongoIdParam,
  handleValidation,
};
