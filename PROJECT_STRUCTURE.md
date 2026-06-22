# Project Structure Refactor

## Previous structure

- The Lovable-generated React application originally occupied the repository
  root.
- The backend was nested under `backend/server`.
- Backend source, package metadata, a real `.env`, and tracked `node_modules`
  lived together.
- Frontend authentication, dashboard, layout, store, and API modules were
  spread across generic `pages`, `contexts`, `lib`, and mixed feature folders.
- Lovable metadata, `lovable-tagger`, duplicate Bun lockfiles, and generated
  build output remained in the repository.

## Current structure

```text
opportunity-compass/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── constants/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── uploads/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/
│   ├── .env.example
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/common/
│   │   ├── components/ui/
│   │   ├── features/auth/
│   │   ├── features/jobs/
│   │   ├── features/candidate/
│   │   ├── features/recruiter/
│   │   ├── features/admin/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── store/
│   │   └── utils/
│   ├── .env.example
│   ├── package.json
│   └── README.md
├── docs/
├── package.json
└── README.md
```

## Changes

- Moved backend runtime code into `backend/src`.
- Renamed backend controllers, models, routes, and middlewares consistently.
- Added centralized environment, CORS, role, token, response, error, async,
  logger, role-middleware, and rate-limit extension modules.
- Added `/api/health`.
- Moved frontend modules into domain-focused feature folders.
- Moved API access to `src/services/api.ts` and removed source hardcoding.
- Removed Lovable metadata/tagger, obsolete Bun lockfiles, generated `dist`,
  empty legacy folders, and confirmed dead files.
- Added application-specific environment templates and documentation.

## Production notes

Replace all dummy environment values before deployment. The old backend
`.env` was previously committed, so rotate its MongoDB credentials and JWT
secret; deleting a current file does not remove secrets from Git history.
Use durable storage for uploads and add a real rate limiter before horizontally
scaling the API.
