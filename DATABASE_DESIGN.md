# Database Design

## Organization

`Organization` is the tenant root for company workspaces.

Key fields:

- `name`, `slug`, `logo`, `website`, `industry`, `companySize`, `country`,
  `timezone`.
- `subscriptionPlan`, `subscriptionStatus`.
- `owner`, `members`, and `invitations` for owner/admin/recruiter/hiring
  manager/interviewer/viewer access.
- `settings` for public application behavior, default job status, email sender
  names, and future custom domains.
- `branding` for primary/secondary colors, career-page copy, email branding,
  and company description.

Indexes cover slug uniqueness, owner lookups, active member lookups,
invitation lookups, subscription filters, and future custom domains.

## Tenant Scoping

Company-owned collections now include `organizationId` and compound indexes
around common access patterns. This includes jobs, applications,
notifications, interviews, messages, conversations, recruiter notes, reports,
saved jobs, profiles, parsed resumes, companies, and users.

The backend resolves organization context from `x-organization-id`,
route/query parameters, or the authenticated user's current organization.
Repository/controller filters append `organizationId` before reading or
mutating recruiter-owned resources, preventing cross-tenant object access.

## ParsedResume

`ParsedResume` stores backend-only candidate resume intelligence generated from
uploaded PDF or DOCX files.

Key fields:

- `candidate`: unique reference to `User`.
- `resumeUrl`, `fileName`, `mimeType`: uploaded resume metadata.
- `rawText`: sanitized extracted text, excluded from default query selection.
- `parsedData`: structured name, email, phone, skills, education, experience,
  projects, certifications, summary, links, years of experience, and tech stack.
- `atsScore`, `analysis`, `lastAnalyzedAt`: latest AI resume analysis output.
- `skills`, `techStack`, `experienceYears`, `education`, `experience`,
  `projects`, `certifications`: query-friendly parsed fields.

The model keeps parsed resume data separate from `Profile` so existing profile
APIs remain backward compatible.

## Interview

`Interview` stores the complete interview lifecycle.

Key fields:

- `application`, `candidate`, `job`, `recruiter`, `interviewers`.
- `title`, `description`, `stage`, `customStage`.
- `mode`, `meetingLink`, `location`.
- `scheduledAt`, `duration`, `timezone`.
- `status`: `scheduled`, `confirmed`, `completed`, `cancelled`, `no_show`,
  `rescheduled`.
- `feedback`: interviewer feedback with technical, communication, problem
  solving, culture fit, comments, and recommendation.
- `score`, `recommendation`, `rescheduleRequests`, `timeline`.
- `calendarProvider`, `externalCalendarId` for future Google/Outlook sync.

Indexes cover recruiter/date, candidate/date, job/status/date, and status/date
queries for dashboard and calendar performance.
