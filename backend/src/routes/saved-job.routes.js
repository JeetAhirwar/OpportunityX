const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const { toggleSave, getSavedJobs } = require("../controllers/saved-job.controller");

router.post("/:jobId", protect, toggleSave);
router.get("/", protect, getSavedJobs);

module.exports = router;

