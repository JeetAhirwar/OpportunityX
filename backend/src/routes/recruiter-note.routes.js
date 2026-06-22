const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/auth.middleware");
const { saveNote, getNote } = require("../controllers/recruiter-note.controller");

router.post("/", protect, authorize("recruiter"), saveNote);
router.get("/:candidateId/:jobId", protect, authorize("recruiter"), getNote);

module.exports = router;

