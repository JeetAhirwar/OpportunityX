const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { applyRules, updateStatusRules } = require("../middleware/validate");
const { apply, getMyApplications, getApplicants, updateStatus, withdraw } = require("../controllers/applicationController");

router.post("/:jobId/apply", protect, authorize("candidate"), applyRules, apply);
router.get("/me", protect, authorize("candidate"), getMyApplications);
router.get("/job/:jobId", protect, authorize("recruiter"), getApplicants);
router.patch("/:id/status", protect, authorize("recruiter"), updateStatusRules, updateStatus);
router.patch("/:id/withdraw", protect, authorize("candidate"), withdraw);

module.exports = router;
