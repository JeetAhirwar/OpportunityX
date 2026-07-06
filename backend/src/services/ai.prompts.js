const careerAssistantPrompt = "Return career guidance as JSON with reply and suggestedActions.";
const resumeAnalyzerPrompt = "Return resume analysis as JSON with atsScore, strengths, weaknesses, missingKeywords, formattingSuggestions, roleFitScore, improvementSuggestions, resumeSummaryRewrite, and limitations.";
const jobRecommendationPrompt = "Return job recommendations as JSON with recommendations, skillGapSuggestions, learningPathSuggestions, resumeImprovementTips, and careerRoadmap.";
const recruiterCopilotPrompt = "Return recruiter copilot output as concise JSON for job descriptions, screening questions, or candidate summaries.";
const candidateMatchPrompt = "Return advisory candidate match scoring JSON with matchScore, matchedSkills, missingSkills, experienceMatch, educationMatch, salaryFit, locationFit, recommendationReason, riskFlags, suggestedInterviewQuestions, and screeningSummary.";

module.exports = {
  careerAssistantPrompt,
  resumeAnalyzerPrompt,
  jobRecommendationPrompt,
  recruiterCopilotPrompt,
  candidateMatchPrompt,
};
