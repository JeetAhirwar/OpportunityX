const mongoose = require("mongoose");

const recruiterNoteSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null, index: true },
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    application: { type: mongoose.Schema.Types.ObjectId, ref: "Application", default: null },
    content: { type: String, required: true },
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

recruiterNoteSchema.index({ organizationId: 1, recruiter: 1, candidate: 1, job: 1 });
recruiterNoteSchema.index({ application: 1, createdAt: -1 });

module.exports = mongoose.model("RecruiterNote", recruiterNoteSchema);
