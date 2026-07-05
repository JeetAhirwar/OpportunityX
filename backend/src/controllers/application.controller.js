const Application = require("../models/application.model");
const Job = require("../models/job.model");
const notificationService = require("../services/notification.service");
const { TYPES } = notificationService;
const mongoose = require("mongoose");

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
      await notificationService.createNotification({
        io: req.app.get("io"),
        recipient: job.postedBy,
        sender: req.user._id,
        type: TYPES.NEW_APPLICATION,
        title: "New Application Received",
        message: `${req.user.name} reapplied for ${job.title}.`,
        entityType: "application",
        entityId: existing._id,
        link: `/recruiter/applicants/${job._id}`,
        dedupeKey: `application-reapplied:${existing._id}:${existing.appliedAt?.getTime?.() || Date.now()}`,
      });
      return res.json(existing);
    }

    const application = await Application.create({
      job: jobId,
      candidate: req.user._id,
      coverLetter: req.body.coverLetter || "",
    });

    await Job.findByIdAndUpdate(jobId, { $inc: { applicantCount: 1 } });

    await notificationService.createNotification({
      io: req.app.get("io"),
      recipient: req.user._id,
      sender: job.postedBy,
      type: TYPES.APPLICATION_SUBMITTED,
      title: "Application Submitted",
      message: `Your application for ${job.title} has been submitted successfully.`,
      entityType: "application",
      entityId: application._id,
      link: "/candidate/applied",
      dedupeKey: `application-submitted:${application._id}`,
    });
    await notificationService.createNotification({
      io: req.app.get("io"),
      recipient: job.postedBy,
      sender: req.user._id,
      type: TYPES.NEW_APPLICATION,
      title: "New Application Received",
      message: `${req.user.name} applied for ${job.title}.`,
      entityType: "application",
      entityId: application._id,
      link: `/recruiter/applicants/${job._id}`,
      dedupeKey: `new-application:${application._id}`,
    });

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
    await Promise.all(applicants.map((application) => notificationService.createNotification({
      io: req.app.get("io"),
      recipient: application.candidate._id || application.candidate,
      sender: req.user._id,
      type: TYPES.APPLICATION_VIEWED,
      title: "Application Viewed",
      message: `Your application for ${application.job?.title || job.title} was viewed by the recruiter.`,
      entityType: "application",
      entityId: application._id,
      link: "/candidate/applied",
      dedupeKey: `application-viewed:${application._id}`,
    })));

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

    const statusType = {
      reviewed: TYPES.APPLICATION_VIEWED,
      shortlisted: TYPES.APPLICATION_SHORTLISTED,
      interview: TYPES.INTERVIEW_SCHEDULED,
      offer: TYPES.OFFER_RECEIVED,
      rejected: TYPES.APPLICATION_REJECTED,
    }[req.body.status] || TYPES.ACCOUNT_UPDATE;
    const statusTitle = {
      reviewed: "Application Viewed",
      shortlisted: "You Were Shortlisted",
      interview: "Interview Scheduled",
      offer: "Offer Received",
      rejected: "Application Rejected",
    }[req.body.status] || "Application Update";
    await notificationService.createNotification({
      io: req.app.get("io"),
      recipient: application.candidate,
      sender: req.user._id,
      type: statusType,
      title: statusTitle,
      message: `Your application for ${application.job?.title} has been ${req.body.status}.`,
      entityType: "application",
      entityId: application._id,
      link: "/candidate/applied",
      dedupeKey: `application-status:${application._id}:${req.body.status}:${application.updatedAt?.getTime?.() || Date.now()}`,
    });

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Withdraw application (candidate)
exports.withdraw = async (req, res) => {
  try {
    const application = await Application.findOne({ _id: req.params.id, candidate: req.user._id }).populate("job", "title postedBy");
    if (!application) return res.status(404).json({ message: "Application not found" });
    if (["offer", "rejected", "withdrawn"].includes(application.status)) {
      return res.status(400).json({ message: "Cannot withdraw this application" });
    }

    application.status = "withdrawn";
    await application.save();
    await Job.findByIdAndUpdate(application.job, { $inc: { applicantCount: -1 } });
    await notificationService.createNotification({
      io: req.app.get("io"),
      recipient: application.job.postedBy,
      sender: req.user._id,
      type: TYPES.APPLICATION_WITHDRAWN,
      title: "Candidate Withdrew Application",
      message: `${req.user.name} withdrew their application for ${application.job.title}.`,
      entityType: "application",
      entityId: application._id,
      link: `/recruiter/applicants/${application.job._id}`,
      dedupeKey: `application-withdrawn:${application._id}:${application.updatedAt?.getTime?.() || Date.now()}`,
    });

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

