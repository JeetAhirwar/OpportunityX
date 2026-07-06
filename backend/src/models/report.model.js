const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null, index: true },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["users", "jobs", "applications", "growth"], required: true },
    format: { type: String, enum: ["csv", "xlsx", "pdf"], required: true },
    dateRange: {
      from: Date,
      to: Date,
    },
    fileUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

reportSchema.index({ organizationId: 1, type: 1, createdAt: -1 });

module.exports = mongoose.model("Report", reportSchema);
