const test = require("node:test");
const assert = require("node:assert/strict");

process.env.MONGODB_URI ||= "mongodb://127.0.0.1:27017/opportunityx-test";
process.env.JWT_SECRET ||= "test-only-secret";
process.env.CORS_ORIGIN ||= "http://localhost:8080";

const userModelPath = require.resolve("../src/models/user.model");
let fakeUser;

require.cache[userModelPath] = {
  id: userModelPath,
  filename: userModelPath,
  loaded: true,
  exports: {
    findOne: (...args) => fakeUser.findOne(...args),
    create: (...args) => fakeUser.create(...args),
    findById: (...args) => fakeUser.findById(...args),
    findByIdAndUpdate: (...args) => fakeUser.findByIdAndUpdate(...args),
    findByIdAndDelete: (...args) => fakeUser.findByIdAndDelete(...args),
    countDocuments: (...args) => fakeUser.countDocuments(...args),
  },
};

const {
  bootstrapAdmin,
  createUser,
  updateUserRole,
  updateUserStatus,
  deleteUser,
} = require("../src/controllers/admin.controller");

const createRes = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
});

test("bootstrapAdmin creates the first admin with a valid code and safe response", async () => {
  process.env.ADMIN_REGISTRATION_CODE = "valid-bootstrap-code";
  let createdPayload;

  fakeUser = {
    async findOne(query) {
      if (query.role === "admin") return null;
      if (query.email === "admin@opportunityx.com") return null;
      return null;
    },
    async create(payload) {
      createdPayload = payload;
      return {
        _id: "507f1f77bcf86cd799439011",
        ...payload,
        password: "hashed-password",
        createdAt: new Date("2026-06-26T00:00:00.000Z"),
        updatedAt: new Date("2026-06-26T00:00:00.000Z"),
      };
    },
  };

  const res = createRes();
  await bootstrapAdmin({
    body: {
      name: "Admin",
      email: "admin@opportunityx.com",
      password: "Admin@12345",
      code: "valid-bootstrap-code",
    },
  }, res);

  assert.equal(res.statusCode, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.user.role, "admin");
  assert.equal(res.body.data.user.isActive, true);
  assert.equal(res.body.data.user.isVerified, true);
  assert.equal(res.body.data.user.password, undefined);
  assert.equal(res.body.token, undefined);
  assert.equal(createdPayload.role, "admin");
});

test("bootstrapAdmin rejects invalid bootstrap codes", async () => {
  process.env.ADMIN_REGISTRATION_CODE = "valid-bootstrap-code";
  let createCalled = false;

  fakeUser = {
    async findOne(query) {
      if (query.role === "admin") return null;
      return null;
    },
    async create() {
      createCalled = true;
    },
  };

  const res = createRes();
  await bootstrapAdmin({
    body: {
      name: "Admin",
      email: "admin@opportunityx.com",
      password: "Admin@12345",
      code: "wrong-code",
    },
  }, res);

  assert.equal(res.statusCode, 403);
  assert.equal(res.body.message, "Invalid admin bootstrap code");
  assert.equal(createCalled, false);
});

test("bootstrapAdmin rejects second admin bootstrap attempts", async () => {
  process.env.ADMIN_REGISTRATION_CODE = "valid-bootstrap-code";
  let createCalled = false;

  fakeUser = {
    async findOne(query) {
      if (query.role === "admin") return { _id: "existing-admin" };
      return null;
    },
    async create() {
      createCalled = true;
    },
  };

  const res = createRes();
  await bootstrapAdmin({
    body: {
      name: "Admin",
      email: "admin@opportunityx.com",
      password: "Admin@12345",
      code: "valid-bootstrap-code",
    },
  }, res);

  assert.equal(res.statusCode, 403);
  assert.equal(res.body.message, "Admin bootstrap is already disabled");
  assert.equal(createCalled, false);
});

test("public register rejects admin role", async () => {
  const app = require("../src/app");
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));

  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Admin",
        email: "admin@opportunityx.com",
        password: "Admin@12345",
        role: "admin",
      }),
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.success, false);
    assert.equal(body.message, "Validation failed");
    assert.equal(body.errors.some((error) => error.field === "role"), true);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("admin createUser creates an admin-managed user without password in response", async () => {
  let createdPayload;
  fakeUser = {
    async findOne(query) {
      if (query.email === "secondadmin@opportunityx.com") return null;
      return null;
    },
    async create(payload) {
      createdPayload = payload;
      return {
        _id: "507f1f77bcf86cd799439012",
        ...payload,
        password: "hashed-password",
        createdAt: new Date("2026-06-26T00:00:00.000Z"),
        updatedAt: new Date("2026-06-26T00:00:00.000Z"),
      };
    },
  };

  const res = createRes();
  await createUser({
    body: {
      name: "Second Admin",
      email: "secondadmin@opportunityx.com",
      password: "Admin@12345",
      role: "admin",
    },
  }, res);

  assert.equal(res.statusCode, 201);
  assert.equal(createdPayload.role, "admin");
  assert.equal(createdPayload.isVerified, true);
  assert.equal(res.body.data.user.password, undefined);
});

test("admin createUser rejects duplicate email", async () => {
  let createCalled = false;
  fakeUser = {
    async findOne(query) {
      if (query.email === "taken@opportunityx.com") return { _id: "existing-user" };
      return null;
    },
    async create() {
      createCalled = true;
    },
  };

  const res = createRes();
  await createUser({
    body: {
      name: "Taken",
      email: "taken@opportunityx.com",
      password: "Admin@12345",
      role: "admin",
    },
  }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, "User already exists");
  assert.equal(createCalled, false);
});

test("updateUserRole rejects demoting the last remaining admin", async () => {
  let updateCalled = false;
  const target = {
    _id: "507f1f77bcf86cd799439011",
    name: "Only Admin",
    email: "admin@opportunityx.com",
    role: "admin",
    isActive: true,
  };

  fakeUser = {
    findById() {
      return { select: async () => target };
    },
    async countDocuments(query) {
      assert.deepEqual(query, { role: "admin" });
      return 1;
    },
    findByIdAndUpdate() {
      updateCalled = true;
    },
  };

  const res = createRes();
  await updateUserRole({
    user: { _id: "507f1f77bcf86cd799439012" },
    params: { id: target._id },
    body: { role: "candidate" },
  }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, "Cannot demote the last remaining admin account.");
  assert.equal(updateCalled, false);
});

test("updateUserRole requires confirm before self-demotion", async () => {
  let countCalled = false;
  const target = {
    _id: "507f1f77bcf86cd799439011",
    name: "Current Admin",
    email: "admin@opportunityx.com",
    role: "admin",
    isActive: true,
  };

  fakeUser = {
    findById() {
      return { select: async () => target };
    },
    async countDocuments() {
      countCalled = true;
      return 2;
    },
  };

  const res = createRes();
  await updateUserRole({
    user: { _id: target._id },
    params: { id: target._id },
    body: { role: "candidate" },
  }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, "Confirm self-demotion to change your own admin role.");
  assert.equal(countCalled, false);
});

test("updateUserStatus rejects suspending the last active admin", async () => {
  let updateCalled = false;
  const target = {
    _id: "507f1f77bcf86cd799439011",
    name: "Only Active Admin",
    email: "admin@opportunityx.com",
    role: "admin",
    isActive: true,
  };

  fakeUser = {
    findById() {
      return { select: async () => target };
    },
    async countDocuments(query) {
      assert.deepEqual(query, { role: "admin" });
      return 1;
    },
    findByIdAndUpdate() {
      updateCalled = true;
    },
  };

  const res = createRes();
  await updateUserStatus({
    user: { _id: "507f1f77bcf86cd799439012" },
    params: { id: target._id },
    body: { isActive: false },
  }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, "Cannot suspend the last remaining admin account.");
  assert.equal(updateCalled, false);
});

test("deleteUser rejects deleting the last remaining admin", async () => {
  let deleteCalled = false;
  const target = {
    _id: "507f1f77bcf86cd799439011",
    name: "Only Admin",
    email: "admin@opportunityx.com",
    role: "admin",
    isActive: true,
  };

  fakeUser = {
    findById() {
      return { select: async () => target };
    },
    async countDocuments(query) {
      assert.deepEqual(query, { role: "admin" });
      return 1;
    },
    async findByIdAndDelete() {
      deleteCalled = true;
    },
  };

  const res = createRes();
  await deleteUser({
    user: { _id: "507f1f77bcf86cd799439012" },
    params: { id: target._id },
  }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, "Cannot delete the last remaining admin account.");
  assert.equal(deleteCalled, false);
});
