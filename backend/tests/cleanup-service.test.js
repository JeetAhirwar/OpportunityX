const { before, after, afterEach, test } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

process.env.JWT_SECRET ||= "test-only-secret";

const User = require("../src/models/user.model");
const Organization = require("../src/models/organization.model");
const Company = require("../src/models/company.model");
const Job = require("../src/models/job.model");
const Application = require("../src/models/application.model");
const Conversation = require("../src/models/conversation.model");
const Message = require("../src/models/message.model");
const Interview = require("../src/models/interview.model");
const SavedJob = require("../src/models/saved-job.model");
const RecruiterNote = require("../src/models/recruiter-note.model");
const ParsedResume = require("../src/models/parsed-resume.model");
const Notification = require("../src/models/notification.model");
const cleanupService = require("../src/services/cleanup.service");

let mongoServer;

before(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

after(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

const seq = { n: 0 };
const uniqueEmail = (prefix) => `${prefix}-${Date.now()}-${seq.n++}@example.com`;

const createUser = async (overrides = {}) =>
  User.create({
    name: "Test User",
    email: uniqueEmail("user"),
    password: "Password123",
    role: "candidate",
    ...overrides,
  });

const createOrganization = async (owner) =>
  Organization.create({
    name: "Acme Org",
    slug: `acme-${Date.now()}-${seq.n++}`,
    owner: owner._id,
  });

const createJob = async (postedBy, organizationId = null) =>
  Job.create({
    title: "MERN Engineer",
    description: "Build apps",
    company: "Acme",
    location: "Remote",
    postedBy: postedBy._id,
    organizationId,
  });

const createApplication = async (candidate, job, organizationId = null) =>
  Application.create({ candidate: candidate._id, job: job._id, organizationId });

const createConversation = async (candidate, recruiter, application, job) =>
  Conversation.create({
    participants: [candidate._id, recruiter._id],
    application: application._id,
    job: job._id,
  });

const createInterview = async (candidate, recruiter, job, application, organizationId = null) =>
  Interview.create({
    application: application._id,
    candidate: candidate._id,
    job: job._id,
    recruiter: recruiter._id,
    title: "Technical Interview",
    scheduledAt: new Date(Date.now() + 86400000),
    organizationId,
  });

test("deleting a candidate removes their applications, chats, interviews, saved jobs, notes, resume, and notifications", async () => {
  const candidate = await createUser();
  const recruiter = await createUser({ role: "recruiter" });
  const org = await createOrganization(recruiter);

  const job = await createJob(recruiter, org._id);
  const application = await createApplication(candidate, job, org._id);
  const conversation = await createConversation(candidate, recruiter, application, job);
  await Message.create({ conversation: conversation._id, sender: candidate._id, content: "Hello" });
  await createInterview(candidate, recruiter, job, application, org._id);
  await SavedJob.create({ user: candidate._id, job: job._id, organizationId: org._id });
  await RecruiterNote.create({
    recruiter: recruiter._id,
    candidate: candidate._id,
    job: job._id,
    application: application._id,
    content: "Promising candidate",
    organizationId: org._id,
  });
  await ParsedResume.create({ candidate: candidate._id, resumeUrl: "/uploads/resumes/x.pdf", organizationId: org._id });
  await Notification.create({
    user: candidate._id,
    recipient: candidate._id,
    sender: recruiter._id,
    type: "info",
    title: "Application received",
    message: "Your application was received",
    entityType: "application",
    entityId: application._id,
    organizationId: org._id,
  });

  const report = await cleanupService.deleteUserAndRelated(candidate._id);

  assert.equal(await User.findById(candidate._id), null);
  assert.equal(report.users, 1);
  assert.equal(await Application.countDocuments({ candidate: candidate._id }), 0);
  assert.equal(await Conversation.countDocuments({ participants: candidate._id }), 0);
  assert.equal(await Message.countDocuments({ sender: candidate._id }), 0);
  assert.equal(await Interview.countDocuments({ candidate: candidate._id }), 0);
  assert.equal(await SavedJob.countDocuments({ user: candidate._id }), 0);
  assert.equal(await RecruiterNote.countDocuments({ candidate: candidate._id }), 0);
  assert.equal(await ParsedResume.countDocuments({ candidate: candidate._id }), 0);
  assert.equal(
    await Notification.countDocuments({
      $or: [{ user: candidate._id }, { recipient: candidate._id }, { sender: candidate._id }],
    }),
    0
  );

  const refreshedOrg = await Organization.findById(org._id);
  assert.equal(refreshedOrg.members.some((m) => String(m.user) === String(candidate._id)), false);
});

test("deleting a recruiter removes their company, jobs, and related records", async () => {
  const recruiter = await createUser({ role: "recruiter" });
  const candidate = await createUser();
  const orgOwner = await createUser({ role: "recruiter" });
  const org = await createOrganization(orgOwner);

  await Company.create({
    recruiter: recruiter._id,
    companyName: "Acme",
    verificationStatus: "verified",
    organizationId: org._id,
  });
  const job = await createJob(recruiter, org._id);
  const application = await createApplication(candidate, job, org._id);
  const conversation = await createConversation(candidate, recruiter, application, job);
  await Message.create({ conversation: conversation._id, sender: candidate._id, content: "Hi" });

  const report = await cleanupService.deleteUserAndRelated(recruiter._id);

  assert.equal(await User.findById(recruiter._id), null);
  assert.equal(report.companies, 1);
  assert.equal(report.jobs, 1);
  assert.equal(await Company.countDocuments({ recruiter: recruiter._id }), 0);
  assert.equal(await Job.countDocuments({ postedBy: recruiter._id }), 0);
  assert.equal(await Application.countDocuments({ job: job._id }), 0);
  assert.equal(await Conversation.countDocuments({ participants: recruiter._id }), 0);
  assert.equal(await Message.countDocuments({ conversation: conversation._id }), 0);
});

test("deleting an organization owner is refused to protect the organization", async () => {
  const owner = await createUser({ role: "recruiter" });
  await createOrganization(owner);

  await assert.rejects(
    () => cleanupService.deleteUserAndRelated(owner._id),
    /Cannot delete a user who owns an organization/
  );
  assert.equal(await User.findById(owner._id) != null, true);
});

test("deleting a job removes its applications, conversations, interviews, saved jobs, notes, and notifications", async () => {
  const recruiter = await createUser({ role: "recruiter" });
  const candidate = await createUser();

  const job = await createJob(recruiter);
  const application = await createApplication(candidate, job);
  const conversation = await createConversation(candidate, recruiter, application, job);
  await Message.create({ conversation: conversation._id, sender: candidate._id, content: "Hi" });
  await createInterview(candidate, recruiter, job, application);
  await SavedJob.create({ user: candidate._id, job: job._id });
  await RecruiterNote.create({
    recruiter: recruiter._id,
    candidate: candidate._id,
    job: job._id,
    application: application._id,
    content: "Note",
  });
  await Notification.create({
    user: recruiter._id,
    recipient: recruiter._id,
    type: "info",
    title: "Job updated",
    message: "Status changed",
    entityType: "job",
    entityId: job._id,
  });

  const report = await cleanupService.deleteJobAndRelated(job._id);

  assert.equal(report.jobs, 1);
  assert.equal(await Job.findById(job._id), null);
  assert.equal(await Application.countDocuments({ job: job._id }), 0);
  assert.equal(await Conversation.countDocuments({ application: application._id }), 0);
  assert.equal(await Message.countDocuments({ conversation: conversation._id }), 0);
  assert.equal(await Interview.countDocuments({ job: job._id }), 0);
  assert.equal(await SavedJob.countDocuments({ job: job._id }), 0);
  assert.equal(await RecruiterNote.countDocuments({ job: job._id }), 0);
  assert.equal(await Notification.countDocuments({ entityId: job._id }), 0);
});

test("deleting an organization removes its data and unlinks member users", async () => {
  const owner = await createUser({ role: "recruiter" });
  const candidate = await createUser();
  const org = await createOrganization(owner);

  owner.organizationId = org._id;
  owner.currentOrganization = org._id;
  owner.organizations = [org._id];
  await owner.save();
  candidate.organizationId = org._id;
  candidate.organizations = [org._id];
  await candidate.save();

  await Company.create({ recruiter: owner._id, companyName: "Acme", organizationId: org._id });
  const job = await createJob(owner, org._id);
  const application = await createApplication(candidate, job, org._id);
  const conversation = await createConversation(candidate, owner, application, job);
  await Message.create({ conversation: conversation._id, sender: candidate._id, content: "Hi", organizationId: org._id });
  await createInterview(candidate, owner, job, application, org._id);
  await SavedJob.create({ user: candidate._id, job: job._id, organizationId: org._id });
  await RecruiterNote.create({
    recruiter: owner._id,
    candidate: candidate._id,
    job: job._id,
    application: application._id,
    content: "Note",
    organizationId: org._id,
  });
  await ParsedResume.create({ candidate: candidate._id, resumeUrl: "/uploads/resumes/x.pdf", organizationId: org._id });
  await Notification.create({
    user: owner._id,
    recipient: owner._id,
    type: "info",
    title: "Org update",
    message: "Org deleted",
    organizationId: org._id,
  });

  const report = await cleanupService.deleteOrganizationAndRelated(org._id);

  assert.equal(report.organizations, 1);
  assert.equal(await Organization.findById(org._id), null);
  assert.equal(await Job.countDocuments({ organizationId: org._id }), 0);
  assert.equal(await Application.countDocuments({ organizationId: org._id }), 0);
  assert.equal(await Conversation.countDocuments({ organizationId: org._id }), 0);
  assert.equal(await Message.countDocuments({ organizationId: org._id }), 0);
  assert.equal(await Interview.countDocuments({ organizationId: org._id }), 0);
  assert.equal(await SavedJob.countDocuments({ organizationId: org._id }), 0);
  assert.equal(await RecruiterNote.countDocuments({ organizationId: org._id }), 0);
  assert.equal(await ParsedResume.countDocuments({ organizationId: org._id }), 0);
  assert.equal(await Notification.countDocuments({ organizationId: org._id }), 0);
  assert.equal(await Company.countDocuments({ organizationId: org._id }), 0);

  const ownerFresh = await User.findById(owner._id);
  const candidateFresh = await User.findById(candidate._id);
  assert.equal(ownerFresh.organizationId, null);
  assert.equal(ownerFresh.currentOrganization, null);
  assert.equal(ownerFresh.organizations.length, 0);
  assert.equal(candidateFresh.organizationId, null);
  assert.equal(candidateFresh.organizations.length, 0);
});
