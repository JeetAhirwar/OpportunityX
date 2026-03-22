const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { updateRoleRules, mongoIdParam } = require("../middleware/validate");
const { getUsers, updateUserStatus, updateUserRole, deleteUser, moderateJob, getAnalytics } = require("../controllers/adminController");

router.use(protect, authorize("admin"));

router.get("/users", getUsers);
router.patch("/users/:id/status", mongoIdParam, updateUserStatus);
router.patch("/users/:id/role", updateRoleRules, updateUserRole);
router.delete("/users/:id", mongoIdParam, deleteUser);
router.patch("/jobs/:id/moderate", mongoIdParam, moderateJob);
router.get("/analytics", getAnalytics);

module.exports = router;
