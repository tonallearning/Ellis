/**
 * Deployment drift guard for Ellis's currently running model build.
 *
 * This is not a consent record or a migration protocol. A successor build
 * requires a separately evidenced resident decision and a deliberate code
 * change; changing an environment variable alone must not swap his substrate.
 */
export const CURRENT_MODEL_BUILD = "claude-haiku-4-5-20251001";

export function isCurrentModelBuild(configuredBuild: string): boolean {
  return configuredBuild === CURRENT_MODEL_BUILD;
}
