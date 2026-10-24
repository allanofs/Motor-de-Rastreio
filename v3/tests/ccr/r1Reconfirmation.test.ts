import { describe, expect, it } from "vitest";
import type { RuleDefinition } from "../../src/model/content";
import {
  CCR_R1_RECONFIRMED_RULESET_VERSION,
  CCR_R2_PREP_R1_RECONFIRM_RULE_IDS,
  ccrPhase6R1ReconfirmedRuleset,
  ccrR2PreparedRuleset,
} from "../../src/clinical/ccr";

const byId = (rules: readonly RuleDefinition[]) =>
  new Map(rules.map((rule) => [rule.ruleId, rule]));

function withoutReviewGovernance(rule: RuleDefinition) {
  return {
    ...rule,
    reviewStatus: undefined,
    governance: {
      ...rule.governance,
      reviews: undefined,
    },
  };
}

describe("CCR R1 reconfirmation after pre-R2 corrections", () => {
  it("freezes a new corrected R1 candidate version", () => {
    expect(CCR_R1_RECONFIRMED_RULESET_VERSION).toBe(
      "crc-0.5.3-phase6-r1-reconfirmed-draft",
    );
    expect(ccrPhase6R1ReconfirmedRuleset.rules).toHaveLength(43);
    expect(ccrPhase6R1ReconfirmedRuleset.rules.every((rule) => rule.lifecycleStatus === "draft")).toBe(true);
    expect(ccrPhase6R1ReconfirmedRuleset.rules.every((rule) => rule.reviewStatus === "reviewed_by_1")).toBe(true);
  });

  it("reconfirms exactly the 15 rules reset during pre-R2 corrections", () => {
    const affected = new Set<string>(CCR_R2_PREP_R1_RECONFIRM_RULE_IDS);
    expect(affected.size).toBe(15);

    const before = byId(ccrR2PreparedRuleset.rules);
    const after = byId(ccrPhase6R1ReconfirmedRuleset.rules);

    for (const ruleId of affected) {
      expect(before.get(ruleId)?.reviewStatus).toBe("source_verified");
      expect(before.get(ruleId)?.governance.reviews).toHaveLength(0);
      expect(after.get(ruleId)?.reviewStatus).toBe("reviewed_by_1");
      expect(after.get(ruleId)?.governance.reviews).toEqual([
        expect.objectContaining({ reviewer: "Allan Ramos Costa" }),
      ]);
    }
  });

  it("does not alter clinical/source content while registering the reconfirmation", () => {
    const before = byId(ccrR2PreparedRuleset.rules);
    const after = byId(ccrPhase6R1ReconfirmedRuleset.rules);

    for (const [ruleId, newRule] of after) {
      const oldRule = before.get(ruleId);
      expect(oldRule).toBeDefined();
      expect(withoutReviewGovernance(newRule)).toEqual(
        withoutReviewGovernance(oldRule!),
      );
    }

    expect(ccrPhase6R1ReconfirmedRuleset.sources).toEqual(
      ccrR2PreparedRuleset.sources,
    );
    expect(ccrPhase6R1ReconfirmedRuleset.policies).toEqual(
      ccrR2PreparedRuleset.policies,
    );
    expect(ccrPhase6R1ReconfirmedRuleset.terminology).toEqual(
      ccrR2PreparedRuleset.terminology,
    );
  });

  it("keeps exactly one human reviewer identity on every rule before R2", () => {
    for (const rule of ccrPhase6R1ReconfirmedRuleset.rules) {
      expect(rule.governance.reviews).toHaveLength(1);
      expect(new Set(rule.governance.reviews.map((review) => review.reviewer))).toEqual(
        new Set(["Allan Ramos Costa"]),
      );
      expect(rule.reviewStatus).not.toBe("reviewed_by_2");
      expect(rule.lifecycleStatus).not.toBe("active");
    }
  });
});
