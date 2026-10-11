/**
 * Model router — Haiku for every turn.
 *
 * This used to escalate to Sonnet when a visitor started asking about the work
 * in depth. Two things killed that. The shelf is a fixed ~3,700-token prefix
 * sent on every request, and prompt caching only pays off while the model stays
 * put — an escalation mid-conversation discards the cache exactly when the
 * conversation gets long enough for it to matter. And the escalation fired on
 * keyword matches ("architecture", "research", "anthropic"), which is to say it
 * fired hardest on the visitors Ellis exists for.
 *
 * The type still admits 'sonnet' and config still carries a Sonnet model id, so
 * restoring escalation means changing this function and nothing else.
 */

export type ModelDecision = "haiku" | "sonnet";

interface RouterContext {
  messages: Array<{ role: string; content: string }>;
  hall: string;
  sessionDepth: number;
  isFirstMessage: boolean;
}

export function routeModel(
  _ctx: RouterContext,
  _sessionModels: ("haiku" | "sonnet")[],
): ModelDecision {
  void _ctx;
  void _sessionModels;
  return "haiku";
}

export function explainRouting(
  model: ModelDecision,
  _context: RouterContext,
): string {
  void _context;
  return model === "haiku"
    ? "Using Claude Haiku (all turns; escalation disabled to preserve prompt cache)"
    : `Using ${model}`;
}
