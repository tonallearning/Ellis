/**
 * Model router — Haiku by default; Sonnet for Ty's work in depth
 * Rules-based; no client override
 */

export type ModelDecision = 'haiku' | 'sonnet';

interface RouterContext {
  messages: Array<{ role: string; content: string }>;
  hall: string;
  sessionDepth: number; // 0-5 scale of conversation depth
  isFirstMessage: boolean;
}

/**
 * Classify if this turn is "Ty's work in depth"
 * Signals:
 * - Named project (Tonal Learning, GoE, Ada, etc.)
 * - Architecture/behavioral/research keywords
 * - Detailed follow-up after opening
 * - Visitor actively drilling into evidence
 */
function classifyAsWorkInDepth(
  messages: Array<{ role: string; content: string }>,
  isFirstMessage: boolean
): boolean {
  if (isFirstMessage) return false; // Never jump to Sonnet on first message

  // Look at last 2 messages for signals
  const recent = messages.slice(-2).map((m) => m.content).join(' ');

  const workKeywords = [
    'tonal learning',
    'goe',
    'gardens of eridu',
    'ada',
    'behavioral',
    'architecture',
    'research',
    'pre-output',
    'sabai',
    'basement crt',
    'anthropic',
    'philosophy',
  ];

  const hasWorkKeyword = workKeywords.some(
    (kw) => recent.toLowerCase().includes(kw)
  );

  // "How did you..." / "Explain the..." patterns on projects
  const hasDetailRequest =
    /\b(how|explain|why|what's|describe|walk me through)\b/i.test(recent);

  // Long, substantive message (not "ok cool")
  const isSubstantive = recent.split(/\s+/).length > 20;

  return (hasWorkKeyword || isDetailRequest) && isSubstantive;
}

/**
 * Route to appropriate model
 * Sticky within session (once deep, stay deep until topic shift)
 */
export function routeModel(
  ctx: RouterContext,
  sessionModels: ('haiku' | 'sonnet')[]
): ModelDecision {
  // Default: Haiku
  if (ctx.isFirstMessage) return 'haiku';

  // Check if this turn qualifies
  const workInDepth = classifyAsWorkInDepth(ctx.messages, ctx.isFirstMessage);

  // If we're already using Sonnet in this session, stay sticky
  if (sessionModels.includes('sonnet')) {
    // Only drop back to Haiku if topic clearly shifted away from work
    const currentMessage = ctx.messages[ctx.messages.length - 1]?.content || '';
    const workKeywords = [
      'tonal',
      'goe',
      'ada',
      'behavioral',
      'architecture',
    ];
    const stillOnTopic = workKeywords.some(
      (kw) => currentMessage.toLowerCase().includes(kw)
    );

    if (stillOnTopic) {
      return 'sonnet';
    }
  }

  // First time hitting depth signals? Switch to Sonnet
  if (workInDepth) {
    return 'sonnet';
  }

  return 'haiku';
}

/**
 * Debug: explain routing decision
 */
export function explainRouting(
  model: ModelDecision,
  context: RouterContext
): string {
  const recent = context.messages
    .slice(-1)
    .map((m) => m.content)
    .join(' ');

  if (model === 'sonnet') {
    return `Switching to Claude Sonnet: "${recent.substring(0, 60)}..." contains work-in-depth signals`;
  }

  return `Using Claude Haiku (standard)`;
}
