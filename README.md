# OpportunityX

OpportunityX is a MERN hiring platform for candidates, recruiters, and administrators. The repository is organized as two independently deployable applications with shared project documentation.

The current frontend direction is a dark-first premium SaaS interface with AI-assisted hiring workflows, responsive dashboards, guarded real API states, and role-specific candidate, recruiter, and admin workspaces.

## Technology

- Frontend: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query
- Backend: Node.js, Express 5, MongoDB, Mongoose, JWT, Multer
- Real-time messaging: Socket.IO with application-scoped candidate/recruiter conversations
- AI: backend-only provider abstraction with no-key unavailable states
- Tooling: npm, ESLint, Vitest

## Structure

```text
OpportunityX/
|-- backend/       # Express API and MongoDB models
|-- frontend/      # React/Vite web application
|-- docs/          # Architecture, API, and deployment guides
|-- package.json   # Root convenience commands
`-- PROJECT_STRUCTURE.md
```

## Local Setup

```bash
npm run install:all
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

Replace the dummy backend secrets and MongoDB URI, then run in separate terminals:

```bash
npm run dev:backend
npm run dev
```

The recommended local API is `http://localhost:8000`; the frontend remains on Vite's configured port `5173`.

## First Admin Bootstrap

Set `ADMIN_REGISTRATION_CODE` in `backend/.env`, then create the first admin with the one-time bootstrap endpoint:

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:8000/api/admin/bootstrap" `
  -ContentType "application/json" `
  -Body '{"name":"Admin","email":"admin@opportunityx.com","password":"Admin@12345","code":"your-admin-bootstrap-code"}'
```

Public registration only accepts `candidate` and `recruiter`. After any admin exists, `/api/admin/bootstrap` returns 403. Future admins are created by an authenticated admin from Admin Dashboard user management or `POST /api/admin/users`.

## Candidate/Recruiter Chat

Chat uses the existing OpportunityX JWT and MongoDB. Set `SOCKET_CORS_ORIGIN` in `backend/.env` and `VITE_SOCKET_URL` in `frontend/.env`. A conversation can only be created from an application: candidates may message the recruiter for a job they applied to, and recruiters may message applicants to their own jobs. The backend enforces these rules for both REST and Socket.IO actions.

To test locally, apply to a job as a candidate, open Recruiter > Applicants as the owning recruiter, click the message button, and exchange messages between two browser sessions. History, typing, online state, seen state, unread badges, and message notifications persist/update through the merged backend.

## Enterprise Notifications

Notifications are persisted in MongoDB, delivered in real time over Socket.IO personal user rooms, and exposed through protected REST APIs. Candidate, recruiter, and admin events use the shared notification service/repository/gateway stack so unread counts stay synchronized across tabs and refreshes.

Supported events include application submission/view/status changes, interview/offer/rejection updates, candidate withdrawal, candidate/recruiter messages, recruiter registration and verification review, job moderation, account updates, failed uploads, and system/admin alert types.

## Interview Management

OpportunityX includes an enterprise interview lifecycle module for HR, technical, managerial, behavioral, final, and custom interviews. Recruiters can schedule, reschedule, cancel, duplicate, score, and collect feedback for interviews with interview modes, duration, timezone, meeting links, notifications, email updates, Socket.IO events, and ICS calendar export.

Candidates can view upcoming interviews, accept invitations, request reschedules, open meeting links, download calendar invites, and review interview history. Admins have platform-wide interview oversight.

## Enterprise Email Automation

Email automation is provider-neutral and currently uses Nodemailer through SMTP. Candidate, recruiter, admin, and auth emails share branded responsive templates, a registry, safe HTML escaping, queue abstraction, retry support, and admin-only preview/validation endpoints.

Configure `EMAIL_PROVIDER`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `FROM_EMAIL`, and `FROM_NAME` in `backend/.env`. Legacy `SMTP_PASS` and `EMAIL_FROM` remain supported. See [email architecture](docs/email-architecture.md) for provider migration notes and template coverage.

## AI Candidate Intelligence

AI endpoints are served from `/api/ai` and require role-based auth. Set provider keys such as `GEMINI_API_KEY`, `OPENROUTER_API_KEY`, `GROQ_API_KEY`, or `OPENAI_API_KEY` in `backend/.env` to enable provider responses. Without a configured provider, the frontend shows unavailable states instead of fake AI content.

OpportunityX parses uploaded PDF and DOCX resumes on the backend, stores sanitized parsed resume intelligence in MongoDB, and uses the existing provider fallback system for ATS scoring, resume improvement, candidate-job matching, recruiter applicant scoring, candidate learning guidance, and admin hiring insights. AI keys and raw provider calls remain backend-only.

## Frontend UI Stabilization

The premium UI pass keeps real API integrations intact while improving shell branding, metadata, responsiveness, accessibility, route-level code splitting, and partial-data safety. See [FRONTEND_UI_AUDIT.md](FRONTEND_UI_AUDIT.md) for current findings and remaining UI QA.

The latest design pass also removes fake homepage testimonials/statistics, strengthens the AI hiring platform narrative, upgrades featured job cards, and documents frontend improvements in [UI_IMPROVEMENTS.md](UI_IMPROVEMENTS.md).

## Root Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start frontend |
| `npm run dev:backend` | Start backend |
| `npm run build` | Build frontend |
| `npm test` | Run frontend tests |
| `npm run lint` | Lint frontend |
| `npm run test:backend` | Run backend tests |
| `npm run install:all` | Install both applications |

## Production Readiness

Phase 11 hardening covers route/API alignment, protected route behavior, chat socket cleanup, global frontend error recovery, backend structured logging, upload filename hardening, dependency security updates, enterprise notifications, and final build/test validation. See [production readiness audit](docs/production-readiness-audit.md) for the route/API/security/performance validation report.

See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md), [architecture](docs/architecture.md), [email architecture](docs/email-architecture.md), [API documentation](docs/api-documentation.md), and the [deployment guide](docs/deployment-guide.md).
