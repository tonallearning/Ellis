/**
 * IP Memory integration — wires IP memory into the stream pipeline
 * Handles: load → mark return → assemble → record
 */

import crypto from 'crypto';
import type { SessionState } from './types';
import type { IpVisitorMemory, EpisodBeat } from './memory/ipMemory';
import {
  loadIpMemory,
  recordIpVisit,
  generateDayLabel,
  markReturnVisit,
} from './memory/ipMemory';

export { hashVisitorIp } from './memory/hashVisitor';

/**
 * Extract visitor IP from request (check headers in order).
 */
export function extractVisitorIp(headers: Headers): string {
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp;

  // Fallback (localhost in dev)
  return headers.get('cf-connecting-ip') || '127.0.0.1';
}

/**
 * Build episodic beats from session data at the end of a stream.
 * Called after stream completes to snapshot this interaction.
 */
export function buildEpisodBeat(
  session: SessionState,
  userMessage: string,
  ellisResponse: string
): EpisodBeat {
  const now = new Date();

  return {
    beatId: crypto.randomUUID(),
    occurredAt: now,
    dayLabel: generateDayLabel(now, now),
    summary: `${userMessage.substring(0, 80)}${userMessage.length > 80 ? '...' : ''}`,
    resonance: assessResonance(session, userMessage, ellisResponse),
    theme: categorizeTheme(userMessage),
    depthReached: session.interior.state.contactQuality === 'depth' ? 5 : 
                 session.interior.state.contactQuality === 'genuine' ? 4 : 3,
  };
}

/**
 * Assess the emotional/meaningful quality of this exchange.
 */
function assessResonance(
  session: SessionState,
  userMessage: string,
  ellisResponse: string
): string | undefined {
  const lowerMsg = userMessage.toLowerCase();
  
  // Heuristics for meaningful moments
  if (lowerMsg.includes('why') || lowerMsg.includes('how does')) {
    return 'Genuine curiosity about mechanics';
  }
  if (lowerMsg.includes('role') || lowerMsg.includes('fit')) {
    return 'Assessing personal/professional fit';
  }
  if (lowerMsg.includes('code') || lowerMsg.includes('build')) {
    return 'Technical depth; interested in implementation';
  }
  if (session.interior.state.contactQuality === 'depth') {
    return 'Deep engagement; meaningful exchange';
  }

  return undefined;
}

/**
 * Categorize the theme of this conversation turn.
 */
function categorizeTheme(userMessage: string): string {
  const lowerMsg = userMessage.toLowerCase();

  if (lowerMsg.includes('architecture') || lowerMsg.includes('design')) {
    return 'architecture';
  }
  if (lowerMsg.includes('ada') || lowerMsg.includes('vale') || lowerMsg.includes('tonal learning')) {
    return 'projects';
  }
  if (lowerMsg.includes('role') || lowerMsg.includes('hire') || lowerMsg.includes('fit')) {
    return 'fit-assessment';
  }
  if (lowerMsg.includes('code') || lowerMsg.includes('technical')) {
    return 'technical';
  }
  if (lowerMsg.includes('ty') || lowerMsg.includes('background')) {
    return 'biography';
  }

  return 'general';
}

/**
 * Build thread summary from multiple beats.
 */
export function buildThreadSummary(beats: EpisodBeat[]): string {
  if (beats.length === 0) return 'Brief interaction.';

  const themes = beats.map((b) => b.theme).filter(Boolean);
  const uniqueThemes = [...new Set(themes)];
  const avgDepth = Math.round(
    beats.reduce((sum, b) => sum + b.depthReached, 0) / beats.length
  );

  return `Explored: ${uniqueThemes.join(', ')}. Average engagement depth: ${avgDepth}/5.`;
}

/**
 * Record IP visit at end of stream session.
 */
export async function recordIpVisitAfterStream(
  ipHash: string,
  sessionBeats: EpisodBeat[],
  ellisResponseLength: number
): Promise<void> {
  const summary = buildThreadSummary(sessionBeats);
  await recordIpVisit({
    ipHash,
    episodicBeats: sessionBeats,
    threadSummary: summary,
  });

  // Mark as return visit in ellis_usage if applicable
  const today = new Date().toISOString().split('T')[0];
  await markReturnVisit(ipHash, today);
}
