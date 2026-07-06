const mongoose = require("mongoose");

const parsedResumeSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null, index: true },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    resumeUrl: { type: String, required: true },
    fileName: { type: String, default: "" },
    mimeType: { type: String, default: "" },
    rawText: { type: String, default: "", select: false },
    parsedData: { type: mongoose.Schema.Types.Mixed, default: {} },
    atsScore: { type: Number, min: 0, max: 100, default: 0 },
    skills: { type: [String], default: [], index: true },
    techStack: { type: [String], default: [] },
    experienceYears: { type: Number, min: 0, default: 0 },
    education: { type: [mongoose.Schema.Types.Mixed], default: [] },
    experience: { type: [mongoose.Schema.Types.Mixed], default: [] },
    projects: { type: [mongoose.Schema.Types.Mixed], default: [] },
    certifications: { type: [mongoose.Schema.Types.Mixed], default: [] },
    analysis: { type: mongoose.Schema.Types.Mixed, default: {} },
    lastAnalyzedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

parsedResumeSchema.index({ organizationId: 1, updatedAt: -1 });
parsedResumeSchema.index({ atsScore: -1 });

module.exports = mongoose.model("ParsedResume", parsedResumeSchema);
