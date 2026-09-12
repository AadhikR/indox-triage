# Indox Triage demo guide

## The 45-second judge demo

1. Open Gmail with the Indox sidebar already visible.
2. Open the urgent sample email below.
3. Point out that Indox appears where the email decision is already happening.
4. Show the attention level, full-thread summary, deadline, commitments, and next action.
5. Point to **AI analysis active** and **Analysis only — no messages were sent or changed**.
6. Select **Re-analyze** to demonstrate a user-controlled agent action inside Gmail.
7. Switch to the informational sample to show that Indox changes with Gmail context.

## One-line pitch

Indox turns every open Gmail thread into a clear decision: how urgently it needs you, why, and what to do next.

## Demo emails

Send these messages to the Gmail account used for the demo. Use obviously fake names and data.

### Urgent

**Subject:** Launch blocked — approval required by 3:00 PM

> Hi Aadhik, production deployment is blocked until you approve the final configuration. We need your decision by 3:00 PM today or the client launch moves to Monday. Please confirm whether we should proceed with option B.

Expected result: **Urgent**, with today's deadline and an approval action.

### Needs response

**Subject:** Waiting on your decision for the venue

> Could you choose between the Marina and Downtown venues? The team cannot finalize invitations until we have your decision. Please let us know which option you prefer.

Expected result: **Needs response**, because another person is blocked.

### Can wait

**Subject:** Review notes for next month's workshop

> I attached the first outline for next month's workshop. When you have time this week, please review the session order and send any suggestions. Nothing is blocked yet.

Expected result: **Can wait**.

### FYI

**Subject:** Weekly product newsletter

> Here is this week's product roundup and community news. No response is needed. You can unsubscribe at any time.

Expected result: **FYI**.

## Recovery plan

- If OpenRouter succeeds, the card says **AI analysis active**.
- If OpenRouter is unavailable, Indox labels the fallback clearly and still produces a deterministic result.
- If Gmail context cannot be read, the card explains the failure and offers **Try again**.
- Keep one already-analyzed sample thread open as a backup for the live presentation.

## Privacy statement

Indox reads only the open Gmail thread. It bounds analysis to the eight most recent messages and 3,500 cleaned characters per message. With AI enabled, that bounded context is sent to OpenRouter. The sidebar does not send, modify, archive, or delete email. Its private digest stores only bounded metadata and summaries for the six most recently analyzed threads; full email bodies are not retained, and the user can clear all saved digest and correction data.
