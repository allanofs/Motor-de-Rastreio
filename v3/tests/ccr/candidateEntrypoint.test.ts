import { describe, expect, it } from "vitest";
import {
  CCR_CANDIDATE_RULESET_VERSION,
  CCR_R2_PREP_RULESET_VERSION,
  ccrCandidatePolicies,
  ccrCandidateResolvers,
  ccrCandidateRuleset,
  ccrR2PreparedPolicies,
  ccrR2PreparedResolvers,
  ccrR2PreparedRuleset,
} from "../../src/clinical/ccr";

describe("CCR canonical candidate entrypoint", () => {
  it("points product integration only to the R2-prepared draft candidate", () => {
    expect(CCR_CANDIDATE_RULESET_VERSION).toBe(
      "crc-0.5.2-phase6-r2-prep-draft",
    );
    expect(CCR_CANDIDATE_RULESET_VERSION).toBe(CCR_R2_PREP_RULESET_VERSION);
    expect(ccrCandidateRuleset).toBe(ccrR2PreparedRuleset);
    expect(ccrCandidatePolicies).toBe(ccrR2PreparedPolicies);
    expect(ccrCandidateResolvers).toBe(ccrR2PreparedResolvers);
    expect(ccrCandidateRuleset.rulesetVersion).toBe(
      CCR_CANDIDATE_RULESET_VERSION,
    );
  });
});
