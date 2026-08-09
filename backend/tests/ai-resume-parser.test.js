const { before, after, afterEach, test } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

process.env.JWT_SECRET ||= "test-only-secret";
process.env.MONGODB_URI ||= "mongodb://127.0.0.1:27017/opportunityx-test";
process.env.CORS_ORIGIN ||= "http://localhost:5173";

const User = require("../src/models/user.model");
const Profile = require("../src/models/profile.model");
const { ensureParsedResume, fetchResumeBuffer, getParsedResume, mimeTypeFromUrl, upsertParsedResumeFromUpload } = require("../src/services/ai.resume.service");

const minimalPdf = Buffer.from(
  "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n" +
    "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n" +
    "3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n" +
    "4 0 obj<</Length 90>>stream\n" +
    "BT /F1 12 Tf 72 720 Td (Software Engineer with javascript and express skills) Tj ET\n" +
    "endstream\nendobj\n" +
    "5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\n" +
    "trailer<</Root 1 0 R/Size 6>>\n%%EOF",
  "latin1"
);

const originalFetch = global.fetch;
const behavior = { fetchFails: false };
let fetchUrls = [];

global.fetch = async (url) => {
  fetchUrls.push(String(url));
  if (behavior.fetchFails) {
    return { ok: false, status: 502, headers: { get: () => null }, arrayBuffer: async () => new ArrayBuffer(0) };
  }
  return {
    ok: true,
    headers: { get: (name) => (name === "content-length" ? String(minimalPdf.length) : null) },
    arrayBuffer: async () =>
      minimalPdf.buffer.slice(minimalPdf.byteOffset, minimalPdf.byteOffset + minimalPdf.byteLength),
  };
};

let mongoServer;

before(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  behavior.fetchFails = false;
  fetchUrls = [];
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

after(async () => {
  global.fetch = originalFetch;
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

const createCandidate = async (email) =>
  User.create({ name: "AI Candidate", email, password: "Password123", role: "candidate" });

test("mimeTypeFromUrl maps .docx URLs and defaults to PDF", () => {
  assert.equal(
    mimeTypeFromUrl("https://res.cloudinary.com/x/raw/upload/v1/opportunityx/resumes/a.docx"),
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );
  assert.equal(mimeTypeFromUrl("https://res.cloudinary.com/x/raw/upload/v1/opportunityx/resumes/a.pdf"), "application/pdf");
});

test("fetchResumeBuffer only downloads from Cloudinary hosts", async () => {
  await assert.rejects(
    () => fetchResumeBuffer("https://evil.example.com/resume.pdf"),
    /Unsupported resume source/
  );
  await assert.rejects(
    () => fetchResumeBuffer("/uploads/resumes/legacy.pdf"),
    /Unsupported resume source/
  );
});

test("fetchResumeBuffer returns the file bytes for a Cloudinary URL", async () => {
  const buffer = await fetchResumeBuffer(
    "https://res.cloudinary.com/opportunityx/raw/upload/v1/opportunityx/resumes/abc.pdf"
  );
  assert.ok(Buffer.isBuffer(buffer));
  assert.equal(buffer.length, minimalPdf.length);
  assert.equal(fetchUrls.length, 1);
});

test("fetchResumeBuffer rejects failed downloads", async () => {
  behavior.fetchFails = true;
  await assert.rejects(
    () => fetchResumeBuffer("https://res.cloudinary.com/opportunityx/raw/upload/v1/opportunityx/resumes/abc.pdf"),
    /Failed to download resume/
  );
});

test("upsertParsedResumeFromUpload parses an in-memory buffer and persists metadata", async () => {
  const candidate = await createCandidate(`parser-${Date.now()}@example.com`);
  const result = await upsertParsedResumeFromUpload({
    candidateId: candidate._id,
    resumeUrl: "https://res.cloudinary.com/opportunityx/raw/upload/v1/opportunityx/resumes/new.pdf",
    buffer: minimalPdf,
    mimeType: "application/pdf",
    fileName: "resume.pdf",
  });

  assert.equal(result.resumeUrl.endsWith("new.pdf"), true);
  assert.equal(result.fileName, "resume.pdf");
  assert.ok(result.skills.includes("javascript"));

  const stored = await getParsedResume(candidate._id, true);
  assert.equal(stored.resumeUrl, result.resumeUrl);
  assert.match(stored.rawText, /Software Engineer/);
});

const createProfile = async (candidate, resumeUrl) =>
  Profile.create({
    user: candidate._id,
    name: "AI Candidate",
    phone: "1234567890",
    location: "Remote",
    bio: "A candidate bio that is definitely longer than twenty characters.",
    skills: ["javascript"],
    resumeUrl,
  });

test("ensureParsedResume parses a Cloudinary-hosted resume by fetching it", async () => {
  const candidate = await createCandidate(`cloud-${Date.now()}@example.com`);
  const profile = await createProfile(
    candidate,
    "https://res.cloudinary.com/opportunityx/raw/upload/v1/opportunityx/resumes/cloud.pdf"
  );

  const result = await ensureParsedResume({ candidateId: candidate._id, profile: profile.toObject() });

  assert.ok(result);
  assert.match(result.rawText, /Software Engineer/);
  assert.equal(fetchUrls.length, 1);
  assert.ok(fetchUrls[0].includes("res.cloudinary.com"));
});

test("ensureParsedResume ignores non-Cloudinary external URLs", async () => {
  const candidate = await createCandidate(`ext-${Date.now()}@example.com`);
  const profile = await createProfile(candidate, "https://example.com/resume.pdf");

  const result = await ensureParsedResume({ candidateId: candidate._id, profile: profile.toObject() });
  assert.equal(result, null);
  assert.equal(fetchUrls.length, 0);
});

test("ensureParsedResume returns null gracefully for a legacy local resume that no longer exists", async () => {
  const candidate = await createCandidate(`legacyai-${Date.now()}@example.com`);
  const profile = await createProfile(candidate, "/uploads/resumes/does-not-exist.pdf");

  const result = await ensureParsedResume({ candidateId: candidate._id, profile: profile.toObject() });
  assert.equal(result, null);
});
