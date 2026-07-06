# Security Checklist

- Backend uses Helmet security headers.
- CORS uses explicit configured origins.
- Protected routes require JWT auth and role checks.
- Socket.IO authenticates `socket.auth.token` with the same JWT secret.
- Auth responses exclude passwords and reset tokens.
- Uploads validate type and size.
- AI prompts are backend-only, size-limited, and scrub obvious secrets.
- Resume text sent to AI is sanitized and length-limited.
- Parsed resume raw text is excluded from default MongoDB reads.
- AI routes are rate limited.
- Chat routes enforce conversation membership before room joins/actions.
- Interview routes enforce recruiter ownership, candidate self-access, and
  admin full access.
- Calendar export requires the same interview access checks as interview
  details.
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
