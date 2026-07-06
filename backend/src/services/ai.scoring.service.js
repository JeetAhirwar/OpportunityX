const Application = require("../models/application.model");
const Job = require("../models/job.model");
const ParsedResume = require("../models/parsed-resume.model");

const getAdminHiringIntelligence = async () => {
  const [resumeScores, jobsBySkill, applicationsByStatus] = await Promise.all([
    ParsedResume.aggregate([
      { $group: { _id: null, avgAtsScore: { $avg: "$atsScore" }, avgExperience: { $avg: "$experienceYears" }, analyzedResumes: { $sum: 1 } } },
    ]),
    Job.aggregate([{ $unwind: "$skills" }, { $group: { _id: "$skills", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 12 }]),
    Application.aggregate([{ $group: { _id: "$pipelineStage", count: { $sum: 1 } } }]),
  ]);

  return {
    resumeQuality: resumeScores[0] || { avgAtsScore: 0, avgExperience: 0, analyzedResumes: 0 },
    demandSkills: jobsBySkill,
    funnel: applicationsByStatus,
  };
};

module.exports = {
  getAdminHiringIntelligence,
};
