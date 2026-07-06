const crypto = require("crypto");
const mongoose = require("mongoose");
const { ORGANIZATION_ROLES } = require("../constants/organization");

const memberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: {
      type: String,
      enum: Object.values(ORGANIZATION_ROLES),
      default: ORGANIZATION_ROLES.RECRUITER,
    },
    status: {
      type: String,
      enum: ["active", "invited", "suspended"],
      default: "active",
      index: true,
    },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    invitedAt: { type: Date, default: null },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const invitationSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    role: {
      type: String,
      enum: Object.values(ORGANIZATION_ROLES),
      default: ORGANIZATION_ROLES.RECRUITER,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "revoked", "expired"],
      default: "pending",
      index: true,
    },
    tokenHash: { type: String, required: true, select: false },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    expiresAt: { type: Date, required: true },
    acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    acceptedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    logo: { type: String, default: "" },
    website: { type: String, trim: true, default: "" },
    industry: { type: String, trim: true, default: "" },
    companySize: { type: String, trim: true, default: "" },
    country: { type: String, trim: true, default: "" },
    timezone: { type: String, trim: true, default: "UTC" },
    subscriptionPlan: {
      type: String,
      enum: ["free", "starter", "growth", "enterprise"],
      default: "free",
      index: true,
    },
    subscriptionStatus: {
      type: String,
      enum: ["trial", "active", "past_due", "cancelled", "suspended"],
      default: "trial",
      index: true,
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    members: { type: [memberSchema], default: [] },
    invitations: { type: [invitationSchema], default: [], select: false },
    settings: {
      allowPublicApplications: { type: Boolean, default: true },
      defaultJobStatus: { type: String, enum: ["active", "draft", "pending"], default: "draft" },
      requireVerifiedRecruiters: { type: Boolean, default: true },
      emailFromName: { type: String, trim: true, default: "" },
      customDomains: {
        careers: { type: String, trim: true, lowercase: true, default: "" },
        jobs: { type: String, trim: true, lowercase: true, default: "" },
      },
    },
    branding: {
      primaryColor: { type: String, default: "#2563eb" },
      secondaryColor: { type: String, default: "#0f172a" },
      careerPageHeadline: { type: String, trim: true, default: "" },
      emailBranding: { type: String, trim: true, default: "" },
      companyDescription: { type: String, trim: true, default: "" },
    },
  },
  { timestamps: true }
);

organizationSchema.index({ owner: 1, createdAt: -1 });
organizationSchema.index({ "members.user": 1, "members.status": 1 });
organizationSchema.index({ "invitations.email": 1, "invitations.status": 1 });
organizationSchema.index({ "settings.customDomains.careers": 1 }, { sparse: true });
organizationSchema.index({ "settings.customDomains.jobs": 1 }, { sparse: true });

organizationSchema.pre("validate", function seedOwnerMembership() {
  if (!this.members?.some((member) => String(member.user) === String(this.owner))) {
    this.members.push({ user: this.owner, role: ORGANIZATION_ROLES.OWNER, status: "active", joinedAt: new Date() });
  }
});

organizationSchema.statics.hashInvitationToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

module.exports = mongoose.model("Organization", organizationSchema);
