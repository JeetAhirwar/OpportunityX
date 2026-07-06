# Database Design

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
