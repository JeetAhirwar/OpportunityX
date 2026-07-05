# Architecture

OpportunityX is a modular monorepo containing independently installable
frontend and backend applications.

## Request flow

```text
React feature
  -> services/api.ts
  -> VITE_API_BASE_URL
  -> Express route
  -> authentication/role/validation middleware
  -> controller
  -> Mongoose model
  -> MongoDB
```

The frontend owns presentation, browser state, protected routes, and API
requests. The backend owns authorization, validation, persistence, file
uploads, and API responses.

The backend environment module validates required startup configuration.
CORS is centralized and accepts only configured frontend origins. Roles are
defined in one constants module. Uploaded files are isolated under
`backend/src/uploads`; upload middleware validates MIME type, enforces file
size limits, and writes sanitized generated filenames. Production deployments
should replace local disk with durable object storage.

Frontend route modules are lazy loaded behind a global error boundary. Public,
candidate, recruiter, and admin route shells use role-based route guards, while
unknown nested dashboard paths render the shared not-found page instead of
silently masking broken links.

The existing controller behavior is intentionally preserved. New business
logic should move into `src/services` as controllers become more complex.
