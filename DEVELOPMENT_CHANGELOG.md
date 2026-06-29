# Development Changelog

## 2026-06-26

- Redesigned the homepage into a stronger AI hiring intelligence landing
  experience with a product preview, role-specific CTAs, public API-backed job
  metrics, richer featured job cards, real workflow/capability sections, and no
  fictional testimonials or fake match statistics.
- Reorganized Settings into tabbed Security, Appearance, Notifications, and
  Danger Zone sections using existing frontend primitives.
- Added `UI_IMPROVEMENTS.md` documenting pages updated, components refined,
  performance, accessibility, responsive notes, and known limitations.
- Completed a frontend-only OpportunityX Premium UI/UX stabilization pass:
  added route-level code splitting, tightened production metadata, removed
  prominent broken shell links, improved navbar/footer accessibility, hardened
  public job cards/detail pages against partial API data, and added safer
  recruiter/admin dashboard empty states without backend changes.
- Added `FRONTEND_UI_AUDIT.md` with findings for UI consistency, mobile,
  accessibility, performance, branding, broken links, and follow-up QA.
- Added a backend-only AI provider fallback system with Gemini primary support,
  OpenRouter/Groq/OpenAI fallbacks, friendly unavailable responses, per-user
  daily AI limiting, provider-safe logging, and frontend AI error sanitization.
- Upgraded the frontend visual system to a dark-first premium SaaS direction:
  refreshed tokens, glass surfaces, buttons, inputs, cards, dialogs, page
  headers, empty states, navbar, footer, auth pages, dashboard shells, and job
  browse/detail surfaces while preserving existing frontend routes and API
  integrations.
- Added `POST /api/admin/bootstrap` for secure first-admin creation guarded by
  `ADMIN_REGISTRATION_CODE` and disabled after any admin exists.
- Added authenticated admin-managed `POST /api/admin/users` creation for
  candidate, recruiter, and admin accounts, plus Admin Users page creation
  controls.
- Hardened admin status, role, and delete actions against removing the last
  remaining admin, while allowing explicit confirmed self-demotion when another
  admin exists.
- Kept public `/api/auth/register` limited to candidate and recruiter roles
  and documented the manual first-admin bootstrap flow.
- Added backend tests for valid bootstrap, invalid bootstrap codes, second
  bootstrap rejection, public admin registration rejection, and safe admin
  responses without password hashes.

## 2026-06-25 Phase 7 and 8

- Added backend AI service/provider abstraction with backend-only
  `OPENAI_API_KEY`, configurable `AI_MODEL`, prompt sanitization, and clean
  unavailable responses when AI is not configured.
- Added role-protected AI endpoints for candidate career assistant, resume
  analysis, job recommendations, recruiter job description helpers, recruiter
  match scoring, and admin insights.
- Connected candidate AI assistant, resume analysis, AI recommendations,
  recruiter job description previews, recruiter AI match scoring, and admin AI
  insights without redesigning existing screens.
- Replaced the no-op rate limiter with an in-memory limiter and applied it to
  AI and chat routes.
- Added Helmet security headers, CI workflow, AI architecture docs, testing
  guide, security checklist, smoke checklist, and backend tests for AI fallback
  and rate limiting.

## 2026-06-25

- Completed the remaining Phase 6 chat and notification integration work.
- Added authenticated chat attachment upload support for images, PDFs, DOC,
  and DOCX files using the existing `/uploads` static serving path.
- Connected the existing chat UI to attachment send/display, older-message
  pagination, message edit/delete actions, reactions, and seen status labels.
- Added `notification_received` socket emission alongside the existing
  `notification_created` event for backward-compatible real-time notification
  delivery.
- Connected recruiter notifications for new candidate applications and emitted
  real-time candidate notifications for application status changes.
- Kept admin sockets connected for real-time notification badge updates while
  preserving candidate/recruiter-only conversation loading.
- Added notification API `recipient` compatibility in responses while retaining
  the existing persisted `user` field.

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
