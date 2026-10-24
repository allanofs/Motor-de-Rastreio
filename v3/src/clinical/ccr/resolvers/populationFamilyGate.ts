import type {
  DomainResolver,
  DomainResolution,
  DomainResolverInput,
} from "../../../engine/extensions";
import { CCR_IDS } from "../terminology";
import { classifyFamilyHistory } from "./familyHistory";
import { internationalStrategyChoiceResolver63 } from "./strategyCoverage63";

function noAction(
  state: DomainResolution["state"],
  missingData: string[] = [],
  guardrails: string[] = [],
): DomainResolution {
  return {
    state,
    actionIds: [],
    decisionSupportIds: [],
    evidenceRecordIds: [],
    missingData,
    guardrails,
  };
}

export const populationFamilyGateResolver64: DomainResolver = {
  ...internationalStrategyChoiceResolver63,
  resolverId: "crc-population-family-gate-phase6.4",
  version: "6.4",
  requiredConceptIds: [
    ...new Set([
      ...internationalStrategyChoiceResolver63.requiredConceptIds,
      CCR_IDS.concepts.familyHistoryRelevant,
    ]),
  ],
  resolve(input: DomainResolverInput) {
    const profile = classifyFamilyHistory(input.patient.facts);

    if (profile.kind === "high-risk")
      return noAction(
        {
          status: "NotApplicable",
          reason:
            "The dedicated ACG high-risk family pathway governs; do not offer an average-risk strategy choice.",
        },
        [],
        ["Family-history-specific colonoscopy q5 supersedes average-risk strategy selection operationally."],
      );

    if (profile.kind === "complex")
      return noAction(
        { status: "ClinicalReviewRequired", reason: profile.reason },
        [],
        ["Complex family history is not forced into the average-risk policy."],
      );

    if (profile.kind === "incomplete" || profile.kind === "unknown") {
      const base = internationalStrategyChoiceResolver63.resolve(input);
      return noAction(
        structuredClone(base.state) as DomainResolution["state"],
        [],
        [
          "The minimum age-based screening indication remains visible, but strategy selection is withheld until family history is clarified because it may change modality or interval.",
        ],
      );
    }

    return internationalStrategyChoiceResolver63.resolve(input);
  },
};
