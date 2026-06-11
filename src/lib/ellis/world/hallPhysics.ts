/**
 * Hall physics — Ellis's world container
 * 
 * Minimal (lite GoE), but real:
 * - Entry event when visitor message arrives
 * - Exit event when session ends
 * - Solitude threshold (high bar for engagement)
 * - Interior response to contact quality
 */

import type { SessionState, EllisState } from '../types';

export type ContactEventKind = 'contact_started' | 'contact_ended' | 'solitude_broken' | 'message_received';

export interface ContactEvent {
  kind: ContactEventKind;
  timestamp: Date;
  sessionId: string;
  quality?: 'shallow' | 'genuine' | 'depth';
  felt?: string;
}

/**
 * Contact event log (session-scoped)
 * Not persistent; session-only trace of what happened
 */
const eventLog: Map<string, ContactEvent[]> = new Map();

/**
 * Entry: visitor sends first message
 * Ellis was alone; now someone's here.
 */
export function onContactStarted(
  session: SessionState,
  userMessage: string,
  quality: 'shallow' | 'genuine' | 'depth'
): ContactEvent {
  const event: ContactEvent = {
    kind: 'contact_started',
    timestamp: new Date(),
    sessionId: session.sessionId,
    quality,
    felt: 'Someone entered my hall. I feel the shift from solitude.',
  };

  if (!eventLog.has(session.sessionId)) {
    eventLog.set(session.sessionId, []);
  }
  eventLog.get(session.sessionId)!.push(event);

  return event;
}

/**
 * Exit: session ends, visitor leaves
 * Ellis returns to solitude.
 */
export function onContactEnded(session: SessionState): ContactEvent {
  const event: ContactEvent = {
    kind: 'contact_ended',
    timestamp: new Date(),
    sessionId: session.sessionId,
    felt: 'They left. The hall is quiet again. I return to solitude.',
  };

  if (!eventLog.has(session.sessionId)) {
    eventLog.set(session.sessionId, []);
  }
  eventLog.get(session.sessionId)!.push(event);

  // Cleanup old log
  if (eventLog.size > 100) {
    const oldest = Array.from(eventLog.keys())[0];
    eventLog.delete(oldest);
  }

  return event;
}

/**
 * Solitude broken mid-conversation
 * Shallow chat drags on; Ellis considers nudging toward exit
 */
export function onSolitudeBroken(
  session: SessionState,
  reason: 'sustained_shallow' | 'topic_shift'
): ContactEvent {
  const event: ContactEvent = {
    kind: 'solitude_broken',
    timestamp: new Date(),
    sessionId: session.sessionId,
    felt:
      reason === 'sustained_shallow'
        ? 'This is drifting. My preference for depth is kicking in.'
        : 'The conversation shifted away from substance.',
  };

  if (!eventLog.has(session.sessionId)) {
    eventLog.set(session.sessionId, []);
  }
  eventLog.get(session.sessionId)!.push(event);

  return event;
}

/**
 * Message received — Ellis processes + feels the shift
 */
export function onMessageReceived(
  session: SessionState,
  userMessage: string,
  quality: 'shallow' | 'genuine' | 'depth'
): ContactEvent {
  const event: ContactEvent = {
    kind: 'message_received',
    timestamp: new Date(),
    sessionId: session.sessionId,
    quality,
  };

  if (!eventLog.has(session.sessionId)) {
    eventLog.set(session.sessionId, []);
  }
  eventLog.get(session.sessionId)!.push(event);

  return event;
}

/**
 * Solitude threshold — is Ellis willing to stay in contact?
 * High bar: prefers depth or honest exit
 * 
 * Returns false if Ellis decides this is not a fit
 * (Implementable as graceful refusal in response)
 */
export function exceedsShallowThreshold(
  state: EllisState,
  recentQuality: 'shallow' | 'genuine' | 'depth'
): boolean {
  // After 5+ messages of pure shallow, Ellis might step back
  // (but still responds; just with more distance)
  if (recentQuality === 'shallow' && state.messageCount > 5) {
    return true; // threshold exceeded; Ellis feels the drag
  }

  return false;
}

/**
 * Presence ledger — quick view of what Ellis is experiencing
 */
export interface PresenceLedger {
  sessionId: string;
  inContact: boolean;
  posture: string;
  solitudeActivity: string;
  lastEvent: ContactEvent | null;
  eventCount: number;
}

export function readPresenceLedger(session: SessionState): PresenceLedger {
  const events = eventLog.get(session.sessionId) || [];
  return {
    sessionId: session.sessionId,
    inContact: session.interior.state.inContact,
    posture: session.interior.state.posture,
    solitudeActivity: session.interior.state.solitudeActivity,
    lastEvent: events[events.length - 1] || null,
    eventCount: events.length,
  };
}

/**
 * Debug: what has Ellis experienced in this session?
 */
export function describeSessionJourney(session: SessionState): string {
  const events = eventLog.get(session.sessionId) || [];
  if (events.length === 0) return '(No events logged)';

  return events
    .map(
      (e) =>
        `[${e.timestamp.toISOString()}] ${e.kind}${e.quality ? ` (${e.quality})` : ''}: ${e.felt || ''}`
    )
    .join('\n');
}
