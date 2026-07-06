const mongoose = require("mongoose");
const Application = require("../models/application.model");
const Interview = require("../models/interview.model");
const Job = require("../models/job.model");
const User = require("../models/user.model");
const emailService = require("../services/email.service");
const notificationService = require("../services/notification.service");
const { TYPES } = notificationService;
const { EMAIL_TYPES } = emailService;

const populateInterview = (query) =>
  query
    .populate("candidate", "name email")
    .populate("recruiter", "name email")
    .populate("interviewers", "name email role")
    .populate("job", "title company location postedBy")
    .populate("application", "status pipelineStage");

const normalizeInterviewPayload = (body = {}) => ({
  title: String(body.title || "").trim(),
  description: String(body.description || "").trim(),
  stage: body.stage || "technical",
  customStage: String(body.customStage || "").trim(),
  mode: body.mode || "google_meet",
  meetingLink: String(body.meetingLink || "").trim(),
  location: String(body.location || "").trim(),
  scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
  duration: Number(body.duration || 60),
  timezone: String(body.timezone || "UTC").trim(),
  interviewers: Array.isArray(body.interviewers) ? body.interviewers.filter(mongoose.isValidObjectId) : [],
});

const emitInterviewEvent = (io, event, interview) => {
  if (!io || !interview) return;
  const recipients = [
    interview.candidate?._id || interview.candidate,
    interview.recruiter?._id || interview.recruiter,
    ...(interview.interviewers || []).map((item) => item?._id || item),
  ].filter(Boolean);
  for (const recipient of new Set(recipients.map(String))) {
    io.to(recipient).emit(event, interview);
  }
};

const sendInterviewMessages = async ({ io, interview, type, title, message, emailType, dedupeSuffix }) => {
  const candidateId = interview.candidate?._id || interview.candidate;
  await notificationService.createNotification({
    io,
    recipient: candidateId,
    sender: interview.recruiter?._id || interview.recruiter,
    type,
    title,
    message,
    entityType: "interview",
    entityId: interview._id,
    link: "/candidate/interviews",
    dedupeKey: `interview:${dedupeSuffix}:${interview._id}:${interview.updatedAt?.getTime?.() || Date.now()}`,
  });
  if (emailType && interview.candidate?.email) {
    emailService.send({
      to: interview.candidate.email,
      type: emailType,
      data: {
        name: interview.candidate.name,
        candidateName: interview.candidate.name,
        recruiterName: interview.recruiter?.name,
        jobTitle: interview.job?.title,
        companyName: interview.job?.company,
        interviewTitle: interview.title,
        interviewTime: new Date(interview.scheduledAt).toLocaleString("en-US", { timeZone: interview.timezone || "UTC" }),
        meetingLink: interview.meetingLink,
        mode: interview.mode,
      },
      dedupeKey: `email-interview:${dedupeSuffix}:${interview._id}:${interview.updatedAt?.getTime?.() || Date.now()}`,
    });
  }
};

const assertRecruiterAccess = async ({ user, applicationId, jobId }) => {
  if (applicationId) {
    const application = await Application.findById(applicationId).populate("job", "postedBy title company location").populate("candidate", "name email");
    if (!application || (user.role !== "admin" && String(application.job?.postedBy) !== String(user._id))) {
      const error = new Error("Application not found");
      error.statusCode = 404;
      throw error;
    }
    return { application, job: application.job, candidate: application.candidate };
  }
  const job = await Job.findById(jobId);
  if (!job || (user.role !== "admin" && String(job.postedBy) !== String(user._id))) {
    const error = new Error("Job not found");
    error.statusCode = 404;
    throw error;
  }
  return { job };
};

const createInterview = async ({ user, body, io }) => {
  const payload = normalizeInterviewPayload(body);
  if (!payload.title || !payload.scheduledAt || Number.isNaN(payload.scheduledAt.getTime())) {
    const error = new Error("title and valid scheduledAt are required");
    error.statusCode = 400;
    throw error;
  }
  const owned = await assertRecruiterAccess({ user, applicationId: body.applicationId, jobId: body.jobId });
  const candidate = body.candidateId || owned.candidate?._id;
  if (!candidate || !mongoose.isValidObjectId(candidate)) {
    const error = new Error("candidateId is required");
    error.statusCode = 400;
    throw error;
  }
  const interview = await Interview.create({
    ...payload,
    application: owned.application?._id || null,
    candidate,
    job: owned.job._id,
    recruiter: user.role === "admin" ? owned.job.postedBy : user._id,
  });
  if (owned.application) {
    owned.application.pipelineStage = "interview_scheduled";
    owned.application.status = "interview";
    owned.application.timeline.push({ type: "interview_scheduled", title: "Interview scheduled", actor: user._id, toStage: "interview_scheduled", metadata: { interview: interview._id } });
    await owned.application.save();
  }
  const populated = await populateInterview(Interview.findById(interview._id)).lean();
  await sendInterviewMessages({
    io,
    interview: populated,
    type: TYPES.INTERVIEW_SCHEDULED,
    title: "Interview Scheduled",
    message: `Your interview for ${populated.job?.title || "a role"} has been scheduled.`,
    emailType: EMAIL_TYPES.CANDIDATE_INTERVIEW_SCHEDULED,
    dedupeSuffix: "scheduled",
  });
  emitInterviewEvent(io, "interview_scheduled", populated);
  return populated;
};

const getAccessibleInterview = async ({ user, interviewId }) => {
  if (!mongoose.isValidObjectId(interviewId)) {
    const error = new Error("Invalid interview ID");
    error.statusCode = 400;
    throw error;
  }
  const interview = await populateInterview(Interview.findById(interviewId));
  if (!interview) {
    const error = new Error("Interview not found");
    error.statusCode = 404;
    throw error;
  }
  const isCandidate = user.role === "candidate" && String(interview.candidate?._id) === String(user._id);
  const isRecruiter = user.role === "recruiter" && String(interview.recruiter?._id) === String(user._id);
  const isInterviewer = (interview.interviewers || []).some((item) => String(item._id) === String(user._id));
  if (user.role !== "admin" && !isCandidate && !isRecruiter && !isInterviewer) {
    const error = new Error("Interview not found");
    error.statusCode = 404;
    throw error;
  }
  return interview;
};

const listInterviews = async ({ user, query = {} }) => {
  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(query.limit || 20)));
  const match = {};
  if (user.role === "candidate") match.candidate = user._id;
  if (user.role === "recruiter") match.recruiter = user._id;
  if (query.status && query.status !== "all") match.status = query.status;
  if (query.jobId && mongoose.isValidObjectId(query.jobId)) match.job = query.jobId;
  if (query.today === "true") {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    match.scheduledAt = { $gte: start, $lt: end };
  }
  const [items, total] = await Promise.all([
    populateInterview(Interview.find(match).sort({ scheduledAt: 1 }).skip((page - 1) * limit).limit(limit).lean()),
    Interview.countDocuments(match),
  ]);
  return { interviews: items, total, page, pages: Math.ceil(total / limit) };
};

const updateInterview = async ({ user, interviewId, body, io, status = null }) => {
  const interview = await getAccessibleInterview({ user, interviewId });
  if (user.role === "candidate") {
    const error = new Error("Candidates cannot manage interview details");
    error.statusCode = 403;
    throw error;
  }
  const previousStatus = interview.status;
  const payload = normalizeInterviewPayload(body);
  for (const key of ["title", "description", "stage", "customStage", "mode", "meetingLink", "location", "scheduledAt", "duration", "timezone", "interviewers"]) {
    if (payload[key] !== undefined && payload[key] !== null && payload[key] !== "") interview[key] = payload[key];
  }
  if (body.cancelledReason || body.reason) interview.cancelledReason = String(body.cancelledReason || body.reason).trim();
  if (status) interview.status = status;
  interview.timeline.push({ type: status || "updated", title: status ? `Interview ${status}` : "Interview updated", actor: user._id, fromStatus: previousStatus, toStatus: interview.status });
  await interview.save();
  const populated = await populateInterview(Interview.findById(interview._id)).lean();
  const event = status === "cancelled" ? "interview_cancelled" : status === "rescheduled" ? "interview_rescheduled" : "interview_updated";
  await sendInterviewMessages({
    io,
    interview: populated,
    type: status === "cancelled" ? TYPES.INTERVIEW_CANCELLED : TYPES.INTERVIEW_UPDATED,
    title: status === "cancelled" ? "Interview Cancelled" : "Interview Updated",
    message: `Your interview for ${populated.job?.title || "a role"} was ${status || "updated"}.`,
    emailType: status === "cancelled" ? EMAIL_TYPES.CANDIDATE_INTERVIEW_CANCELLED : EMAIL_TYPES.CANDIDATE_INTERVIEW_UPDATED,
    dedupeSuffix: status || "updated",
  });
  emitInterviewEvent(io, event, populated);
  return populated;
};

const duplicateInterview = async ({ user, interviewId, io }) => {
  const source = await getAccessibleInterview({ user, interviewId });
  if (user.role === "candidate") {
    const error = new Error("Candidates cannot duplicate interviews");
    error.statusCode = 403;
    throw error;
  }
  const copy = source.toObject();
  delete copy._id;
  delete copy.createdAt;
  delete copy.updatedAt;
  copy.status = "scheduled";
  copy.title = `${source.title} copy`;
  copy.timeline = [{ type: "duplicated", title: "Interview duplicated", actor: user._id, toStatus: "scheduled" }];
  const interview = await Interview.create(copy);
  const populated = await populateInterview(Interview.findById(interview._id)).lean();
  emitInterviewEvent(io, "interview_scheduled", populated);
  return populated;
};

const respondToInvitation = async ({ user, interviewId, action, reason = "", preferredTimes = [], io }) => {
  const interview = await getAccessibleInterview({ user, interviewId });
  if (String(interview.candidate?._id) !== String(user._id)) {
    const error = new Error("Only the candidate can respond to this invitation");
    error.statusCode = 403;
    throw error;
  }
  if (action === "accept") interview.status = "confirmed";
  if (action === "request_reschedule") {
    interview.rescheduleRequests.push({ requestedBy: user._id, reason, preferredTimes: preferredTimes.map((item) => new Date(item)).filter((date) => !Number.isNaN(date.getTime())) });
  }
  interview.timeline.push({ type: action, title: action === "accept" ? "Candidate accepted invitation" : "Candidate requested reschedule", actor: user._id, toStatus: interview.status, note: reason });
  await interview.save();
  const populated = await populateInterview(Interview.findById(interview._id)).lean();
  await notificationService.createNotification({
    io,
    recipient: interview.recruiter._id,
    sender: user._id,
    type: TYPES.INTERVIEW_UPDATED,
    title: action === "accept" ? "Interview Confirmed" : "Reschedule Requested",
    message: `${user.name} ${action === "accept" ? "accepted" : "requested a reschedule for"} ${interview.title}.`,
    entityType: "interview",
    entityId: interview._id,
    link: "/recruiter/interviews",
  });
  emitInterviewEvent(io, "interview_updated", populated);
  return populated;
};

const submitFeedback = async ({ user, interviewId, body, io }) => {
  const interview = await getAccessibleInterview({ user, interviewId });
  const allowed = user.role === "admin" || String(interview.recruiter?._id) === String(user._id) || (interview.interviewers || []).some((item) => String(item._id) === String(user._id));
  if (!allowed) {
    const error = new Error("You cannot submit feedback for this interview");
    error.statusCode = 403;
    throw error;
  }
  const existingIndex = interview.feedback.findIndex((item) => String(item.interviewer) === String(user._id));
  const feedback = {
    interviewer: user._id,
    technicalScore: Number(body.technicalScore || 0),
    communication: Number(body.communication || 0),
    problemSolving: Number(body.problemSolving || 0),
    cultureFit: Number(body.cultureFit || 0),
    comments: String(body.comments || "").trim(),
    recommendation: body.recommendation || "hold",
    submittedAt: new Date(),
  };
  if (existingIndex >= 0) interview.feedback[existingIndex] = feedback;
  else interview.feedback.push(feedback);
  const scores = interview.feedback.flatMap((item) => [item.technicalScore, item.communication, item.problemSolving, item.cultureFit]).filter((score) => Number(score) > 0);
  interview.score = scores.length ? Math.round((scores.reduce((sum, item) => sum + item, 0) / scores.length) * 10) / 10 : 0;
  interview.recommendation = feedback.recommendation;
  interview.timeline.push({ type: "feedback_received", title: "Feedback received", actor: user._id, toStatus: interview.status });
  await interview.save();
  const populated = await populateInterview(Interview.findById(interview._id)).lean();
  await notificationService.createNotification({
    io,
    recipient: interview.recruiter._id,
    sender: user._id,
    type: TYPES.INTERVIEW_FEEDBACK_RECEIVED,
    title: "Interview Feedback Received",
    message: `${user.name} submitted feedback for ${interview.title}.`,
    entityType: "interview",
    entityId: interview._id,
    link: "/recruiter/interviews",
  });
  emailService.send({
    to: interview.recruiter?.email,
    type: EMAIL_TYPES.RECRUITER_INTERVIEW_FEEDBACK_RECEIVED,
    data: { name: interview.recruiter.name, candidateName: interview.candidate.name, interviewTitle: interview.title, jobTitle: interview.job.title },
    dedupeKey: `email-interview-feedback:${interview._id}:${user._id}:${Date.now()}`,
  });
  emitInterviewEvent(io, "interview_feedback_received", populated);
  return populated;
};

module.exports = {
  createInterview,
  duplicateInterview,
  getAccessibleInterview,
  listInterviews,
  respondToInvitation,
  submitFeedback,
  updateInterview,
};
