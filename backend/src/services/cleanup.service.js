const User = require("../models/user.model");
const Job = require("../models/job.model");
const Application = require("../models/application.model");
const Conversation = require("../models/conversation.model");
const Message = require("../models/message.model");
const Interview = require("../models/interview.model");
const SavedJob = require("../models/saved-job.model");
const RecruiterNote = require("../models/recruiter-note.model");
const ParsedResume = require("../models/parsed-resume.model");
const Notification = require("../models/notification.model");
const Company = require("../models/company.model");
const Organization = require("../models/organization.model");

const deletedCount = (result) => result?.deletedCount || 0;

const emptyReport = () => ({
  applications: 0,
  conversations: 0,
  messages: 0,
  interviews: 0,
  savedJobs: 0,
  recruiterNotes: 0,
  notifications: 0,
  parsedResumes: 0,
  companies: 0,
  jobs: 0,
  users: 0,
  organizations: 0,
});

const mergeReport = (target, source) => {
  for (const key of Object.keys(emptyReport())) {
    target[key] = (target[key] || 0) + (source[key] || 0);
  }
  return target;
};

const cleanupNotificationsFor = async (entityIds) => {
  if (!entityIds.length) return 0;
  return deletedCount(await Notification.deleteMany({ entityId: { $in: entityIds } }));
};

// Removes every record that is uniquely tied to the given applications.
const cleanupApplications = async (applicationIds) => {
  const report = emptyReport();
  if (!applicationIds.length) return report;

  const conversationIds = await Conversation.find({ application: { $in: applicationIds } }).distinct("_id");
  const interviewIds = await Interview.find({ application: { $in: applicationIds } }).distinct("_id");
  const noteIds = await RecruiterNote.find({ application: { $in: applicationIds } }).distinct("_id");

  if (conversationIds.length) {
    report.messages = deletedCount(await Message.deleteMany({ conversation: { $in: conversationIds } }));
    report.conversations = deletedCount(await Conversation.deleteMany({ _id: { $in: conversationIds } }));
  }
  report.interviews = deletedCount(await Interview.deleteMany({ _id: { $in: interviewIds } }));
  report.recruiterNotes = deletedCount(await RecruiterNote.deleteMany({ _id: { $in: noteIds } }));

  report.notifications = await cleanupNotificationsFor([
    ...applicationIds,
    ...conversationIds,
    ...interviewIds,
    ...noteIds,
  ]);

  report.applications = deletedCount(await Application.deleteMany({ _id: { $in: applicationIds } }));
  return report;
};

// Removes every record that is uniquely tied to the given jobs.
const cleanupJobs = async (jobIds) => {
  const report = emptyReport();
  if (!jobIds.length) return report;

  const applicationIds = await Application.find({ job: { $in: jobIds } }).distinct("_id");
  if (applicationIds.length) {
    mergeReport(report, await cleanupApplications(applicationIds));
  }

  const conversationIds = await Conversation.find({ job: { $in: jobIds } }).distinct("_id");
  if (conversationIds.length) {
    report.messages += deletedCount(await Message.deleteMany({ conversation: { $in: conversationIds } }));
    report.conversations += deletedCount(await Conversation.deleteMany({ _id: { $in: conversationIds } }));
  }

  report.savedJobs = deletedCount(await SavedJob.deleteMany({ job: { $in: jobIds } }));
  report.recruiterNotes += deletedCount(
    await RecruiterNote.deleteMany({ job: { $in: jobIds } })
  );
  report.notifications += await cleanupNotificationsFor(jobIds);
  return report;
};

const deleteJobAndRelated = async (jobId) => {
  const job = await Job.findById(jobId);
  if (!job) return null;

  const report = mergeReport(emptyReport(), await cleanupJobs([jobId]));
  await Job.deleteOne({ _id: jobId });
  report.jobs = 1;
  return report;
};

const deleteUserAndRelated = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return null;

  const ownedOrganizations = await Organization.countDocuments({ owner: userId });
  if (ownedOrganizations > 0) {
    throw new Error(
      "Cannot delete a user who owns an organization. Transfer or delete the organization first."
    );
  }

  const report = emptyReport();

  const jobIds = await Job.find({ postedBy: userId }).distinct("_id");
  if (jobIds.length) {
    mergeReport(report, await cleanupJobs(jobIds));
    report.jobs += deletedCount(await Job.deleteMany({ _id: { $in: jobIds } }));
  }

  const applicationIds = await Application.find({ candidate: userId }).distinct("_id");
  if (applicationIds.length) {
    mergeReport(report, await cleanupApplications(applicationIds));
  }

  const interviewIds = await Interview.find({
    $or: [{ candidate: userId }, { recruiter: userId }],
  }).distinct("_id");
  if (interviewIds.length) {
    report.interviews += deletedCount(await Interview.deleteMany({ _id: { $in: interviewIds } }));
    report.notifications += await cleanupNotificationsFor(interviewIds);
  }

  const conversationIds = await Conversation.find({ participants: userId }).distinct("_id");
  if (conversationIds.length) {
    report.messages += deletedCount(await Message.deleteMany({ conversation: { $in: conversationIds } }));
    report.conversations += deletedCount(await Conversation.deleteMany({ _id: { $in: conversationIds } }));
    report.notifications += await cleanupNotificationsFor(conversationIds);
  }

  report.savedJobs += deletedCount(await SavedJob.deleteMany({ user: userId }));
  report.recruiterNotes += deletedCount(
    await RecruiterNote.deleteMany({ $or: [{ recruiter: userId }, { candidate: userId }] })
  );
  report.parsedResumes += deletedCount(await ParsedResume.deleteMany({ candidate: userId }));
  report.companies += deletedCount(await Company.deleteMany({ recruiter: userId }));

  report.notifications += deletedCount(
    await Notification.deleteMany({
      $or: [{ user: userId }, { recipient: userId }, { sender: userId }],
    })
  );

  await Organization.updateMany({ "members.user": userId }, { $pull: { members: { user: userId } } });
  await User.updateMany({ organizations: userId }, { $pull: { organizations: userId } });

  await User.findByIdAndDelete(userId);
  report.users = 1;
  return report;
};

const deleteOrganizationAndRelated = async (organizationId) => {
  const organization = await Organization.findById(organizationId);
  if (!organization) return null;

  const report = emptyReport();

  const jobIds = await Job.find({ organizationId }).distinct("_id");
  if (jobIds.length) {
    mergeReport(report, await cleanupJobs(jobIds));
    report.jobs += deletedCount(await Job.deleteMany({ _id: { $in: jobIds } }));
  }

  const applicationIds = await Application.find({ organizationId }).distinct("_id");
  if (applicationIds.length) {
    mergeReport(report, await cleanupApplications(applicationIds));
  }

  const interviewIds = await Interview.find({ organizationId }).distinct("_id");
  if (interviewIds.length) {
    report.interviews += deletedCount(await Interview.deleteMany({ _id: { $in: interviewIds } }));
    report.notifications += await cleanupNotificationsFor(interviewIds);
  }

  const conversationIds = await Conversation.find({ organizationId }).distinct("_id");
  if (conversationIds.length) {
    report.messages += deletedCount(await Message.deleteMany({ conversation: { $in: conversationIds } }));
    report.conversations += deletedCount(await Conversation.deleteMany({ _id: { $in: conversationIds } }));
    report.notifications += await cleanupNotificationsFor(conversationIds);
  }

  report.savedJobs += deletedCount(await SavedJob.deleteMany({ organizationId }));
  report.recruiterNotes += deletedCount(await RecruiterNote.deleteMany({ organizationId }));
  report.parsedResumes += deletedCount(await ParsedResume.deleteMany({ organizationId }));
  report.companies += deletedCount(await Company.deleteMany({ organizationId }));
  report.notifications += deletedCount(await Notification.deleteMany({ organizationId }));

  await User.updateMany({ organizationId }, { $set: { organizationId: null } });
  await User.updateMany({ currentOrganization: organizationId }, { $set: { currentOrganization: null } });
  await User.updateMany({ organizations: organizationId }, { $pull: { organizations: organizationId } });

  await Organization.findByIdAndDelete(organizationId);
  report.organizations = 1;
  return report;
};

module.exports = {
  cleanupApplications,
  cleanupJobs,
  deleteJobAndRelated,
  deleteOrganizationAndRelated,
  deleteUserAndRelated,
};
