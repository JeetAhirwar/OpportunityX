const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { createJob, updateJob, deleteJob, searchJobs, getJobById, getMyJobs, updateJobStatus } = require("../controllers/jobController");

router.get("/", searchJobs);
router.get("/mine", protect, authorize("recruiter"), getMyJobs);
router.get("/:id", getJobById);
router.post("/", protect, authorize("recruiter"), createJob);
router.put("/:id", protect, authorize("recruiter"), updateJob);
router.delete("/:id", protect, authorize("recruiter"), deleteJob);
router.patch("/:id/status", protect, authorize("recruiter"), updateJobStatus);

module.exports = router;
