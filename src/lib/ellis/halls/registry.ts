/**
 * Hall registry — which applications get excited halls
 */

export interface HallRegistry {
  slug: string;
  company: string;
  enthusiasm: string; // brief why
  contentFile: string; // content/halls/{slug}.md
  active: boolean;
}

// Update this as Ty builds excited halls
const HALLS: HallRegistry[] = [
  {
    slug: 'anthropic',
    company: 'Anthropic',
    enthusiasm: 'Claude, research-first culture, behavioral architecture alignment',
    contentFile: 'content/halls/anthropic.md',
    active: true,
  },
  {
    slug: 'huggingface',
    company: 'Hugging Face',
    enthusiasm: 'Open source, community, tooling for builders',
    contentFile: 'content/halls/huggingface.md',
    active: false, // when ready
  },
];

/**
 * Is this hall valid?
 */
export function isValidHall(slug: string): boolean {
  if (slug === 'default') return true; // always valid
  return HALLS.some((h) => h.slug === slug && h.active);
}

/**
 * Get hall info
 */
export function getHallInfo(slug: string): HallRegistry | null {
  return HALLS.find((h) => h.slug === slug) || null;
}

/**
 * List active halls
 */
export function listActiveHalls(): HallRegistry[] {
  return HALLS.filter((h) => h.active);
}
