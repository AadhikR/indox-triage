# Inbox Triage

Inbox Triage is a Gmail-native attention agent that helps people understand which messages need action, why they matter, and what to do next.

> **One-line pitch:** Inbox Triage turns every open Gmail thread into a clear decision: how urgently it needs you, why, and what to do next.

## Working today

- Native Gmail contextual sidebar
- Full open-thread context with bounded data handling
- OpenRouter structured analysis with deterministic fallback
- Urgent, Needs response, FYI, and Can wait classification
- Summary, deadline, commitment, and recommended-action extraction
- User-controlled re-analysis without sending or changing email
- AI-assisted reply drafts that open in Gmail for review and never auto-send
- Optional Chrome hover previews and editable quick replies for visible Gmail inbox rows
- Private recently analyzed digest with one-click links back to Gmail
- User priority corrections that personalize future analysis
- Auth0-protected companion dashboard

## Product direction

The agent classifies email threads into four attention levels:

- Urgent
- Needs response
- FYI
- Can wait

It uses full-thread context to produce a short summary, identify deadlines and commitments, recommend an action, and prepare an editable reply draft when requested.

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
- Gmail-native editable reply draft creation (implemented)
- Chrome hover extension with a local, server-side OpenRouter endpoint (implemented)

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
deadline, commitments, next action, and a user-triggered reply-drafting action with Gmail's native CardService. The
Next.js companion app provides Auth0-protected onboarding and dashboard surfaces.

The installable Apps Script source is in [`gmail-addon`](./gmail-addon). Follow
that folder's README to create a test deployment in your Gmail account. Google
Marketplace publication is not required for local hackathon testing.

The optional hover interaction is in [`chrome-extension`](./chrome-extension).
It uses only the sender, subject, and snippet visible in an inbox row. It can
prepare an editable quick reply and insert it into Gmail's native composer, where
the user makes the final send. The native add-on remains the higher-confidence
option for full-thread analysis and drafting.

## Demo and judging

See [`DEMO.md`](./DEMO.md) for a 45-second demo script, four safe sample emails,
expected results, privacy language, and the presentation recovery plan.

The digest and priority-learning features store a bounded amount of per-user
metadata in Apps Script User Properties. Full email bodies are never retained,
and the user can clear the saved digest and learning data from the add-on homepage.
