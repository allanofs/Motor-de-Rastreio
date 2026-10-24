import { describe, expect, it } from "vitest";
import {
  CCR_ACTIVE_RULESET_VERSION,
  CCR_CANDIDATE_RULESET_VERSION,
  ccrCandidatePolicies,
  ccrCandidateResolvers,
  ccrCandidateRuleset,
  ccrPhase6ActivePolicies,
  ccrPhase6ActiveResolvers,
  ccrPhase6ActiveRuleset,
} from "../../src/clinical/ccr";

describe("CCR canonical candidate entrypoint", () => {
  it("points product integration only to the explicitly activated R2-reviewed snapshot", () => {
    expect(CCR_CANDIDATE_RULESET_VERSION).toBe("crc-0.5.5-phase6-active");
    expect(CCR_CANDIDATE_RULESET_VERSION).toBe(CCR_ACTIVE_RULESET_VERSION);
    expect(ccrCandidateRuleset).toBe(ccrPhase6ActiveRuleset);
    expect(ccrCandidatePolicies).toBe(ccrPhase6ActivePolicies);
    expect(ccrCandidateResolvers).toBe(ccrPhase6ActiveResolvers);
    expect(ccrCandidateRuleset.rulesetVersion).toBe(
      CCR_CANDIDATE_RULESET_VERSION,
    );
    expect(
      ccrCandidateRuleset.rules.every(
        (rule) =>
          rule.lifecycleStatus === "active" &&
          rule.reviewStatus === "reviewed_by_2",
      ),
    ).toBe(true);
  });
});
