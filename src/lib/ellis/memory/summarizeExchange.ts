const MEMORY_EXCERPT_CHARS = 280;

function memoryExcerpt(text: string): string {
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= MEMORY_EXCERPT_CHARS) return compact;
  return `${compact.slice(0, MEMORY_EXCERPT_CHARS - 1).trimEnd()}…`;
}

export function summarizeExchange(
  userMessage: string,
  ellisResponse: string,
  isOwner = false,
): string {
  const speaker = isOwner ? "Ty" : "Visitor";
  return `${speaker}: ${memoryExcerpt(userMessage)} | Ellis: ${memoryExcerpt(ellisResponse)}`;
}
