const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/authMiddleware");

const {
    createJob,
    updateJob,
    deleteJob,
    searchJobs,
    getJobById,
    getMyJobs,
    updateJobStatus,
} = require("../controllers/jobController");

// Public routes
router.get("/", searchJobs);
router.get("/my", protect, authorize("recruiter"), getMyJobs);
router.get("/:id", getJobById);

// Recruiter routes
// router.get("/my", protect, authorize("recruiter"), getMyJobs);
router.post("/", protect, authorize("recruiter"), createJob);
router.put("/:id", protect, authorize("recruiter"), updateJob);
router.delete("/:id", protect, authorize("recruiter"), deleteJob);

// ✅ Update Job Status (Active / Closed / Draft)
router.patch("/:id/status", protect, authorize("recruiter"), updateJobStatus);

module.exports = router;