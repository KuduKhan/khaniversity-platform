import test from "node:test";
import assert from "node:assert/strict";
import { codelabDraftKey, safeDraft, starterPython } from "../../src/modules/platforms/code-drafts";

test("preview and authenticated learner drafts have separate private storage namespaces", () => {
  const userA = "00000000-0000-0000-0000-000000000101";
  const userB = "00000000-0000-0000-0000-000000000102";
  assert.notEqual(codelabDraftKey(true), codelabDraftKey(false, userA));
  assert.notEqual(codelabDraftKey(false, userA), codelabDraftKey(false, userB));
  assert.throws(() => codelabDraftKey(false), /authenticated account/);
  assert.throws(() => codelabDraftKey(false, "invalid"), /authenticated account/);
});

test("drafts are size-bounded and never counted as verified results", () => {
  assert.match(starterPython, /total_minutes/);
  assert.equal(safeDraft(""), "");
  assert.equal(safeDraft("x".repeat(6001)), null);
  assert.equal(safeDraft(null), null);
});
