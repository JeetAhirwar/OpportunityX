# Development Changelog

## 2026-06-22

- Completed Phase 5 admin flow integration.
- Replaced admin dashboard, users, approvals, job moderation, applications, and
  analytics mock data with authenticated backend APIs.
- Added self-protection for admin status, role, and delete actions and returned
  explicit safe user fields only.
- Added real Company verification approval/rejection with reviewer metadata,
  rejection reasons, recruiter verification updates, notifications, and live
  socket events.
- Added all-job moderation and read-only all-applications administration.
- Replaced fake reports/download actions with an explicit Coming Soon state.
- Completed Phase 4 recruiter flow integration.
- Replaced recruiter dashboard and analytics mock values with derived job and
  application data.
- Added recruiter-owned job edit loading, status controls, deletion, and
  per-job applicant routing.
- Added persistent Company profiles with verification submission/status fields.
- Enforced verified-company publishing on create, edit, and status transitions
  while continuing to allow draft jobs.
- Connected aggregate and per-job applicant lists with safe response
  normalization, status updates, notes display, and chat actions.
- Completed Phase 3 candidate flow integration.
- Replaced candidate dashboard metrics and recent applications with data from
  applications, saved jobs, and candidate profile APIs.
- Connected Saved Jobs to MongoDB-backed list and toggle endpoints with
  loading, error, empty, view-details, and unsave states.
- Connected the standalone Resume page to candidate profile persistence using
  the existing PDF multipart upload flow and removed fake AI parsing.
- Hardened candidate profile and application response normalization, missing
  record handling, status displays, withdrawal, and job-detail navigation.
- Persisted onboarding job type, work mode, industry, and minimum salary
  preferences on the candidate Profile model.
- Replaced local-only fake job alerts with an explicit Coming Soon state.
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
