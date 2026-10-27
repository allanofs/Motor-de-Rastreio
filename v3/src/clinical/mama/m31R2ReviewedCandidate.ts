import type { SourceRef } from "../../model/content";
import { MAMA_M3_R1_REVIEWER, MAMA_M3_R1_REVIEWED_AT } from "./reviewedCandidate";
import {
  MAMA_M3_R2_REVIEWER_PUBLIC_ID,
  MAMA_M3_R2_REVIEWED_AT,
} from "./r2ReviewedCandidate";
import {
  MAMA_M3_1_SCOPE_VERSION,
  MAMA_UNDER40_SCOPE_BY_POLICY,
  type MamaPolicyFamily,
  type MamaUnder40ScopeConclusion,
} from "./under40Scope";
import {
  MAMA_DECISION_CONTEXT_VERSION,
} from "./decisionContext";
import {
  MAMA_SHARED_DECISION_REASON_BY_RULE_ID,
  type MamaSharedDecisionReason,
} from "./decisionSemantics";
import { MAMA_KNOWN_HIGH_RISK_FAMILIAL_CONTEXT_CONTRACT } from "./inputContracts";

export const MAMA_M3_1_R2_REVIEWER_PUBLIC_ID =
  MAMA_M3_R2_REVIEWER_PUBLIC_ID;
export const MAMA_M3_1_R2_REVIEWED_AT = MAMA_M3_R2_REVIEWED_AT;
export const MAMA_M3_1_R2_SNAPSHOT_VERSION =
  "breast-0.1.6-m3-1-r2-reviewed-draft" as const;

export type MamaM31ReviewedScopeResolution = Readonly<{
  policyFamily: MamaPolicyFamily;
  conclusion: MamaUnder40ScopeConclusion;
  rationale: string;
  sourceRefs: readonly SourceRef[];
  guardrails: readonly string[];
}>;

export type MamaM31ReviewRecord = Readonly<{
  reviewer: string;
  reviewedAt: typeof MAMA_M3_R1_REVIEWED_AT;
  role: "project_human_gate" | "independent_r2";
}>;

/**
 * Immutable governance snapshot for the focused M3.1 review.
 *
 * The same independent anonymous R2 reviewer who approved the M3 core reviewed
 * the final M3.1 implementation and approved it without mandatory clinical
 * correction. No identifying reviewer information is stored here.
 *
 * This snapshot changes governance only. It does not activate Mama and does
 * not alter the clinical semantics of M3.1.
 */
export const mamaM31R2ReviewedSnapshot = {
  snapshotVersion: MAMA_M3_1_R2_SNAPSHOT_VERSION,
  lifecycleStatus: "draft" as const,
  reviewStatus: "reviewed_by_2" as const,
  verdict: "APPROVE" as const,
  reviewedArtifacts: {
    under40ScopeVersion: MAMA_M3_1_SCOPE_VERSION,
    decisionContextVersion: MAMA_DECISION_CONTEXT_VERSION,
    under40ScopeByPolicy: Object.fromEntries(
      Object.entries(MAMA_UNDER40_SCOPE_BY_POLICY).map(([family, resolution]) => [
        family,
        {
          policyFamily: resolution.policyFamily,
          conclusion: resolution.conclusion,
          rationale: resolution.rationale,
          sourceRefs: resolution.sourceRefs,
          guardrails: resolution.guardrails,
        },
      ]),
    ) as Readonly<Record<MamaPolicyFamily, MamaM31ReviewedScopeResolution>>,
    sharedDecisionReasonByRuleId: {
      ...MAMA_SHARED_DECISION_REASON_BY_RULE_ID,
    } as Readonly<Record<string, MamaSharedDecisionReason>>,
    knownHighRiskFamilialContextContract: {
      ...MAMA_KNOWN_HIGH_RISK_FAMILIAL_CONTEXT_CONTRACT,
      mustNotInferFrom: [
        ...MAMA_KNOWN_HIGH_RISK_FAMILIAL_CONTEXT_CONTRACT.mustNotInferFrom,
      ],
      calculationsOutsideV1: [
        ...MAMA_KNOWN_HIGH_RISK_FAMILIAL_CONTEXT_CONTRACT.calculationsOutsideV1,
      ],
    },
  },
  governance: {
    reviews: [
      {
        reviewer: MAMA_M3_R1_REVIEWER,
        reviewedAt: MAMA_M3_R1_REVIEWED_AT,
        role: "project_human_gate" as const,
      },
      {
        reviewer: MAMA_M3_1_R2_REVIEWER_PUBLIC_ID,
        reviewedAt: MAMA_M3_1_R2_REVIEWED_AT,
        role: "independent_r2" as const,
      },
    ] satisfies MamaM31ReviewRecord[],
  },
  guardrails: [
    "Focused R2 approval does not authorize lifecycle activation, merge, deploy, public release or clinical use.",
    "Hard exits must continue to dominate under-40 routine closure.",
    "Unknown or incomplete safety assessment must continue to suppress under-40 routine closure.",
    "No raw BI-RADS interpretation, high-risk imaging protocol, biopsy, genetics management or treatment tree is authorized by this snapshot.",
  ],
} as const;
