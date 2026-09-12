# Indox Triage

Indox Triage is a Gmail-native attention agent that helps people understand which messages need action, why they matter, and what to do next.

> **One-line pitch:** Indox turns every open Gmail thread into a clear decision: how urgently it needs you, why, and what to do next.

## Working today

- Native Gmail contextual sidebar
- Full open-thread context with bounded data handling
- OpenRouter structured analysis with deterministic fallback
- Urgent, Attention required, Moderate, and Take your time classification
- Summary, deadline, commitment, and recommended-action extraction
- User-controlled re-analysis without sending or changing email
- Auth0-protected companion dashboard

## Product direction

The agent classifies email threads into four attention levels:

- Urgent
- Attention required
- Moderate
- Take your time

It uses full-thread context to produce a short summary, identify deadlines and commitments, and recommend an action. Reply drafting is an optional future extension.

## Local development

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

Copy `.env.example` to `.env.local` before adding integrations. Never commit real credentials.

## Planned integrations

- Auth0 for secure sign-in (implemented; requires local credentials)
- Gmail Workspace Add-on for native current-thread access (implemented)
- OpenRouter for structured inbox analysis (implemented in the Gmail add-on)
- Gmail draft creation after user approval (optional future extension)

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

The user-facing agent lives in Gmail's contextual side panel. The Apps Script
add-on reads bounded context from the currently open thread, requests structured
analysis from OpenRouter, validates the result, and renders the priority, summary,
deadline, commitments, and next action with Gmail's native CardService. The
Next.js companion app provides Auth0-protected onboarding and dashboard surfaces.

The installable Apps Script source is in [`gmail-addon`](./gmail-addon). Follow
that folder's README to create a test deployment in your Gmail account. Google
Marketplace publication is not required for local hackathon testing.

## Demo and judging

See [`DEMO.md`](./DEMO.md) for a 45-second demo script, four safe sample emails,
expected results, privacy language, and the presentation recovery plan.
