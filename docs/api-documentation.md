# API Documentation

All endpoints are under `/api`. Protected endpoints require:

```http
Authorization: Bearer <jwt>
```

| Area | Endpoint | Access |
| --- | --- | --- |
| Health | `GET /api/health` | Public |
| Auth | `POST /api/auth/register` | Public |
| Auth | `POST /api/auth/login` | Public |
| Jobs | `GET /api/jobs` | Public |
| Jobs | `GET /api/jobs/featured` | Public |
| Jobs | `GET /api/jobs/:id` | Public |
| Jobs | `POST /api/jobs` | Recruiter |
| Jobs | `GET /api/jobs/my` | Recruiter |
| Applications | `POST /api/applications/:jobId/apply` | Candidate |
| Applications | `GET /api/applications/me` | Candidate |
| Applications | `GET /api/applications/job/:jobId` | Recruiter |
| Candidate | `GET/PUT /api/candidate/profile` | Candidate |
| Saved jobs | `GET/POST/DELETE /api/saved-jobs` | Candidate |
| Notifications | `/api/notifications` | Authenticated |
| Recruiter notes | `/api/recruiter/notes` | Recruiter |
| Admin | `/api/admin/*` | Admin |
| Public | `/api/public/*` | Public |

Validation errors use HTTP 400. Authentication failures use 401, role failures
use 403, and missing routes use 404.
