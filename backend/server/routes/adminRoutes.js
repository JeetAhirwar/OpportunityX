const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { getUsers, updateUserStatus, updateUserRole, deleteUser, moderateJob, getAnalytics } = require("../controllers/adminController");

router.use(protect, authorize("admin"));

router.get("/users", getUsers);
router.patch("/users/:id/status", updateUserStatus);
router.patch("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);
router.patch("/jobs/:id/moderate", moderateJob);
router.get("/analytics", getAnalytics);

module.exports = router;
