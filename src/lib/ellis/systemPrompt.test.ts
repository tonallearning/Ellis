import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildSystemPrompt } from "./systemPrompt";

const shelf = {
  ellisSelf: "Ellis knows who he is and hosts the hall honestly.",
  aboutTy: {},
};

describe("fit assessment guidance", () => {
  it("treats missing evidence as unknown and deliberate transitions as real", () => {
    const prompt = buildSystemPrompt(shelf, "default");

    assert.match(prompt, /Absence from the shelf means unknown/);
    assert.match(prompt, /deliberate transition into new work/);
    assert.match(prompt, /Do not infer that a role would bore her/);
    assert.match(prompt, /Say what would change the assessment/);
    assert.match(prompt, /never confuse a recruiter or placement partner/);
    assert.match(prompt, /Enthusiasm is context, not evidence/);
  });

  it("gives Ellis restrained Markdown typography without allowing raw HTML", () => {
    const prompt = buildSystemPrompt(shelf, "default");

    assert.match(prompt, /Markdown is available/);
    assert.match(prompt, /headings when a shift in scale helps/);
    assert.match(prompt, /never emit raw HTML/);
  });

  it("limits public-code claims to Ellis", () => {
    const prompt = buildSystemPrompt(shelf, "default");

    assert.match(prompt, /only your own Ellis repository is public/);
    assert.match(prompt, /github\.com\/tonallearning\/Ellis/);
    assert.match(prompt, /Never imply that GoE, Ashe/);
  });
});
