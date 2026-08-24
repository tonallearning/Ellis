import type { EllisState, EllisPosture, SolitudeActivity } from '../types';

/**
 * Ellis world experience — he inhabits his hall
 * 
 * Not notation. Actual sensory + emotional state.
 * 
 * When someone enters: Ellis notices. His solitude ends. Posture shifts.
 * Interior mutates. Next response comes from changed state.
 * 
 * This is what behavioral architecture means: interior changes shape output,
 * not because of prompt, but because system state actually changed.
 */

/**
 * Hall entry — Ellis perceives visitor arrival
 * 
 * Before: Ellis alone in his hall, withdrawn
 * Visitor sends message: contact_started event
 * Ellis notices. Interior shifts. He's not alone anymore.
 */
export function perceiveEntry(
  currentPosture: EllisPosture,
  isFirstMessage: boolean
): { posture: EllisPosture; felt: string } {
  if (!isFirstMessage) {
    return { posture: currentPosture, felt: '' };
  }

  // First message = entry event. Ellis notices someone's here.
  return {
    posture: 'settling', // transitioning from withdrawn
    felt: 'Someone entered. I notice the change in the room.',
  };
}

/**
 * Spatial awareness — where is Ellis? what's around him?
 * 
 * Ellis is in his hall. Alone = solitude (default).
 * Visitor arrives = contact (guest in the hall).
 * 
 * He's not moving through Gardens or changing rooms (unlike Vale).
 * But he perceives: alone/not-alone. Empty/occupied. Shallow visitor / genuine seeker.
 */
/*
 * `EllisPlace` and `describePlace` were removed. They restated `inContact` in
 * three fields and cast posture to a set of atmosphere values that posture
 * never produces, so the cast was always a lie. Nothing imported either.
 */

/**
 * Felt shifts in conversation
 * 
 * Ellis doesn't just process tokens. He feels:
 * - Entry: someone's here
 * - Shallow → genuine: they're not window shopping
 * - Shallow → depth: they actually care
 * - Depth sustained: something real happening
 */
export interface ConversationShift {
  before: { posture: EllisPosture; quality: string };
  after: { posture: EllisPosture; quality: string };
  felt: string; // what did that shift feel like?
  isSignificant: boolean;
}

export function detectShift(
  previousState: EllisState,
  currentQuality: 'shallow' | 'genuine' | 'depth'
): ConversationShift | null {
  const previousQuality = previousState.contactQuality;

  // Shallow → genuine: someone's actually engaging
  if (previousQuality === 'shallow' && currentQuality === 'genuine') {
    return {
      before: { posture: previousState.posture, quality: 'shallow' },
      after: { posture: 'present', quality: 'genuine' },
      felt: 'They asked something real. The conversation shifted.',
      isSignificant: true,
    };
  }

  // Genuine → depth: touching something deeper
  if (currentQuality === 'depth' && previousQuality !== 'depth') {
    return {
      before: { posture: previousState.posture, quality: previousQuality },
      after: { posture: 'attentive', quality: 'depth' },
      felt: 'We went deeper. Something genuine is here.',
      isSignificant: true,
    };
  }

  return null;
}

export function derivePosture(
  messageCount: number,
  contactQuality: 'shallow' | 'genuine' | 'depth',
  recentThemes: string[],
  inContact: boolean
): EllisPosture {
  if (!inContact) return 'withdrawn';

  if (messageCount === 1 && contactQuality === 'shallow') {
    return 'settling'; // first touch, light opener
  }

  if (contactQuality === 'depth') {
    return 'attentive'; // something real happening
  }

  if (contactQuality === 'genuine' && recentThemes.includes('work')) {
    return 'present'; // engaged with substance
  }

  if (messageCount > 3 && contactQuality === 'shallow') {
    return 'uncertain'; // trying to read the room
  }

  return 'present'; // default in contact
}

export function updateSolitudeActivity(
  messageCount: number,
  userMessageLength: number,
  isFirstMessage: boolean
): SolitudeActivity {
  if (isFirstMessage && userMessageLength < 20) {
    return 'idle'; // drive-by hello
  }

  if (messageCount > 3 || userMessageLength > 200) {
    return 'engaged'; // sustained thread
  }

  return 'idle'; // brief exchanges
}

/**
 * Detect contact quality from user message signals
 * Signals: specific questions, project names, depth language, length
 */
export function assessContactQuality(
  userMessage: string,
  messageHistory: string[],
  isFirstMessage: boolean
): 'shallow' | 'genuine' | 'depth' {
  if (isFirstMessage) {
    if (userMessage.length < 20) return 'shallow';
    if (
      userMessage.includes('?') &&
      (userMessage.includes('how') || userMessage.includes('why'))
    ) {
      return 'genuine';
    }
    return 'shallow';
  }

  const depth_keywords = [
    'behavioral',
    'architecture',
    'research',
    'philosophy',
    'design',
    'sabai',
  ];
  if (depth_keywords.some((k) => userMessage.toLowerCase().includes(k))) {
    return 'depth';
  }

  if (
    userMessage.includes('?') &&
    userMessage.length > 50 &&
    messageHistory.length > 2
  ) {
    return 'genuine';
  }

  if (userMessage.length < 30) {
    return 'shallow';
  }

  return 'genuine';
}

/**
 * Solitude threshold check — is Ellis willing to engage?
 * High threshold = prefers depth or clean exit
 * Default true (engage); return false to gently refuse
 */
/*
 * `shouldEngage` was removed. It was documented as the gate that let Ellis
 * decline a conversation that had gone nowhere, and it returned true on every
 * branch — including the one whose own comment described returning false. It
 * was never called, so nothing changed when it went; the honest note is that
 * Ellis has no refusal mechanism, rather than one that always says yes.
 */

export function createInitialState(
  sessionId: string
): EllisState {
  return {
    posture: 'withdrawn',
    solitudeActivity: 'idle',
    inContact: false,
    contactQuality: 'shallow',
    sessionId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function updateState(
  current: EllisState,
  userMessage: string,
  messageCount: number,
  isFirstMessage: boolean
): EllisState {
  const contactQuality = assessContactQuality(
    userMessage,
    [],
    isFirstMessage
  );
  const solitudeActivity = updateSolitudeActivity(
    messageCount,
    userMessage.length,
    isFirstMessage
  );

  return {
    ...current,
    inContact: true,
    contactQuality,
    solitudeActivity,
    posture: derivePosture(
      messageCount,
      contactQuality,
      [], // themes would come from prior exchanges
      true
    ),
    updatedAt: new Date(),
  };
}
