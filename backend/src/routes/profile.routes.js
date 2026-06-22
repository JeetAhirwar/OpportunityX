const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/auth.middleware");
const { profileRules } = require("../validators");
const { saveProfile, getProfile } = require("../controllers/profile.controller");
const { uploadResume } = require("../middlewares/upload.middleware");

router.get("/profile", protect, authorize("candidate"), getProfile);
router.put("/profile", protect, authorize("candidate"), uploadResume, profileRules, saveProfile);

module.exports = router;

