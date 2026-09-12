const API_URL = "http://localhost:3000/api/hover-triage";
const REPLY_API_URL = "http://localhost:3000/api/hover-reply";
const CACHE_KEY = "inboxTriageHoverCacheV3";
const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_LIMIT = 80;

async function hashPayload(payload) {
  const encoded = new TextEncoder().encode(JSON.stringify(payload));
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function getCache() {
  const stored = await chrome.storage.local.get(CACHE_KEY);
  return stored[CACHE_KEY] && typeof stored[CACHE_KEY] === "object" ? stored[CACHE_KEY] : {};
}

async function saveCache(cache) {
  const entries = Object.entries(cache)
    .filter(([, entry]) => entry && Date.now() - entry.savedAt < CACHE_TTL_MS)
    .sort((a, b) => b[1].savedAt - a[1].savedAt)
    .slice(0, CACHE_LIMIT);

  await chrome.storage.local.set({ [CACHE_KEY]: Object.fromEntries(entries) });
}

async function analyzeHover(payload) {
  const key = await hashPayload(payload);
  const cache = await getCache();
  const cached = cache[key];
  if (cached && Date.now() - cached.savedAt < CACHE_TTL_MS) {
    return { ok: true, data: cached.data, cached: true };
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error(`Inbox Triage returned ${response.status}.`);
  const data = await response.json();
  if (data.source === "ai") {
    cache[key] = { data, savedAt: Date.now() };
    await saveCache(cache);
  }
  return { ok: true, data, cached: false };
}

async function draftQuickReply(payload) {
  const response = await fetch(REPLY_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error(`Inbox Triage returned ${response.status}.`);
  return { ok: true, data: await response.json() };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message) return false;

  const operation = message.type === "INBOX_TRIAGE_HOVER"
    ? analyzeHover
    : message.type === "INBOX_TRIAGE_QUICK_REPLY"
      ? draftQuickReply
      : null;
  if (!operation) return false;

  operation(message.payload)
    .then(sendResponse)
    .catch((error) => sendResponse({
      ok: false,
      error: error instanceof Error ? error.message : "Inbox Triage request failed.",
    }));

  return true;
});
