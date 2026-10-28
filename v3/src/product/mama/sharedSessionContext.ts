import { completedAge, parseCalendarDate } from "../../model/dates";
import type { MotorSharedSessionContext } from "../shell";

export type MamaSharedContextProjection = Readonly<{
  asOf:
    | Readonly<{ status: "available"; value: string; source: "shared.evaluationDate" }>
    | Readonly<{ status: "unavailable"; reason: string }>;
  ageYears:
    | Readonly<{
        status: "derived";
        value: number;
        sources: readonly ["shared.birthDate", "shared.evaluationDate"];
      }>
    | Readonly<{ status: "unavailable"; reason: string }>;
}>;

/**
 * One-way A3 projection from Shell-owned facts into Mama product inputs.
 *
 * This adapter does not evaluate Mama, select a policy, mutate a draft or write
 * back to shared context. Age is deliberately derived inside the Mama product
 * boundary rather than by the Shell.
 */
export function projectSharedSessionContextToMama(
  context: MotorSharedSessionContext,
): MamaSharedContextProjection {
  const asOf =
    context.evaluationDate.status === "known"
      ? ({
          status: "available",
          value: context.evaluationDate.value,
          source: "shared.evaluationDate",
        } as const)
      : ({
          status: "unavailable",
          reason: `evaluation_date_${context.evaluationDate.reason}`,
        } as const);

  if (context.birthDate.status !== "known") {
    return Object.freeze({
      asOf,
      ageYears: Object.freeze({
        status: "unavailable" as const,
        reason: `birth_date_${context.birthDate.reason}`,
      }),
    });
  }

  if (context.evaluationDate.status !== "known") {
    return Object.freeze({
      asOf,
      ageYears: Object.freeze({
        status: "unavailable" as const,
        reason: `evaluation_date_${context.evaluationDate.reason}`,
      }),
    });
  }

  try {
    const value = completedAge(
      parseCalendarDate(context.birthDate.value),
      parseCalendarDate(context.evaluationDate.value),
    );
    return Object.freeze({
      asOf,
      ageYears: Object.freeze({
        status: "derived" as const,
        value,
        sources: ["shared.birthDate", "shared.evaluationDate"] as const,
      }),
    });
  } catch {
    return Object.freeze({
      asOf,
      ageYears: Object.freeze({
        status: "unavailable" as const,
        reason: "invalid_shared_date_relation",
      }),
    });
  }
}
