

# OpportunityX -- Enhanced Job Portal Implementation

## Summary
Upgrade the existing frontend with enhanced Profile Builder (photo, professional title, Fresher/Experienced toggle, certifications), a public profile page, improved application tracking with withdraw support, job search pagination, and API-ready architecture throughout.

---

## Changes

### 1. Enhanced Profile Builder
**File: `src/features/profile/ProfileBuilder.tsx`** (major rewrite)

- Add **profile photo** upload with avatar preview (circular crop area)
- Add **Professional Title** field (e.g. "Full Stack Developer")
- Add **Candidate Type** selector: Fresher / Experienced
  - When "Fresher" is selected: Experience section is hidden/disabled with a subtle message
  - When "Experienced" is selected: Experience section becomes required with validation
- Add **Certifications** section (name, issuer, year, credential URL)
- Update profile completeness calculation to include new fields
- Use the centralized `api` client instead of raw `fetch` for the save call
- Add per-field error display (red border + message under each input)
- Add loading skeleton while fetching existing profile from API

### 2. Public Profile Page
**New file: `src/pages/PublicProfile.tsx`**

A read-only profile view at `/profile/:username` styled like LinkedIn/Naukri:
- Banner area with gradient background
- Profile photo, name, professional title, location
- Skills displayed as badges
- Education and Experience as timeline cards
- Projects as cards with links
- Certifications section
- Resume download button (if public)
- Social links (LinkedIn, GitHub, Portfolio)
- Uses `api.get("/profile/:username")` for data

**Update: `src/App.tsx`** -- Add route `/profile/:username`

### 3. Enhanced My Applications
**File: `src/features/applications/MyApplications.tsx`** (update)

- Add **Withdraw Application** button with confirmation dialog
- Add application **status timeline** (visual stepper: Applied > Reviewed > Shortlisted > Interview > Offer)
- Add expandable row to show job details and timeline
- Add pagination (10 per page)
- Wire up to `api.get("/candidate/applications")` and `api.patch` for withdraw

### 4. Job Search Enhancements
**File: `src/pages/Jobs.tsx`** (update)

- Add **pagination** component (page numbers + next/prev)
- Make filters functional (currently decorative checkboxes)
- Add **sorting** that actually filters the list
- Wire search to `api.get("/jobs", { params })` with query string

### 5. Job Detail -- Apply Flow
**File: `src/pages/JobDetail.tsx`** (update)

- "Apply Now" button opens a confirmation dialog
- Shows cover letter textarea (optional)
- On submit, calls `api.post("/jobs/:id/apply")`
- After applying, button changes to "Applied" (disabled, green)
- "Save" button toggles bookmark state via API

### 6. Recruiter -- Applicant Resume Download
**File: `src/features/applications/ApplicantManagement.tsx`** (update)

- Add **Download Resume** button per applicant
- Add candidate profile preview in the drawer showing full profile data
- Add notes textarea that persists per candidate

### 7. Type Definitions
**New file: `src/types/index.ts`**

Centralized TypeScript interfaces for all entities:
- `Profile`, `Job`, `Application`, `User`, `Certification`, `Notification`, `Message`
- Shared across all features for type safety

---

## Technical Details

### Candidate Type Logic (Fresher/Experienced)
```text
candidateType === "fresher"
  -> Experience card shows disabled overlay with message: "Experience section is not required for freshers"
  -> Experience array is cleared on save
  -> Validation skips experience

candidateType === "experienced"
  -> Experience section is fully enabled
  -> At least one experience entry is required
  -> Validation enforces company + role + duration
```

### Profile Completeness Recalculation
```text
Name: 8%  |  Phone: 8%  |  Location: 8%  |  Title: 8%
Bio: 10%  |  Photo: 8%  |  Skills: 12%  |  Education: 10%
Experience (if experienced): 12%  |  Projects: 8%
Certifications: 4%  |  Socials: 4%
```

### API Endpoints Referenced
All calls go through the centralized `api` client (`src/lib/api.ts`). The backend endpoints expected:

- `GET /candidate/profile` -- fetch saved profile
- `PUT /candidate/profile` -- save/update profile
- `POST /candidate/resume` -- upload resume (multipart)
- `GET /profile/:username` -- public profile (no auth)
- `GET /candidate/applications` -- list applications
- `PATCH /candidate/applications/:id/withdraw` -- withdraw
- `GET /jobs?page=&limit=&type=&location=&salary=&sort=` -- search
- `POST /jobs/:id/apply` -- apply to job
- `POST /candidate/saved-jobs/:id` -- bookmark toggle
- `GET /recruiter/applicants/:id/resume` -- download resume

### New Route Addition
```text
/profile/:username  ->  PublicProfile (public, no auth required)
```

### File Structure After Changes
```text
src/
  types/
    index.ts                    (NEW)
  features/
    profile/
      ProfileBuilder.tsx        (ENHANCED)
      ResumeUpload.tsx          (existing)
      CompanyProfile.tsx        (existing)
    applications/
      MyApplications.tsx        (ENHANCED)
      ApplicantManagement.tsx   (ENHANCED)
    jobs/
      PostJob.tsx               (existing)
      ManageJobs.tsx            (existing)
      SavedJobs.tsx             (existing)
      JobRecommendations.tsx    (existing)
      JobAlerts.tsx             (existing)
  pages/
    PublicProfile.tsx           (NEW)
    Jobs.tsx                    (ENHANCED)
    JobDetail.tsx               (ENHANCED)
```

