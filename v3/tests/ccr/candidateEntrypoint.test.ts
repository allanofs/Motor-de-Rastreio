import { describe, expect, it } from "vitest";
import {
  CCR_CANDIDATE_RULESET_VERSION,
  CCR_R2_REVIEWED_RULESET_VERSION,
  ccrCandidatePolicies,
  ccrCandidateResolvers,
  ccrCandidateRuleset,
  ccrPhase6R2ReviewedPolicies,
  ccrPhase6R2ReviewedResolvers,
  ccrPhase6R2ReviewedRuleset,
} from "../../src/clinical/ccr";

describe("CCR canonical candidate entrypoint", () => {
  it("points product integration only to the R2-reviewed corrected draft candidate", () => {
    expect(CCR_CANDIDATE_RULESET_VERSION).toBe(
      "crc-0.5.4-phase6-r2-reviewed-draft",
    );
    expect(CCR_CANDIDATE_RULESET_VERSION).toBe(
      CCR_R2_REVIEWED_RULESET_VERSION,
    );
    expect(ccrCandidateRuleset).toBe(ccrPhase6R2ReviewedRuleset);
    expect(ccrCandidatePolicies).toBe(ccrPhase6R2ReviewedPolicies);
    expect(ccrCandidateResolvers).toBe(ccrPhase6R2ReviewedResolvers);
    expect(ccrCandidateRuleset.rulesetVersion).toBe(
      CCR_CANDIDATE_RULESET_VERSION,
    );
  });
});
