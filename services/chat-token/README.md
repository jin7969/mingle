# Chat token service

This AWS SAM service issues short-lived Amazon IVS Chat tokens. AWS credentials stay in the Lambda execution role and must never be exposed to the mobile app or overlay.

## Local validation

Install Docker, AWS CLI, and AWS SAM CLI, then create the ignored local environment file:

```bash
cp services/chat-token/env.local.example.json services/chat-token/env.local.json
npm run sam:build
npm run sam:local
```

`POST /chat/token` accepts:

```json
{
  "nickname": "guest_01",
  "mode": "participant"
}
```

Use `mode: "overlay"` for a receive-only OBS overlay token.
