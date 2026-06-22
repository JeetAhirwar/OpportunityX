const SavedJob = require("../models/saved-job.model");

// Toggle save
exports.toggleSave = async (req, res) => {
  try {
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

