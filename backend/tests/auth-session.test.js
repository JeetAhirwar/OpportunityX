const { before, after, afterEach, test } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { MongoMemoryServer } = require("mongodb-memory-server");

process.env.JWT_SECRET ||= "test-only-secret";
process.env.MONGODB_URI ||= "mongodb://127.0.0.1:27017/opportunityx-test";
process.env.CORS_ORIGIN ||= "http://localhost:5173";

const User = require("../src/models/user.model");
const env = require("../src/config/env");
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

const request = async (method, path, { token, body } = {}) => {
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
  request("POST", "/api/auth/register", {
    body: { name: "Test Candidate", email, password: "Password123", role: "candidate" },
  });

test("register issues a token that works on a protected route", async () => {
  const email = `register-${Date.now()}@example.com`;
  const { status, body } = await registerCandidate(email);
  assert.equal(status, 201);
  assert.ok(body.token);

  const me = await request("GET", "/api/auth/me", { token: body.token });
  assert.equal(me.status, 200);
  assert.equal(me.body.user.email, email);
});

test("login issues a token that works on a protected route", async () => {
  const email = `login-${Date.now()}@example.com`;
  await registerCandidate(email);

  const login = await request("POST", "/api/auth/login", { body: { email, password: "Password123" } });
  assert.equal(login.status, 200);
  assert.ok(login.body.token);

  const me = await request("GET", "/api/auth/me", { token: login.body.token });
  assert.equal(me.status, 200);
});

test("logout revokes the session token", async () => {
  const email = `logout-${Date.now()}@example.com`;
  const { body } = await registerCandidate(email);

  const logout = await request("POST", "/api/auth/logout", { token: body.token });
  assert.equal(logout.status, 200);

  const me = await request("GET", "/api/auth/me", { token: body.token });
  assert.equal(me.status, 401);
});

test("a deactivated user is rejected on protected routes", async () => {
  const email = `disabled-${Date.now()}@example.com`;
  const { body } = await registerCandidate(email);
  const user = await User.findOne({ email });
  user.isActive = false;
  await user.save();

  const me = await request("GET", "/api/auth/me", { token: body.token });
  assert.equal(me.status, 401);
});

test("an expired session token is rejected", async () => {
  const email = `expired-${Date.now()}@example.com`;
  const { body } = await registerCandidate(email);
  const user = await User.findOne({ email });

  const expired = jwt.sign({ id: user._id, tv: user.tokenVersion }, env.jwtSecret, { expiresIn: "1ms" });
  await new Promise((resolve) => setTimeout(resolve, 10));

  const me = await request("GET", "/api/auth/me", { token: expired });
  assert.equal(me.status, 401);
});

test("sessions are invalidated when the token version changes (password reset)", async () => {
  const email = `reset-${Date.now()}@example.com`;
  const { body } = await registerCandidate(email);
  const user = await User.findOne({ email });
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  await user.save();

  const me = await request("GET", "/api/auth/me", { token: body.token });
  assert.equal(me.status, 401);
});

test("a token signed with a stale token version is rejected", async () => {
  const email = `stale-${Date.now()}@example.com`;
  const { body } = await registerCandidate(email);
  const user = await User.findOne({ email });

  const stale = jwt.sign({ id: user._id, tv: 999 }, env.jwtSecret, { expiresIn: "1h" });
  const me = await request("GET", "/api/auth/me", { token: stale });
  assert.equal(me.status, 401);

  const valid = await request("GET", "/api/auth/me", { token: body.token });
  assert.equal(valid.status, 200);
});
