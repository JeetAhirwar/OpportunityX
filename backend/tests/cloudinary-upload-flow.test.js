const { before, after, afterEach, test } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

process.env.JWT_SECRET ||= "test-only-secret";
process.env.MONGODB_URI ||= "mongodb://127.0.0.1:27017/opportunityx-test";
process.env.CORS_ORIGIN ||= "http://localhost:5173";

const cloudinary = require("cloudinary").v2;
const originalUpload = cloudinary.uploader.upload;
const originalDestroy = cloudinary.uploader.destroy;
const originalConfig = cloudinary.config;

const behavior = { failUpload: false, destroyResult: "ok" };
let uploadSeq = 0;
let uploadCalls = [];
let destroyCalls = [];
let lastUploadPublicId = null;

cloudinary.uploader.upload = async (_dataUri, options) => {
  uploadCalls.push(options);
  if (behavior.failUpload) {
    const error = new Error("Upload quota exceeded");
    error.statusCode = 400;
    throw error;
  }
  uploadSeq += 1;
  const publicId = `${options.folder}/${options.public_id}`;
  lastUploadPublicId = publicId;
  return {
    public_id: publicId,
    secure_url: `https://res.cloudinary.com/opportunityx/raw/upload/v1/${publicId}.pdf`,
    resource_type: "raw",
    format: "pdf",
    bytes: 4096,
  };
};
cloudinary.uploader.destroy = async (publicId, options) => {
  destroyCalls.push({ publicId, options });
  return { result: behavior.destroyResult };
};
cloudinary.config = () => {};

const Profile = require("../src/models/profile.model");
const emailService = require("../src/services/email.service");
const app = require("../src/app");

const minimalPdf = Buffer.from(
  "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n" +
    "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n" +
    "3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n" +
    "4 0 obj<</Length 90>>stream\n" +
    "BT /F1 12 Tf 72 720 Td (Software Engineer MERN stack resume) Tj ET\n" +
    "endstream\nendobj\n" +
    "5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\n" +
    "trailer<</Root 1 0 R/Size 6>>\n%%EOF",
  "latin1"
);

let mongoServer;
let server;
let port;

before(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  emailService.setQueueForTests({ enqueue: () => ({ queued: true, deduped: false }) });
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  port = server.address().port;
});

afterEach(async () => {
  behavior.failUpload = false;
  behavior.destroyResult = "ok";
  uploadCalls = [];
  destroyCalls = [];
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

after(async () => {
  cloudinary.uploader.upload = originalUpload;
  cloudinary.uploader.destroy = originalDestroy;
  cloudinary.config = originalConfig;
  await new Promise((resolve) => server.close(resolve));
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

const jsonRequest = async (method, path, { token, body } = {}) => {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`http://127.0.0.1:${port}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const parsed = await response.json().catch(() => null);
  return { status: response.status, body: parsed };
};

const registerCandidate = async (email) =>
  jsonRequest("POST", "/api/auth/register", {
    body: { name: "Test Candidate", email, password: "Password123", role: "candidate" },
  });

const profileForm = ({ username, withResume = true, blob, mimeType, fileName }) => {
  const form = new FormData();
  form.append("name", "Test Candidate");
  form.append("phone", "1234567890");
  form.append("location", "Remote");
  form.append("bio", "A candidate bio that is definitely longer than twenty characters.");
  form.append("skills", JSON.stringify(["javascript", "mern"]));
  if (username) form.append("username", username);
  if (withResume) form.append("resume", new Blob([blob], { type: mimeType }), fileName);
  return form;
};

const multipartRequest = async (path, form, token) => {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`http://127.0.0.1:${port}${path}`, { method: "PUT", headers, body: form });
  const parsed = await response.json().catch(() => null);
  return { status: response.status, body: parsed };
};

test("uploading a resume stores Cloudinary metadata in MongoDB", async () => {
  const { body: auth } = await registerCandidate(`upload-${Date.now()}@example.com`);
  const result = await multipartRequest(
    "/api/candidate/profile",
    profileForm({ withResume: true, blob: minimalPdf, mimeType: "application/pdf", fileName: "resume.pdf" }),
    auth.token
  );

  assert.equal(result.status, 201);
  assert.equal(result.body.resumeUrl.startsWith("https://res.cloudinary.com/opportunityx/"), true);
  assert.equal(result.body.resumePublicId.startsWith("opportunityx/resumes/"), true);
  assert.equal(result.body.resumeResourceType, "raw");
  assert.ok(result.body.resumeFormat);
  assert.equal(uploadCalls.length, 1);

  const profile = await Profile.findOne({ user: auth.user._id }).lean();
  assert.equal(profile.resumeUrl, result.body.resumeUrl);
  assert.equal(profile.resumePublicId, result.body.resumePublicId);
  assert.equal(profile.resumeFormat, "pdf");
});

test("replacing a resume deletes the previous Cloudinary asset only after success", async () => {
  const { body: auth } = await registerCandidate(`replace-${Date.now()}@example.com`);

  const first = await multipartRequest(
    "/api/candidate/profile",
    profileForm({ withResume: true, blob: minimalPdf, mimeType: "application/pdf", fileName: "resume.pdf" }),
    auth.token
  );
  assert.equal(first.status, 201);
  const firstPublicId = first.body.resumePublicId;
  assert.equal(destroyCalls.length, 0);

  const second = await multipartRequest(
    "/api/candidate/profile",
    profileForm({ withResume: true, blob: minimalPdf, mimeType: "application/pdf", fileName: "resume2.pdf" }),
    auth.token
  );
  assert.equal(second.status, 200);
  assert.equal(second.body.resumePublicId !== firstPublicId, true);

  const destroyed = destroyCalls.map((call) => call.publicId);
  assert.equal(destroyed.includes(firstPublicId), true, "previous asset must be deleted");
  assert.equal(destroyed.includes(second.body.resumePublicId), false, "new asset must never be deleted");

  const profile = await Profile.findOne({ user: auth.user._id }).lean();
  assert.equal(profile.resumePublicId, second.body.resumePublicId);
});

test("Cloudinary upload failure returns a friendly error and preserves the current resume", async () => {
  const { body: auth } = await registerCandidate(`fail-${Date.now()}@example.com`);
  const initial = await multipartRequest(
    "/api/candidate/profile",
    profileForm({ withResume: true, blob: minimalPdf, mimeType: "application/pdf", fileName: "resume.pdf" }),
    auth.token
  );
  assert.equal(initial.status, 201);

  behavior.failUpload = true;
  const failed = await multipartRequest(
    "/api/candidate/profile",
    profileForm({ withResume: true, blob: minimalPdf, mimeType: "application/pdf", fileName: "resume.pdf" }),
    auth.token
  );
  assert.equal(failed.status, 400);
  assert.equal(failed.body.error, "Upload quota exceeded");

  const profile = await Profile.findOne({ user: auth.user._id }).lean();
  assert.equal(profile.resumePublicId, initial.body.resumePublicId);
  assert.equal(profile.resumeUrl, initial.body.resumeUrl);
});

test("MongoDB update failure after a successful Cloudinary upload cleans up the orphaned asset", async () => {
  const { body: authA } = await registerCandidate(`mongoA-${Date.now()}@example.com`);
  const { body: authB } = await registerCandidate(`mongoB-${Date.now()}@example.com`);

  const created = await multipartRequest(
    "/api/candidate/profile",
    profileForm({ username: "alpha", withResume: false }),
    authA.token
  );
  assert.equal(created.status, 201);
  await multipartRequest(
    "/api/candidate/profile",
    profileForm({ username: "bravo", withResume: false }),
    authB.token
  );

  const before = uploadCalls.length;
  const failed = await multipartRequest(
    "/api/candidate/profile",
    profileForm({ username: "alpha", withResume: true, blob: minimalPdf, mimeType: "application/pdf", fileName: "resume.pdf" }),
    authB.token
  );
  assert.equal(failed.status, 400);
  assert.equal(uploadCalls.length, before + 1, "the new file was uploaded to Cloudinary");

  const destroyed = destroyCalls.map((call) => call.publicId);
  assert.equal(destroyed.includes(lastUploadPublicId), true, "orphaned asset must be deleted");
});

test("unsupported resume file types are rejected without calling Cloudinary", async () => {
  const { body: auth } = await registerCandidate(`type-${Date.now()}@example.com`);
  const result = await multipartRequest(
    "/api/candidate/profile",
    profileForm({ withResume: true, blob: Buffer.from("plain text"), mimeType: "text/plain", fileName: "resume.txt" }),
    auth.token
  );
  assert.equal(result.status, 400);
  assert.match(result.body.message, /PDF and DOCX/);
  assert.equal(uploadCalls.length, 0);
});

test("oversized resumes are rejected without calling Cloudinary", async () => {
  const { body: auth } = await registerCandidate(`big-${Date.now()}@example.com`);
  const bigBlob = Buffer.alloc(11 * 1024 * 1024, 1);
  const result = await multipartRequest(
    "/api/candidate/profile",
    profileForm({ withResume: true, blob: bigBlob, mimeType: "application/pdf", fileName: "big.pdf" }),
    auth.token
  );
  assert.equal(result.status, 413);
  assert.equal(uploadCalls.length, 0);
});

const createProfileDirect = (overrides) =>
  Profile.create({
    user: overrides.user,
    name: "Test Candidate",
    phone: "1234567890",
    location: "Remote",
    bio: "A candidate bio that is definitely longer than twenty characters.",
    skills: ["javascript"],
    ...overrides,
  });

test("legacy /uploads/... resumes remain compatible and are preserved on non-resume saves", async () => {
  const { body: auth } = await registerCandidate(`legacy-${Date.now()}@example.com`);
  await createProfileDirect({
    user: auth.user._id,
    resumeUrl: "/uploads/resumes/legacy.pdf",
  });

  const fetched = await jsonRequest("GET", "/api/candidate/profile", { token: auth.token });
  assert.equal(fetched.status, 200);
  assert.equal(fetched.body.resumeUrl, "/uploads/resumes/legacy.pdf");

  const saved = await multipartRequest(
    "/api/candidate/profile",
    profileForm({ withResume: false }),
    auth.token
  );
  assert.equal(saved.status, 200);
  assert.equal(saved.body.resumeUrl, "/uploads/resumes/legacy.pdf");
  assert.equal(uploadCalls.length, 0);
  assert.equal(destroyCalls.length, 0);
});

test("deleting a resume removes the Cloudinary asset and clears metadata", async () => {
  const { body: auth } = await registerCandidate(`del-${Date.now()}@example.com`);
  const uploaded = await multipartRequest(
    "/api/candidate/profile",
    profileForm({ withResume: true, blob: minimalPdf, mimeType: "application/pdf", fileName: "resume.pdf" }),
    auth.token
  );
  assert.equal(uploaded.status, 201);

  const result = await jsonRequest("DELETE", "/api/candidate/profile/resume", { token: auth.token });
  assert.equal(result.status, 200);

  const destroyed = destroyCalls.map((call) => call.publicId);
  assert.equal(destroyed.includes(uploaded.body.resumePublicId), true);

  const profile = await Profile.findOne({ user: auth.user._id }).lean();
  assert.equal(profile.resumeUrl, "");
  assert.equal(profile.resumePublicId, "");
});

test("deleting a missing Cloudinary asset does not fail the request", async () => {
  const { body: auth } = await registerCandidate(`delnf-${Date.now()}@example.com`);
  await createProfileDirect({
    user: auth.user._id,
    resumeUrl: "https://res.cloudinary.com/opportunityx/raw/upload/v1/opportunityx/resumes/old.pdf",
    resumePublicId: "opportunityx/resumes/old",
  });

  behavior.destroyResult = "not found";
  const result = await jsonRequest("DELETE", "/api/candidate/profile/resume", { token: auth.token });
  assert.equal(result.status, 200);

  const profile = await Profile.findOne({ user: auth.user._id }).lean();
  assert.equal(profile.resumeUrl, "");
  assert.equal(profile.resumePublicId, "");
});

test("deleting a resume that was never uploaded returns 404", async () => {
  const { body: auth } = await registerCandidate(`delnone-${Date.now()}@example.com`);
  await createProfileDirect({ user: auth.user._id });

  const result = await jsonRequest("DELETE", "/api/candidate/profile/resume", { token: auth.token });
  assert.equal(result.status, 404);
});
