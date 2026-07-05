const env = require("../config/env");
const User = require("../models/user.model");
const logger = require("../utils/logger");
const { EMAIL_TYPES } = require("./email.constants");
const { createProvider } = require("./providers/provider.factory");
const InMemoryEmailQueue = require("./queue/in-memory-email.queue");
const { listTemplates, renderEmail } = require("./template-engine");
const { normalizeText } = require("./utils/sanitize");

let provider = createProvider();
let queue = new InMemoryEmailQueue({ worker: deliver });

function normalizeRecipient(recipient) {
  if (!recipient) return "";
  if (typeof recipient === "string") return recipient.trim();
  return recipient.email || "";
}

async function deliver(job) {
  const to = normalizeRecipient(job.to);
  if (!to) {
    logger.warn(`Skipped ${job.type} email without recipient`);
    return;
  }
  if (!provider.isConfigured()) {
    logger.warn(`Skipped ${job.type} email because provider is not configured`);
    return;
  }

  const rendered = renderEmail(job.type, job.data);
  await provider.send({
    to,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    headers: {
      "X-OpportunityX-Email-Type": job.type,
    },
  });
  logger.info(`Queued email delivered: ${job.type} to ${to}`);
}

const setQueueForTests = (nextQueue) => {
  queue = nextQueue;
};

const setProviderForTests = (nextProvider) => {
  provider = nextProvider;
};

const send = ({ to, type, data = {}, dedupeKey }) => {
  if (!type) throw new Error("Email type is required");
  renderEmail(type, data);
  return queue.enqueue({
    to,
    type,
    data,
    dedupeKey: dedupeKey || `${type}:${normalizeRecipient(to)}:${normalizeText(JSON.stringify(data)).slice(0, 120)}`,
  });
};

const sendToAdmins = async ({ type, data = {}, dedupeKey }) => {
  const admins = await User.find({ role: "admin", isActive: true }).select("email name").lean();
  return Promise.all(admins.map((admin) => send({
    to: admin.email,
    type,
    data: { ...data, adminName: admin.name },
    dedupeKey: `${dedupeKey || type}:${admin.email}`,
  })));
};

const preview = (type, data = {}) => renderEmail(type, data);

const validateTemplates = () => listTemplates().map((type) => {
  const rendered = renderEmail(type, {
    name: "Preview User",
    candidateName: "Jordan Candidate",
    recruiterName: "Riley Recruiter",
    companyName: "Acme Talent",
    jobTitle: "Senior MERN Developer",
    reason: "Company documentation needs to be updated.",
    resetUrl: `${env.clientUrl}/reset-password/preview-token`,
    verifyUrl: `${env.clientUrl}/verify-email/preview-token`,
    alertTitle: "SMTP delivery failure",
    alertMessage: "Email provider health check failed.",
  });
  return {
    type,
    subject: rendered.subject,
    hasHtml: rendered.html.length > 0,
    hasText: rendered.text.length > 0,
    hasLogo: rendered.html.includes("OpportunityX"),
    hasFooter: rendered.html.includes("Privacy matters"),
  };
});

const sendPasswordResetEmail = ({ email, name, resetUrl }) => send({
  to: email,
  type: EMAIL_TYPES.AUTH_FORGOT_PASSWORD,
  data: { name, resetUrl },
  dedupeKey: `${EMAIL_TYPES.AUTH_FORGOT_PASSWORD}:${email}`,
});

module.exports = {
  EMAIL_TYPES,
  listTemplates,
  preview,
  send,
  sendPasswordResetEmail,
  sendToAdmins,
  setProviderForTests,
  setQueueForTests,
  validateTemplates,
};
