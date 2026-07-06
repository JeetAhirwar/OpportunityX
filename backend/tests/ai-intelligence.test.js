const test = require("node:test");
const assert = require("node:assert/strict");

process.env.MONGODB_URI ||= "mongodb://127.0.0.1:27017/opportunityx-test";
process.env.JWT_SECRET ||= "test-only-secret";

const { normalizeResumeAnalysis, normalizeMatch } = require("../src/services/ai.response-normalizer");
const { scoreSkills, resumeQualityScore } = require("../src/services/ai.match.service");

test("resume analysis normalizer preserves backward-compatible score aliases", () => {
  const result = normalizeResumeAnalysis({
    resumeScore: 87.7,
    missingSkills: ["GraphQL"],
    atsSuggestions: ["Use standard section headings"],
    improvedSummary: "Full-stack engineer with measurable impact.",
  });

  assert.equal(result.atsScore, 88);
  assert.equal(result.resumeScore, 88);
  assert.deepEqual(result.missingKeywords, ["GraphQL"]);
  assert.deepEqual(result.formattingSuggestions, ["Use standard section headings"]);
  assert.equal(result.resumeSummaryRewrite, "Full-stack engineer with measurable impact.");
});

test("candidate match scoring handles skill overlap and clamps provider scores", () => {
  const base = scoreSkills(["React", "Node.js", "MongoDB"], ["react", "typescript"]);
  assert.equal(base.score, 33);
  assert.deepEqual(base.matchedSkills, ["react"]);
  assert.deepEqual(base.missingSkills, ["node.js", "mongodb"]);

  const normalized = normalizeMatch({ matchScore: 140, skillMatch: -10 }, base);
  assert.equal(normalized.matchScore, 100);
  assert.equal(normalized.skillMatch, 0);
});

test("resume quality score rewards complete parsed/profile data", () => {
  const score = resumeQualityScore(
    { bio: "Experienced engineer", skills: ["React", "Node", "MongoDB", "AWS", "Docker"], experience: [{}], projects: [{}], education: [{}], certifications: [{}] },
    { rawText: "resume text" }
  );

  assert.equal(score, 100);
});
