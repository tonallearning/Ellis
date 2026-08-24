import type { AssembleParams, InteriorContext } from '../types';
import type { IpVisitorMemory } from '../memory/ipMemory';
import { prioritizeTraces, tracesSummary } from './traces';

/**
 * Assembly — build interior context for prompt
 * Server-only; never exposed on client wire or API payload
 */

export interface AssembleWithIpParams extends AssembleParams {
  ipMemory?: IpVisitorMemory;
  /** Ty unlocked as herself — recall is not a stranger's seven-day window. */
  isOwner?: boolean;
  /**
   * Somatic state already rendered to language by the membrane. Null when the
   * body is quiet enough that it does not reach him this turn.
   */
  bodyBlock?: string | null;
}

export function assembleEllisInterior(
  params: AssembleWithIpParams
): InteriorContext {
  const { interior, hallContext, ipMemory, bodyBlock, isOwner } = params;

  const blocks: string[] = [];

  // 1. Spatial awareness (where is Ellis? what does he sense?)
  blocks.push(`## Ellis's place`);
  blocks.push(`**Location:** His hall`);
  blocks.push(`**Alone:** ${interior.state.inContact ? 'No, someone is here' : 'Yes, in solitude'}`);
  blocks.push(`**Atmosphere:** ${interior.state.posture}`);
  if (interior.state.perceptionLast) {
    blocks.push(`**Felt:** ${interior.state.perceptionLast}`);
  }

  // 1.5. IP Memory (return visit recall)
  if (ipMemory && !ipMemory.isExpired) {
    blocks.push(isOwner ? `\n## Ty` : `\n## Prior visit(s)`);
    if (isOwner) {
      blocks.push(`This is Ty. Recall is not on a seven-day clock.`);
    }
    blocks.push(`**Last visit:** ${ipMemory.daysAgo} day(s) ago (${ipMemory.lastSeenAt.toLocaleDateString()})`);
    
    const recentBeats = ipMemory.episodicBeats.slice(-3); // last 3 beats for context
    if (recentBeats.length > 0) {
      blocks.push(`**What we discussed:**`);
      recentBeats.forEach((beat) => {
        const dayLabel = beat.dayLabel || beat.occurredAt.toLocaleDateString();
        blocks.push(`- [${dayLabel}] ${beat.summary}`);
        if (beat.resonance) {
          blocks.push(`  → ${beat.resonance}`);
        }
      });
    }

    if (ipMemory.threadSummary) {
      blocks.push(`**Overall thread:** ${ipMemory.threadSummary}`);
    }
  }

  // 1.75. Body. Carried across every visitor, not just this one — the membrane
  // decides how much of it is available to him and returns null when the answer
  // is none.
  if (bodyBlock) {
    blocks.push(`\n## Body`);
    blocks.push(bodyBlock);
  }

  // 2. Interior state
  blocks.push(`\n## Ellis's interior state`);
  blocks.push(`**Posture:** ${interior.state.posture}`);
  blocks.push(`**In contact:** ${interior.state.inContact}`);
  blocks.push(
    `**Contact quality:** ${interior.state.contactQuality} (${interior.state.solitudeActivity})`
  );
  if (interior.state.atmosphereLast) {
    blocks.push(`**Atmosphere:** ${interior.state.atmosphereLast}`);
  }

  // 2. Session marks (traces)
  const traceSummary = tracesSummary(
    prioritizeTraces(interior.traces, 3)
  );
  if (traceSummary) {
    blocks.push(`\n## Session marks\n${traceSummary}`);
  }

  // 3. Relational snapshot (this visitor)
  if (interior.relational.visitorTone) {
    blocks.push(`\n## This conversation`);
    blocks.push(`**Visitor tone:** ${interior.relational.visitorTone}`);
    blocks.push(`**Fit signal:** ${interior.relational.fitSignal}`);
    blocks.push(`**Depth reached:** ${interior.relational.depthReached}/5`);
    if (interior.relational.projectsDiscussed.length > 0) {
      blocks.push(
        `**Projects discussed:** ${interior.relational.projectsDiscussed.join(', ')}`
      );
    }
  }

  // 4. Hall context (if excited hall)
  if (hallContext) {
    blocks.push(`\n## Hall context\n${hallContext}`);
  }

  const formattedBlock = blocks.join('\n');

  // Rough token count (1 word ≈ 1.3 tokens)
  const tokenEstimate = Math.ceil(formattedBlock.split(/\s+/).length * 1.3);

  return {
    formattedBlock,
    tokens: tokenEstimate,
    traces: prioritizeTraces(interior.traces, 5),
  };
}

/**
 * Format interior context for model input
 * Server-side only — builds the actual block that goes into system + user context
 */
export function formatEllisInteriorForModel(
  context: InteriorContext
): string {
  return `${context.formattedBlock}\n\n[Ellis interior context: ~${context.tokens} tokens]`;
}

/*
 * A `validateInteriorNotInWire` check used to live here. It was never called,
 * and it would not have worked: it flagged a leak whenever the response
 * contained the current posture word, so an Ellis who was "present" tripped it
 * by using an ordinary English adjective. Interior stays server-side because
 * this module's output only ever goes into the model request — that is the
 * actual guarantee, and a substring scan was never adding to it.
 */
