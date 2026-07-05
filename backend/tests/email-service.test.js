const test = require("node:test");
const assert = require("node:assert/strict");

process.env.MONGODB_URI ||= "mongodb://127.0.0.1:27017/opportunityx-test";
process.env.JWT_SECRET ||= "test-only-secret";
process.env.CLIENT_URL ||= "http://localhost:5173";

const { EMAIL_TYPES } = require("../src/email/email.constants");
const { listTemplates, renderEmail } = require("../src/email/template-engine");
const emailService = require("../src/services/email.service");

test("email registry includes every enterprise email type", () => {
  const registered = new Set(listTemplates());
  const expected = Object.values(EMAIL_TYPES);

  assert.equal(registered.size, expected.length);
  expected.forEach((type) => assert.equal(registered.has(type), true, `${type} is registered`));
});

test("all email templates render branded responsive html and text", () => {
  listTemplates().forEach((type) => {
    const rendered = renderEmail(type, {
      name: "Preview User",
      candidateName: "Jordan Candidate",
      recruiterName: "Riley Recruiter",
      companyName: "Acme Talent",
      jobTitle: "Senior MERN Developer",
      reason: "Insufficient company documentation.",
      resetUrl: "https://app.opportunityx.test/reset-password/token",
      verifyUrl: "https://app.opportunityx.test/verify-email/token",
      alertTitle: "Provider health check failed",
      alertMessage: "SMTP health check failed.",
    });

    assert.match(rendered.subject, /\S/);
    assert.match(rendered.text, /\S/);
    assert.match(rendered.html, /OpportunityX/);
    assert.match(rendered.html, /viewport/);
    assert.match(rendered.html, /Privacy matters/);
    assert.match(rendered.html, /support@opportunityx\.local/);
  });
});

test("dynamic template values are escaped to prevent html injection", () => {
  const rendered = renderEmail(EMAIL_TYPES.CANDIDATE_JOB_APPLIED, {
    name: "<script>alert(1)</script>",
    jobTitle: "<img src=x onerror=alert(1)>",
    companyName: "A&B Careers",
  });

  assert.doesNotMatch(rendered.html, /<script>/);
  assert.doesNotMatch(rendered.html, /<img/);
  assert.match(rendered.html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(rendered.html, /A&amp;B Careers/);
});

test("email service enqueues rendered jobs without requiring smtp credentials", () => {
  const jobs = [];
  emailService.setQueueForTests({
    enqueue(job) {
      jobs.push(job);
      return { queued: true };
    },
  });

  const result = emailService.send({
    to: "user@example.com",
    type: EMAIL_TYPES.AUTH_WELCOME,
    data: { name: "User" },
    dedupeKey: "welcome:user",
  });

  assert.deepEqual(result, { queued: true });
  assert.equal(jobs.length, 1);
  assert.equal(jobs[0].type, EMAIL_TYPES.AUTH_WELCOME);
  assert.equal(jobs[0].to, "user@example.com");
});
