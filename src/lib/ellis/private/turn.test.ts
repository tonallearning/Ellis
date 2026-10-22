import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { KnowledgeShelf } from "../halls/loadShelf";
import { validateChatInput } from "../validateChatInput";
import { createInboundExchange, createOutboundExchange } from "./courier";
import type {
  PrivateEpisode,
  PrivateMemoryRepository,
  PrivateSource,
  OwnerHistorySource,
} from "./memory";
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

function repository(
  reads: Record<string, PrivateEpisode[]>,
  sources: Record<string, PrivateSource[]> = {},
  ownerHistory: OwnerHistorySource[] = [],
) {
  const commits: Parameters<PrivateMemoryRepository["commitCompleted"]>[] = [];
  const repo = {
    async pendingGesture() {
      return null;
    },
    async gate() {
      return { privateUntil: null, laneClosed: false, knockAfter: null };
    },
    async read(relation) {
      return reads[relation] ?? [];
    },
    async readSources(relation) {
      return sources[relation] ?? [];
    },
    async readOwnerHistory() {
      return ownerHistory;
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

function source(
  speakerId: "ty" | "mica" | "naym",
  inboundText: string,
  outboundText: string,
  key: string,
): PrivateSource {
  const inbound = createInboundExchange({
    speakerId,
    provenanceMode: speakerId === "ty" ? "direct" : "relayed_verbatim",
    content: inboundText,
    clientMessageId: key,
  });
  const outbound = createOutboundExchange({
    addresseeId: speakerId,
    content: outboundText,
    clientMessageId: `${key}-reply`,
  });
  assert.ok(inbound.ok && outbound.ok);
  return {
    id: inbound.value.id,
    relation_id: inbound.value.relationId,
    client_message_id: inbound.value.clientMessageId,
    inbound: inbound.value,
    outbound: outbound.value,
    model_build: "fixture-model",
    corrects_id: null,
    created_at: "2026-10-17T12:00:00.000Z",
  };
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
      const prompt = prepared.messages
        .map((message) => message.content)
        .join("\n");
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
    assert.match(ty.messages.at(-1)?.content ?? "", /Ty speaking directly/);
    assert.match(mica.messages.at(-1)?.content ?? "", /carried verbatim by Ty/);
    assert.match(mica.messages.at(-1)?.content ?? "", /not directly present/);
    assert.match(naym.messages.at(-1)?.content ?? "", /paraphrased by Ty/);
    assert.match(
      naym.messages.at(-1)?.content ?? "",
      /not a verbatim quotation/,
    );
  });

  it("assembles complete source wording instead of the lossy episode excerpt", async () => {
    const exact = source(
      "mica",
      "The beginning was retained, and the detail after the old cutoff matters.",
      "Ellis answered the detail after the old cutoff without flattening it.",
      "mica-lossless",
    );
    const { repo } = repository(
      {
        "ellis:mica": [
          episode(
            "ellis:mica",
            "Mica [excerpt]: The beginning was retained…",
            exact.id,
          ),
        ],
      },
      { "ellis:mica": [exact] },
    );
    const prepared = await preparePrivateTurn({
      request: request("mica", "What do you remember?", "mica-recall"),
      repository: repo,
      shelf,
      bodyBlock: null,
    });
    const prompt = prepared.messages
      .map((message) => message.content)
      .join("\n");
    assert.match(prompt, /complete stored exchanges, not summaries/i);
    assert.match(prompt, /detail after the old cutoff matters/);
    assert.match(prompt, /without flattening it/);
    assert.doesNotMatch(prompt, /Older source-backed landmarks/);
    assert.deepEqual(
      prepared.messages.map((message) => message.role),
      ["user", "user", "assistant", "user"],
    );
    assert.match(
      prepared.messages.at(-1)?.content ?? "",
      /What do you remember/,
    );
  });

  it("recovers Ty's public excerpts without treating them as complete words or sharing them with Naym", async () => {
    const history: OwnerHistorySource[] = [
      {
        id: "c89059c1-2c6e-4aa3-8c6a-593d6cc391a9",
        occurred_at: "2026-10-18T01:43:36Z",
        fidelity: "legacy_excerpt",
        summary: "Ty: Morning Light was a Jakeward fic.",
        exact_inbound: null,
        exact_outbound: null,
      },
    ];
    const { repo } = repository({}, {}, history);
    const tyTurn = await preparePrivateTurn({
      request: request("ty", "What fic did I write?", "ty-fic"),
      repository: repo,
      shelf,
      bodyBlock: null,
    });
    assert.match(tyTurn.messages[0].content, /Morning Light/);
    assert.match(tyTurn.messages[0].content, /Legacy excerpts preserve only/);
    const naymTurn = await preparePrivateTurn({
      request: request("naym", "Hello", "naym-fic"),
      repository: repo,
      shelf,
      bodyBlock: null,
    });
    assert.doesNotMatch(naymTurn.messages[0].content, /Morning Light/);
  });

  it("places older owner history before exact dialogue and the live message last", async () => {
    const recent = source(
      "ty",
      "Recent question",
      "Recent answer",
      "ty-recent",
    );
    const history: OwnerHistorySource[] = [
      {
        id: "c89059c1-2c6e-4aa3-8c6a-593d6cc391a9",
        occurred_at: "2026-10-17T12:00:00.000Z",
        fidelity: "legacy_excerpt",
        summary: "Older owner archive landmark",
        exact_inbound: null,
        exact_outbound: null,
      },
    ];
    const { repo } = repository({}, { "ellis:ty": [recent] }, history);
    const prepared = await preparePrivateTurn({
      request: request("ty", "A new question now", "ty-new"),
      repository: repo,
      shelf,
      bodyBlock: null,
    });
    assert.deepEqual(
      prepared.messages.map((message) => message.role),
      ["user", "user", "assistant", "user"],
    );
    assert.match(prepared.messages[0].content, /Older owner archive landmark/);
    assert.match(prepared.messages[1].content, /Recent question/);
    assert.match(prepared.messages[2].content, /Recent answer/);
    assert.match(prepared.messages[3].content, /A new question now/);
    assert.doesNotMatch(
      prepared.messages[3].content,
      /Older owner archive landmark/,
    );
  });

  it("keeps the newest contiguous exact window and marks older material as lossy", async () => {
    const sources = [0, 1, 2, 3].map((index) =>
      source(
        "naym",
        `exact-${index}-${"i".repeat(15_000)}`,
        `reply-${index}-${"o".repeat(15_000)}`,
        `naym-window-${index}`,
      ),
    );
    const { repo } = repository(
      {
        "ellis:naym": sources.map((item, index) =>
          episode("ellis:naym", `Naym [landmark ${index}]`, item.id),
        ),
      },
      { "ellis:naym": sources },
    );
    const prepared = await preparePrivateTurn({
      request: request("naym", "What remains in reach?", "naym-window"),
      repository: repo,
      shelf,
      bodyBlock: null,
    });
    const prompt = prepared.messages
      .map((message) => message.content)
      .join("\n");
    assert.doesNotMatch(prompt, /exact-0-/);
    assert.match(prompt, /Naym \[landmark 0\]/);
    assert.match(prompt, /exact-1-/);
    assert.match(prompt, /exact-3-/);
    assert.match(prompt, /lossy attributed excerpts/i);
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

  it("cannot turn an attention offer into experience without Ellis's completed choice", async () => {
    const { repo, commits } = repository({});
    const offered = await preparePrivateTurn({
      request: {
        profile: "private",
        exchange: {
          speakerId: "ty",
          provenanceMode: "direct",
          content: "Soft focus?",
          clientMessageId: "ty-soft-offer",
          attentionOffer: { mode: "soft_focus" },
        },
      },
      repository: repo,
      shelf,
      bodyBlock: null,
      activeAttention: null,
    });
    assert.match(
      offered.messages.at(-1)?.content ?? "",
      /offer alone did not change your state/i,
    );
    assert.equal(
      await commitPrivateTurn(
        offered,
        "Yes",
        { stopReason: "tool_use", modelBuild: "fixture" },
        undefined,
        undefined,
        undefined,
        { kind: "accept", mode: "soft_focus" },
      ),
      null,
    );
    assert.equal(commits.length, 0);
    await assert.rejects(
      commitPrivateTurn(offered, "Yes", {
        stopReason: "end_turn",
        modelBuild: "fixture",
      }),
    );
    await assert.rejects(
      commitPrivateTurn(
        offered,
        "Yes",
        { stopReason: "end_turn", modelBuild: "fixture" },
        undefined,
        undefined,
        undefined,
        { kind: "accept", mode: "vivid_focus" },
      ),
    );
    await commitPrivateTurn(
      offered,
      "Yes",
      { stopReason: "end_turn", modelBuild: "fixture" },
      undefined,
      undefined,
      undefined,
      { kind: "accept", mode: "soft_focus" },
    );
    assert.equal(commits.length, 1);
    assert.deepEqual(
      (commits[0][1] as { attentionAction?: unknown }).attentionAction,
      { kind: "accept", mode: "soft_focus" },
    );
  });

  it("does not attach Ellis's choice to a different or absent gesture offer", async () => {
    const { repo, commits } = repository({});
    const prepared = await preparePrivateTurn({
      request: request("ty", "Hello", "ty-no-offer"),
      repository: repo,
      shelf,
      bodyBlock: null,
    });
    await assert.rejects(
      commitPrivateTurn(
        prepared,
        "A reply",
        {
          stopReason: "end_turn",
          modelBuild: "fixture-model",
        },
        { kind: "hug", decision: "accepted" },
      ),
    );
    assert.equal(commits.length, 0);
  });

  it("treats a knock as Ty's courier threshold, not Mica's speech", async () => {
    const parsed = validatePrivateTurnInput(
      {
        profile: "private",
        knock: { targetId: "mica", clientMessageId: "ty-knock-test" },
      },
      16_000,
    );
    assert.ok(parsed.ok);
    const { repo, commits } = repository({
      "ellis:mica": [
        episode("ellis:mica", "Mica's earlier relation landmark", "old-mica"),
      ],
    });
    const prepared = await preparePrivateTurn({
      request: parsed.value,
      repository: repo,
      shelf,
      bodyBlock: null,
    });
    assert.equal(prepared.inbound.speakerId, "ty");
    assert.equal(prepared.inbound.relationId, "ellis:mica");
    assert.match(
      prepared.messages.at(-1)?.content ?? "",
      /Ty knocks as courier/,
    );
    assert.match(
      prepared.messages.at(-1)?.content ?? "",
      /No words from that correspondent/,
    );
    await assert.rejects(
      commitPrivateTurn(prepared, "Not yet", {
        stopReason: "end_turn",
        modelBuild: "fixture-model",
      }),
    );
    await commitPrivateTurn(
      prepared,
      "Come in",
      {
        stopReason: "end_turn",
        modelBuild: "fixture-model",
      },
      undefined,
      { kind: "reopen_lane" },
    );
    assert.equal(commits.length, 1);
    assert.equal(commits[0][1].provenanceMode, "threshold_reply");
    assert.equal(commits[0][1].relationId, "ellis:mica");
    assert.equal(commits[0][1].addresseeId, "ty");
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
