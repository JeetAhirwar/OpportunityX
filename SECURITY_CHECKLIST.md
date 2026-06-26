# Security Checklist

- Backend uses Helmet security headers.
- CORS uses explicit configured origins.
- Protected routes require JWT auth and role checks.
- Socket.IO authenticates `socket.auth.token` with the same JWT secret.
- Auth responses exclude passwords and reset tokens.
- Uploads validate type and size.
- AI prompts are backend-only, size-limited, and scrub obvious secrets.
- AI routes are rate limited.
- Chat routes enforce conversation membership before room joins/actions.
- Admin user actions block self-suspension, self-role-change, and self-delete.
- Production must use strong `JWT_SECRET`, exact CORS origins, and MongoDB
  Atlas network restrictions.
- Do not commit real `.env` files or API keys.

## Remaining Production Risks

- Dependency audit currently reports vulnerabilities that need a separate
  remediation pass.
- Chat attachments should move from local disk to durable object storage.
- More integration tests are needed for auth, jobs, applications, chat, admin,
  and AI authorization.
