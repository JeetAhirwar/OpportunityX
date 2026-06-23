# OpportunityX Implementation Status Report

> Phase 4 update (June 22, 2026): recruiter dashboard and analytics now use
> real jobs/applications; owned job edit/delete/status and per-job applicants
> are connected; Company model/APIs persist recruiter profiles; verification
> submission is supported; and active job publishing is blocked until the
> Company record is verified. Admin approval/rejection remains Phase 5.

> Phase 5 update (June 22, 2026): admin dashboard, users, recruiter approvals,
> job moderation, applications, and analytics use real protected APIs.
> Verification approval/rejection records reviewer metadata and emits recruiter
> notifications. Reports are explicitly Coming Soon pending an export pipeline.

**Assessment date:** June 22, 2026  
**Assessment type:** Static repository audit plus build, lint, and existing test execution  
**Repository scope:** `frontend`, `backend`, root configuration, environment examples, and project documentation

## Executive Summary

OpportunityX has a strong UI foundation and a usable backend core, but it is not
yet a complete production-ready hiring platform. Authentication, candidate
profiles, recruiter job creation/management, applications, notifications, and
the core real-time chat stack exist. Many visible screens, however, still use
hard-coded data or local-only state even where backend APIs are available.

The most important finding is that code presence does not equal end-to-end
completion:

- The public Jobs and Job Details pages are still static, so the real
  application API cannot be reached through the main candidate browsing flow.
- Saved Jobs, standalone Resume Upload, Job Alerts, AI Recommendations,
  recruiter/company analytics, and most admin screens are demonstrations only.
- Forgot password and OTP screens call APIs that do not exist.
- Several navbar and recruiter action links point to routes that do not exist.
- The chat system is genuinely integrated at its core. It is no longer dummy
  data. It has MongoDB persistence, REST APIs, Socket.IO, JWT socket
  authentication, unread counts, notifications, and application-based
  candidate/recruiter permissions. Some advanced chat actions remain
  backend-only because the current Messages UI has no controls for them.
- Automated coverage is extremely limited: one frontend example test and one
  backend health test.

Overall, OpportunityX is best described as a **partially integrated MVP**.

## Overall Completion Percentage

These estimates measure usable, connected behavior rather than visual design
completion.

| Area | Estimated completion | Basis |
|---|---:|---|
| Frontend | 58% | Most screens exist, but many are static or have broken actions/routes |
| Backend | 68% | Core auth/jobs/applications/profile/chat APIs exist; recovery, verification, company, alerts, AI, settings, reporting, and upload APIs are incomplete |
| Database | 74% | Core hiring and chat models exist; Company, verification/OTP, alerts, preferences, sessions/refresh tokens, and AI models are absent |
| Integration | 50% | Profile, recruiter jobs, applications list, applicants, notifications, and chat connect to real data; key public/candidate/admin flows do not |
| Production readiness | 32% | Build passes, but coverage, security hardening, route consistency, uploads, observability, and deployment validation are insufficient |
| **Overall project** | **56%** | Functional foundation with substantial integration and completeness gaps |

## Verification Performed

| Check | Result |
|---|---|
| Frontend production build | Passed |
| Frontend lint (`--quiet`) | Passed with no errors |
| Frontend tests | Passed: 1 test file, 1 test |
| Backend tests | Passed: 1 health test |
| Existing backend health endpoint | Covered by test |
| Full candidate/recruiter browser workflow | Needs verification |
| Socket multi-user integration tests | Missing |
| API authorization integration tests | Missing |

The production build emits a large JavaScript chunk warning: approximately
1.29 MB minified before gzip.

## Route/Page Status Matrix

### Public routes

| Page | Route | Access | Status | Backend connected | Main issue / next fix |
|---|---|---|---|---|---|
| Home | `/` | Public | Partial | Partial | Featured jobs are real; statistics, testimonials, AI claims, and recommendation samples are static |
| Jobs | `/jobs` | Public | Static Dummy | No | Uses a generated `allJobs` array instead of `GET /api/jobs` |
| Job Details | `/jobs/:id` | Public | Static Dummy | No | Displays one hard-coded job and simulates apply/save; numeric dummy IDs do not map to MongoDB jobs |
| Public Profile | `/profile/:username` | Public | Partial | Intended | Calls the wrong endpoint (`/profile/:username` instead of `/public/profile/:username`) and silently falls back to a fake profile |
| Companies | `/companies` | Public | Missing | No | Navbar link resolves to the catch-all Not Found page |
| Blog | `/blog` | Public | Missing | No | Navbar link resolves to Not Found |
| Pricing | `/pricing` | Public | Missing | No | Navbar link resolves to Not Found |
| About | Not defined | Public | Missing | No | No page or route |
| Login | `/login` | Public | Working, needs hardening | Yes | Login works, but redirects to `/` rather than the role dashboard |
| Register | `/register` | Public | Working, needs hardening | Yes | Candidate/recruiter registration works; redirects to `/`; no verification flow |
| Forgot Password | `/forgot-password` | Public | Broken | No | Calls missing `POST /api/auth/forgot-password` |
| OTP Verification | `/verify-otp` | Public | Broken | No | Calls missing `POST /api/auth/verify-otp`; resend button has no handler |

### Candidate routes

| Page | Route | Access | Status | Backend connected | Main issue / next fix |
|---|---|---|---|---|---|
| Dashboard | `/candidate/dashboard` | Candidate | Static Dummy | No | All cards and recent applications are hard-coded |
| Profile Builder | `/candidate/profile` | Candidate | Mostly Working | Yes | Real GET/PUT; error handling assumes Axios response objects although the shared client throws plain `Error` |
| Resume | `/candidate/resume` | Candidate | Static Dummy | No | File remains browser state only; “AI parsing” is a timeout |
| Applied Jobs | `/candidate/applied` | Candidate | Partial/Working | Yes | Real application list and withdraw; depends on a separate working apply entry point, which is currently missing in Job Details |
| Saved Jobs | `/candidate/saved` | Candidate | Static Dummy | No | Backend API exists but page uses `mockSaved` and local deletion |
| Job Alerts | `/candidate/alerts` | Candidate | Static Dummy | No | Local state only; no model/API |
| AI Recommendations | `/candidate/recommendations` | Candidate | Static Dummy | No | Hard-coded recommendations and non-functional Apply buttons |
| Messages | `/candidate/chat` | Candidate | Integrated, Partial UI | Yes | Real chat core; advanced controls and attachments are missing |
| Notifications | `/candidate/notifications` | Candidate | Working, needs verification | Yes | Real notifications/read state; no pagination or robust error UI |
| Settings | `/candidate/settings` | Candidate | Mostly Dummy | No | Theme works; password, preferences, and delete account are not persisted |
| Onboarding Modal | Modal in candidate shell | Candidate | Partial/Working | Yes | Profile save and redirect implemented; preferences are collected but never persisted |

### Recruiter routes

| Page | Route | Access | Status | Backend connected | Main issue / next fix |
|---|---|---|---|---|---|
| Dashboard | `/recruiter/dashboard` | Recruiter | Working | Yes | Real jobs/applications and verification status |
| Post Job | `/recruiter/post-job` | Recruiter | Working | Yes | Drafts allowed; active publishing requires verified Company |
| Manage Jobs | `/recruiter/jobs` | Recruiter | Working | Yes | Real list, edit, applicants, status, preview, and delete actions |
| Applicants | `/recruiter/applicants` | Recruiter | Working, needs verification | Yes | Loads owned-job applicants, updates status, starts chat |
| Company Profile | `/recruiter/company` | Recruiter | Working | Yes | Persisted Company profile and verification submission |
| Analytics | `/recruiter/analytics` | Recruiter | Working | Yes | Derived job/application metrics and charts |
| Messages | `/recruiter/chat` | Recruiter | Integrated, Partial UI | Yes | Same real shared chat UI as candidate |
| Notifications | `/recruiter/notifications` | Recruiter | Working, needs verification | Yes | Real notification API and live badge |
| Settings | `/recruiter/settings` | Recruiter | Mostly Dummy | No | Only local theme and local form state |

### Admin routes

| Page | Route | Access | Status | Backend connected | Main issue / next fix |
|---|---|---|---|---|---|
| Dashboard | `/admin/dashboard` | Admin | Static Dummy | No | Summary metrics are hard-coded |
| Users | `/admin/users` | Admin | Static Dummy | No | Real admin user APIs exist, but UI uses `mockUsers` |
| Recruiter Approvals | `/admin/approvals` | Admin | Static Dummy / backend missing | No | Local mock requests; no recruiter approval model/API |
| Job Moderation | `/admin/jobs` | Admin | Static Dummy | No | Moderation API exists, but UI uses `mockJobs` |
| Applications | Not defined | Admin | Missing | No | No page or admin application route |
| Analytics | `/admin/analytics` | Admin | Static Dummy | No | Backend analytics exists, but UI charts are hard-coded |
| Notifications | `/admin/notifications` | Admin | Partial | Yes | Generic notifications page exists; admin-specific notification use cases are undefined |
| Reports | Not defined | Admin | Missing/Partial backend | No | Report model and generator exist; no controller, route, or page |
| Settings | `/admin/settings` | Admin | Mostly Dummy | No | Password/preferences/delete account are not connected |

## API Status Matrix

“Working” means the route and controller form a coherent implementation by
inspection. Only the health endpoint has dedicated backend test coverage.

| Method | Endpoint | Controller | Auth / role | Status | Notes |
|---|---|---|---|---|---|
| GET | `/api/health` | Inline | Public | Working, tested | Only backend endpoint with automated coverage |
| POST | `/api/auth/register` | `register` | Public | Working | Candidate/recruiter only through validator; no verification requirement |
| POST | `/api/auth/login` | `login` | Public | Partial | Does not reject inactive/unverified users or update `lastLogin` |
| GET | `/api/auth/me` | Missing | Auth | Missing | Frontend trusts stored user without server revalidation |
| POST | `/api/auth/logout` | Missing | Auth | Missing | Logout is client-side token removal only |
| POST | `/api/auth/forgot-password` | Missing | Public | Missing/Broken UI | Frontend calls it |
| POST | `/api/auth/reset-password` | Missing | Public | Missing | No reset page or token model |
| POST | `/api/auth/verify-otp` | Missing | Public | Missing/Broken UI | Frontend calls it |
| POST | `/api/auth/refresh-token` | Missing | Public/Auth | Missing | No refresh token storage or rotation |
| GET | `/api/candidate/profile` | `getProfile` | Candidate | Working | Returns 404 if absent |
| PUT | `/api/candidate/profile` | `saveProfile` | Candidate | Working, needs integration tests | Supports multipart resume and JSON profile updates |
| GET | `/api/jobs` | `searchJobs` | Public | Working backend | Public Jobs page does not use it; hook expects `jobs` while API returns `data` |
| GET | `/api/jobs/featured` | `getFeaturedJobs` | Public | Working | Connected to Home |
| GET | `/api/jobs/:id` | `getJobById` | Public | Working | Main Job Details UI does not use it |
| GET | `/api/public/jobs/:id` | `getPublicJob` | Public | Working | `useJob` expects this, but Job Details does not use the hook |
| POST | `/api/jobs` | `createJob` | Recruiter | Working | Connected to Post Job |
| GET | `/api/jobs/my` | `getMyJobs` | Recruiter | Working | Connected to Manage Jobs |
| PUT | `/api/jobs/:id` | `updateJob` | Recruiter | Working backend | No edit page/route |
| DELETE | `/api/jobs/:id` | `deleteJob` | Recruiter | Working backend | No connected UI action |
| PATCH | `/api/jobs/:id/status` | `updateJobStatus` | Recruiter | Working | Connected to Close Job |
| POST | `/api/applications/:jobId/apply` | `apply` | Candidate | Working backend | Main Job Details UI simulates instead of calling it |
| GET | `/api/applications/me` | `getMyApplications` | Candidate | Working | Connected |
| GET | `/api/applications/recruiter` | `getRecruiterApplicants` | Recruiter | Working | Connected |
| GET | `/api/applications/job/:jobId` | `getApplicants` | Recruiter | Working | Backend exists; no valid per-job applicant route in frontend |
| PATCH | `/api/applications/:id/status` | `updateStatus` | Recruiter | Working | Verifies recruiter owns the job; creates live notification |
| PATCH | `/api/applications/:id/withdraw` | `withdraw` | Candidate | Working | Connected |
| GET | `/api/saved-jobs` | `getSavedJobs` | Auth | Working backend | Candidate UI is dummy; role should ideally be candidate-only |
| POST | `/api/saved-jobs/:jobId` | `toggleSave` | Auth | Working backend | Candidate UI and Job Details do not use it |
| GET | `/api/notifications` | `getNotifications` | Auth | Working | Connected |
| PATCH | `/api/notifications/:id/read` | `markRead` | Auth | Working | Connected |
| PATCH | `/api/notifications/read-all` | `markAllRead` | Auth | Working | Connected |
| GET | `/api/chat/conversations` | `getConversations` | Auth | Working by inspection | Participant-based results |
| POST | `/api/chat/conversations/start` | `startConversation` | Auth | Working by inspection | Requires an eligible application; admin rejected |
| GET | `/api/chat/messages/:conversationId` | `getMessages` | Auth | Working by inspection | Participant permission checked; paginated |
| PATCH | `/api/chat/conversations/:conversationId/read` | `markRead` | Auth | Working by inspection | Clears unread and marks messages seen |
| PATCH | `/api/chat/messages/:messageId` | `editMessage` | Auth/sender | Working backend | No edit UI |
| DELETE | `/api/chat/messages/:messageId` | `deleteMessage` | Auth/sender | Working backend | No delete UI |
| POST | `/api/recruiter/notes` | `saveNote` | Recruiter | Partial | API exists but does not verify the candidate applied to an owned job; current Applicants UI does not use it |
| GET | `/api/recruiter/notes/:candidateId/:jobId` | `getNote` | Recruiter | Partial | Same ownership risk; no connected UI |
| GET | `/api/admin/users` | `getUsers` | Admin | Working backend | UI is dummy |
| PATCH | `/api/admin/users/:id/status` | `updateUserStatus` | Admin | Working backend | UI is dummy |
| PATCH | `/api/admin/users/:id/role` | `updateUserRole` | Admin | Working backend | UI is dummy; permits role escalation by any authenticated admin |
| DELETE | `/api/admin/users/:id` | `deleteUser` | Admin | Partial/Risky | No existence check, cascade cleanup, or self-deletion guard |
| PATCH | `/api/admin/jobs/:id/moderate` | `moderateJob` | Admin | Working backend | UI is dummy; accepted status is not explicitly validated |
| GET | `/api/admin/analytics` | `getAnalytics` | Admin | Working backend | UI is static |
| GET | `/api/public/profile/:username` | `getPublicProfile` | Public | Working backend | Frontend calls a different route and uses fake fallback |
| POST | `/api/upload` | Missing | Auth | Missing | Chat attachment UI disabled; no general upload route |
| AI APIs | Missing | Missing | — | Missing | No recommendation, parsing, skill-gap, or resume-analysis API |
| Company APIs | Missing | Missing | Recruiter | Missing | Company Profile cannot persist |
| Settings APIs | Missing | Missing | Auth | Missing | Password, preferences, account deletion are not implemented |
| Reports APIs | Missing | Missing | Admin | Missing | Model/util exist without HTTP access |

## Model Status Matrix

| Model | Exists | Key relationships / indexes | Status | Main issues |
|---|---|---|---|---|
| User | Yes | Unique email; role enum | Partial | No refresh tokens, verification details, password reset fields, provider IDs, or account-deletion lifecycle |
| Profile | Yes | Unique `user`; sparse unique username | Mostly complete candidate profile | No recruiter/company profile; uploaded path handling is local-disk dependent |
| Job | Yes | `postedBy -> User`; text and filter indexes | Core complete | Missing structured responsibilities, qualifications, benefits, visibility/show-salary fields |
| Application | Yes | `job -> Job`, `candidate -> User`; unique job/candidate | Core complete | Applicant-count changes are not transactional and can drift |
| SavedJob | Yes | Unique user/job pair | Complete backend | Frontend not connected |
| Notification | Yes | `user -> User`; user/date index | Basic complete | No category/entity references, delivery channel state, or pagination |
| Conversation | Yes | Participants, Job, Application, last Message; application unique | Integrated | One conversation per application; no archival/mute metadata |
| Message | Yes | Conversation, sender; conversation/date index | Integrated core | Attachments have schema only; no upload pipeline; deletion is global soft-delete only |
| Company | No | — | Missing | Blocks real Company Profile and recruiter verification |
| RecruiterNote | Yes | Recruiter/candidate/job compound index | Partial | Index is not unique; service does not verify recruiter ownership/application |
| Report | Yes | Generated by User | Partial | No controller/routes/UI and generator lifecycle is not connected |
| OTP/Verification | No | — | Missing | OTP screen and verification state cannot work |
| JobAlert | No | — | Missing | Job Alerts are local-only |
| AI models | No | — | Missing | No recommendation/resume analysis persistence |

## Feature Status Matrix

| Feature | Frontend | Backend | Database | Real data connected? | Overall | Priority |
|---|---|---|---|---|---|---|
| Candidate registration | Working | Working | User | Yes | Working | Medium hardening |
| Candidate login | Working | Partial security | User | Yes | Partial | High |
| Recruiter registration | Working | Working | User | Yes | Working without approval | High |
| Admin login | Common login only | Common login | User | If admin is pre-seeded | Partial | High |
| Forgot password | UI exists | Missing | Missing | No | Broken | Critical |
| Email/OTP verification | UI exists | Missing | Missing | No | Broken | Critical |
| Candidate onboarding | Working after recent fixes | Profile PUT | Profile | Yes | Partial | High |
| Candidate profile update | Working | Working | Profile | Yes | Mostly working | High |
| Resume upload | Dummy page; onboarding upload exists | Profile multipart only | Profile URL | Partial | Partial | High |
| Job browsing | Static | Working API | Job | No | Dummy | Critical |
| Featured jobs | Real section | Working | Job | Yes | Working | Medium |
| Job search | Local static filtering | Working API | Job | No | Dummy | Critical |
| Job details | Static | Working API | Job | No | Dummy | Critical |
| Apply job | Simulated in Job Details | Working | Application | No main UI connection | Broken end-to-end | Critical |
| Saved jobs | Dummy | Working | SavedJob | No | Partial | High |
| My applications | Real | Working | Application | Yes | Working if applications exist | High |
| Recruiter profile | Company form dummy | Missing | Company missing | No | Missing | High |
| Recruiter verification | Mock admin UI | Missing | Missing | No | Missing | High |
| Post job | Real | Working | Job | Yes | Mostly working | High |
| Manage jobs | Real list/close | Working | Job | Yes | Partial | High |
| View applicants | Real aggregate list | Working | Application | Yes | Working | High |
| Update application status | Real | Working | Application/Notification | Yes | Working | High |
| Admin recruiter approval | Dummy | Missing | Missing | No | Missing | High |
| Admin user management | Dummy | Working API | User | No | Partial | High |
| Notifications | Real | Working | Notification | Yes | Working core | High |
| Messages/chat | Real core | Real core | Conversation/Message | Yes | Integrated, partial UI | High |
| Navbar notification icon | Real | Notification + socket events | Notification | Yes | Working core | Medium |
| Navbar message icon | Real | Chat unread | Conversation | Yes | Working core | Medium |
| AI recommendations | Dummy | Missing | Missing | No | Missing | Medium |
| AI resume analyzer | Simulated | Missing | Missing | No | Missing | Medium |
| Analytics | Static UIs | Admin API only | Aggregates | No | Partial | Medium |
| Reports | Missing UI | Missing routes | Report exists | No | Missing | Medium |
| Settings | Mostly local | Missing | Missing | No | Dummy/Partial | Medium |

## Chat System Integration Status

### Current status

**Integrated core / Partial product implementation**

The current Messages UI is not dummy. The previous static conversation/message
arrays have been removed. OpportunityX now has native chat models, controllers,
routes, services, Socket.IO startup, socket authentication, a shared candidate
and recruiter Messages page, unread badges, and notification integration.

The implementation follows the requested full-merge approach rather than
calling the hosted chat backend:

- OpportunityX keeps its existing Messages visual layout.
- Chat APIs are served by the OpportunityX backend.
- Chat uses the OpportunityX MongoDB connection.
- Socket authentication verifies the OpportunityX `JWT_SECRET`.
- The browser sends the token through `socket.auth.token`.
- Conversation creation is tied to an OpportunityX Application and Job.

The reference RealTime-Chat-App architecture has been adapted rather than
copied unchanged. OpportunityX uses its own `User`, `Job`, `Application`,
`Notification`, auth middleware, route conventions, and UI.

### Frontend chat UI status

Primary files:

- `frontend/src/features/chat/ChatPage.tsx`
- `frontend/src/features/chat/ChatContext.tsx`
- `frontend/src/features/chat/messageApi.ts`
- `frontend/src/features/chat/socketClient.ts`
- `frontend/src/components/common/Navbar.tsx`
- `frontend/src/features/notifications/NotificationsPage.tsx`
- `frontend/src/features/recruiter/ApplicantManagement.tsx`
- `frontend/src/features/candidate/MyApplications.tsx`

The UI loads real conversations and history, sends messages through Socket.IO,
receives messages in real time, shows online state and typing, marks opened
conversations read, and displays unread conversation counts.

### Backend chat API status

Primary files:

- `backend/src/models/conversation.model.js`
- `backend/src/models/message.model.js`
- `backend/src/controllers/chat.controller.js`
- `backend/src/routes/chat.routes.js`
- `backend/src/services/chat.service.js`
- `backend/src/socket/socket.js`
- `backend/src/socket/socketAuth.js`
- `backend/src/server.js`

REST APIs exist for conversation listing/creation, history, read state,
editing, and deleting. Message sending is currently Socket.IO-first rather
than exposed as a REST POST.

### Socket.IO status

Socket.IO is attached to the same HTTP server as Express. Implemented events:

- Client to server: `join_conversation`, `send_message`,
  `mark_conversation_read`, `message_seen`, `message_reaction`,
  `edit_message`, `delete_message`, `typing_start`, `typing_stop`
- Server to client: `online_users`, `receive_message`, `message_sent`,
  `conversations_updated`, `message_seen`, `message_reaction_updated`,
  `message_updated`, `message_edited`, `message_deleted`, `typing_start`,
  `typing_stop`, `message_action_error`, `notification_created`

### Models status

Both Conversation and Message models are present. Conversation records include
participants, job/application context, last-message information, and per-user
unread counts. Messages include sender, content, attachments metadata, status,
readers, reactions, edit/delete timestamps, and persistence timestamps.

### Auth/socket auth status

`socketAuth.js` reads `socket.handshake.auth.token`, verifies it with
`env.jwtSecret`, loads the current OpportunityX user, rejects inactive/missing
users, and attaches that user to the socket. This is the correct shared-secret
integration.

### Candidate-recruiter permission status

Backend permission enforcement exists:

- A conversation starts only from an existing, non-withdrawn Application.
- Participants are derived from the application candidate and the job owner.
- The current user must be that candidate or recruiter.
- Admin start access is rejected.
- History, room joins, send, typing, reactions, read, edit, and delete actions
  perform participant or sender checks.
- Recruiter “Message Candidate” and candidate “Message Recruiter” actions call
  the application-scoped start API.

### Navbar message badge status

The desktop navbar message icon routes to the correct candidate/recruiter chat
page and displays the sum of real unread conversation counts. Conversation
updates are pushed through Socket.IO.

### Notification integration status

Message creation persists a `Notification` and emits `notification_created` to
the recipient’s personal room. Application-status changes also persist and
emit notifications. The navbar badge loads unread notifications from the API
and increments on live socket events. The Notifications page is connected to
read/mark-all APIs.

### Chat feature table

| Chat Feature | Status | Frontend | Backend | Socket | Notes |
|---|---|---|---|---|---|
| Conversation List | Integrated | Real API data | Query/population present | Live updates | Sorted by last activity |
| Message History | Integrated | Loads on selection | Paginated query | Not required | Persists after refresh |
| Send Message | Integrated | Input emits event | Persists message and conversation | `send_message` | No REST send endpoint |
| Real-time Receive | Integrated | Appends selected conversation | Personal/conversation rooms | `receive_message` | Needs multi-user automated test |
| Typing Indicator | Integrated | Shows text indicator | Access checked | Start/stop events | No multi-user test |
| Seen Status | Partial | Marks conversations read but does not show receipts | Updates `readBy` and status | Emits `message_seen` | UI does not consume/display seen state |
| Edit Message | Backend integrated | No edit control | Sender/access checks | Edit events | UI listener exists, initiator UI missing |
| Delete Message | Backend integrated | No delete control | Sender/access checks | Delete event | UI removes event results, initiator UI missing |
| Reactions | Backend integrated | No reaction control/listener | Participant checks and persistence | Reaction event | Frontend not exposed |
| Unread Count | Integrated | Conversation and navbar badges | Map-based counters | Conversation updates | Needs concurrency testing |
| Navbar Message Icon | Integrated | Correct role route and badge | Uses conversation data | Live updates | Authenticated mobile navigation is incomplete |
| Notification Badge | Integrated core | Navbar and page connected | Notification persistence/read APIs | Live creation event | Application-submitted event is not pushed live |
| Candidate-Recruiter Access Rule | Integrated | Start actions use application ID | Application/job owner enforced | Room/action access enforced | Needs negative authorization tests |

### Missing chat pieces

1. No attachment upload endpoint or storage provider; paperclip is disabled.
2. No frontend edit/delete/reaction controls.
3. No visible delivered/seen receipts even though backend state exists.
4. No message pagination/infinite-scroll UI; first page only.
5. No socket reconnection/error status in the UI.
6. No chat integration or authorization test suite.
7. No notification deduplication or preferences enforcement.
8. No durable object storage for files.
9. No rate limiting/spam controls specifically for socket messages.
10. Some chat UI text still contains corrupted encoding characters.

### Recommended chat integration steps

Because the core merge already exists, Phase 6 should now focus on completion
and verification rather than starting the integration again:

1. Add frontend edit/delete/reaction menus while preserving the current design.
2. Display delivered/seen state and consume `message_seen`.
3. Add authenticated attachment upload with durable storage and file
   validation.
4. Add history pagination and scroll restoration.
5. Add socket connection/reconnection UI and event deduplication.
6. Add two-user integration tests for candidate/recruiter messaging.
7. Add negative tests for random users, other recruiters, and admin access.
8. Test unread counts with multiple tabs and reconnects.
9. Apply notification preferences when those settings are implemented.
10. Remove remaining encoding corruption.

## Working Features

- Candidate and recruiter registration.
- Common email/password login.
- Role-protected candidate, recruiter, and admin route shells.
- Candidate profile create/update API and connected Profile Builder.
- Onboarding profile submission and dashboard redirect.
- Recruiter job creation.
- Recruiter job listing and close action.
- Backend public job search/details/featured endpoints.
- Home featured-jobs API section.
- Candidate application list and withdrawal.
- Recruiter applicant list and status updates.
- Application-status notifications.
- Core real-time candidate/recruiter chat.
- Notification listing and read actions.
- Theme switching.
- API health check.

## Partially Working Features

- Home page: real featured jobs mixed with promotional static data.
- Candidate onboarding: job preferences and salary are not persisted.
- Candidate profile: local draft and API work, but upload/error paths need
  cleanup.
- Resume: onboarding can upload PDF; standalone page is dummy.
- Applications: backend works, but public Job Details cannot create real
  applications.
- Saved Jobs: backend exists, frontend is dummy.
- Recruiter job management: edit/delete/per-job applicant navigation incomplete.
- Admin: backend APIs exist for users, moderation, and analytics, but screens
  are disconnected.
- Public profile: backend exists, frontend route mismatch hides failures with
  demo data.
- Chat: core is integrated; advanced UI and tests are incomplete.
- Notifications: core works; delivery preferences and broader event coverage
  are missing.

## Non-Working Features

- Forgot password.
- Password reset.
- OTP/email verification.
- Recruiter approval/verification.
- Standalone resume upload and AI parsing.
- Real public Job Details apply/save flow.
- Company profile persistence.
- Settings password/preferences/account deletion.
- AI recommendations and resume analysis.
- Reports generation through UI/API.
- Admin applications page.

## Dummy/Static Features

- Candidate dashboard metrics and recent applications.
- Public Jobs list and filters.
- Public Job Details.
- Saved Jobs page.
- Job Alerts.
- AI Recommendations.
- Standalone Resume page.
- Recruiter dashboard metrics.
- Recruiter Company Profile.
- Recruiter Analytics.
- Admin dashboard metrics.
- Admin User Management UI.
- Admin Recruiter Approval UI.
- Admin Job Moderation UI.
- Admin Analytics UI.
- Marketing statistics, testimonials, and AI recommendation examples.

## Missing Pages

- Companies.
- Blog.
- Pricing.
- About.
- Password Reset.
- Recruiter edit job.
- Recruiter per-job applicants route.
- Admin applications.
- Admin reports.
- Dedicated recruiter verification submission.
- Real company public/detail pages.

## Missing APIs

- Auth current-user/session validation.
- Logout/revocation.
- Refresh token.
- Forgot/reset password.
- Send/verify OTP.
- Recruiter verification/approval workflow.
- Company CRUD and logo upload.
- Standalone resume upload/parse.
- Job alert CRUD.
- AI recommendation/resume analysis.
- Account settings/password/preferences/delete.
- Report create/download/list.
- General/chat attachment upload.

## Broken Buttons/Actions

- Forgot Password submission calls a missing endpoint.
- OTP Verify calls a missing endpoint.
- OTP Resend has no handler.
- Jobs-page bookmark icons do nothing.
- Job Details Apply and Save only change local state.
- Job Details Share has no handler.
- Saved Jobs Apply has no navigation/action.
- Resume upload/parse is local simulation.
- AI Recommendation Apply buttons do nothing.
- Manage Jobs Edit points to missing `/recruiter/edit-job/:id`.
- Manage Jobs Applicants points to missing `/recruiter/applicants/:jobId`.
- Company Profile Save is simulated.
- Admin user, approval, moderation actions update only mock state.
- Settings password falsely reports success without an API.
- Settings preferences are local only.
- Delete Account does nothing.
- Navbar `/profile` and `/settings` dropdown links do not match role routes.
- Authenticated mobile navbar lacks dashboard/messages/notifications actions.

## Security Issues

### Critical/high

1. Login does not reject `isActive: false` users.
2. Login does not enforce `isVerified`, making the verification field
   ineffective.
3. Frontend restores authentication from `ox_user` without validating the JWT
   through `/auth/me`.
4. No refresh-token/revocation/session strategy.
5. No password recovery implementation despite exposed UI.
6. Recruiter notes do not enforce owned-job/application relationships.
7. Admin user deletion lacks cascade cleanup and can leave orphaned profiles,
   jobs, applications, messages, notifications, and saved jobs.

### Medium

- No explicit chat socket rate limiting or payload schema validation.
- Chat attachment metadata accepts URLs, although no trusted upload service is
  currently exposed.
- Local upload storage is unsuitable for ephemeral production hosts.
- Error responses sometimes expose raw database error messages.
- Application creation and applicant-count updates are not transactional.
- No CSRF concern for bearer headers, but localStorage token theft remains an
  XSS risk.
- No Content Security Policy or security middleware such as Helmet is visible.
- Role changes and moderation payloads need stricter validation/auditing.

## Integration Issues

1. Public Jobs ignores the real Jobs API.
2. `useJobs` expects `{ jobs }`; backend returns `{ data }`.
3. Public Job Details ignores both `/api/jobs/:id` and `useJob`.
4. Public Profile calls `/api/profile/:username` effectively through its
   endpoint string, while backend exposes `/api/public/profile/:username`.
5. API client throws plain `Error`; multiple screens still check
   `error.response`, an Axios pattern.
6. Login/register redirect to `/` instead of role dashboards.
7. Navbar Profile and Settings dropdown routes are invalid.
8. Recruiter nested-route links do not match declared routes.
9. Onboarding preferences are UI-only and discarded at save.
10. UI accepts DOC/DOCX resume selection while backend upload middleware
    accepts PDF only.
11. Job post form submits fields that are absent from the Job schema.
12. Admin APIs and admin UIs are not connected.
13. Saved Job APIs and UI are not connected.
14. Notification preferences do not affect notification creation.
15. Several files still contain corrupted UTF-8 text.

## Deployment Issues

- Local uploaded files are not durable on common Render-like deployments.
- No production object-storage configuration.
- No database migration/index deployment procedure.
- No seed/admin bootstrap script is present in the inspected structure.
- Frontend bundle is large and not route-split.
- Browser data dependency warning indicates stale `caniuse-lite`.
- Environment examples include unused SMTP/OpenAI variables because their
  features are not implemented.
- Only health and example tests exist; no deployment smoke suite.
- No CI workflow was found in the inspected repository listing.
- No centralized observability, structured request logging, or socket metrics.

## Priority Fix Roadmap

### Phase 1: Critical fixes

- Connect Jobs and Job Details to MongoDB-backed APIs.
- Connect Apply and Save actions to real APIs.
- Fix public profile endpoint mismatch and remove fake fallback.
- Enforce inactive/verified checks at login.
- Add `/auth/me` and validate stored sessions on startup.
- Fix invalid navbar and recruiter routes.

### Phase 2: Core MVP completion

- Implement forgot/reset password.
- Implement OTP/email verification or remove the exposed flow until ready.
- Align API response shapes and error handling.
- Add integration tests for auth, jobs, applications, and permissions.
- Add transaction-safe application/applicant-count updates.

### Phase 3: Candidate flow completion

- Connect Saved Jobs.
- Implement real resume upload and retrieval.
- Persist onboarding preferences.
- Implement Job Alerts.
- Replace candidate dashboard mock metrics with API data.

### Phase 4: Recruiter flow completion

- Add edit job page and correct per-job applicants navigation.
- Create Company model/APIs and connect Company Profile.
- Add recruiter verification submission.
- Replace recruiter analytics/dashboard data with real aggregates.
- Secure and reconnect recruiter notes.

### Phase 5: Admin flow completion

- Connect user management, moderation, and analytics screens.
- Build recruiter approval workflow.
- Add admin applications and reports pages.
- Add cascade-safe user deletion and audit logging.

### Phase 6: Messages/Notifications Integration

- **Merge chat backend:** Completed.
- **Add conversation/message models:** Completed.
- **Add chat routes:** Completed.
- **Add Socket.IO server:** Completed.
- **Connect current Messages UI:** Core completed.
- **Connect navbar message badge:** Completed.
- **Connect notification badge:** Core completed.
- **Enforce candidate-recruiter permission rules:** Completed by inspection.
- Complete edit/delete/reaction/seen controls in the existing UI.
- Add attachment uploads and durable storage.
- Add socket/chat authorization and multi-user integration tests.
- Add notification preferences, pagination, and reliable reconnect behavior.

### Phase 7: AI/advanced features

- Implement resume parsing behind a defined provider/service boundary.
- Build recommendation scoring based on real profile/job data.
- Add skill-gap and salary-insight APIs only after core data quality is stable.
- Clearly label algorithmic recommendations and retain auditability.

### Phase 8: Testing/deployment

- Add unit, API integration, authorization, and browser end-to-end suites.
- Add disposable test MongoDB setup.
- Add CI for lint, tests, build, dependency audit, and deployment smoke checks.
- Move uploads to durable object storage.
- Add logging, monitoring, error tracking, rate limiting, and security headers.
- Code-split the frontend and verify production environment/CORS/socket origins.

## Recommended Next 10 Tasks

1. Replace static `/jobs` data with `GET /api/jobs` and standardize the response
   shape.
2. Replace static `/jobs/:id` with real job data and connect Apply/Save.
3. Add `/api/auth/me`, inactive/verified login checks, and role-dashboard
   redirects.
4. Implement forgot/reset password and decide the real email-verification flow.
5. Connect Saved Jobs UI to the existing backend.
6. Fix recruiter edit/per-job applicant routes and add the edit screen.
7. Connect admin Users, Job Moderation, and Analytics to existing APIs.
8. Finish chat UI controls and add two-user permission/socket tests.
9. Implement durable resume/chat attachment uploads and align accepted file
   types.
10. Add end-to-end tests for candidate apply → recruiter review → chat →
    notification.

## Final Conclusion

OpportunityX has enough real backend and frontend infrastructure to become a
solid MVP, but its visible completeness currently exceeds its functional
completeness. The project should not add more advanced features until the
public job/application journey and existing admin/recruiter screens are
connected to real data.

The chat integration is one of the more complete cross-stack modules. It
already follows the intended architecture: OpportunityX UI, OpportunityX auth,
OpportunityX MongoDB, shared JWT secret, `socket.auth.token`, application-based
permissions, unread counts, navbar integration, and message notifications.
The next chat work is UI completion, file handling, and rigorous multi-user
testing—not a new backend merge.

After the Phase 1 and Phase 2 fixes, the platform can be evaluated as a real
end-to-end MVP rather than a mixture of working services and presentation
mockups.
