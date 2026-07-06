const Interview = require("../models/interview.model");
const calendarService = require("../services/calendar.service");
const interviewService = require("../services/interview.service");

const fail = (res, error) =>
  res.status(error.statusCode || 500).json({ success: false, message: error.message || "Interview request failed" });

exports.list = async (req, res) => {
  try {
    const data = await interviewService.listInterviews({ user: req.user, query: req.query });
    res.json({ success: true, data });
  } catch (error) {
    fail(res, error);
  }
};

exports.create = async (req, res) => {
  try {
    const interview = await interviewService.createInterview({ user: req.user, body: req.body, io: req.app.get("io") });
    res.status(201).json({ success: true, data: interview });
  } catch (error) {
    fail(res, error);
  }
};

exports.details = async (req, res) => {
  try {
    const interview = await interviewService.getAccessibleInterview({ user: req.user, interviewId: req.params.id });
    res.json({ success: true, data: interview });
  } catch (error) {
    fail(res, error);
  }
};

exports.update = async (req, res) => {
  try {
    const interview = await interviewService.updateInterview({ user: req.user, interviewId: req.params.id, body: req.body, io: req.app.get("io") });
    res.json({ success: true, data: interview });
  } catch (error) {
    fail(res, error);
  }
};

exports.reschedule = async (req, res) => {
  try {
    const interview = await interviewService.updateInterview({ user: req.user, interviewId: req.params.id, body: req.body, io: req.app.get("io"), status: "rescheduled" });
    res.json({ success: true, data: interview });
  } catch (error) {
    fail(res, error);
  }
};

exports.cancel = async (req, res) => {
  try {
    const interview = await interviewService.updateInterview({ user: req.user, interviewId: req.params.id, body: { cancelledReason: req.body.reason }, io: req.app.get("io"), status: "cancelled" });
    res.json({ success: true, data: interview });
  } catch (error) {
    fail(res, error);
  }
};

exports.duplicate = async (req, res) => {
  try {
    const interview = await interviewService.duplicateInterview({ user: req.user, interviewId: req.params.id, io: req.app.get("io") });
    res.status(201).json({ success: true, data: interview });
  } catch (error) {
    fail(res, error);
  }
};

exports.respond = async (req, res) => {
  try {
    const interview = await interviewService.respondToInvitation({
      user: req.user,
      interviewId: req.params.id,
      action: req.body.action,
      reason: req.body.reason,
      preferredTimes: req.body.preferredTimes,
      io: req.app.get("io"),
    });
    res.json({ success: true, data: interview });
  } catch (error) {
    fail(res, error);
  }
};

exports.feedback = async (req, res) => {
  try {
    const interview = await interviewService.submitFeedback({ user: req.user, interviewId: req.params.id, body: req.body, io: req.app.get("io") });
    res.json({ success: true, data: interview });
  } catch (error) {
    fail(res, error);
  }
};

exports.calendar = async (req, res) => {
  try {
    const interview = await interviewService.getAccessibleInterview({ user: req.user, interviewId: req.params.id });
    const ics = calendarService.createIcs(interview);
    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="opportunityx-interview-${interview._id}.ics"`);
    res.send(ics);
  } catch (error) {
    fail(res, error);
  }
};

exports.calendarProviders = (_req, res) => {
  res.json({ success: true, data: calendarService.calendarAdapters });
};

exports.analytics = async (req, res) => {
  try {
    const match = req.user.role === "admin" ? {} : { recruiter: req.user._id };
    const [byStatus, byStage, upcoming, today] = await Promise.all([
      Interview.aggregate([{ $match: match }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
      Interview.aggregate([{ $match: match }, { $group: { _id: "$stage", count: { $sum: 1 }, avgScore: { $avg: "$score" } } }]),
      Interview.countDocuments({ ...match, scheduledAt: { $gte: new Date() }, status: { $in: ["scheduled", "confirmed", "rescheduled"] } }),
      Interview.countDocuments({
        ...match,
        scheduledAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(24, 0, 0, 0)),
        },
      }),
    ]);
    res.json({ success: true, data: { byStatus, byStage, upcoming, today } });
  } catch (error) {
    fail(res, error);
  }
};
