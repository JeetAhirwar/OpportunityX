const path = require("path");
const ParsedResume = require("../models/parsed-resume.model");
const { jsonPrompt, sanitizeText } = require("./ai.service");
const { normalizeResumeAnalysis } = require("./ai.response-normalizer");
const { parseResumeFile } = require("./resume-parser.service");

const resumeAbsolutePath = (resumeUrl) => path.join(__dirname, "..", resumeUrl.replace(/^\/+/, ""));

const upsertParsedResumeFromUpload = async ({ candidateId, resumeUrl, file }) => {
  const filePath = file?.path || resumeAbsolutePath(resumeUrl);
  const { rawText, parsedData } = await parseResumeFile({ filePath, mimeType: file?.mimetype });
  return ParsedResume.findOneAndUpdate(
    { candidate: candidateId },
    {
      $set: {
        candidate: candidateId,
        resumeUrl,
        fileName: file?.originalname || "",
        mimeType: file?.mimetype || "",
        rawText,
        parsedData,
        skills: parsedData.skills || [],
        techStack: parsedData.techStack || [],
        experienceYears: parsedData.yearsOfExperience || 0,
        education: parsedData.education || [],
        experience: parsedData.experience || [],
        projects: parsedData.projects || [],
        certifications: parsedData.certifications || [],
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();
};

const getParsedResume = (candidateId, includeText = false) => {
  const query = ParsedResume.findOne({ candidate: candidateId });
  if (includeText) query.select("+rawText");
  return query.lean();
};

const ensureParsedResume = async ({ candidateId, profile }) => {
  const existing = await getParsedResume(candidateId, true);
  if (existing || !profile?.resumeUrl) return existing;
  try {
    const { rawText, parsedData } = await parseResumeFile({ filePath: resumeAbsolutePath(profile.resumeUrl) });
    return ParsedResume.findOneAndUpdate(
      { candidate: candidateId },
      {
        $set: {
          candidate: candidateId,
          resumeUrl: profile.resumeUrl,
          rawText,
          parsedData,
          skills: parsedData.skills || [],
          techStack: parsedData.techStack || [],
          experienceYears: parsedData.yearsOfExperience || 0,
          education: parsedData.education || [],
          experience: parsedData.experience || [],
          projects: parsedData.projects || [],
          certifications: parsedData.certifications || [],
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).select("+rawText").lean();
  } catch {
    return null;
  }
};

const analyzeResume = async ({ profile, parsedResume, resumeText = "", targetJob = null }) => {
  const sourceText = sanitizeText(resumeText || parsedResume?.rawText || "", 9000);
  const result = await jsonPrompt(
    `Analyze this candidate resume for ATS and hiring readiness. Use only the supplied resume/profile/job fields.
Resume text: ${sourceText}
Parsed resume: ${JSON.stringify(parsedResume?.parsedData || {})}
Candidate profile: ${JSON.stringify({
      title: profile?.title,
      bio: profile?.bio,
      skills: profile?.skills,
      education: profile?.education,
      experience: profile?.experience,
      projects: profile?.projects,
      certifications: profile?.certifications,
    })}
Target job: ${targetJob ? JSON.stringify({
      title: targetJob.title,
      skills: targetJob.skills,
      description: targetJob.description,
      qualifications: targetJob.qualifications,
      experienceLevel: targetJob.experienceLevel,
    }) : "none"}
Return {"atsScore":0,"strengths":[],"weaknesses":[],"missingKeywords":[],"formattingSuggestions":[],"roleFitScore":0,"improvementSuggestions":[],"resumeSummaryRewrite":"","limitations":[]}.`,
    () => ({
      atsScore: 0,
      strengths: [],
      weaknesses: [],
      missingKeywords: [],
      formattingSuggestions: [],
      roleFitScore: 0,
      improvementSuggestions: ["AI returned an unstructured response. Review resume clarity, measurable impact, and keyword alignment manually."],
      resumeSummaryRewrite: "",
      limitations: ["Structured JSON was not returned by the AI provider."],
    })
  );
  if (result.unavailable) return result;
  const normalized = normalizeResumeAnalysis(result);
  if (parsedResume?._id) {
    await ParsedResume.findByIdAndUpdate(parsedResume._id, {
      $set: {
        atsScore: normalized.atsScore,
        analysis: normalized,
        lastAnalyzedAt: new Date(),
      },
    });
  }
  return normalized;
};

module.exports = {
  analyzeResume,
  ensureParsedResume,
  getParsedResume,
  upsertParsedResumeFromUpload,
};
