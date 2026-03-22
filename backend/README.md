# OpportunityX Backend

Production-ready Express + MongoDB API for the OpportunityX job portal.

## Tech Stack

| Layer          | Technology                        |
|----------------|-----------------------------------|
| Runtime        | Node.js v18+                      |
| Framework      | Express 5                         |
| Database       | MongoDB (Mongoose ODM)            |
| Auth           | JWT + bcrypt                      |
| Validation     | express-validator                 |
| File Uploads   | Multer (disk storage)             |
| Architecture   | MVC (Model → Controller → Route)  |

## Folder Structure

```
backend/server/
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/
│   ├── authController.js      # Register, login
│   ├── profileController.js   # Candidate profile CRUD
│   ├── jobController.js       # Job CRUD, search, featured
│   ├── applicationController.js # Apply, withdraw, status
│   ├── savedJobController.js  # Bookmark toggle
│   ├── notificationController.js
│   ├── recruiterNoteController.js
│   ├── adminController.js     # User mgmt, analytics
│   └── publicController.js    # Public profile & job detail
├── middleware/
│   ├── authMiddleware.js      # JWT verify + role gate
│   ├── errorHandler.js        # Global error handler
│   ├── upload.js              # Multer config (resume/photo)
│   └── validate.js            # express-validator rules
├── models/
│   ├── User.js
│   ├── Profile.js
│   ├── Job.js
│   ├── Application.js
│   ├── SavedJob.js
│   ├── Notification.js
│   ├── RecruiterNote.js
│   └── Report.js
├── routes/
│   ├── authRoutes.js
│   ├── profileRoutes.js
│   ├── jobRoutes.js
│   ├── applicationRoutes.js
│   ├── savedJobRoutes.js
│   ├── notificationRoutes.js
│   ├── recruiterNoteRoutes.js
│   ├── adminRoutes.js
│   └── publicRoutes.js
├── utils/
│   └── reportGenerator.js     # CSV / Excel / PDF reports
├── uploads/                   # Generated at runtime
├── app.js                     # Express app config
├── server.js                  # Entry point (connects DB + listens)
├── .env.example
└── package.json
```

## Quick Start

```bash
cd backend/server

# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# 3. Start development server (auto-reload)
npm run dev
```

The API runs at **http://localhost:5000**.

## Environment Variables

| Variable         | Description                          | Required |
|------------------|--------------------------------------|----------|
| `PORT`           | Server port (default `5000`)         | No       |
| `MONGO_URI`      | MongoDB connection string            | Yes      |
| `JWT_SECRET`     | Secret for signing JWT tokens        | Yes      |
| `NODE_ENV`       | `development` or `production`        | No       |
| `CLOUDINARY_URL` | Cloudinary config (for image CDN)    | No       |

## API Endpoints

### Auth

| Method | Endpoint              | Body                                    | Access |
|--------|-----------------------|-----------------------------------------|--------|
| POST   | `/api/auth/register`  | `name, email, password, role?`          | Public |
| POST   | `/api/auth/login`     | `email, password`                       | Public |

### Jobs

| Method | Endpoint                  | Description                    | Access    |
|--------|---------------------------|--------------------------------|-----------|
| GET    | `/api/jobs`               | Search jobs (query params below) | Public  |
| GET    | `/api/jobs/featured`      | Get featured jobs              | Public    |
| GET    | `/api/jobs/:id`           | Get job detail                 | Public    |
| GET    | `/api/jobs/my`            | Recruiter's own jobs           | Recruiter |
| POST   | `/api/jobs`               | Create job                     | Recruiter |
| PUT    | `/api/jobs/:id`           | Update job                     | Recruiter |
| DELETE | `/api/jobs/:id`           | Delete job                     | Recruiter |
| PATCH  | `/api/jobs/:id/status`    | Change job status              | Recruiter |

**Search query params:** `page`, `limit`, `keyword`, `location`, `type`, `experience`, `salaryMin`, `salaryMax`, `sort` (`salary-high` | `salary-low`)

### Applications

| Method | Endpoint                       | Description             | Access    |
|--------|--------------------------------|-------------------------|-----------|
| POST   | `/api/applications/:jobId/apply` | Apply to a job        | Candidate |
| GET    | `/api/applications/me`         | My applications         | Candidate |
| PATCH  | `/api/applications/:id/withdraw` | Withdraw application  | Candidate |
| GET    | `/api/applications/job/:jobId` | Applicants for a job    | Recruiter |
| PATCH  | `/api/applications/:id/status` | Update applicant status | Recruiter |

### Candidate Profile

| Method | Endpoint                | Description           | Access    |
|--------|-------------------------|-----------------------|-----------|
| GET    | `/api/candidate/profile`| Get my profile        | Candidate |
| PUT    | `/api/candidate/profile`| Create/update profile (multipart) | Candidate |

### Saved Jobs

| Method | Endpoint                 | Description       | Access    |
|--------|--------------------------|-------------------|-----------|
| GET    | `/api/saved-jobs`        | List saved jobs   | Candidate |
| POST   | `/api/saved-jobs/:jobId` | Save a job        | Candidate |
| DELETE | `/api/saved-jobs/:jobId` | Unsave a job      | Candidate |

### Notifications

| Method | Endpoint                         | Description       | Access |
|--------|----------------------------------|--------------------|--------|
| GET    | `/api/notifications`             | List notifications | Auth   |
| PATCH  | `/api/notifications/:id/read`    | Mark as read       | Auth   |
| PATCH  | `/api/notifications/read-all`    | Mark all read      | Auth   |

### Recruiter Notes

| Method | Endpoint                | Description            | Access    |
|--------|-------------------------|------------------------|-----------|
| POST   | `/api/recruiter/notes`  | Add note on candidate  | Recruiter |

### Admin

| Method | Endpoint                        | Description          | Access |
|--------|---------------------------------|----------------------|--------|
| GET    | `/api/admin/users`              | List all users       | Admin  |
| PATCH  | `/api/admin/users/:id/status`   | Suspend/activate     | Admin  |
| PATCH  | `/api/admin/users/:id/role`     | Change user role     | Admin  |
| DELETE | `/api/admin/users/:id`          | Delete user          | Admin  |
| PATCH  | `/api/admin/jobs/:id/moderate`  | Moderate job listing | Admin  |
| GET    | `/api/admin/analytics`          | Platform analytics   | Admin  |

### Public

| Method | Endpoint                          | Description         | Access |
|--------|-----------------------------------|---------------------|--------|
| GET    | `/api/public/profile/:username`   | Public profile      | Public |
| GET    | `/api/public/jobs/:id`            | Public job detail   | Public |

## Frontend Routes

| Route                | Page              | Access     |
|----------------------|-------------------|------------|
| `/`                  | Home / Landing    | Public     |
| `/jobs`              | Job Listings      | Public     |
| `/jobs/:id`          | Job Detail        | Public     |
| `/login`             | Login             | Public     |
| `/register`          | Register          | Public     |
| `/profile/:username` | Public Profile    | Public     |
| `/onboarding`        | Onboarding Flow   | Auth       |
| `/candidate/*`       | Candidate Dashboard | Candidate |
| `/recruiter/*`       | Recruiter Dashboard | Recruiter |
| `/admin/*`           | Admin Dashboard   | Admin      |
| `/settings`          | User Settings     | Auth       |
| `/messages`          | Chat / Messages   | Auth       |
| `/notifications`     | Notifications     | Auth       |

## Error Handling

All errors return a consistent JSON shape:

```json
{
  "success": false,
  "message": "Human-readable error",
  "errors": [{ "field": "email", "message": "Valid email is required" }]
}
```

Handled automatically: Mongoose validation errors, duplicate keys, bad ObjectIds, JWT failures, file size limits.

## Production

```bash
NODE_ENV=production npm start
```
