const mongoose = require("mongoose");

const PIPELINE_STAGES = Object.freeze([
  "applied",
  "screening",
  "shortlisted",
  "assessment",
  "interview_scheduled",
  "interview_completed",
  "offer_sent",
  "offer_accepted",
  "offer_declined",
  "rejected",
  "hired",
  "withdrawn",
]);

const LEGACY_STATUS_BY_STAGE = Object.freeze({
  applied: "applied",
  screening: "reviewed",
  shortlisted: "shortlisted",
  assessment: "shortlisted",
  interview_scheduled: "interview",
  interview_completed: "interview",
  offer_sent: "offer",
  offer_accepted: "offer",
  offer_declined: "rejected",
  rejected: "rejected",
  hired: "offer",
  withdrawn: "withdrawn",
});

const timelineEventSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    fromStage: { type: String, default: "" },
    toStage: { type: String, default: "" },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["applied", "reviewed", "shortlisted", "interview", "offer", "rejected", "withdrawn"],
      default: "applied",
    },
    pipelineStage: {
      type: String,
      enum: PIPELINE_STAGES,
      default: "applied",
      index: true,
    },
    tags: { type: [String], default: [], index: true },
    coverLetter: { type: String, default: "" },
    appliedAt: { type: Date, default: Date.now },
    notes: { type: String, default: "" },
    availability: { type: String, default: "" },
    salaryExpectation: { type: Number, min: 0, default: 0 },
    timeline: { type: [timelineEventSchema], default: [] },
  },
  { timestamps: true }
);

applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });
applicationSchema.index({ candidate: 1, createdAt: -1 });
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ job: 1, pipelineStage: 1, updatedAt: -1 });
applicationSchema.index({ candidate: 1, pipelineStage: 1 });

applicationSchema.pre("validate", function () {
  if (!this.pipelineStage) this.pipelineStage = this.status === "reviewed" ? "screening" : this.status || "applied";
  this.status = LEGACY_STATUS_BY_STAGE[this.pipelineStage] || this.status || "applied";
  if (!this.timeline?.length) {
    this.timeline = [{
      type: "applied",
      title: "Applied",
      toStage: this.pipelineStage,
      createdAt: this.appliedAt || new Date(),
    }];
  }
});

module.exports = mongoose.model("Application", applicationSchema);
module.exports.PIPELINE_STAGES = PIPELINE_STAGES;
module.exports.LEGACY_STATUS_BY_STAGE = LEGACY_STATUS_BY_STAGE;
