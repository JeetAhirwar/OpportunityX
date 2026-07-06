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
