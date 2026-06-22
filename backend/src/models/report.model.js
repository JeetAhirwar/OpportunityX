const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
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

module.exports = mongoose.model("Report", reportSchema);
