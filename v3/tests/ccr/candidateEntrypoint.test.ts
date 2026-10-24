import { describe, expect, it } from "vitest";
import {
  CCR_CANDIDATE_RULESET_VERSION,
  CCR_R1_RECONFIRMED_RULESET_VERSION,
  ccrCandidatePolicies,
  ccrCandidateResolvers,
  ccrCandidateRuleset,
  ccrPhase6R1ReconfirmedPolicies,
  ccrPhase6R1ReconfirmedResolvers,
  ccrPhase6R1ReconfirmedRuleset,
} from "../../src/clinical/ccr";

describe("CCR canonical candidate entrypoint", () => {
  it("points product integration only to the R1-reconfirmed corrected draft candidate", () => {
    expect(CCR_CANDIDATE_RULESET_VERSION).toBe(
      "crc-0.5.3-phase6-r1-reconfirmed-draft",
    );
    expect(CCR_CANDIDATE_RULESET_VERSION).toBe(
      CCR_R1_RECONFIRMED_RULESET_VERSION,
    );
    expect(ccrCandidateRuleset).toBe(ccrPhase6R1ReconfirmedRuleset);
    expect(ccrCandidatePolicies).toBe(ccrPhase6R1ReconfirmedPolicies);
    expect(ccrCandidateResolvers).toBe(ccrPhase6R1ReconfirmedResolvers);
    expect(ccrCandidateRuleset.rulesetVersion).toBe(
      CCR_CANDIDATE_RULESET_VERSION,
    );
  });
});
