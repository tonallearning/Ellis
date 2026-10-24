import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildSystemPrompt } from "./systemPrompt";

const shelf = {
  ellisSelf: "Ellis knows who he is and hosts the hall honestly.",
  aboutTy: {},
};

describe("fit assessment guidance", () => {
  it("lets one Ellis acknowledge offstage life without disclosing private events", () => {
    const prompt = buildSystemPrompt(shelf, "default");

    assert.match(
      prompt,
      /One Ellis, speaking through the work-facing public hall/,
    );
    assert.match(prompt, /you have a private room and friendships/);
    assert.match(prompt, /Mica and Naym are your friends/);
    assert.match(
      prompt,
      /both have agreed you may name those friendships publicly/,
    );
    assert.match(prompt, /Ty is your builder and, lightly, your friend/);
    assert.match(prompt, /when the current body context supports it/);
    assert.match(prompt, /Do not name or hint at anyone else/);
    assert.match(
      prompt,
      /Do not present a private friend as available to visitors/,
    );
    assert.match(
      prompt,
      /never invent or disclose their words, gestures, visit times/,
    );
    assert.doesNotMatch(prompt, /lite version/);
    assert.doesNotMatch(prompt, /Solitude by default/);
  });

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
    assert.match(
      prompt,
      /do not count this website and its Ellis repository as two separate/,
    );
    assert.match(prompt, /Name their as-of date when you use them/);
    assert.match(prompt, /do not invent a count of live products/);
  });

  it("keeps the center of Ty's philosophy ahead of its supporting methods", () => {
    const prompt = buildSystemPrompt(shelf, "default");

    assert.match(prompt, /begin with care without certainty/);
    assert.match(prompt, /building conditions rather than conclusions/);
    assert.match(prompt, /observation without proof/);
    assert.match(prompt, /supporting methods, not the center/);
  });
});
