

# OpportunityX -- Enterprise Upgrade

## Summary
This plan adds the missing production-grade pieces: a custom OX logo component, complete backend API layer (Job, Application, SavedJob, Notification, RecruiterNote schemas + controllers + routes with file uploads, admin reports, and analytics aggregation), SEO infrastructure for the frontend, and enhanced frontend wiring to replace hardcoded data with API-ready hooks.

---

## What Already Exists (No Changes Needed)
- Auth system (JWT + bcrypt + role middleware)
- Profile Builder with Fresher/Experienced logic, certifications, photo upload
- Job search with filters, sorting, pagination
- Job detail with apply dialog + cover letter
- All 3 dashboards (Candidate, Recruiter, Admin) with sub-pages
- Chat UI, Notifications, Settings, Onboarding modal
- Public profile page at /profile/:username
- Application tracking with status timeline + withdraw

## What This Plan Adds

---

### 1. Custom OX Logo Component
**New file: `src/components/common/OXLogo.tsx`**

SVG monogram combining "OX" letterforms with an integrated upward-arrow motif on the X, using the blue-purple gradient from the design system. Replaces the Briefcase icon in the Navbar.

**Update: `src/components/layout/Navbar.tsx`** -- Swap `<Briefcase>` icon for `<OXLogo />`.

---

### 2. Backend -- MongoDB Schemas
All in `backend/server/models/`:

- **Job.js** -- title, description, company, location, salary (min/max/currency), skills[], experienceLevel, jobType (full-time/part-time/contract/internship), workMode (remote/hybrid/onsite), deadline, status (active/closed/draft/pending), postedBy (ref User), applicantCount, views. Indexes on title, location, status, createdAt.
- **Application.js** -- job (ref Job), candidate (ref User), status (applied/reviewed/shortlisted/interview/offer/rejected/withdrawn), coverLetter, appliedAt, updatedAt, notes. Compound unique index on {job, candidate} to prevent duplicates.
- **SavedJob.js** -- user (ref User), job (ref Job). Compound unique index on {user, job}.
- **Notification.js** -- user (ref User), title, message, type (info/success/warning/error), read (default false), link, createdAt.
- **RecruiterNote.js** -- recruiter (ref User), candidate (ref User), job (ref Job), content, createdAt.
- **Report.js** -- generatedBy (ref User), type (users/jobs/applications/growth), format (csv/xlsx/pdf), dateRange, fileUrl, createdAt.

**Update: `backend/server/models/Profile.js`** -- Add fields: title (String), photo (String), candidateType (enum fresher/experienced), username (String, unique, indexed), resumeUrl (String), certifications array.

**Update: `backend/server/models/User.js`** -- Add fields: isActive (Boolean, default true), lastLogin (Date).

---

### 3. Backend -- Controllers & Routes

**New controllers:**
- **jobController.js** -- CRUD for jobs, search with query params (page, limit, keyword, location, type, experience, salary, sort), get by ID, close/reopen job. Recruiter-only for create/edit/delete.
- **applicationController.js** -- Apply (with duplicate check), list candidate applications, list applicants per job (recruiter), update status (recruiter), withdraw (candidate), download resume.
- **savedJobController.js** -- Toggle save, list saved jobs.
- **notificationController.js** -- List user notifications, mark read, mark all read.
- **recruiterNoteController.js** -- Create/update note per candidate-job pair.
- **adminController.js** -- List/filter users, suspend/activate, change role, delete user. Job moderation (approve/reject/feature). Platform analytics (aggregation pipeline for counts, growth, role distribution). Report generation.
- **publicController.js** -- Get public profile by username, get public job detail.

**New routes (all in `backend/server/routes/`):**
- `jobRoutes.js` -- mounted at `/api/jobs`
- `applicationRoutes.js` -- mounted at `/api/applications`
- `savedJobRoutes.js` -- mounted at `/api/saved-jobs`
- `notificationRoutes.js` -- mounted at `/api/notifications`
- `recruiterNoteRoutes.js` -- mounted at `/api/recruiter/notes`
- `adminRoutes.js` -- mounted at `/api/admin`
- `publicRoutes.js` -- mounted at `/api/public`

**Update: `backend/server/index.js`** -- Register all new routes, add `helmet`, `express-validator`, and static file serving for uploads.

---

### 4. Backend -- File Upload Middleware
**New file: `backend/server/middleware/upload.js`**

Uses `multer` with disk storage for resume PDFs and profile photos. Validates file type and size (5MB for images, 10MB for PDFs). Stores in `backend/server/uploads/` with subdirectories for resumes and photos.

---

### 5. Backend -- Admin Report Generation
**New file: `backend/server/utils/reportGenerator.js`**

Utility functions to generate:
- **CSV** using `json2csv` -- user lists, job lists, application summaries
- **Excel** using `exceljs` -- formatted sheets with headers, auto-width columns, summary row
- **PDF** using `pdfkit` -- branded header, tabular data, footer with generation date

Reports are generated on-demand via admin endpoints and streamed as downloadable files with appropriate Content-Type and Content-Disposition headers.

**Update: `backend/server/package.json`** -- Add dependencies: `multer`, `helmet`, `express-validator`, `json2csv`, `exceljs`, `pdfkit`.

---

### 6. Backend -- Analytics Aggregation
Inside `adminController.js`, use MongoDB aggregation pipelines for:
- User count by role, monthly signups, active vs inactive
- Job count by status, type, location, monthly postings
- Application count by status, conversion rates (applied-to-interview ratio)
- Recruiter performance (jobs posted, applicants received, avg time-to-fill)

---

### 7. Frontend -- SEO Infrastructure
**New file: `src/components/common/SEOHead.tsx`**

A reusable component using `document.title` and dynamic meta tag injection for:
- Title, description, canonical URL
- Open Graph tags (og:title, og:description, og:image, og:url)
- Twitter Card meta tags
- JSON-LD structured data (passed as prop)

**Update pages to use SEOHead:**
- `PublicProfile.tsx` -- Person schema JSON-LD
- `JobDetail.tsx` -- JobPosting schema JSON-LD
- `Index.tsx` -- WebSite schema JSON-LD
- `Jobs.tsx` -- ItemList schema for job listings

**New files:**
- `public/robots.txt` -- Allow all, reference sitemap
- `public/sitemap.xml` -- Static template with main routes (/, /jobs, /login, /register)

---

### 8. Frontend -- API Hooks Layer
**New file: `src/hooks/useJobs.ts`**

Custom hooks wrapping TanStack React Query + the `api` client:
- `useJobs(params)` -- paginated job search
- `useJob(id)` -- single job detail
- `useApply(jobId)` -- mutation for applying
- `useSavedJobs()` -- list saved jobs
- `useToggleSave(jobId)` -- mutation for bookmark toggle

**New file: `src/hooks/useApplications.ts`**
- `useMyApplications(params)` -- paginated list
- `useWithdraw(appId)` -- mutation

**New file: `src/hooks/useProfile.ts`**
- `useProfile()` -- fetch current user profile
- `useSaveProfile()` -- mutation
- `usePublicProfile(username)` -- public profile fetch

These hooks handle loading, error, and cache invalidation states, making it trivial to swap from local data to real API data in each page.

---

### 9. Frontend -- Navbar Logo Update
**Update: `src/components/layout/Navbar.tsx`** -- Replace the Briefcase icon block with the new `<OXLogo />` SVG component showing the branded monogram.

---

## Technical Details

### File Structure After Changes

```text
backend/server/
  models/
    User.js          (ENHANCED - isActive, lastLogin)
    Profile.js       (ENHANCED - title, photo, candidateType, username, resumeUrl, certifications)
    Job.js           (NEW)
    Application.js   (NEW)
    SavedJob.js      (NEW)
    Notification.js  (NEW)
    RecruiterNote.js (NEW)
    Report.js        (NEW)
  controllers/
    authController.js     (existing)
    profileController.js  (existing)
    jobController.js      (NEW)
    applicationController.js (NEW)
    savedJobController.js (NEW)
    notificationController.js (NEW)
    recruiterNoteController.js (NEW)
    adminController.js    (NEW)
    publicController.js   (NEW)
  routes/
    authRoutes.js         (existing)
    profileRoutes.js      (existing)
    jobRoutes.js          (NEW)
    applicationRoutes.js  (NEW)
    savedJobRoutes.js     (NEW)
    notificationRoutes.js (NEW)
    recruiterNoteRoutes.js (NEW)
    adminRoutes.js        (NEW)
    publicRoutes.js       (NEW)
  middleware/
    authMiddleware.js     (existing)
    upload.js             (NEW)
  utils/
    reportGenerator.js    (NEW)
  uploads/                (NEW - gitignored)

src/
  components/common/
    OXLogo.tsx            (NEW)
    SEOHead.tsx           (NEW)
  hooks/
    useJobs.ts            (NEW)
    useApplications.ts    (NEW)
    useProfile.ts         (NEW)
  pages/
    PublicProfile.tsx     (UPDATE - add SEOHead)
    JobDetail.tsx         (UPDATE - add SEOHead)
    Index.tsx             (UPDATE - add SEOHead)
    Jobs.tsx              (UPDATE - add SEOHead)
  components/layout/
    Navbar.tsx            (UPDATE - OXLogo)

public/
  robots.txt              (NEW)
  sitemap.xml             (NEW)
```

### API Endpoint Summary

```text
Public:
  GET  /api/public/profile/:username
  GET  /api/public/jobs/:id
  GET  /api/jobs?page=&limit=&keyword=&location=&type=&experience=&salaryMin=&salaryMax=&sort=

Candidate:
  GET/PUT  /api/candidate/profile
  POST     /api/candidate/resume        (multipart)
  POST     /api/applications/:jobId/apply
  GET      /api/applications/me
  PATCH    /api/applications/:id/withdraw
  POST/DELETE /api/saved-jobs/:jobId
  GET      /api/saved-jobs

Recruiter:
  POST     /api/jobs
  PUT      /api/jobs/:id
  DELETE   /api/jobs/:id
  PATCH    /api/jobs/:id/status
  GET      /api/applications/job/:jobId
  PATCH    /api/applications/:id/status
  POST     /api/recruiter/notes
  GET      /api/recruiter/notes/:candidateId/:jobId

Admin:
  GET      /api/admin/users
  PATCH    /api/admin/users/:id/status
  PATCH    /api/admin/users/:id/role
  DELETE   /api/admin/users/:id
  PATCH    /api/admin/jobs/:id/moderate
  GET      /api/admin/analytics
  GET      /api/admin/reports/:type?format=csv|xlsx|pdf

Shared:
  GET      /api/notifications
  PATCH    /api/notifications/:id/read
  PATCH    /api/notifications/read-all
```

### Application Schema (Duplicate Prevention)

```text
Compound unique index: { job: 1, candidate: 1 }
On apply attempt:
  1. Check if Application with same job+candidate exists
  2. If exists and status !== "withdrawn" -> return 409 Conflict
  3. If exists and status === "withdrawn" -> reactivate to "applied"
  4. If not exists -> create new Application
```

### Report Generation Flow

```text
Admin clicks "Download Report" -> selects type + format + optional date range
  -> GET /api/admin/reports/users?format=xlsx&from=2025-01-01&to=2025-12-31
  -> Backend runs aggregation pipeline
  -> Generates file in memory (no disk write)
  -> Streams response with headers:
     Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
     Content-Disposition: attachment; filename="users-report-2025.xlsx"
```

