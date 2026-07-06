# API Documentation

All endpoints are under `/api`. Protected endpoints require:

```http
Authorization: Bearer <jwt>
```

| Area | Endpoint | Access |
| --- | --- | --- |
| Health | `GET /api/health` | Public |
| Auth | `POST /api/auth/register` | Public |
| Auth | `POST /api/auth/login` | Public |
| Auth | `GET /api/auth/me` | Authenticated |
| Auth | `POST /api/auth/logout` | Authenticated |
| Auth | `POST /api/auth/forgot-password` | Public |
| Auth | `POST /api/auth/reset-password` | Public |
| Jobs | `GET /api/jobs` | Public |
| Jobs | `GET /api/jobs/featured` | Public |
| Jobs | `GET /api/jobs/:id` | Public |
| Jobs | `POST /api/jobs` | Recruiter |
| Jobs | `GET /api/jobs/my` | Recruiter |
| Jobs | `GET /api/jobs/my/:id` | Recruiter |
| Applications | `POST /api/applications/:jobId/apply` | Candidate |
| Applications | `GET /api/applications/me` | Candidate |
| Applications | `GET /api/applications/job/:jobId` | Recruiter |
| Interviews | `GET /api/interviews` | Candidate, recruiter, admin scoped |
| Interviews | `POST /api/interviews` | Recruiter or admin |
| Interviews | `GET /api/interviews/:id` | Participant or admin |
| Interviews | `PUT /api/interviews/:id` | Recruiter or admin |
| Interviews | `POST /api/interviews/:id/reschedule` | Recruiter or admin |
| Interviews | `POST /api/interviews/:id/cancel` | Recruiter or admin |
| Interviews | `POST /api/interviews/:id/duplicate` | Recruiter or admin |
| Interviews | `POST /api/interviews/:id/respond` | Candidate |
| Interviews | `POST /api/interviews/:id/feedback` | Recruiter or admin |
| Interviews | `GET /api/interviews/:id/calendar.ics` | Participant or admin |
| Interviews | `GET /api/interviews/analytics` | Recruiter or admin |
| Candidate | `GET/PUT /api/candidate/profile` | Candidate |
| Saved jobs | `GET /api/saved-jobs` | Candidate |
| Saved jobs | `POST /api/saved-jobs/:jobId` | Candidate toggle |
| Notifications | `/api/notifications` | Authenticated |
| Notifications | `GET /api/notifications/unread-count` | Authenticated |
| Notifications | `PATCH /api/notifications/:id/read` | Owner |
| Notifications | `PATCH /api/notifications/read-all` | Owner |
| Notifications | `DELETE /api/notifications/:id` | Owner |
| Notifications | `DELETE /api/notifications/clear` | Owner |
| AI | `POST /api/ai/career-assistant` | Candidate |
| AI | `POST /api/ai/resume-analyze` | Candidate |
| AI | `GET /api/ai/resume/parsed` | Candidate |
| AI | `GET /api/ai/job-recommendations` | Candidate |
| AI | `POST /api/ai/recruiter/job-description` | Recruiter |
| AI | `POST /api/ai/recruiter/interview-questions` | Recruiter |
| AI | `POST /api/ai/recruiter/candidate-summary` | Recruiter |
| AI | `GET /api/ai/recruiter/applications/:applicationId/match-score` | Recruiter |
| AI | `GET /api/ai/admin/insights` | Admin |
| Chat | `GET /api/chat/conversations` | Candidate or recruiter |
| Chat | `POST /api/chat/conversations/start` | Application participant |
| Chat | `GET /api/chat/messages/:conversationId` | Conversation participant |
| Chat | `PATCH /api/chat/conversations/:conversationId/read` | Conversation participant |
| Chat | `PATCH/DELETE /api/chat/messages/:messageId` | Message sender |
| Recruiter notes | `/api/recruiter/notes` | Recruiter |
| Company | `GET /api/recruiter/company` | Recruiter |
| Company | `PUT /api/recruiter/company` | Recruiter |
| Company | `POST /api/recruiter/company/submit-verification` | Recruiter |
| Admin | `GET /api/admin/analytics` | Admin |
| Admin | `GET /api/admin/users` | Admin |
| Admin | `PATCH /api/admin/users/:id/status` | Admin |
| Admin | `PATCH /api/admin/users/:id/role` | Admin |
| Admin | `DELETE /api/admin/users/:id` | Admin |
| Admin | `GET /api/admin/recruiters` | Admin |
| Admin | `GET /api/admin/recruiters/:id` | Admin |
| Admin | `PATCH /api/admin/recruiters/:id/approve` | Admin |
| Admin | `PATCH /api/admin/recruiters/:id/reject` | Admin |
| Admin | `GET /api/admin/jobs` | Admin |
| Admin | `PATCH /api/admin/jobs/:id/moderate` | Admin |
| Admin | `GET /api/admin/applications` | Admin |
| Admin | `GET /api/admin/email/templates` | Admin |
| Admin | `GET /api/admin/email/templates/validate` | Admin |
| Admin | `POST /api/admin/email/templates/:type/preview` | Admin |
| Admin | `/api/admin/*` | Admin |
| Public | `GET /api/public/profile/:username` | Public |
| Public | `GET /api/public/jobs/:id` | Public |

Validation errors use HTTP 400. Authentication failures use 401, role failures
use 403, and missing routes use 404.

Register and login return an access token plus a safe user DTO containing
`_id`, `name`, `email`, `role`, `isActive`, and `isVerified`. Password and
password-reset fields are never returned. `GET /api/auth/me` validates the
stored access token and returns the same safe user information.

Enterprise email delivery supports auth, candidate, recruiter, and admin
templates through a provider-neutral service. The current provider is
Nodemailer. Configure `EMAIL_PROVIDER`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`,
`SMTP_PASSWORD`, `FROM_EMAIL`, and `FROM_NAME`. Legacy `SMTP_PASS` and
`EMAIL_FROM` remain supported. Replace example values with real credentials in
production and never commit `.env`.

Admin email preview endpoints render templates without sending email:
`GET /api/admin/email/templates`, `GET /api/admin/email/templates/validate`,
and `POST /api/admin/email/templates/:type/preview`.

Backend logs are emitted as structured JSON through `LOG_LEVEL`
(`error`, `warn`, `info`, or `debug`). Common secret fields such as passwords,
tokens, authorization headers, and cookies are redacted before logging.

`POST /api/chat/conversations/start` accepts `{ "applicationId": "..." }`.
Socket clients authenticate with `auth: { token }` and may use
`join_conversation`, `send_message`, `message_seen`, `message_reaction`,
`edit_message`, `delete_message`, `typing_start`, `typing_stop`, and
`mark_conversation_read`.

Notification sockets are delivered to the authenticated user's personal room.
The server emits `notification_created`, `notification_received`, and
`notifications_unread_count` so multiple browser tabs stay synchronized after
create, read, read-all, delete, and clear actions.

Candidate profile upload accepts PDF and DOCX resumes up to 10 MB. Resume text
is extracted and stored server-side in `ParsedResume`; AI endpoints return ATS
analysis, parsed resume facts, job recommendations, recruiter match scoring,
and admin hiring intelligence through the backend provider fallback system.

Interview management supports schedule, reschedule, cancel, duplicate,
candidate response, feedback scoring, recruiter/admin analytics, Socket.IO
interview events, notification delivery, email templates, and ICS calendar
export. Google and Outlook calendar adapters are represented in the calendar
service and remain disabled until external credentials/integration are added.
