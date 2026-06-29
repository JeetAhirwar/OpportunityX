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

The recommended local API is `http://localhost:8000`; the frontend remains on Vite's configured port `8080`.

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

## AI Features

AI endpoints are served from `/api/ai` and require role-based auth. Set provider keys such as `GEMINI_API_KEY`, `OPENROUTER_API_KEY`, `GROQ_API_KEY`, or `OPENAI_API_KEY` in `backend/.env` to enable provider responses. Without a configured provider, the frontend shows unavailable states instead of fake AI content.

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

See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md), [architecture](docs/architecture.md), [API documentation](docs/api-documentation.md), and the [deployment guide](docs/deployment-guide.md).
