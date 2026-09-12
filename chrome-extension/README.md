# Inbox Triage Hover extension

This optional Chrome extension adds the inbox-row hover interaction that Gmail
Workspace Add-ons cannot provide. It reads only the sender, subject, and snippet
already visible in a Gmail inbox row. Full-thread analysis and reply drafting
remain in the native Inbox Triage sidebar.

## Run locally

1. Start the companion app with `npm run dev` and keep it running at
   `http://localhost:3000`.
2. In `.env.local`, add `OPENROUTER_API_KEY` and optionally `OPENROUTER_MODEL`.
   Without a key, the endpoint returns a deterministic local classification.
3. Open `chrome://extensions` in Chrome.
4. Enable **Developer mode**.
5. Select **Load unpacked** and choose this `chrome-extension` directory.
6. Refresh Gmail, then hover over an inbox row for about half a second.

## Privacy and limitations

- The extension sends visible row metadata to the local Next.js endpoint only.
- The OpenRouter key stays in `.env.local` and is never bundled into Chrome.
- Results are cached in extension-local storage for 10 minutes.
- Hover analysis is intentionally labelled as a visible-row preview; open the
  email for the native add-on's bounded full-thread analysis.
- Gmail's DOM is not a public API, so the row selectors may need maintenance if
  Gmail changes its inbox markup.
- The API route is intended for local hackathon use. Add authentication and rate
  limiting before deploying it publicly.
