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
| Chat | `GET /api/chat/conversations` | Candidate or recruiter |
| Chat | `POST /api/chat/conversations/start` | Application participant |
| Chat | `GET /api/chat/messages/:conversationId` | Conversation participant |
| Chat | `PATCH /api/chat/conversations/:conversationId/read` | Conversation participant |
| Chat | `PATCH/DELETE /api/chat/messages/:messageId` | Message sender |
| Recruiter notes | `/api/recruiter/notes` | Recruiter |
| Admin | `/api/admin/*` | Admin |
| Public | `/api/public/*` | Public |

Validation errors use HTTP 400. Authentication failures use 401, role failures
use 403, and missing routes use 404.

`POST /api/chat/conversations/start` accepts `{ "applicationId": "..." }`.
Socket clients authenticate with `auth: { token }` and may use
`join_conversation`, `send_message`, `message_seen`, `message_reaction`,
`edit_message`, `delete_message`, `typing_start`, `typing_stop`, and
`mark_conversation_read`.
