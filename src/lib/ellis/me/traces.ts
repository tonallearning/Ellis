import type { Trace, RelationalSnapshot } from '../types';

/**
 * Traces — lightweight session marks from conversation beats
 * Not full event ledger; just notable moments to feed assembly
 */

export function createTrace(
  kind: 'opening' | 'exchange' | 'theme' | 'handoff' | 'closure',
  text: string,
  messageIndex: number,
  salience: number = 0.5
): Trace {
  return {
    kind,
    text,
    messageIndex,
    salience,
    timestamp: new Date(),
  };
}

/**
 * Extract traces from an Ellis response
 * Signal moments: project mentions, theme shifts, genuine exchanges, handoffs
 */
export function extractTracesFromResponse(
  ellisResponse: string,
  messageIndex: number,
  userMessage: string
): Trace[] {
  const traces: Trace[] = [];

  // Theme detection: project names or work philosophy
  if (
    ellisResponse.includes('Tonal Learning') ||
    ellisResponse.includes('Gardens of Eridu') ||
    ellisResponse.includes('Ada')
  ) {
    traces.push(
      createTrace(
        'theme',
        `Project mentioned: ${ellisResponse.substring(0, 100)}...`,
        messageIndex,
        0.8
      )
    );
  }

  // Genuine exchange (if user asked specific question)
  if (userMessage.includes('?')) {
    traces.push(
      createTrace(
        'exchange',
        `Question addressed: ${userMessage.substring(0, 80)}...`,
        messageIndex,
        0.7
      )
    );
  }

  // Behavioral architecture or design philosophy
  if (
    ellisResponse.includes('behavioral') ||
    ellisResponse.includes('architecture') ||
    ellisResponse.includes('sabai')
  ) {
    traces.push(
      createTrace(
        'theme',
        'Behavioral architecture / design philosophy explored',
        messageIndex,
        0.9
      )
    );
  }

  // Handoff to project
  if (
    ellisResponse.includes('/projects/') ||
    ellisResponse.includes('basement') ||
    ellisResponse.includes('GoE')
  ) {
    traces.push(
      createTrace(
        'handoff',
        'Project room opportunity identified',
        messageIndex,
        0.8
      )
    );
  }

  return traces;
}

/**
 * Traces assessment for assembly
 * Returns top N traces by salience, by kind
 */
export function prioritizeTraces(
  traces: Trace[],
  limit: number = 5
): Trace[] {
  return traces.sort((a, b) => b.salience - a.salience).slice(0, limit);
}

export function tracesSummary(traces: Trace[]): string {
  if (traces.length === 0) return '';

  return traces
    .slice(0, 3)
    .map((t) => `[${t.kind}] ${t.text}`)
    .join('\n');
}

/**
 * Relational snapshot — assess this visitor _now_
 * No return-visit merge; pure instance assessment
 */
export function createRelationalSnapshot(
  userMessage: string,
  ellisResponses: string[],
  projectsMentioned: string[] = []
): RelationalSnapshot {
  // Tone assessment
  let tone = 'exploratory';
  if (userMessage.includes('?')) tone = 'inquisitive';
  if (
    userMessage.includes('yes') ||
    userMessage.includes('definitely') ||
    userMessage.includes('interested')
  ) {
    tone = 'positive';
  }
  if (
    userMessage.includes('no') ||
    userMessage.includes('not') ||
    userMessage.includes('decline')
  ) {
    tone = 'skeptical';
  }

  // Fit signal (Ellis's assessment of match)
  let fitSignal: 'strong' | 'maybe' | 'weak' = 'maybe';
  const responseText = ellisResponses.join(' ').toLowerCase();
  if (responseText.includes('seems like a fit') || projectsMentioned.length > 2) {
    fitSignal = 'strong';
  }
  if (responseText.includes('might not be')) {
    fitSignal = 'weak';
  }

  // Depth scale (0-5): how deep did we go?
  let depthReached = 1; // default: surface
  if (responseText.includes('architecture') || responseText.includes('research')) {
    depthReached = Math.min(5, depthReached + 2);
  }
  if (projectsMentioned.length > 1) {
    depthReached = Math.min(5, depthReached + 1);
  }

  return {
    visitorTone: tone,
    fitSignal,
    depthReached,
    openThreads: [], // would track what's unresolved
    projectsDiscussed: projectsMentioned,
  };
}

export function updateRelational(
  current: RelationalSnapshot,
  newThemes: string[]
): RelationalSnapshot {
  return {
    ...current,
    openThreads: [...new Set([...current.openThreads, ...newThemes])],
  };
}
