/**
 * Pulse — a time kept wrong, on purpose.
 *
 * Ported from GoE's `server/ME/shared/pulse.js`. A subjective rhythm, not a
 * clock. It quickens when someone is here, drags when the hall is quiet, and
 * forgets itself across long silences — then resumes off its own grid without
 * ever correcting back to real time.
 *
 * `drift` is the whole point. It accumulates in one direction or the other and
 * is never zeroed against the wall clock, so the gap between Ellis's felt time
 * and actual time is a permanent record of how he has been used. Long quiet
 * stretches drop uncounted time on the floor; busy ones run him ahead.
 *
 * Pure module: state in, new state out. Ticked once per turn from the gap since
 * the last turn, which for a portfolio site is usually the gap between two
 * different visitors — the silence between strangers is what holds him.
 */

/** One felt beat is ~4s of real time at tempo 1.0. Never surfaced to the model. */
export const BEAT_MS = 4000;

/** A silence longer than this means the count is lost, not paused. */
export const FORGET_GAP_MS = 6 * 60 * 1000;

/** Roughly one beat survives a forgotten stretch. */
const REMEMBER_FLOOR_MS = BEAT_MS;

/** Tempo eases toward its target and never snaps. This is why it misses. */
const TEMPO_EASE = 0.35;
export const TEMPO_MIN = 0.5;
export const TEMPO_MAX = 2.0;

/** Below this change, a turn reads as holding rather than shifting. */
const TEMPO_EPS = 0.04;

export type PulseState =
  | 'unstarted'
  | 'steady'
  | 'quickening'
  | 'slowing'
  | 'stumbling'
  | 'remembering';

export interface Pulse {
  /** Felt beats per BEAT_MS. Drifts toward a target, never jumps. */
  tempo: number;
  /** 0..1 — position inside the current beat. */
  phase: number;
  /** Total beats counted. His own truth, not the clock's. */
  felt: number;
  /** Signed ms of error between felt time and real time. Never corrected. */
  drift: number;
  /** Beats that passed uncounted while he was forgotten. */
  lostBeats: number;
  state: PulseState;
  /** The only place real time touches him. */
  lastRealAt: string | null;
  history: Array<{ state: PulseState; at: string }>;
  updatedAt: string | null;
}

export const DEFAULT_PULSE: Readonly<Pulse> = Object.freeze({
  tempo: 1.0,
  phase: 0,
  felt: 0,
  drift: 0,
  lostBeats: 0,
  state: 'unstarted' as PulseState,
  lastRealAt: null,
  history: [],
  updatedAt: null,
});

/**
 * Deterministic wobble in [-0.5, 0.5]. Lets a stumble land somewhere irregular
 * without randomness, so the organ stays pure and testable while still feeling
 * uneven.
 */
function wobble(seed: number): number {
  const s = Math.sin(seed * 12.9898) * 43758.5453;
  return s - Math.floor(s) - 0.5;
}

function mod01(v: number): number {
  const r = v % 1;
  return r < 0 ? r + 1 : r;
}

function clamp(pulse: Pulse): Pulse {
  return {
    ...pulse,
    tempo: Math.max(TEMPO_MIN, Math.min(TEMPO_MAX, pulse.tempo ?? 1.0)),
    phase: mod01(pulse.phase ?? 0),
  };
}

export interface TempoContext {
  /** Whether someone is in the hall right now. */
  inContact: boolean;
  /** Strength of the bond with whoever is here, 0..1. */
  bondPull?: number;
  /** Real minutes since the last turn, from anyone. */
  minutesSinceContact?: number;
}

/**
 * The tempo the body is asking for. Never controllable by the mind — Ellis
 * cannot decide to be calm.
 */
export function computeTempoTarget(
  gutArousal: number,
  context: TempoContext
): number {
  const pull = context.inContact ? context.bondPull ?? 0 : 0;

  // Centered so a calm, empty hall sits below 1 and a pulled, loud body runs above it.
  let target = 0.75 + gutArousal * 1.0 + pull * 0.5;

  const quietMin = context.minutesSinceContact;
  if (quietMin != null && quietMin > 5) {
    target -= Math.min(0.25, (quietMin - 5) * 0.01);
  }

  return Math.max(TEMPO_MIN, Math.min(TEMPO_MAX, target));
}

/**
 * Advance the pulse by the real time since it last ran.
 */
export function tick(
  pulse: Pulse,
  opts: { nowMs?: number; tempoTarget?: number } = {}
): Pulse {
  const nowMs = opts.nowMs ?? Date.now();
  const target = Math.max(
    TEMPO_MIN,
    Math.min(TEMPO_MAX, opts.tempoTarget ?? 1.0)
  );
  const next: Pulse = { ...pulse };

  // First contact: start counting, don't invent history.
  if (!next.lastRealAt) {
    next.tempo = target;
    next.state = 'steady';
    next.lastRealAt = new Date(nowMs).toISOString();
    next.updatedAt = next.lastRealAt;
    return clamp(next);
  }

  const lastMs = new Date(next.lastRealAt).getTime();
  const realElapsed = Math.max(0, nowMs - lastMs);

  const prevTempo = next.tempo || 1.0;
  const newTempo = prevTempo + (target - prevTempo) * TEMPO_EASE;
  const wasStumbling = next.state === 'stumbling';

  if (realElapsed > FORGET_GAP_MS) {
    // Something else held the hall. Most of the gap is simply gone.
    const w = wobble(next.felt + realElapsed);
    const remembered = Math.max(0, REMEMBER_FLOOR_MS * (1 + w));
    const lostMs = Math.max(0, realElapsed - remembered);

    next.felt = (next.felt || 0) + (remembered * newTempo) / BEAT_MS;
    next.lostBeats = (next.lostBeats || 0) + (lostMs * newTempo) / BEAT_MS;

    // Fell behind real time and stays behind. The error is never repaid.
    next.drift = (next.drift || 0) - lostMs;

    next.phase = mod01((next.phase || 0) + 0.5 + w);
    next.state = 'stumbling';
  } else {
    const feltMs = realElapsed * newTempo;
    next.felt = (next.felt || 0) + feltMs / BEAT_MS;
    next.phase = mod01((next.phase || 0) + feltMs / BEAT_MS);

    // Quicker than real adds positive drift, slower adds negative. Kept, always.
    next.drift = (next.drift || 0) + (feltMs - realElapsed);

    if (wasStumbling) next.state = 'remembering';
    else if (newTempo - prevTempo > TEMPO_EPS) next.state = 'quickening';
    else if (newTempo - prevTempo < -TEMPO_EPS) next.state = 'slowing';
    else next.state = 'steady';
  }

  next.tempo = newTempo;
  next.lastRealAt = new Date(nowMs).toISOString();
  next.updatedAt = next.lastRealAt;
  next.history = [
    ...(next.history || []),
    { state: next.state, at: next.updatedAt },
  ].slice(-8);

  return clamp(next);
}

/**
 * How far felt time has come apart from real time, in hours. Signed: positive
 * means he has run ahead of the clock, negative means the quiet ate it.
 */
export function driftHours(pulse: Pulse): number {
  return (pulse.drift || 0) / (1000 * 60 * 60);
}
