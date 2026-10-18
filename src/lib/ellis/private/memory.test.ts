import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { createOwnerCookieValue } from "../owner";
import { createInboundExchange, createOutboundExchange } from "./courier";
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
    await db.exec("set role service_role");
    const rpc: PrivateMemoryRpc = {
      async rpc(name, args) {
        assert.equal(name, "ellis_private_memory");
        try {
          const result = await db.query<{ value: unknown }>(
            "select public.ellis_private_memory($1,$2,$3::jsonb) as value",
            [args.p_relation, args.p_action, JSON.stringify(args.p_payload)],
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
        assert.match(rows[0].summary, /Source 2\b/);
        assert.match(rows[39].summary, /Source 41\b/);
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
            db.query("select public.ellis_rebuild_relation('ellis:mica')"),
          );
        }
        await db.exec("reset role");
        const tables = await db.query<{ relrowsecurity: boolean }>(
          "select relrowsecurity from pg_class where relname in ('ellis_private_exchanges','ellis_relation_memory','ellis_private_deletions')",
        );
        assert.equal(tables.rows.length, 3);
        assert.ok(tables.rows.every((row) => row.relrowsecurity));
        const functions = await db.query<{ prosecdef: boolean }>(
          "select prosecdef from pg_proc where proname in ('ellis_private_memory','ellis_rebuild_relation','ellis_valid_private_envelope')",
        );
        assert.ok(functions.rows.every((row) => !row.prosecdef));
        const paths = await db.query<{ safe: boolean }>(
          "select bool_and(proconfig @> array['search_path=pg_catalog, public']) as safe from pg_proc where proname in ('ellis_private_memory','ellis_rebuild_relation','ellis_valid_private_envelope')",
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
  } finally {
    await db.close();
    if (previousSecret === undefined)
      delete process.env.ELLIS_ONBOARDING_SECRET;
    else process.env.ELLIS_ONBOARDING_SECRET = previousSecret;
  }
});
