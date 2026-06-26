# Next Steps

- Run browser visual QA for the frontend polish pass across 320px, 375px,
  768px, 1024px, and wide desktop for public, candidate, recruiter, admin,
  chat, notification, and AI pages.
- Add nested lazy loading inside candidate/recruiter/admin dashboard shells to
  further reduce role-specific chunks after the top-level route split.
- Create or provide a branded Open Graph image and refreshed favicon for the
  OpportunityX premium brand package.
- Phase 6 follow-up: add notification pagination/error-state refinements and
  end-to-end socket authorization tests.
- Phase 7 follow-up: add durable resume text extraction, structured AI output
  validation, AI audit logging, and integration tests for role authorization.
- Replace the in-memory AI rate limiter with a distributed store before
  horizontally scaling multiple backend instances.
- Phase 8 follow-up: remediate dependency audit findings, expand API
  integration tests, and add browser E2E coverage for candidate/recruiter/admin
  smoke paths.
- Run a dedicated visual QA pass across authenticated candidate, recruiter,
  admin, chat, notification, and form-heavy pages on mobile/tablet/desktop
  after the dark-first SaaS UI refresh.
- Add a real admin reporting/export pipeline before enabling CSV downloads.
- Define deletion/cascade or archival rules for users with jobs, applications,
  profiles, messages, and companies before production hard deletion.
- Build Phase 5 admin verification review: list pending companies, approve or
  reject with a reason, set `verifiedAt`/`verifiedBy`, and notify recruiters.
- Add authenticated company-logo upload/object storage; Phase 4 persists an
  optional logo URL.
- Add recruiter-note editing to the applicants UI and enforce owned
  application/job authorization inside the notes API.
- Implement persistent JobAlert model/routes, matching execution, notification
  delivery, and frequency scheduling. The candidate alerts page intentionally
  shows Coming Soon until that backend exists.
- Add real resume parsing before re-enabling AI extraction controls.
- Add a dedicated candidate dashboard aggregate endpoint if dashboard traffic
  needs to be reduced from the current applications/saved/profile requests.
- Implement a complete email verification flow with hashed OTPs or signed
  verification links, expiry, resend throttling, and delivery tracking. The
  previous broken `/verify-otp` route is intentionally not exposed.
- Add refresh-token rotation and server-side session revocation. Phase 2 uses
  validated JWT access tokens and an authenticated no-op logout endpoint
  because no refresh/session model exists yet.
- Move chat attachments from local `/uploads/chat` storage to durable object
  storage before production deployment.
- Add integration tests backed by a disposable MongoDB instance for
  candidate/recruiter authorization, unread counters, and socket events.
- Review existing dependency audit findings separately before production
  deployment.
