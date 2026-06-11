import { readFile } from "node:fs/promises";
import path from "node:path";

export async function loadHallOverlay(hall: string): Promise<string> {
  if (hall === "default") return "";
  try {
    return await readFile(
      path.join(process.cwd(), "content/halls", `${hall}.md`),
      "utf8",
    );
  } catch {
    return "";
  }
}
