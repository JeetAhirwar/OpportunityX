# OpportunityX Chat API

The complete API index is in [`docs/api-documentation.md`](docs/api-documentation.md).

## Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

Forgot-password always returns a generic success response. Reset links contain
a one-time random token whose SHA-256 hash and one-hour expiry are stored on
the user record. Login remains available to unverified users until a complete
email verification flow is implemented, but inactive users are rejected.

Chat endpoints are mounted at `/api/chat` and require the OpportunityX bearer
token. Conversation creation requires an `applicationId`; the backend derives
the candidate, recruiter, and job from that application and rejects unrelated
users and administrators.

Socket.IO connects to the OpportunityX backend using:

```js
io(VITE_SOCKET_URL, { auth: { token } });
```

The merged server supports conversation rooms, personal user rooms, messages,
typing, reactions, edit/delete, seen state, online users, unread counts, and
notification events.
