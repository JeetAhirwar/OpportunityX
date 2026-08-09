const { before, after, afterEach, test } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

process.env.JWT_SECRET ||= "test-only-secret";
process.env.MONGODB_URI ||= "mongodb://127.0.0.1:27017/opportunityx-test";
process.env.CORS_ORIGIN ||= "http://localhost:5173";

const User = require("../src/models/user.model");
const Job = require("../src/models/job.model");
const generateToken = require("../src/utils/generateToken");
const emailService = require("../src/services/email.service");
const app = require("../src/app");

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
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

const request = async (method, path, { token } = {}) => {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`http://127.0.0.1:${port}${path}`, { method, headers });
  const body = await response.json().catch(() => null);
  return { status: response.status, body };
};

const createUser = (overrides = {}) =>
  User.create({
    name: "Test User",
    email: `user-${Date.now()}-${Math.random()}@example.com`,
    password: "Password123",
    role: "candidate",
    ...overrides,
  });

const createJob = (overrides = {}) =>
  Job.create({
    title: "Test Job",
    description: "A test job",
    company: "Acme",
    location: "Remote",
    postedBy: null,
    status: "active",
    ...overrides,
  });

test("GET /jobs/:id exposes only publicly active jobs to anonymous users", async () => {
  const recruiter = await createUser({ role: "recruiter" });
  const cases = [
    { status: "active", isExpired: false, deadline: null, expect: 200 },
    { status: "draft", isExpired: false, deadline: null, expect: 404 },
    { status: "closed", isExpired: false, deadline: null, expect: 404 },
    { status: "pending", isExpired: false, deadline: null, expect: 404 },
    { status: "active", isExpired: true, deadline: null, expect: 404 },
    { status: "active", isExpired: false, deadline: new Date(Date.now() - 86400000), expect: 404 },
    { status: "active", isExpired: false, deadline: new Date(Date.now() + 86400000), expect: 200 },
  ];

  for (const c of cases) {
    const job = await createJob({
      postedBy: recruiter._id,
      status: c.status,
      isExpired: c.isExpired,
      deadline: c.deadline,
    });
    const { status } = await request("GET", `/api/jobs/${job._id}`);
    assert.equal(status, c.expect, `expected ${c.expect} for ${JSON.stringify(c)}`);
  }
});

test("recruiter owner and admin can view non-public jobs; other recruiters cannot", async () => {
  const owner = await createUser({ role: "recruiter" });
  const other = await createUser({ role: "recruiter" });
  const admin = await createUser({ role: "admin" });

  const draft = await createJob({ postedBy: owner._id, status: "draft" });
  const closed = await createJob({ postedBy: owner._id, status: "closed" });

  const ownerToken = generateToken(owner);
  const otherToken = generateToken(other);
  const adminToken = generateToken(admin);

  const ownerDraft = await request("GET", `/api/jobs/${draft._id}`, { token: ownerToken });
  assert.equal(ownerDraft.status, 200);
  assert.equal(ownerDraft.body.data.status, "draft");

  const ownerClosed = await request("GET", `/api/jobs/${closed._id}`, { token: ownerToken });
  assert.equal(ownerClosed.status, 200);

  const adminDraft = await request("GET", `/api/jobs/${draft._id}`, { token: adminToken });
  assert.equal(adminDraft.status, 200);

  const otherDraft = await request("GET", `/api/jobs/${draft._id}`, { token: otherToken });
  assert.equal(otherDraft.status, 404);

  const anonymousDraft = await request("GET", `/api/jobs/${draft._id}`);
  assert.equal(anonymousDraft.status, 404);
});

test("job views are deduplicated per viewer within the window", async () => {
  const recruiter = await createUser({ role: "recruiter" });
  const job = await createJob({ postedBy: recruiter._id, status: "active" });

  await request("GET", `/api/jobs/${job._id}`);
  await request("GET", `/api/jobs/${job._id}`);
  await request("GET", `/api/jobs/${job._id}`);

  const fresh = await Job.findById(job._id).lean();
  assert.equal(fresh.views, 1, "repeated views from the same viewer should count once");
});

test("owner/admin views do not inflate public job view counts", async () => {
  const recruiter = await createUser({ role: "recruiter" });
  const job = await createJob({ postedBy: recruiter._id, status: "active" });

  const token = generateToken(recruiter);
  await request("GET", `/api/jobs/${job._id}`, { token });
  await request("GET", `/api/jobs/${job._id}`, { token });

  const fresh = await Job.findById(job._id).lean();
  assert.equal(fresh.views, 0, "owner views must not increment public views");
});

test("GET /jobs/:id rejects invalid job ids", async () => {
  const { status } = await request("GET", "/api/jobs/not-a-valid-id");
  assert.equal(status, 400);
});
