export const MOTOR_SHARED_SESSION_CONTEXT_VERSION = "motor-shared-session-v1" as const;

export type MotorIsoDate = `${number}-${number}-${number}`;

export type MotorSharedUnknownReason =
  | "not_asked"
  | "declined"
  | "not_available";

export type MotorSharedFact<
  Value,
  Source extends string,
> =
  | Readonly<{
      status: "known";
      value: Value;
      source: Source;
    }>
  | Readonly<{
      status: "unknown";
      reason: MotorSharedUnknownReason;
    }>;

export type MotorSharedEvaluationDate = MotorSharedFact<
  MotorIsoDate,
  "user_supplied" | "system_clock"
>;

export type MotorSharedBirthDate = MotorSharedFact<
  MotorIsoDate,
  "user_supplied"
>;

/**
 * Ephemeral, non-clinical shared context owned by the product shell.
 *
 * A2 deliberately carries only globally meaningful facts. It does not carry
 * module answers, eligibility, age, risk, policy interpretation, rules,
 * screening status, automation boundaries or any cross-module inference.
 *
 * Domain modules may choose to consume a shared fact in a later phase, but
 * each domain remains responsible for its own derivation and safety logic.
 */
export type MotorSharedSessionContext = Readonly<{
  version: typeof MOTOR_SHARED_SESSION_CONTEXT_VERSION;
  lifecycle: "ephemeral";
  evaluationDate: MotorSharedEvaluationDate;
  birthDate: MotorSharedBirthDate;
}>;

export type MotorSharedSessionContextInput = Readonly<{
  evaluationDate: MotorSharedEvaluationDate;
  birthDate: MotorSharedBirthDate;
}>;

export function knownMotorSharedFact<
  Value,
  Source extends string,
>(value: Value, source: Source): MotorSharedFact<Value, Source> {
  return Object.freeze({ status: "known", value, source });
}

export function unknownMotorSharedFact(
  reason: MotorSharedUnknownReason,
): Readonly<{ status: "unknown"; reason: MotorSharedUnknownReason }> {
  return Object.freeze({ status: "unknown", reason });
}

export function motorIsoDate(value: string): MotorIsoDate {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (match === null) throw new Error("Expected ISO calendar date YYYY-MM-DD");

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error("Expected a valid calendar date");
  }

  return value as MotorIsoDate;
}

export function createMotorSharedSessionContext(
  input: MotorSharedSessionContextInput,
): MotorSharedSessionContext {
  return Object.freeze({
    version: MOTOR_SHARED_SESSION_CONTEXT_VERSION,
    lifecycle: "ephemeral" as const,
    evaluationDate: Object.freeze({ ...input.evaluationDate }),
    birthDate: Object.freeze({ ...input.birthDate }),
  });
}
