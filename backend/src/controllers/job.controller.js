const Job = require("../models/job.model");


// =============================
// Create Job (Recruiter)
// =============================
exports.createJob = async (req, res) =>
{
  try
  {
    const job = await Job.create({
      ...req.body,
      postedBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: job,
    });
  } catch (error)
  {
    console.error("Create Job Error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// =============================
// Update Job
// =============================
exports.updateJob = async (req, res) =>
{
  try
  {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, postedBy: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!job)
    {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.json({
      success: true,
      data: job,
    });
  } catch (error)
  {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =============================
// Delete Job
// =============================
exports.deleteJob = async (req, res) =>
{
  try
  {
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      postedBy: req.user._id,
    });

    if (!job)
    {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error)
  {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =============================
// Search Jobs (Public)
// =============================
exports.searchJobs = async (req, res) =>
{
  try
  {
    const {
      page = 1,
      limit = 10,
      keyword,
      location,
      type,
      experience,
      salaryMin,
      salaryMax,
      sort,
    } = req.query;

    const filter = { status: "active" };

    // Text search
    if (keyword)
    {
      filter.$text = { $search: keyword };
    }

    // Location filter
    if (location)
    {
      filter.location = { $regex: location, $options: "i" };
    }

    // Job Type
    if (type)
    {
      filter.jobType = type;
    }

    // Experience
    if (experience)
    {
      filter.experienceLevel = experience;
    }

    // Salary Range (Fixed Properly)
    if (salaryMin || salaryMax)
    {
      filter["salary.min"] = { $gte: Number(salaryMin || 0) };
      filter["salary.max"] = { $lte: Number(salaryMax || 1000000000) };
    }

    // Sorting
    let sortOption = { createdAt: -1 };

    if (sort === "salary-high")
    {
      sortOption = { "salary.max": -1 };
    }

    if (sort === "salary-low")
    {
      sortOption = { "salary.min": 1 };
    }

    const total = await Job.countDocuments(filter);

    const jobs = await Job.find(filter)
      .sort(sortOption)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate("postedBy", "name email");

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: jobs,
    });

  } catch (error)
  {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =============================
// Get Job By ID (Atomic View Increment)
// =============================
exports.getJobById = async (req, res) =>
{
  try
  {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate("postedBy", "name email");

    if (!job)
    {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.json({
      success: true,
      data: job,
    });

  } catch (error)
  {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =============================
// Get Recruiter's Jobs
// =============================
exports.getMyJobs = async (req, res) =>
{
  try
  {
    if (!req.user)
    {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    const jobs = await Job.find({
      postedBy: req.user._id,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: jobs,
    });

  } catch (error)
  {
    console.error("getMyJobs error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =============================
// Update Job Status
// =============================
exports.updateJobStatus = async (req, res) =>
{
  try
  {
    const { status } = req.body;

    const allowedStatuses = ["active", "closed", "draft", "pending"];

    if (!allowedStatuses.includes(status))
    {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, postedBy: req.user._id },
      { status },
      { new: true }
    );

    if (!job)
    {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.json({
      success: true,
      data: job,
    });

  } catch (error)
  {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =============================
// Get Featured Jobs
// =============================

exports.getFeaturedJobs = async (_req, res) =>
{
  try
  {
    let jobs = await Job.find({
      featured: true,
      status: { $in: ["active", "Published", "published"] },
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .select("-__v")
      .populate("postedBy", "name email");

    if (jobs.length === 0)
    {
      jobs = await Job.find({
        status: { $in: ["active", "Published", "published"] },
      })
        .sort({ createdAt: -1 })
        .limit(6)
        .select("-__v")
        .populate("postedBy", "name email");
    }

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error)
  {
    res.status(500).json({
      success: false,
      message: "Failed to fetch featured jobs",
    });
  }
};
// exports.getFeaturedJobs = async (_req, res) => {
//   try {
//     const jobs = await Job.find({
//       featured: true,
//       status: "active",
//     })
//       .sort({ createdAt: -1 })
//       .limit(6)
//       .select("-__v")
//       .populate("postedBy", "name");

//     res.status(200).json({
//       success: true,
//       count: jobs.length,
//       data: jobs,
//     });

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch featured jobs",
//     });
//   }
// };
