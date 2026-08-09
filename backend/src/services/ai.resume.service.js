const path = require("path");
const ParsedResume = require("../models/parsed-resume.model");
const { jsonPrompt, sanitizeText } = require("./ai.service");
const { normalizeResumeAnalysis } = require("./ai.response-normalizer");
const { parseResumeFile } = require("./resume-parser.service");

const UPLOADS_ROOT = path.resolve(__dirname, "..", "uploads");

const URL_ENCODED_TRAVERSAL = /%2e|%2f|%5c|%c0/i;
const CLOUDINARY_HOST_RE = /^https:\/\/(?:[\w-]+\.)*res\.cloudinary\.com\/.+$/i;
const MAX_RESUME_BYTES = 10 * 1024 * 1024;

const mimeTypeFromUrl = (url) => {
  const pathPart = url.split(/[?#]/)[0];
  if (/\.docx$/i.test(pathPart)) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  return "application/pdf";
};

const fetchResumeBuffer = async (url) => {
  if (!CLOUDINARY_HOST_RE.test(url)) throw new Error("Unsupported resume source");
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to download resume");
  const contentLength = Number(response.headers.get("content-length") || 0);
  if (contentLength > MAX_RESUME_BYTES) throw new Error("Resume file is too large");
  const arrayBuffer = await response.arrayBuffer();
  if (arrayBuffer.byteLength > MAX_RESUME_BYTES) throw new Error("Resume file is too large");
  return Buffer.from(arrayBuffer);
};

const assertInsideUploads = (absolutePath) => {
  const root = path.resolve(UPLOADS_ROOT);
  const target = path.resolve(absolutePath);
  const normalizeKey = (p) => (process.platform === "win32" ? p.toLowerCase() : p);
  const rootKey = normalizeKey(root);
  const targetKey = normalizeKey(target);
  if (targetKey !== rootKey && !targetKey.startsWith(rootKey + path.sep)) {
    throw new Error("Resume path must be inside the uploads directory");
  }
};

const resolveResumePath = (value) => {
  const raw = String(value || "").trim();
  if (!raw) throw new Error("Resume path is required");

  if (URL_ENCODED_TRAVERSAL.test(raw)) {
    throw new Error("Resume path is invalid");
  }

  if (/^[\\/]?uploads[\\/]/i.test(raw)) {
    const relative = raw.replace(/^[\\/]+/, "").replace(/^uploads[\\/]/i, "");
    const absolute = path.resolve(UPLOADS_ROOT, relative);
    assertInsideUploads(absolute);
    return absolute;
  }

  if (path.isAbsolute(raw)) {
    const absolute = path.normalize(raw);
    assertInsideUploads(absolute);
    return absolute;
  }

  const absolute = path.resolve(UPLOADS_ROOT, raw);
  assertInsideUploads(absolute);
  return absolute;
};

const upsertParsedResumeFromUpload = async ({ candidateId, resumeUrl, file, buffer, mimeType, fileName }) => {
  const sourceBuffer = buffer || file?.buffer;
  const sourceMimeType = mimeType || file?.mimetype;
  const { rawText, parsedData } = await parseResumeFile({ buffer: sourceBuffer, mimeType: sourceMimeType });
  return ParsedResume.findOneAndUpdate(
    { candidate: candidateId },
    {
      $set: {
        candidate: candidateId,
        resumeUrl,
        fileName: fileName || file?.originalname || "",
        mimeType: sourceMimeType || "",
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
    const resumeUrl = profile.resumeUrl;
    let input;
    if (CLOUDINARY_HOST_RE.test(resumeUrl)) {
      input = { buffer: await fetchResumeBuffer(resumeUrl), mimeType: mimeTypeFromUrl(resumeUrl) };
    } else if (/^https?:\/\//i.test(resumeUrl)) {
      return null;
    } else {
      input = { filePath: resolveResumePath(resumeUrl) };
    }
    const { rawText, parsedData } = await parseResumeFile(input);
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
  fetchResumeBuffer,
  getParsedResume,
  mimeTypeFromUrl,
  resolveResumePath,
  upsertParsedResumeFromUpload,
};
