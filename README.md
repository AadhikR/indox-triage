# Indox Triage

Indox Triage is a Gmail-native attention agent that helps people understand which messages need action, why they matter, and what to do next.

## Product direction

The agent classifies email threads into four attention levels:

- Urgent
- Attention required
- Moderate
- Take your time

It will use full-thread context to produce a short summary, identify deadlines and commitments, recommend an action, and prepare a reply draft for user approval.

## Local development

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

Copy `.env.example` to `.env.local` before adding integrations. Never commit real credentials.

## Planned integrations

- Auth0 for secure sign-in
- Gmail API for message and thread access
- OpenRouter for inbox analysis
- Gmail draft creation after user approval
