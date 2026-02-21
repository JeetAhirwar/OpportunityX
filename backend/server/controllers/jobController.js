const Job = require("../models/Job");

// Create job (recruiter)
exports.createJob = async (req, res) => {
  try {
    const job = await Job.create({ ...req.body, postedBy: req.user._id });
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update job
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, postedBy: req.user._id },
      req.body,
      { new: true }
    );
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete job
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, postedBy: req.user._id });
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json({ message: "Job deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search jobs (public)
exports.searchJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10, keyword, location, type, experience, salaryMin, salaryMax, sort } = req.query;
    const filter = { status: "active" };

    if (keyword) filter.$text = { $search: keyword };
    if (location) filter.location = { $regex: location, $options: "i" };
    if (type) filter.jobType = type;
    if (experience) filter.experienceLevel = experience;
    if (salaryMin || salaryMax) {
      filter["salary.min"] = {};
      if (salaryMin) filter["salary.min"].$gte = Number(salaryMin);
      if (salaryMax) filter["salary.max"] = { $lte: Number(salaryMax) };
    }

    let sortOption = { createdAt: -1 };
    if (sort === "salary-high") sortOption = { "salary.max": -1 };
    if (sort === "salary-low") sortOption = { "salary.min": 1 };

    const total = await Job.countDocuments(filter);
    const jobs = await Job.find(filter)
      .sort(sortOption)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate("postedBy", "name email");

    res.json({ jobs, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get job by ID
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("postedBy", "name email");
    if (!job) return res.status(404).json({ message: "Job not found" });
    job.views += 1;
    await job.save();
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get recruiter's jobs
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Change job status
exports.updateJobStatus = async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, postedBy: req.user._id },
      { status: req.body.status },
      { new: true }
    );
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
