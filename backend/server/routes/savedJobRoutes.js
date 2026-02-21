const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { toggleSave, getSavedJobs } = require("../controllers/savedJobController");

router.post("/:jobId", protect, toggleSave);
router.get("/", protect, getSavedJobs);

module.exports = router;
