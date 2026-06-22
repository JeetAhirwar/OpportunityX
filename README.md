# OpportunityX

OpportunityX is a MERN hiring platform for candidates, recruiters, and
administrators. The repository is organized as two independently deployable
applications with shared project documentation.

## Technology

- Frontend: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query
- Backend: Node.js, Express 5, MongoDB, Mongoose, JWT, Multer
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

## Root commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start frontend |
| `npm run dev:backend` | Start backend |
| `npm run build` | Build frontend |
| `npm test` | Run frontend tests |
| `npm run lint` | Lint frontend |
| `npm run install:all` | Install both applications |

See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md), [architecture](docs/architecture.md),
[API documentation](docs/api-documentation.md), and the
[deployment guide](docs/deployment-guide.md).
