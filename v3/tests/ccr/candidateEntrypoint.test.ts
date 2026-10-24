import { describe, expect, it } from "vitest";
import {
  CCR_CANDIDATE_RULESET_VERSION,
  ccrCandidatePolicies,
  ccrCandidateResolvers,
  ccrCandidateRuleset,
  ccrPhase64Resolvers,
  ccrPhase65Policies,
  ccrPhase65Ruleset,
} from "../../src/clinical/ccr";

describe("CCR canonical candidate entrypoint", () => {
  it("points product integration to the audited Phase 6.5 ruleset only", () => {
    expect(CCR_CANDIDATE_RULESET_VERSION).toBe("crc-0.5.0-phase6.5-draft");
    expect(ccrCandidateRuleset).toBe(ccrPhase65Ruleset);
    expect(ccrCandidatePolicies).toBe(ccrPhase65Policies);
    expect(ccrCandidateResolvers).toBe(ccrPhase64Resolvers);
    expect(ccrCandidateRuleset.rulesetVersion).toBe(CCR_CANDIDATE_RULESET_VERSION);
  });
});
