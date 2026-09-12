import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../gmail-addon/Code.gs", import.meta.url), "utf8");
const manifest = JSON.parse(fs.readFileSync(new URL("../gmail-addon/appsscript.json", import.meta.url), "utf8"));
const userStore = new Map();
const userProperties = {
  getProperty: (key) => userStore.get(key) ?? null,
  setProperty: (key, value) => userStore.set(key, value),
  deleteProperty: (key) => userStore.delete(key),
};
const sandbox = {
  console,
  PropertiesService: {
    getScriptProperties: () => ({ getProperty: () => null }),
    getUserProperties: () => userProperties,
  },
};
vm.createContext(sandbox);
vm.runInContext(source, sandbox);

const context = (text, from = "person@example.com") => [
  { subject: "Example", from, body: text },
];

assert.equal(sandbox.classifyThreadHeuristically(context("This is urgent. Please reply today.")).priority, "URGENT");
assert.equal(sandbox.classifyThreadHeuristically(context("Could you please confirm the revised quote?")).priority, "NEEDS_RESPONSE");
assert.equal(sandbox.classifyThreadHeuristically(context("Notes for next month's workshop.")).priority, "CAN_WAIT");
assert.equal(sandbox.classifyThreadHeuristically(context("Weekly newsletter. Unsubscribe here.", "no-reply@example.com")).priority, "FYI");
assert.equal(
  sandbox.classifyThreadHeuristically(context("Please verify your device with this verification code.", "no-reply@example.com")).priority,
  "URGENT",
);
assert.equal(sandbox.cleanMessageBody("New reply\n\nOn Friday, Person wrote:\n> Old reply"), "New reply");
assert.ok(sandbox.summarizeMessage("x".repeat(300)).length <= 221);
assert.equal(sandbox.escapeCardText("<script>&\"'"), "&lt;script&gt;&amp;&quot;&#39;");

const normalized = sandbox.normalizeAiAnalysis({
  priority: "NEEDS_RESPONSE",
  summary: "A reply is needed.",
  reason: "The sender is waiting.",
  action: "Review and respond.",
  deadline: "Friday",
  commitments: ["Send the revised proposal"],
});
assert.equal(normalized.label, "Needs response");
assert.equal(normalized.source, "AI analysis");
assert.equal(normalized.commitments.length, 1);
assert.equal(sandbox.getAnalysisStatus("AI analysis").label, "AI analysis active");
assert.match(sandbox.getAnalysisStatus("Local fallback — AI unavailable").label, /fallback active/);
assert.equal(sandbox.analyzeThread(context("Example")).source, "Local fallback — AI not configured");
assert.equal(sandbox.extractSenderDomain("Person <hello@example.com>"), "example.com");
assert.equal(sandbox.countByPriority([{ priority: "URGENT" }, { priority: "FYI" }, { priority: "FYI" }]).FYI, 2);
assert.equal(
  sandbox.getFormInputValue({ commonEventObject: { formInputs: { correctedPriority: { stringInputs: { value: ["CAN_WAIT"] } } } } }, "correctedPriority"),
  "CAN_WAIT",
);

sandbox.recordPriorityFeedback(
  { getFrom: () => "Person <hello@example.com>", getSubject: () => "Example subject" },
  "FYI",
);
assert.equal(sandbox.getPriorityFeedback()[0].priority, "FYI");

for (let index = 0; index < 8; index += 1) {
  sandbox.recordRecentAnalysis(
    { getFrom: () => "Person <hello@example.com>", getSubject: () => `Thread ${index}` },
    { getId: () => `thread-${index}`, getPermalink: () => `https://mail.google.com/thread-${index}` },
    [{}],
    { priority: index % 2 ? "FYI" : "URGENT", summary: `Summary ${index}` },
  );
}
assert.equal(sandbox.getRecentAnalyses().length, 6);
assert.equal(sandbox.getRecentAnalyses()[0].id, "thread-7");

const request = sandbox.buildOpenRouterRequest(context("Please review this by Friday."), "test/model", sandbox.getPriorityFeedback());
assert.equal(request.model, "test/model");
assert.equal(request.response_format.type, "json_schema");
assert.equal(request.response_format.json_schema.strict, true);
assert.deepEqual(
  Array.from(request.response_format.json_schema.schema.properties.priority.enum),
  ["URGENT", "NEEDS_RESPONSE", "FYI", "CAN_WAIT"],
);
assert.match(request.messages[1].content, /example\.com/);

const replyRequest = sandbox.buildReplyRequest(context("Could you confirm the launch date?"), "test/model");
assert.equal(replyRequest.model, "test/model");
assert.equal(replyRequest.response_format.json_schema.name, "email_reply_draft");
assert.match(replyRequest.messages[0].content, /never invent facts/);
assert.equal(sandbox.normalizeReplyDraft({ body: "  Thanks for the update.  " }), "Thanks for the update.");
assert.ok(sandbox.normalizeReplyDraft({ body: "x".repeat(4000) }).length <= 3000);
assert.match(sandbox.generateReplyDraft(context("Example")), /Thanks for your email/);
assert.equal(typeof sandbox.createAiReplyDraft, "function");
assert.match(source, /setComposeAction\(/);
assert.match(source, /ComposedEmailType\.REPLY_AS_DRAFT/);
assert.ok(manifest.oauthScopes.includes("https://www.googleapis.com/auth/gmail.addons.current.action.compose"));
assert.equal(manifest.addOns.common.name, "Inbox Triage");
assert.equal(typeof sandbox.resetIndoxAuthorization, "function");
assert.equal(typeof sandbox.authorizeIndoxExternalRequests, "function");
assert.equal(typeof sandbox.reanalyzeCurrentThread, "function");
assert.match(source, /setFunctionName\("reanalyzeCurrentThread"\)/);

console.log("Gmail add-on checks passed.");
