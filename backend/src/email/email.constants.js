const EMAIL_PROVIDER = Object.freeze({
  NODEMAILER: "nodemailer",
  RESEND: "resend",
  SENDGRID: "sendgrid",
  SES: "ses",
  MAILGUN: "mailgun",
  BREVO: "brevo",
});

const EMAIL_TYPES = Object.freeze({
  AUTH_WELCOME: "auth.welcome",
  AUTH_VERIFY_EMAIL: "auth.verifyEmail",
  AUTH_EMAIL_VERIFIED: "auth.emailVerified",
  AUTH_FORGOT_PASSWORD: "auth.forgotPassword",
  AUTH_RESET_PASSWORD: "auth.resetPassword",
  AUTH_PASSWORD_CHANGED: "auth.passwordChanged",

  CANDIDATE_REGISTRATION_SUCCESSFUL: "candidate.registrationSuccessful",
  CANDIDATE_JOB_APPLIED: "candidate.jobApplied",
  CANDIDATE_APPLICATION_VIEWED: "candidate.applicationViewed",
  CANDIDATE_SHORTLISTED: "candidate.shortlisted",
  CANDIDATE_INTERVIEW_SCHEDULED: "candidate.interviewScheduled",
  CANDIDATE_INTERVIEW_UPDATED: "candidate.interviewUpdated",
  CANDIDATE_INTERVIEW_CANCELLED: "candidate.interviewCancelled",
  CANDIDATE_INTERVIEW_REMINDER: "candidate.interviewReminder",
  CANDIDATE_OFFER_LETTER: "candidate.offerLetter",
  CANDIDATE_REJECTED: "candidate.rejected",
  CANDIDATE_PROFILE_APPROVED: "candidate.profileApproved",

  RECRUITER_REGISTERED: "recruiter.registered",
  RECRUITER_APPROVED: "recruiter.approved",
  RECRUITER_REJECTED: "recruiter.rejected",
  RECRUITER_NEW_APPLICATION_RECEIVED: "recruiter.newApplicationReceived",
  RECRUITER_JOB_PUBLISHED: "recruiter.jobPublished",
  RECRUITER_JOB_EXPIRED: "recruiter.jobExpired",
  RECRUITER_INTERVIEW_FEEDBACK_RECEIVED: "recruiter.interviewFeedbackReceived",

  ADMIN_RECRUITER_APPROVAL_REQUIRED: "admin.recruiterApprovalRequired",
  ADMIN_NEW_RECRUITER_REGISTERED: "admin.newRecruiterRegistered",
  ADMIN_CRITICAL_SYSTEM_ALERT: "admin.criticalSystemAlert",
});

module.exports = {
  EMAIL_PROVIDER,
  EMAIL_TYPES,
};
