const express = require("express");
const { protect, authorize } = require("../middlewares/auth.middleware");
const rateLimit = require("../middlewares/rate-limit.middleware");
const ai = require("../controllers/ai.controller");

const router = express.Router();
const aiLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 20, keyPrefix: "ai" });

router.use(protect, aiLimiter);

router.post("/career-assistant", authorize("candidate"), ai.careerAssistant);
router.post("/resume-analyze", authorize("candidate"), ai.resumeAnalyze);
router.get("/job-recommendations", authorize("candidate"), ai.jobRecommendations);

router.post("/recruiter/job-description", authorize("recruiter"), ai.generateJobDescription);
router.post("/recruiter/interview-questions", authorize("recruiter"), ai.interviewQuestions);
router.post("/recruiter/candidate-summary", authorize("recruiter"), ai.candidateSummary);
router.get("/recruiter/applications/:applicationId/match-score", authorize("recruiter"), ai.matchScore);

router.get("/admin/insights", authorize("admin"), ai.adminInsights);

module.exports = router;
