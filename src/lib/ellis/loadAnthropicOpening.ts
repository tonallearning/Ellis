import { readFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_OPENING = `Bet you're confused.
My name is Ellis.
Ty borrowed Claude's face to catch your eye.
She builds inhabited systems — agents with memory, friction, and consequence, not cosplay. The build logs on this page are real. What do you want to know about her work?`;

export async function loadAnthropicOpening(): Promise<string> {
  try {
    const filePath = path.join(
      process.cwd(),
      "content/halls/anthropic-opening.md",
    );
    const raw = await readFile(filePath, "utf8");
    const body = raw
      .replace(/^#.*\n+/m, "")
      .replace(/^>.*\n+/gm, "")
      .trim();
    return body || DEFAULT_OPENING;
  } catch {
    return DEFAULT_OPENING;
  }
}
