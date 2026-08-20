import type { SessionState, EllisInterior } from '../types';
import { createInitialState, updateState, perceiveEntry, detectShift } from '../me/state';
import {
  createTrace,
  extractTracesFromResponse,
  createRelationalSnapshot,
} from '../me/traces';
import {
  onContactStarted,
  onContactEnded,
  readPresenceLedger,
} from '../world/hallPhysics';

/**
 * Session store — server-side memory for this visitor's session.
 * TTL expires with the session. Cross-visit recall is a separate layer
 * (memory/ipMemory.ts, 7-day rolling); this store never outlives the visit.
 */

const SESSION_TTL = 24 * 60 * 60 * 1000; // 24 hours
const sessions = new Map<string, SessionState>();

/**
 * Create new session — Ellis wakes in his hall
 */
export function createSession(
  sessionId: string,
  visitorId: string,
  hall: 'default' | string = 'default'
): SessionState {
  const now = new Date();

  const interior: EllisInterior = {
    state: {
      ...createInitialState(sessionId),
      perceptionLast: 'I am alone in my hall, waiting.',
      atmosphereLast: 'Quiet. Settled.',
    },
    traces: [
      createTrace(
        'opening',
        'Session started; Ellis is alone in his hall',
        0,
        1.0
      ),
    ],
    relational: {
      visitorTone: 'unknown',
      fitSignal: 'maybe',
      depthReached: 0,
      openThreads: [],
      projectsDiscussed: [],
    },
    workingMemory: [],
    senseOfSelf: {
      baseline:
        'I am Ellis, a portfolio host for Ty. I know myself; I am learning Ty. I inhabit my hall.',
    },
  };

  const session: SessionState = {
    sessionId,
    visitorId,
    hall,
    interior,
    messageCount: 0,
    startedAt: now,
    lastActivity: now,
    costUsd: 0,
    modelsSeen: [],
  };

  sessions.set(sessionId, session);

  // Auto-expire
  setTimeout(() => {
    const expiring = sessions.get(sessionId);
    if (expiring && expiring.interior.state.inContact) {
      onContactEnded(expiring);
    }
    sessions.delete(sessionId);
  }, SESSION_TTL);

  return session;
}

/**
 * Retrieve session
 */
export function getSession(sessionId: string): SessionState | null {
  return sessions.get(sessionId) || null;
}

/**
 * Update session after a turn — Ellis processes + shifts
 */
export function updateSession(
  sessionId: string,
  userMessage: string,
  ellisResponse: string,
  modelUsed: 'haiku' | 'sonnet',
  costUsd: number
): SessionState | null {
  const session = sessions.get(sessionId);
  if (!session) return null;

  const isFirstMessage = session.messageCount === 0;
  const messageCount = session.messageCount + 1;

  // First message: contact event
  if (isFirstMessage) {
    const quality = session.interior.state.contactQuality;
    onContactStarted(session, userMessage, quality);
    
    const entry = perceiveEntry(session.interior.state.posture, true);
    session.interior.state.perceptionLast = entry.felt;
  }

  // Update state
  const newState = updateState(
    session.interior.state,
    userMessage,
    messageCount,
    isFirstMessage
  );

  // Detect conversation shifts
  const shift = detectShift(session.interior.state, newState.contactQuality);
  if (shift && shift.isSignificant) {
    session.interior.state.atmosphereLast = shift.felt;
  }

  session.interior.state = newState;

  // Add traces
  const newTraces = extractTracesFromResponse(
    ellisResponse,
    messageCount,
    userMessage
  );
  session.interior.traces.push(...newTraces);

  // Update relational snapshot
  if (isFirstMessage) {
    session.interior.relational = createRelationalSnapshot(
      userMessage,
      [ellisResponse]
    );
  }

  // Track models used
  if (!session.modelsSeen.includes(modelUsed)) {
    session.modelsSeen.push(modelUsed);
  }

  // Update metadata
  session.messageCount = messageCount;
  session.lastActivity = new Date();
  session.costUsd += costUsd;

  return session;
}

/**
 * Clean expired sessions (manual call, could be periodic)
 */
export function cleanExpiredSessions(): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [id, session] of sessions.entries()) {
    const age = now - session.lastActivity.getTime();
    if (age > SESSION_TTL) {
      sessions.delete(id);
      cleaned++;
    }
  }

  return cleaned;
}

/**
 * Session count (debug)
 */
export function getSessionCount(): number {
  return sessions.size;
}
