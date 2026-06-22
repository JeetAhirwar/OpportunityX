const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/auth.middleware");
const { toggleSave, getSavedJobs } = require("../controllers/saved-job.controller");

router.post("/:jobId", protect, authorize("candidate"), toggleSave);
router.get("/", protect, authorize("candidate"), getSavedJobs);

module.exports = router;

