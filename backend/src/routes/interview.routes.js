const express = require("express");
const { protect, authorize } = require("../middlewares/auth.middleware");
const interview = require("../controllers/interview.controller");

const router = express.Router();

router.use(protect);

router.get("/", interview.list);
router.get("/analytics", authorize("recruiter", "admin"), interview.analytics);
router.get("/calendar/providers", interview.calendarProviders);
router.post("/", authorize("recruiter", "admin"), interview.create);
router.get("/:id", interview.details);
router.put("/:id", authorize("recruiter", "admin"), interview.update);
router.post("/:id/reschedule", authorize("recruiter", "admin"), interview.reschedule);
router.post("/:id/cancel", authorize("recruiter", "admin"), interview.cancel);
router.post("/:id/duplicate", authorize("recruiter", "admin"), interview.duplicate);
router.post("/:id/respond", authorize("candidate"), interview.respond);
router.post("/:id/feedback", authorize("recruiter", "admin"), interview.feedback);
router.get("/:id/calendar.ics", interview.calendar);

module.exports = router;
