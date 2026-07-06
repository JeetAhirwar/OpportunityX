# OpportunityX Chat API

The complete API index is in [`docs/api-documentation.md`](docs/api-documentation.md).

## Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

Forgot-password always returns a generic success response. Reset links contain
a one-time random token whose SHA-256 hash and one-hour expiry are stored on
the user record. Login remains available to unverified users until a complete
email verification flow is implemented, but inactive users are rejected.
Public registration accepts only `candidate` and `recruiter`; admin accounts
cannot be created through `/api/auth/register`.

## Organizations

Organization endpoints require the OpportunityX bearer token. Tenant-aware
resource requests can pass `x-organization-id`; authenticated users may only
resolve organizations where they are active members.

- `POST /api/organizations` creates an organization and makes the caller owner.
- `GET /api/organizations` lists organizations for the current user.
- `GET /api/organizations/:organizationId` returns one organization.
- `PUT /api/organizations/:organizationId` updates profile fields.
- `DELETE /api/organizations/:organizationId` deletes an owner-controlled organization.
- `POST /api/organizations/:organizationId/invitations` creates a member invitation.
- `POST /api/organizations/invitations/accept` accepts an invitation token.
- `PATCH /api/organizations/:organizationId/members/:userId/role` changes a member role.
- `PATCH /api/organizations/:organizationId/members/:userId/suspend` suspends a member.
- `DELETE /api/organizations/:organizationId/members/:userId` removes a member.
- `PATCH /api/organizations/:organizationId/owner` transfers ownership.
- `PATCH /api/organizations/:organizationId/branding` updates logo/color/career-page/email branding.
- `PATCH /api/organizations/:organizationId/settings` updates organization settings.
- `GET /api/public/careers/:slug` returns the public company profile and active jobs.

Permission matrix:

| Role | Key permissions |
| --- | --- |
| Owner | Full organization, member, branding, settings, jobs, applications, interviews, analytics, ownership transfer |
| Admin | Full management except organization deletion and ownership transfer |
| Recruiter | Jobs, applications, interviews, analytics, member read |
| Hiring Manager | Job/application/interview collaboration and analytics |
| Interviewer | Read jobs/applications and manage interview participation |
| Viewer | Read organization, jobs, applications, and analytics |

Chat endpoints are mounted at `/api/chat` and require the OpportunityX bearer
token. Conversation creation requires an `applicationId`; the backend derives
the candidate, recruiter, and job from that application and rejects unrelated
users and administrators.

- `GET /api/chat/conversations` returns the authenticated user's conversations
  with unread counts.
- `POST /api/chat/conversations/start` starts or returns the application-bound
  candidate/recruiter conversation.
- `GET /api/chat/messages/:conversationId?page=1&limit=50` returns paginated
  messages in chronological order and includes `hasMore`.
- `POST /api/chat/upload` accepts one multipart `attachment` field for images,
  PDFs, DOC, or DOCX files up to 10 MB.
- `PATCH /api/chat/conversations/:conversationId/read` marks a conversation
  read for the current user.
- `PATCH /api/chat/messages/:messageId` edits only the sender's own message.
- `DELETE /api/chat/messages/:messageId` soft-deletes only the sender's own
  message.

Socket.IO connects to the OpportunityX backend using:

```js
io(VITE_SOCKET_URL, { auth: { token } });
```

The merged server supports conversation rooms, personal user rooms, messages,
typing, reactions, edit/delete, seen state, online users, unread counts, and
notification events.

Socket events implemented:

- Client to server: `join_conversation`, `send_message`, `message_seen`,
  `message_reaction`, `edit_message`, `delete_message`, `typing_start`,
  `typing_stop`, `mark_conversation_read`.
- Server to client: `online_users`, `receive_message`, `message_sent`,
  `conversations_updated`, `message_seen`, `message_reaction_updated`,
  `message_updated`, `message_edited`, `message_deleted`, `typing_start`,
  `typing_stop`, `message_action_error`, `notification_created`,
  `notification_received`.

## Notifications

Notification endpoints are mounted at `/api/notifications` and require the
OpportunityX bearer token. Users can only access their own notifications;
admin, recruiter, and candidate notifications are isolated by recipient room
and MongoDB owner filters.

- `GET /api/notifications` returns the current user's latest notifications as
  an array for backward compatibility.
- `GET /api/notifications?page=1&limit=20&unreadOnly=false&type=message`
  returns `{ success, notifications, pagination, unreadCount }` for paginated
  notification centers.
- `GET /api/notifications/unread-count` returns `{ unreadCount }`.
- `PATCH /api/notifications/:id/read` marks one owned notification read.
- `PATCH /api/notifications/read-all` marks all owned notifications read.
- `DELETE /api/notifications/:id` deletes one owned notification.
- `DELETE /api/notifications/clear` clears all owned notifications.

Notification documents persist `recipient`, backward-compatible `user`,
optional `sender`, `type`, `title`, `message`, `entityType`, `entityId`,
`link`, `icon`, `priority`, `isRead`, backward-compatible `read`, `readAt`,
`metadata`, and timestamps.

Socket events:

- `notification_created` and `notification_received` deliver the notification
  payload to the recipient room.
- `notifications_unread_count` delivers `{ unreadCount }` after create, read,
  read-all, delete, and clear actions.

Implemented notification types include `application_submitted`,
`application_viewed`, `application_shortlisted`, `interview_scheduled`,
`interview_updated`, `offer_received`, `application_rejected`,
`message_received`, `profile_verification`, `account_update`,
`new_application`, `application_withdrawn`, `job_moderation`,
`admin_announcement`, `recruiter_registered`, `recruiter_approval_pending`,
`abuse_report`, `failed_upload`, and `system_alert`.

## Interviews

Interview endpoints are mounted at `/api/interviews` and require authentication.
Recruiters can manage only interviews for their own jobs, candidates can access
only their own interviews, and admins can access all interviews.

- `GET /api/interviews?page=1&limit=20&status=scheduled&today=true` lists
  accessible interviews.
- `POST /api/interviews` schedules an interview with `applicationId`,
  `candidateId`, `jobId`, `title`, `description`, `stage`, `customStage`,
  `mode`, `meetingLink`, `location`, `scheduledAt`, `duration`, `timezone`,
  and `interviewers`.
- `GET /api/interviews/:id` returns one accessible interview.
- `PUT /api/interviews/:id` updates interview details.
- `POST /api/interviews/:id/reschedule` marks an interview rescheduled.
- `POST /api/interviews/:id/cancel` cancels an interview.
- `POST /api/interviews/:id/duplicate` creates a copy.
- `POST /api/interviews/:id/respond` lets candidates accept or request
  reschedule.
- `POST /api/interviews/:id/feedback` stores technical, communication,
  problem-solving, culture-fit, comments, and recommendation feedback.
- `GET /api/interviews/:id/calendar.ics` downloads an ICS invite.
- `GET /api/interviews/analytics` returns recruiter/admin interview metrics.
- `GET /api/interviews/calendar/providers` returns modular calendar adapter
  capabilities.

Socket.IO personal rooms receive `interview_scheduled`, `interview_updated`,
`interview_rescheduled`, `interview_cancelled`, and
`interview_feedback_received`.

## AI

All AI endpoints require authentication, role authorization, backend-only
provider calls, and the configured AI rate limit. The frontend never receives
AI provider keys. The backend tries `AI_PROVIDER` first, then
`AI_FALLBACK_PROVIDERS` in order. Supported providers are Gemini, OpenRouter,
Groq, and optional OpenAI.

If every provider is missing, quota limited, or unavailable, endpoints return a
controlled fallback response instead of raw vendor errors:

```json
{
  "success": false,
  "provider": null,
  "message": "AI helper is temporarily unavailable. Please try again later.",
  "fallback": true
}
```

- `POST /api/ai/career-assistant` candidate-only career Q&A.
- `POST /api/ai/resume-analyze` candidate-only resume/profile analysis.
  Accepts optional `resumeText` and `jobId`; returns ATS score, strengths,
  weaknesses, missing keywords, formatting suggestions, role fit score,
  improvement suggestions, resume summary rewrite, and parsed resume facts.
- `GET /api/ai/resume/parsed` candidate-only parsed resume data for the current
  uploaded resume.
- `GET /api/ai/job-recommendations` candidate-only job recommendations with
  skill gaps, learning path suggestions, resume tips, and career roadmap.
- `POST /api/ai/recruiter/job-description` recruiter-only job description
  preview.
- `POST /api/ai/recruiter/interview-questions` recruiter-only screening
  questions.
- `POST /api/ai/recruiter/candidate-summary` recruiter-only candidate summary.
- `GET /api/ai/recruiter/applications/:applicationId/match-score`
  recruiter-only advisory scoring for owned applicants, including match score,
  skill match, experience match, education match, salary fit, location fit,
  resume quality, risk flags, suggested interview questions, and screening
  summary.
- `GET /api/ai/admin/insights` admin-only aggregate insight generation with
  resume quality and skill demand trends.

## Candidate

- `GET /api/candidate/profile` returns the persisted candidate profile.
- `PUT /api/candidate/profile` creates or updates the profile and accepts an
  optional PDF or DOCX `resume` multipart field up to 10 MB. Resume parsing is
  performed on the backend and stored in `ParsedResume`.
- Candidate profiles persist `preferredJobTypes`, `preferredWorkModes`,
  `preferredIndustries`, and `expectedSalaryMin`.
- `GET /api/applications/me` returns paginated candidate applications.
- `PATCH /api/applications/:id/withdraw` withdraws an eligible application.
- `GET /api/saved-jobs` returns populated saved jobs.
- `POST /api/saved-jobs/:jobId` toggles saved state.

Job-alert APIs are not yet implemented; the frontend does not simulate local
persistence.

## Admin

`POST /api/admin/bootstrap` is the only public admin endpoint. It creates the
first admin account only, requires `ADMIN_REGISTRATION_CODE`, validates
`name`, `email`, `password`, and `code`, returns a safe user object without a
password hash, and returns 403 after any admin already exists.

```http
POST http://localhost:8000/api/admin/bootstrap
Content-Type: application/json
```

```json
{
  "name": "Admin",
  "email": "admin@opportunityx.com",
  "password": "Admin@12345",
  "code": "your-admin-bootstrap-code"
}
```

PowerShell example:

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:8000/api/admin/bootstrap" `
  -ContentType "application/json" `
  -Body '{"name":"Admin","email":"admin@opportunityx.com","password":"Admin@12345","code":"your-admin-bootstrap-code"}'
```

All other admin endpoints require an authenticated user with role `admin`.

- `POST /api/admin/users` creates a user as an authenticated admin. Body:
  `name`, `email`, `password`, and `role`. Role may be `candidate`,
  `recruiter`, or `admin`; duplicate emails are rejected and password hashes
  are never returned.
- `GET /api/admin/analytics` returns platform totals, grouped metrics, pending
  approvals, and recent users/jobs/applications.
- `GET /api/admin/users` lists safe user fields; passwords and reset tokens are
  never returned.
- `PATCH /api/admin/users/:id/status` suspends or reactivates a user.
- `PATCH /api/admin/users/:id/role` changes a user's role. Self-demotion
  requires `confirm: true`.
- `DELETE /api/admin/users/:id` deletes a user.
- Admins cannot suspend or delete their own account, and the API prevents
  demoting, suspending, or deleting the last remaining admin.
- `GET /api/admin/recruiters` and `GET /api/admin/recruiters/:id` expose
  Company verification records.
- `PATCH /api/admin/recruiters/:id/approve` verifies the Company and recruiter,
  records `verifiedAt` and `verifiedBy`, and notifies the recruiter.
- `PATCH /api/admin/recruiters/:id/reject` requires a reason, stores it, and
  notifies the recruiter.
- `GET /api/admin/jobs` lists all jobs.
- `PATCH /api/admin/jobs/:id/moderate` changes status or featured state.
- `GET /api/admin/applications` returns a read-only populated application list.
- `GET /api/admin/email/templates` lists registered enterprise email template
  keys.
- `GET /api/admin/email/templates/validate` renders every template with safe
  preview data and reports HTML, text, branding, and footer coverage.
- `POST /api/admin/email/templates/:type/preview` renders a template preview.
  Example type: `auth.forgotPassword`.

## Recruiter

- `GET /api/jobs/my` lists jobs owned by the authenticated recruiter.
- `GET /api/jobs/my/:id` returns one owned job without incrementing public
  views.
- `POST /api/jobs`, `PUT /api/jobs/:id`, `DELETE /api/jobs/:id`, and
  `PATCH /api/jobs/:id/status` enforce recruiter ownership.
- Active publishing requires a Company record with
  `verificationStatus: "verified"`; draft jobs remain available.
- `GET /api/applications/recruiter` lists applicants across owned jobs.
- `GET /api/applications/job/:jobId` lists applicants for one owned job.
- `GET /api/recruiter/company` loads the recruiter's Company profile.
- `PUT /api/recruiter/company` creates or updates the Company profile.
- `POST /api/recruiter/company/submit-verification` validates required fields
  and changes verification status to `pending`.
