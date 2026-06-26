# Testing Guide

## Automated Checks

Run from the repository root:

```bash
npm run test:backend
npm run lint
npm run test
npm run build
```

Backend tests set dummy `MONGODB_URI` and `JWT_SECRET` values where possible.
Do not point tests at production MongoDB.

## Manual Smoke Areas

- Public jobs and job details.
- Candidate profile, resume upload, saved jobs, applications, messages,
  notifications, AI assistant, resume analysis, and AI recommendations.
- Recruiter company verification, post job, manage jobs, applicants, messages,
  notifications, and AI match/job-description helpers.
- Admin dashboard, users, approvals, jobs, applications, analytics,
  notifications, reports Coming Soon, and AI insights.

## AI Checks

- Without `OPENAI_API_KEY`, AI screens should show unavailable/error states.
- With `OPENAI_API_KEY`, all AI calls must go through backend `/api/ai/*`.
- Candidates must not access recruiter/admin AI routes.
- Recruiters must not access admin AI routes.
