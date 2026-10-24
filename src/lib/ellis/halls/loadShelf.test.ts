import assert from "node:assert/strict";
import test from "node:test";
import { formatShelfForPrompt, loadKnowledgeShelf } from "./loadShelf";

test("the public shelf uses curated outcomes without named application notes", () => {
  const shelf = loadKnowledgeShelf();
  const facts = JSON.parse(shelf.aboutTy.facts ?? "{}") as {
    projects?: Array<Record<string, unknown>>;
  };
  const prompt = formatShelfForPrompt(shelf);

  assert.equal(facts.projects?.length, 4);
  for (const project of facts.projects ?? []) {
    assert.ok(project.purpose);
    assert.ok(project.evidence_boundary);
    assert.equal("stack" in project, false);
    assert.equal("specifics" in project, false);
    assert.equal("scale" in project, false);
  }
  assert.doesNotMatch(prompt, /Active applications \(time-sensitive context\)/);
  assert.doesNotMatch(prompt, /Elios/);
  assert.doesNotMatch(prompt, /Three live projects/);
});
