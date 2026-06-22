# Next Steps

- Configure durable object storage before enabling message attachments; the
  current paperclip control remains disabled.
- Add integration tests backed by a disposable MongoDB instance for
  candidate/recruiter authorization, unread counters, and socket events.
- Add message edit/delete/reaction controls to the existing bubble UI. Backend
  APIs and socket events are already available.
- Consider route-level code splitting; the current production bundle triggers
  Vite's large-chunk warning.
- Review existing dependency audit findings separately before production
  deployment.
