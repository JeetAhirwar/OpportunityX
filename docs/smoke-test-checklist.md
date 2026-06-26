# Smoke Test Checklist

## Public

- Home loads.
- Jobs list loads real jobs.
- Job details load by MongoDB ID.
- Login and register work.
- Refreshing routes does not show a server 404.

## Candidate

- Profile saves.
- Resume uploads.
- Saved jobs toggle.
- Apply to job works.
- Applications list updates.
- Messages connect and send.
- Notifications mark read.
- AI assistant shows unavailable without key or replies with key.

## Recruiter

- Dashboard loads real data.
- Company profile submits verification.
- Post job saves draft and publishes only when verified.
- Manage jobs loads owned jobs.
- Applicants load and status updates notify candidates.
- Message candidate opens conversation.
- AI match and job description helpers show preview/unavailable states.

## Admin

- Dashboard real stats load.
- Users load and self-destructive actions are blocked.
- Recruiter approvals approve/reject with notifications.
- Jobs moderate.
- Applications read-only list loads.
- Analytics load and AI insights show preview/unavailable state.

## Technical

- `/api/health` returns healthy.
- CORS works only for configured origins.
- Socket connects with JWT.
- Frontend build passes.
- Backend and frontend tests pass.
