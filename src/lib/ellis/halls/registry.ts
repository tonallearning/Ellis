/**
 * Hall registry — per-application variants of Ellis's room.
 *
 * There are none right now, and the empty array is the honest state rather than
 * an oversight. An Anthropic hall existed and was removed: it was built for a
 * fellowship pitch, and once the target became a Claude Corps application the
 * whole room read as overkill — a bespoke themed lobby for a job posting is a
 * strange amount of effort to have someone walk through.
 *
 * The mechanism is kept because the next application may want one. Adding a
 * hall means one entry here plus `content/halls/{slug}.md`; nothing else in the
 * pipeline needs to change.
 */

export interface HallRegistry {
  slug: string;
  company: string;
  /** Brief, honest reason this company gets its own room. */
  enthusiasm: string;
  contentFile: string;
  active: boolean;
}

const HALLS: HallRegistry[] = [];

/**
 * `default` is always valid — it is the room Ellis actually lives in.
 */
export function isValidHall(slug: string): boolean {
  if (slug === 'default') return true;
  return HALLS.some((h) => h.slug === slug && h.active);
}
