const careerAssistantPrompt = "Return career guidance as JSON with reply and suggestedActions.";
const resumeAnalyzerPrompt = "Return resume analysis as JSON with score, strengths, weaknesses, skills, ATS suggestions, and limitations.";
const jobRecommendationPrompt = "Return job recommendations as JSON with jobId, matchScore, reason, and missingSkills.";
const recruiterCopilotPrompt = "Return recruiter copilot output as concise JSON for job descriptions, screening questions, or candidate summaries.";
const candidateMatchPrompt = "Return advisory candidate match scoring JSON with score, matchedSkills, missingSkills, explanation, and riskFlags.";

module.exports = {
  careerAssistantPrompt,
  resumeAnalyzerPrompt,
  jobRecommendationPrompt,
  recruiterCopilotPrompt,
  candidateMatchPrompt,
};
