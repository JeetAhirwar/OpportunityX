# AI Architecture

OpportunityX AI features run only through the backend. The frontend never
receives or stores provider API keys, and it never calls AI vendors directly.

## Supported Providers

- Google Gemini, recommended primary free setup.
- OpenRouter, low-cost fallback for many hosted models.
- Groq, fast free/low-cost fallback for supported open models.
- OpenAI, optional paid fallback.

Provider files live in `backend/src/services`:

- `ai.service.js` orchestrates provider priority, fallback, sanitization, JSON
  cleanup, and normalized responses.
- `ai.gemini.provider.js`
- `ai.openrouter.provider.js`
- `ai.groq.provider.js`
- `ai.openai.provider.js`
- `ai.provider-error.js`
- `ai.prompts.js`

## Fallback Flow

1. `AI_PROVIDER` is tried first.
2. Providers in `AI_FALLBACK_PROVIDERS` are tried in order.
3. Missing keys, invalid keys, quota/rate limits, network failures, provider
   outages, model errors, and malformed responses are handled without exposing
   raw vendor errors to the frontend.
4. If every provider fails, the API returns:

```json
{
  "success": false,
  "provider": null,
  "message": "AI helper is temporarily unavailable. Please try again later.",
  "fallback": true
}
```

When all attempted providers are quota or rate limited, the message is:

```text
Free AI quota is currently unavailable. Please try again later or switch provider.
```

## Environment Variables

```env
AI_PROVIDER=gemini
AI_FALLBACK_PROVIDERS=openrouter,groq,openai
AI_MODEL=gemini-1.5-flash
AI_DAILY_LIMIT_PER_USER=50

GEMINI_API_KEY=replace_with_gemini_api_key
OPENROUTER_API_KEY=replace_with_openrouter_api_key
OPENROUTER_MODEL=deepseek/deepseek-chat
GROQ_API_KEY=replace_with_groq_api_key
GROQ_MODEL=llama-3.1-8b-instant
OPENAI_API_KEY=replace_with_openai_api_key
OPENAI_MODEL=gpt-4.1-mini
```

Recommended free setup:

```env
AI_PROVIDER=gemini
AI_FALLBACK_PROVIDERS=openrouter,groq
AI_MODEL=gemini-1.5-flash
```

## Getting Keys

- Gemini: create a key in Google AI Studio, then set `GEMINI_API_KEY`.
- OpenRouter: create a key in OpenRouter account settings, then set
  `OPENROUTER_API_KEY` and choose `OPENROUTER_MODEL`.
- Groq: create a key in the Groq console, then set `GROQ_API_KEY` and
  `GROQ_MODEL`.
- OpenAI: optionally set `OPENAI_API_KEY` and `OPENAI_MODEL`.

Use placeholders only in committed example files. Do not commit real keys.

## Endpoints

Existing route paths are preserved:

- `POST /api/ai/career-assistant`
- `POST /api/ai/resume-analyze`
- `GET /api/ai/job-recommendations`
- `POST /api/ai/recruiter/job-description`
- `POST /api/ai/recruiter/interview-questions`
- `POST /api/ai/recruiter/candidate-summary`
- `GET /api/ai/recruiter/applications/:applicationId/match-score`
- `GET /api/ai/admin/insights`

## Privacy Notes

- AI routes require authentication and role authorization.
- Prompts are size-limited and scrub obvious password, token, secret, and API
  key patterns.
- Passwords, reset tokens, private chat history, and full private
  conversations are not sent to providers.
- Candidate match prompts use minimized profile/job fields and are advisory
  only.
- Logs include provider name and failure category only, not prompts or secrets.

## Limitations

- Resume PDF text extraction is not implemented yet; analysis uses profile
  metadata and any submitted text.
- Provider JSON mode support varies. OpportunityX requests JSON when possible,
  safely cleans common markdown-fenced JSON, and falls back to structured
  defaults if parsing fails.
- In-memory AI rate limiting is per process. Use a distributed store before
  horizontal scaling.
