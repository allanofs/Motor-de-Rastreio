import {
  MOTOR_AUTOMATION_BOUNDARY_CODES,
  type MotorAutomationBoundaryCode,
  type MotorModuleSnapshot,
  type MotorShellSurface,
} from "./contracts";
import type { MotorModuleId, MotorNavigationNamePort } from "./navigationHandoff";

export const MOTOR_MODULE_OUTCOME_RECEIPT_VERSION = "motor-module-outcome-v1" as const;
const MOTOR_MODULE_OUTCOME_RECEIPT_PREFIX = "__MOTOR_OUTCOME__:";

export type MotorModuleOutcomeReceipt = Readonly<{
  version: typeof MOTOR_MODULE_OUTCOME_RECEIPT_VERSION;
  target: "shell";
  snapshot: MotorModuleSnapshot<MotorModuleId>;
}>;

const MODULE_IDS = new Set<MotorModuleId>(["ccr", "mama"]);
const BOUNDARY_CODES = new Set<MotorAutomationBoundaryCode>(MOTOR_AUTOMATION_BOUNDARY_CODES);
const SNAPSHOT_KEYS = new Set([
  "moduleId",
  "moduleLabel",
  "rulesetVersion",
  "releaseGate",
  "policyLabel",
  "boundaryCode",
  "requiresAttention",
  "requestedInputCount",
  "hasPendingInput",
  "surface",
]);
const SURFACE_KEYS = new Set(["title", "detail"]);
const ENVELOPE_KEYS = new Set(["version", "target", "snapshot"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, allowed: ReadonlySet<string>): boolean {
  return Object.keys(value).every((key) => allowed.has(key));
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parseSurface(value: unknown): MotorShellSurface | undefined {
  if (!isRecord(value) || !hasOnlyKeys(value, SURFACE_KEYS)) return undefined;
  if (!isNonEmptyString(value.title) || !isNonEmptyString(value.detail)) return undefined;
  return Object.freeze({ title: value.title, detail: value.detail });
}

function parseSnapshot(value: unknown): MotorModuleSnapshot<MotorModuleId> | undefined {
  if (!isRecord(value) || !hasOnlyKeys(value, SNAPSHOT_KEYS)) return undefined;
  if (typeof value.moduleId !== "string" || !MODULE_IDS.has(value.moduleId as MotorModuleId)) return undefined;
  if (!isNonEmptyString(value.moduleLabel)) return undefined;
  if (!isNonEmptyString(value.rulesetVersion)) return undefined;
  if (!isNonEmptyString(value.releaseGate)) return undefined;
  if (!isNonEmptyString(value.policyLabel)) return undefined;
  if (typeof value.boundaryCode !== "string" || !BOUNDARY_CODES.has(value.boundaryCode as MotorAutomationBoundaryCode)) return undefined;
  if (typeof value.requiresAttention !== "boolean") return undefined;
  if (!Number.isInteger(value.requestedInputCount) || (value.requestedInputCount as number) < 0) return undefined;
  if (typeof value.hasPendingInput !== "boolean") return undefined;
  if (value.hasPendingInput !== ((value.requestedInputCount as number) > 0)) return undefined;
  const surface = parseSurface(value.surface);
  if (surface === undefined) return undefined;

  return Object.freeze({
    moduleId: value.moduleId as MotorModuleId,
    moduleLabel: value.moduleLabel,
    rulesetVersion: value.rulesetVersion,
    releaseGate: value.releaseGate,
    policyLabel: value.policyLabel,
    boundaryCode: value.boundaryCode as MotorAutomationBoundaryCode,
    requiresAttention: value.requiresAttention,
    requestedInputCount: value.requestedInputCount as number,
    hasPendingInput: value.hasPendingInput,
    surface,
  });
}

/**
 * Encodes only the already-reviewed shallow Shell snapshot shape.
 * Runtime extra properties on a caller object are deliberately not serialized.
 */
export function encodeMotorModuleOutcomeReceipt(
  snapshot: MotorModuleSnapshot<MotorModuleId>,
): string {
  const sanitizedSnapshot: MotorModuleSnapshot<MotorModuleId> = Object.freeze({
    moduleId: snapshot.moduleId,
    moduleLabel: snapshot.moduleLabel,
    rulesetVersion: snapshot.rulesetVersion,
    releaseGate: snapshot.releaseGate,
    policyLabel: snapshot.policyLabel,
    boundaryCode: snapshot.boundaryCode,
    requiresAttention: snapshot.requiresAttention,
    requestedInputCount: snapshot.requestedInputCount,
    hasPendingInput: snapshot.hasPendingInput,
    surface: Object.freeze({ title: snapshot.surface.title, detail: snapshot.surface.detail }),
  });
  const receipt: MotorModuleOutcomeReceipt = Object.freeze({
    version: MOTOR_MODULE_OUTCOME_RECEIPT_VERSION,
    target: "shell",
    snapshot: sanitizedSnapshot,
  });
  return `${MOTOR_MODULE_OUTCOME_RECEIPT_PREFIX}${JSON.stringify(receipt)}`;
}

/**
 * Pure single-use module -> Shell receipt contract.
 *
 * It transports no raw clinical facts and performs no clinical aggregation.
 * Browser wiring belongs to a later integration phase.
 */
export function consumeMotorModuleOutcomeReceipt(
  port: MotorNavigationNamePort,
): MotorModuleSnapshot<MotorModuleId> | undefined {
  const raw = port.name;
  if (!raw.startsWith(MOTOR_MODULE_OUTCOME_RECEIPT_PREFIX)) return undefined;
  port.name = "";

  try {
    const parsed = JSON.parse(raw.slice(MOTOR_MODULE_OUTCOME_RECEIPT_PREFIX.length)) as unknown;
    if (!isRecord(parsed) || !hasOnlyKeys(parsed, ENVELOPE_KEYS)) return undefined;
    if (parsed.version !== MOTOR_MODULE_OUTCOME_RECEIPT_VERSION || parsed.target !== "shell") return undefined;
    return parseSnapshot(parsed.snapshot);
  } catch {
    return undefined;
  }
}
