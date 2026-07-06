const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/auth.middleware");
const { optionalOrganization, requirePermissionIfScoped } = require("../middlewares/organization.middleware");
const { ORGANIZATION_PERMISSIONS } = require("../constants/organization");
const { createJobRules } = require("../validators");
const {
  createJob,
  updateJob,
  deleteJob,
  searchJobs,
  getJobById,
  getMyJobs,
  getMyJobById,
  updateJobStatus,
  getFeaturedJobs,
} = require("../controllers/job.controller");

// Public routes
router.get("/", searchJobs);
router.get("/featured", getFeaturedJobs);
router.get("/my", protect, authorize("recruiter"), optionalOrganization, requirePermissionIfScoped(ORGANIZATION_PERMISSIONS.JOBS_READ), getMyJobs);
router.get("/my/:id", protect, authorize("recruiter"), optionalOrganization, requirePermissionIfScoped(ORGANIZATION_PERMISSIONS.JOBS_READ), getMyJobById);
router.get("/:id", getJobById);

// Recruiter routes
router.post("/", protect, authorize("recruiter"), optionalOrganization, requirePermissionIfScoped(ORGANIZATION_PERMISSIONS.JOBS_CREATE), createJobRules, createJob);
router.put("/:id", protect, authorize("recruiter"), optionalOrganization, requirePermissionIfScoped(ORGANIZATION_PERMISSIONS.JOBS_UPDATE), createJobRules, updateJob);
router.delete("/:id", protect, authorize("recruiter"), optionalOrganization, requirePermissionIfScoped(ORGANIZATION_PERMISSIONS.JOBS_DELETE), deleteJob);
router.patch("/:id/status", protect, authorize("recruiter"), optionalOrganization, requirePermissionIfScoped(ORGANIZATION_PERMISSIONS.JOBS_UPDATE), updateJobStatus);

module.exports = router;

