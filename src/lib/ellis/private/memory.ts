import { createClient } from "@supabase/supabase-js";
import { isOwnerCookie } from "../owner";
import { isCorrespondentId, type PrivateRelationId } from "./identity";
import type { PrivateExchangeEnvelope } from "./courier";

type CookieStore = Parameters<typeof isOwnerCookie>[0];
export type PrivateMemoryRpc = {
  rpc(
    name: string,
    args: Record<string, unknown>,
  ): PromiseLike<{ data: unknown; error: unknown }>;
};
export type PrivateEpisode = {
  relation_id: PrivateRelationId;
  source_exchange_id: string;
  kind: "episode";
  summary: string;
  created_at: string;
};
export type PrivateSource = {
  id: string;
  relation_id: PrivateRelationId;
  client_message_id: string;
  inbound: PrivateExchangeEnvelope;
  outbound: PrivateExchangeEnvelope | null;
  model_build: string | null;
  corrects_id: string | null;
  created_at: string;
};

function assertRelation(
  relation: string,
): asserts relation is PrivateRelationId {
  if (!relation.startsWith("ellis:") || !isCorrespondentId(relation.slice(6))) {
    throw new Error("Invalid private relation");
  }
}

function assertSourceId(id: string) {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      id,
    )
  ) {
    throw new Error("Invalid private source");
  }
}

/** Server-owned repository. Never export this or its results through the public hall. */
export function createPrivateMemoryRepository(
  cookies: CookieStore,
  client?: PrivateMemoryRpc,
) {
  function authorize() {
    if (!isOwnerCookie(cookies, process.env.ELLIS_ONBOARDING_SECRET?.trim())) {
      throw new Error("Private access denied");
    }
  }
  // Check before even constructing a privileged client; recheck on each operation.
  authorize();
  const db: PrivateMemoryRpc =
    client ??
    createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

  async function call(
    relation: PrivateRelationId,
    action: string,
    payload: Record<string, unknown> = {},
  ) {
    authorize();
    assertRelation(relation);
    try {
      const { data, error } = await db.rpc("ellis_private_memory", {
        p_relation: relation,
        p_action: action,
        p_payload: payload,
      });
      if (error) throw new Error("Private storage failure");
      return data;
    } catch {
      // SQL errors can contain entire failing rows. Never log or forward them.
      throw new Error("Private memory operation failed");
    }
  }

  return {
    async read(relation: PrivateRelationId): Promise<PrivateEpisode[]> {
      const result = (await call(relation, "read")) as {
        episodes: PrivateEpisode[];
      };
      return result.episodes;
    },
    async source(
      relation: PrivateRelationId,
      id: string,
    ): Promise<PrivateSource | null> {
      assertSourceId(id);
      return (await call(relation, "source", { id })) as PrivateSource | null;
    },
    /** P4 calls only after the server's final model message confirms end_turn. */
    async commitCompleted(
      inbound: PrivateExchangeEnvelope,
      outbound: PrivateExchangeEnvelope,
      completion: { stopReason: string | null; modelBuild: string },
    ): Promise<string> {
      if (
        inbound.direction !== "inbound" ||
        outbound.direction !== "outbound" ||
        inbound.relationId !== outbound.relationId ||
        completion.stopReason !== "end_turn"
      ) {
        throw new Error("Incomplete or mismatched private exchange");
      }
      const result = (await call(inbound.relationId, "commit", {
        inbound,
        outbound,
        ...completion,
      })) as { id: string };
      return result.id;
    },
    async correct(
      correctsId: string,
      inbound: PrivateExchangeEnvelope,
    ): Promise<string> {
      assertSourceId(correctsId);
      if (inbound.direction !== "inbound")
        throw new Error("Invalid correction");
      const result = (await call(inbound.relationId, "correct", {
        correctsId,
        inbound,
      })) as { id: string };
      return result.id;
    },
    /** Deletes the full linked correction lineage, then rebuilds in one transaction. */
    async deleteSource(
      relation: PrivateRelationId,
      id: string,
    ): Promise<boolean> {
      assertSourceId(id);
      const result = (await call(relation, "delete", { id })) as {
        deleted: boolean;
      };
      return result.deleted;
    },
  };
}

export type PrivateMemoryRepository = ReturnType<
  typeof createPrivateMemoryRepository
>;
