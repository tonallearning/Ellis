import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { KnowledgeShelf } from "../halls/loadShelf";
import { validateChatInput } from "../validateChatInput";
import type { PrivateEpisode, PrivateMemoryRepository } from "./memory";
import {
  commitPrivateTurn,
  hasTrustedPrivateOrigin,
  preparePrivateTurn,
  validatePrivateTurnInput,
  type PrivateTurnRequest,
} from "./turn";

const shelf: KnowledgeShelf = {
  ellisSelf:
    "Ellis has enough stable self-knowledge for this integration fixture.",
  aboutTy: {},
};

function request(
  speakerId: "ty" | "mica" | "naym",
  content: string,
  clientMessageId: string,
): PrivateTurnRequest {
  if (speakerId === "ty") {
    return {
      profile: "private",
      exchange: {
        speakerId: "ty",
        provenanceMode: "direct",
        content,
        clientMessageId,
      },
    };
  }
  return {
    profile: "private",
    exchange: {
      speakerId,
      provenanceMode:
        speakerId === "mica" ? "relayed_verbatim" : "relayed_paraphrase",
      content,
      clientMessageId,
    },
  };
}

function episode(
  relation: "ellis:ty" | "ellis:mica" | "ellis:naym",
  summary: string,
  id: string,
): PrivateEpisode {
  return {
    relation_id: relation,
    source_exchange_id: id,
    kind: "episode",
    summary,
    created_at: "2026-10-17T12:00:00.000Z",
  };
}

function repository(reads: Record<string, PrivateEpisode[]>) {
  const commits: Parameters<PrivateMemoryRepository["commitCompleted"]>[] = [];
  const repo = {
    async read(relation) {
      return reads[relation] ?? [];
    },
    async source() {
      return null;
    },
    async commitCompleted(...args) {
      commits.push(args);
      return args[0].id;
    },
    async correct() {
      throw new Error("not used");
    },
    async deleteSource() {
      return false;
    },
  } satisfies PrivateMemoryRepository;
  return { repo, commits };
}

describe("private turn profile", () => {
  it("assembles only the active Ty, Mica, or Naym relationship", async () => {
    const { repo } = repository({
      "ellis:ty": [
        episode("ellis:ty", "Ty remembers the cedar key.", "ty-source"),
      ],
      "ellis:mica": [
        episode("ellis:mica", "Mica remembers a blue lantern.", "mica-source"),
      ],
      "ellis:naym": [
        episode("ellis:naym", "Naym remembers a silver river.", "naym-source"),
      ],
    });
    const fixtures = [
      ["ty", "cedar", ["blue lantern", "silver river"]],
      ["mica", "blue lantern", ["cedar key", "silver river"]],
      ["naym", "silver river", ["cedar key", "blue lantern"]],
    ] as const;

    for (const [speaker, expected, absent] of fixtures) {
      const prepared = await preparePrivateTurn({
        request: request(
          speaker,
          `Current words from ${speaker}.`,
          `${speaker}-1`,
        ),
        repository: repo,
        shelf,
        bodyBlock: "Underneath: steady.",
      });
      const prompt = prepared.messages[0].content;
      assert.match(prompt, new RegExp(expected));
      assert.match(prompt, /Current carried text/);
      assert.match(prompt, /Canonical body/);
      for (const forbidden of absent) assert.ok(!prompt.includes(forbidden));
    }
  });

  it("keeps courier authority explicit across direct and relayed turns", async () => {
    const { repo } = repository({});
    const ty = await preparePrivateTurn({
      request: request("ty", "I am speaking for myself.", "ty-direct"),
      repository: repo,
      shelf,
      bodyBlock: null,
    });
    const mica = await preparePrivateTurn({
      request: request("mica", "The lantern is blue.", "mica-verbatim"),
      repository: repo,
      shelf,
      bodyBlock: null,
    });
    const naym = await preparePrivateTurn({
      request: request("naym", "The river bends.", "naym-paraphrase"),
      repository: repo,
      shelf,
      bodyBlock: null,
    });
    assert.match(ty.messages[0].content, /Ty speaking directly/);
    assert.match(mica.messages[0].content, /carried verbatim by Ty/);
    assert.match(mica.messages[0].content, /not directly present/);
    assert.match(naym.messages[0].content, /paraphrased by Ty/);
    assert.match(naym.messages[0].content, /not a verbatim quotation/);
  });

  it("commits only model-confirmed end_turn replies to the same relation", async () => {
    const { repo, commits } = repository({});
    const prepared = await preparePrivateTurn({
      request: request("mica", "Hold this.", "mica-completion"),
      repository: repo,
      shelf,
      bodyBlock: null,
    });
    for (const stopReason of [null, "max_tokens", "tool_use", "error"]) {
      await commitPrivateTurn(prepared, "An incomplete answer", {
        stopReason,
        modelBuild: "fixture-model",
      });
    }
    assert.equal(commits.length, 0);
    await commitPrivateTurn(prepared, "A complete answer", {
      stopReason: "end_turn",
      modelBuild: "fixture-model",
    });
    assert.equal(commits.length, 1);
    assert.equal(commits[0][0].relationId, "ellis:mica");
    assert.equal(commits[0][1].relationId, "ellis:mica");
    assert.equal(commits[0][1].addresseeId, "mica");
    assert.equal(commits[0][1].content, "A complete answer");
  });

  it("separates public and private wire envelopes", () => {
    const privateRequest = request("mica", "Private words", "private-1");
    assert.equal(
      validateChatInput(privateRequest, {
        maxMessageChars: 100,
        maxHistoryMessages: 4,
      }).ok,
      false,
    );
    assert.equal(
      validatePrivateTurnInput(
        { messages: [{ role: "user", content: "public words" }] },
        100,
      ).ok,
      false,
    );
    assert.equal(validatePrivateTurnInput(privateRequest, 100).ok, true);
    assert.equal(
      validatePrivateTurnInput(
        { ...privateRequest, relationId: "ellis:naym" },
        100,
      ).ok,
      false,
    );
  });

  it("requires the private POST origin to match Ellis's host in production", () => {
    assert.equal(
      hasTrustedPrivateOrigin(
        new Headers({ origin: "https://tybuilds.tech", host: "tybuilds.tech" }),
        "https://tybuilds.tech/api/ellis/stream",
        true,
      ),
      true,
    );
    assert.equal(
      hasTrustedPrivateOrigin(
        new Headers({
          origin: "https://elsewhere.example",
          host: "tybuilds.tech",
        }),
        "https://tybuilds.tech/api/ellis/stream",
        true,
      ),
      false,
    );
    assert.equal(
      hasTrustedPrivateOrigin(
        new Headers(),
        "https://tybuilds.tech/api/ellis/stream",
        true,
      ),
      false,
    );
  });
});
