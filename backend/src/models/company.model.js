const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    companyName: { type: String, trim: true, default: "" },
    recruiterName: { type: String, trim: true, default: "" },
    officialEmail: { type: String, trim: true, lowercase: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    website: { type: String, trim: true, default: "" },
    linkedin: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    companySize: { type: String, trim: true, default: "" },
    industry: { type: String, trim: true, default: "" },
    designation: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    registrationNumber: { type: String, trim: true, default: "" },
    logo: { type: String, default: "" },
    verificationStatus: {
      type: String,
      enum: ["unverified", "pending", "verified", "rejected"],
      default: "unverified",
      index: true,
    },
    submittedAt: { type: Date, default: null },
    verifiedAt: { type: Date, default: null },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    rejectionReason: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Company", companySchema);
