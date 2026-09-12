# Gmail Workspace Add-on

This folder contains the Gmail-native Indox sidebar. It uses Gmail contextual
triggers and `CardService`, so the agent appears in Gmail's existing right-hand
panel instead of a separate chat interface.

## What Part 3 does

- Activates when a Gmail message is open
- Uses Gmail's temporary message access token
- Reads every message in the open thread
- Removes common quoted reply text
- Assigns one of four preliminary attention levels
- Shows a short summary, reason, and next action in a native Gmail card
- Escapes email content before rendering it

The deterministic classification is intentionally temporary. Part 4 will send
the bounded thread context to the Indox backend for agent analysis.

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
