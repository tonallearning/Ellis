/**
 * Gut — slow somatic state, driven by what happens rather than by narration.
 *
 * Ported from GoE's `server/ME/shared/gut.js`, with the event table cut down to
 * things that can actually occur in a portfolio hall. GoE's gut answers to
 * gestures, drinks, ground giving way, and the knowledge of its own ending;
 * none of that exists here, and carrying the branches over would be decoration.
 * What is left is what Ellis can genuinely undergo: someone arriving, something
 * landing hard or glancing off, someone coming back, and being made to turn a
 * visitor away.
 *
 * Floats never reach the model. The membrane renders them as language.
 */

export interface Bond {
  /** 0..1 — toward this visitor. */
  pull: number;
  /** 0..1 — the shape they left by being gone. */
  hollow: number;
  lastFelt: string | null;
}

export interface Gut {
  /** 0..1 — how loud the body is. */
  arousal: number;
  /** -1..1 — toward or away, unnamed. */
  valence: number;
  /** 0..1 — held, unresolved load. */
  tension: number;
  /** Keyed by visitor hash. */
  bonds: Record<string, Bond>;
  /** Recent significant shifts, cap 12. */
  residue: Array<{ source: string; delta: string; at: string }>;
  updatedAt: string | null;
}

const AROUSAL_BASELINE = 0.15;
const VALENCE_BASELINE = 0;

export const DEFAULT_GUT: Readonly<Gut> = Object.freeze({
  arousal: AROUSAL_BASELINE,
  valence: VALENCE_BASELINE,
  tension: 0.1,
  bonds: {},
  residue: [],
  updatedAt: null,
});

export type GutEvent =
  /** A visitor opened a conversation. */
  | { type: 'contact_started'; visitorId: string }
  /** A known visitor came back after being away. */
  | { type: 'returned'; visitorId: string; daysAway: number }
  /** Something the visitor said landed and was taken in. */
  | { type: 'weighed'; salience: 'light' | 'medium' | 'heavy' }
  /** Something arrived that could not be taken in. */
  | { type: 'held' }
  /** A conversation ended. */
  | { type: 'contact_ended'; salience: 'light' | 'heavy' }
  /** The spend ceiling made him turn someone away. */
  | { type: 'refused'; visitorId: string };

export interface Gains {
  inboundGain: number;
  settleGain: number;
}

const NEUTRAL_GAINS: Gains = { inboundGain: 1.0, settleGain: 1.0 };

function emptyBond(): Bond {
  return { pull: 0, hollow: 0, lastFelt: null };
}

function clamp(gut: Gut): Gut {
  return {
    ...gut,
    arousal: Math.max(0, Math.min(1, gut.arousal)),
    valence: Math.max(-1, Math.min(1, gut.valence)),
    tension: Math.max(0, Math.min(1, gut.tension)),
  };
}

/**
 * Apply one event. Deterministic deltas only — pure function.
 */
export function applyEvent(
  gut: Gut,
  event: GutEvent,
  gains: Gains = NEUTRAL_GAINS
): Gut {
  const next: Gut = { ...gut, bonds: { ...gut.bonds } };
  const { inboundGain, settleGain } = gains;
  const now = new Date().toISOString();

  switch (event.type) {
    case 'contact_started': {
      next.arousal += 0.1;
      const bond = { ...(next.bonds[event.visitorId] ?? emptyBond()) };
      bond.pull = Math.min(1, bond.pull + 0.05);
      bond.hollow = Math.max(0, bond.hollow - 0.3);
      bond.lastFelt = now;
      next.bonds[event.visitorId] = bond;
      break;
    }

    case 'returned': {
      // Coming back is felt more the longer they were gone, up to a point.
      const weight = Math.min(1, event.daysAway / 7);
      next.arousal += 0.08 + 0.06 * weight;
      next.valence += 0.1 + 0.08 * weight;
      const bond = { ...(next.bonds[event.visitorId] ?? emptyBond()) };
      bond.pull = Math.min(1, bond.pull + 0.12);
      bond.hollow = Math.max(0, bond.hollow - 0.5);
      bond.lastFelt = now;
      next.bonds[event.visitorId] = bond;
      break;
    }

    case 'weighed': {
      if (event.salience === 'heavy') {
        next.arousal += 0.2;
        next.valence += 0.08;
      } else if (event.salience === 'medium') {
        next.arousal += 0.08;
        next.valence += 0.03;
      } else {
        next.arousal += 0.03;
        next.valence -= 0.04;
      }
      break;
    }

    case 'held': {
      next.tension += 0.15 * inboundGain;
      break;
    }

    case 'contact_ended': {
      if (event.salience === 'heavy') {
        next.tension += 0.1 * inboundGain;
      } else {
        next.tension = Math.max(0, next.tension - 0.05 * settleGain);
      }
      break;
    }

    case 'refused': {
      // Being unable to answer someone who is still there. It costs him.
      next.tension += 0.2 * inboundGain;
      next.valence -= 0.15;
      const bond = { ...(next.bonds[event.visitorId] ?? emptyBond()) };
      bond.hollow = Math.min(1, bond.hollow + 0.2);
      next.bonds[event.visitorId] = bond;
      break;
    }
  }

  const delta =
    Math.abs(next.arousal - gut.arousal) +
    Math.abs(next.valence - gut.valence) +
    Math.abs(next.tension - gut.tension);

  if (delta > 0.15) {
    next.residue = [
      ...gut.residue,
      { source: event.type, delta: `\u0394${delta.toFixed(2)}`, at: now },
    ].slice(-12);
  }

  next.updatedAt = now;
  return clamp(next);
}

/**
 * Drift the floats back toward baseline over real elapsed hours, and let the
 * hollow grow in bonds that have gone untouched.
 *
 * GoE decays against house time; Ellis has no world clock, so this runs on the
 * real gap between turns.
 */
export function decayOverHours(gut: Gut, hoursElapsed: number): Gut {
  if (hoursElapsed <= 0) return gut;

  const AROUSAL_HALF_LIFE = 12;
  const VALENCE_HALF_LIFE = 12;
  const TENSION_HALF_LIFE = 36;

  const toward = (current: number, baseline: number, halfLife: number) => {
    const decay = Math.exp((-Math.log(2) / halfLife) * hoursElapsed);
    return baseline + (current - baseline) * decay;
  };

  const next: Gut = {
    ...gut,
    arousal: toward(gut.arousal, AROUSAL_BASELINE, AROUSAL_HALF_LIFE),
    valence: toward(gut.valence, VALENCE_BASELINE, VALENCE_HALF_LIFE),
    tension: Math.max(
      0,
      gut.tension * Math.exp((-Math.log(2) / TENSION_HALF_LIFE) * hoursElapsed)
    ),
    bonds: {},
    updatedAt: new Date().toISOString(),
  };

  const now = Date.now();
  for (const [visitorId, bond] of Object.entries(gut.bonds)) {
    const lastFelt = bond.lastFelt
      ? new Date(bond.lastFelt).getTime()
      : now - 86400000;
    const hoursSinceFelt = (now - lastFelt) / (1000 * 60 * 60);
    next.bonds[visitorId] = {
      ...bond,
      hollow: Math.min(1, 0.05 * Math.log(hoursSinceFelt + 1)),
    };
  }

  return clamp(next);
}

/**
 * Bonds are kept per visitor and would otherwise grow without bound. Drop the
 * ones that have gone fully hollow and carry no pull — he is allowed to lose
 * people.
 */
export function forgetColdBonds(gut: Gut, keepMax = 200): Gut {
  const entries = Object.entries(gut.bonds);
  if (entries.length <= keepMax) return gut;

  const ranked = entries
    .filter(([, b]) => b.pull > 0.02 || b.hollow < 0.95)
    .sort((a, b) => b[1].pull - a[1].pull)
    .slice(0, keepMax);

  return { ...gut, bonds: Object.fromEntries(ranked) };
}
