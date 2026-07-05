const Company = require("../models/company.model");
const emailService = require("../services/email.service");
const notificationService = require("../services/notification.service");
const { TYPES } = notificationService;
const { EMAIL_TYPES } = emailService;

const defaultsFor = (user) => ({
  recruiter: user._id,
  recruiterName: user.name || "",
  officialEmail: user.email || "",
});

exports.getCompany = async (req, res) => {
  try {
    const company = await Company.findOne({ recruiter: req.user._id });
    res.json({
      success: true,
      data: company || { ...defaultsFor(req.user), verificationStatus: "unverified" },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.saveCompany = async (req, res) => {
  try {
    const update = { ...req.body };
    ["recruiter", "verificationStatus", "submittedAt", "verifiedAt", "verifiedBy", "rejectionReason"]
      .forEach((field) => delete update[field]);
    const company = await Company.findOneAndUpdate(
      { recruiter: req.user._id },
      { $set: update, $setOnInsert: { recruiter: req.user._id } },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ success: true, data: company });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.submitVerification = async (req, res) => {
  try {
    const company = await Company.findOne({ recruiter: req.user._id });
    if (!company) {
      return res.status(400).json({ success: false, message: "Save your company profile before submitting verification." });
    }
    const required = [
      "companyName", "recruiterName", "officialEmail", "phone", "location",
      "companySize", "industry", "designation", "description",
    ];
    const missing = required.filter((field) => !String(company[field] || "").trim());
    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: `Complete required company fields before verification: ${missing.join(", ")}`,
      });
    }
    if (company.verificationStatus !== "verified") {
      company.verificationStatus = "pending";
      company.submittedAt = new Date();
      company.rejectionReason = "";
      await company.save();
      await notificationService.notifyAdmins({
        io: req.app.get("io"),
        sender: req.user._id,
        type: TYPES.RECRUITER_APPROVAL_PENDING,
        title: "Recruiter Approval Pending",
        message: `${company.companyName || req.user.name} submitted company verification for review.`,
        entityType: "company",
        entityId: company._id,
        link: "/admin/approvals",
        priority: "high",
        dedupeKey: `recruiter-approval-pending:${company._id}:${company.submittedAt?.getTime?.() || Date.now()}`,
      });
      await emailService.sendToAdmins({
        type: EMAIL_TYPES.ADMIN_RECRUITER_APPROVAL_REQUIRED,
        data: { companyName: company.companyName, recruiterName: company.recruiterName },
        dedupeKey: `email-recruiter-approval-pending:${company._id}:${company.submittedAt?.getTime?.() || Date.now()}`,
      });
    }
    res.json({ success: true, data: company, message: "Verification request submitted." });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
