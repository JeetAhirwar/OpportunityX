const crypto = require("crypto");
const User = require("../models/user.model");
const Job = require("../models/job.model");
const Application = require("../models/application.model");
const Company = require("../models/company.model");
const Notification = require("../models/notification.model");

const safeUserFields = "name email role isActive isVerified lastLogin createdAt updatedAt";
const isSelf = (req) => String(req.user._id) === String(req.params.id);
const safeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const codesMatch = (providedCode, expectedCode) => {
  if (!providedCode || !expectedCode) return false;
  const provided = Buffer.from(String(providedCode));
  const expected = Buffer.from(String(expectedCode));
  return provided.length === expected.length && crypto.timingSafeEqual(provided, expected);
};

const countAdmins = (filter = {}) => User.countDocuments({ role: "admin", ...filter });

const ensureNotLastAdmin = async (user, res, action) => {
  if (!user || user.role !== "admin") return false;
  const adminCount = await countAdmins();
  if (adminCount <= 1) {
    res.status(400).json({
      success: false,
      message: `Cannot ${action} the last remaining admin account.`,
    });
    return true;
  }

  const activeAdminCount = user.isActive === false ? 2 : await countAdmins({ isActive: true });
  if (activeAdminCount <= 1) {
    res.status(400).json({
      success: false,
      message: `Cannot ${action} the last remaining admin account.`,
    });
    return true;
  }
  return false;
};

exports.bootstrapAdmin = async (req, res) => {
  try {
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      return res.status(403).json({ success: false, message: "Admin bootstrap is already disabled" });
    }

    const expectedCode = process.env.ADMIN_REGISTRATION_CODE;
    if (!expectedCode || !codesMatch(req.body.code, expectedCode)) {
      return res.status(403).json({ success: false, message: "Invalid admin bootstrap code" });
    }

    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: "admin",
      isActive: true,
      isVerified: true,
    });

    return res.status(201).json({
      success: true,
      message: "Admin account created successfully",
      data: {
        user: safeUser(user),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to bootstrap admin account" });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ success: false, message: "User already exists" });

    const user = await User.create({
      name,
      email,
      password,
      role,
      isActive: true,
      isVerified: role === "admin",
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        user: safeUser(user),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to create user" });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 100 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (status === "active") filter.isActive = true;
    if (status === "suspended") filter.isActive = false;
    if (search) filter.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }];
    const total = await User.countDocuments(filter);
    const users = await User.find(filter).select(safeUserFields).sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit)).limit(Number(limit));
    res.json({ success: true, data: users, total, page: Number(page), pages: Math.max(Math.ceil(total / Number(limit)), 1) });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.updateUserStatus = async (req, res) => {
  try {
    if (isSelf(req)) return res.status(400).json({ success: false, message: "You cannot suspend your own admin account." });
    if (typeof req.body.isActive !== "boolean") return res.status(400).json({ success: false, message: "isActive must be a boolean." });
    const target = await User.findById(req.params.id).select(safeUserFields);
    if (!target) return res.status(404).json({ success: false, message: "User not found" });
    if (req.body.isActive === false && await ensureNotLastAdmin(target, res, "suspend")) return;
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive }, { new: true }).select(safeUserFields);
    res.json({ success: true, data: user });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.updateUserRole = async (req, res) => {
  try {
    const target = await User.findById(req.params.id).select(safeUserFields);
    if (!target) return res.status(404).json({ success: false, message: "User not found" });
    if (isSelf(req) && req.body.role !== "admin" && req.body.confirm !== true) {
      return res.status(400).json({ success: false, message: "Confirm self-demotion to change your own admin role." });
    }
    if (target.role === "admin" && req.body.role !== "admin" && await ensureNotLastAdmin(target, res, "demote")) return;
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }).select(safeUserFields);
    res.json({ success: true, data: user });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.deleteUser = async (req, res) => {
  try {
    if (isSelf(req)) return res.status(400).json({ success: false, message: "You cannot delete your own admin account." });
    const target = await User.findById(req.params.id).select(safeUserFields);
    if (!target) return res.status(404).json({ success: false, message: "User not found" });
    if (await ensureNotLastAdmin(target, res, "delete")) return;
    const user = await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User deleted" });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getRecruiters = async (req, res) => {
  try {
    const filter = req.query.status ? { verificationStatus: req.query.status } : {};
    const companies = await Company.find(filter).populate("recruiter", safeUserFields).sort({ submittedAt: -1, createdAt: -1 });
    res.json({ success: true, data: companies });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getRecruiter = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).populate("recruiter", safeUserFields);
    if (!company) return res.status(404).json({ success: false, message: "Recruiter company profile not found" });
    res.json({ success: true, data: company });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const notifyRecruiter = async (req, company, approved, reason = "") => {
  const notification = await Notification.create({
    user: company.recruiter,
    title: approved ? "Recruiter Verification Approved" : "Recruiter Verification Rejected",
    message: approved ? "Your company has been verified. You can now publish active jobs." : `Your company verification was rejected.${reason ? ` Reason: ${reason}` : ""}`,
    type: approved ? "success" : "error",
    link: "/recruiter/company",
  });
  const io = req.app.get("io");
  io?.to(String(company.recruiter)).emit("notification_created", notification);
  io?.to(String(company.recruiter)).emit("notification_received", notification);
};

exports.approveRecruiter = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: "Recruiter company profile not found" });
    company.verificationStatus = "verified";
    company.verifiedAt = new Date();
    company.verifiedBy = req.user._id;
    company.rejectionReason = "";
    await company.save();
    await User.findByIdAndUpdate(company.recruiter, { isVerified: true });
    await notifyRecruiter(req, company, true);
    res.json({ success: true, data: company });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.rejectRecruiter = async (req, res) => {
  try {
    const reason = String(req.body.reason || "").trim();
    if (!reason) return res.status(400).json({ success: false, message: "Rejection reason is required." });
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: "Recruiter company profile not found" });
    company.verificationStatus = "rejected";
    company.rejectionReason = reason;
    company.verifiedAt = null;
    company.verifiedBy = null;
    await company.save();
    await User.findByIdAndUpdate(company.recruiter, { isVerified: false });
    await notifyRecruiter(req, company, false, reason);
    res.json({ success: true, data: company });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getJobs = async (req, res) => {
  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    const jobs = await Job.find(filter).populate("postedBy", "name email role isActive").sort({ createdAt: -1 });
    res.json({ success: true, data: jobs });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.moderateJob = async (req, res) => {
  try {
    const update = {};
    if (req.body.status) {
      if (!["active", "closed", "draft", "pending"].includes(req.body.status)) return res.status(400).json({ success: false, message: "Invalid job status." });
      update.status = req.body.status;
    }
    if (typeof req.body.featured === "boolean") update.featured = req.body.featured;
    const job = await Job.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).populate("postedBy", "name email role isActive");
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });
    res.json({ success: true, data: job });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getApplications = async (_req, res) => {
  try {
    const applications = await Application.find()
      .populate("candidate", "name email role isActive")
      .populate({ path: "job", select: "title company status postedBy", populate: { path: "postedBy", select: "name email" } })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: applications });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getAnalytics = async (_req, res) => {
  try {
    const [usersByRole, jobsByStatus, applicationsByStatus, approvalsByStatus, monthlySignups, totalUsers, totalJobs, totalApplications, pendingApprovals, recentUsers, recentJobs, recentApplications] = await Promise.all([
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
      Job.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Application.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Company.aggregate([{ $group: { _id: "$verificationStatus", count: { $sum: 1 } } }]),
      User.aggregate([{ $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }, { $limit: 12 }]),
      User.countDocuments(), Job.countDocuments(), Application.countDocuments(), Company.countDocuments({ verificationStatus: "pending" }),
      User.find().select(safeUserFields).sort({ createdAt: -1 }).limit(5),
      Job.find().populate("postedBy", "name email").sort({ createdAt: -1 }).limit(5),
      Application.find().populate("candidate", "name email").populate("job", "title company").sort({ createdAt: -1 }).limit(5),
    ]);
    const countOf = (rows, key) => rows.find((row) => row._id === key)?.count || 0;
    res.json({ success: true, data: {
      totalUsers, totalCandidates: countOf(usersByRole, "candidate"), totalRecruiters: countOf(usersByRole, "recruiter"),
      pendingApprovals, totalJobs, activeJobs: countOf(jobsByStatus, "active"), pendingJobs: countOf(jobsByStatus, "pending"),
      totalApplications, usersByRole, jobsByStatus, applicationsByStatus, approvalsByStatus, monthlySignups,
      recentUsers, recentJobs, recentApplications,
    } });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
