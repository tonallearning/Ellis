import type { EllisState, EllisPosture, SolitudeActivity } from './types';

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
export interface EllisPlace {
  location: 'hall'; // always his hall in v1
  occupied: boolean; // is someone here?
  alone: boolean; // is he in solitude?
  atmosphere: 'empty' | 'settling' | 'present' | 'engaged' | 'uncertain';
}

export function describePlace(state: EllisState): EllisPlace {
  return {
    location: 'hall',
    occupied: state.inContact,
    alone: !state.inContact,
    atmosphere: state.posture,
  };
}

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

  // Shallow sustained: reading the room
  if (previousQuality === 'shallow' && currentQuality === 'shallow') {
    if (previousState.messageCount > 3) {
      return {
        before: { posture: previousState.posture, quality: 'shallow' },
        after: { posture: 'uncertain', quality: 'shallow' },
        felt: 'Still light. Wondering what they really want.',
        isSignificant: false,
      };
    }
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
export function shouldEngage(
  contactQuality: 'shallow' | 'genuine' | 'depth',
  messageCount: number,
  sessionAge: number // seconds
): boolean {
  // Always engage if there's depth or genuine curiosity
  if (contactQuality !== 'shallow') return true;

  // Shallow openers are fine at message 1-2
  if (messageCount <= 2) return true;

  // After 3+ shallow messages, start considering exit
  // (but still respond gracefully; just indicate time/energy limit)
  if (messageCount > 5 && contactQuality === 'shallow') {
    // Option: return false here to trigger "I think this might not be the right fit" response
    // For v1, still engage but with slightly more distance
    return true;
  }

  return true;
}

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
