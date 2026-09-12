import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");
const manifest = JSON.parse(read("../chrome-extension/manifest.json"));
const background = read("../chrome-extension/background.js");
const content = read("../chrome-extension/content.js");
const styles = read("../chrome-extension/content.css");

assert.equal(manifest.manifest_version, 3);
assert.ok(manifest.permissions.includes("storage"));
assert.ok(manifest.host_permissions.includes("https://mail.google.com/*"));
assert.ok(manifest.host_permissions.includes("http://localhost:3000/*"));
assert.deepEqual(manifest.content_scripts[0].matches, ["https://mail.google.com/*"]);
assert.equal(manifest.background.service_worker, "background.js");

new vm.Script(background, { filename: "background.js" });
new vm.Script(content, { filename: "content.js" });
assert.match(background, /http:\/\/localhost:3000\/api\/hover-triage/);
assert.match(background, /crypto\.subtle\.digest/);
assert.match(background, /inboxTriageHoverCacheV2/);
assert.match(background, /data\.source === "ai"/);
assert.match(content, /HOVER_DELAY_MS = 450/);
assert.match(content, /subject\?\.getBoundingClientRect\(\)/);
assert.match(content, /rowRect\.bottom \+ 8/);
assert.match(content, /textContent/);
assert.doesNotMatch(content, /innerHTML/);
assert.match(styles, /inbox-triage-hover-visible/);

console.log("Chrome extension checks passed.");
