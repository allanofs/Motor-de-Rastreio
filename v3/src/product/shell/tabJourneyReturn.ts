import type { MotorModuleSnapshot } from "./contracts";
import type { MotorEphemeralSessionLedger } from "./ephemeralSessionLedger";
import {
  consumeMotorNavigationHandoff,
  encodeMotorNavigationHandoff,
  type MotorModuleId,
  type MotorNavigationNamePort,
} from "./navigationHandoff";
import type { MotorSharedSessionContext } from "./sessionContext";
import {
  consumeMotorTabSessionShellReturn,
  encodeMotorTabSessionShellReturn,
} from "./tabSessionTransport";

export const MOTOR_TAB_JOURNEY_RETURN_VERSION = "motor-tab-journey-return-v1" as const;
const MOTOR_TAB_JOURNEY_RETURN_PREFIX = "__MOTOR_TAB_JOURNEY_RETURN__:";
const ENVELOPE_KEYS = new Set([
  "version",
  "target",
  "sourceModule",
  "contextHandoff",
  "sessionReturn",
]);

export type MotorTabJourneyShellPayload = Readonly<{
  sourceModule: MotorModuleId;
  context: MotorSharedSessionContext;
  ledger: MotorEphemeralSessionLedger;
}>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, allowed: ReadonlySet<string>): boolean {
  return Object.keys(value).every((key) => allowed.has(key));
}

function isMotorModuleId(value: unknown): value is MotorModuleId {
  return value === "ccr" || value === "mama";
}

function sanitizedContextHandoff(
  sourceModule: MotorModuleId,
  context: MotorSharedSessionContext,
): string {
  const localPort: MotorNavigationNamePort = {
    name: encodeMotorNavigationHandoff(sourceModule, context),
  };
  const sanitized = consumeMotorNavigationHandoff(localPort, sourceModule);
  if (sanitized === undefined || localPort.name !== "") {
    throw new TypeError("Invalid MOTOR shared session context");
  }
  return encodeMotorNavigationHandoff(sourceModule, sanitized);
}

/**
 * Returns the same frozen shared factual context alongside the shallow A7 ledger.
 * The source module contributes only its own A0/A5 shallow snapshot.
 */
export function encodeMotorTabJourneyShellReturn(
  sourceModule: MotorModuleId,
  context: MotorSharedSessionContext,
  ledger: MotorEphemeralSessionLedger,
  currentSnapshot: MotorModuleSnapshot<MotorModuleId>,
): string {
  if (currentSnapshot.moduleId !== sourceModule) {
    throw new TypeError("MOTOR journey return source does not match snapshot module");
  }
  const envelope = Object.freeze({
    version: MOTOR_TAB_JOURNEY_RETURN_VERSION,
    target: "shell" as const,
    sourceModule,
    contextHandoff: sanitizedContextHandoff(sourceModule, context),
    sessionReturn: encodeMotorTabSessionShellReturn(ledger, currentSnapshot),
  });
  return `${MOTOR_TAB_JOURNEY_RETURN_PREFIX}${JSON.stringify(envelope)}`;
}

export function consumeMotorTabJourneyShellReturn(
  port: MotorNavigationNamePort,
): MotorTabJourneyShellPayload | undefined {
  const raw = port.name;
  if (!raw.startsWith(MOTOR_TAB_JOURNEY_RETURN_PREFIX)) return undefined;
  port.name = "";

  try {
    const parsed = JSON.parse(raw.slice(MOTOR_TAB_JOURNEY_RETURN_PREFIX.length)) as unknown;
    if (!isRecord(parsed) || !hasOnlyKeys(parsed, ENVELOPE_KEYS)) return undefined;
    if (parsed.version !== MOTOR_TAB_JOURNEY_RETURN_VERSION || parsed.target !== "shell") return undefined;
    if (!isMotorModuleId(parsed.sourceModule)) return undefined;
    if (typeof parsed.contextHandoff !== "string" || typeof parsed.sessionReturn !== "string") return undefined;

    const contextPort: MotorNavigationNamePort = { name: parsed.contextHandoff };
    const context = consumeMotorNavigationHandoff(contextPort, parsed.sourceModule);
    if (context === undefined || contextPort.name !== "") return undefined;

    const ledgerPort: MotorNavigationNamePort = { name: parsed.sessionReturn };
    const ledger = consumeMotorTabSessionShellReturn(ledgerPort);
    if (ledger === undefined || ledgerPort.name !== "") return undefined;
    if (ledger.snapshots[parsed.sourceModule] === undefined) return undefined;

    return Object.freeze({
      sourceModule: parsed.sourceModule,
      context,
      ledger,
    });
  } catch {
    return undefined;
  }
}
