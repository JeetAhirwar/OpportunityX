const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { createJobRules } = require("../middleware/validate");
const {
  createJob,
  updateJob,
  deleteJob,
  searchJobs,
  getJobById,
  getMyJobs,
  updateJobStatus,
  getFeaturedJobs,
} = require("../controllers/jobController");

// Public routes
router.get("/", searchJobs);
router.get("/featured", getFeaturedJobs);
router.get("/my", protect, authorize("recruiter"), getMyJobs);
router.get("/:id", getJobById);

// Recruiter routes
router.post("/", protect, authorize("recruiter"), createJobRules, createJob);
router.put("/:id", protect, authorize("recruiter"), createJobRules, updateJob);
router.delete("/:id", protect, authorize("recruiter"), deleteJob);
router.patch("/:id/status", protect, authorize("recruiter"), updateJobStatus);

module.exports = router;
