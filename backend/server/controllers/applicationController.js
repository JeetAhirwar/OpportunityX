const Application = require("../models/Application");
const Job = require("../models/Job");
const Notification = require("../models/Notification");

// Apply to job
exports.apply = async (req, res) => {
  try {
    const { jobId } = req.params;
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
    const job = await Job.findOne({ _id: req.params.jobId, postedBy: req.user._id });
    if (!job) return res.status(404).json({ message: "Job not found" });

    const applicants = await Application.find({ job: req.params.jobId })
      .populate("candidate", "name email")
      .sort({ createdAt: -1 });

    res.json(applicants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update application status (recruiter)
exports.updateStatus = async (req, res) => {
  try {
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate("job", "title company");

    if (!application) return res.status(404).json({ message: "Application not found" });

    // Notify candidate
    await Notification.create({
      user: application.candidate,
      title: "Application Update",
      message: `Your application for ${application.job?.title} has been ${req.body.status}.`,
      type: req.body.status === "rejected" ? "error" : "success",
    });

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
