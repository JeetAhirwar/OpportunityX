const mongoose = require("mongoose");

const INTERVIEW_TYPES = Object.freeze([
  "hr",
  "technical",
  "managerial",
  "behavioral",
  "final",
  "custom",
]);

const INTERVIEW_MODES = Object.freeze([
  "google_meet",
  "zoom",
  "microsoft_teams",
  "phone",
  "office",
  "custom",
]);

const INTERVIEW_STATUSES = Object.freeze([
  "scheduled",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
  "rescheduled",
]);

const RECOMMENDATIONS = Object.freeze(["strong_hire", "hire", "hold", "reject"]);

const feedbackSchema = new mongoose.Schema(
  {
    interviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    technicalScore: { type: Number, min: 0, max: 10, default: 0 },
    communication: { type: Number, min: 0, max: 10, default: 0 },
    problemSolving: { type: Number, min: 0, max: 10, default: 0 },
    cultureFit: { type: Number, min: 0, max: 10, default: 0 },
    comments: { type: String, trim: true, default: "" },
    recommendation: { type: String, enum: RECOMMENDATIONS, default: "hold" },
    submittedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const timelineSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    title: { type: String, required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    fromStatus: { type: String, default: "" },
    toStatus: { type: String, default: "" },
    note: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const interviewSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null, index: true },
    application: { type: mongoose.Schema.Types.ObjectId, ref: "Application", default: null, index: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    interviewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    title: { type: String, required: true, trim: true, maxlength: 180 },
    description: { type: String, trim: true, default: "", maxlength: 5000 },
    stage: { type: String, enum: INTERVIEW_TYPES, default: "technical", index: true },
    customStage: { type: String, trim: true, default: "" },
    mode: { type: String, enum: INTERVIEW_MODES, default: "google_meet", index: true },
    meetingLink: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    scheduledAt: { type: Date, required: true, index: true },
    duration: { type: Number, min: 15, max: 480, default: 60 },
    timezone: { type: String, trim: true, default: "UTC" },
    status: { type: String, enum: INTERVIEW_STATUSES, default: "scheduled", index: true },
    feedback: { type: [feedbackSchema], default: [] },
    score: { type: Number, min: 0, max: 10, default: 0 },
    recommendation: { type: String, enum: [...RECOMMENDATIONS, ""], default: "" },
    rescheduleRequests: {
      type: [
        {
          requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          reason: { type: String, trim: true, default: "" },
          preferredTimes: { type: [Date], default: [] },
          status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    calendarProvider: { type: String, enum: ["none", "google", "outlook", "ics"], default: "none" },
    externalCalendarId: { type: String, trim: true, default: "" },
    timeline: { type: [timelineSchema], default: [] },
    cancelledReason: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

interviewSchema.index({ organizationId: 1, recruiter: 1, scheduledAt: -1 });
interviewSchema.index({ candidate: 1, scheduledAt: -1 });
interviewSchema.index({ organizationId: 1, job: 1, status: 1, scheduledAt: -1 });
interviewSchema.index({ status: 1, scheduledAt: 1 });

interviewSchema.pre("validate", function seedTimeline() {
  if (!this.timeline?.length) {
    this.timeline = [{ type: "scheduled", title: "Interview scheduled", toStatus: this.status || "scheduled" }];
  }
  if (!this.interviewers?.length && this.recruiter) this.interviewers = [this.recruiter];
});

module.exports = mongoose.model("Interview", interviewSchema);
module.exports.INTERVIEW_TYPES = INTERVIEW_TYPES;
module.exports.INTERVIEW_MODES = INTERVIEW_MODES;
module.exports.INTERVIEW_STATUSES = INTERVIEW_STATUSES;
module.exports.RECOMMENDATIONS = RECOMMENDATIONS;
