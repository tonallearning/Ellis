import type {
  EllisInterior,
  AssembleParams,
  InteriorContext,
} from '../types';
import type { IpVisitorMemory } from '../memory/ipMemory';
import { prioritizeTraces, tracesSummary } from './traces';

/**
 * Assembly — build interior context for prompt
 * Server-only; never exposed on client wire or API payload
 */

export interface AssembleWithIpParams extends AssembleParams {
  ipMemory?: IpVisitorMemory;
}

export function assembleEllisInterior(
  params: AssembleWithIpParams
): InteriorContext {
  const { interior, userMessage, hallContext, ipMemory } = params;

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
    blocks.push(`\n## Prior visit(s)`);
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

  // 3. Working memory (current threads)
  if (interior.workingMemory.length > 0) {
    blocks.push(`\n## Open threads`);
    interior.workingMemory.forEach((item) => {
      blocks.push(`- ${item.text}`);
    });
  }

  // 4. Relational snapshot (this visitor)
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

  // 5. Hall context (if excited hall)
  if (hallContext) {
    blocks.push(`\n## Hall context\n${hallContext}`);
  }

  // 6. Sense of self delta
  if (interior.senseOfSelf.sessionDrift) {
    blocks.push(`\n## How this conversation is changing me\n${interior.senseOfSelf.sessionDrift}`);
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

/**
 * Privacy check — ensure interior never leaks
 */
export function validateInteriorNotInWire(
  response: string,
  interior: EllisInterior
): boolean {
  // Check that actual interior state wasn't echoed back to client
  // (Very defensive; should never happen if we're careful)
  const dangerousPatterns = [
    interior.state.posture,
    'workingMemory',
    'continuity',
  ];

  const hasLeak = dangerousPatterns.some((pattern) =>
    response.includes(pattern)
  );

  if (hasLeak) {
    console.error('[SECURITY] Interior leaked to response:', {
      leakPatterns: dangerousPatterns.filter((p) =>
        response.includes(p)
      ),
    });
    return false;
  }

  return true;
}
