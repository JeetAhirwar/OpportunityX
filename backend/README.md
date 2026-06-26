# OpportunityX Backend

Express and MongoDB API for OpportunityX.

## Architecture

`src/server.js` validates environment configuration, connects to MongoDB, and
starts HTTP listening. `src/app.js` configures middleware, routes, static
uploads, health checks, and error handling.

Business modules are separated into controllers, models, routes, validators,
middlewares, configuration, constants, services, and utilities.

## Commands

```bash
npm install
npm run dev
npm start
npm test
```

## Environment

Copy `.env.example` to `.env`. Required runtime values are `MONGODB_URI` and
`JWT_SECRET`. Replace every placeholder before production use. `MONGO_URI`
remains accepted temporarily for compatibility with older local files.

The API defaults to port `8000`. Allowed browser origins are configured as a
comma-separated `CORS_ORIGIN` list. Optional `OPENAI_API_KEY` and `AI_MODEL`
enable `/api/ai` features; missing AI credentials produce unavailable
responses instead of fake output.

## API summary

- `/api/health` — service health
- `/api/auth` — registration and login
- `/api/jobs` — job search and recruiter job management
- `/api/applications` — applications and applicant status
- `/api/candidate` — candidate profile
- `/api/saved-jobs` — saved jobs
- `/api/notifications` — notifications
- `/api/recruiter/notes` — recruiter notes
- `/api/admin` — administration
- `/api/public` — public profiles and jobs

Detailed access requirements are in
[`docs/api-documentation.md`](../docs/api-documentation.md).

Security middleware includes Helmet, exact-origin CORS, JWT route protection,
role authorization, upload validation, and in-memory rate limiting for AI/chat
routes. Replace the limiter with a distributed store before horizontal scaling.
