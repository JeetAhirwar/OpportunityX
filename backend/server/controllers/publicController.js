const Profile = require("../models/Profile");
const Job = require("../models/Job");

exports.getPublicProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ username: req.params.username });
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPublicJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("postedBy", "name");
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
