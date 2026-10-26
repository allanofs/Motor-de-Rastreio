import { describe, expect, it } from "vitest";
import {
  CCR_CANDIDATE_RULESET_VERSION,
  CCR_H1_ACTIVE_RULESET_VERSION,
  ccrCandidatePolicies,
  ccrCandidateResolvers,
  ccrCandidateRuleset,
  ccrPhase6H1ActivePolicies,
  ccrPhase6H1ActiveResolvers,
  ccrPhase6H1ActiveRuleset,
} from "../../src/clinical/ccr";

describe("CCR canonical candidate entrypoint", () => {
  it("points product integration only to the explicitly activated H1 snapshot", () => {
    expect(CCR_CANDIDATE_RULESET_VERSION).toBe(
      "crc-0.5.9-phase6-h1-active",
    );
    expect(CCR_CANDIDATE_RULESET_VERSION).toBe(CCR_H1_ACTIVE_RULESET_VERSION);
    expect(ccrCandidateRuleset).toBe(ccrPhase6H1ActiveRuleset);
    expect(ccrCandidatePolicies).toBe(ccrPhase6H1ActivePolicies);
    expect(ccrCandidateResolvers).toBe(ccrPhase6H1ActiveResolvers);
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
