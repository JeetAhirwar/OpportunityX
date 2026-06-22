const test = require("node:test");
const assert = require("node:assert/strict");

process.env.MONGODB_URI ||= "mongodb://127.0.0.1:27017/opportunityx-test";
process.env.JWT_SECRET ||= "test-only-secret";

const { safeUser } = require("../src/controllers/auth.controller");

test("safe auth DTO excludes credentials and reset fields", () => {
  const user = {
    _id: "507f1f77bcf86cd799439011",
    name: "Candidate",
    email: "candidate@example.com",
    role: "candidate",
    isActive: true,
    isVerified: false,
    password: "secret",
    resetPasswordToken: "token",
    resetPasswordExpires: new Date(),
  };

  assert.deepEqual(safeUser(user), {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: true,
    isVerified: false,
  });
});
