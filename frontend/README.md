# OpportunityX Frontend

React and TypeScript single-page application built with Vite.

## Organization

- `components/common` — shared application components
- `components/ui` — shadcn/Radix primitives
- `features/auth` — authentication screens
- `features/jobs` — public job discovery
- `features/candidate` — candidate dashboard and workflows
- `features/recruiter` — recruiter dashboard and workflows
- `features/admin` — administration dashboard
- `routes` — route guards
- `services` — API access
- `store` — authentication and theme providers
- `pages` — remaining public top-level pages

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
npm test
```

## Environment

Copy `.env.example` to `.env`.

```dotenv
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=OpportunityX
```

Only `VITE_` values are exposed to browser code, so they must never contain
secrets. Production should point `VITE_API_BASE_URL` and `VITE_SOCKET_URL` at
the deployed backend. AI features do not require frontend secrets; all provider
calls go through backend `/api/ai` routes.
