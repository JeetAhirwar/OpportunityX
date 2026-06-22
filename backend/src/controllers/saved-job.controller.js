const SavedJob = require("../models/saved-job.model");
const Job = require("../models/job.model");
const mongoose = require("mongoose");

// Toggle save
exports.toggleSave = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.jobId)) {
      return res.status(400).json({ message: "Invalid job ID" });
    }
    const job = await Job.findOne({ _id: req.params.jobId, status: "active" }).select("_id");
    if (!job) return res.status(404).json({ message: "Job not found" });

    const existing = await SavedJob.findOne({ user: req.user._id, job: req.params.jobId });
    if (existing) {
      await existing.deleteOne();
      return res.json({ saved: false, message: "Job unsaved" });
    }
    await SavedJob.create({ user: req.user._id, job: req.params.jobId });
    res.json({ saved: true, message: "Job saved" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// List saved jobs
exports.getSavedJobs = async (req, res) => {
  try {
    const saved = await SavedJob.find({ user: req.user._id })
      .populate({ path: "job", populate: { path: "postedBy", select: "name" } })
      .sort({ createdAt: -1 });
    res.json(saved.map((s) => s.job).filter(Boolean));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

