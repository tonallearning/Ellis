/** A deliberately small public expression vocabulary, never body telemetry. */
export const PUBLIC_EXPRESSIONS = [
  "none",
  "attentive",
  "softened",
  "reserved",
] as const;

export type PublicExpression = (typeof PUBLIC_EXPRESSIONS)[number];

export function isPublicExpression(value: unknown): value is PublicExpression {
  return PUBLIC_EXPRESSIONS.includes(value as PublicExpression);
}

export function parsePublicExpression(value: unknown): PublicExpression {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid public expression choice");
  }
  const choice = value as Record<string, unknown>;
  if (
    Object.keys(choice).length !== 1 ||
    !isPublicExpression(choice.expression)
  ) {
    throw new Error("Invalid public expression choice");
  }
  return choice.expression;
}
