const mongoose = require("mongoose");
const Application = require("../models/application.model");
const Job = require("../models/job.model");
const Profile = require("../models/profile.model");
const SavedJob = require("../models/saved-job.model");
const User = require("../models/user.model");
const Company = require("../models/company.model");
const { callProvider, jsonPrompt, sanitizeText } = require("../services/ai.service");

const fail = (res, error) =>
  res.status(error.statusCode || 500).json({ success: false, message: error.message || "AI request failed" });

const unavailableResponse = (res, result) =>
  res.status(503).json({
    success: false,
    unavailable: true,
    fallback: true,
    provider: null,
    message: result.message,
  });

const candidateProfile = (userId) => Profile.findOne({ user: userId }).lean();

const scoreSkills = (jobSkills = [], profileSkills = []) => {
  const profileSet = new Set(profileSkills.map((skill) => String(skill).toLowerCase()));
  const normalizedJobSkills = jobSkills.map((skill) => String(skill).toLowerCase()).filter(Boolean);
  const matchedSkills = normalizedJobSkills.filter((skill) => profileSet.has(skill));
  const missingSkills = normalizedJobSkills.filter((skill) => !profileSet.has(skill));
  const score = normalizedJobSkills.length ? Math.round((matchedSkills.length / normalizedJobSkills.length) * 100) : 40;
  return { score, matchedSkills, missingSkills };
};

exports.careerAssistant = async (req, res) => {
  try {
    const message = sanitizeText(req.body.message, 2000);
    if (!message) return res.status(400).json({ success: false, message: "message is required" });
    const profile = await candidateProfile(req.user._id);
    const result = await jsonPrompt(
      `Candidate profile: ${JSON.stringify({
        title: profile?.title,
        skills: profile?.skills,
        experience: profile?.experience,
        preferences: {
          jobTypes: profile?.preferredJobTypes,
          workModes: profile?.preferredWorkModes,
          industries: profile?.preferredIndustries,
        },
      })}\nCandidate question: ${message}\nReturn {"reply":"...","suggestedActions":["..."]}.`,
      (text) => ({ reply: text, suggestedActions: [] })
    );
    if (result.unavailable) return unavailableResponse(res, result);
    res.json({ success: true, data: result });
  } catch (error) {
    fail(res, error);
  }
};

exports.resumeAnalyze = async (req, res) => {
  try {
    const profile = await candidateProfile(req.user._id);
    if (!profile?.resumeUrl && !req.body.resumeText) {
      return res.status(400).json({ success: false, message: "Upload a resume before requesting analysis." });
    }
    const result = await jsonPrompt(
      `Analyze this candidate resume/profile. PDF text extraction may be unavailable; use provided text and profile metadata only.\nResume text: ${sanitizeText(req.body.resumeText)}\nProfile: ${JSON.stringify({
        title: profile?.title,
        bio: profile?.bio,
        skills: profile?.skills,
        education: profile?.education,
        experience: profile?.experience,
        projects: profile?.projects,
        certifications: profile?.certifications,
        resumeUrl: profile?.resumeUrl ? "uploaded" : "missing",
      })}\nReturn {"resumeScore":0,"strengths":[],"weaknesses":[],"missingSkills":[],"atsSuggestions":[],"improvedSummary":"","projectSuggestions":[],"limitations":[]}.`,
      (text) => ({
        resumeScore: 0,
        strengths: [],
        weaknesses: [],
        missingSkills: [],
        atsSuggestions: [text],
        improvedSummary: "",
        projectSuggestions: [],
        limitations: ["Structured JSON was not returned by the AI provider."],
      })
    );
    if (result.unavailable) return unavailableResponse(res, result);
    res.json({ success: true, data: { ...result, limitations: [...(result.limitations || []), "PDF text extraction is not implemented yet; analysis uses profile metadata and any submitted resume text."] } });
  } catch (error) {
    fail(res, error);
  }
};

exports.jobRecommendations = async (req, res) => {
  try {
    const profile = await candidateProfile(req.user._id);
    if (!profile?.skills?.length) {
      return res.status(400).json({ success: false, message: "Complete your profile skills before requesting AI recommendations." });
    }
    const [jobs, saved, applications] = await Promise.all([
      Job.find({ status: "active" }).sort({ createdAt: -1 }).limit(40).lean(),
      SavedJob.find({ user: req.user._id }).select("job").lean(),
      Application.find({ candidate: req.user._id }).select("job").lean(),
    ]);
    const excluded = new Set([...saved, ...applications].map((item) => String(item.job)));
    const candidates = jobs.filter((job) => !excluded.has(String(job._id))).slice(0, 12);
    const compactJobs = candidates.map((job) => ({ id: job._id, title: job.title, company: job.company, location: job.location, skills: job.skills, jobType: job.jobType, workMode: job.workMode }));
    const result = await jsonPrompt(
      `Candidate skills/preferences: ${JSON.stringify({ skills: profile.skills, title: profile.title, preferredJobTypes: profile.preferredJobTypes, preferredWorkModes: profile.preferredWorkModes, preferredIndustries: profile.preferredIndustries })}\nJobs: ${JSON.stringify(compactJobs)}\nReturn {"recommendations":[{"jobId":"...","matchScore":0,"reason":"...","missingSkills":[]}]}.`,
      () => ({ recommendations: [] })
    );
    if (result.unavailable) return unavailableResponse(res, result);
    const byId = new Map(candidates.map((job) => [String(job._id), job]));
    const recommendations = (result.recommendations || [])
      .map((item) => ({ ...item, job: byId.get(String(item.jobId)) }))
      .filter((item) => item.job)
      .slice(0, 8);
    res.json({ success: true, data: { recommendations } });
  } catch (error) {
    fail(res, error);
  }
};

exports.generateJobDescription = async (req, res) => {
  try {
    const result = await jsonPrompt(
      `Create a job description preview from: ${JSON.stringify({
        title: sanitizeText(req.body.title, 120),
        skills: req.body.skills,
        experience: req.body.experience,
        workMode: req.body.workMode,
      })}\nReturn {"description":"","responsibilities":"","qualifications":""}.`,
      (text) => ({ description: text, responsibilities: "", qualifications: "" })
    );
    if (result.unavailable) return unavailableResponse(res, result);
    res.json({ success: true, data: result });
  } catch (error) {
    fail(res, error);
  }
};

exports.interviewQuestions = async (req, res) => {
  try {
    const result = await jsonPrompt(
      `Generate screening and interview questions for: ${JSON.stringify(req.body)}\nReturn {"questions":["..."],"evaluationRubric":["..."]}.`,
      (text) => ({ questions: text.split(/\n+/).filter(Boolean), evaluationRubric: [] })
    );
    if (result.unavailable) return unavailableResponse(res, result);
    res.json({ success: true, data: result });
  } catch (error) {
    fail(res, error);
  }
};

exports.candidateSummary = async (req, res) => {
  try {
    const text = sanitizeText(req.body.text || req.body.candidate || "", 3000);
    if (!text) return res.status(400).json({ success: false, message: "candidate text is required" });
    const result = await callProvider({
      system: "Summarize candidate fit for a recruiter. Be concise and advisory only.",
      user: text,
    });
    if (result.unavailable) return unavailableResponse(res, result);
    res.json({ success: true, data: { summary: result.text } });
  } catch (error) {
    fail(res, error);
  }
};

exports.matchScore = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.applicationId)) return res.status(400).json({ success: false, message: "Invalid application ID" });
    const application = await Application.findById(req.params.applicationId).populate("job").populate("candidate", "name email").lean();
    if (!application || String(application.job?.postedBy) !== String(req.user._id)) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }
    const profile = await Profile.findOne({ user: application.candidate._id }).lean();
    const base = scoreSkills(application.job.skills, profile?.skills || []);
    const result = await jsonPrompt(
      `Explain candidate match. Job: ${JSON.stringify({ title: application.job.title, skills: application.job.skills, description: application.job.description, qualifications: application.job.qualifications })}\nCandidate: ${JSON.stringify({ name: application.candidate.name, skills: profile?.skills, title: profile?.title, experience: profile?.experience, projects: profile?.projects })}\nBase skill score: ${base.score}. Return {"score":0,"matchedSkills":[],"missingSkills":[],"explanation":"","riskFlags":[]}.`,
      () => ({ ...base, explanation: "Score is based on overlapping skills.", riskFlags: [] })
    );
    if (result.unavailable) return unavailableResponse(res, result);
    res.json({ success: true, data: { ...result, advisory: true } });
  } catch (error) {
    fail(res, error);
  }
};

exports.adminInsights = async (_req, res) => {
  try {
    const [jobsBySkill, jobsByStatus, appsByStatus, usersByRole, approvals] = await Promise.all([
      Job.aggregate([{ $unwind: "$skills" }, { $group: { _id: "$skills", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 12 }]),
      Job.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Application.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
      Company.aggregate([{ $group: { _id: "$verificationStatus", count: { $sum: 1 } } }]),
    ]);
    const result = await jsonPrompt(
      `Create admin hiring insights from aggregates: ${JSON.stringify({ jobsBySkill, jobsByStatus, appsByStatus, usersByRole, approvals })}\nReturn {"topSkills":[],"hiringTrends":[],"applicationTrends":[],"recruiterActivitySummary":"","recommendations":[]}.`,
      () => ({
        topSkills: jobsBySkill.map((item) => item._id),
        hiringTrends: [],
        applicationTrends: [],
        recruiterActivitySummary: "",
        recommendations: [],
      })
    );
    if (result.unavailable) return unavailableResponse(res, result);
    res.json({ success: true, data: result });
  } catch (error) {
    fail(res, error);
  }
};
