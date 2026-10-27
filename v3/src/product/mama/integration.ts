import {
  MAMA_CANDIDATE_RULESET_VERSION,
  mamaCandidatePolicies,
  mamaCandidateRuleset,
  buildMamaDecisionContext,
  type MamaDecisionContext,
  type MamaPolicyFamily,
} from "../../clinical/mama";
import { evaluatePatient, type EvaluationResult } from "../../engine/evaluatePatient";
import type { CareSettingContext } from "../../model/content";
import { completedAge, type CalendarDate } from "../../model/dates";
import type { TrackEvaluation } from "../../model/evaluation";
import { PatientSchema } from "../../model/patient";

export const MAMA_PRODUCT_RELEASE_GATE =
  "integration-only-not-authorized-for-real-world-use" as const;

export const MAMA_PRODUCT_SECTIONS = [
  { id: "resolve_first", label: "Resolver primeiro" },
  { id: "missing_information", label: "Falta informação" },
  { id: "do_now", label: "Fazer agora" },
  { id: "shared_decision", label: "Decisão individual" },
  { id: "specific_attention", label: "Atenção específica" },
  { id: "current_followup", label: "Em dia / acompanhar" },
] as const;

export type MamaProductSectionId =
  (typeof MAMA_PRODUCT_SECTIONS)[number]["id"];

export type MamaProductTrackCard = {
  topicId: string;
  sectionId: MamaProductSectionId;
  track: TrackEvaluation;
};

export type MamaProductSection = {
  id: MamaProductSectionId;
  label: string;
  cards: MamaProductTrackCard[];
};

export type MamaProductPolicyOption = {
  policyId: string;
  label: string;
  family: MamaPolicyFamily;
};

export type MamaProductRequest = {
  patient: unknown;
  policyId: string;
  asOf: CalendarDate;
  careSetting?: CareSettingContext;
};

export type MamaProductSuccess = {
  ok: true;
  rulesetVersion: string;
  releaseGate: typeof MAMA_PRODUCT_RELEASE_GATE;
  policy: MamaProductPolicyOption;
  requiresAttention: boolean;
  sections: MamaProductSection[];
  evaluation: EvaluationResult;
  decisionContext: MamaDecisionContext | null;
};

export type MamaProductFailure = {
  ok: false;
  rulesetVersion: string;
  releaseGate: typeof MAMA_PRODUCT_RELEASE_GATE;
  code: "unsupported_policy" | "invalid_control_envelope";
  message: string;
};

export type MamaProductResult = MamaProductSuccess | MamaProductFailure;

function sectionForTrack(track: TrackEvaluation): MamaProductSectionId {
  switch (track.state.status) {
    case "ComputationError":
    case "Conflict":
      return "resolve_first";
    case "Indeterminate":
    case "PendingResult":
      return "missing_information";
    case "SharedDecision":
      return "shared_decision";
    case "ClinicalReviewRequired":
    case "InFollowUp":
    case "HandedOff":
      return "specific_attention";
    case "Due":
      return "do_now";
    case "Current":
    case "NotApplicable":
      return "current_followup";
  }
}

function productPolicyLabel(family: MamaPolicyFamily): string {
  switch (family) {
    case "sus_oficial":
      return "SUS / Brasil oficial";
    case "br_ampliado":
      return "Brasil ampliado — núcleo mamográfico";
    case "internacional":
      return "Internacional — USPSTF";
  }
}

function parseMamaPolicyFamily(value: string): MamaPolicyFamily {
  if (
    value === "sus_oficial" ||
    value === "br_ampliado" ||
    value === "internacional"
  )
    return value;
  throw new Error(`Unsupported Mama policy family ${value}`);
}

export function getMamaProductPolicyOptions(): MamaProductPolicyOption[] {
  return mamaCandidatePolicies.map((policy) => {
    const family = parseMamaPolicyFamily(policy.family);
    return {
      policyId: policy.policyId,
      label: productPolicyLabel(family),
      family,
    };
  });
}

export function buildMamaProductSections(
  evaluation: EvaluationResult,
): MamaProductSection[] {
  const cards = evaluation.plan.topics.flatMap((topic) =>
    topic.tracks.map((track) => ({
      topicId: topic.topicId,
      sectionId: sectionForTrack(track),
      track,
    })),
  );

  return MAMA_PRODUCT_SECTIONS.map((section) => ({
    id: section.id,
    label: section.label,
    cards: cards.filter((card) => card.sectionId === section.id),
  }));
}

function patientAgeYears(patient: unknown, asOf: CalendarDate): number | null {
  const parsed = PatientSchema.safeParse(patient);
  if (!parsed.success) return null;
  if (parsed.data.context.ageYears !== undefined)
    return parsed.data.context.ageYears;
  const birth = parsed.data.context.birthDate;
  if (birth?.precision !== "day") return null;
  return completedAge(
    { year: birth.year, month: birth.month, day: birth.day },
    asOf,
  );
}

export function evaluateMamaProduct(
  request: MamaProductRequest,
): MamaProductResult {
  const policy = getMamaProductPolicyOptions().find(
    (candidate) => candidate.policyId === request.policyId,
  );

  if (policy === undefined) {
    return {
      ok: false,
      rulesetVersion: MAMA_CANDIDATE_RULESET_VERSION,
      releaseGate: MAMA_PRODUCT_RELEASE_GATE,
      code: "unsupported_policy",
      message: "Referencial clínico não reconhecido para o módulo Mama.",
    };
  }

  try {
    const evaluation = evaluatePatient({
      patient: request.patient,
      policyId: request.policyId,
      asOf: request.asOf,
      ruleset: mamaCandidateRuleset,
      ...(request.careSetting === undefined
        ? {}
        : { careSetting: request.careSetting }),
    });

    const ageYears = patientAgeYears(request.patient, request.asOf);
    const decisionContext =
      ageYears === null
        ? null
        : buildMamaDecisionContext({
            evaluation,
            policyFamily: policy.family,
            ageYears,
          });

    return {
      ok: true,
      rulesetVersion: MAMA_CANDIDATE_RULESET_VERSION,
      releaseGate: MAMA_PRODUCT_RELEASE_GATE,
      policy,
      requiresAttention: evaluation.plan.requiresAttention,
      sections: buildMamaProductSections(evaluation),
      evaluation,
      decisionContext,
    };
  } catch {
    return {
      ok: false,
      rulesetVersion: MAMA_CANDIDATE_RULESET_VERSION,
      releaseGate: MAMA_PRODUCT_RELEASE_GATE,
      code: "invalid_control_envelope",
      message:
        "Não foi possível iniciar a avaliação de Mama com segurança. Revise referencial, data de referência e estrutura de entrada.",
    };
  }
}
