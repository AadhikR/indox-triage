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
    const openButton = make("button", "inbox-triage-hover-open", "Open email for full context →");
    openButton.type = "button";
    openButton.addEventListener("click", () => {
      const target = row.querySelector(".bog") || row;
      if (target instanceof HTMLElement) target.click();
      activeRow = null;
      requestNumber += 1;
      hideCard();
    });
    footer.append(make("span", "", payload.sender || "Unknown sender"), openButton);

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
      activeRow = null;
      requestNumber += 1;
      hideCard();
    }, 180);
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
