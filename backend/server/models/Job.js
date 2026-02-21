const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, required: true, index: true },
    salary: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      currency: { type: String, default: "USD" },
    },
    skills: [{ type: String, trim: true }],
    experienceLevel: {
      type: String,
      enum: ["junior", "mid", "senior", "lead"],
      default: "mid",
    },
    jobType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship"],
      default: "full-time",
    },
    workMode: {
      type: String,
      enum: ["remote", "hybrid", "onsite"],
      default: "onsite",
    },
    deadline: Date,
    status: {
      type: String,
      enum: ["active", "closed", "draft", "pending"],
      default: "active",
      index: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    applicantCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

jobSchema.index({ createdAt: -1 });
jobSchema.index({ title: "text", company: "text", description: "text" });

module.exports = mongoose.model("Job", jobSchema);
