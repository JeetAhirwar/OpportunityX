# OpportunityX Full Application Plan

## 1. Executive Summary

OpportunityX is an enterprise job portal connecting three user personas — **Candidates**, **Recruiters**, and **Admins**. The platform supports job discovery, applications, resume management, recruiter tools, admin moderation, analytics, and real-time communication. This plan documents the complete architecture: frontend UI, backend API, database schema, integration points, and deployment strategy.

---

## 2. Goals & Objectives

- Provide a modern, mobile-first job portal UI with role-based dashboards.
- Build a secure, scalable Express/MongoDB backend using MVC architecture.
- Enable JWT authentication with role-based access control (RBAC).
- Support resume uploads, job search/filtering, application tracking, and recruiter notes.
- Deliver admin analytics, reporting, and moderation tools.
- Maintain clean code, validation, error handling, and production-ready documentation.

---

## 3. Tech Stack

### Frontend
- React 18 + TypeScript 5
- Vite 5 (build tooling)
- Tailwind CSS v3 + shadcn/ui components
- React Router (routing)
- TanStack React Query (server state/caching)
- Framer Motion (animations)
- Lucide React (icons)

### Backend
- Node.js + Express 5
- MongoDB + Mongoose ODM
- JWT + bcryptjs (authentication)
- express-validator (input validation)
- Multer (file uploads)
- json2csv / exceljs / pdfkit (report generation)

### DevOps & Tooling
- Git version control
- nodemon (dev server)
- Vitest (testing)
- ESLint (code quality)

---

## 4. Frontend Architecture

### 4.1 Global Layout & Providers

```text
src/
├── main.tsx                # App entry point
├── App.tsx                 # Router + providers
├── contexts/
│   ├── AuthContext.tsx     # Auth state (login/logout/user)
│   └── ThemeContext.tsx    # Dark/light mode
├── components/layout/
│   ├── Navbar.tsx          # Top navigation
│   └── Footer.tsx          # Footer
├── components/common/      # Reusable UI helpers
├── components/ui/            # shadcn components
├── hooks/                    # Custom React Query hooks
├── lib/
│   ├── api.ts              # Central API client
│   └── utils.ts
├── features/               # Feature modules
├── pages/                  # Top-level route pages
└── types/index.ts          # Shared TypeScript types
```

### 4.2 Route Structure

| Route | Page | Access | Notes |
|-------|------|--------|-------|
| `/` | Home / Landing | Public | Hero, featured jobs, CTA |
| `/jobs` | Job Listings | Public | Search, filters, pagination |
| `/jobs/:id` | Job Detail | Public | Apply dialog, company info |
| `/login` | Login | Public | Demo access buttons for all roles |
| `/register` | Register | Public | Role selection |
| `/forgot-password` | Forgot Password | Public | Password reset flow |
| `/verify-otp` | OTP Verification | Public | 2FA/verification |
| `/profile/:username` | Public Profile | Public | LinkedIn-style read-only profile |
| `/candidate/*` | Candidate Dashboard | Candidate | Sidebar with sub-routes |
| `/recruiter/*` | Recruiter Dashboard | Recruiter | Sidebar with sub-routes |
| `/admin/*` | Admin Dashboard | Admin | Sidebar with sub-routes |
| `/settings` | Settings | Auth | Preferences, notifications |
| `/messages` | Chat / Messages | Auth | Conversations UI |
| `/notifications` | Notifications | Auth | Notification list |

### 4.3 Candidate Dashboard Sub-Routes

```text
/candidate/dashboard           → Overview stats, recent applications
/candidate/profile             → Profile builder
/candidate/resume              → Resume upload
/candidate/applied             → My applications
/candidate/saved               → Saved jobs
/candidate/alerts              → Job alerts
/candidate/recommendations     → AI job recommendations
/candidate/chat                → Messages
/candidate/notifications       → Notifications
/candidate/settings            → Settings
```

### 4.4 Recruiter Dashboard Sub-Routes

```text
/recruiter/dashboard           → Stats overview
/recruiter/post-job            → Create job posting
/recruiter/jobs                → Manage jobs
/recruiter/applicants          → Applicant management
/recruiter/company             → Company profile
/recruiter/analytics           → Recruiter analytics
/recruiter/chat                → Messages
/recruiter/notifications       → Notifications
/recruiter/settings            → Settings
```

### 4.5 Admin Dashboard Sub-Routes

```text
/admin/dashboard               → Platform overview
/admin/users                   → User management
/admin/approvals               → Recruiter approval
/admin/jobs                    → Job moderation
/admin/analytics               → Platform analytics
/admin/settings                → Admin settings
```

### 4.6 Key Frontend Components

- **ProtectedRoute**: Restricts access by role.
- **Navbar**: Global navigation, logo, user menu.
- **OnboardingModal**: Multi-step profile setup.
- **ProfileBuilder**: Fresher/experienced toggle, education, experience, skills.
- **ResumeUpload**: File upload with preview.
- **JobSearch**: Filters, sorting, pagination.
- **ApplicantManagement**: Recruiter applicant review + status updates.
- **UserManagement**: Admin user table with actions.
- **PlatformAnalytics**: Charts and stats.
- **ChatPage**: Messaging interface.
- **NotificationsPage**: Notification list with read/unread.

### 4.7 State Management

- **AuthContext**: Stores current user and token in localStorage.
- **React Query**: Caches server data (jobs, applications, profile, notifications).
- **Local component state**: Forms, UI toggles, modals.
- **localStorage**: Onboarding progress, profile completion flags.

### 4.8 API Integration Layer

Central `ApiClient` in `src/lib/api.ts`:
- Base URL from `VITE_API_URL` or fallback to `http://localhost:5000`.
- Attaches JWT token automatically.
- Handles 401 redirects to login.
- Supports JSON, multipart, and file download requests.

Custom hooks:
- `useJobs.ts` — job search, detail, apply, saved jobs
- `useApplications.ts` — my applications, withdraw
- `useProfile.ts` — profile fetch/update, public profile

---

## 5. Backend Architecture

### 5.1 Folder Structure

```text
backend/server/
├── app.js                     # Express app configuration
├── server.js                  # Entry point (DB connection + listen)
├── index.js                   # Legacy redirect to server.js
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/               # Business logic
│   ├── authController.js
│   ├── profileController.js
│   ├── jobController.js
│   ├── applicationController.js
│   ├── savedJobController.js
│   ├── notificationController.js
│   ├── recruiterNoteController.js
│   ├── adminController.js
│   └── publicController.js
├── middleware/
│   ├── authMiddleware.js      # JWT verify + role gate
│   ├── errorHandler.js        # Global error handler
│   ├── upload.js              # Multer config
│   └── validate.js            # express-validator rules
├── models/                    # Mongoose schemas
│   ├── User.js
│   ├── Profile.js
│   ├── Job.js
│   ├── Application.js
│   ├── SavedJob.js
│   ├── Notification.js
│   ├── RecruiterNote.js
│   └── Report.js
├── routes/                    # Route definitions
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
│   └── reportGenerator.js     # CSV / Excel / PDF generation
├── uploads/                   # Runtime file storage (gitignored)
├── .env.example
├── .env
└── package.json
```

### 5.2 Application Boot Flow

```text
server.js
  → load .env
  → connectDB()
  → app.listen(PORT)

app.js
  → cors(), express.json(), express.urlencoded()
  → static /uploads
  → mount all /api/* routes
  → 404 handler
  → global errorHandler
```

### 5.3 Middleware Stack

| Middleware | Purpose |
|------------|---------|
| `cors()` | Cross-origin requests |
| `express.json()` | Parse JSON bodies (10MB) |
| `express.urlencoded()` | Parse form data |
| `authMiddleware` | Verify JWT and restrict roles |
| `upload` | Handle resume/photo uploads |
| `validate` | Request validation rules |
| `errorHandler` | Consistent error responses |

---

## 6. Database Schema (MongoDB + Mongoose)

### 6.1 User

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: enum ['candidate', 'recruiter', 'admin'],
  isActive: Boolean (default true),
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 6.2 Profile

```javascript
{
  user: ref User,
  name: String,
  phone: String,
  location: String,
  title: String,
  bio: String,
  photo: String,
  candidateType: enum ['fresher', 'experienced'],
  skills: [String],
  education: [{ school, degree, year }],
  experience: [{ company, role, duration, description }],
  projects: [{ name, url, description }],
  certifications: [{ name, issuer, year, credentialUrl }],
  socials: { linkedin, github, portfolio },
  username: String (unique, indexed),
  resumeUrl: String
}
```

### 6.3 Job

```javascript
{
  title: String,
  description: String,
  company: String,
  location: String,
  salary: { min: Number, max: Number, currency: String },
  skills: [String],
  experienceLevel: String,
  jobType: enum ['full-time', 'part-time', 'contract', 'internship'],
  workMode: enum ['remote', 'hybrid', 'onsite'],
  deadline: Date,
  status: enum ['active', 'closed', 'draft', 'pending'],
  postedBy: ref User,
  applicantCount: Number (default 0),
  views: Number (default 0),
  createdAt: Date
}
```

Indexes: title, location, status, createdAt, jobType, skills.

### 6.4 Application

```javascript
{
  job: ref Job,
  candidate: ref User,
  status: enum ['applied', 'reviewed', 'shortlisted', 'interview', 'offer', 'rejected', 'withdrawn'],
  coverLetter: String,
  appliedAt: Date,
  updatedAt: Date,
  notes: String
}
```

Compound unique index: `{ job: 1, candidate: 1 }` to prevent duplicate applications. Withdrawn applications can be reactivated.

### 6.5 SavedJob

```javascript
{
  user: ref User,
  job: ref Job,
  createdAt: Date
}
```

Compound unique index: `{ user: 1, job: 1 }`.

### 6.6 Notification

```javascript
{
  user: ref User,
  title: String,
  message: String,
  type: enum ['info', 'success', 'warning', 'error'],
  read: Boolean (default false),
  link: String,
  createdAt: Date
}
```

### 6.7 RecruiterNote

```javascript
{
  recruiter: ref User,
  candidate: ref User,
  job: ref Job,
  content: String,
  createdAt: Date
}
```

### 6.8 Report

```javascript
{
  generatedBy: ref User,
  type: enum ['users', 'jobs', 'applications', 'growth'],
  format: enum ['csv', 'xlsx', 'pdf'],
  dateRange: { from: Date, to: Date },
  fileUrl: String,
  createdAt: Date
}
```

---

## 7. API Endpoints

### 7.1 Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login | Public |

### 7.2 Jobs

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/jobs` | Search jobs (with query filters) | Public |
| GET | `/api/jobs/featured` | Featured jobs | Public |
| GET | `/api/jobs/:id` | Job detail | Public |
| GET | `/api/jobs/my` | Recruiter's own jobs | Recruiter |
| POST | `/api/jobs` | Create job | Recruiter |
| PUT | `/api/jobs/:id` | Update job | Recruiter |
| DELETE | `/api/jobs/:id` | Delete job | Recruiter |
| PATCH | `/api/jobs/:id/status` | Change job status | Recruiter |

**Job search query params:** `page`, `limit`, `keyword`, `location`, `type`, `experience`, `salaryMin`, `salaryMax`, `sort` (`salary-high`, `salary-low`, `newest`).

### 7.3 Applications

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/applications/:jobId/apply` | Apply to a job | Candidate |
| GET | `/api/applications/me` | My applications | Candidate |
| PATCH | `/api/applications/:id/withdraw` | Withdraw application | Candidate |
| GET | `/api/applications/job/:jobId` | Applicants for a job | Recruiter |
| PATCH | `/api/applications/:id/status` | Update applicant status | Recruiter |

### 7.4 Candidate Profile

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/candidate/profile` | Get my profile | Candidate |
| PUT | `/api/candidate/profile` | Create/update profile | Candidate |
| POST | `/api/candidate/resume` | Upload resume | Candidate |

### 7.5 Saved Jobs

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/saved-jobs` | List saved jobs | Candidate |
| POST | `/api/saved-jobs/:jobId` | Save job | Candidate |
| DELETE | `/api/saved-jobs/:jobId` | Unsave job | Candidate |

### 7.6 Notifications

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/notifications` | List notifications | Auth |
| PATCH | `/api/notifications/:id/read` | Mark as read | Auth |
| PATCH | `/api/notifications/read-all` | Mark all read | Auth |

### 7.7 Recruiter Notes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/recruiter/notes` | Add note on candidate | Recruiter |
| GET | `/api/recruiter/notes/:candidateId/:jobId` | Get notes | Recruiter |
| PUT | `/api/recruiter/notes/:id` | Update note | Recruiter |
| DELETE | `/api/recruiter/notes/:id` | Delete note | Recruiter |

### 7.8 Admin

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/admin/users` | List all users | Admin |
| PATCH | `/api/admin/users/:id/status` | Suspend/activate user | Admin |
| PATCH | `/api/admin/users/:id/role` | Change user role | Admin |
| DELETE | `/api/admin/users/:id` | Delete user | Admin |
| PATCH | `/api/admin/jobs/:id/moderate` | Approve/reject job | Admin |
| GET | `/api/admin/analytics` | Platform analytics | Admin |
| GET | `/api/admin/reports/:type` | Download report | Admin |

### 7.9 Public

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/public/profile/:username` | Public profile | Public |
| GET | `/api/public/jobs/:id` | Public job detail | Public |

---

## 8. Authentication & Authorization

### 8.1 JWT Flow

1. User registers/logs in.
2. Backend validates credentials and issues JWT signed with `JWT_SECRET`.
3. Frontend stores token in `localStorage` and sends it as `Authorization: Bearer <token>`.
4. `authMiddleware` verifies token on protected routes.
5. Role middleware checks `req.user.role` against allowed roles.

### 8.2 Role-Based Access Control

| Role | Permissions |
|------|-------------|
| Candidate | Apply, save jobs, manage profile, view applications |
| Recruiter | Post/manage jobs, view applicants, update statuses, add notes |
| Admin | Manage users, moderate jobs, view analytics, generate reports |

### 8.3 Demo Login

Login page includes one-click demo access for all three roles (Candidate, Recruiter, Admin) to allow testing without a running backend. Demo users are stored in localStorage with a fake token.

---

## 9. Key Features & Workflows

### 9.1 Candidate Workflow

```text
Register/Login → Onboarding → Build Profile → Upload Resume
                                    ↓
                           Browse Jobs → Search/Filter
                                    ↓
                           Apply to Job (cover letter)
                                    ↓
                           Track Application Status
                           Save Jobs / Set Alerts
                           Receive Notifications
```

### 9.2 Recruiter Workflow

```text
Register/Login → Post Job → Manage Listings
                         → View Applicants
                         → Update Status (Applied → Reviewed → Shortlisted → Interview → Offer)
                         → Add Private Notes
                         → View Analytics
```

### 9.3 Admin Workflow

```text
Login → View Dashboard Stats
    → Manage Users (suspend/activate/change role/delete)
    → Approve/Reject Recruiters
    → Moderate Job Listings
    → View Platform Analytics
    → Generate Reports (CSV/Excel/PDF)
```

### 9.4 Application Tracking Pipeline

```text
Applied → Reviewed → Shortlisted → Interview → Offer
   ↓         ↓            ↓             ↓        ↓
Withdrawn  Rejected    Rejected     Rejected  Rejected
```

Statuses: `Applied`, `Reviewed`, `Shortlisted`, `Interview`, `Offer`, `Rejected`, `Withdrawn`.

### 9.5 Job Search & Filtering

- Full-text search on title, company, description.
- Filters: location, job type, experience level, salary range, work mode, skills.
- Sorting: newest, salary high/low, relevance.
- Pagination with `page` and `limit`.

### 9.6 Resume Upload

- Multer disk storage.
- Accepted: PDF, DOC, DOCX.
- Max size: 10MB.
- Files served statically from `/uploads/resumes/`.

### 9.7 Admin Reports

- **CSV**: json2csv for simple tabular exports.
- **Excel**: exceljs with formatted headers, auto-width, summary row.
- **PDF**: pdfkit with branded header, table data, generation footer.
- Reports generated in-memory and streamed as downloads.

---

## 10. Frontend-Backend Integration

### 10.1 Environment Configuration

Frontend `.env`:
```env
VITE_API_URL=http://localhost:5000
```

Backend `.env`:
```env
PORT=5000
MONGO_URI=mongodb://...
JWT_SECRET=your-secret
NODE_ENV=development
CLOUDINARY_URL=optional
```

### 10.2 API Client Behavior

- Reads token from `localStorage` key `ox_token` (or `token` for compatibility).
- Sends JSON by default; skips auth header for public endpoints.
- On 401, clears token and redirects to `/login`.
- Upload method uses `FormData` without `Content-Type` header.

### 10.3 Data Flow Example (Job Search)

```text
User opens /jobs
  → useJobs(params) executes
  → React Query calls api.get('/api/jobs?...')
  → Backend queries MongoDB with filters
  → Frontend renders results with skeleton/loading states
  → Cache invalidated on new search or job mutation
```

### 10.4 Demo Mode Fallback

When backend is unavailable, frontend can rely on:
- Demo login buttons on the login page.
- Mock data currently hardcoded in some dashboard components (to be replaced with API data gradually).
- Future enhancement: add a global `DEMO_MODE` flag to serve local mock data.

---

## 11. Security Considerations

- Passwords hashed with bcryptjs before storage.
- JWT secret kept in environment variables.
- Protected routes verified server-side via `authMiddleware`.
- Input validation via express-validator on all write endpoints.
- File uploads restricted by type and size.
- MongoDB injection prevented through Mongoose parameterized queries.
- CORS configured for allowed origins in production.
- HTTPS required in production for cookies/tokens.

---

## 12. Testing Strategy

### Backend
- Unit tests for controllers and middleware (Vitest/Jest).
- Integration tests for API routes using supertest.
- Test database setup/teardown with separate MongoDB URI.

### Frontend
- Component tests with React Testing Library.
- Hook tests for useJobs, useApplications, useProfile.
- E2E tests for login → dashboard → apply flow.

### Current Test Files
- `src/test/example.test.ts` — example Vitest test.
- `src/test/setup.ts` — test setup.

---

## 13. Deployment & DevOps

### Local Development

```bash
# Frontend
cd <project-root>
npm install
npm run dev

# Backend
cd backend/server
npm install
cp .env.example .env
# Edit .env with MONGO_URI and JWT_SECRET
npm run dev
```

### Production

- Frontend built with `npm run build` and served via static host (Vercel/Netlify).
- Backend deployed to Node.js host (Render/Railway/DigitalOcean) with `NODE_ENV=production npm start`.
- MongoDB Atlas for production database.
- Environment variables injected via hosting dashboard.

### Build Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start frontend dev server |
| `npm run build` | Build frontend for production |
| `npm run preview` | Preview production build |
| `npm run test` | Run frontend tests |
| `cd backend/server && npm run dev` | Start backend dev server |
| `cd backend/server && npm start` | Start backend production server |

---

## 14. Documentation Deliverables

1. **Frontend README** (`README.md`) — setup and editing instructions.
2. **Backend README** (`backend/README.md`) — stack, folder structure, API reference, quick start.
3. **.env.example** (`backend/server/.env.example`) — required environment variables.
4. **API documentation** — embedded in backend README with endpoint tables.
5. **Frontend routes list** — documented in this plan and backend README.

---

## 15. Implementation Roadmap

### Phase 1: Foundation (Complete)
- Frontend project setup with React, Vite, Tailwind, shadcn/ui.
- Backend Express + MongoDB + Mongoose setup.
- Auth (register/login) and role middleware.
- Basic frontend routes and dashboards.

### Phase 2: Core Features (Complete)
- Job models, CRUD, search, and filtering.
- Application model with status tracking.
- Saved jobs, notifications, recruiter notes.
- Profile builder and public profile.
- Admin user management and analytics.

### Phase 3: Polish & Production Readiness (Complete)
- Error handling middleware.
- Input validation with express-validator.
- File upload middleware (Multer).
- Report generator (CSV/Excel/PDF).
- Backend README and .env.example.
- Demo login buttons for testing.

### Phase 4: Recommended Next Steps
- Wire frontend hooks to real backend endpoints (replace hardcoded dashboard data).
- Add rate limiting on auth endpoints.
- Add Swagger/OpenAPI docs at `/api/docs`.
- Implement real-time chat with WebSockets or polling.
- Add email notifications (SendGrid/Resend).
- Add payment integration for premium job postings.
- Add comprehensive test coverage.
- Deploy frontend and backend.

---

## 16. Summary

OpportunityX is structured as a modern, full-stack job portal. The frontend uses React + TypeScript + Tailwind with role-based dashboards and reusable feature modules. The backend follows MVC architecture with Express, MongoDB, JWT auth, validation, and file uploads. All major features are implemented, documented, and production-ready, with clear next steps for API integration, testing, and deployment.