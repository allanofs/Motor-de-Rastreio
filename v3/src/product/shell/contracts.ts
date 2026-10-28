export const MOTOR_AUTOMATION_BOUNDARY_CODES = [
  "CANNOT_CONCLUDE_SAFELY",
  "SPECIFIC_ATTENTION_REQUIRED",
  "SPECIFIC_CARE_ACTIVE",
  "MORE_INFORMATION_NEEDED",
  "SHARED_DECISION",
  "ROUTINE_DUE",
  "ROUTINE_CURRENT",
  "SCREENING_NOT_INDICATED",
] as const;

/**
 * Shared product vocabulary proven independently by CCR and Mama.
 *
 * This is NOT an engine/Foundation state machine. Each clinical module remains
 * responsible for deriving its own boundary with its own safety precedence.
 */
export type MotorAutomationBoundaryCode =
  (typeof MOTOR_AUTOMATION_BOUNDARY_CODES)[number];

export type MotorModuleCapability =
  | "guided_interview"
  | "policy_selection"
  | "local_report_export";

export type MotorModuleDescriptor<Id extends string = string> = {
  id: Id;
  label: string;
  description: string;
  lifecycle: "pilot_internal";
  capabilities: readonly MotorModuleCapability[];
};

export type MotorShellSurface = {
  title: string;
  detail: string;
};

/**
 * Deliberately shallow shell-facing projection.
 *
 * No track IDs, rule IDs, clinical facts, age cutoffs, intervals, modality
 * logic, decision-context internals or report provenance are exposed here.
 */
export type MotorModuleSnapshot<Id extends string = string> = {
  moduleId: Id;
  moduleLabel: string;
  rulesetVersion: string;
  releaseGate: string;
  policyLabel: string;
  boundaryCode: MotorAutomationBoundaryCode;
  requiresAttention: boolean;
  requestedInputCount: number;
  hasPendingInput: boolean;
  surface: MotorShellSurface;
};

export type MotorModuleShellAdapter<
  Id extends string,
  Presentation,
> = {
  descriptor: MotorModuleDescriptor<Id>;
  toSnapshot(presentation: Presentation): MotorModuleSnapshot<Id>;
};

/**
 * Generic copy for shared boundary codes only. A domain may override this
 * surface when a reviewed domain nuance must remain visible (for example,
 * Mama <40 outside the formal scope of a selected recommendation).
 */
export function defaultMotorBoundarySurface(
  code: MotorAutomationBoundaryCode,
): MotorShellSurface {
  switch (code) {
    case "CANNOT_CONCLUDE_SAFELY":
      return {
        title: "Não foi possível concluir com segurança",
        detail: "Revise as informações e os detalhes do módulo antes de continuar.",
      };
    case "SPECIFIC_ATTENTION_REQUIRED":
      return {
        title: "Atenção específica",
        detail: "Este caminho saiu da rotina e precisa de avaliação específica.",
      };
    case "SPECIFIC_CARE_ACTIVE":
      return {
        title: "Em acompanhamento específico",
        detail: "Já existe um caminho de cuidado específico ativo neste módulo.",
      };
    case "MORE_INFORMATION_NEEDED":
      return {
        title: "Próxima informação necessária",
        detail: "Falta informação necessária para concluir este módulo com segurança.",
      };
    case "SHARED_DECISION":
      return {
        title: "Decisão individual",
        detail: "A próxima etapa exige decisão humana; o Motor não decide autonomamente.",
      };
    case "ROUTINE_DUE":
      return {
        title: "Rastreamento indicado",
        detail: "Há uma ação de rastreamento indicada no referencial selecionado.",
      };
    case "ROUTINE_CURRENT":
      return {
        title: "Em dia",
        detail: "O rastreamento está em dia com base no histórico qualificável disponível.",
      };
    case "SCREENING_NOT_INDICATED":
      return {
        title: "Rastreamento não indicado",
        detail: "Não há ação de rastreamento de rotina indicada neste caminho no momento.",
      };
  }
}
