# OpportunityX Chat API

The complete API index is in [`docs/api-documentation.md`](docs/api-documentation.md).

Chat endpoints are mounted at `/api/chat` and require the OpportunityX bearer
token. Conversation creation requires an `applicationId`; the backend derives
the candidate, recruiter, and job from that application and rejects unrelated
users and administrators.

Socket.IO connects to the OpportunityX backend using:

```js
io(VITE_SOCKET_URL, { auth: { token } });
```

The merged server supports conversation rooms, personal user rooms, messages,
typing, reactions, edit/delete, seen state, online users, unread counts, and
notification events.
