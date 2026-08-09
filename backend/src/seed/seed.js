// ============================================================
// OpportunityX — development database seeder (idempotent)
// Dummy identities only. Safe to run multiple times.
// Never run against production. Aborts when NODE_ENV=production.
// ============================================================

const crypto = require("crypto");
const dns = require("node:dns");
const mongoose = require("mongoose");
const env = require("../config/env");

dns.setServers(["8.8.8.8", "1.1.1.1"]);
const User = require("../models/user.model");
const Company = require("../models/company.model");
const Organization = require("../models/organization.model");
const Job = require("../models/job.model");
const Profile = require("../models/profile.model");
const Application = require("../models/application.model");
const Interview = require("../models/interview.model");
const SavedJob = require("../models/saved-job.model");
const Notification = require("../models/notification.model");
const Conversation = require("../models/conversation.model");
const Message = require("../models/message.model");
const RecruiterNote = require("../models/recruiter-note.model");
const ParsedResume = require("../models/parsed-resume.model");
const Report = require("../models/report.model");

const {
  SEED_PASSWORD,
  SEED_ADMINS,
  SEED_RECRUITERS,
  SEED_CANDIDATES,
  SEED_ORGANIZATIONS,
  JOB_CATEGORIES,
  SEED_JOB_SPECS,
  SEED_APPLICATIONS,
  SEED_INTERVIEWS,
  SEED_SAVED_JOBS,
  SEED_CHATS,
  SEED_NOTES,
  SEED_PARSED_RESUMES,
  SEED_REPORTS,
} = require("./seed-data");

const DAY_MS = 24 * 60 * 60 * 1000;

const SEEDED_MODELS = [
  User,
  Company,
  Organization,
  Job,
  Profile,
  Application,
  Interview,
  SavedJob,
  Notification,
  Conversation,
  Message,
  RecruiterNote,
  ParsedResume,
  Report,
];

const COUNTERS = {
  users: 0,
  companies: 0,
  organizations: 0,
  jobs: 0,
  profiles: 0,
  applications: 0,
  interviews: 0,
  savedJobs: 0,
  notifications: 0,
  conversations: 0,
  messages: 0,
  notes: 0,
  parsedResumes: 0,
  reports: 0,
};

const today = () => new Date();

async function findOrCreate(model, query, build, label) {
  const existing = await model.findOne(query);
  if (existing) return { doc: existing, created: false };
  const doc = await model.create(await build(query));
  COUNTERS[label] += 1;
  return { doc, created: true };
}

async function connect() {
  await mongoose.connect(env.mongodbUri);
  console.log(`[seed] connected to MongoDB database "${mongoose.connection.name}"`);
}

async function disconnect() {
  await mongoose.disconnect();
  console.log("[seed] connection closed");
}

async function reconcileStaleIndexes() {
  let dropped = 0;
  for (const model of SEEDED_MODELS) {
    const schemaPaths = new Set(Object.keys(model.schema.paths));
    const indexes = await model.collection.indexes();
    for (const index of indexes) {
      if (!index.unique) continue;
      const fields = Object.keys(index.key);
      if (fields.length && fields.every((field) => !schemaPaths.has(field))) {
        console.log(`[seed] dropping stale unique index "${index.name}" on ${model.collection.name} (fields [${fields.join(", ")}] not in current schema)`);
        await model.collection.dropIndex(index.name);
        dropped += 1;
      }
    }
  }
  if (dropped === 0) console.log("[seed] stale index check: none found");
}

function hashInvitationToken(email, role) {
  return crypto.createHash("sha256").update(`seed:${email}:${role}`).digest("hex");
}

async function seedUsers(userByEmail) {
  const people = [
    ...SEED_ADMINS.map((p) => ({ ...p, role: "admin" })),
    ...SEED_RECRUITERS.map((p) => ({ name: p.name, email: p.email, role: "recruiter" })),
    ...SEED_CANDIDATES.map((p) => ({ name: p.name, email: p.email, role: "candidate" })),
  ];
  for (const person of people) {
    const existing = await User.findOne({ email: person.email });
    if (existing) {
      userByEmail.set(person.email, existing);
      continue;
    }
    const user = await User.create({
      name: person.name,
      email: person.email,
      password: SEED_PASSWORD,
      role: person.role,
      isVerified: true,
      isActive: true,
    });
    userByEmail.set(person.email, user);
    COUNTERS.users += 1;
  }
  console.log(`[seed] users: ${COUNTERS.users} created, ${userByEmail.size - COUNTERS.users} already present`);
}

async function seedCompanies(userByEmail) {
  for (const rec of SEED_RECRUITERS) {
    if (!rec.companyName) continue;
    const recruiter = userByEmail.get(rec.email);
    const existing = await Company.findOne({ recruiter: recruiter._id });
    if (existing) continue;
    await Company.create({
      recruiter: recruiter._id,
      companyName: rec.companyName,
      recruiterName: rec.name,
      officialEmail: rec.email.replace("@opportunityx.local", "@company.local"),
      phone: rec.email.includes("02")
        ? "9988776655"
        : rec.email.includes("03")
          ? "9988776654"
          : "9988776653",
      website: `https://${rec.companyName.toLowerCase().replace(/[^a-z0-9]+/g, "")}.example.com`,
      location: "Bengaluru, India",
      companySize: "51-200",
      industry: "Technology",
      designation: "Recruiter",
      description: `Seed company profile for ${rec.companyName}.`,
      registrationNumber: `SEED-${rec.email.slice(0, 12).toUpperCase()}`,
      verificationStatus: rec.verificationStatus,
      submittedAt: today(),
      verifiedAt: rec.verificationStatus === "verified" ? today() : null,
    });
    COUNTERS.companies += 1;
  }
  console.log(`[seed] companies: ${COUNTERS.companies} created`);
}

function homeOrgFor(orgDocs, recruiterEmail) {
  for (const org of orgDocs) {
    if (String(org.ownerEmail) === recruiterEmail) return org;
  }
  for (const org of orgDocs) {
    if (org.memberEmails.has(recruiterEmail)) return org;
  }
  return null;
}

async function seedOrganizations(userByEmail) {
  const orgDocs = [];
  for (const spec of SEED_ORGANIZATIONS) {
    const owner = userByEmail.get(spec.ownerEmail);
    const members = spec.members.map((m) => {
      const user = userByEmail.get(m.email);
      return {
        user: user._id,
        role: m.role,
        status: m.status || "active",
        invitedBy: owner._id,
        invitedAt: today(),
        joinedAt: today(),
      };
    });
    const invitations = spec.invitations.map((inv) => {
      const invitedByUser = userByEmail.get(spec.ownerEmail);
      return {
        email: inv.email,
        role: inv.role,
        status: inv.status,
        tokenHash: hashInvitationToken(inv.email, inv.role),
        invitedBy: invitedByUser._id,
        expiresAt: new Date(today().getTime() + 30 * DAY_MS),
        acceptedAt: inv.status === "accepted" ? today() : null,
      };
    });

    let org = await Organization.findOne({ slug: spec.slug });
    if (!org) {
      org = await Organization.create({
        name: spec.name,
        slug: spec.slug,
        owner: owner._id,
        website: spec.website,
        industry: spec.industry,
        companySize: spec.companySize,
        country: spec.country,
        timezone: spec.timezone,
        subscriptionPlan: spec.subscriptionPlan,
        subscriptionStatus: spec.subscriptionStatus,
        members,
        invitations,
        branding: {
          primaryColor: spec.branding?.primaryColor,
          careerPageHeadline: spec.branding?.careerPageHeadline || "",
          companyDescription: spec.branding?.companyDescription || "",
        },
      });
      COUNTERS.organizations += 1;
    }

    for (const member of spec.members) {
      const user = userByEmail.get(member.email);
      const alreadyMember = org.members.some((m) => String(m.user) === String(user._id));
      if (!alreadyMember) {
        org.members.push({
          user: user._id,
          role: member.role,
          status: member.status || "active",
          joinedAt: today(),
        });
      }
      if (user) {
        const update = { $addToSet: { organizations: org._id } };
        if (!user.organizationId) update.$set = { ...(update.$set || {}), organizationId: org._id };
        if (!user.currentOrganization) update.$set = { ...(update.$set || {}), currentOrganization: org._id };
        await User.updateOne({ _id: user._id }, update);
      }
    }
    if (org.isModified("members")) await org.save();
    orgDocs.push({
      _id: org._id,
      ownerEmail: spec.ownerEmail,
      memberEmails: new Set(spec.members.map((m) => m.email)),
    });
  }
  console.log(`[seed] organizations: ${COUNTERS.organizations} created, ${orgDocs.length} configured`);
  return orgDocs;
}

async function seedJobs(userByEmail, orgDocs) {
  const companiesByRecruiterEmail = new Map();
  for (const rec of SEED_RECRUITERS) {
    if (!rec.companyName) continue;
    companiesByRecruiterEmail.set(rec.email, rec.companyName);
  }
  for (const spec of SEED_JOB_SPECS) {
    const recruiter = userByEmail.get(spec.recruiterEmail);
    const category = JOB_CATEGORIES[spec.title];
    const homeOrg = homeOrgFor(orgDocs, spec.recruiterEmail);
    const existing = await Job.findOne({ title: spec.title, postedBy: recruiter._id });
    if (existing) continue;
    const deadline =
      spec.status === "active"
        ? new Date(today().getTime() + 30 * DAY_MS)
        : null;
    await Job.create({
      title: spec.title,
      organizationId: homeOrg ? homeOrg._id : null,
      description: category.summary,
      responsibilities: category.responsibilities,
      qualifications: category.qualifications,
      company: companiesByRecruiterEmail.get(spec.recruiterEmail) || recruiter.name,
      location: category.location,
      salary: { min: category.salary.min, max: category.salary.max, currency: "INR" },
      skills: category.skills,
      experienceLevel: category.experienceLevel,
      jobType: category.jobType,
      workMode: category.workMode,
      deadline,
      status: spec.status,
      postedBy: recruiter._id,
      applicantCount: 0,
      views: Math.floor(Math.random() * 80) + 10,
      featured: Boolean(spec.featured),
      isExpired: false,
    });
    COUNTERS.jobs += 1;
  }
  console.log(`[seed] jobs: ${COUNTERS.jobs} created`);
}

async function seedProfiles(userByEmail) {
  for (const c of SEED_CANDIDATES) {
    const user = userByEmail.get(c.email);
    const existing = await Profile.findOne({ user: user._id });
    if (existing) continue;
    await Profile.create({
      user: user._id,
      username: `seed_${c.email.split("@")[0]}`,
      title: c.title,
      candidateType: c.candidateType,
      resumeUrl: `https://cdn.opportunityx.local/resumes/${c.email.split("@")[0]}.pdf`,
      name: c.name,
      phone: c.phone,
      location: c.location,
      bio: c.bio,
      skills: c.skills,
      education: c.education,
      experience: c.experience,
      projects: c.projects,
      certifications: c.certifications,
      socials: c.socials,
      expectedSalaryMin: c.expectedSalaryMin,
      preferredJobTypes: ["full-time"],
      preferredWorkModes: ["remote", "hybrid"],
      preferredIndustries: ["Technology"],
    });
    COUNTERS.profiles += 1;
  }
  console.log(`[seed] profiles: ${COUNTERS.profiles} created`);
}

async function seedApplications(userByEmail, applicationByKey, tracker) {
  for (const app of SEED_APPLICATIONS) {
    const key = `${app.candidateEmail}|${app.jobTitle}|${app.recruiterEmail}`;
    const candidate = userByEmail.get(app.candidateEmail);
    const recruiter = userByEmail.get(app.recruiterEmail);
    const job = await Job.findOne({ title: app.jobTitle, postedBy: recruiter._id });
    const existing = await Application.findOne({ job: job._id, candidate: candidate._id });
    if (existing) {
      applicationByKey.set(key, existing);
      continue;
    }
    const created = await Application.create({
      organizationId: job.organizationId,
      job: job._id,
      candidate: candidate._id,
      pipelineStage: app.stage,
      appliedAt: new Date(today().getTime() - 12 * DAY_MS),
    });
    applicationByKey.set(key, created);
    tracker.applications.add(String(created._id));
    COUNTERS.applications += 1;
    await Job.updateOne({ _id: job._id }, { $inc: { applicantCount: 1 } });
  }
  console.log(`[seed] applications: ${COUNTERS.applications} created, ${applicationByKey.size} mapped`);
}

async function seedInterviews(userByEmail, applicationByKey, tracker) {
  for (const inv of SEED_INTERVIEWS) {
    const key = `${inv.candidateEmail}|${inv.jobTitle}|${inv.recruiterEmail}`;
    const application = applicationByKey.get(key);
    if (!application) continue;
    const candidate = userByEmail.get(inv.candidateEmail);
    const recruiter = userByEmail.get(inv.recruiterEmail);
    const job = await Job.findOne({ title: inv.jobTitle, postedBy: recruiter._id });
    const existing = await Interview.findOne({
      candidate: candidate._id,
      job: job._id,
      recruiter: recruiter._id,
      title: inv.title,
    });
    if (existing) continue;
    const created = await Interview.create({
      organizationId: job.organizationId,
      application: application._id,
      candidate: candidate._id,
      job: job._id,
      recruiter: recruiter._id,
      title: inv.title,
      stage: inv.stage,
      mode: inv.mode,
      scheduledAt: new Date(today().getTime() + inv.daysAhead * DAY_MS),
      duration: inv.duration,
      timezone: inv.timezone,
      status: inv.status,
      cancelledReason: inv.cancelledReason || "",
      meetingLink:
        inv.mode === "google_meet"
          ? "https://meet.google.com/abc-defg-hij"
          : inv.mode === "zoom"
            ? "https://zoom.us/j/1234567890"
            : "",
    });
    tracker.interviews.add(String(created._id));
    COUNTERS.interviews += 1;
  }
  console.log(`[seed] interviews: ${COUNTERS.interviews} created`);
}

async function seedSavedJobs(userByEmail) {
  for (const item of SEED_SAVED_JOBS) {
    const candidate = userByEmail.get(item.candidateEmail);
    const recruiter = userByEmail.get(item.recruiterEmail);
    const job = await Job.findOne({ title: item.jobTitle, postedBy: recruiter._id });
    const existing = await SavedJob.findOne({ user: candidate._id, job: job._id });
    if (existing) continue;
    await SavedJob.create({
      organizationId: job.organizationId,
      user: candidate._id,
      job: job._id,
    });
    COUNTERS.savedJobs += 1;
  }
  console.log(`[seed] saved jobs: ${COUNTERS.savedJobs} created`);
}

async function createNotification({ user, recipient, sender, type, title, message, entityType, entityId, link, dedupeKey }) {
  const existing = await Notification.findOne({
    user: recipient._id,
    "metadata.dedupeKey": dedupeKey,
  });
  if (existing) return;
  await Notification.create({
    user: recipient._id,
    recipient: recipient._id,
    sender: sender ? sender._id : null,
    type,
    title,
    message,
    entityType,
    entityId: entityId || null,
    link: link || "",
    metadata: { dedupeKey },
  });
  COUNTERS.notifications += 1;
}

async function seedNotifications(userByEmail, applicationByKey) {
  const appliedType = "application_submitted";
  const newAppType = "new_application";
  const interviewType = "interview_scheduled";
  for (const [key, app] of applicationByKey) {
    const [candidateEmail, jobTitle, recruiterEmail] = key.split("|");
    const candidate = userByEmail.get(candidateEmail);
    const recruiter = userByEmail.get(recruiterEmail);
    await createNotification({
      user: candidate,
      recipient: candidate,
      type: appliedType,
      title: "Application submitted",
      message: `Your application for ${jobTitle} was submitted successfully.`,
      entityType: "Application",
      entityId: app._id,
      link: "/candidate/applications",
      dedupeKey: `seed:app:submitted:${app._id}`,
    });
    await createNotification({
      user: recruiter,
      recipient: recruiter,
      sender: candidate,
      type: newAppType,
      title: "New application received",
      message: `${candidate.name} applied for ${jobTitle}.`,
      entityType: "Application",
      entityId: app._id,
      link: "/recruiter/applications",
      dedupeKey: `seed:app:new:${app._id}`,
    });
  }
  const interviews = await Interview.find({
    status: { $in: ["scheduled", "confirmed"] },
  });
  for (const interview of interviews) {
    await createNotification({
      user: interview.candidate,
      recipient: interview.candidate,
      sender: interview.recruiter,
      type: interviewType,
      title: "Interview scheduled",
      message: `Your interview "${interview.title}" is scheduled.`,
      entityType: "Interview",
      entityId: interview._id,
      link: "/candidate/applications",
      dedupeKey: `seed:interview:${interview._id}`,
    });
  }
  console.log(`[seed] notifications: ${COUNTERS.notifications} created`);
}

async function seedChats(userByEmail, applicationByKey, tracker) {
  for (const chat of SEED_CHATS) {
    const key = `${chat.candidateEmail}|${chat.jobTitle}|${chat.recruiterEmail}`;
    const application = applicationByKey.get(key);
    if (!application) continue;
    const candidate = userByEmail.get(chat.candidateEmail);
    const recruiter = userByEmail.get(chat.recruiterEmail);
    const job = await Job.findOne({ title: chat.jobTitle, postedBy: recruiter._id });

    let conversation = await Conversation.findOne({ application: application._id });
    if (!conversation) {
      conversation = await Conversation.create({
        organizationId: job.organizationId,
        participants: [candidate._id, recruiter._id],
        job: job._id,
        application: application._id,
        unreadCounts: {},
      });
      tracker.conversations.add(String(conversation._id));
      COUNTERS.conversations += 1;
    }

    let lastMessageDoc = null;
    for (const msg of chat.messages) {
      const sender = msg.from === "candidate" ? candidate : recruiter;
      const existing = await Message.findOne({
        conversation: conversation._id,
        sender: sender._id,
        content: msg.content,
      });
      if (existing) {
        lastMessageDoc = existing;
        continue;
      }
      lastMessageDoc = await Message.create({
        organizationId: job.organizationId,
        conversation: conversation._id,
        sender: sender._id,
        content: msg.content,
        status: "sent",
        readBy: [],
      });
      COUNTERS.messages += 1;
      await createNotification({
        user: sender._id === candidate._id ? recruiter : candidate,
        recipient: sender._id === candidate._id ? recruiter : candidate,
        sender,
        type: "message_received",
        title: "New message",
        message: `${sender.name}: ${msg.content.slice(0, 80)}`,
        entityType: "Conversation",
        entityId: conversation._id,
        link: "/messages",
        dedupeKey: `seed:msg:${conversation._id}:${lastMessageDoc._id}`,
      });
    }

    if (lastMessageDoc) {
      await Conversation.updateOne(
        { _id: conversation._id },
        {
          $set: {
            lastMessage: lastMessageDoc._id,
            lastMessageText: lastMessageDoc.content,
            lastMessageAt: lastMessageDoc.createdAt || lastMessageDoc._id.getTimestamp(),
            unreadCounts: {
              [String(candidate._id)]: 0,
              [String(recruiter._id)]: 0,
            },
          },
        }
      );
    }
  }
  console.log(`[seed] conversations: ${COUNTERS.conversations} created, messages: ${COUNTERS.messages} created`);
}

async function seedNotes(userByEmail, applicationByKey, tracker) {
  for (const note of SEED_NOTES) {
    const key = `${note.candidateEmail}|${note.jobTitle}|${note.recruiterEmail}`;
    const application = applicationByKey.get(key);
    const candidate = userByEmail.get(note.candidateEmail);
    const recruiter = userByEmail.get(note.recruiterEmail);
    const job = await Job.findOne({ title: note.jobTitle, postedBy: recruiter._id });
    const existing = await RecruiterNote.findOne({
      recruiter: recruiter._id,
      candidate: candidate._id,
      job: job._id,
    });
    if (existing) continue;
    const created = await RecruiterNote.create({
      organizationId: job.organizationId,
      recruiter: recruiter._id,
      candidate: candidate._id,
      job: job._id,
      application: application ? application._id : null,
      content: note.content,
      mentions: [],
    });
    tracker.notes.add(String(created._id));
    COUNTERS.notes += 1;
  }
  console.log(`[seed] recruiter notes: ${COUNTERS.notes} created`);
}

async function seedParsedResumes(userByEmail, tracker) {
  for (const pr of SEED_PARSED_RESUMES) {
    const candidate = userByEmail.get(pr.candidateEmail);
    const existing = await ParsedResume.findOne({ candidate: candidate._id });
    if (existing) continue;
    const created = await ParsedResume.create({
      candidate: candidate._id,
      resumeUrl: pr.resumeUrl,
      fileName: pr.fileName,
      mimeType: pr.mimeType,
      atsScore: pr.atsScore,
      skills: pr.skills,
      techStack: pr.techStack,
      experienceYears: pr.experienceYears,
      parsedData: { skills: pr.skills, techStack: pr.techStack },
      lastAnalyzedAt: today(),
    });
    tracker.resumes.add(String(created._id));
    COUNTERS.parsedResumes += 1;
  }
  console.log(`[seed] parsed resumes: ${COUNTERS.parsedResumes} created`);
}

async function seedReports(userByEmail, tracker) {
  for (const rep of SEED_REPORTS) {
    const generatedBy = userByEmail.get(rep.generatedByEmail);
    const existing = await Report.findOne({ generatedBy: generatedBy._id, type: rep.type, format: rep.format });
    if (existing) continue;
    const created = await Report.create({
      generatedBy: generatedBy._id,
      type: rep.type,
      format: rep.format,
      fileUrl: rep.fileUrl,
      dateRange: { from: new Date(today().getTime() - 30 * DAY_MS), to: today() },
    });
    tracker.reports.add(String(created._id));
    COUNTERS.reports += 1;
  }
  console.log(`[seed] reports: ${COUNTERS.reports} created`);
}

async function validateRelationships(tracker) {
  let problems = [];
  let seedCount = 0;
  const jobIds = new Set((await Job.find().select("_id")).map((j) => String(j._id)));
  const userIds = new Set((await User.find().select("_id")).map((u) => String(u._id)));
  const orgIds = new Set((await Organization.find().select("_id")).map((o) => String(o._id)));

  const applications = await Application.find({ _id: { $in: [...tracker.applications] } });
  for (const app of applications) {
    seedCount += 1;
    if (!jobIds.has(String(app.job))) problems.push(`application ${app._id}: missing job`);
    if (!userIds.has(String(app.candidate))) problems.push(`application ${app._id}: missing candidate`);
    if (app.organizationId && !orgIds.has(String(app.organizationId))) problems.push(`application ${app._id}: missing organization`);
  }

  const interviews = await Interview.find({ _id: { $in: [...tracker.interviews] } });
  for (const interview of interviews) {
    seedCount += 1;
    if (!userIds.has(String(interview.candidate))) problems.push(`interview ${interview._id}: missing candidate`);
    if (!jobIds.has(String(interview.job))) problems.push(`interview ${interview._id}: missing job`);
    if (!userIds.has(String(interview.recruiter))) problems.push(`interview ${interview._id}: missing recruiter`);
  }

  const conversations = await Conversation.find({ _id: { $in: [...tracker.conversations] } });
  for (const convo of conversations) {
    seedCount += 1;
    for (const participant of convo.participants) {
      if (!userIds.has(String(participant))) problems.push(`conversation ${convo._id}: missing participant`);
    }
  }

  const notes = await RecruiterNote.find({ _id: { $in: [...tracker.notes] } });
  for (const note of notes) {
    seedCount += 1;
    if (!userIds.has(String(note.recruiter))) problems.push(`note ${note._id}: missing recruiter`);
    if (!userIds.has(String(note.candidate))) problems.push(`note ${note._id}: missing candidate`);
    if (!jobIds.has(String(note.job))) problems.push(`note ${note._id}: missing job`);
  }

  const resumes = await ParsedResume.find({ _id: { $in: [...tracker.resumes] } });
  for (const resume of resumes) {
    seedCount += 1;
    if (!userIds.has(String(resume.candidate))) problems.push(`parsed resume ${resume._id}: missing candidate`);
  }

  const reports = await Report.find({ _id: { $in: [...tracker.reports] } });
  for (const report of reports) {
    seedCount += 1;
    if (!userIds.has(String(report.generatedBy))) problems.push(`report ${report._id}: missing generatedBy`);
  }

  if (problems.length) {
    console.log(`[seed] relationship validation: ${problems.length} issue(s) across ${seedCount} seed records`);
    problems.slice(0, 20).forEach((p) => console.log(`  - ${p}`));
  } else {
    console.log(`[seed] relationship validation: OK (${seedCount} seed records checked)`);
  }
}

async function printSummary() {
  console.log("[seed] summary:");
  const rows = [
    ["User", await User.countDocuments()],
    ["Company", await Company.countDocuments()],
    ["Organization", await Organization.countDocuments()],
    ["Job", await Job.countDocuments()],
    ["Profile", await Profile.countDocuments()],
    ["Application", await Application.countDocuments()],
    ["Interview", await Interview.countDocuments()],
    ["SavedJob", await SavedJob.countDocuments()],
    ["Notification", await Notification.countDocuments()],
    ["Conversation", await Conversation.countDocuments()],
    ["Message", await Message.countDocuments()],
    ["RecruiterNote", await RecruiterNote.countDocuments()],
    ["ParsedResume", await ParsedResume.countDocuments()],
    ["Report", await Report.countDocuments()],
  ];
  for (const [name, count] of rows) {
    console.log(`  ${name.padEnd(14)} ${String(count).padStart(4)}`);
  }
  console.log(`[seed] default login: any seed account + password "${SEED_PASSWORD}"`);
}

async function main() {
  if (env.nodeEnv === "production") {
    console.log("SEED ABORTED: Production environment detected (NODE_ENV=production).");
    process.exit(1);
  }
  if (env.nodeEnv !== "development") {
    console.log(`[seed] warning: NODE_ENV is "${env.nodeEnv}" (not production) — proceeding.`);
  }

  const userByEmail = new Map();
  const applicationByKey = new Map();
  const orgDocs = [];
  const tracker = {
    applications: new Set(),
    interviews: new Set(),
    conversations: new Set(),
    notes: new Set(),
    resumes: new Set(),
    reports: new Set(),
  };

  await connect();

  try {
    await reconcileStaleIndexes();
    await seedUsers(userByEmail);
    await seedCompanies(userByEmail);
    const orgs = await seedOrganizations(userByEmail);
    orgDocs.push(...orgs);
    await seedJobs(userByEmail, orgDocs);
    await seedProfiles(userByEmail);
    await seedApplications(userByEmail, applicationByKey, tracker);
    await seedInterviews(userByEmail, applicationByKey, tracker);
    await seedSavedJobs(userByEmail);
    await seedNotifications(userByEmail, applicationByKey);
    await seedChats(userByEmail, applicationByKey, tracker);
    await seedNotes(userByEmail, applicationByKey, tracker);
    await seedParsedResumes(userByEmail, tracker);
    await seedReports(userByEmail, tracker);
    await validateRelationships(tracker);
    await printSummary();
  } catch (err) {
    console.error("[seed] ERROR:", err.message);
    console.error(err.stack);
    process.exitCode = 1;
  } finally {
    await disconnect();
  }
}

main();
