import type { MotorModuleSnapshot } from "./contracts";
import type { MotorModuleId } from "./navigationHandoff";

export const MOTOR_EPHEMERAL_SESSION_LEDGER_VERSION = "motor-ephemeral-ledger-v1" as const;

export type MotorEphemeralSessionLedger = Readonly<{
  version: typeof MOTOR_EPHEMERAL_SESSION_LEDGER_VERSION;
  lifecycle: "tab_ephemeral";
  snapshots: Readonly<Partial<Record<MotorModuleId, MotorModuleSnapshot<MotorModuleId>>>>;
}>;

function sanitizeSnapshot(
  snapshot: MotorModuleSnapshot<MotorModuleId>,
): MotorModuleSnapshot<MotorModuleId> {
  if (snapshot.moduleId !== "ccr" && snapshot.moduleId !== "mama") {
    throw new TypeError("Unknown MOTOR module snapshot");
  }
  return Object.freeze({
    moduleId: snapshot.moduleId,
    moduleLabel: snapshot.moduleLabel,
    rulesetVersion: snapshot.rulesetVersion,
    releaseGate: snapshot.releaseGate,
    policyLabel: snapshot.policyLabel,
    boundaryCode: snapshot.boundaryCode,
    requiresAttention: snapshot.requiresAttention,
    requestedInputCount: snapshot.requestedInputCount,
    hasPendingInput: snapshot.hasPendingInput,
    surface: Object.freeze({
      title: snapshot.surface.title,
      detail: snapshot.surface.detail,
    }),
  });
}

function freezeLedger(
  snapshots: Partial<Record<MotorModuleId, MotorModuleSnapshot<MotorModuleId>>>,
): MotorEphemeralSessionLedger {
  return Object.freeze({
    version: MOTOR_EPHEMERAL_SESSION_LEDGER_VERSION,
    lifecycle: "tab_ephemeral" as const,
    snapshots: Object.freeze({ ...snapshots }),
  });
}

/**
 * Creates an empty, in-memory product ledger.
 *
 * A7 deliberately defines no browser carrier and no persistence mechanism.
 */
export function createMotorEphemeralSessionLedger(): MotorEphemeralSessionLedger {
  return freezeLedger({});
}

/**
 * Replaces only the snapshot belonging to the supplied module.
 *
 * No cross-module calculation is performed and no aggregate status is added.
 * Runtime extra properties are dropped by the shallow snapshot projection.
 */
export function upsertMotorEphemeralSessionSnapshot(
  ledger: MotorEphemeralSessionLedger,
  snapshot: MotorModuleSnapshot<MotorModuleId>,
): MotorEphemeralSessionLedger {
  const next: Partial<Record<MotorModuleId, MotorModuleSnapshot<MotorModuleId>>> = {};
  if (ledger.snapshots.ccr !== undefined) next.ccr = sanitizeSnapshot(ledger.snapshots.ccr);
  if (ledger.snapshots.mama !== undefined) next.mama = sanitizeSnapshot(ledger.snapshots.mama);
  next[snapshot.moduleId] = sanitizeSnapshot(snapshot);
  return freezeLedger(next);
}

export function readMotorEphemeralSessionSnapshot(
  ledger: MotorEphemeralSessionLedger,
  moduleId: MotorModuleId,
): MotorModuleSnapshot<MotorModuleId> | undefined {
  return ledger.snapshots[moduleId];
}

export function clearMotorEphemeralSessionLedger(): MotorEphemeralSessionLedger {
  return createMotorEphemeralSessionLedger();
}
