const Application = require("../models/application.model");
const Job = require("../models/job.model");
const Notification = require("../models/notification.model");
const mongoose = require("mongoose");

const emitNotification = (req, userId, notification) => {
  const io = req.app.get("io");
  io?.to(String(userId)).emit("notification_created", notification);
  io?.to(String(userId)).emit("notification_received", notification);
};

// Apply to job
exports.apply = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findOne({ _id: jobId, status: "active" });
    if (!job) return res.status(404).json({ message: "Job not found or no longer active" });

    const existing = await Application.findOne({ job: jobId, candidate: req.user._id });

    if (existing && existing.status !== "withdrawn") {
      return res.status(409).json({ message: "Already applied to this job" });
    }

    if (existing && existing.status === "withdrawn") {
      existing.status = "applied";
      existing.coverLetter = req.body.coverLetter || "";
      existing.appliedAt = Date.now();
      await existing.save();

      await Job.findByIdAndUpdate(jobId, { $inc: { applicantCount: 1 } });
      return res.json(existing);
    }

    const application = await Application.create({
      job: jobId,
      candidate: req.user._id,
      coverLetter: req.body.coverLetter || "",
    });

    await Job.findByIdAndUpdate(jobId, { $inc: { applicantCount: 1 } });

    // Notify candidate
    await Notification.create({
      user: req.user._id,
      title: "Application Submitted",
      message: "Your application has been submitted successfully.",
      type: "success",
    });
    const recruiterNotification = await Notification.create({
      user: job.postedBy,
      title: "New Application Received",
      message: `${req.user.name} applied for ${job.title}.`,
      type: "info",
      link: "/recruiter/applicants",
    });
    emitNotification(req, job.postedBy, recruiterNotification);

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get my applications (candidate)
exports.getMyApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const total = await Application.countDocuments({ candidate: req.user._id });
    const applications = await Application.find({ candidate: req.user._id })
      .populate("job", "title company location salary jobType")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ applications, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get applicants for a job (recruiter)
exports.getApplicants = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.jobId)) {
      return res.status(400).json({ message: "Invalid job ID" });
    }
    const job = await Job.findOne({ _id: req.params.jobId, postedBy: req.user._id });
    if (!job) return res.status(404).json({ message: "Job not found" });

    const applicants = await Application.find({ job: req.params.jobId })
      .populate("candidate", "name email")
      .populate("job", "title company location")
      .sort({ createdAt: -1 });

    res.json(applicants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRecruiterApplicants = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).select("_id title company");
    const jobIds = jobs.map((job) => job._id);
    const applicants = await Application.find({ job: { $in: jobIds } })
      .populate("candidate", "name email")
      .populate("job", "title company location")
      .sort({ createdAt: -1 });
    res.json(applicants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update application status (recruiter)
exports.updateStatus = async (req, res) => {
  try {
    const existing = await Application.findById(req.params.id).populate("job");
    if (!existing || String(existing.job?.postedBy) !== String(req.user._id)) {
      return res.status(404).json({ message: "Application not found" });
    }
    existing.status = req.body.status;
    await existing.save();
    const application = await existing.populate("job", "title company");

    if (!application) return res.status(404).json({ message: "Application not found" });

    // Notify candidate
    const notification = await Notification.create({
      user: application.candidate,
      title: "Application Update",
      message: `Your application for ${application.job?.title} has been ${req.body.status}.`,
      type: req.body.status === "rejected" ? "error" : "success",
    });
    emitNotification(req, application.candidate, notification);

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Withdraw application (candidate)
exports.withdraw = async (req, res) => {
  try {
    const application = await Application.findOne({ _id: req.params.id, candidate: req.user._id });
    if (!application) return res.status(404).json({ message: "Application not found" });
    if (["offer", "rejected", "withdrawn"].includes(application.status)) {
      return res.status(400).json({ message: "Cannot withdraw this application" });
    }

    application.status = "withdrawn";
    await application.save();
    await Job.findByIdAndUpdate(application.job, { $inc: { applicantCount: -1 } });

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

