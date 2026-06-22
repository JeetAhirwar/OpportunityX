const mongoose = require("mongoose");

const recruiterNoteSchema = new mongoose.Schema(
  {
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

recruiterNoteSchema.index({ recruiter: 1, candidate: 1, job: 1 });

module.exports = mongoose.model("RecruiterNote", recruiterNoteSchema);
