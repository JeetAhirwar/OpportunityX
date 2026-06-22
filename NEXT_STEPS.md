# Next Steps

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
