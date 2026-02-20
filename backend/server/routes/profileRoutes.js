const express = require("express");
const router = express.Router();

const { saveProfile, getProfile } = require("../controllers/profileController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Only candidate can access
router.put("/profile", protect, authorize("candidate"), saveProfile);
router.get("/profile", protect, authorize("candidate"), getProfile);

module.exports = router;