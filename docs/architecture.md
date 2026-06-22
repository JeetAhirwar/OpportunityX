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
`backend/src/uploads`; production deployments should replace local disk with
durable object storage.

The existing controller behavior is intentionally preserved. New business
logic should move into `src/services` as controllers become more complex.
