import {
  defaultMotorBoundarySurface,
  type MotorModuleDescriptor,
  type MotorModuleShellAdapter,
  type MotorModuleSnapshot,
} from "../shell/contracts";
import type { CcrPresentationModel } from "./presentation";

export const CCR_MOTOR_MODULE = {
  id: "ccr",
  label: "Câncer colorretal",
  description: "Avaliação guiada de rastreamento de câncer colorretal.",
  lifecycle: "pilot_internal",
  capabilities: [
    "guided_interview",
    "policy_selection",
    "local_report_export",
  ],
} as const satisfies MotorModuleDescriptor<"ccr">;

export function toCcrMotorModuleSnapshot(
  presentation: CcrPresentationModel,
): MotorModuleSnapshot<"ccr"> {
  const boundaryCode = presentation.automationBoundary.code;
  return {
    moduleId: CCR_MOTOR_MODULE.id,
    moduleLabel: CCR_MOTOR_MODULE.label,
    rulesetVersion: presentation.rulesetVersion,
    releaseGate: presentation.releaseGate,
    policyLabel: presentation.policy.label,
    boundaryCode,
    requiresAttention: presentation.requiresAttention,
    requestedInputCount: presentation.requestedInputs.length,
    hasPendingInput: presentation.requestedInputs.length > 0,
    surface: defaultMotorBoundarySurface(boundaryCode),
  };
}

export const CCR_MOTOR_SHELL_ADAPTER = {
  descriptor: CCR_MOTOR_MODULE,
  toSnapshot: toCcrMotorModuleSnapshot,
} satisfies MotorModuleShellAdapter<"ccr", CcrPresentationModel>;
