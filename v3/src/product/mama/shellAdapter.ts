import type {
  MotorModuleDescriptor,
  MotorModuleShellAdapter,
  MotorModuleSnapshot,
} from "../shell/contracts";
import type { MamaPresentationModel } from "./presentation";

export const MAMA_MOTOR_MODULE = {
  id: "mama",
  label: "Câncer de mama",
  description: "Avaliação guiada de rastreamento de câncer de mama.",
  lifecycle: "pilot_internal",
  capabilities: [
    "guided_interview",
    "policy_selection",
    "local_report_export",
  ],
} as const satisfies MotorModuleDescriptor<"mama">;

export function toMamaMotorModuleSnapshot(
  presentation: MamaPresentationModel,
): MotorModuleSnapshot<"mama"> {
  return {
    moduleId: MAMA_MOTOR_MODULE.id,
    moduleLabel: MAMA_MOTOR_MODULE.label,
    rulesetVersion: presentation.rulesetVersion,
    releaseGate: presentation.releaseGate,
    policyLabel: presentation.policy.label,
    boundaryCode: presentation.automationBoundary.code,
    requiresAttention: presentation.requiresAttention,
    requestedInputCount: presentation.requestedInputs.length,
    hasPendingInput: presentation.requestedInputs.length > 0,
    // Mama deliberately preserves its reviewed surface nuance, including
    // <40 "outside recommendation scope" when applicable.
    surface: presentation.surface,
  };
}

export const MAMA_MOTOR_SHELL_ADAPTER = {
  descriptor: MAMA_MOTOR_MODULE,
  toSnapshot: toMamaMotorModuleSnapshot,
} satisfies MotorModuleShellAdapter<"mama", MamaPresentationModel>;
