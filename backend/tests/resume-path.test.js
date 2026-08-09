const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");

process.env.JWT_SECRET ||= "test-only-secret";

const { resolveResumePath } = require("../src/services/ai.resume.service");

const uploadsRoot = path.resolve(__dirname, "..", "src", "uploads");
const insideUploads = (p) => {
  const target = path.resolve(p);
  return target === uploadsRoot || target.startsWith(uploadsRoot + path.sep);
};

test("resolveResumePath accepts valid web-style upload paths", () => {
  const resolved = resolveResumePath("/uploads/resumes/abc.pdf");
  assert.equal(resolved.endsWith(path.join("resumes", "abc.pdf")), true);
  assert.equal(insideUploads(resolved), true);

  const bare = resolveResumePath("uploads/resumes/def.pdf");
  assert.equal(insideUploads(bare), true);
});

test("resolveResumePath accepts absolute paths inside the uploads directory", () => {
  const absolute = path.resolve(uploadsRoot, "resumes", "abc.pdf");
  const resolved = resolveResumePath(absolute);
  assert.equal(resolved, absolute);
});

test("resolveResumePath rejects directory traversal", () => {
  const attempts = [
    "../secret.txt",
    "../../.env",
    "uploads/../../.env",
    "resumes/../../.env",
    "../../../../etc/passwd",
    "uploads/..%2F.env",
  ];
  for (const attempt of attempts) {
    assert.throws(() => resolveResumePath(attempt), /Resume path/, `should reject: ${attempt}`);
  }
});

test("resolveResumePath rejects absolute paths outside the uploads directory", () => {
  const outside = path.resolve(__dirname, "..", ".env");
  assert.throws(() => resolveResumePath(outside), /inside the uploads directory/);
});

test("resolveResumePath rejects empty and missing values", () => {
  assert.throws(() => resolveResumePath(""), /Resume path is required/);
  assert.throws(() => resolveResumePath(undefined), /Resume path is required/);
  assert.throws(() => resolveResumePath(null), /Resume path is required/);
});

test("resolveResumePath normalizes without escaping the uploads root", () => {
  const resolved = resolveResumePath("/uploads/resumes/../resumes/abc.pdf");
  assert.equal(insideUploads(resolved), true);
  assert.equal(resolved.endsWith(path.join("resumes", "abc.pdf")), true);
});
