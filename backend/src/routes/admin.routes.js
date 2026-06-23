const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/auth.middleware");
const { updateRoleRules, mongoIdParam } = require("../validators");
const {
  getUsers, updateUserStatus, updateUserRole, deleteUser,
  getRecruiters, getRecruiter, approveRecruiter, rejectRecruiter,
  getJobs, moderateJob, getApplications, getAnalytics,
} = require("../controllers/admin.controller");

router.use(protect, authorize("admin"));

router.get("/users", getUsers);
router.patch("/users/:id/status", mongoIdParam, updateUserStatus);
router.patch("/users/:id/role", updateRoleRules, updateUserRole);
router.delete("/users/:id", mongoIdParam, deleteUser);
router.get("/recruiters", getRecruiters);
router.get("/recruiters/:id", mongoIdParam, getRecruiter);
router.patch("/recruiters/:id/approve", mongoIdParam, approveRecruiter);
router.patch("/recruiters/:id/reject", mongoIdParam, rejectRecruiter);
router.get("/jobs", getJobs);
router.patch("/jobs/:id/moderate", mongoIdParam, moderateJob);
router.get("/applications", getApplications);
router.get("/analytics", getAnalytics);

module.exports = router;

