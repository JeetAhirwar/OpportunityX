const Company = require("../models/company.model");

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
    }
    res.json({ success: true, data: company, message: "Verification request submitted." });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
