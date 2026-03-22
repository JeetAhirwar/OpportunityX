const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { profileRules } = require("../middleware/validate");
const { saveProfile, getProfile } = require("../controllers/profileController");
const { uploadResume } = require("../middleware/upload");

router.get("/profile", protect, authorize("candidate"), getProfile);
router.put("/profile", protect, authorize("candidate"), uploadResume, profileRules, saveProfile);

module.exports = router;
