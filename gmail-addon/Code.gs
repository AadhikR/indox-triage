/**
 * Indox Triage Gmail Workspace Add-on.
 *
 * Part 3 reads the open Gmail thread with Gmail's temporary message token and
 * renders a native contextual card. Part 4 will replace the local heuristic
 * analysis with the OpenRouter-backed agent.
 */

var INDOX_COLORS = {
  URGENT: "#d84c40",
  ATTENTION_REQUIRED: "#e59632",
  MODERATE: "#4a73bd",
  TAKE_YOUR_TIME: "#7e8b95"
};

/**
 * Builds the add-on homepage shown when no Gmail message is selected.
 * @return {CardService.Card[]}
 */
function onHomepage() {
  var card = CardService.newCardBuilder()
    .setHeader(
      CardService.newCardHeader()
        .setTitle("Indox Triage")
        .setSubtitle("Open an email to understand what needs you")
    )
    .addSection(
      CardService.newCardSection()
        .addWidget(
          CardService.newTextParagraph().setText(
            "Indox reads the complete open thread, identifies its attention level, " +
              "and explains the next action. Nothing is sent without your approval."
          )
        )
        .addWidget(
          CardService.newDecoratedText()
            .setTopLabel("HOW TO START")
            .setText("Open any email, then select the Indox icon again.")
            .setWrapText(true)
        )
    )
    .build();

  return [card];
}

/**
 * Contextual trigger fired by Gmail when a user opens an email.
 * @param {Object} event Gmail add-on event.
 * @return {CardService.Card[]}
 */
function onGmailMessageOpen(event) {
  try {
    validateGmailEvent(event);

    GmailApp.setCurrentMessageAccessToken(event.gmail.accessToken);

    var message = GmailApp.getMessageById(event.gmail.messageId);
    var thread = message.getThread();
    var messages = thread.getMessages();
    var context = buildThreadContext(messages);
    var analysis = classifyThreadHeuristically(context);

    return [buildTriageCard(message, thread, messages, analysis)];
  } catch (error) {
    console.error("Unable to analyze Gmail message", error);
    return [buildErrorCard(error)];
  }
}

/**
 * Ensures the contextual event contains Gmail's temporary access values.
 * @param {Object} event Gmail add-on event.
 */
function validateGmailEvent(event) {
  if (!event || !event.gmail || !event.gmail.accessToken || !event.gmail.messageId) {
    throw new Error("Open a Gmail message before running Indox Triage.");
  }
}

/**
 * Converts a Gmail thread to compact chronological context.
 * @param {GmailMessage[]} messages Thread messages.
 * @return {Object[]}
 */
function buildThreadContext(messages) {
  return messages.slice(-10).map(function (message) {
    return {
      from: message.getFrom(),
      to: message.getTo(),
      date: message.getDate().toISOString(),
      subject: message.getSubject(),
      body: cleanMessageBody(message.getPlainBody()).slice(0, 5000)
    };
  });
}

/**
 * Produces a safe, compact body by removing common quoted-reply markers.
 * @param {string} body Raw plain-text email body.
 * @return {string}
 */
function cleanMessageBody(body) {
  if (!body) return "";

  return body
    .replace(/\r/g, "")
    .split(/\nOn .+wrote:\n|\nFrom:\s.+\nSent:\s|\n-{2,}\s*Original Message\s*-{2,}/i)[0]
    .replace(/^>.*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Temporary deterministic classifier used before the AI analysis endpoint.
 * @param {Object[]} context Chronological thread context.
 * @return {Object}
 */
function classifyThreadHeuristically(context) {
  var newest = context[context.length - 1] || {};
  var searchable = context
    .map(function (item) {
      return [item.subject, item.from, item.body].join(" ");
    })
    .join(" ")
    .toLowerCase();

  var priority = "MODERATE";
  var reason = "This message may be useful, but no immediate blocker was detected.";
  var action = "Review the thread when you have a focused moment.";

  if (/unsubscribe|newsletter|weekly digest|notification only|no[- ]?reply/.test(searchable)) {
    priority = "TAKE_YOUR_TIME";
    reason = "This appears informational and does not request a response.";
    action = "Read when convenient or archive it.";
  } else if (/\burgent\b|\basap\b|immediately|overdue|final reminder|by end of day|\btoday\b/.test(searchable)) {
    priority = "URGENT";
    reason = "The thread contains immediate timing or escalation language.";
    action = "Review the request and respond as soon as possible.";
  } else if (/please confirm|need your|waiting for|can you|could you|please review|approval|your decision|let me know/.test(searchable)) {
    priority = "ATTENTION_REQUIRED";
    reason = "Someone is waiting for your response, approval, or decision.";
    action = "Review the latest request and decide who should respond.";
  }

  return {
    priority: priority,
    label: formatPriorityLabel(priority),
    color: INDOX_COLORS[priority],
    summary: summarizeMessage(newest.body || newest.subject || "No message text available."),
    reason: reason,
    action: action
  };
}

/**
 * Creates a short summary from the latest clean message for the pre-AI MVP.
 * @param {string} text Message content.
 * @return {string}
 */
function summarizeMessage(text) {
  var compact = String(text || "")
    .replace(/\s+/g, " ")
    .trim();

  if (!compact) return "No readable message content was found.";
  if (compact.length <= 220) return compact;

  var shortened = compact.slice(0, 220);
  var sentenceEnd = Math.max(
    shortened.lastIndexOf(". "),
    shortened.lastIndexOf("? "),
    shortened.lastIndexOf("! ")
  );

  return (sentenceEnd > 80 ? shortened.slice(0, sentenceEnd + 1) : shortened.trim()) + "…";
}

/**
 * @param {string} priority Internal priority value.
 * @return {string}
 */
function formatPriorityLabel(priority) {
  return {
    URGENT: "Urgent",
    ATTENTION_REQUIRED: "Attention required",
    MODERATE: "Moderate",
    TAKE_YOUR_TIME: "Take your time"
  }[priority] || "Moderate";
}

/**
 * Renders the analysis using Gmail's native CardService UI.
 * @param {GmailMessage} message Open message.
 * @param {GmailThread} thread Open thread.
 * @param {GmailMessage[]} messages Thread messages.
 * @param {Object} analysis Triage result.
 * @return {CardService.Card}
 */
function buildTriageCard(message, thread, messages, analysis) {
  var header = CardService.newCardHeader()
    .setTitle("Indox Triage")
    .setSubtitle(messages.length + (messages.length === 1 ? " message" : " messages") + " in this thread");

  var prioritySection = CardService.newCardSection()
    .setHeader("ATTENTION LEVEL")
    .addWidget(
      CardService.newDecoratedText()
        .setText("<b>" + escapeCardText(analysis.label) + "</b>")
        .setBottomLabel(escapeCardText(analysis.reason))
        .setWrapText(true)
    );

  var contextSection = CardService.newCardSection()
    .setHeader("THREAD CONTEXT")
    .addWidget(
      CardService.newDecoratedText()
        .setTopLabel("SUBJECT")
        .setText(escapeCardText(message.getSubject() || "(No subject)"))
        .setWrapText(true)
    )
    .addWidget(
      CardService.newDecoratedText()
        .setTopLabel("LATEST SENDER")
        .setText(escapeCardText(message.getFrom()))
        .setWrapText(true)
    )
    .addWidget(
      CardService.newTextParagraph().setText(escapeCardText(analysis.summary))
    );

  var actionSection = CardService.newCardSection()
    .setHeader("RECOMMENDED NEXT ACTION")
    .addWidget(
      CardService.newTextParagraph().setText(escapeCardText(analysis.action))
    )
    .addWidget(
      CardService.newTextButton()
        .setText("Open complete thread")
        .setOpenLink(CardService.newOpenLink().setUrl(thread.getPermalink()))
    );

  return CardService.newCardBuilder()
    .setHeader(header)
    .addSection(prioritySection)
    .addSection(contextSection)
    .addSection(actionSection)
    .build();
}

/**
 * @param {Error} error Caught error.
 * @return {CardService.Card}
 */
function buildErrorCard(error) {
  return CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle("Indox Triage"))
    .addSection(
      CardService.newCardSection()
        .setHeader("COULD NOT READ THIS THREAD")
        .addWidget(
          CardService.newTextParagraph().setText(
            escapeCardText(error && error.message ? error.message : "Please close the sidebar and try again.")
          )
        )
    )
    .build();
}

/**
 * CardService text supports a small HTML subset, so untrusted email content must
 * be escaped before rendering.
 * @param {string} value Untrusted text.
 * @return {string}
 */
function escapeCardText(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
