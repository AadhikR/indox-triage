# Inbox Triage

Inbox Triage is a Gmail-native attention agent that helps people understand which messages need action, why they matter, and what to do next.

> **One-line pitch:** Inbox Triage turns every open Gmail thread into a clear decision: how urgently it needs you, why, and what to do next.

## Use the Chrome extension

### 1. Install the local service

You need a current Node.js LTS release and Google Chrome. Clone the repository,
install its dependencies, and create your local environment file:

```bash
git clone https://github.com/AadhikR/indox-triage.git
cd indox-triage
npm install
cp .env.example .env.local
```

On Windows PowerShell, use `Copy-Item .env.example .env.local` instead of `cp`.

Add your OpenRouter key to `.env.local` to enable AI classifications and quick
replies:

```dotenv
OPENROUTER_API_KEY=your_key_here
OPENROUTER_MODEL=google/gemini-3.1-flash-lite
```

Never commit `.env.local` or paste a real API key into an issue.

Start the local service and leave the terminal running:

```bash
npm run dev
```

Confirm that [http://localhost:3000](http://localhost:3000) opens before
continuing. Without an OpenRouter key, attention classification still uses a
deterministic local fallback and quick replies use a generic safe draft.

### 2. Load the extension in Chrome

1. Open `chrome://extensions`.
2. Enable **Developer mode** in the top-right corner.
3. Select **Load unpacked**.
4. Choose the repository's `chrome-extension` folder—not the repository root.
5. Open or refresh [Gmail](https://mail.google.com/).

Chrome does not automatically refresh an unpacked extension after its files
change. When you pull an update, select **Reload** on the Inbox Triage extension
card and refresh Gmail.

### 3. Triage an email

1. Move the pointer over a Gmail inbox row and wait about half a second.
2. Inbox Triage displays one of four attention levels: **Urgent**, **Needs
   response**, **FYI**, or **Can wait**.
3. Review the summary, reasoning, recommended action, and detected deadline.
4. Select **Open email for full context** when you want to inspect the original
   conversation.

The hover analysis uses only the sender, subject, and snippet already visible in
the inbox. It does not claim to have read unopened message bodies.

### 4. Prepare a quick reply

1. Select **Quick reply** inside the hover panel.
2. Review and edit the generated message.
3. Select **Insert reply in Gmail**.
4. Inbox Triage opens the conversation and places the draft in Gmail's native
   reply composer.
5. Review it once more and press Gmail's **Send** button yourself.

Inbox Triage never presses Send automatically and rejects generated drafts that
attempt to invent decisions or commitments for the user.

### Troubleshooting

- **No hover panel:** reload the extension at `chrome://extensions`, then refresh
  Gmail.
- **Local app unavailable:** run `npm run dev` and confirm localhost port 3000 is
  reachable.
- **Only a generic result appears:** add a valid `OPENROUTER_API_KEY` and restart
  the local service.
- **Gmail does not receive the reply:** Gmail's interface can change. Open the
  message manually and use the native Inbox Triage sidebar's **Draft reply**
  action as a fallback.

For extension-specific implementation notes, see
[`chrome-extension/README.md`](./chrome-extension/README.md).

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
