const clampScore = (value, fallback = 0) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(0, Math.min(100, Math.round(number)));
};

const asArray = (value) => {
  if (Array.isArray(value)) return value.filter((item) => item !== null && item !== undefined);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
};

const asString = (value, fallback = "") => {
  if (typeof value !== "string") return fallback;
  return value.trim();
};

const normalizeResumeAnalysis = (value = {}) => {
  const atsScore = clampScore(value.atsScore ?? value.resumeScore ?? value.score, 0);
  return {
    atsScore,
    resumeScore: atsScore,
    strengths: asArray(value.strengths),
    weaknesses: asArray(value.weaknesses),
    missingKeywords: asArray(value.missingKeywords ?? value.missingSkills),
    missingSkills: asArray(value.missingSkills ?? value.missingKeywords),
    formattingSuggestions: asArray(value.formattingSuggestions ?? value.atsSuggestions),
    atsSuggestions: asArray(value.atsSuggestions ?? value.formattingSuggestions),
    roleFitScore: clampScore(value.roleFitScore, atsScore),
    improvementSuggestions: asArray(value.improvementSuggestions ?? value.projectSuggestions),
    improvedSummary: asString(value.improvedSummary ?? value.resumeSummaryRewrite),
    resumeSummaryRewrite: asString(value.resumeSummaryRewrite ?? value.improvedSummary),
    limitations: asArray(value.limitations),
  };
};

const normalizeMatch = (value = {}, fallback = {}) => ({
  matchScore: clampScore(value.matchScore ?? value.score, fallback.score || 0),
  score: clampScore(value.score ?? value.matchScore, fallback.score || 0),
  matchedSkills: asArray(value.matchedSkills ?? fallback.matchedSkills),
  missingSkills: asArray(value.missingSkills ?? fallback.missingSkills),
  experienceMatch: asString(value.experienceMatch, fallback.experienceMatch || ""),
  educationMatch: asString(value.educationMatch, fallback.educationMatch || ""),
  salaryFit: asString(value.salaryFit, fallback.salaryFit || ""),
  locationFit: asString(value.locationFit, fallback.locationFit || ""),
  recommendationReason: asString(value.recommendationReason ?? value.reason ?? value.explanation, fallback.explanation || ""),
  explanation: asString(value.explanation ?? value.recommendationReason ?? value.reason, fallback.explanation || ""),
  skillMatch: clampScore(value.skillMatch, fallback.skillMatch ?? fallback.score ?? 0),
  resumeQuality: clampScore(value.resumeQuality, fallback.resumeQuality ?? 0),
  riskFlags: asArray(value.riskFlags),
  suggestedInterviewQuestions: asArray(value.suggestedInterviewQuestions ?? value.interviewQuestions),
  screeningSummary: asString(value.screeningSummary, ""),
});

const normalizeCandidateRecommendations = (value = {}) => ({
  recommendations: asArray(value.recommendations).map((item) => ({
    ...item,
    matchScore: clampScore(item.matchScore ?? item.score, 0),
    missingSkills: asArray(item.missingSkills),
  })),
  skillGapSuggestions: asArray(value.skillGapSuggestions),
  learningPathSuggestions: asArray(value.learningPathSuggestions),
  resumeImprovementTips: asArray(value.resumeImprovementTips),
  careerRoadmap: asArray(value.careerRoadmap),
});

module.exports = {
  asArray,
  asString,
  clampScore,
  normalizeCandidateRecommendations,
  normalizeMatch,
  normalizeResumeAnalysis,
};
