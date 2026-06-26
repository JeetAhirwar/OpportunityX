# OpportunityX

OpportunityX is a MERN hiring platform for candidates, recruiters, and
administrators. The repository is organized as two independently deployable
applications with shared project documentation.

## Technology

- Frontend: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query
- Backend: Node.js, Express 5, MongoDB, Mongoose, JWT, Multer
- Real-time messaging: Socket.IO with application-scoped candidate/recruiter conversations
- AI: backend-only OpenAI provider abstraction with no-key unavailable states
- Tooling: npm, ESLint, Vitest

## Structure

```text
opportunity-compass/
├── backend/       # Express API and MongoDB models
├── frontend/      # React/Vite web application
├── docs/          # Architecture, API, and deployment guides
├── scripts/       # Operational script placeholders
├── package.json   # Root convenience commands
└── PROJECT_STRUCTURE.md
```

## Local setup

```bash
npm run install:all
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

Replace the dummy backend secrets and MongoDB URI, then run in separate
terminals:

```bash
npm run dev:backend
npm run dev
```

The recommended local API is `http://localhost:8000`; the frontend remains on
Vite's configured port `8080`.

## Candidate/recruiter chat

Chat uses the existing OpportunityX JWT and MongoDB. Set `SOCKET_CORS_ORIGIN`
in `backend/.env` and `VITE_SOCKET_URL` in `frontend/.env`. A conversation can
only be created from an application: candidates may message the recruiter for
a job they applied to, and recruiters may message applicants to their own
jobs. The backend enforces these rules for both REST and Socket.IO actions.

To test locally, apply to a job as a candidate, open Recruiter → Applicants as
the owning recruiter, click the message button, and exchange messages between
two browser sessions. History, typing, online state, seen state, unread badges,
and message notifications persist/update through the merged backend.

## AI features

AI endpoints are served from `/api/ai` and require role-based auth. Set
`OPENAI_API_KEY` and optionally `AI_MODEL` in `backend/.env` to enable provider
responses. Without a key, the frontend shows unavailable states instead of
fake AI content.

## Root commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start frontend |
| `npm run dev:backend` | Start backend |
| `npm run build` | Build frontend |
| `npm test` | Run frontend tests |
| `npm run lint` | Lint frontend |
| `npm run test:backend` | Run backend tests |
| `npm run install:all` | Install both applications |

See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md), [architecture](docs/architecture.md),
[API documentation](docs/api-documentation.md), and the
[deployment guide](docs/deployment-guide.md).
