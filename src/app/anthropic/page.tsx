import { cookies } from "next/headers";
import { AnthropicHall } from "@/components/anthropic/AnthropicHall";
import { SiteShell } from "@/components/layout/SiteShell";
import { loadAllBuildLogs } from "@/lib/buildLogs/loadBuildLog";
import { getEllisConfig, isOnboardingChatAllowed } from "@/lib/ellis/config";

export const metadata = {
  title: "Anthropic · tybuilds",
  description:
    "Ty Bennett — think, build, log. Ellis hosts; build logs included.",
};

export default async function AnthropicPage() {
  const config = getEllisConfig();
  const cookieStore = await cookies();
  const chatEnabled = isOnboardingChatAllowed(config, cookieStore);

  const logs = await loadAllBuildLogs();
  const openingMessage = ""; // TODO: load from content/halls/anthropic.md if needed

  return (
    <SiteShell variant="hall" hall="anthropic">
      <AnthropicHall
        chatEnabled={chatEnabled}
        mode={config.mode}
        maxMessageChars={config.maxMessageChars}
        openingMessage={chatEnabled ? openingMessage : ""}
        logs={logs}
      />
    </SiteShell>
  );
}
