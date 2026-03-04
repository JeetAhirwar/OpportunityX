const express = require("express");
const router = express.Router();

const { saveProfile, getProfile } = require("../controllers/profileController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { uploadResume } = require("../middleware/upload"); // ✅ ADD THIS

// Only candidate can access
router.put(
  "/profile",
  protect,
  authorize("candidate"),
  uploadResume, // ✅ ADD THIS
  saveProfile
);

router.get("/profile", protect, authorize("candidate"), getProfile);

module.exports = router;