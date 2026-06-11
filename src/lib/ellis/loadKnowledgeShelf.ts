import { readFile } from "node:fs/promises";
import path from "node:path";
import type { KnowledgeShelf } from "./types";

const CONTENT = path.join(process.cwd(), "content");

async function readOptional(relative: string): Promise<string> {
  try {
    return await readFile(path.join(CONTENT, relative), "utf8");
  } catch {
    return "";
  }
}

function isAboutTyEmpty(
  earnest: string,
  facts: string,
  goeTeach: string,
): boolean {
  const earnestEmpty =
    !earnest.trim() ||
    earnest.includes("Status:** Empty") ||
    earnest.includes("has not learned Ty yet");
  let factsEmpty = true;
  try {
    const parsed = JSON.parse(facts || "{}") as { _meta?: { status?: string } };
    factsEmpty = parsed._meta?.status === "empty" || Object.keys(parsed).length <= 1;
  } catch {
    factsEmpty = true;
  }
  const goeEmpty =
    !goeTeach.trim() ||
    goeTeach.includes("Status:** Empty") ||
    goeTeach.includes("has not learned");
  return earnestEmpty && factsEmpty && goeEmpty;
}

export async function loadKnowledgeShelf(): Promise<KnowledgeShelf> {
  const ellisSelf = await readOptional("ellis-self.md");
  const aboutTyEarnest = await readOptional("about-ty/earnest.md");
  const aboutTyFacts = await readOptional("about-ty/facts.json");
  const aboutTyGoeTeach = await readOptional("about-ty/goe-teach.md");

  return {
    ellisSelf,
    aboutTyEarnest,
    aboutTyFacts,
    aboutTyGoeTeach,
    aboutTyEmpty: isAboutTyEmpty(
      aboutTyEarnest,
      aboutTyFacts,
      aboutTyGoeTeach,
    ),
  };
}
