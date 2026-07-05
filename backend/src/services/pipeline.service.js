const mongoose = require("mongoose");
const Application = require("../models/application.model");
const Job = require("../models/job.model");
const Profile = require("../models/profile.model");
const RecruiterNote = require("../models/recruiter-note.model");
const { PIPELINE_STAGES, LEGACY_STATUS_BY_STAGE } = Application;

const STAGE_LABELS = Object.freeze({
  applied: "Applied",
  screening: "Screening",
  shortlisted: "Shortlisted",
  assessment: "Assessment",
  interview_scheduled: "Interview Scheduled",
  interview_completed: "Interview Completed",
  offer_sent: "Offer Sent",
  offer_accepted: "Offer Accepted",
  offer_declined: "Offer Declined",
  rejected: "Rejected",
  hired: "Hired",
  withdrawn: "Withdrawn",
});

const sortableFields = Object.freeze({
  newest: { appliedAt: -1, createdAt: -1 },
  oldest: { appliedAt: 1, createdAt: 1 },
  updated: { updatedAt: -1 },
  candidate: { "candidate.name": 1 },
});

const escapeRegex = (value) => String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const normalizeTags = (tags = []) => [...new Set(tags.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean))].slice(0, 20);
const stageLabel = (stage) => STAGE_LABELS[stage] || String(stage || "").replace(/_/g, " ");
const assertStage = (stage) => {
  if (!PIPELINE_STAGES.includes(stage)) {
    const error = new Error("Invalid pipeline stage");
    error.statusCode = 400;
    throw error;
  }
};

const recruiterJobFilter = (user, jobId) => {
  const filter = {};
  if (jobId) filter._id = jobId;
  if (user.role !== "admin") filter.postedBy = user._id;
  return filter;
};

const getAccessibleJobIds = async (user, jobId) => {
  if (jobId && !mongoose.isValidObjectId(jobId)) {
    const error = new Error("Invalid job ID");
    error.statusCode = 400;
    throw error;
  }
  const jobs = await Job.find(recruiterJobFilter(user, jobId)).select("_id").lean();
  return jobs.map((job) => job._id);
};

const applicationBaseMatch = async (user, query = {}) => {
  const jobIds = await getAccessibleJobIds(user, query.jobId);
  if (!jobIds.length) return { _id: { $exists: false } };

  const match = { job: { $in: jobIds } };
  if (query.stage && query.stage !== "all") {
    assertStage(query.stage);
    match.pipelineStage = query.stage;
  }
  if (query.status && query.status !== "all") match.status = query.status;
  if (query.tags) {
    const tags = normalizeTags(String(query.tags).split(","));
    if (tags.length) match.tags = { $all: tags };
  }
  return match;
};

const buildProfileMatch = (query = {}) => {
  const profileMatch = {};
  if (query.skills) {
    const skills = String(query.skills).split(",").map((item) => item.trim()).filter(Boolean);
    if (skills.length) profileMatch["profile.skills"] = { $in: skills.map((skill) => new RegExp(`^${escapeRegex(skill)}$`, "i")) };
  }
  if (query.location) profileMatch["profile.location"] = { $regex: escapeRegex(query.location), $options: "i" };
  if (query.experience) profileMatch["profile.candidateType"] = query.experience;
  if (query.education) profileMatch["profile.education.degree"] = { $regex: escapeRegex(query.education), $options: "i" };
  if (query.salaryMin) profileMatch["profile.expectedSalaryMin"] = { ...(profileMatch["profile.expectedSalaryMin"] || {}), $gte: Number(query.salaryMin) };
  if (query.salaryMax) profileMatch["profile.expectedSalaryMin"] = { ...(profileMatch["profile.expectedSalaryMin"] || {}), $lte: Number(query.salaryMax) };
  return profileMatch;
};

const listPipeline = async ({ user, query = {} }) => {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 100), 1), 250);
  const match = await applicationBaseMatch(user, query);
  const search = String(query.search || "").trim();
  const profileMatch = buildProfileMatch(query);
  const sort = sortableFields[query.sort] || sortableFields.newest;

  const pipeline = [
    { $match: match },
    { $lookup: { from: "users", localField: "candidate", foreignField: "_id", as: "candidate" } },
    { $unwind: "$candidate" },
    { $lookup: { from: "jobs", localField: "job", foreignField: "_id", as: "job" } },
    { $unwind: "$job" },
    { $lookup: { from: "profiles", localField: "candidate._id", foreignField: "user", as: "profile" } },
    { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },
  ];

  if (search) {
    const rx = { $regex: escapeRegex(search), $options: "i" };
    pipeline.push({ $match: { $or: [
      { "candidate.name": rx },
      { "candidate.email": rx },
      { "job.title": rx },
      { "job.company": rx },
      { tags: rx },
    ] } });
  }
  if (Object.keys(profileMatch).length) pipeline.push({ $match: profileMatch });

  pipeline.push(
    { $sort: sort },
    { $facet: {
      applications: [
        { $skip: (page - 1) * limit },
        { $limit: limit },
        { $project: {
          status: 1,
          pipelineStage: 1,
          tags: 1,
          coverLetter: 1,
          appliedAt: 1,
          updatedAt: 1,
          timeline: { $slice: ["$timeline", -8] },
          candidate: { _id: "$candidate._id", name: "$candidate.name", email: "$candidate.email" },
          job: { _id: "$job._id", title: "$job.title", company: "$job.company", location: "$job.location" },
          profile: {
            title: "$profile.title",
            candidateType: "$profile.candidateType",
            resumeUrl: "$profile.resumeUrl",
            location: "$profile.location",
            skills: "$profile.skills",
            education: "$profile.education",
            experience: "$profile.experience",
            projects: "$profile.projects",
            certifications: "$profile.certifications",
            socials: "$profile.socials",
            expectedSalaryMin: "$profile.expectedSalaryMin",
          },
        } },
      ],
      total: [{ $count: "count" }],
      counters: [{ $group: { _id: "$pipelineStage", count: { $sum: 1 } } }],
    } }
  );

  const [result] = await Application.aggregate(pipeline);
  const total = result?.total?.[0]?.count || 0;
  const counters = Object.fromEntries(PIPELINE_STAGES.map((stage) => [stage, 0]));
  for (const row of result?.counters || []) counters[row._id] = row.count;

  return {
    applications: result?.applications || [],
    counters,
    stages: PIPELINE_STAGES.map((key) => ({ key, label: STAGE_LABELS[key], count: counters[key] || 0 })),
    total,
    page,
    pages: Math.max(Math.ceil(total / limit), 1),
  };
};

const getOwnedApplication = async ({ user, applicationId }) => {
  if (!mongoose.isValidObjectId(applicationId)) {
    const error = new Error("Invalid application ID");
    error.statusCode = 400;
    throw error;
  }
  const application = await Application.findById(applicationId).populate("job", "title company postedBy").populate("candidate", "name email").lean();
  if (!application || (user.role !== "admin" && String(application.job?.postedBy) !== String(user._id))) {
    const error = new Error("Application not found");
    error.statusCode = 404;
    throw error;
  }
  return application;
};

const getApplicationDetails = async ({ user, applicationId }) => {
  const application = await getOwnedApplication({ user, applicationId });
  const [profile, notes] = await Promise.all([
    Profile.findOne({ user: application.candidate._id }).lean(),
    RecruiterNote.find({
      recruiter: user.role === "admin" ? { $exists: true } : user._id,
      candidate: application.candidate._id,
      job: application.job._id,
    }).sort({ createdAt: -1 }).populate("recruiter", "name email").lean(),
  ]);
  return { application, profile, notes };
};

const moveApplication = async ({ user, applicationId, stage, reason = "" }) => {
  assertStage(stage);
  const owned = await getOwnedApplication({ user, applicationId });
  const application = await Application.findById(applicationId);
  const fromStage = application.pipelineStage || "applied";
  application.pipelineStage = stage;
  application.status = LEGACY_STATUS_BY_STAGE[stage] || application.status;
  application.timeline.push({
    type: "stage_changed",
    title: `${stageLabel(fromStage)} to ${stageLabel(stage)}`,
    description: reason,
    fromStage,
    toStage: stage,
    actor: user._id,
  });
  await application.save();
  return { application: await Application.findById(application._id).populate("job", "title company postedBy").populate("candidate", "name email").lean(), owned };
};

const setTags = async ({ user, applicationId, tags }) => {
  await getOwnedApplication({ user, applicationId });
  const application = await Application.findById(applicationId);
  application.tags = normalizeTags(tags);
  application.timeline.push({
    type: "tags_updated",
    title: "Candidate tags updated",
    description: application.tags.join(", "),
    actor: user._id,
  });
  await application.save();
  return application.toObject();
};

const addNote = async ({ user, applicationId, content, mentions = [] }) => {
  const owned = await getOwnedApplication({ user, applicationId });
  const text = String(content || "").trim();
  if (!text) {
    const error = new Error("Note content is required");
    error.statusCode = 400;
    throw error;
  }
  const note = await RecruiterNote.create({
    recruiter: user._id,
    candidate: owned.candidate._id,
    job: owned.job._id,
    application: owned._id,
    content: text,
    mentions,
  });
  await Application.findByIdAndUpdate(applicationId, {
    $push: {
      timeline: {
        type: "note_added",
        title: "Recruiter note added",
        description: text.slice(0, 180),
        actor: user._id,
        createdAt: new Date(),
      },
    },
  });
  return note.populate("recruiter", "name email");
};

const updateNote = async ({ user, noteId, content }) => {
  const note = await RecruiterNote.findOne({ _id: noteId, recruiter: user._id });
  if (!note) {
    const error = new Error("Note not found");
    error.statusCode = 404;
    throw error;
  }
  note.content = String(content || "").trim();
  await note.save();
  return note.populate("recruiter", "name email");
};

const deleteNote = async ({ user, noteId }) => {
  const note = await RecruiterNote.findOneAndDelete({ _id: noteId, recruiter: user._id });
  if (!note) {
    const error = new Error("Note not found");
    error.statusCode = 404;
    throw error;
  }
  return note;
};

const bulkMove = async ({ user, applicationIds, stage }) => {
  assertStage(stage);
  const ids = [...new Set((applicationIds || []).filter(mongoose.isValidObjectId))];
  if (!ids.length) return { matched: 0, modified: 0 };
  const accessible = await Application.find({ _id: { $in: ids } }).populate("job", "postedBy").select("_id job pipelineStage").lean();
  const allowed = accessible.filter((application) => user.role === "admin" || String(application.job?.postedBy) === String(user._id)).map((application) => application._id);
  if (!allowed.length) return { matched: 0, modified: 0 };
  const result = await Application.updateMany(
    { _id: { $in: allowed } },
    {
      $set: { pipelineStage: stage, status: LEGACY_STATUS_BY_STAGE[stage] || "applied" },
      $push: { timeline: { type: "bulk_stage_changed", title: `Moved to ${stageLabel(stage)}`, toStage: stage, actor: user._id, createdAt: new Date() } },
    }
  );
  return { matched: allowed.length, modified: result.modifiedCount || 0 };
};

const analytics = async ({ user, jobId }) => {
  const match = await applicationBaseMatch(user, { jobId });
  const [perJob, funnel, outcomes, avgHiring] = await Promise.all([
    Application.aggregate([
      { $match: match },
      { $lookup: { from: "jobs", localField: "job", foreignField: "_id", as: "job" } },
      { $unwind: "$job" },
      { $group: { _id: "$job._id", title: { $first: "$job.title" }, company: { $first: "$job.company" }, applications: { $sum: 1 } } },
      { $sort: { applications: -1 } },
      { $limit: 10 },
    ]),
    Application.aggregate([{ $match: match }, { $group: { _id: "$pipelineStage", count: { $sum: 1 } } }]),
    Application.aggregate([{ $match: match }, { $group: { _id: "$pipelineStage", count: { $sum: 1 } } }]),
    Application.aggregate([
      { $match: { ...match, pipelineStage: { $in: ["hired", "offer_accepted"] } } },
      { $project: { days: { $divide: [{ $subtract: ["$updatedAt", "$appliedAt"] }, 1000 * 60 * 60 * 24] } } },
      { $group: { _id: null, averageDays: { $avg: "$days" } } },
    ]),
  ]);
  const total = funnel.reduce((sum, row) => sum + row.count, 0);
  const outcomeMap = Object.fromEntries(outcomes.map((row) => [row._id, row.count]));
  const offers = (outcomeMap.offer_sent || 0) + (outcomeMap.offer_accepted || 0) + (outcomeMap.offer_declined || 0) + (outcomeMap.hired || 0);
  const accepted = (outcomeMap.offer_accepted || 0) + (outcomeMap.hired || 0);
  return {
    applicationsPerJob: perJob,
    funnel: PIPELINE_STAGES.map((stage) => ({ stage, label: STAGE_LABELS[stage], count: outcomeMap[stage] || 0 })),
    conversionRate: total ? Number((((outcomeMap.hired || 0) / total) * 100).toFixed(1)) : 0,
    averageHiringTimeDays: Number((avgHiring[0]?.averageDays || 0).toFixed(1)),
    offerAcceptanceRate: offers ? Number(((accepted / offers) * 100).toFixed(1)) : 0,
    topPerformingJobs: perJob.slice(0, 5),
    mostActiveRecruiters: user.role === "admin" ? [] : [{ recruiter: user.name, applications: total }],
  };
};

module.exports = {
  PIPELINE_STAGES,
  STAGE_LABELS,
  addNote,
  analytics,
  bulkMove,
  deleteNote,
  getApplicationDetails,
  listPipeline,
  moveApplication,
  setTags,
  updateNote,
};
