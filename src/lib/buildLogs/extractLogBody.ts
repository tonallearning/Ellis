/** Strip boilerplate before the chronological `## Log` section for cleaner reading. */
export function extractLogBody(markdown: string): string {
  const marker = "\n## Log\n";
  const index = markdown.indexOf(marker);
  if (index === -1) return markdown;
  return markdown.slice(index + marker.length).trim();
}
