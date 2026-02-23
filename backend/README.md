# OpportunityX Backend

Express + MongoDB API server for the OpportunityX job portal.

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB Atlas](https://www.mongodb.com/atlas) account (or local MongoDB)

## Setup

```bash
cd backend/server

# 1. Install dependencies
npm install

# 2. Create your environment file
cp .env.example .env
# Then edit .env with your MongoDB URI and a JWT secret

# 3. Start the dev server (with auto-reload)
npm run dev
```

The API will be available at `http://localhost:5000`.

## Environment Variables

| Variable | Description |
|------------|--------------------------------------|
| `PORT` | Server port (default `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |

## API Endpoints

### Public
- `GET /api/jobs` — Search jobs (query params: `page`, `limit`, `keyword`, `location`, `type`, `experience`, `salaryMin`, `salaryMax`, `sort`)
- `GET /api/public/profile/:username` — Public profile
- `GET /api/public/jobs/:id` — Public job detail

### Auth
- `POST /api/auth/register` — Register (`name`, `email`, `password`, `role`)
- `POST /api/auth/login` — Login (`email`, `password`)

### Candidate (requires auth)
- `GET/PUT /api/candidate/profile` — Get/update profile
- `POST /api/applications/:jobId/apply` — Apply to job
- `GET /api/applications/me` — My applications
- `PATCH /api/applications/:id/withdraw` — Withdraw application
- `POST/DELETE /api/saved-jobs/:jobId` — Toggle saved job
- `GET /api/saved-jobs` — List saved jobs

### Recruiter (requires auth + recruiter role)
- `POST /api/jobs` — Create job
- `PUT /api/jobs/:id` — Update job
- `DELETE /api/jobs/:id` — Delete job
- `GET /api/applications/job/:jobId` — View applicants
- `PATCH /api/applications/:id/status` — Update application status
- `POST /api/recruiter/notes` — Add recruiter note

### Admin (requires auth + admin role)
- `GET /api/admin/users` — List users
- `PATCH /api/admin/users/:id/status` — Suspend/activate user
- `PATCH /api/admin/users/:id/role` — Change user role
- `DELETE /api/admin/users/:id` — Delete user
- `PATCH /api/admin/jobs/:id/moderate` — Moderate job
- `GET /api/admin/analytics` — Platform analytics
- `GET /api/admin/reports/:type?format=csv|xlsx|pdf` — Download report

### Shared (requires auth)
- `GET /api/notifications` — List notifications
- `PATCH /api/notifications/:id/read` — Mark read
- `PATCH /api/notifications/read-all` — Mark all read

## Production

```bash
npm start
```
