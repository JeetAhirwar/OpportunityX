# Development Changelog

## 2026-06-22

- Completed Phase 2 authentication stability and session hardening.
- Added authenticated `GET /api/auth/me` session validation and safe user
  responses for register, login, and session restore.
- Added inactive-account login/session rejection and `lastLogin` updates while
  keeping verification status non-blocking until email verification exists.
- Added authenticated `POST /api/auth/logout` and frontend logout coordination.
- Added generic-response forgot-password and hashed, expiring reset-token
  handling with SMTP email delivery.
- Added `/reset-password/:token` and connected password reset submission.
- Added role-based login/register redirects and wrong-role dashboard redirects.
- Removed the broken public OTP route until a complete verification flow is
  implemented.
- Completed Phase 1 public job flow integration.
- Replaced the static `/jobs` dataset with `GET /api/jobs`, including backend
  pagination, keyword, location, job type, experience, work mode, salary, and
  sorting filters.
- Added a frontend job response normalizer that accepts `data`, `jobs`, and
  nested response variants and returns `{ jobs, total, page, pages }`.
- Replaced the static `/jobs/:id` content with `GET /api/jobs/:id` and added
  loading, error, not-found, and invalid-ID states.
- Connected candidate applications to
  `POST /api/applications/:jobId/apply`, including duplicate-application
  errors and persisted Applied state.
- Connected save/unsave actions to `POST /api/saved-jobs/:jobId` and
  `GET /api/saved-jobs`.
- Restricted saved-job APIs to candidates and prevented applications/saves
  against missing or inactive jobs.
- Inspected and adapted the RealTime-Chat-App conversation, message, REST, JWT
  socket authentication, room, unread, typing, seen, reaction, edit, and delete
  patterns.
- Added OpportunityX-native conversation and message models linked to jobs and
  applications.
- Added server-enforced candidate/recruiter application permissions.
- Attached Socket.IO to the existing HTTP server using the OpportunityX JWT.
- Replaced the Messages page mock conversations/messages without changing its
  visual layout.
- Connected recruiter applicants and candidate applications to real chat
  creation.
- Connected navbar unread badges and the Notifications page to live backend
  data and socket events.
- Fixed the frontend auth token key mismatch so API and socket clients share
  `ox_token`.
