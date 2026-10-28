import {
  createMotorSharedSessionContext,
  motorIsoDate,
  type MotorSharedBirthDate,
  type MotorSharedEvaluationDate,
  type MotorSharedSessionContext,
  type MotorSharedUnknownReason,
} from "./sessionContext";

export const MOTOR_NAVIGATION_HANDOFF_VERSION = "motor-navigation-handoff-v1" as const;
const MOTOR_NAVIGATION_HANDOFF_PREFIX = "__MOTOR_HANDOFF__:";

export type MotorModuleId = "ccr" | "mama";

export type MotorNavigationHandoff = Readonly<{
  version: typeof MOTOR_NAVIGATION_HANDOFF_VERSION;
  target: MotorModuleId;
  context: MotorSharedSessionContext;
}>;

export type MotorNavigationNamePort = { name: string };

const UNKNOWN_REASONS = new Set<MotorSharedUnknownReason>([
  "not_asked",
  "declined",
  "not_available",
]);

function parseEvaluationDate(value: unknown): MotorSharedEvaluationDate | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const fact = value as Record<string, unknown>;
  if (fact.status === "unknown") {
    if (typeof fact.reason !== "string" || !UNKNOWN_REASONS.has(fact.reason as MotorSharedUnknownReason)) return undefined;
    return Object.freeze({ status: "unknown", reason: fact.reason as MotorSharedUnknownReason });
  }
  if (fact.status !== "known" || typeof fact.value !== "string") return undefined;
  if (fact.source !== "user_supplied" && fact.source !== "system_clock") return undefined;
  try {
    return Object.freeze({ status: "known", value: motorIsoDate(fact.value), source: fact.source });
  } catch {
    return undefined;
  }
}

function parseBirthDate(value: unknown): MotorSharedBirthDate | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const fact = value as Record<string, unknown>;
  if (fact.status === "unknown") {
    if (typeof fact.reason !== "string" || !UNKNOWN_REASONS.has(fact.reason as MotorSharedUnknownReason)) return undefined;
    return Object.freeze({ status: "unknown", reason: fact.reason as MotorSharedUnknownReason });
  }
  if (fact.status !== "known" || typeof fact.value !== "string" || fact.source !== "user_supplied") return undefined;
  try {
    return Object.freeze({ status: "known", value: motorIsoDate(fact.value), source: "user_supplied" });
  } catch {
    return undefined;
  }
}

export function encodeMotorNavigationHandoff(
  target: MotorModuleId,
  context: MotorSharedSessionContext,
): string {
  const envelope: MotorNavigationHandoff = Object.freeze({
    version: MOTOR_NAVIGATION_HANDOFF_VERSION,
    target,
    context,
  });
  return `${MOTOR_NAVIGATION_HANDOFF_PREFIX}${JSON.stringify(envelope)}`;
}

/**
 * Single-use, same-tab handoff. The value is carried in window.name only for
 * the navigation boundary and is cleared before any domain projection occurs.
 * It is never written to URL, localStorage, sessionStorage, cookies or network.
 */
export function consumeMotorNavigationHandoff(
  port: MotorNavigationNamePort,
  expectedTarget: MotorModuleId,
): MotorSharedSessionContext | undefined {
  const raw = port.name;
  if (!raw.startsWith(MOTOR_NAVIGATION_HANDOFF_PREFIX)) return undefined;

  // Clear first: malformed or mismatched MOTOR envelopes must not linger.
  port.name = "";

  try {
    const parsed = JSON.parse(raw.slice(MOTOR_NAVIGATION_HANDOFF_PREFIX.length)) as Record<string, unknown>;
    if (parsed.version !== MOTOR_NAVIGATION_HANDOFF_VERSION || parsed.target !== expectedTarget) return undefined;
    if (typeof parsed.context !== "object" || parsed.context === null) return undefined;
    const context = parsed.context as Record<string, unknown>;
    const evaluationDate = parseEvaluationDate(context.evaluationDate);
    const birthDate = parseBirthDate(context.birthDate);
    if (context.version !== "motor-shared-session-v1" || context.lifecycle !== "ephemeral" || evaluationDate === undefined || birthDate === undefined) return undefined;
    return createMotorSharedSessionContext({ evaluationDate, birthDate });
  } catch {
    return undefined;
  }
}
