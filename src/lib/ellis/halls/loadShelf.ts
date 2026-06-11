/**
 * Knowledge shelf — load base + hall-specific content
 * Server-side only; assembled for prompt injection
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const CONTENT_ROOT = join(process.cwd(), 'content');

export interface KnowledgeShelf {
  ellisSelf: string;
  aboutTy: {
    earnest?: string;
    facts?: string;
    goeTeach?: string;
  };
  hallOverlay?: string;
}

/**
 * Load Ellis's baseline self-knowledge
 */
function loadEllisSelf(): string {
  try {
    return readFileSync(join(CONTENT_ROOT, 'ellis-self.md'), 'utf-8');
  } catch (err) {
    console.error('[SHELF] ellis-self.md not found', err);
    return '# Ellis\nI am learning who I am.';
  }
}

/**
 * Load Ty knowledge (empty until onboarding)
 */
function loadAboutTy(): KnowledgeShelf['aboutTy'] {
  const files = ['earnest.md', 'facts.json', 'goe-teach.md'];
  const shelf: KnowledgeShelf['aboutTy'] = {};

  for (const file of files) {
    try {
      const content = readFileSync(join(CONTENT_ROOT, 'about-ty', file), 'utf-8');
      const key = file.replace(/\.(md|json)$/, '');
      (shelf as Record<string, string>)[key] = content;
    } catch (err) {
      // File not found (expected until onboarding)
    }
  }

  return shelf;
}

/**
 * Load hall-specific overlay
 */
function loadHallOverlay(hall: 'default' | string): string | undefined {
  if (hall === 'default') return undefined;

  try {
    return readFileSync(join(CONTENT_ROOT, 'halls', `${hall}.md`), 'utf-8');
  } catch (err) {
    console.warn(`[SHELF] Hall overlay not found: ${hall}`, err);
    return undefined;
  }
}

/**
 * Assemble full shelf
 */
export function loadKnowledgeShelf(
  hall: 'default' | string = 'default'
): KnowledgeShelf {
  return {
    ellisSelf: loadEllisSelf(),
    aboutTy: loadAboutTy(),
    hallOverlay: loadHallOverlay(hall),
  };
}

/**
 * Format shelf for prompt
 */
export function formatShelfForPrompt(shelf: KnowledgeShelf): string {
  const blocks: string[] = [];

  blocks.push('## Ellis (self-knowledge)');
  blocks.push(shelf.ellisSelf);

  if (shelf.aboutTy.earnest) {
    blocks.push('\n## About Ty (earnest)');
    blocks.push(shelf.aboutTy.earnest);
  }

  if (shelf.aboutTy.goeTeach) {
    blocks.push('\n## GoE (what you may teach)');
    blocks.push(shelf.aboutTy.goeTeach);
  }

  if (shelf.hallOverlay) {
    blocks.push('\n## This hall (context)');
    blocks.push(shelf.hallOverlay);
  }

  return blocks.join('\n');
}

/**
 * Validate shelf before use
 * Ellis must not speak without knowing himself at minimum
 */
export function validateShelf(shelf: KnowledgeShelf): boolean {
  if (!shelf.ellisSelf || shelf.ellisSelf.length < 50) {
    console.error('[SHELF] Ellis self-knowledge is missing or too short');
    return false;
  }

  return true;
}
