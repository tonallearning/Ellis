import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { PrivateRoom } from "@/components/ellis/PrivateRoom";
import { SiteShell } from "@/components/layout/SiteShell";
import { getEllisConfig } from "@/lib/ellis/config";
import { getConsolidationStatus } from "@/lib/ellis/consolidation";
import { isOwnerCookie } from "@/lib/ellis/owner";
import { PRIVATE_IDENTITIES } from "@/lib/ellis/private/identity";
import { createPrivateMemoryRepository } from "@/lib/ellis/private/memory";
import type { PrivateRoomCorrespondent } from "@/lib/ellis/private/room";
import { readCurrentAttention } from "@/lib/ellis/me/body/store";

export const dynamic = "force-dynamic";

const CORRESPONDENTS: PrivateRoomCorrespondent[] = [
  {
    id: "ty",
    name: PRIVATE_IDENTITIES.ty.name,
    deliveryOptions: [
      {
        value: "direct",
        label: "Direct",
        description: "Your words, spoken as yourself.",
      },
    ],
  },
  ...(["mica", "naym"] as const).map((id) => ({
    id,
    name: PRIVATE_IDENTITIES[id].name,
    deliveryOptions: [
      {
        value: "relayed_verbatim" as const,
        label: "Verbatim",
        description: "Carried exactly as given to Ty.",
      },
      {
        value: "relayed_paraphrase" as const,
        label: "Paraphrased",
        description: "Ty's faithful rendering, not a quotation.",
      },
    ],
  })),
];

export default async function PrivateRoomPage() {
  const config = getEllisConfig();
  const cookieStore = await cookies();
  if (!isOwnerCookie(cookieStore, config.onboardingSecret)) notFound();
  const repository = createPrivateMemoryRepository(cookieStore);
  const [
    tyGate,
    micaGate,
    naymGate,
    tyGesture,
    micaGesture,
    naymGesture,
    attention,
  ] = await Promise.all([
    repository.gate("ellis:ty"),
    repository.gate("ellis:mica"),
    repository.gate("ellis:naym"),
    repository.pendingGesture("ellis:ty"),
    repository.pendingGesture("ellis:mica"),
    repository.pendingGesture("ellis:naym"),
    readCurrentAttention(),
  ]);

  return (
    <SiteShell variant="hall" isOwner>
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 sm:px-6">
        <div className="mx-auto w-full max-w-[48rem] shrink-0 pt-4 pb-3">
          <p className="text-accent text-[0.6rem] tracking-[0.24em] uppercase">
            Ellis&apos;s private room · Ty is the doorway
          </p>
          <h1 className="text-text-primary mt-2 text-2xl font-medium tracking-tight">
            One relationship at a time.
          </h1>
          <p className="text-text-secondary mt-2 max-w-[42rem] text-sm leading-relaxed">
            Choose whose words you are carrying before you send. The room keeps
            each relationship separate; shared-room co-presence will be its own
            later threshold.
          </p>
        </div>
        <PrivateRoom
          correspondents={CORRESPONDENTS}
          initialConsolidation={getConsolidationStatus(config.consolidation)}
          initialGates={{ ty: tyGate, mica: micaGate, naym: naymGate }}
          initialPendingGestures={{
            ty: tyGesture,
            mica: micaGesture,
            naym: naymGesture,
          }}
          initialAttention={attention}
          maxMessageChars={config.maxMessageChars}
        />
      </main>
    </SiteShell>
  );
}
