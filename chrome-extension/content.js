(() => {
  if (window.__inboxTriageHoverLoaded) return;
  window.__inboxTriageHoverLoaded = true;

  const HOVER_DELAY_MS = 450;
  const ROW_SELECTOR = "tr.zA";
  let activeRow = null;
  let hoverTimer = null;
  let hideTimer = null;
  let requestNumber = 0;
  let card = null;

  const make = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };

  function ensureCard() {
    if (card && card.isConnected) return card;
    card = make("aside", "inbox-triage-hover-card");
    card.setAttribute("role", "dialog");
    card.setAttribute("aria-label", "Inbox Triage preview");
    card.addEventListener("mouseenter", () => clearTimeout(hideTimer));
    card.addEventListener("mouseleave", scheduleHide);
    card.addEventListener("focusin", () => clearTimeout(hideTimer));
    card.addEventListener("focusout", (event) => {
      if (!(event.relatedTarget instanceof Node) || !card.contains(event.relatedTarget)) scheduleHide();
    });
    document.body.appendChild(card);
    return card;
  }

  function extractRow(row) {
    const senderElement = row.querySelector(".yW span[email], span[email], .yW");
    const subjectElement = row.querySelector(".bog, [data-thread-id] .bog");
    const snippetElement = row.querySelector(".y2");
    const sender = senderElement?.getAttribute("name") || senderElement?.getAttribute("email") || senderElement?.textContent || "";

    return {
      sender: sender.trim().slice(0, 160),
      subject: (subjectElement?.textContent || "").trim().slice(0, 220),
      snippet: (snippetElement?.textContent || "").replace(/^\s*[-–—]\s*/, "").trim().slice(0, 700),
    };
  }

  function placeCard(row) {
    const element = ensureCard();
    const rowRect = row.getBoundingClientRect();
    const subject = row.querySelector(".bog");
    const subjectRect = subject?.getBoundingClientRect();
    const width = Math.min(320, window.innerWidth - 24);
    const titleAnchor = subjectRect?.left || rowRect.left + Math.min(260, rowRect.width * 0.32);
    const left = Math.min(
      Math.max(12, titleAnchor - 120),
      window.innerWidth - width - 12,
    );
    const cardHeight = Math.max(element.offsetHeight, 230);
    const belowRow = rowRect.bottom + 8;
    const top = belowRow + cardHeight <= window.innerHeight - 12
      ? belowRow
      : Math.max(12, rowRect.top - cardHeight - 8);

    element.style.width = `${width}px`;
    element.style.left = `${left}px`;
    element.style.top = `${top}px`;
  }

  function renderLoading(row, payload) {
    const element = ensureCard();
    element.replaceChildren();

    const header = make("div", "inbox-triage-hover-header");
    header.append(make("span", "inbox-triage-hover-mark", "IT"));
    const title = make("div", "inbox-triage-hover-title");
    title.append(make("strong", "", "Inbox Triage"), make("small", "", "Reading visible preview…"));
    header.append(title, make("span", "inbox-triage-hover-spinner"));

    element.append(header, make("p", "inbox-triage-hover-subject", payload.subject || "Email preview"));
    placeCard(row);
    requestAnimationFrame(() => element.classList.add("inbox-triage-hover-visible"));
  }

  function renderResult(row, payload, result, cached) {
    const element = ensureCard();
    element.replaceChildren();
    element.style.setProperty("--triage-priority", result.color || "#8e8e93");

    const header = make("div", "inbox-triage-hover-header");
    header.append(make("span", "inbox-triage-hover-mark", "IT"));
    const title = make("div", "inbox-triage-hover-title");
    title.append(make("strong", "", "Inbox Triage"), make("small", "", cached ? "Cached preview" : "Visible-row preview"));
    header.append(title);

    const priority = make("div", "inbox-triage-hover-priority");
    priority.append(make("span", ""), document.createTextNode(result.label || "Can wait"));

    const details = make("div", "inbox-triage-hover-details");
    const action = make("div", "inbox-triage-hover-detail");
    action.append(
      make("span", "", "Recommended action"),
      make("p", "", result.action || "Open the thread to decide the next action."),
    );
    details.append(action);

    if (result.deadline && !/^none(?: detected)?$/i.test(result.deadline.trim())) {
      const deadline = make("div", "inbox-triage-hover-detail inbox-triage-hover-deadline");
      deadline.append(make("span", "", "Deadline"), make("p", "", result.deadline));
      details.append(deadline);
    }

    const footer = make("div", "inbox-triage-hover-footer");
    const footerActions = make("div", "inbox-triage-hover-actions");
    const quickReplyButton = make("button", "inbox-triage-hover-quick", "Quick reply");
    quickReplyButton.type = "button";
    quickReplyButton.addEventListener("click", () => requestQuickReply(row, payload, result));
    const openButton = make("button", "inbox-triage-hover-open", "Open email for full context →");
    openButton.type = "button";
    openButton.addEventListener("click", () => {
      const target = row.querySelector(".bog") || row;
      if (target instanceof HTMLElement) target.click();
      activeRow = null;
      requestNumber += 1;
      hideCard();
    });
    footerActions.append(quickReplyButton, openButton);
    footer.append(make("span", "", payload.sender || "Unknown sender"), footerActions);

    element.append(
      header,
      priority,
      make("p", "inbox-triage-hover-summary", result.summary || payload.snippet || payload.subject),
      make("p", "inbox-triage-hover-reason", result.reason || "Open the thread for complete analysis."),
      details,
      footer,
    );
    placeCard(row);
  }

  function renderReplyLoading(row) {
    const element = ensureCard();
    element.replaceChildren();

    const header = make("div", "inbox-triage-hover-header");
    header.append(make("span", "inbox-triage-hover-mark", "IT"));
    const title = make("div", "inbox-triage-hover-title");
    title.append(make("strong", "", "Quick reply"), make("small", "", "Writing from the visible preview…"));
    header.append(title, make("span", "inbox-triage-hover-spinner"));

    element.append(header, make("p", "inbox-triage-hover-summary", "Preparing a short reply for you to review."));
    placeCard(row);
  }

  function renderReplyDraft(row, payload, triageResult, replyResult) {
    const element = ensureCard();
    element.replaceChildren();

    const header = make("div", "inbox-triage-hover-header");
    header.append(make("span", "inbox-triage-hover-mark", "IT"));
    const title = make("div", "inbox-triage-hover-title");
    title.append(
      make("strong", "", "Quick reply"),
      make("small", "", replyResult.source === "ai" ? "AI draft · editable" : "Safe fallback · editable"),
    );
    header.append(title);

    const editor = make("textarea", "inbox-triage-hover-editor");
    editor.value = replyResult.body;
    editor.rows = 5;
    editor.setAttribute("aria-label", "Editable quick reply");

    const note = make(
      "p",
      "inbox-triage-hover-note",
      "Based on the visible preview. Review the draft, then Gmail lets you make the final send.",
    );
    const status = make("p", "inbox-triage-hover-reply-status", "");
    status.setAttribute("aria-live", "polite");

    const controls = make("div", "inbox-triage-hover-reply-controls");
    const backButton = make("button", "inbox-triage-hover-secondary", "Back");
    backButton.type = "button";
    backButton.addEventListener("click", () => renderResult(row, payload, triageResult, true));

    const insertButton = make("button", "inbox-triage-hover-primary", "Insert reply in Gmail →");
    insertButton.type = "button";
    insertButton.addEventListener("click", async () => {
      const body = editor.value.trim();
      if (!body) {
        status.textContent = "Write a reply before continuing.";
        editor.focus();
        return;
      }

      insertButton.disabled = true;
      insertButton.textContent = "Opening Gmail…";
      status.textContent = "";
      await openEmailAndInsertReply(row, body);
    });

    controls.append(backButton, insertButton);
    element.append(header, editor, note, status, controls);
    placeCard(row);
    editor.focus();
    editor.setSelectionRange(editor.value.length, editor.value.length);
  }

  function renderReplyError(row, payload, triageResult) {
    const element = ensureCard();
    element.replaceChildren();

    const header = make("div", "inbox-triage-hover-header");
    header.append(make("span", "inbox-triage-hover-mark", "IT"), make("strong", "", "Quick reply unavailable"));
    const message = make(
      "p",
      "inbox-triage-hover-reason",
      "Make sure the local Inbox Triage app is running, then try again.",
    );
    const controls = make("div", "inbox-triage-hover-reply-controls");
    const backButton = make("button", "inbox-triage-hover-secondary", "Back");
    backButton.type = "button";
    backButton.addEventListener("click", () => renderResult(row, payload, triageResult, true));
    const retryButton = make("button", "inbox-triage-hover-primary", "Try again");
    retryButton.type = "button";
    retryButton.addEventListener("click", () => requestQuickReply(row, payload, triageResult));
    controls.append(backButton, retryButton);

    element.append(header, message, controls);
    placeCard(row);
  }

  function renderError(row) {
    const element = ensureCard();
    element.replaceChildren();
    const header = make("div", "inbox-triage-hover-header");
    header.append(make("span", "inbox-triage-hover-mark", "IT"), make("strong", "", "Inbox Triage"));
    element.append(header, make("p", "inbox-triage-hover-summary", "Preview unavailable"), make("p", "inbox-triage-hover-reason", "Make sure the local app is running at localhost:3000."));
    placeCard(row);
  }

  function hideCard() {
    if (card) card.classList.remove("inbox-triage-hover-visible");
  }

  function scheduleHide() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      if (card?.contains(document.activeElement)) return;
      activeRow = null;
      requestNumber += 1;
      hideCard();
    }, 180);
  }

  function isVisible(element) {
    if (!(element instanceof HTMLElement)) return false;
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
  }

  async function waitForElement(find, timeoutMs = 8_000) {
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeoutMs) {
      const element = find();
      if (element) return element;
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
    return null;
  }

  function showToast(message, isError = false) {
    document.querySelector(".inbox-triage-toast")?.remove();
    const toast = make("div", `inbox-triage-toast${isError ? " inbox-triage-toast-error" : ""}`, message);
    toast.setAttribute("role", "status");
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("inbox-triage-toast-visible"));
    setTimeout(() => {
      toast.classList.remove("inbox-triage-toast-visible");
      setTimeout(() => toast.remove(), 180);
    }, 4_000);
  }

  async function openEmailAndInsertReply(row, body) {
    clearTimeout(hoverTimer);
    clearTimeout(hideTimer);
    activeRow = null;
    requestNumber += 1;
    hideCard();

    const target = row.querySelector(".bog") || row;
    if (target instanceof HTMLElement) target.click();

    const replyButton = await waitForElement(() => {
      const candidates = document.querySelectorAll('[role="button"], button');
      return Array.from(candidates).filter((candidate) => {
        if (!isVisible(candidate)) return false;
        const label = candidate.getAttribute("aria-label") || candidate.getAttribute("title") || candidate.textContent || "";
        return /^reply(?: to [^,]+)?$/i.test(label.trim());
      }).at(-1) || null;
    });

    if (!(replyButton instanceof HTMLElement)) {
      showToast("Open the message and use Draft reply in the Inbox Triage sidebar.", true);
      return;
    }
    replyButton.click();

    const composer = await waitForElement(() => {
      const candidates = document.querySelectorAll('.Am.Al.editable[contenteditable="true"], [contenteditable="true"][role="textbox"]');
      return Array.from(candidates).filter(isVisible).at(-1) || null;
    });

    if (!(composer instanceof HTMLElement)) {
      showToast("Gmail opened the reply, but the draft could not be inserted. Please paste it manually.", true);
      return;
    }

    composer.focus();
    const inserted = document.execCommand("insertText", false, body);
    if (!inserted || !composer.textContent?.trim()) {
      composer.textContent = body;
      composer.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: body }));
    }
    showToast("Reply inserted. Review it, then press Gmail’s Send button.");
  }

  async function requestQuickReply(row, payload, triageResult) {
    const currentRequest = ++requestNumber;
    renderReplyLoading(row);

    try {
      const response = await chrome.runtime.sendMessage({ type: "INBOX_TRIAGE_QUICK_REPLY", payload });
      if (currentRequest !== requestNumber || row !== activeRow) return;
      if (!response?.ok || !response.data?.body) throw new Error(response?.error || "Quick reply failed.");
      renderReplyDraft(row, payload, triageResult, response.data);
    } catch {
      if (currentRequest !== requestNumber || row !== activeRow) return;
      renderReplyError(row, payload, triageResult);
    }
  }

  async function requestAnalysis(row, payload) {
    const currentRequest = ++requestNumber;
    renderLoading(row, payload);

    try {
      const response = await chrome.runtime.sendMessage({ type: "INBOX_TRIAGE_HOVER", payload });
      if (currentRequest !== requestNumber || row !== activeRow) return;
      if (!response?.ok) throw new Error(response?.error || "Preview failed.");
      renderResult(row, payload, response.data, response.cached);
    } catch {
      if (currentRequest === requestNumber && row === activeRow) renderError(row);
    }
  }

  document.addEventListener("mouseover", (event) => {
    const row = event.target instanceof Element ? event.target.closest(ROW_SELECTOR) : null;
    if (!row || row === activeRow) return;

    clearTimeout(hideTimer);
    activeRow = row;
    clearTimeout(hoverTimer);
    hideCard();
    const payload = extractRow(row);
    if (!payload.subject && !payload.snippet) return;
    hoverTimer = setTimeout(() => requestAnalysis(row, payload), HOVER_DELAY_MS);
  }, true);

  document.addEventListener("mouseout", (event) => {
    if (!activeRow) return;
    const related = event.relatedTarget;
    if (related instanceof Node && activeRow.contains(related)) return;
    if (event.target instanceof Node && !activeRow.contains(event.target)) return;
    if (related instanceof Node && card?.contains(related)) return;

    clearTimeout(hoverTimer);
    scheduleHide();
  }, true);

  window.addEventListener("scroll", () => {
    clearTimeout(hoverTimer);
    clearTimeout(hideTimer);
    activeRow = null;
    requestNumber += 1;
    hideCard();
  }, true);
})();
