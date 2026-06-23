# Next Steps

- Phase 6: finish message edit/delete/reaction controls, attachment storage,
  notification pagination/error states, and end-to-end socket authorization
  tests.
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
- Configure durable object storage before enabling message attachments; the
  current paperclip control remains disabled.
- Add integration tests backed by a disposable MongoDB instance for
  candidate/recruiter authorization, unread counters, and socket events.
- Add message edit/delete/reaction controls to the existing bubble UI. Backend
  APIs and socket events are already available.
- Consider route-level code splitting; the current production bundle triggers
  Vite's large-chunk warning.
- Review existing dependency audit findings separately before production
  deployment.
