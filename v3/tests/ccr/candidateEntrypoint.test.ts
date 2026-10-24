import { describe, expect, it } from "vitest";
import {
  CCR_CANDIDATE_RULESET_VERSION,
  CCR_R1_RULESET_VERSION,
  ccrCandidatePolicies,
  ccrCandidateResolvers,
  ccrCandidateRuleset,
  ccrPhase6R1Policies,
  ccrPhase6R1Resolvers,
  ccrPhase6R1Ruleset,
} from "../../src/clinical/ccr";

describe("CCR canonical candidate entrypoint", () => {
  it("points product integration only to the R1-reviewed Phase 6 candidate", () => {
    expect(CCR_CANDIDATE_RULESET_VERSION).toBe("crc-0.5.1-phase6-r1-draft");
    expect(CCR_CANDIDATE_RULESET_VERSION).toBe(CCR_R1_RULESET_VERSION);
    expect(ccrCandidateRuleset).toBe(ccrPhase6R1Ruleset);
    expect(ccrCandidatePolicies).toBe(ccrPhase6R1Policies);
    expect(ccrCandidateResolvers).toBe(ccrPhase6R1Resolvers);
    expect(ccrCandidateRuleset.rulesetVersion).toBe(CCR_CANDIDATE_RULESET_VERSION);
  });
});
