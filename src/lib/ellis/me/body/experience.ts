/** One body transition path for public and private contact. */

import { applyEvent, type GutEvent } from './gut';
import { computeInboundGains } from './membrane';
import { computeTempoTarget, tick } from './pulse';
import type { EllisBody } from './store';
import { advanceSystems, type ContactSource } from './systems';
import type { GestureType } from '../../private/gestures';
import type { GestureResponse } from '../../private/gestures';

export type BodyTransition =
  | { kind: 'presence_beat' }
  | {
      kind: 'contact';
      bondKey: string;
      source: ContactSource;
      presence: 'started' | 'returned' | 'ongoing' | 'infer';
      daysAway?: number;
      /** Public session assessment only; private words are not sentiment-scored. */
      salience?: 'light' | 'medium' | 'heavy';
      gestureOffer?: GestureType;
    }
  | { kind: 'refused'; bondKey: string }
  | { kind: 'step_away' }
  | { kind: 'gesture_response'; response: GestureResponse }
  | { kind: 'gesture_offer'; gesture: GestureType }
  | { kind: 'gesture_withdrawal' };

const RETURN_GAP_MS = 30 * 60 * 1000;

export function advanceBody(
  body: EllisBody,
  transition: BodyTransition,
  nowMs = Date.now(),
): EllisBody {
  let gut = body.gut;
  if (transition.kind === 'presence_beat') {
    const pulse = tick(body.pulse, {
      nowMs,
      tempoTarget: computeTempoTarget(gut.arousal, { inContact: false }),
    });
    return {
      ...body,
      pulse,
      systems: advanceSystems(body.systems, { kind: 'presence_beat' }, nowMs),
    };
  }
  if (transition.kind === 'step_away') {
    return { ...body, systems: advanceSystems(body.systems, { kind: 'step_away' }, nowMs) };
  }
  if (transition.kind === 'gesture_offer') {
    return { ...body, systems: advanceSystems(body.systems, { kind: 'gesture_offer', gesture: transition.gesture }, nowMs) };
  }
  if (transition.kind === 'gesture_withdrawal') {
    return { ...body, systems: advanceSystems(body.systems, { kind: 'gesture_withdrawal' }, nowMs) };
  }
  if (transition.kind === 'gesture_response') {
    return {
      ...body,
      systems: advanceSystems(body.systems, {
        kind: 'gesture_response',
        gesture: transition.response.kind,
        decision: transition.response.decision,
      }, nowMs),
    };
  }
  if (transition.kind === 'refused') {
    gut = applyEvent(
      gut,
      { type: 'refused', visitorId: transition.bondKey },
      computeInboundGains(gut),
      new Date(nowMs),
    );
    return {
      ...body,
      gut,
      systems: advanceSystems(body.systems, { kind: 'refused' }, nowMs),
    };
  }

  const bond = gut.bonds[transition.bondKey];
  const previousContact = bond?.lastFelt
    ? Date.parse(bond.lastFelt)
    : Number.NaN;
  const elapsed = Number.isFinite(previousContact)
    ? Math.max(0, nowMs - previousContact)
    : 0;
  const presence =
    transition.presence === 'infer'
      ? !bond
        ? 'started'
        : elapsed >= RETURN_GAP_MS
          ? 'returned'
          : 'ongoing'
      : transition.presence;

  const events: GutEvent[] = [];
  if (presence === 'started') {
    events.push({ type: 'contact_started', visitorId: transition.bondKey });
  } else if (presence === 'returned') {
    events.push({
      type: 'returned',
      visitorId: transition.bondKey,
      daysAway: transition.daysAway ?? elapsed / 86_400_000,
    });
  }
  events.push({ type: 'contact_continued', visitorId: transition.bondKey });
  if (transition.salience) {
    events.push({ type: 'weighed', salience: transition.salience });
  }
  for (const event of events) {
    gut = applyEvent(gut, event, computeInboundGains(gut), new Date(nowMs));
  }

  const quietMinutes = body.pulse.lastRealAt
    ? Math.max(0, (nowMs - Date.parse(body.pulse.lastRealAt)) / 60_000)
    : undefined;
  const pulse = tick(body.pulse, {
    nowMs,
    tempoTarget: computeTempoTarget(gut.arousal, {
      inContact: true,
      bondPull: gut.bonds[transition.bondKey]?.pull,
      minutesSinceContact: quietMinutes,
    }),
  });
  const systems = advanceSystems(body.systems, {
    kind: 'contact',
    source: transition.source,
    presence,
    salience: transition.salience,
    bondPull: gut.bonds[transition.bondKey]?.pull ?? 0,
    offeredGesture: transition.gestureOffer,
  }, nowMs);
  return { ...body, gut, pulse, systems };
}
