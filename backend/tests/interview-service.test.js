const { after, test } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");

process.env.MONGODB_URI ||= "mongodb://127.0.0.1:27017/opportunityx-test";
process.env.JWT_SECRET ||= "test-only-secret";

const Application = require("../src/models/application.model");
const Interview = require("../src/models/interview.model");
const Job = require("../src/models/job.model");
const User = require("../src/models/user.model");
const calendarService = require("../src/services/calendar.service");
const emailService = require("../src/services/email.service");
const interviewService = require("../src/services/interview.service");

after(async () => {
  emailService.setQueueForTests({ enqueue: () => ({ queued: true, deduped: false }) });
  if (mongoose.connection.readyState !== 0) await mongoose.connection.close();
});

emailService.setQueueForTests({ enqueue: () => ({ queued: true, deduped: false }) });

const setup = async () => {
  if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_URI);
  await Promise.all([Interview.deleteMany({}), Application.deleteMany({}), Job.deleteMany({}), User.deleteMany({})]);
  const [candidate, recruiter, otherRecruiter] = await User.create([
    { name: "Candidate", email: "candidate@example.com", password: "Password123", role: "candidate" },
    { name: "Recruiter", email: "recruiter@example.com", password: "Password123", role: "recruiter" },
    { name: "Other Recruiter", email: "other@example.com", password: "Password123", role: "recruiter" },
  ]);
  const job = await Job.create({ title: "MERN Engineer", description: "Build apps", company: "Acme", location: "Remote", postedBy: recruiter._id });
  const application = await Application.create({ job: job._id, candidate: candidate._id });
  return { candidate, recruiter, otherRecruiter, job, application };
};

test("recruiter schedules interview, candidate confirms, and feedback updates score", async () => {
  const { candidate, recruiter, application } = await setup();
  const interview = await interviewService.createInterview({
    user: recruiter,
    body: {
      applicationId: application._id,
      title: "Technical Interview",
      scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      duration: 60,
      timezone: "UTC",
      mode: "zoom",
    },
  });

  assert.equal(interview.candidate.email, candidate.email);
  assert.equal(interview.status, "scheduled");

  const confirmed = await interviewService.respondToInvitation({ user: candidate, interviewId: interview._id, action: "accept" });
  assert.equal(confirmed.status, "confirmed");

  const scored = await interviewService.submitFeedback({
    user: recruiter,
    interviewId: interview._id,
    body: { technicalScore: 8, communication: 7, problemSolving: 9, cultureFit: 8, recommendation: "hire", comments: "Strong fundamentals" },
  });
  assert.equal(scored.score, 8);
  assert.equal(scored.recommendation, "hire");
});

test("recruiters cannot access interviews for another recruiter", async () => {
  const { recruiter, otherRecruiter, application } = await setup();
  const interview = await interviewService.createInterview({
    user: recruiter,
    body: { applicationId: application._id, title: "HR Interview", scheduledAt: new Date(Date.now() + 86400000).toISOString() },
  });

  await assert.rejects(
    () => interviewService.getAccessibleInterview({ user: otherRecruiter, interviewId: interview._id }),
    /Interview not found/
  );
});

test("calendar service exports valid ICS content", async () => {
  const { recruiter, application } = await setup();
  const interview = await interviewService.createInterview({
    user: recruiter,
    body: { applicationId: application._id, title: "Calendar Interview", scheduledAt: new Date(Date.now() + 86400000).toISOString(), meetingLink: "https://meet.example.com/x" },
  });
  const ics = calendarService.createIcs(interview);
  assert.match(ics, /BEGIN:VCALENDAR/);
  assert.match(ics, /SUMMARY:Calendar Interview/);
  assert.match(ics, /END:VCALENDAR/);
});
