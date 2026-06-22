const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
    },

    company: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    salary: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      currency: { type: String, default: "USD" },
    },

    skills: [
      {
        type: String,
        trim: true,
        lowercase: true, // 🔥 better for filtering
      },
    ],

    experienceLevel: {
      type: String,
      enum: ["junior", "mid", "senior", "lead"],
      default: "mid",
      index: true,
    },

    jobType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship"],
      default: "full-time",
      index: true,
    },

    workMode: {
      type: String,
      enum: ["remote", "hybrid", "onsite"],
      default: "onsite",
      index: true,
    },

    deadline: {
      type: Date,
      index: true,
    },

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
      index: true,
    },

    applicantCount: {
      type: Number,
      default: 0,
    },

    views: {
      type: Number,
      default: 0,
    },

    // ✅ Featured Section Support
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },

    // 🔥 Optional: Auto expire jobs after deadline
    isExpired: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);



// 🔥 Compound indexes for performance
jobSchema.index({ status: 1, featured: 1, createdAt: -1 });
jobSchema.index({ title: "text", company: "text", description: "text" });

module.exports = mongoose.model("Job", jobSchema);