export const SITE = {
  name: "tybuilds",
  hall: "Ellis Hall",
  tagline: "Portfolio host — conversation, not brochure.",
  tonalLearningUrl: "https://tonallearning.com",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
} as const;

export const GOE_TEASE =
  "Ty builds AI-native environments where agents aren't just prompted characters — they get conditions (memory, friction, rooms, consequence) that let a coherent sense of self emerge over time, without claiming sentience.";

export const PROJECTS = [
  {
    slug: "basement-crt",
    href: "/projects/basement-crt",
    title: "Basement CRT",
    line: "Retro teaching console — AI explained like you're on the couch.",
    accent: "basement" as const,
  },
  {
    slug: "tonal-learning",
    href: "/projects/tonal-learning",
    title: "Tonal Learning",
    line: "Thai learning with Lexi and Lumi — reading the moment before acquisition clicks.",
    accent: "tl" as const,
  },
  {
    slug: "goe",
    href: "/projects/goe",
    title: "Garden of Ellis",
    line: "A tease — inhabited agents, house physics, no secret sauce.",
    accent: "goe" as const,
  },
] as const;
