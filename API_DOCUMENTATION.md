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

## Candidate

- `GET /api/candidate/profile` returns the persisted candidate profile.
- `PUT /api/candidate/profile` creates or updates the profile and accepts an
  optional PDF `resume` multipart field up to 10 MB.
- Candidate profiles persist `preferredJobTypes`, `preferredWorkModes`,
  `preferredIndustries`, and `expectedSalaryMin`.
- `GET /api/applications/me` returns paginated candidate applications.
- `PATCH /api/applications/:id/withdraw` withdraws an eligible application.
- `GET /api/saved-jobs` returns populated saved jobs.
- `POST /api/saved-jobs/:jobId` toggles saved state.

Job-alert APIs are not yet implemented; the frontend does not simulate local
persistence.

## Admin

All admin endpoints require an authenticated user with role `admin`.

- `GET /api/admin/analytics` returns platform totals, grouped metrics, pending
  approvals, and recent users/jobs/applications.
- `GET /api/admin/users` lists safe user fields; passwords and reset tokens are
  never returned.
- `PATCH /api/admin/users/:id/status` suspends or reactivates a user.
- `PATCH /api/admin/users/:id/role` changes a user's role.
- `DELETE /api/admin/users/:id` deletes a user.
- Admins cannot suspend, demote, or delete their own account.
- `GET /api/admin/recruiters` and `GET /api/admin/recruiters/:id` expose
  Company verification records.
- `PATCH /api/admin/recruiters/:id/approve` verifies the Company and recruiter,
  records `verifiedAt` and `verifiedBy`, and notifies the recruiter.
- `PATCH /api/admin/recruiters/:id/reject` requires a reason, stores it, and
  notifies the recruiter.
- `GET /api/admin/jobs` lists all jobs.
- `PATCH /api/admin/jobs/:id/moderate` changes status or featured state.
- `GET /api/admin/applications` returns a read-only populated application list.

## Recruiter

- `GET /api/jobs/my` lists jobs owned by the authenticated recruiter.
- `GET /api/jobs/my/:id` returns one owned job without incrementing public
  views.
- `POST /api/jobs`, `PUT /api/jobs/:id`, `DELETE /api/jobs/:id`, and
  `PATCH /api/jobs/:id/status` enforce recruiter ownership.
- Active publishing requires a Company record with
  `verificationStatus: "verified"`; draft jobs remain available.
- `GET /api/applications/recruiter` lists applicants across owned jobs.
- `GET /api/applications/job/:jobId` lists applicants for one owned job.
- `GET /api/recruiter/company` loads the recruiter's Company profile.
- `PUT /api/recruiter/company` creates or updates the Company profile.
- `POST /api/recruiter/company/submit-verification` validates required fields
  and changes verification status to `pending`.
