const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/auth.middleware");
const {
  addNote,
  analytics,
  bulkAction,
  deleteNote,
  getApplicationDetails,
  listPipeline,
  moveApplication,
  setTags,
  updateNote,
} = require("../controllers/pipeline.controller");

router.use(protect, authorize("recruiter", "admin"));

router.get("/", listPipeline);
router.get("/analytics", analytics);
router.post("/bulk", bulkAction);
router.get("/applications/:id", getApplicationDetails);
router.patch("/applications/:id/stage", moveApplication);
router.patch("/applications/:id/tags", setTags);
router.post("/applications/:id/notes", addNote);
router.patch("/notes/:noteId", updateNote);
router.delete("/notes/:noteId", deleteNote);

module.exports = router;
