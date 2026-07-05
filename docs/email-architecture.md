# OpportunityX Email Automation Architecture

OpportunityX uses a provider-neutral email layer so business flows do not depend on Nodemailer directly.

## Runtime Components

- `backend/src/services/email.service.js` is the backward-compatible facade used by controllers.
- `backend/src/email/template-engine.js` renders registered templates into subject, HTML, and text.
- `backend/src/email/templates/registry.js` owns every email type and reuses the common branded layout.
- `backend/src/email/providers/provider.factory.js` selects the configured provider.
- `backend/src/email/providers/nodemailer.provider.js` is the current SMTP implementation.
- `backend/src/email/queue/in-memory-email.queue.js` provides non-blocking queued delivery, retry, and short-window dedupe. It can be replaced by BullMQ, RabbitMQ, SQS, or another durable worker without changing controllers.

## Configuration

```env
EMAIL_PROVIDER=nodemailer
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASSWORD=your_app_password
FROM_EMAIL=no-reply@opportunityx.com
FROM_NAME=OpportunityX
SUPPORT_EMAIL=support@opportunityx.com
PRIVACY_URL=https://opportunityx.com/privacy
SOCIAL_LINKEDIN=https://www.linkedin.com/company/opportunityx
SOCIAL_X=https://x.com/opportunityx
```

`SMTP_PASS` and `EMAIL_FROM` remain supported for older deployments.

## Provider Migration

Supported provider keys are prepared for `nodemailer`, `resend`, `sendgrid`, `ses`, `mailgun`, and `brevo`. To add a provider, implement a provider class with `isConfigured()` and `send(message)`, then register it in `provider.factory.js`. Controllers and templates do not change.

## Templates

Templates are responsive HTML with an OpportunityX logo mark, brand colors, greeting, body content, CTA, support contact, privacy footer, social links, and current year.

Registered types:

- Auth: welcome, verify email, email verified, forgot password, reset password, password changed.
- Candidate: registration successful, job applied, application viewed, shortlisted, interview scheduled, interview updated, offer letter, rejected, profile approved.
- Recruiter: registered, approved, rejected, new application received, job published, job expired.
- Admin: recruiter approval required, new recruiter registered, critical system alert.

## Security

Dynamic values are HTML-escaped before rendering. CTA URLs are restricted to relative, `http`, `https`, and `mailto` links. SMTP credentials are read only from environment variables and are never returned by preview APIs or logs.

## Preview And Validation

Admin endpoints:

- `GET /api/admin/email/templates`
- `GET /api/admin/email/templates/validate`
- `POST /api/admin/email/templates/:type/preview`

Run backend tests with:

```bash
cd backend
npm test
```
