# AI Architecture

OpportunityX AI features run only through the backend. The frontend never
receives or stores `OPENAI_API_KEY`.

## Provider Setup

- `OPENAI_API_KEY` enables OpenAI-backed responses.
- `AI_MODEL` defaults to `gpt-4.1-mini`.
- If `OPENAI_API_KEY` is missing, AI endpoints return a clean unavailable
  response instead of fake content.
- The provider boundary lives in `backend/src/services/ai.service.js` so a
  future provider can replace the OpenAI call without changing controllers.

## Endpoints

- `POST /api/ai/career-assistant` for candidate career Q&A.
- `POST /api/ai/resume-analyze` for candidate resume/profile analysis.
- `GET /api/ai/job-recommendations` for candidate job matching.
- `POST /api/ai/recruiter/job-description` for job description previews.
- `POST /api/ai/recruiter/interview-questions` for screening questions.
- `POST /api/ai/recruiter/candidate-summary` for recruiter summaries.
- `GET /api/ai/recruiter/applications/:applicationId/match-score` for
  advisory application scoring.
- `GET /api/ai/admin/insights` for aggregate admin insights.

## Privacy Notes

- AI routes require authentication and role authorization.
- Prompts are size-limited and scrub obvious password/token/key patterns.
- Passwords, reset tokens, private chat history, and full private
  conversations are not sent to the AI provider.
- Candidate match scores are advisory only and must not be used for automatic
  rejection.

## Limitations

- Resume PDF text extraction is not implemented yet; analysis uses profile
  metadata and any submitted text.
- Chat attachments are stored locally under `/uploads/chat`; production should
  move them to durable object storage.
- Multi-user AI/socket integration tests are still needed.

## Future Improvements

- Add provider-specific structured output validation.
- Add prompt/version audit logging without storing sensitive prompt data.
- Add caching for repeated aggregate admin insights.
- Add configurable organization policy for which profile fields may be sent to
  an AI provider.
