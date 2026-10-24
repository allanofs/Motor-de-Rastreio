import { describe, expect, it } from "vitest";
import {
  CCR_R2_REVIEWER_PUBLIC_ID,
  ccrPhase6R1ReconfirmedPolicies,
  ccrPhase6R1ReconfirmedResolvers,
  ccrPhase6R1ReconfirmedRuleset,
  ccrPhase6R2ReviewedPolicies,
  ccrPhase6R2ReviewedResolvers,
  ccrPhase6R2ReviewedRuleset,
} from "../../src/clinical/ccr";

function stripReviewGovernance(rule: (typeof ccrPhase6R2ReviewedRuleset.rules)[number]) {
  const { reviewStatus: _reviewStatus, governance, ...clinicalRule } = rule;
  const { reviews: _reviews, ...governanceWithoutReviews } = governance;
  return {
    ...clinicalRule,
    governance: governanceWithoutReviews,
  };
}

describe("CCR R2 governance-only promotion", () => {
  it("changes no clinical rule field between R1-reconfirmed and R2-reviewed snapshots", () => {
    expect(ccrPhase6R2ReviewedRuleset.rules).toHaveLength(43);
    expect(ccrPhase6R1ReconfirmedRuleset.rules).toHaveLength(43);

    for (let index = 0; index < ccrPhase6R2ReviewedRuleset.rules.length; index += 1) {
      const before = ccrPhase6R1ReconfirmedRuleset.rules[index];
      const after = ccrPhase6R2ReviewedRuleset.rules[index];
      expect(before).toBeDefined();
      expect(after).toBeDefined();
      expect(stripReviewGovernance(after!)).toEqual(
        stripReviewGovernance(before!),
      );
    }
  });

  it("preserves policies and resolvers exactly across the R2 governance step", () => {
    expect(ccrPhase6R2ReviewedPolicies).toBe(ccrPhase6R1ReconfirmedPolicies);
    expect(ccrPhase6R2ReviewedResolvers).toBe(ccrPhase6R1ReconfirmedResolvers);
    expect(ccrPhase6R2ReviewedRuleset.sources).toEqual(
      ccrPhase6R1ReconfirmedRuleset.sources,
    );
    expect(ccrPhase6R2ReviewedRuleset.terminology).toEqual(
      ccrPhase6R1ReconfirmedRuleset.terminology,
    );
  });

  it("records the anonymous public R2 handle on every rule without activation", () => {
    for (const rule of ccrPhase6R2ReviewedRuleset.rules) {
      expect(rule.reviewStatus).toBe("reviewed_by_2");
      expect(rule.lifecycleStatus).toBe("draft");
      expect(rule.governance.reviews[1]?.reviewer).toBe(
        CCR_R2_REVIEWER_PUBLIC_ID,
      );
    }
  });
});
