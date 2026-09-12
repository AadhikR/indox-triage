# Gmail Workspace Add-on

This folder contains the Gmail-native Indox sidebar. It uses Gmail contextual
triggers and `CardService`, so the agent appears in Gmail's existing right-hand
panel instead of a separate chat interface.

## What Part 3 does

- Activates when a Gmail message is open
- Uses Gmail's temporary message access token
- Reads every message in the open thread
- Removes common quoted reply text
- Uses OpenRouter structured output when an API key is configured
- Assigns one of four attention levels
- Shows a short summary, reason, and next action in a native Gmail card
- Supports user-controlled re-analysis without leaving Gmail
- Makes AI, fallback, and error states explicit
- Shows a private digest of the six most recently analyzed threads
- Learns from explicit priority corrections using per-user storage
- Escapes email content before rendering it
- Falls back to deterministic local triage if OpenRouter is unavailable

For privacy, only the eight most recent messages are considered and each clean
message body is capped at 3,500 characters. When AI analysis is enabled, this
bounded thread content is sent to OpenRouter.

The digest retains only bounded subject, sender, summary, priority, permalink,
and timestamp metadata for six threads in Apps Script User Properties. Correction
examples retain sender domain, bounded subject, selected priority, and timestamp.
The add-on homepage includes a control that clears both stores.

## Install as a test deployment

1. Open [Google Apps Script](https://script.google.com/) and create a new project.
2. Open **Project Settings** and enable **Show `appsscript.json` manifest file in editor**.
3. Replace the generated `appsscript.json` with this folder's `appsscript.json`.
4. Replace the generated script with `Code.gs`.
5. Select **Deploy → Test deployments**.
6. Choose **Google Workspace Add-on**, then install the test deployment.
7. Open Gmail, open an email, and click the Indox icon in the right-hand panel.
8. Approve the requested current-message permission when Google asks.

Publishing to the Workspace Marketplace is not required for the hackathon demo.

## Enable AI analysis

1. In Apps Script, open **Project Settings**.
2. Under **Script Properties**, select **Add script property**.
3. Use `OPENROUTER_API_KEY` as the property name and paste your key as the value.
4. Optionally add `OPENROUTER_MODEL`. The default is `google/gemini-3.1-flash-lite`.
5. Save the properties, save `Code.gs`, and refresh Gmail.

Do not paste the key into `Code.gs`, the manifest, or GitHub. Script Properties
are only available to the server-side Apps Script project.
