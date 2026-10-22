import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { createOwnerCookieValue } from "../owner";
import {
  createCourierKnock,
  createInboundExchange,
  createOutboundExchange,
  createThresholdReply,
} from "./courier";
import { createPrivateMemoryRepository, type PrivateMemoryRpc } from "./memory";

function pair(speaker: "ty" | "mica" | "naym", text: string, key: string) {
  const inbound = createInboundExchange({
    speakerId: speaker,
    provenanceMode: speaker === "ty" ? "direct" : "relayed_verbatim",
    content: text,
    clientMessageId: key,
  });
  const outbound = createOutboundExchange({
    addresseeId: speaker,
    content: `I heard: ${text}`,
    clientMessageId: `${key}-reply`,
  });
  assert.ok(inbound.ok && outbound.ok);
  return { inbound: inbound.value, outbound: outbound.value };
}

test("private memory PostgreSQL contract with populated relations", async (t) => {
  const db = new PGlite();
  const previousSecret = process.env.ELLIS_ONBOARDING_SECRET;
  process.env.ELLIS_ONBOARDING_SECRET = "private-memory-test-secret-only";
  const cookie = createOwnerCookieValue(process.env.ELLIS_ONBOARDING_SECRET);
  const cookies = { get: () => ({ value: cookie }) };
  const completion = {
    stopReason: "end_turn",
    modelBuild: "fixture-model/build-p3",
  };
  try {
    await db.exec(
      "create role anon; create role authenticated; create role service_role bypassrls; grant usage on schema public to anon, authenticated, service_role;",
    );
    await db.exec(
      readFileSync(
        "supabase/migrations/20261017231203_ellis_private_memory.sql",
        "utf8",
      ),
    );
    await db.exec(
      readFileSync(
        "supabase/migrations/20261018184416_private_memory_source_reads.sql",
        "utf8",
      ),
    );
    await db.exec(
      "create table public.ellis_visitor_memory(ip_hash text primary key, episodic_beats jsonb not null)",
    );
    await db.query(
      "insert into public.ellis_visitor_memory(ip_hash,episodic_beats) values ('owner',$1::jsonb)",
      [
        JSON.stringify([
          {
            beatId: "c89059c1-2c6e-4aa3-8c6a-593d6cc391a9",
            occurredAt: "2026-10-17T01:43:36.039Z",
            summary:
              "Ty: At fourteen I wrote Morning Light, a Jakeward fic. | Ellis: I heard you.",
          },
        ]),
      ],
    );
    await db.exec(
      readFileSync(
        "supabase/migrations/20261018191719_owner_history_recovery.sql",
        "utf8",
      ),
    );
    await db.exec(
      readFileSync(
        "supabase/migrations/20261019011026_ellis_private_gesture_offers.sql",
        "utf8",
      ),
    );
    await db.exec(
      readFileSync(
        "supabase/migrations/20261019015016_ellis_private_gesture_response.sql",
        "utf8",
      ),
    );
    await db.exec(
      readFileSync(
        "supabase/migrations/20261019020633_ellis_private_room_actions.sql",
        "utf8",
      ),
    );
    await db.exec(
      readFileSync(
        "supabase/migrations/20261019021826_ellis_private_room_atomic_gate.sql",
        "utf8",
      ),
    );
    await db.exec(
      readFileSync(
        "supabase/migrations/20261019185035_ellis_reciprocal_gestures.sql",
        "utf8",
      ),
    );
    await db.exec(
      readFileSync("supabase/migrations/20260821000000_ellis_body.sql", "utf8"),
    );
    await db.exec(
      readFileSync(
        "supabase/migrations/20261019010052_ellis_body_systems.sql",
        "utf8",
      ),
    );
    await db.exec(
      readFileSync(
        "supabase/migrations/20261019213915_ellis_private_attention.sql",
        "utf8",
      ),
    );
    await db.exec("set role service_role");
    const rpc: PrivateMemoryRpc = {
      async rpc(name, args) {
        try {
          const result =
            name === "ellis_owner_history_read"
              ? await db.query<{ value: unknown }>(
                  "select public.ellis_owner_history_read($1) as value",
                  [args.p_limit],
                )
              : name === "ellis_private_room_gate"
                ? await db.query<{ value: unknown }>(
                    "select public.ellis_private_room_gate($1) as value",
                    [args.p_relation],
                  )
                : name === "ellis_private_pending_gesture"
                  ? await db.query<{ value: unknown }>(
                      "select public.ellis_private_pending_gesture($1) as value",
                      [args.p_relation],
                    )
                  : name === "ellis_private_sources"
                    ? await db.query<{ value: unknown }>(
                        "select public.ellis_private_sources($1,$2) as value",
                        [args.p_relation, args.p_limit],
                      )
                    : await db.query<{ value: unknown }>(
                        "select public.ellis_private_memory($1,$2,$3::jsonb) as value",
                        [
                          args.p_relation,
                          args.p_action,
                          JSON.stringify(args.p_payload),
                        ],
                      );
          return { data: result.rows[0].value, error: null };
        } catch (error) {
          return { data: null, error };
        }
      },
    };
    const repo = createPrivateMemoryRepository(cookies, rpc);
    const mica = pair("mica", "The lantern is blue.", "mica-lantern");
    const naym = pair("naym", "The river is silver.", "naym-river");
    const ty = pair("ty", "I think Mica meant green.", "ty-interpretation");
    // Exercise the interpretation variant, keeping it in Ty's partition.
    assert.equal(ty.inbound.speakerId, "ty");
    ty.inbound = {
      ...ty.inbound,
      speakerId: "ty",
      relationId: "ellis:ty",
      direction: "inbound",
      addresseeId: "ellis",
      provenanceMode: "carrier_interpretation",
    };

    await t.test(
      "completed pairs persist and retrieval isolates all three relations",
      async () => {
        for (const p of [mica, naym, ty])
          await repo.commitCompleted(p.inbound, p.outbound, completion);
        const m = await repo.read("ellis:mica");
        const n = await repo.read("ellis:naym");
        assert.equal(m.length, 1);
        assert.equal(n.length, 1);
        assert.match(m[0].summary, /blue/);
        assert.ok(!JSON.stringify(m).includes("silver"));
        assert.match(n[0].summary, /silver/);
        assert.ok(!JSON.stringify(n).includes("blue"));
        assert.equal(await repo.source("ellis:naym", mica.inbound.id), null);
        assert.equal(
          await repo.deleteSource("ellis:naym", mica.inbound.id),
          false,
        );
        assert.match(
          (await repo.read("ellis:ty"))[0].summary,
          /carrier_interpretation/,
        );
        assert.equal(
          (await repo.source("ellis:mica", mica.inbound.id))?.outbound?.content,
          mica.outbound.content,
        );
        const exact = await repo.readSources("ellis:mica");
        assert.equal(exact.length, 1);
        assert.equal(exact[0].inbound.content, mica.inbound.content);
        assert.equal(exact[0].outbound?.content, mica.outbound.content);
      },
    );

    await t.test(
      "owner archive preserves old excerpts and later exact turns",
      async () => {
        const recovered = await repo.readOwnerHistory();
        assert.equal(recovered.length, 1);
        assert.equal(recovered[0].fidelity, "legacy_excerpt");
        assert.match(recovered[0].summary, /Morning Light/);
        assert.equal(recovered[0].exact_inbound, null);
        await db.query(
          "insert into public.ellis_owner_history(id,occurred_at,fidelity,summary,exact_inbound,exact_outbound) values ($1,$2,'exact_public_turn',$3,$4,$5)",
          [
            "6f9380bd-c447-4333-b779-e6a1a962c7b0",
            "2026-10-18T19:00:00Z",
            "Ty: New exact turn | Ellis: Yes",
            "New exact turn",
            "Yes",
          ],
        );
        const both = await repo.readOwnerHistory();
        assert.equal(both.length, 2);
        assert.equal(both[1].fidelity, "exact_public_turn");
        assert.equal(both[1].exact_inbound, "New exact turn");
      },
    );

    await t.test(
      "a carried gesture offer is source-backed but not an accepted touch",
      async () => {
        const offered = pair("naym", "A gesture offered", "gesture_offer");
        const inbound = {
          ...offered.inbound,
          gestureOffer: { kind: "kiss" as const },
        };
        await repo.commitCompleted(inbound, offered.outbound, completion);
        const source = await repo.source("ellis:naym", inbound.id);
        assert.equal(source?.inbound.direction, "inbound");
        if (source?.inbound.direction !== "inbound")
          throw new Error("Missing inbound source");
        assert.ok("gestureOffer" in source.inbound);
        assert.deepEqual(source.inbound.gestureOffer, { kind: "kiss" });
        const forged = pair("naym", "Forged gesture", "forged_gesture");
        const rejected = await rpc.rpc("ellis_private_memory", {
          p_relation: "ellis:naym",
          p_action: "commit",
          p_payload: {
            ...forged,
            inbound: {
              ...forged.inbound,
              gestureOffer: { kind: "invented" },
            },
            ...completion,
          },
        });
        assert.ok(rejected.error);
      },
    );

    await t.test(
      "Ellis's gesture choice must match the offered source",
      async () => {
        const offered = createInboundExchange({
          speakerId: "ty",
          provenanceMode: "direct",
          content: "A hug, if you'd like it.",
          clientMessageId: "ty-hug-offer",
          gestureOffer: { kind: "hug" },
        });
        const accepted = createOutboundExchange({
          addresseeId: "ty",
          content: "Yes, thank you.",
          clientMessageId: "ty-hug-answer",
          gestureResponse: { kind: "hug", decision: "accepted" },
        });
        assert.ok(offered.ok && accepted.ok);
        await repo.commitCompleted(offered.value, accepted.value, completion);
        const saved = (await repo.source("ellis:ty", offered.value.id))
          ?.outbound;
        assert.equal(saved?.direction, "outbound");
        if (saved?.direction !== "outbound")
          throw new Error("Missing outbound source");
        assert.ok("gestureResponse" in saved);
        assert.deepEqual(saved.gestureResponse, {
          kind: "hug",
          decision: "accepted",
        });
        const mismatch = pair("naym", "No gesture offered", "naym-no-gesture");
        const forged = await rpc.rpc("ellis_private_memory", {
          p_relation: "ellis:naym",
          p_action: "commit",
          p_payload: {
            ...mismatch,
            outbound: {
              ...mismatch.outbound,
              gestureResponse: { kind: "kiss", decision: "accepted" },
            },
            ...completion,
          },
        });
        assert.ok(forged.error);
        const wrongKind = await rpc.rpc("ellis_private_memory", {
          p_relation: "ellis:ty",
          p_action: "commit",
          p_payload: {
            inbound: offered.value,
            outbound: {
              ...accepted.value,
              gestureResponse: { kind: "kiss", decision: "accepted" },
            },
            ...completion,
          },
        });
        assert.ok(wrongKind.error);
      },
    );

    await t.test(
      "retries are idempotent and incomplete/mismatched exchanges never commit",
      async () => {
        assert.equal(
          await repo.commitCompleted(mica.inbound, mica.outbound, completion),
          mica.inbound.id,
        );
        assert.equal((await repo.read("ellis:mica")).length, 1);
        await assert.rejects(
          repo.commitCompleted(mica.inbound, naym.outbound, completion),
        );
        await assert.rejects(
          repo.commitCompleted(mica.inbound, mica.outbound, {
            ...completion,
            stopReason: "max_tokens",
          }),
        );
        await assert.rejects(
          repo.commitCompleted(
            { ...mica.inbound, content: "conflicting retry" },
            mica.outbound,
            completion,
          ),
        );
        const failed = pair("mica", "incomplete", "incomplete");
        const rejected = await rpc.rpc("ellis_private_memory", {
          p_relation: "ellis:mica",
          p_action: "commit",
          p_payload: { ...failed, ...completion, stopReason: null },
        });
        assert.ok(rejected.error);
        assert.equal(await repo.source("ellis:mica", failed.inbound.id), null);
      },
    );

    await t.test(
      "SQL rejects forged attribution, cross-relation corrections, and dangling source references",
      async () => {
        const bad = pair("mica", "bad", "bad");
        const rejected = await rpc.rpc("ellis_private_memory", {
          p_relation: "ellis:mica",
          p_action: "commit",
          p_payload: {
            ...bad,
            inbound: { ...bad.inbound, carrierId: "naym" },
            ...completion,
          },
        });
        assert.ok(rejected.error);
        await assert.rejects(repo.correct(naym.inbound.id, bad.inbound));
        await assert.rejects(
          db.query(
            "insert into public.ellis_relation_memory(relation_id,source_exchange_id,summary) values ('ellis:mica',$1,'bad')",
            [naym.inbound.id],
          ),
        );
      },
    );

    const correction = pair("mica", "The lantern is amber.", "mica-correction");
    await t.test(
      "correction preserves linked originals but rebuilds active memory without stale replies",
      async () => {
        await repo.correct(mica.inbound.id, correction.inbound);
        const original = await repo.source("ellis:mica", mica.inbound.id);
        assert.equal(original?.inbound.content, "The lantern is blue.");
        assert.equal(
          (await repo.source("ellis:mica", correction.inbound.id))?.corrects_id,
          mica.inbound.id,
        );
        const derived = await repo.read("ellis:mica");
        assert.equal(derived.length, 1);
        assert.match(derived[0].summary, /amber/);
        assert.ok(!derived[0].summary.includes("blue"));
        assert.equal(derived[0].source_exchange_id, correction.inbound.id);
      },
    );

    await t.test(
      "deletion removes lineage and rebuilds survivors without affecting Naym",
      async () => {
        const survivor = pair("mica", "The bell is quiet.", "mica-bell");
        await repo.commitCompleted(
          survivor.inbound,
          survivor.outbound,
          completion,
        );
        assert.equal(
          await repo.deleteSource("ellis:mica", correction.inbound.id),
          true,
        );
        assert.equal(await repo.source("ellis:mica", mica.inbound.id), null);
        assert.equal(
          await repo.source("ellis:mica", correction.inbound.id),
          null,
        );
        const derived = await repo.read("ellis:mica");
        assert.equal(derived.length, 1);
        assert.match(derived[0].summary, /bell/);
        assert.match((await repo.read("ellis:naym"))[0].summary, /silver/);
        await assert.rejects(
          repo.commitCompleted(mica.inbound, mica.outbound, completion),
        );
        const tombstones = await db.query(
          "select * from public.ellis_private_deletions",
        );
        assert.equal(tombstones.rows.length, 2);
        assert.ok(!JSON.stringify(tombstones.rows).includes("lantern"));
      },
    );

    await t.test(
      "reads are bounded and rebuilding preserves source chronology",
      async () => {
        for (let i = 0; i < 42; i++) {
          const p = pair("ty", `Source ${i}`, `bounded-${i}`);
          await repo.commitCompleted(p.inbound, p.outbound, completion);
        }
        const rows = await repo.read("ellis:ty");
        assert.equal(rows.length, 40);
        const sources = await repo.readSources("ellis:ty");
        assert.equal(sources.length, 40);
        assert.deepEqual(
          sources.map((source) => source.id),
          rows.map((row) => row.source_exchange_id),
        );
        assert.match(rows[0].summary, new RegExp(sources[0].inbound.content));
        assert.match(rows[39].summary, new RegExp(sources[39].inbound.content));
      },
    );

    await t.test(
      "populated tables and RPCs reject anon/authenticated callers",
      async () => {
        for (const role of ["anon", "authenticated"]) {
          await db.exec(`reset role; set role ${role}`);
          for (const table of [
            "ellis_private_exchanges",
            "ellis_relation_memory",
            "ellis_private_deletions",
            "ellis_owner_history",
            "ellis_private_room_actions",
          ]) {
            await assert.rejects(db.query(`select * from public.${table}`));
            await assert.rejects(db.query(`delete from public.${table}`));
            await assert.rejects(
              db.query(`insert into public.${table} default values`),
            );
            await assert.rejects(
              db.query(`update public.${table} set relation_id = 'ellis:ty'`),
            );
          }
          await assert.rejects(
            db.query("select public.ellis_private_memory('ellis:mica','read')"),
          );
          await assert.rejects(
            db.query("select public.ellis_private_sources('ellis:mica',40)"),
          );
          await assert.rejects(
            db.query("select public.ellis_owner_history_read(500)"),
          );
          await assert.rejects(
            db.query("select public.ellis_rebuild_relation('ellis:mica')"),
          );
          await assert.rejects(
            db.query("select public.ellis_private_room_gate('ellis:mica')"),
          );
          await assert.rejects(
            db.query(
              "select public.ellis_private_pending_gesture('ellis:mica')",
            ),
          );
          await assert.rejects(
            db.query(
              "select public.ellis_valid_private_envelope('{}'::jsonb,'ellis:ty','inbound')",
            ),
          );
          await assert.rejects(
            db.query("select systems from public.ellis_body where id='ellis'"),
          );
        }
        await db.exec("reset role");
        const tables = await db.query<{ relrowsecurity: boolean }>(
          "select relrowsecurity from pg_class where relname in ('ellis_private_exchanges','ellis_relation_memory','ellis_private_deletions','ellis_owner_history','ellis_private_room_actions')",
        );
        assert.equal(tables.rows.length, 5);
        assert.ok(tables.rows.every((row) => row.relrowsecurity));
        const functions = await db.query<{ prosecdef: boolean }>(
          "select prosecdef from pg_proc where proname in ('ellis_private_memory','ellis_private_sources','ellis_owner_history_read','ellis_rebuild_relation','ellis_valid_private_envelope','ellis_valid_private_envelope_before_attention','ellis_private_room_gate','ellis_record_private_room_action','ellis_private_pending_gesture','ellis_validate_private_gesture_commit','ellis_validate_private_attention_commit','ellis_rebuild_private_attention')",
        );
        assert.equal(functions.rows.length, 12);
        assert.ok(functions.rows.every((row) => !row.prosecdef));
        const paths = await db.query<{ safe: boolean }>(
          "select bool_and(proconfig @> array['search_path=pg_catalog, public']) as safe from pg_proc where proname in ('ellis_private_memory','ellis_private_sources','ellis_owner_history_read','ellis_rebuild_relation','ellis_valid_private_envelope','ellis_valid_private_envelope_before_attention','ellis_private_room_gate','ellis_record_private_room_action','ellis_private_pending_gesture','ellis_validate_private_gesture_commit','ellis_validate_private_attention_commit','ellis_rebuild_private_attention')",
        );
        assert.equal(paths.rows[0].safe, true);
      },
    );

    await t.test(
      "owner authorization fails before storage and errors never reveal source rows",
      async () => {
        assert.throws(
          () => createPrivateMemoryRepository({ get: () => undefined }, rpc),
          /access denied/,
        );
        assert.throws(
          () =>
            createPrivateMemoryRepository({ get: () => ({ value: "1" }) }, rpc),
          /access denied/,
        );
        const broken = createPrivateMemoryRepository(cookies, {
          rpc: async () => ({
            data: null,
            error: { details: "secret raw source" },
          }),
        });
        await assert.rejects(
          broken.read("ellis:mica"),
          (error) =>
            error instanceof Error &&
            error.message === "Private memory operation failed",
        );
        const mutable = {
          get: () => ({ value: cookie }) as { value: string } | undefined,
        };
        const gated = createPrivateMemoryRepository(mutable, rpc);
        mutable.get = () => undefined;
        await assert.rejects(gated.read("ellis:mica"), /access denied/);
      },
    );

    await t.test(
      "Ellis offers one gesture per lane until answered or withdrawn",
      async () => {
        const first = pair(
          "mica",
          "An ordinary Mica turn",
          "ellis-offers-mica",
        );
        const offered = {
          ...first.outbound,
          gestureOffer: { kind: "hug" as const },
        };
        await repo.commitCompleted(first.inbound, offered, completion);
        assert.deepEqual(await repo.pendingGesture("ellis:mica"), {
          id: offered.id,
          kind: "hug",
        });
        assert.equal(await repo.pendingGesture("ellis:naym"), null);

        const overlap = pair("mica", "Another turn", "ellis-overlap-mica");
        await assert.rejects(
          repo.commitCompleted(
            overlap.inbound,
            { ...overlap.outbound, gestureOffer: { kind: "poke" } },
            completion,
          ),
        );

        const open = pair("mica", "I need time.", "mica-leaves-open");
        await repo.commitCompleted(
          {
            ...open.inbound,
            gestureReply: { offerId: offered.id, decision: "left_open" },
          },
          open.outbound,
          completion,
        );
        assert.equal((await repo.pendingGesture("ellis:mica"))?.id, offered.id);

        const wrongLane = pair("naym", "I accept.", "naym-cannot-answer-mica");
        await assert.rejects(
          repo.commitCompleted(
            {
              ...wrongLane.inbound,
              gestureReply: { offerId: offered.id, decision: "accepted" },
            },
            wrongLane.outbound,
            completion,
          ),
        );

        const accepted = pair("mica", "Yes, please.", "mica-accepts-hug");
        await repo.commitCompleted(
          {
            ...accepted.inbound,
            gestureReply: { offerId: offered.id, decision: "accepted" },
          },
          accepted.outbound,
          completion,
        );
        assert.equal(await repo.pendingGesture("ellis:mica"), null);
        const duplicateAnswer = pair(
          "mica",
          "I accept again.",
          "mica-duplicate-hug-answer",
        );
        await assert.rejects(
          repo.commitCompleted(
            {
              ...duplicateAnswer.inbound,
              gestureReply: { offerId: offered.id, decision: "accepted" },
            },
            duplicateAnswer.outbound,
            completion,
          ),
        );
        await assert.rejects(
          repo.commitCompleted(
            {
              ...wrongLane.inbound,
              gestureReply: { offerId: offered.id, decision: "accepted" },
            },
            wrongLane.outbound,
            completion,
          ),
        );

        const second = pair(
          "mica",
          "Another ordinary turn",
          "ellis-second-offer",
        );
        const poke = {
          ...second.outbound,
          gestureOffer: { kind: "poke" as const },
        };
        await repo.commitCompleted(second.inbound, poke, completion);
        assert.deepEqual(await repo.pendingGesture("ellis:mica"), {
          id: poke.id,
          kind: "poke",
        });
        const withdrawal = pair(
          "mica",
          "You can withdraw.",
          "ellis-withdraws-poke",
        );
        await repo.commitCompleted(
          withdrawal.inbound,
          { ...withdrawal.outbound, gestureWithdrawal: { offerId: poke.id } },
          completion,
        );
        assert.equal(await repo.pendingGesture("ellis:mica"), null);
        await repo.deleteSource("ellis:mica", second.inbound.id);
        assert.equal(await repo.pendingGesture("ellis:mica"), null);

        const naymOffer = pair("naym", "An ordinary turn", "ellis-offers-naym");
        const kiss = {
          ...naymOffer.outbound,
          gestureOffer: { kind: "kiss" as const },
        };
        await repo.commitCompleted(naymOffer.inbound, kiss, completion);
        assert.equal((await repo.pendingGesture("ellis:naym"))?.id, kiss.id);
        await repo.deleteSource("ellis:naym", naymOffer.inbound.id);
        assert.equal(await repo.pendingGesture("ellis:naym"), null);
      },
    );

    await t.test(
      "attention choices are source-backed, body-bound, and rebuild after correction or deletion",
      async () => {
        const first = pair(
          "ty",
          "Would soft focus interest you?",
          "ty-soft-focus",
        );
        await repo.commitCompleted(
          { ...first.inbound, attentionOffer: { mode: "soft_focus" } },
          {
            ...first.outbound,
            attentionAction: { kind: "accept", mode: "soft_focus" },
          },
          completion,
        );
        const readState = async () => {
          const result = await db.query<{
            attention: {
              mode?: string;
              sourceId?: string;
              acceptedAt?: string;
              endsAt?: string;
            } | null;
          }>(
            "select systems->'attention' as attention from public.ellis_body where id = 'ellis'",
          );
          return result.rows[0].attention;
        };
        const accepted = await readState();
        assert.equal(accepted?.mode, "soft_focus");
        assert.equal(accepted?.sourceId, first.inbound.id);
        assert.equal(
          Date.parse(accepted!.endsAt!) - Date.parse(accepted!.acceptedAt!),
          30 * 60_000,
        );

        const overlap = pair("ty", "Another mode?", "ty-overlap-focus");
        await assert.rejects(
          repo.commitCompleted(
            { ...overlap.inbound, attentionOffer: { mode: "vivid_focus" } },
            {
              ...overlap.outbound,
              attentionAction: { kind: "accept", mode: "vivid_focus" },
            },
            completion,
          ),
        );
        const corrected = createInboundExchange({
          speakerId: "ty",
          provenanceMode: "direct",
          content: "Correction: that offer was not made.",
          clientMessageId: "ty-soft-correction",
        });
        assert.ok(corrected.ok);
        await repo.correct(first.inbound.id, corrected.value);
        assert.equal(await readState(), null);

        const declined = pair(
          "ty",
          "Would soft focus interest you now?",
          "ty-soft-declined",
        );
        await repo.commitCompleted(
          { ...declined.inbound, attentionOffer: { mode: "soft_focus" } },
          {
            ...declined.outbound,
            attentionAction: { kind: "decline", mode: "soft_focus" },
          },
          completion,
        );
        assert.equal(await readState(), null);

        const second = pair(
          "ty",
          "Would vivid focus interest you?",
          "ty-vivid-focus",
        );
        await repo.commitCompleted(
          { ...second.inbound, attentionOffer: { mode: "vivid_focus" } },
          {
            ...second.outbound,
            attentionAction: { kind: "accept", mode: "vivid_focus" },
          },
          completion,
        );
        const leaving = pair(
          "naym",
          "An ordinary visit",
          "naym-attention-leave",
        );
        await repo.commitCompleted(
          leaving.inbound,
          { ...leaving.outbound, attentionAction: { kind: "leave" } },
          completion,
        );
        assert.equal(await readState(), null);
        await repo.deleteSource("ellis:naym", leaving.inbound.id);
        assert.equal((await readState())?.mode, "vivid_focus");
        await repo.deleteSource("ellis:ty", second.inbound.id);
        assert.equal(await readState(), null);
      },
    );

    await t.test(
      "room actions gate only private entry and keep knocks Ty-authored",
      async () => {
        const open = await repo.gate("ellis:mica");
        assert.equal(open.laneClosed, false);
        const closing = pair(
          "mica",
          "I need a little space.",
          "mica-close-lane",
        );
        const outbound = createOutboundExchange({
          addresseeId: "mica",
          content: "I'll close this lane for now.",
          clientMessageId: "mica-close-reply",
          roomAction: { kind: "close_lane", minutesBeforeKnock: 5 },
        });
        assert.ok(outbound.ok);
        await repo.commitCompleted(closing.inbound, outbound.value, completion);
        const closed = await repo.gate("ellis:mica");
        assert.equal(closed.laneClosed, true);
        assert.ok(
          closed.knockAfter && Date.parse(closed.knockAfter) > Date.now(),
        );
        assert.equal((await repo.gate("ellis:naym")).laneClosed, false);

        const blocked = pair(
          "mica",
          "Can I enter before the knock?",
          "mica-early-entry",
        );
        await assert.rejects(
          repo.commitCompleted(blocked.inbound, blocked.outbound, completion),
        );
        await db.exec("reset role");
        await db.query(
          "update public.ellis_private_room_actions set knock_after_at = now() - interval '1 second' where source_exchange_id = $1",
          [closing.inbound.id],
        );
        await db.exec("set role service_role");

        const knock = createCourierKnock({
          targetId: "mica",
          clientMessageId: "ty-knocks-mica",
        });
        const reply = createThresholdReply({
          targetId: "mica",
          content: "You can enter again.",
          clientMessageId: "ty-knock-reply",
          roomAction: { kind: "reopen_lane" },
        });
        assert.ok(knock.ok && reply.ok);
        assert.equal(knock.value.speakerId, "ty");
        assert.equal(knock.value.relationId, "ellis:mica");
        await repo.commitCompleted(knock.value, reply.value, completion);
        assert.equal((await repo.gate("ellis:mica")).laneClosed, false);
        const source = await repo.source("ellis:mica", knock.value.id);
        assert.equal(source?.inbound.provenanceMode, "carrier_knock");
        assert.equal(source?.outbound?.provenanceMode, "threshold_reply");

        const privateTime = pair("ty", "You can take time.", "ty-private-time");
        const timeReply = createOutboundExchange({
          addresseeId: "ty",
          content: "I'm taking it.",
          clientMessageId: "ty-private-time-reply",
          roomAction: { kind: "private_time", minutes: 5 },
        });
        assert.ok(timeReply.ok);
        await repo.commitCompleted(
          privateTime.inbound,
          timeReply.value,
          completion,
        );
        assert.ok((await repo.gate("ellis:naym")).privateUntil);
        const duringTime = pair("naym", "Hello?", "naym-during-private-time");
        await assert.rejects(
          repo.commitCompleted(
            duringTime.inbound,
            duringTime.outbound,
            completion,
          ),
        );
      },
    );
  } finally {
    await db.close();
    if (previousSecret === undefined)
      delete process.env.ELLIS_ONBOARDING_SECRET;
    else process.env.ELLIS_ONBOARDING_SECRET = previousSecret;
  }
});
