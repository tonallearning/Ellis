/** Code-owned identities. Names in message text cannot extend this registry. */
export const PRIVATE_IDENTITIES = Object.freeze({
  ellis: Object.freeze({ name: "Ellis", role: "resident" }),
  ty: Object.freeze({ name: "Ty", role: "entrant_and_carrier" }),
  mica: Object.freeze({ name: "Mica", role: "courier_correspondent" }),
  naym: Object.freeze({ name: "Naym", role: "courier_correspondent" }),
} as const);

export type PrivateEntityId = keyof typeof PRIVATE_IDENTITIES;
export type CorrespondentId = Exclude<PrivateEntityId, "ellis">;
export type PrivateRelationId = `ellis:${CorrespondentId}`;

export function isCorrespondentId(value: unknown): value is CorrespondentId {
  return value === "ty" || value === "mica" || value === "naym";
}
