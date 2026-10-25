import {
  CCR_CANDIDATE_RULESET_VERSION,
  ccrCandidatePolicies,
  ccrCandidateResolvers,
  ccrCandidateRuleset,
} from "../../clinical/ccr";
import { evaluatePatient, type EvaluationResult } from "../../engine/evaluatePatient";
import type { CareSettingContext } from "../../model/content";
import type { CalendarDate } from "../../model/dates";
import type { TrackEvaluation } from "../../model/evaluation";

export const CCR_PRODUCT_RELEASE_GATE =
  "integration-only-not-authorized-for-real-world-use" as const;

export const CCR_PRODUCT_SECTIONS = [
  { id: "resolve_first", label: "Resolver primeiro" },
  { id: "missing_information", label: "Falta informação" },
  { id: "do_now", label: "Fazer hoje" },
  { id: "shared_decision", label: "Decisão compartilhada" },
  { id: "clinical_review", label: "Revisão clínica necessária" },
  { id: "current_followup", label: "Em dia / acompanhar" },
] as const;

export type CcrProductSectionId =
  (typeof CCR_PRODUCT_SECTIONS)[number]["id"];

export type CcrProductTrackCard = {
  topicId: string;
  sectionId: CcrProductSectionId;
  track: TrackEvaluation;
};

export type CcrProductSection = {
  id: CcrProductSectionId;
  label: string;
  cards: CcrProductTrackCard[];
};

export type CcrProductPolicyOption = {
  policyId: string;
  label: string;
  family: string;
};

export type CcrProductRequest = {
  patient: unknown;
  policyId: string;
  asOf: CalendarDate;
  careSetting?: CareSettingContext;
};

export type CcrProductSuccess = {
  ok: true;
  rulesetVersion: string;
  releaseGate: typeof CCR_PRODUCT_RELEASE_GATE;
  policy: CcrProductPolicyOption;
  requiresAttention: boolean;
  sections: CcrProductSection[];
  evaluation: EvaluationResult;
};

export type CcrProductFailure = {
  ok: false;
  rulesetVersion: string;
  releaseGate: typeof CCR_PRODUCT_RELEASE_GATE;
  code: "unsupported_policy" | "invalid_control_envelope";
  message: string;
};

export type CcrProductResult = CcrProductSuccess | CcrProductFailure;

function sectionForTrack(track: TrackEvaluation): CcrProductSectionId {
  switch (track.state.status) {
    case "ComputationError":
    case "Conflict":
      return "resolve_first";
    case "Indeterminate":
      return "missing_information";
    case "SharedDecision":
      return "shared_decision";
    case "ClinicalReviewRequired":
      return "clinical_review";
    case "Due":
      return "do_now";
    case "InFollowUp":
      return track.actions.length > 0 ? "do_now" : "current_followup";
    case "Current":
    case "PendingResult":
    case "HandedOff":
    case "NotApplicable":
      return "current_followup";
  }
}

export function getCcrProductPolicyOptions(): CcrProductPolicyOption[] {
  return ccrCandidatePolicies.map((policy) => ({
    policyId: policy.policyId,
    label: policy.label,
    family: policy.family,
  }));
}

export function buildCcrProductSections(
  evaluation: EvaluationResult,
): CcrProductSection[] {
  const cards = evaluation.plan.topics.flatMap((topic) =>
    topic.tracks.map((track) => ({
      topicId: topic.topicId,
      sectionId: sectionForTrack(track),
      track,
    })),
  );

  return CCR_PRODUCT_SECTIONS.map((section) => ({
    id: section.id,
    label: section.label,
    cards: cards.filter((card) => card.sectionId === section.id),
  }));
}

export function evaluateCcrProduct(
  request: CcrProductRequest,
): CcrProductResult {
  const policy = getCcrProductPolicyOptions().find(
    (candidate) => candidate.policyId === request.policyId,
  );

  if (policy === undefined) {
    return {
      ok: false,
      rulesetVersion: CCR_CANDIDATE_RULESET_VERSION,
      releaseGate: CCR_PRODUCT_RELEASE_GATE,
      code: "unsupported_policy",
      message: "Referencial clínico não reconhecido para o módulo CCR.",
    };
  }

  try {
    const evaluation = evaluatePatient({
      patient: request.patient,
      policyId: request.policyId,
      asOf: request.asOf,
      ruleset: ccrCandidateRuleset,
      extensions: ccrCandidateResolvers,
      ...(request.careSetting === undefined
        ? {}
        : { careSetting: request.careSetting }),
    });

    return {
      ok: true,
      rulesetVersion: CCR_CANDIDATE_RULESET_VERSION,
      releaseGate: CCR_PRODUCT_RELEASE_GATE,
      policy,
      requiresAttention: evaluation.plan.requiresAttention,
      sections: buildCcrProductSections(evaluation),
      evaluation,
    };
  } catch {
    return {
      ok: false,
      rulesetVersion: CCR_CANDIDATE_RULESET_VERSION,
      releaseGate: CCR_PRODUCT_RELEASE_GATE,
      code: "invalid_control_envelope",
      message:
        "Não foi possível iniciar a avaliação com segurança. Revise policy, data de referência e estrutura de entrada.",
    };
  }
}
