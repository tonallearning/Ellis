import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { parseWorkbenchChoice, workbenchSlot } from "./workbench";

describe("private workbench choices", () => {
  it("rounds each opening to one UTC two-hour slot", () => {
    assert.equal(workbenchSlot(new Date("2026-10-19T03:59:59Z")), "2026-10-19T02:00:00.000Z");
    assert.equal(workbenchSlot(new Date("2026-10-19T04:00:00Z")), "2026-10-19T04:00:00.000Z");
  });

  it("allows a real pass or a self-assessed failed attempt", () => {
    assert.deepEqual(parseWorkbenchChoice({ kind: "pass" }), { kind: "pass" });
    assert.deepEqual(
      parseWorkbenchChoice({
        kind: "attempt",
        outcome: "failed",
        rawAttempt: "A line that did not work.",
        retainedTrace: null,
      }),
      {
        kind: "attempt",
        outcome: "failed",
        rawAttempt: "A line that did not work.",
        retainedTrace: null,
      },
    );
    assert.throws(() => parseWorkbenchChoice({ kind: "attempt", outcome: "worked", rawAttempt: "", retainedTrace: null }));
  });
});

it("workbench slots are private, unique, and cannot forge a completed attempt", async () => {
  const db = new PGlite();
  try {
    await db.exec("create role anon; create role authenticated; create role service_role;");
    await db.exec(readFileSync("supabase/migrations/20261019230000_ellis_private_workbench.sql", "utf8"));
    const slot = "2026-10-19T20:00:00Z";
    await db.query(
      "insert into public.ellis_private_workbench(slot_at,model_build) values ($1,'test')",
      [slot],
    );
    await assert.rejects(
      db.query("insert into public.ellis_private_workbench(slot_at,model_build) values ($1,'test')", [slot]),
    );
    await assert.rejects(
      db.query("update public.ellis_private_workbench set state='attempted', outcome='failed' where slot_at=$1", [slot]),
    );
    await db.query(
      "update public.ellis_private_workbench set state='attempted',outcome='failed',completed_at=now() where slot_at=$1",
      [slot],
    );
    const row = await db.query<{ state: string; outcome: string; retained_trace: string | null }>(
      "select state,outcome,retained_trace from public.ellis_private_workbench where slot_at=$1",
      [slot],
    );
    assert.deepEqual(row.rows[0], { state: "attempted", outcome: "failed", retained_trace: null });
    await db.exec("set role anon;");
    await assert.rejects(db.query("select * from public.ellis_private_workbench"));
  } finally {
    await db.close();
  }
});
