const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { saveNote, getNote } = require("../controllers/recruiterNoteController");

router.post("/", protect, authorize("recruiter"), saveNote);
router.get("/:candidateId/:jobId", protect, authorize("recruiter"), getNote);

module.exports = router;
