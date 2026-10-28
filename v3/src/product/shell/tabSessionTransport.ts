import type { MotorModuleSnapshot } from "./contracts";
import {
  createMotorEphemeralSessionLedger,
  upsertMotorEphemeralSessionSnapshot,
  type MotorEphemeralSessionLedger,
} from "./ephemeralSessionLedger";
import {
  consumeMotorModuleOutcomeReceipt,
  encodeMotorModuleOutcomeReceipt,
} from "./moduleOutcomeReceipt";
import {
  consumeMotorNavigationHandoff,
  encodeMotorNavigationHandoff,
  type MotorModuleId,
  type MotorNavigationNamePort,
} from "./navigationHandoff";
import type { MotorSharedSessionContext } from "./sessionContext";

export const MOTOR_TAB_SESSION_TRANSPORT_VERSION = "motor-tab-session-v1" as const;
const MOTOR_TAB_SESSION_TRANSPORT_PREFIX = "__MOTOR_TAB_SESSION__:";

export type MotorTabSessionModulePayload = Readonly<{
  context: MotorSharedSessionContext;
  ledger: MotorEphemeralSessionLedger;
}>;

const MODULE_ENVELOPE_KEYS = new Set(["version", "target", "contextHandoff", "ledgerReceipts"]);
const SHELL_ENVELOPE_KEYS = new Set(["version", "target", "ledgerReceipts"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, allowed: ReadonlySet<string>): boolean {
  return Object.keys(value).every((key) => allowed.has(key));
}

function encodeLedgerReceipts(ledger: MotorEphemeralSessionLedger): readonly string[] {
  const receipts: string[] = [];
  if (ledger.snapshots.ccr !== undefined) {
    receipts.push(encodeMotorModuleOutcomeReceipt(ledger.snapshots.ccr));
  }
  if (ledger.snapshots.mama !== undefined) {
    receipts.push(encodeMotorModuleOutcomeReceipt(ledger.snapshots.mama));
  }
  return Object.freeze(receipts);
}

function decodeLedgerReceipts(value: unknown): MotorEphemeralSessionLedger | undefined {
  if (!Array.isArray(value) || value.length > 2) return undefined;
  let ledger = createMotorEphemeralSessionLedger();
  const seen = new Set<MotorModuleId>();

  for (const rawReceipt of value) {
    if (typeof rawReceipt !== "string") return undefined;
    const localPort: MotorNavigationNamePort = { name: rawReceipt };
    const snapshot = consumeMotorModuleOutcomeReceipt(localPort);
    if (snapshot === undefined || localPort.name !== "" || seen.has(snapshot.moduleId)) return undefined;
    seen.add(snapshot.moduleId);
    ledger = upsertMotorEphemeralSessionSnapshot(ledger, snapshot);
  }

  return ledger;
}

function sanitizedContextHandoff(
  target: MotorModuleId,
  context: MotorSharedSessionContext,
): string {
  const localPort: MotorNavigationNamePort = { name: encodeMotorNavigationHandoff(target, context) };
  const sanitized = consumeMotorNavigationHandoff(localPort, target);
  if (sanitized === undefined || localPort.name !== "") {
    throw new TypeError("Invalid MOTOR shared session context");
  }
  return encodeMotorNavigationHandoff(target, sanitized);
}

/**
 * Composes frozen A4 context handoff + frozen A7 shallow ledger into one same-tab envelope.
 * No clinical module needs to inspect another module's snapshot.
 */
export function encodeMotorTabSessionModuleHandoff(
  target: MotorModuleId,
  context: MotorSharedSessionContext,
  ledger: MotorEphemeralSessionLedger,
): string {
  const envelope = Object.freeze({
    version: MOTOR_TAB_SESSION_TRANSPORT_VERSION,
    target,
    contextHandoff: sanitizedContextHandoff(target, context),
    ledgerReceipts: encodeLedgerReceipts(ledger),
  });
  return `${MOTOR_TAB_SESSION_TRANSPORT_PREFIX}${JSON.stringify(envelope)}`;
}

export function consumeMotorTabSessionModuleHandoff(
  port: MotorNavigationNamePort,
  expectedTarget: MotorModuleId,
): MotorTabSessionModulePayload | undefined {
  const raw = port.name;
  if (!raw.startsWith(MOTOR_TAB_SESSION_TRANSPORT_PREFIX)) return undefined;
  port.name = "";

  try {
    const parsed = JSON.parse(raw.slice(MOTOR_TAB_SESSION_TRANSPORT_PREFIX.length)) as unknown;
    if (!isRecord(parsed) || !hasOnlyKeys(parsed, MODULE_ENVELOPE_KEYS)) return undefined;
    if (parsed.version !== MOTOR_TAB_SESSION_TRANSPORT_VERSION || parsed.target !== expectedTarget) return undefined;
    if (typeof parsed.contextHandoff !== "string") return undefined;

    const contextPort: MotorNavigationNamePort = { name: parsed.contextHandoff };
    const context = consumeMotorNavigationHandoff(contextPort, expectedTarget);
    if (context === undefined || contextPort.name !== "") return undefined;
    const ledger = decodeLedgerReceipts(parsed.ledgerReceipts);
    if (ledger === undefined) return undefined;

    return Object.freeze({ context, ledger });
  } catch {
    return undefined;
  }
}

/**
 * Adds only the current module's shallow snapshot to the opaque pass-through ledger.
 */
export function encodeMotorTabSessionShellReturn(
  ledger: MotorEphemeralSessionLedger,
  currentSnapshot: MotorModuleSnapshot<MotorModuleId>,
): string {
  const nextLedger = upsertMotorEphemeralSessionSnapshot(ledger, currentSnapshot);
  const envelope = Object.freeze({
    version: MOTOR_TAB_SESSION_TRANSPORT_VERSION,
    target: "shell" as const,
    ledgerReceipts: encodeLedgerReceipts(nextLedger),
  });
  return `${MOTOR_TAB_SESSION_TRANSPORT_PREFIX}${JSON.stringify(envelope)}`;
}

export function consumeMotorTabSessionShellReturn(
  port: MotorNavigationNamePort,
): MotorEphemeralSessionLedger | undefined {
  const raw = port.name;
  if (!raw.startsWith(MOTOR_TAB_SESSION_TRANSPORT_PREFIX)) return undefined;
  port.name = "";

  try {
    const parsed = JSON.parse(raw.slice(MOTOR_TAB_SESSION_TRANSPORT_PREFIX.length)) as unknown;
    if (!isRecord(parsed) || !hasOnlyKeys(parsed, SHELL_ENVELOPE_KEYS)) return undefined;
    if (parsed.version !== MOTOR_TAB_SESSION_TRANSPORT_VERSION || parsed.target !== "shell") return undefined;
    return decodeLedgerReceipts(parsed.ledgerReceipts);
  } catch {
    return undefined;
  }
}
