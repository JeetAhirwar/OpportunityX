const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/auth.middleware");
const { applyRules, updateStatusRules } = require("../validators");
const { apply, getMyApplications, getApplicants, getRecruiterApplicants, updateStatus, withdraw } = require("../controllers/application.controller");

router.post("/:jobId/apply", protect, authorize("candidate"), applyRules, apply);
router.get("/me", protect, authorize("candidate"), getMyApplications);
router.get("/recruiter", protect, authorize("recruiter"), getRecruiterApplicants);
router.get("/job/:jobId", protect, authorize("recruiter"), getApplicants);
router.patch("/:id/status", protect, authorize("recruiter"), updateStatusRules, updateStatus);
router.patch("/:id/withdraw", protect, authorize("candidate"), withdraw);

module.exports = router;

