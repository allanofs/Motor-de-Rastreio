import type { SourceRef } from "../../model/content";
import {
  MAMA_M3_1_PROPOSITION_IDS,
  mamaM31Proposition,
} from "./m3_1Evidence";

export const MAMA_M3_1_SCOPE_VERSION =
  "breast-0.1.3-m3-1-under40-source-verified-draft" as const;

export type MamaPolicyFamily =
  | "sus_oficial"
  | "br_ampliado"
  | "internacional";

export type MamaUnder40ScopeConclusion =
  | "routine_not_recommended"
  | "outside_recommendation_scope";

export type MamaUnder40ScopeResolution = Readonly<{
  version: typeof MAMA_M3_1_SCOPE_VERSION;
  lifecycleStatus: "draft";
  reviewStatus: "source_verified";
  policyFamily: MamaPolicyFamily;
  conclusion: MamaUnder40ScopeConclusion;
  rationale: string;
  sourceRefs: readonly SourceRef[];
  guardrails: readonly string[];
}>;

function resolution(args: {
  policyFamily: MamaPolicyFamily;
  conclusion: MamaUnder40ScopeConclusion;
  propositionId:
    (typeof MAMA_M3_1_PROPOSITION_IDS)[keyof typeof MAMA_M3_1_PROPOSITION_IDS];
  rationale: string;
}): MamaUnder40ScopeResolution {
  const proposition = mamaM31Proposition(args.propositionId);
  return {
    version: MAMA_M3_1_SCOPE_VERSION,
    lifecycleStatus: "draft",
    reviewStatus: "source_verified",
    policyFamily: args.policyFamily,
    conclusion: args.conclusion,
    rationale: args.rationale,
    sourceRefs: proposition.sourceRefs,
    guardrails: [
      "This resolution applies only to asymptomatic routine-screening context after safety/high-risk hard exits have been assessed.",
      "A person younger than 40 with suspicious symptoms, known high-risk genetic/familial context, high-risk chest radiation, prior breast cancer/high-risk lesion, unresolved prior finding or active specific care must not be closed by the routine age boundary.",
      "This scope artifact does not authorize diagnostic imaging, biopsy, genetics management or treatment.",
    ],
  };
}

export const MAMA_UNDER40_SCOPE_BY_POLICY: Readonly<
  Record<MamaPolicyFamily, MamaUnder40ScopeResolution>
> = {
  sus_oficial: resolution({
    policyFamily: "sus_oficial",
    conclusion: "routine_not_recommended",
    propositionId: MAMA_M3_1_PROPOSITION_IDS.susUnder40RoutineNotRecommended,
    rationale:
      "Current SUS/INCA guidance does not include average-risk asymptomatic people under 40 in routine mammographic screening and describes the benefit-harm balance outside recommended age bands as unfavorable.",
  }),
  br_ampliado: resolution({
    policyFamily: "br_ampliado",
    conclusion: "routine_not_recommended",
    propositionId:
      MAMA_M3_1_PROPOSITION_IDS.brazilUnder40RoutineNotRecommended,
    rationale:
      "CBR/SBM/FEBRASGO explicitly states that routine screening is not recommended below age 40 for usual-risk women, while preserving differentiated pathways for high-risk groups.",
  }),
  internacional: resolution({
    policyFamily: "internacional",
    conclusion: "outside_recommendation_scope",
    propositionId:
      MAMA_M3_1_PROPOSITION_IDS.uspstfUnder40OutsideRecommendationScope,
    rationale:
      "USPSTF 2024 defines its average-risk recommendation population as age 40 years or older; M3.1 therefore records under 40 as outside recommendation scope rather than inventing a recommendation against screening.",
  }),
};

/**
 * Source-backed routine-age scope resolution for M3.1.
 *
 * IMPORTANT: callers must apply the Mama safety/hard-exit gate first. This
 * function intentionally resolves only the age-scope question and never
 * overrides specific-attention pathways.
 */
export function resolveMamaUnder40RoutineScope(
  policyFamily: MamaPolicyFamily,
  ageYears: number,
): MamaUnder40ScopeResolution | null {
  if (!Number.isFinite(ageYears) || ageYears < 0)
    throw new Error("Invalid age for Mama routine scope resolution");
  if (ageYears >= 40) return null;
  return MAMA_UNDER40_SCOPE_BY_POLICY[policyFamily];
}
