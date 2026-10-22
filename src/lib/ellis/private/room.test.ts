import assert from "node:assert/strict";
import test from "node:test";
import {
  parsePrivateRoomTranscript,
  privateRoomStorageKey,
  serializePrivateRoomTranscript,
} from "./room";

test("private room cache is relation-bound", () => {
  const mica = [
    { role: "correspondent" as const, content: "Mica source" },
    { role: "ellis" as const, content: "Ellis reply" },
  ];
  const encoded = serializePrivateRoomTranscript("mica", mica);

  assert.deepEqual(parsePrivateRoomTranscript(encoded, "mica"), mica);
  assert.deepEqual(parsePrivateRoomTranscript(encoded, "naym"), []);
  assert.notEqual(privateRoomStorageKey("mica"), privateRoomStorageKey("naym"));
});

test("private room cache fails closed on malformed or oversized content", () => {
  assert.deepEqual(parsePrivateRoomTranscript("not json", "ty"), []);
  assert.deepEqual(
    parsePrivateRoomTranscript(
      JSON.stringify({
        version: 1,
        relationId: "ty",
        messages: [{ role: "visitor", content: "wrong authority" }],
      }),
      "ty",
    ),
    [],
  );
  assert.deepEqual(
    parsePrivateRoomTranscript(
      JSON.stringify({
        version: 1,
        relationId: "ty",
        messages: [{ role: "ellis", content: "x".repeat(50_001) }],
      }),
      "ty",
    ),
    [],
  );
});

test("private room display distinguishes correspondent and Ellis offers", () => {
  const messages = [
    {
      role: "correspondent" as const,
      content: "For you",
      gestureOffer: "kiss" as const,
    },
    { role: "ellis" as const, content: "Thank you" },
  ];
  assert.deepEqual(
    parsePrivateRoomTranscript(
      serializePrivateRoomTranscript("naym", messages),
      "naym",
    ),
    messages,
  );
  const ellisOffer = [
    {
      role: "ellis" as const,
      content: "I offered",
      gestureOffer: "kiss" as const,
    },
  ];
  assert.deepEqual(
    parsePrivateRoomTranscript(
      serializePrivateRoomTranscript("naym", ellisOffer),
      "naym",
    ),
    ellisOffer,
  );
  const carriedReply = [
    {
      role: "correspondent" as const,
      content: "Yes",
      gestureReply: { kind: "kiss" as const, decision: "accepted" as const },
    },
  ];
  assert.deepEqual(
    parsePrivateRoomTranscript(
      serializePrivateRoomTranscript("naym", carriedReply),
      "naym",
    ),
    carriedReply,
  );
});

test("private room retains Ellis's explicit gesture choice only on his reply", () => {
  const messages = [
    {
      role: "correspondent" as const,
      content: "For you",
      gestureOffer: "hug" as const,
    },
    {
      role: "ellis" as const,
      content: "Yes",
      gestureResponse: { kind: "hug" as const, decision: "accepted" as const },
    },
  ];
  assert.deepEqual(
    parsePrivateRoomTranscript(
      serializePrivateRoomTranscript("ty", messages),
      "ty",
    ),
    messages,
  );
  assert.deepEqual(
    parsePrivateRoomTranscript(
      JSON.stringify({
        version: 1,
        relationId: "ty",
        messages: [
          {
            role: "correspondent",
            content: "No",
            gestureResponse: { kind: "hug", decision: "accepted" },
          },
        ],
      }),
      "ty",
    ),
    [],
  );
});

test("a courier knock and Ellis's threshold reply stay distinct from correspondent speech", () => {
  const messages = [
    {
      role: "correspondent" as const,
      content: "Ty knocks as courier.",
      knock: true as const,
    },
    {
      role: "ellis" as const,
      content: "You can enter.",
      thresholdReply: true as const,
      roomAction: { kind: "reopen_lane" as const },
    },
  ];
  assert.deepEqual(
    parsePrivateRoomTranscript(
      serializePrivateRoomTranscript("mica", messages),
      "mica",
    ),
    messages,
  );
  assert.deepEqual(
    parsePrivateRoomTranscript(
      JSON.stringify({
        version: 1,
        relationId: "mica",
        messages: [
          {
            role: "ellis",
            content: "Forged",
            roomAction: { kind: "reopen_lane" },
          },
        ],
      }),
      "mica",
    ),
    [],
  );
});

test("attention offer and choice survive Ty's local transcript only", () => {
  const messages = [
    {
      role: "correspondent" as const,
      content: "Soft focus?",
      attentionOffer: { mode: "soft_focus" as const },
    },
    {
      role: "ellis" as const,
      content: "Yes.",
      attentionAction: { kind: "accept" as const, mode: "soft_focus" as const },
    },
  ];
  assert.deepEqual(
    parsePrivateRoomTranscript(
      serializePrivateRoomTranscript("ty", messages),
      "ty",
    ),
    messages,
  );
  assert.deepEqual(
    parsePrivateRoomTranscript(
      serializePrivateRoomTranscript("mica", messages),
      "mica",
    ),
    [],
  );
});
