const { jsonPrompt } = require("./ai.service");
const { normalizeMatch, clampScore } = require("./ai.response-normalizer");

const normalizeSkill = (skill) => String(skill || "").trim().toLowerCase();

const scoreSkills = (jobSkills = [], candidateSkills = []) => {
  const candidateSet = new Set(candidateSkills.map(normalizeSkill).filter(Boolean));
  const normalizedJobSkills = jobSkills.map(normalizeSkill).filter(Boolean);
  const matchedSkills = normalizedJobSkills.filter((skill) => candidateSet.has(skill));
  const missingSkills = normalizedJobSkills.filter((skill) => !candidateSet.has(skill));
  const score = normalizedJobSkills.length ? Math.round((matchedSkills.length / normalizedJobSkills.length) * 100) : 40;
  return { score, matchedSkills, missingSkills, skillMatch: score };
};

const resumeQualityScore = (profile = {}, parsedResume = {}) => {
  let score = 20;
  if (profile.bio || parsedResume.parsedData?.summary) score += 15;
  if ((profile.skills || parsedResume.skills || []).length >= 5) score += 20;
  if ((profile.experience || parsedResume.experience || []).length) score += 15;
  if ((profile.projects || parsedResume.projects || []).length) score += 10;
  if ((profile.education || parsedResume.education || []).length) score += 10;
  if ((profile.certifications || parsedResume.certifications || []).length) score += 5;
  if (parsedResume.rawText || parsedResume.resumeUrl) score += 5;
  return clampScore(score);
};

const compareCandidateToJob = async ({ job, profile, parsedResume, application }) => {
  const candidateSkills = [...new Set([...(profile?.skills || []), ...(parsedResume?.skills || []), ...(parsedResume?.techStack || [])])];
  const base = {
    ...scoreSkills(job?.skills || [], candidateSkills),
    resumeQuality: resumeQualityScore(profile, parsedResume),
    explanation: "Score is based on overlapping skills and available profile completeness.",
  };
  const result = await jsonPrompt(
    `Compare candidate to job. Return advisory hiring intelligence only.
Job: ${JSON.stringify({
      title: job?.title,
      company: job?.company,
      location: job?.location,
      salary: job?.salary,
      skills: job?.skills,
      description: job?.description,
      qualifications: job?.qualifications,
      experienceLevel: job?.experienceLevel,
      workMode: job?.workMode,
    })}
Candidate: ${JSON.stringify({
      title: profile?.title,
      location: profile?.location,
      expectedSalaryMin: profile?.expectedSalaryMin,
      skills: candidateSkills,
      experienceYears: parsedResume?.experienceYears,
      education: profile?.education || parsedResume?.education,
      experience: profile?.experience || parsedResume?.experience,
      projects: profile?.projects || parsedResume?.projects,
      certifications: profile?.certifications || parsedResume?.certifications,
      parsedResume: parsedResume?.parsedData,
    })}
Application: ${JSON.stringify({ salaryExpectation: application?.salaryExpectation, availability: application?.availability })}
Base skill score: ${base.score}.
Return {"matchScore":0,"matchedSkills":[],"missingSkills":[],"experienceMatch":"","educationMatch":"","salaryFit":"","locationFit":"","recommendationReason":"","skillMatch":0,"resumeQuality":0,"riskFlags":[],"suggestedInterviewQuestions":[],"screeningSummary":""}.`,
    () => ({
      ...base,
      matchScore: base.score,
      recommendationReason: base.explanation,
      riskFlags: [],
      suggestedInterviewQuestions: [],
      screeningSummary: "",
    })
  );
  if (result.unavailable) return result;
  return normalizeMatch(result, base);
};

module.exports = {
  compareCandidateToJob,
  resumeQualityScore,
  scoreSkills,
};
