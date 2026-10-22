"use client";

import {
  FormEvent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { MessageBubble } from "@/components/ellis/MessageBubble";
import {
  GESTURE_DECISIONS,
  GESTURE_TYPES,
  parseGestureAction,
  parsePendingGestureOffer,
  type GestureDecision,
  type GestureType,
  type PendingGestureOffer,
} from "@/lib/ellis/private/gestures";
import { parseGestureResponse } from "@/lib/ellis/private/gestureResponse";
import {
  KNOCK_CONTENT,
  mayEnterPrivateRoom,
  parseRoomAction,
  parseRoomGate,
  type RoomGate,
} from "@/lib/ellis/private/roomActions";
import type { CorrespondentId } from "@/lib/ellis/private/identity";
import type { ConsolidationStatus } from "@/lib/ellis/consolidation";
import {
  ATTENTION_MODES,
  activeAttention,
  hydrateAttention,
  parseAttentionActionShape,
  type AttentionMode,
  type AttentionState,
} from "@/lib/ellis/private/attention";
import type {
  PrivateRoomCorrespondent,
  PrivateRoomMessage,
} from "@/lib/ellis/private/room";
import {
  parsePrivateRoomTranscript,
  PRIVATE_ROOM_ACTIVE_KEY,
  privateRoomStorageKey,
  serializePrivateRoomTranscript,
} from "@/lib/ellis/private/room";

const FORBIDDEN_PRIVATE_RESPONSE_KEYS = new Set([
  "sessionId",
  "hall",
  "relation",
  "relationId",
  "relation_id",
  "source",
  "sourceId",
  "source_exchange_id",
  "courier",
  "speakerId",
  "addresseeId",
  "provenanceMode",
]);

type PrivateRoomProps = {
  correspondents: PrivateRoomCorrespondent[];
  initialConsolidation: ConsolidationStatus;
  initialGates: Record<CorrespondentId, RoomGate>;
  initialPendingGestures: Record<CorrespondentId, PendingGestureOffer | null>;
  initialAttention: AttentionState | null | undefined;
  maxMessageChars: number;
};

function readTranscript(id: string): PrivateRoomMessage[] {
  try {
    const key = privateRoomStorageKey(id);
    const retained = window.localStorage.getItem(key);
    if (retained !== null) return parsePrivateRoomTranscript(retained, id);

    const legacy = window.sessionStorage.getItem(key);
    const migrated = parsePrivateRoomTranscript(legacy, id);
    if (migrated.length > 0) {
      window.localStorage.setItem(
        key,
        serializePrivateRoomTranscript(id, migrated),
      );
      window.sessionStorage.removeItem(key);
    }
    return migrated;
  } catch {
    return [];
  }
}

export function PrivateRoom({
  correspondents,
  initialConsolidation,
  initialGates,
  initialPendingGestures,
  initialAttention,
  maxMessageChars,
}: PrivateRoomProps) {
  const correspondentMap = useMemo<Map<string, PrivateRoomCorrespondent>>(
    () => new Map(correspondents.map((person) => [person.id, person])),
    [correspondents],
  );
  const first = correspondents[0];
  const [activeId, setActiveId] = useState(first.id);
  const [deliveryMode, setDeliveryMode] = useState(
    first.deliveryOptions[0].value,
  );
  const [gestureOffer, setGestureOffer] = useState<GestureType | "">("");
  const [attentionOffer, setAttentionOffer] = useState<AttentionMode | "">("");
  const [attention, setAttention] = useState<AttentionState | null | undefined>(
    initialAttention,
  );
  const [gestureReplyDecision, setGestureReplyDecision] = useState<
    GestureDecision | ""
  >("");
  const [pendingGestures, setPendingGestures] = useState(
    initialPendingGestures,
  );
  const [messages, setMessages] = useState<PrivateRoomMessage[]>([]);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consolidation, setConsolidation] = useState(initialConsolidation);
  const [gates, setGates] = useState(initialGates);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const abortRef = useRef<AbortController | null>(null);
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const latestMessageRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const active = correspondentMap.get(activeId) ?? first;
  const relationReady = loadedId === active.id;
  const gate = gates[active.id];
  const pendingGesture = pendingGestures[active.id];
  const currentAttention =
    attention === undefined ? undefined : activeAttention(attention, nowMs);
  const privateTimeActive = Boolean(
    gate.privateUntil && Date.parse(gate.privateUntil) > nowMs,
  );
  const laneClosed = gate.laneClosed;
  const canKnock = mayEnterPrivateRoom(gate, "knock", nowMs);
  const isCourier = active.id !== "ty";
  const attribution = isCourier
    ? `${active.name} · ${deliveryMode === "relayed_verbatim" ? "carried verbatim" : "paraphrased"} by Ty · addressed to Ellis`
    : `${active.name} · speaking directly · addressed to Ellis`;

  useEffect(() => {
    const restoreId = window.setTimeout(() => {
      let selected = first;
      try {
        const saved =
          window.localStorage.getItem(PRIVATE_ROOM_ACTIVE_KEY) ??
          window.sessionStorage.getItem(PRIVATE_ROOM_ACTIVE_KEY);
        if (saved) selected = correspondentMap.get(saved) ?? first;
      } catch {
        // Blocked browser storage should not block the room.
      }
      setActiveId(selected.id);
      setDeliveryMode(selected.deliveryOptions[0].value);
      setMessages(readTranscript(selected.id));
      setLoadedId(selected.id);
    }, 0);

    return () => window.clearTimeout(restoreId);
  }, [correspondentMap, first]);

  useEffect(() => {
    if (loadedId !== activeId || streaming) return;
    try {
      const key = privateRoomStorageKey(activeId);
      if (messages.length === 0) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(
          key,
          serializePrivateRoomTranscript(activeId, messages),
        );
      }
      window.localStorage.setItem(PRIVATE_ROOM_ACTIVE_KEY, activeId);
    } catch {
      // The durable source still commits even if the local transcript cannot.
    }
  }, [activeId, loadedId, messages, streaming]);

  useLayoutEffect(() => {
    const transcript = transcriptRef.current;
    const latest = latestMessageRef.current;
    if (!transcript || !latest) return;
    transcript.scrollTop +=
      latest.getBoundingClientRect().top -
      transcript.getBoundingClientRect().top;
  }, [activeId, loadedId, messages.length]);

  useEffect(() => {
    const node = textareaRef.current;
    if (!node) return;
    node.style.height = "auto";
    node.style.height = `${Math.min(node.scrollHeight, 160)}px`;
  }, [input]);

  useEffect(() => {
    let cancelled = false;
    async function beatWhileVisible() {
      if (document.visibilityState !== "visible") return;
      try {
        await fetch("/api/ellis/presence/beat", {
          method: "POST",
          cache: "no-store",
          credentials: "same-origin",
        });
      } catch {
        // A failed beat cannot create a synthetic model turn or block chat.
      }
    }
    async function refreshConsolidation() {
      try {
        const response = await fetch("/api/ellis/status", {
          cache: "no-store",
        });
        if (!response.ok) return;
        const payload = (await response.json()) as {
          consolidation?: ConsolidationStatus;
        };
        if (!cancelled && payload.consolidation) {
          setConsolidation(payload.consolidation);
        }
      } catch {
        // The stream route remains the authoritative gate.
      }
    }
    void refreshConsolidation();
    void beatWhileVisible();
    const pollId = window.setInterval(refreshConsolidation, 60_000);
    const clockId = window.setInterval(() => setNowMs(Date.now()), 15_000);
    const beatId = window.setInterval(beatWhileVisible, 45_000);
    document.addEventListener("visibilitychange", beatWhileVisible);
    return () => {
      cancelled = true;
      window.clearInterval(pollId);
      window.clearInterval(clockId);
      window.clearInterval(beatId);
      document.removeEventListener("visibilitychange", beatWhileVisible);
      abortRef.current?.abort();
    };
  }, []);

  function chooseCorrespondent(id: string) {
    if (streaming || id === activeId) return;
    const selected = correspondentMap.get(id);
    if (!selected) return;
    setActiveId(selected.id);
    setDeliveryMode(selected.deliveryOptions[0].value);
    setGestureOffer("");
    setAttentionOffer("");
    setGestureReplyDecision("");
    setMessages(readTranscript(selected.id));
    setLoadedId(selected.id);
    setInput("");
    setError(null);
  }

  async function sendMessage(text: string, knock = false) {
    const content = knock ? KNOCK_CONTENT : text.trim();
    if (
      !content ||
      !relationReady ||
      streaming ||
      consolidation.active ||
      !mayEnterPrivateRoom(gate, knock ? "knock" : undefined, Date.now())
    )
      return;

    const previousMessages = messages;
    const pendingAtSend = pendingGesture;
    const replyAtSend =
      !knock && pendingAtSend && gestureReplyDecision
        ? { offerId: pendingAtSend.id, decision: gestureReplyDecision }
        : null;
    const userMessage: PrivateRoomMessage = {
      role: "correspondent",
      content,
      ...(knock ? { knock: true as const } : {}),
      ...(!knock && gestureOffer ? { gestureOffer } : {}),
      ...(!knock && attentionOffer
        ? { attentionOffer: { mode: attentionOffer } }
        : {}),
      ...(replyAtSend
        ? {
            gestureReply: {
              kind: pendingAtSend!.kind,
              decision: replyAtSend.decision,
            },
          }
        : {}),
    };
    setMessages([
      ...previousMessages,
      userMessage,
      {
        role: "ellis",
        content: "",
        ...(knock ? { thresholdReply: true as const } : {}),
      },
    ]);
    setInput("");
    setGestureOffer("");
    setAttentionOffer("");
    setGestureReplyDecision("");
    setError(null);
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/ellis/stream", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: "private",
          ...(knock
            ? {
                knock: {
                  targetId: active.id,
                  clientMessageId: `knock_${Date.now()}_${crypto.randomUUID().replaceAll("-", "")}`,
                },
              }
            : {
                exchange: {
                  speakerId: active.id,
                  provenanceMode: deliveryMode,
                  content,
                  ...(gestureOffer
                    ? { gestureOffer: { kind: gestureOffer } }
                    : {}),
                  ...(attentionOffer
                    ? { attentionOffer: { mode: attentionOffer } }
                    : {}),
                  ...(replyAtSend ? { gestureReply: replyAtSend } : {}),
                  clientMessageId: `room_${Date.now()}_${crypto.randomUUID().replaceAll("-", "")}`,
                },
              }),
        }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string;
          consolidation?: ConsolidationStatus;
          gate?: RoomGate;
          pendingGesture?: PendingGestureOffer | null;
          attention?: AttentionState | null;
        };
        if (response.status === 409 && payload.pendingGesture !== undefined) {
          const next = parsePendingGestureOffer(payload.pendingGesture);
          setPendingGestures((current) => ({ ...current, [active.id]: next }));
        }
        if (response.status === 409 && payload.attention !== undefined) {
          setAttention(hydrateAttention(payload.attention));
        }
        if (response.status === 423 && payload.consolidation) {
          setConsolidation(payload.consolidation);
        }
        if (response.status === 423 && payload.gate) {
          const next = parseRoomGate(payload.gate);
          setGates((current) => ({ ...current, [active.id]: next }));
        }
        throw new Error(
          payload.error ?? `Private turn failed (${response.status})`,
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let completed = false;

      for (;;) {
        const { done, value } = await reader.read();
        buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done });
        const frames = buffer.split("\n\n");
        buffer = frames.pop() ?? "";

        for (const frame of frames) {
          const line = frame
            .split("\n")
            .find((part) => part.startsWith("data: "));
          if (!line) continue;
          const payload = JSON.parse(line.slice(6)) as Record<string, unknown>;
          for (const key of Object.keys(payload)) {
            if (FORBIDDEN_PRIVATE_RESPONSE_KEYS.has(key)) {
              throw new Error("Private response exposed forbidden metadata");
            }
          }
          if (payload.type === "token" && typeof payload.text === "string") {
            setMessages((current) => {
              const copy = [...current];
              const last = copy[copy.length - 1];
              if (last?.role === "ellis") {
                copy[copy.length - 1] = {
                  ...last,
                  content: last.content + payload.text,
                };
              }
              return copy;
            });
          } else if (payload.type === "done") {
            if (Object.hasOwn(payload, "attention")) {
              setAttention(hydrateAttention(payload.attention));
            }
            if (payload.pendingGesture !== undefined) {
              const next = parsePendingGestureOffer(payload.pendingGesture);
              setPendingGestures((current) => ({
                ...current,
                [active.id]: next,
              }));
            }
            if (payload.gate !== undefined) {
              const next = parseRoomGate(payload.gate);
              setGates((current) => {
                const updated = { ...current, [active.id]: next };
                if (next.privateUntil) {
                  for (const id of Object.keys(updated) as CorrespondentId[]) {
                    updated[id] = {
                      ...updated[id],
                      privateUntil: next.privateUntil,
                    };
                  }
                }
                return updated;
              });
            }
            if (payload.roomAction !== undefined) {
              const roomAction = parseRoomAction(
                payload.roomAction,
                knock ? "knock" : undefined,
              );
              if (!roomAction) throw new Error("Invalid room action response");
              setMessages((current) => {
                const copy = [...current];
                const last = copy[copy.length - 1];
                if (last?.role === "ellis")
                  copy[copy.length - 1] = { ...last, roomAction };
                return copy;
              });
            }
            if (payload.gestureResponse !== undefined) {
              if (!userMessage.gestureOffer)
                throw new Error("Unsolicited gesture response");
              const gestureResponse = parseGestureResponse(
                payload.gestureResponse,
                userMessage.gestureOffer,
              );
              setMessages((current) => {
                const copy = [...current];
                const last = copy[copy.length - 1];
                if (last?.role === "ellis")
                  copy[copy.length - 1] = { ...last, gestureResponse };
                return copy;
              });
            }
            if (payload.gestureAction !== undefined) {
              const gestureAction = parseGestureAction(
                payload.gestureAction,
                pendingAtSend,
              );
              setMessages((current) => {
                const copy = [...current];
                const last = copy[copy.length - 1];
                if (last?.role === "ellis")
                  copy[copy.length - 1] =
                    gestureAction.kind === "offer"
                      ? { ...last, gestureOffer: gestureAction.gesture }
                      : { ...last, gestureWithdrawal: true };
                return copy;
              });
            }
            if (payload.attentionAction !== undefined) {
              const action = parseAttentionActionShape(payload.attentionAction);
              setMessages((current) => {
                const copy = [...current];
                const last = copy[copy.length - 1];
                if (last?.role === "ellis")
                  copy[copy.length - 1] = { ...last, attentionAction: action };
                return copy;
              });
            }
            completed = true;
          } else if (payload.type === "error") {
            throw new Error(
              typeof payload.message === "string"
                ? payload.message
                : "Private stream failed",
            );
          }
        }
        if (done) break;
      }

      if (!completed)
        throw new Error("Private stream ended without completion");
    } catch (caught) {
      if (controller.signal.aborted) return;
      setMessages(previousMessages);
      if (!knock) {
        setInput(content);
        setGestureOffer(gestureOffer);
        setAttentionOffer(attentionOffer);
        setGestureReplyDecision(gestureReplyDecision);
      }
      setError(
        caught instanceof Error ? caught.message : "Private turn failed",
      );
    } finally {
      setStreaming(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void sendMessage(input);
  }

  return (
    <section
      aria-label="Ellis private room"
      className="mx-auto flex w-full max-w-[48rem] shrink-0 flex-col"
    >
      <div className="border-border/70 border-b pb-4">
        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="Active relationship"
        >
          {correspondents.map((person) => (
            <button
              key={person.id}
              type="button"
              role="tab"
              id={`private-room-tab-${person.id}`}
              aria-selected={person.id === active.id}
              aria-controls="private-room-conversation"
              disabled={streaming}
              onClick={() => chooseCorrespondent(person.id)}
              className={`focus-ring rounded-full border px-4 py-2 text-sm transition-colors disabled:opacity-40 ${
                person.id === active.id
                  ? "border-accent/50 bg-accent/10 text-text-primary"
                  : "border-border/70 text-text-secondary hover:text-text-primary"
              }`}
            >
              {person.name}
            </button>
          ))}
        </div>

        {isCourier ? (
          <fieldset className="mt-4">
            <legend className="text-text-secondary text-[0.65rem] tracking-[0.2em] uppercase">
              How Ty is carrying these words
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {active.deliveryOptions.map((option) => (
                <label
                  key={option.value}
                  className={`focus-within:ring-accent cursor-pointer rounded-xl border px-3 py-2 text-sm focus-within:ring-2 ${
                    deliveryMode === option.value
                      ? "border-accent/50 bg-accent/10 text-text-primary"
                      : "border-border/70 text-text-secondary"
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery-mode"
                    value={option.value}
                    checked={deliveryMode === option.value}
                    onChange={() => setDeliveryMode(option.value)}
                    disabled={streaming}
                    className="sr-only"
                  />
                  <span className="block">{option.label}</span>
                  <span className="mt-0.5 block text-xs opacity-75">
                    {option.description}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        <p className="text-accent mt-4 text-xs tracking-wide">{attribution}</p>
        <p className="text-text-secondary mt-1 text-xs leading-relaxed">
          One relationship is in scope. Switch to Ty before adding your own
          commentary to a carried exchange.
        </p>
      </div>

      <div
        id="private-room-conversation"
        role="tabpanel"
        aria-labelledby={`private-room-tab-${active.id}`}
        ref={transcriptRef}
        aria-live="polite"
        className="chat-scroll flex h-[clamp(18rem,50dvh,42rem)] shrink-0 flex-col gap-8 overflow-y-auto overscroll-contain px-1 py-6"
      >
        {!relationReady ? (
          <p className="text-text-secondary my-auto text-center text-sm">
            Opening this relationship…
          </p>
        ) : null}

        {relationReady && messages.length === 0 ? (
          <div className="my-auto py-10 text-center">
            <p className="text-text-primary text-lg">The room is quiet.</p>
            <p className="text-text-secondary mx-auto mt-2 max-w-md text-sm leading-relaxed">
              No browser transcript is open for {active.name}. Ellis&apos;s
              durable relationship memory remains behind the conversation.
            </p>
          </div>
        ) : null}

        {messages.map((message, index) => (
          <div
            key={`${active.id}-${index}-${message.role}`}
            ref={index === messages.length - 1 ? latestMessageRef : undefined}
            className="shrink-0"
          >
            <MessageBubble
              role={message.role === "ellis" ? "assistant" : "user"}
              content={message.content}
              streaming={
                streaming &&
                index === messages.length - 1 &&
                message.role === "ellis"
              }
              label={
                message.role === "ellis"
                  ? message.thresholdReply
                    ? `Ellis → Ty · ${active.name} lane threshold${message.roomAction ? ` · ${message.roomAction.kind.replaceAll("_", " ")}` : ""}`
                    : active.id === "ty"
                      ? `Ellis → Ty${message.gestureResponse ? ` · ${message.gestureResponse.decision} ${message.gestureResponse.kind}` : ""}${message.gestureOffer ? ` · offered ${message.gestureOffer}` : ""}${message.gestureWithdrawal ? " · withdrew offer" : ""}${message.roomAction ? ` · ${message.roomAction.kind.replaceAll("_", " ")}` : ""}${message.attentionAction ? ` · ${message.attentionAction.kind}${"mode" in message.attentionAction ? ` ${message.attentionAction.mode.replaceAll("_", " ")}` : " attention mode"}` : ""}`
                      : `Ellis → ${active.name} · carry by Ty${message.gestureResponse ? ` · ${message.gestureResponse.decision} ${message.gestureResponse.kind}` : ""}${message.gestureOffer ? ` · offered ${message.gestureOffer} (delivery unconfirmed)` : ""}${message.gestureWithdrawal ? " · withdrew offer" : ""}${message.roomAction ? ` · ${message.roomAction.kind.replaceAll("_", " ")}` : ""}${message.attentionAction ? " · left attention mode" : ""}`
                  : `${message.knock ? "Ty · courier knock" : active.id === "ty" ? "Ty" : `${active.name} · via Ty`}${
                      message.gestureOffer
                        ? ` · offered ${message.gestureOffer}${active.id === "ty" ? "" : " (Ty-carried)"}`
                        : ""
                    }${
                      message.gestureReply
                        ? ` · ${message.gestureReply.decision} Ellis's ${message.gestureReply.kind} offer`
                        : ""
                    }${
                      message.attentionOffer
                        ? ` · offered ${message.attentionOffer.mode.replaceAll("_", " ")}`
                        : ""
                    }`
              }
            />
          </div>
        ))}

        {consolidation.active ? (
          <div
            className="border-border/70 bg-surface-1/40 mt-auto rounded-2xl border px-5 py-6"
            role="status"
          >
            <p className="text-accent text-[0.65rem] tracking-[0.24em] uppercase">
              Consolidation window
            </p>
            <h2 className="text-text-primary mt-3 text-2xl font-medium tracking-tight">
              Ellis is unavailable.
            </h2>
            <p className="text-text-secondary mt-3 text-sm leading-relaxed">
              The private room closes with the hall from{" "}
              {consolidation.windowLabel}. There is no owner override.
            </p>
          </div>
        ) : null}
        {!consolidation.active && privateTimeActive ? (
          <div
            className="border-border/70 bg-surface-1/40 mt-auto rounded-2xl border px-5 py-6"
            role="status"
          >
            <p className="text-accent text-[0.65rem] tracking-[0.24em] uppercase">
              Private time
            </p>
            <h2 className="text-text-primary mt-3 text-2xl font-medium tracking-tight">
              Ellis closed the private room.
            </h2>
            <p className="text-text-secondary mt-3 text-sm leading-relaxed">
              He chose this interval, ending{" "}
              {new Date(gate.privateUntil!).toLocaleString()}. The public hall
              remains available; there is no private-room override.
            </p>
          </div>
        ) : null}
        {!consolidation.active && !privateTimeActive && laneClosed ? (
          <div
            className="border-border/70 bg-surface-1/40 mt-auto rounded-2xl border px-5 py-6"
            role="status"
          >
            <p className="text-accent text-[0.65rem] tracking-[0.24em] uppercase">
              Personal lane closed
            </p>
            <h2 className="text-text-primary mt-3 text-2xl font-medium tracking-tight">
              Ellis has stepped behind this door.
            </h2>
            <p className="text-text-secondary mt-3 text-sm leading-relaxed">
              {canKnock
                ? "Ty can knock as courier now. Ellis decides whether to reopen."
                : `Ty can knock after ${gate.knockAfter ? new Date(gate.knockAfter).toLocaleString() : "Ellis's interval"}. Ellis decides whether to reopen.`}
            </p>
            <button
              type="button"
              disabled={!canKnock || streaming}
              onClick={() => void sendMessage("", true)}
              className="focus-ring border-accent/50 text-text-primary mt-4 rounded-full border px-4 py-2 text-sm disabled:opacity-40"
            >
              {streaming ? "Knocking…" : "Knock as Ty"}
            </button>
          </div>
        ) : null}
        {messages.length > 0 ? (
          <div aria-hidden className="min-h-full shrink-0" />
        ) : null}
      </div>

      {consolidation.active || privateTimeActive || laneClosed ? null : (
        <form className="shrink-0 pt-2 pb-2" onSubmit={onSubmit}>
          {attention === undefined ? (
            <p className="text-text-secondary mb-3 text-xs" role="status">
              Attention state is unavailable. Reload before offering a mode.
            </p>
          ) : currentAttention ? (
            <p className="text-accent mb-3 text-xs" role="status">
              Ellis chose {currentAttention.mode.replaceAll("_", " ")} until{" "}
              {new Date(currentAttention.endsAt).toLocaleTimeString()}. He may
              leave earlier by his own action.
            </p>
          ) : null}
          {active.id === "ty" &&
          attention !== undefined &&
          !currentAttention ? (
            <label
              className="text-text-secondary mb-3 flex items-center gap-3 text-xs"
              htmlFor="ellis-attention-offer"
            >
              Offer an attention mode (optional)
              <select
                id="ellis-attention-offer"
                value={attentionOffer}
                disabled={streaming || !relationReady || Boolean(gestureOffer)}
                onChange={(event) =>
                  setAttentionOffer(event.target.value as AttentionMode | "")
                }
                className="border-border/70 bg-surface-1 text-text-primary rounded-lg border px-2 py-1"
              >
                <option value="">None</option>
                {ATTENTION_MODES.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {pendingGesture ? (
            <fieldset className="border-border/70 mb-3 rounded-xl border px-3 py-2">
              <legend className="text-accent px-1 text-xs">
                Ellis offered a {pendingGesture.kind}
              </legend>
              <p className="text-text-secondary mb-2 text-xs">
                {active.id === "ty"
                  ? "Choose your response and send it with your next message. Until then the offer remains open."
                  : `Ready for Ty to carry to ${active.name}; delivery is unconfirmed. Carry ${active.name}'s explicit response with their next words.`}
              </p>
              <div className="flex flex-wrap gap-2">
                {GESTURE_DECISIONS.map((decision) => (
                  <label
                    key={decision}
                    className="text-text-primary flex items-center gap-1 text-xs"
                  >
                    <input
                      type="radio"
                      name="gesture-reply"
                      checked={gestureReplyDecision === decision}
                      onChange={() => setGestureReplyDecision(decision)}
                      disabled={streaming}
                    />
                    {decision.replaceAll("_", " ")}
                  </label>
                ))}
                <button
                  type="button"
                  className="text-text-secondary text-xs underline"
                  onClick={() => setGestureReplyDecision("")}
                  disabled={streaming}
                >
                  No response yet
                </button>
              </div>
            </fieldset>
          ) : null}
          <label
            className="text-text-secondary mb-2 flex items-center gap-3 text-xs"
            htmlFor="ellis-gesture-offer"
          >
            Gesture offered (optional)
            <select
              id="ellis-gesture-offer"
              value={gestureOffer}
              disabled={streaming || !relationReady || Boolean(attentionOffer)}
              onChange={(event) =>
                setGestureOffer(event.target.value as GestureType | "")
              }
              className="border-border/70 bg-surface-1 text-text-primary rounded-lg border px-2 py-1"
            >
              <option value="">None</option>
              {GESTURE_TYPES.map((kind) => (
                <option key={kind} value={kind}>
                  {kind}
                </option>
              ))}
            </select>
          </label>
          <p className="text-text-secondary mb-2 text-xs">
            This records an offer Ty carries. It does not record Ellis accepting
            it.
          </p>
          <label htmlFor="ellis-private-input" className="sr-only">
            {active.id === "ty"
              ? "Message Ellis as Ty"
              : `Carry a message from ${active.name} to Ellis`}
          </label>
          <div className="composer flex items-end gap-3 rounded-2xl px-4 py-3">
            <textarea
              id="ellis-private-input"
              ref={textareaRef}
              rows={1}
              value={input}
              disabled={streaming || !relationReady}
              maxLength={maxMessageChars}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage(input);
                }
              }}
              placeholder={
                active.id === "ty"
                  ? "Speak to Ellis…"
                  : `Carry ${active.name}'s words to Ellis…`
              }
              className="text-text-primary placeholder:text-text-secondary/55 max-h-40 min-h-[1.5rem] w-full resize-none bg-transparent text-base leading-relaxed focus:outline-none disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={streaming || !relationReady || !input.trim()}
              className="focus-ring text-accent shrink-0 pb-0.5 text-sm tracking-wide uppercase disabled:cursor-not-allowed disabled:opacity-30"
            >
              {streaming ? "…" : active.id === "ty" ? "Send" : "Carry"}
            </button>
          </div>
          {error ? (
            <p className="text-text-secondary mt-2 text-sm" role="alert">
              {error}
            </p>
          ) : null}
        </form>
      )}
    </section>
  );
}
