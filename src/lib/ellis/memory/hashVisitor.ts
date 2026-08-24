import crypto from 'crypto';

/**
 * Visitor IP hashing, deliberately kept free of any database or config import.
 * It sits on the hot path of every request and is the single place where a
 * real address becomes a stored identifier, so it should be possible to reason
 * about — and test — without standing up anything else.
 */

/**
 * Per-process fallback salt, dev only. Regenerated on every boot, so hashes do
 * not survive a restart and visitor recall quietly stops working locally —
 * which is the intended nudge to set a real salt.
 */
const EPHEMERAL_DEV_SALT = crypto.randomBytes(32).toString('hex');

/**
 * The salt is the only thing standing between a stored hash and a real address.
 * IPv4 is 2^32 wide, so anyone holding the salt can enumerate the entire space
 * in minutes and reverse every row. A constant checked into the repo is
 * therefore equivalent to storing raw IPs, and Ellis tells visitors he does not
 * do that. In production a missing salt fails the request rather than silently
 * downgrading to a public one.
 */
function getIpHashSalt(): string {
  const salt = process.env.ELLIS_IP_HASH_SALT?.trim();

  // An unfilled `<placeholder>` is a guessable value, so treat it as unset.
  if (salt && !/^<.*>$/.test(salt)) return salt;

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'ELLIS_IP_HASH_SALT is not set. Refusing to hash visitor IPs with a ' +
        'guessable salt — that would make stored hashes reversible.'
    );
  }

  console.warn(
    '[IP] ELLIS_IP_HASH_SALT unset; using an ephemeral per-process salt. ' +
      'Visitor recall will not survive a restart.'
  );
  return EPHEMERAL_DEV_SALT;
}

/**
 * Hash visitor IP for storage (SHA-256 + server salt for privacy).
 */
export function hashVisitorIp(ipString: string): string {
  return crypto
    .createHash('sha256')
    .update(ipString + getIpHashSalt())
    .digest('hex');
}
