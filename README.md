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

- Auth0 for secure sign-in (implemented; requires local credentials)
- Gmail API for message and thread access
- OpenRouter for inbox analysis
- Gmail draft creation after user approval

## Auth0 setup

Create an Auth0 **Regular Web Application**, then add these URLs in its settings:

- Allowed Callback URL: `http://localhost:3000/auth/callback`
- Allowed Logout URL: `http://localhost:3000`
- Allowed Web Origin: `http://localhost:3000`

Copy `.env.example` to `.env.local` and fill in `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`,
`AUTH0_CLIENT_SECRET`, and a 64-character hexadecimal `AUTH0_SECRET`. With these
values present, `/dashboard` is protected automatically. Without them, the app
stays available in clearly labelled demo mode for development.

## Gmail sidebar direction

The user-facing agent will live in Gmail's contextual side panel. The Next.js app
acts as the secure account and analysis backend; the Gmail Workspace Add-on will
pass the currently open message ID to this backend and render the returned priority,
thread summary, deadline, and next action in Gmail's native card interface.
