const mongoose = require("mongoose");
const Application = require("../models/application.model");
const Job = require("../models/job.model");
const Profile = require("../models/profile.model");
const SavedJob = require("../models/saved-job.model");
const User = require("../models/user.model");
const Company = require("../models/company.model");
const { callProvider, jsonPrompt, sanitizeText } = require("../services/ai.service");
const { ensureParsedResume, getParsedResume, analyzeResume: analyzeResumeService } = require("../services/ai.resume.service");
const { compareCandidateToJob } = require("../services/ai.match.service");
const { getAdminHiringIntelligence } = require("../services/ai.scoring.service");
const { normalizeCandidateRecommendations } = require("../services/ai.response-normalizer");

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

exports.careerAssistant = async (req, res) => {
  try {
    const message = sanitizeText(req.body.message, 2000);
    if (!message) return res.status(400).json({ success: false, message: "message is required" });
    const profile = await candidateProfile(req.user._id);
    const parsedResume = await getParsedResume(req.user._id);
    const result = await jsonPrompt(
      `Candidate profile: ${JSON.stringify({
        title: profile?.title,
        skills: [...new Set([...(profile?.skills || []), ...(parsedResume?.skills || [])])],
        experience: profile?.experience,
        resumeSummary: parsedResume?.parsedData?.summary,
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
    const [parsedResume, targetJob] = await Promise.all([
      ensureParsedResume({ candidateId: req.user._id, profile }),
      req.body.jobId && mongoose.isValidObjectId(req.body.jobId) ? Job.findById(req.body.jobId).lean() : null,
    ]);
    const result = await analyzeResumeService({ profile, parsedResume, resumeText: req.body.resumeText, targetJob });
    if (result.unavailable) return unavailableResponse(res, result);
    res.json({
      success: true,
      data: {
        ...result,
        parsedResume: parsedResume
          ? {
              parsedData: parsedResume.parsedData,
              skills: parsedResume.skills,
              experienceYears: parsedResume.experienceYears,
              techStack: parsedResume.techStack,
              lastAnalyzedAt: parsedResume.lastAnalyzedAt,
            }
          : null,
      },
    });
  } catch (error) {
    fail(res, error);
  }
};

exports.parsedResume = async (req, res) => {
  try {
    const profile = await candidateProfile(req.user._id);
    const parsedResume = await ensureParsedResume({ candidateId: req.user._id, profile });
    if (!parsedResume) return res.status(404).json({ success: false, message: "Parsed resume not found. Upload a PDF or DOCX resume first." });
    res.json({
      success: true,
      data: {
        resumeUrl: parsedResume.resumeUrl,
        parsedData: parsedResume.parsedData,
        atsScore: parsedResume.atsScore,
        skills: parsedResume.skills,
        techStack: parsedResume.techStack,
        experienceYears: parsedResume.experienceYears,
        education: parsedResume.education,
        projects: parsedResume.projects,
        certifications: parsedResume.certifications,
        lastAnalyzedAt: parsedResume.lastAnalyzedAt,
      },
    });
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
    const [jobs, saved, applications, parsedResume] = await Promise.all([
      Job.find({ status: "active" }).sort({ createdAt: -1 }).limit(40).lean(),
      SavedJob.find({ user: req.user._id }).select("job").lean(),
      Application.find({ candidate: req.user._id }).select("job").lean(),
      getParsedResume(req.user._id),
    ]);
    const excluded = new Set([...saved, ...applications].map((item) => String(item.job)));
    const candidates = jobs.filter((job) => !excluded.has(String(job._id))).slice(0, 12);
    const compactJobs = candidates.map((job) => ({
      id: job._id,
      title: job.title,
      company: job.company,
      location: job.location,
      skills: job.skills,
      salary: job.salary,
      jobType: job.jobType,
      workMode: job.workMode,
      experienceLevel: job.experienceLevel,
    }));
    const result = await jsonPrompt(
      `Candidate skills/preferences/resume: ${JSON.stringify({
        skills: [...new Set([...(profile.skills || []), ...(parsedResume?.skills || [])])],
        title: profile.title,
        expectedSalaryMin: profile.expectedSalaryMin,
        preferredJobTypes: profile.preferredJobTypes,
        preferredWorkModes: profile.preferredWorkModes,
        preferredIndustries: profile.preferredIndustries,
        parsedResume: parsedResume?.parsedData,
        techStack: parsedResume?.techStack,
      })}\nJobs: ${JSON.stringify(compactJobs)}\nReturn {"recommendations":[{"jobId":"...","matchScore":0,"reason":"...","missingSkills":[]}],"skillGapSuggestions":[],"learningPathSuggestions":[],"resumeImprovementTips":[],"careerRoadmap":[]}.`,
      () => ({ recommendations: [], skillGapSuggestions: [], learningPathSuggestions: [], resumeImprovementTips: [], careerRoadmap: [] })
    );
    if (result.unavailable) return unavailableResponse(res, result);
    const normalized = normalizeCandidateRecommendations(result);
    const byId = new Map(candidates.map((job) => [String(job._id), job]));
    const recommendations = (normalized.recommendations || [])
      .map((item) => ({ ...item, job: byId.get(String(item.jobId)) }))
      .filter((item) => item.job)
      .slice(0, 8);
    res.json({ success: true, data: { ...normalized, recommendations } });
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
    const [profile, parsedResume] = await Promise.all([
      Profile.findOne({ user: application.candidate._id }).lean(),
      getParsedResume(application.candidate._id, true),
    ]);
    const result = await compareCandidateToJob({ job: application.job, profile, parsedResume, application });
    if (result.unavailable) return unavailableResponse(res, result);
    res.json({ success: true, data: { ...result, advisory: true } });
  } catch (error) {
    fail(res, error);
  }
};

exports.adminInsights = async (_req, res) => {
  try {
    const [jobsBySkill, jobsByStatus, appsByStatus, usersByRole, approvals, hiringIntelligence] = await Promise.all([
      Job.aggregate([{ $unwind: "$skills" }, { $group: { _id: "$skills", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 12 }]),
      Job.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Application.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
      Company.aggregate([{ $group: { _id: "$verificationStatus", count: { $sum: 1 } } }]),
      getAdminHiringIntelligence(),
    ]);
    const result = await jsonPrompt(
      `Create admin hiring intelligence insights from aggregates: ${JSON.stringify({ jobsBySkill, jobsByStatus, appsByStatus, usersByRole, approvals, hiringIntelligence })}\nReturn {"topSkills":[],"hiringTrends":[],"applicationTrends":[],"recruiterActivitySummary":"","recommendations":[],"resumeQualityTrends":[],"skillDemandTrends":[]}.`,
      () => ({
        topSkills: jobsBySkill.map((item) => item._id),
        hiringTrends: [],
        applicationTrends: [],
        recruiterActivitySummary: "",
        recommendations: [],
        resumeQualityTrends: [],
        skillDemandTrends: [],
      })
    );
    if (result.unavailable) return unavailableResponse(res, result);
    res.json({ success: true, data: { ...result, hiringIntelligence } });
  } catch (error) {
    fail(res, error);
  }
};
