# Architecture

OpportunityX is a modular monorepo containing independently installable
frontend and backend applications.

## Request flow

```text
React feature
  -> services/api.ts
  -> VITE_API_BASE_URL
  -> Express route
  -> authentication/role/validation middleware
  -> controller
  -> Mongoose model
  -> MongoDB
```

The frontend owns presentation, browser state, protected routes, and API
requests. The backend owns authorization, validation, persistence, file
uploads, and API responses.

The backend environment module validates required startup configuration.
CORS is centralized and accepts only configured frontend origins. Roles are
defined in one constants module. Uploaded files are isolated under
`backend/src/uploads`; upload middleware validates MIME type, enforces file
size limits, and writes sanitized generated filenames. Production deployments
should replace local disk with durable object storage.

Frontend route modules are lazy loaded behind a global error boundary. Public,
candidate, recruiter, and admin route shells use role-based route guards, while
unknown nested dashboard paths render the shared not-found page instead of
silently masking broken links.

The existing controller behavior is intentionally preserved. New business
logic should move into `src/services` as controllers become more complex.

## Interview management

Interview management is split across `Interview` persistence,
`interview.service.js` business rules, `calendar.service.js` provider adapters,
and protected `/api/interviews` routes. Google Calendar and Outlook Calendar
are represented as disabled adapters; ICS export is enabled now, and future
calendar sync can be added behind the same service boundary without changing
frontend route contracts.

Interview notifications and emails reuse the existing notification gateway and
email registry. Socket.IO events are emitted to personal user rooms for
candidate, recruiter, and interviewer participants.

## Email automation

Email automation is isolated behind `backend/src/services/email.service.js`.
Controllers enqueue email intents; the email layer renders branded responsive
templates from `src/email/templates/registry.js`, sends through the configured
provider adapter, and retries through a queue abstraction. The current adapter
is Nodemailer, while the factory is structured for Resend, SendGrid, Amazon
SES, Mailgun, and Brevo without controller changes.

Admin-only preview and validation endpoints live under
`/api/admin/email/templates`. See `docs/email-architecture.md` for provider
configuration, security constraints, and template coverage.
