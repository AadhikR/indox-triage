import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../gmail-addon/Code.gs", import.meta.url), "utf8");
const sandbox = {
  console,
  PropertiesService: {
    getScriptProperties: () => ({ getProperty: () => null }),
  },
};
vm.createContext(sandbox);
vm.runInContext(source, sandbox);

const context = (text, from = "person@example.com") => [
  { subject: "Example", from, body: text },
];

assert.equal(sandbox.classifyThreadHeuristically(context("This is urgent. Please reply today.")).priority, "URGENT");
assert.equal(sandbox.classifyThreadHeuristically(context("Could you please confirm the revised quote?")).priority, "ATTENTION_REQUIRED");
assert.equal(sandbox.classifyThreadHeuristically(context("Notes for next month's workshop.")).priority, "MODERATE");
assert.equal(sandbox.classifyThreadHeuristically(context("Weekly newsletter. Unsubscribe here.", "no-reply@example.com")).priority, "TAKE_YOUR_TIME");
assert.equal(sandbox.cleanMessageBody("New reply\n\nOn Friday, Person wrote:\n> Old reply"), "New reply");
assert.ok(sandbox.summarizeMessage("x".repeat(300)).length <= 221);
assert.equal(sandbox.escapeCardText("<script>&\"'"), "&lt;script&gt;&amp;&quot;&#39;");

const normalized = sandbox.normalizeAiAnalysis({
  priority: "ATTENTION_REQUIRED",
  summary: "A reply is needed.",
  reason: "The sender is waiting.",
  action: "Review and respond.",
  deadline: "Friday",
  commitments: ["Send the revised proposal"],
});
assert.equal(normalized.label, "Attention required");
assert.equal(normalized.source, "AI analysis");
assert.equal(normalized.commitments.length, 1);

const request = sandbox.buildOpenRouterRequest(context("Please review this by Friday."), "test/model");
assert.equal(request.model, "test/model");
assert.equal(request.response_format.type, "json_schema");
assert.equal(request.response_format.json_schema.strict, true);

console.log("Gmail add-on checks passed.");
