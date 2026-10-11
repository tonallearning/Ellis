export const SITE = {
  name: "tybuilds",
  hall: "Ellis Hall",
  tagline: "Portfolio host — conversation, not brochure.",
  tonalLearningUrl: "https://tonallearning.com",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
} as const;

/** Public contact for legal pages. Env first; the Ashe-published address as fallback. */
export function siteContactEmail(): string {
  return SITE.contactEmail || "tytianna.bennett@gmail.com";
}

export const GOE_TEASE =
  "Ty builds AI-native environments where agents aren't just prompted characters — they get conditions (memory, friction, rooms, consequence) that let a coherent sense of self emerge over time, without claiming sentience.";

