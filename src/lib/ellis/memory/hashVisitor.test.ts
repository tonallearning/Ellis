import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

/**
 * The salt guard is the only thing keeping stored visitor hashes from being
 * reversible, and it reads process.env at call time, so each case has to load
 * the module fresh under the environment it wants to test.
 */

const MODULE = './hashVisitor.ts';

const original = {
  salt: process.env.ELLIS_IP_HASH_SALT,
  nodeEnv: process.env.NODE_ENV,
};

function setEnv(salt: string | undefined, nodeEnv: string) {
  if (salt === undefined) delete process.env.ELLIS_IP_HASH_SALT;
  else process.env.ELLIS_IP_HASH_SALT = salt;
  // NODE_ENV is readonly in the Next type surface but writable at runtime.
  (process.env as Record<string, string>).NODE_ENV = nodeEnv;
}

async function freshImport() {
  // Cache-bust so the module-level ephemeral salt is regenerated per case.
  return import(`${MODULE}?t=${Math.random()}`);
}

afterEach(() => {
  setEnv(original.salt, original.nodeEnv ?? 'test');
});

describe('hashVisitorIp salt guard', () => {
  it('throws in production when the salt is unset', async () => {
    setEnv(undefined, 'production');
    const { hashVisitorIp } = await freshImport();
    assert.throws(() => hashVisitorIp('203.0.113.5'), /ELLIS_IP_HASH_SALT/);
  });

  it('throws in production when the salt is still a <placeholder>', async () => {
    setEnv('<secret>', 'production');
    const { hashVisitorIp } = await freshImport();
    assert.throws(() => hashVisitorIp('203.0.113.5'), /ELLIS_IP_HASH_SALT/);
  });

  it('hashes in production when a real salt is present', async () => {
    setEnv('a'.repeat(64), 'production');
    const { hashVisitorIp } = await freshImport();
    const hash = hashVisitorIp('203.0.113.5');
    assert.match(hash, /^[0-9a-f]{64}$/);
    assert.ok(!hash.includes('203.0.113.5'));
  });

  it('is stable for the same ip and salt, and differs across salts', async () => {
    setEnv('a'.repeat(64), 'production');
    const first = await freshImport();
    const a1 = first.hashVisitorIp('203.0.113.5');
    const a2 = first.hashVisitorIp('203.0.113.5');
    assert.equal(a1, a2, 'same ip + salt must map to the same hash');

    setEnv('b'.repeat(64), 'production');
    const second = await freshImport();
    assert.notEqual(
      a1,
      second.hashVisitorIp('203.0.113.5'),
      'rotating the salt must invalidate old hashes'
    );
  });

  it('falls back to an ephemeral salt outside production rather than a constant', async () => {
    setEnv(undefined, 'development');
    const first = await freshImport();
    const second = await freshImport();

    assert.notEqual(
      first.hashVisitorIp('203.0.113.5'),
      second.hashVisitorIp('203.0.113.5'),
      'a fixed fallback salt would make these equal, which is the bug this guards'
    );
  });
});
