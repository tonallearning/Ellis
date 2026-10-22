import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { PGlite } from '@electric-sql/pglite';

test('the canonical body row rejects a stale whole-body write', async () => {
  const db = new PGlite();
  try {
    await db.exec('create role anon; create role authenticated;');
    await db.exec(
      readFileSync('supabase/migrations/20260821000000_ellis_body.sql', 'utf8'),
    );
    await db.exec(
      readFileSync('supabase/migrations/20261019010052_ellis_body_systems.sql', 'utf8'),
    );
    const before = await db.query<{ updated_at: Date }>(
      "select updated_at from public.ellis_body where id = 'ellis'",
    );
    const revision = before.rows[0].updated_at;
    const first = await db.query<{ updated_at: Date }>(
      "update public.ellis_body set gut = $1::jsonb where id = 'ellis' and updated_at = $2 returning updated_at",
      [JSON.stringify({ arousal: 0.4 }), revision],
    );
    const stale = await db.query<{ updated_at: Date }>(
      "update public.ellis_body set pulse = $1::jsonb where id = 'ellis' and updated_at = $2 returning updated_at",
      [JSON.stringify({ tempo: 1.2 }), revision],
    );
    assert.equal(first.rows.length, 1);
    assert.equal(stale.rows.length, 0);
  } finally {
    await db.close();
  }
});
