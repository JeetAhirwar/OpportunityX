const { EMAIL_TYPES } = require("../email.constants");
const { absoluteClientUrl, renderLayout } = require("./layout");

const fullName = (data) => data.name || data.candidateName || data.recruiterName || data.adminName || "there";
const jobLabel = (data) => data.jobTitle || "the role";
const companyLabel = (data) => data.companyName || data.company || "the company";

const template = ({ subject, title, preheader, greeting, paragraphs, cta, details, note }) => (data = {}) => ({
  subject: typeof subject === "function" ? subject(data) : subject,
  html: renderLayout({
    title: typeof title === "function" ? title(data) : title,
    preheader: typeof preheader === "function" ? preheader(data) : preheader,
    greeting: typeof greeting === "function" ? greeting(data) : `Hello ${fullName(data)},`,
    paragraphs: typeof paragraphs === "function" ? paragraphs(data) : paragraphs,
    cta: typeof cta === "function" ? cta(data) : cta,
    details: typeof details === "function" ? details(data) : details,
    note: typeof note === "function" ? note(data) : note,
  }),
});

const registry = new Map([
  [EMAIL_TYPES.AUTH_WELCOME, template({
    subject: "Welcome to OpportunityX",
    title: "Welcome to OpportunityX",
    preheader: "Your OpportunityX account is ready.",
    paragraphs: () => ["Your account has been created successfully.", "Start exploring jobs, applications, recruiter tools, and account settings from your dashboard."],
    cta: () => ({ label: "Open dashboard", url: absoluteClientUrl("/") }),
  })],
  [EMAIL_TYPES.AUTH_VERIFY_EMAIL, template({
    subject: "Verify your OpportunityX email",
    title: "Verify your email address",
    preheader: "Confirm your OpportunityX email address.",
    paragraphs: () => ["Please verify this email address to keep your OpportunityX account secure.", "If you did not create this account, you can safely ignore this message."],
    cta: (data) => ({ label: "Verify email", url: data.verifyUrl || absoluteClientUrl("/login") }),
    note: "This verification link may expire for your security.",
  })],
  [EMAIL_TYPES.AUTH_EMAIL_VERIFIED, template({
    subject: "Your OpportunityX email is verified",
    title: "Email verified",
    paragraphs: () => ["Your email address has been verified successfully.", "You can continue using OpportunityX with confidence."],
    cta: () => ({ label: "Continue to OpportunityX", url: absoluteClientUrl("/") }),
  })],
  [EMAIL_TYPES.AUTH_FORGOT_PASSWORD, template({
    subject: "Reset your OpportunityX password",
    title: "Reset your password",
    preheader: "Use this secure link to reset your OpportunityX password.",
    paragraphs: () => ["We received a request to reset your OpportunityX password.", "Use the button below to choose a new password."],
    cta: (data) => ({ label: "Reset password", url: data.resetUrl || absoluteClientUrl("/forgot-password") }),
    note: "This link expires in one hour. If you did not request this, you can safely ignore this email.",
  })],
  [EMAIL_TYPES.AUTH_RESET_PASSWORD, template({
    subject: "OpportunityX password reset complete",
    title: "Password reset complete",
    paragraphs: () => ["Your OpportunityX password has been reset successfully.", "If this was not you, contact support immediately."],
    cta: () => ({ label: "Sign in", url: absoluteClientUrl("/login") }),
  })],
  [EMAIL_TYPES.AUTH_PASSWORD_CHANGED, template({
    subject: "Your OpportunityX password was changed",
    title: "Password changed",
    paragraphs: () => ["This confirms that your OpportunityX password was changed.", "If you did not make this change, contact support immediately."],
    cta: () => ({ label: "Review account", url: absoluteClientUrl("/settings") }),
  })],

  [EMAIL_TYPES.CANDIDATE_REGISTRATION_SUCCESSFUL, template({
    subject: "Your candidate account is ready",
    title: "Candidate registration successful",
    paragraphs: () => ["Your candidate profile is ready on OpportunityX.", "Complete your profile to improve job recommendations and recruiter visibility."],
    cta: () => ({ label: "Build profile", url: absoluteClientUrl("/candidate/profile") }),
  })],
  [EMAIL_TYPES.CANDIDATE_JOB_APPLIED, template({
    subject: (data) => `Application submitted for ${jobLabel(data)}`,
    title: "Application submitted",
    paragraphs: (data) => [`Your application for ${jobLabel(data)} at ${companyLabel(data)} has been submitted successfully.`, "You can track the latest status from your applications dashboard."],
    details: (data) => [{ label: "Role", value: jobLabel(data) }, { label: "Company", value: companyLabel(data) }],
    cta: () => ({ label: "View applications", url: absoluteClientUrl("/candidate/applied") }),
  })],
  [EMAIL_TYPES.CANDIDATE_APPLICATION_VIEWED, template({
    subject: (data) => `Your application for ${jobLabel(data)} was viewed`,
    title: "Application viewed",
    paragraphs: (data) => [`A recruiter viewed your application for ${jobLabel(data)}.`, "We will keep you posted when there is a status update."],
    cta: () => ({ label: "View application", url: absoluteClientUrl("/candidate/applied") }),
  })],
  [EMAIL_TYPES.CANDIDATE_SHORTLISTED, template({
    subject: (data) => `You were shortlisted for ${jobLabel(data)}`,
    title: "You were shortlisted",
    paragraphs: (data) => [`Good news: your application for ${jobLabel(data)} has moved forward.`, "Watch your dashboard and email for the next steps."],
    cta: () => ({ label: "Check status", url: absoluteClientUrl("/candidate/applied") }),
  })],
  [EMAIL_TYPES.CANDIDATE_INTERVIEW_SCHEDULED, template({
    subject: (data) => `Interview scheduled for ${jobLabel(data)}`,
    title: "Interview scheduled",
    paragraphs: (data) => [`Your interview for ${jobLabel(data)} has been scheduled.`, data.interviewTime ? `Interview time: ${data.interviewTime}` : "The recruiter will share interview details shortly."],
    cta: () => ({ label: "View details", url: absoluteClientUrl("/candidate/applied") }),
  })],
  [EMAIL_TYPES.CANDIDATE_INTERVIEW_UPDATED, template({
    subject: (data) => `Interview update for ${jobLabel(data)}`,
    title: "Interview updated",
    paragraphs: (data) => [`There is an update for your interview for ${jobLabel(data)}.`, data.interviewTime ? `Updated time: ${data.interviewTime}` : "Please check your application dashboard for the latest details."],
    cta: () => ({ label: "Review update", url: absoluteClientUrl("/candidate/interviews") }),
  })],
  [EMAIL_TYPES.CANDIDATE_INTERVIEW_CANCELLED, template({
    subject: (data) => `Interview cancelled for ${jobLabel(data)}`,
    title: "Interview cancelled",
    paragraphs: (data) => [`Your interview for ${jobLabel(data)} has been cancelled.`, "Check your interview dashboard for the latest status and recruiter updates."],
    cta: () => ({ label: "View interviews", url: absoluteClientUrl("/candidate/interviews") }),
  })],
  [EMAIL_TYPES.CANDIDATE_INTERVIEW_REMINDER, template({
    subject: (data) => `Reminder: ${data.interviewTitle || "Interview"} for ${jobLabel(data)}`,
    title: "Interview reminder",
    paragraphs: (data) => [`This is a reminder for your ${data.interviewTitle || "interview"} for ${jobLabel(data)}.`, data.interviewTime ? `Interview time: ${data.interviewTime}` : "Open OpportunityX for the interview details."],
    cta: () => ({ label: "Open interview", url: absoluteClientUrl("/candidate/interviews") }),
  })],
  [EMAIL_TYPES.CANDIDATE_OFFER_LETTER, template({
    subject: (data) => `Offer update for ${jobLabel(data)}`,
    title: "Offer received",
    paragraphs: (data) => [`You have received an offer update for ${jobLabel(data)} at ${companyLabel(data)}.`, "Review the details and respond through the recruiter process."],
    cta: () => ({ label: "View offer", url: absoluteClientUrl("/candidate/applied") }),
  })],
  [EMAIL_TYPES.CANDIDATE_REJECTED, template({
    subject: (data) => `Application update for ${jobLabel(data)}`,
    title: "Application update",
    paragraphs: (data) => [`Your application for ${jobLabel(data)} was not selected for the next stage.`, "Keep your profile current so OpportunityX can help you find the next suitable role."],
    cta: () => ({ label: "Explore jobs", url: absoluteClientUrl("/jobs") }),
  })],
  [EMAIL_TYPES.CANDIDATE_PROFILE_APPROVED, template({
    subject: "Your OpportunityX profile was approved",
    title: "Profile approved",
    paragraphs: () => ["Your OpportunityX profile has been approved.", "Recruiters can now evaluate your profile with greater confidence."],
    cta: () => ({ label: "View profile", url: absoluteClientUrl("/candidate/profile") }),
  })],

  [EMAIL_TYPES.RECRUITER_REGISTERED, template({
    subject: "Recruiter registration received",
    title: "Recruiter registration received",
    paragraphs: () => ["Your recruiter account has been created.", "Submit your company verification details to unlock active job publishing."],
    cta: () => ({ label: "Complete company profile", url: absoluteClientUrl("/recruiter/company") }),
  })],
  [EMAIL_TYPES.RECRUITER_APPROVED, template({
    subject: "Your recruiter profile is approved",
    title: "Recruiter approved",
    paragraphs: () => ["Your company verification has been approved.", "You can now publish active jobs and manage applicants on OpportunityX."],
    cta: () => ({ label: "Post a job", url: absoluteClientUrl("/recruiter/post-job") }),
  })],
  [EMAIL_TYPES.RECRUITER_REJECTED, template({
    subject: "Recruiter verification update",
    title: "Recruiter verification rejected",
    paragraphs: (data) => ["Your company verification could not be approved at this time.", data.reason ? `Reason: ${data.reason}` : "Please review your company details and submit again."],
    cta: () => ({ label: "Update company profile", url: absoluteClientUrl("/recruiter/company") }),
  })],
  [EMAIL_TYPES.RECRUITER_NEW_APPLICATION_RECEIVED, template({
    subject: (data) => `New application for ${jobLabel(data)}`,
    title: "New application received",
    paragraphs: (data) => [`${data.candidateName || "A candidate"} applied for ${jobLabel(data)}.`, "Review the applicant profile and decide the next step."],
    details: (data) => [{ label: "Candidate", value: data.candidateName || "Candidate" }, { label: "Role", value: jobLabel(data) }],
    cta: (data) => ({ label: "Review applicant", url: absoluteClientUrl(`/recruiter/applicants/${data.jobId || ""}`) }),
  })],
  [EMAIL_TYPES.RECRUITER_JOB_PUBLISHED, template({
    subject: (data) => `${jobLabel(data)} is published`,
    title: "Job published",
    paragraphs: (data) => [`Your job ${jobLabel(data)} is now published on OpportunityX.`, "You can manage applications from your recruiter dashboard."],
    cta: () => ({ label: "Manage jobs", url: absoluteClientUrl("/recruiter/jobs") }),
  })],
  [EMAIL_TYPES.RECRUITER_JOB_EXPIRED, template({
    subject: (data) => `${jobLabel(data)} has expired`,
    title: "Job expired",
    paragraphs: (data) => [`Your job ${jobLabel(data)} has expired or closed.`, "You can update the job or publish a new opportunity when ready."],
    cta: () => ({ label: "Manage jobs", url: absoluteClientUrl("/recruiter/jobs") }),
  })],
  [EMAIL_TYPES.RECRUITER_INTERVIEW_FEEDBACK_RECEIVED, template({
    subject: (data) => `Feedback received for ${data.interviewTitle || "an interview"}`,
    title: "Interview feedback received",
    paragraphs: (data) => [`Feedback was submitted for ${data.candidateName || "the candidate"} on ${data.interviewTitle || "an interview"}.`, "Review the interview score, recommendation, and comments from the recruiter interview workspace."],
    details: (data) => [{ label: "Candidate", value: data.candidateName || "Candidate" }, { label: "Role", value: jobLabel(data) }],
    cta: () => ({ label: "Review interviews", url: absoluteClientUrl("/recruiter/interviews") }),
  })],

  [EMAIL_TYPES.ADMIN_RECRUITER_APPROVAL_REQUIRED, template({
    subject: "Recruiter approval required",
    title: "Recruiter approval required",
    greeting: "Hello Admin,",
    paragraphs: (data) => [`${companyLabel(data)} submitted a recruiter verification request.`, "Review the company details before approving job publishing access."],
    cta: () => ({ label: "Open approvals", url: absoluteClientUrl("/admin/approvals") }),
  })],
  [EMAIL_TYPES.ADMIN_NEW_RECRUITER_REGISTERED, template({
    subject: "New recruiter registered",
    title: "New recruiter registered",
    greeting: "Hello Admin,",
    paragraphs: (data) => [`${data.recruiterName || "A recruiter"} registered on OpportunityX.`, "Monitor verification progress and platform activity from the admin dashboard."],
    cta: () => ({ label: "View recruiters", url: absoluteClientUrl("/admin/approvals") }),
  })],
  [EMAIL_TYPES.ADMIN_CRITICAL_SYSTEM_ALERT, template({
    subject: (data) => `Critical OpportunityX alert: ${data.alertTitle || "System issue"}`,
    title: "Critical system alert",
    greeting: "Hello Admin,",
    paragraphs: (data) => [data.alertMessage || "A critical system event needs attention.", "Investigate immediately and follow the incident response process."],
    cta: () => ({ label: "Open admin dashboard", url: absoluteClientUrl("/admin") }),
  })],
]);

const getTemplate = (type) => registry.get(type);
const listTemplates = () => Array.from(registry.keys()).sort();

module.exports = {
  getTemplate,
  listTemplates,
  registry,
};
