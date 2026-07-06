const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/auth.middleware");
const { optionalOrganization, requirePermissionIfScoped } = require("../middlewares/organization.middleware");
const { ORGANIZATION_PERMISSIONS } = require("../constants/organization");
const { applyRules, updateStatusRules } = require("../validators");
const { apply, getMyApplications, getApplicants, getRecruiterApplicants, updateStatus, withdraw } = require("../controllers/application.controller");

router.post("/:jobId/apply", protect, authorize("candidate"), applyRules, apply);
router.get("/me", protect, authorize("candidate"), getMyApplications);
router.get("/recruiter", protect, authorize("recruiter"), optionalOrganization, requirePermissionIfScoped(ORGANIZATION_PERMISSIONS.APPLICATIONS_READ), getRecruiterApplicants);
router.get("/job/:jobId", protect, authorize("recruiter"), optionalOrganization, requirePermissionIfScoped(ORGANIZATION_PERMISSIONS.APPLICATIONS_READ), getApplicants);
router.patch("/:id/status", protect, authorize("recruiter"), optionalOrganization, requirePermissionIfScoped(ORGANIZATION_PERMISSIONS.APPLICATIONS_UPDATE), updateStatusRules, updateStatus);
router.patch("/:id/withdraw", protect, authorize("candidate"), withdraw);

module.exports = router;

