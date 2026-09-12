# Inbox Triage extension

This optional Chrome extension adds the inbox-row hover interaction that Gmail
Workspace Add-ons cannot provide. It reads only the sender, subject, and snippet
already visible in a Gmail inbox row. The hover card can generate a short,
editable quick reply, open the email, and insert the reply into Gmail's composer.
The user reviews it and presses Gmail's Send button; Inbox Triage never sends it
automatically. Full-thread analysis and higher-context drafting remain available
in the native Inbox Triage sidebar.

## Install and run locally

1. From the repository root, run `npm install`.
2. Copy `.env.example` to `.env.local`.
3. In `.env.local`, add `OPENROUTER_API_KEY` and optionally `OPENROUTER_MODEL`.
   Without a key, the endpoint returns a deterministic local classification.
4. Run `npm run dev` and keep the local service running at
   `http://localhost:3000`.
5. Open `chrome://extensions` in Chrome.
6. Enable **Developer mode**.
7. Select **Load unpacked** and choose this `chrome-extension` directory.
8. Refresh Gmail, then hover over an inbox row for about half a second.
9. Select **Quick reply**, edit the draft, and select **Insert reply in Gmail**.
   Review it in Gmail before pressing **Send**.

After pulling new extension code, select **Reload** on the extension card and
refresh Gmail so Chrome uses the latest files.

## Privacy and limitations

- The extension sends visible row metadata to the local Next.js endpoint, which
  forwards it to OpenRouter when an API key is configured.
- Quick replies are intentionally based only on that visible preview. Open the
  email and use the sidebar's Draft reply action when full-thread context matters.
- The OpenRouter key stays in `.env.local` and is never bundled into Chrome.
- Results are cached in extension-local storage for 10 minutes.
- Hover analysis is intentionally labelled as a visible-row preview; open the
  email for the native add-on's bounded full-thread analysis.
- Gmail's DOM is not a public API, so the row selectors may need maintenance if
  Gmail changes its inbox markup.
- The API route is intended for local hackathon use. Add authentication and rate
  limiting before deploying it publicly.
