import { readFile } from "node:fs/promises";
import path from "node:path";

/** Question bank for Ellis onboarding — NOT Ty's cheat-sheet docs. */
export async function loadOnboardingBank(): Promise<string> {
  const bankPath = path.join(
    process.cwd(),
    "docs/reference/ONBOARDING.md",
  );
  try {
    return await readFile(bankPath, "utf8");
  } catch {
    return "";
  }
}
