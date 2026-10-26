import { describe, expect, it } from "vitest";
import {
  CCR_H1_FAMILY_STATUS_RULE_IDS,
} from "../../src/clinical/ccr/h1FamilyStatusCandidate";
import {
  ccrPhase6H1R2Ruleset,
} from "../../src/clinical/ccr/h1FamilyStatusR2Candidate";
import {
  CCR_H1_ACTIVE_RULESET_VERSION,
  ccrPhase6H1ActivePolicies,
  ccrPhase6H1ActiveResolvers,
  ccrPhase6H1ActiveRuleset,
} from "../../src/clinical/ccr/h1FamilyStatusActiveCandidate";
import {
  ccrPhase6H1R2Policies,
  ccrPhase6H1R2Resolvers,
} from "../../src/clinical/ccr/h1FamilyStatusR2Candidate";

const hotfixRuleIds = new Set<string>(CCR_H1_FAMILY_STATUS_RULE_IDS);

function withoutLifecycle<T extends { lifecycleStatus: string }>(rule: T) {
  const { lifecycleStatus: _lifecycleStatus, ...rest } = rule;
  return rest;
}

describe("Phase 6.H1 activation promotion", () => {
  it("creates the explicitly authorized immutable active snapshot", () => {
    expect(CCR_H1_ACTIVE_RULESET_VERSION).toBe(
      "crc-0.5.9-phase6-h1-active",
    );
    expect(ccrPhase6H1ActiveRuleset.rules).toHaveLength(43);
    expect(
      ccrPhase6H1ActiveRuleset.rules.every(
        (rule) =>
          rule.lifecycleStatus === "active" &&
          rule.reviewStatus === "reviewed_by_2",
      ),
    ).toBe(true);
  });

  it("changes no clinical or governance field from the R2 snapshot apart from lifecycle on the three H1 rules", () => {
    expect(ccrPhase6H1ActiveRuleset.rules).toHaveLength(
      ccrPhase6H1R2Ruleset.rules.length,
    );

    for (let index = 0; index < ccrPhase6H1R2Ruleset.rules.length; index += 1) {
      const before = ccrPhase6H1R2Ruleset.rules[index];
      const after = ccrPhase6H1ActiveRuleset.rules[index];
      expect(before).toBeDefined();
      expect(after).toBeDefined();
      expect(after!.ruleId).toBe(before!.ruleId);
      expect(withoutLifecycle(after!)).toEqual(withoutLifecycle(before!));

      if (hotfixRuleIds.has(before!.ruleId)) {
        expect(before!.lifecycleStatus).toBe("draft");
        expect(after!.lifecycleStatus).toBe("active");
      } else {
        expect(before!.lifecycleStatus).toBe("active");
        expect(after!.lifecycleStatus).toBe("active");
      }
    }
  });

  it("preserves policies and resolvers exactly across activation", () => {
    expect(ccrPhase6H1ActivePolicies).toBe(ccrPhase6H1R2Policies);
    expect(ccrPhase6H1ActiveResolvers).toBe(ccrPhase6H1R2Resolvers);
    expect(ccrPhase6H1ActiveRuleset.sources).toEqual(
      ccrPhase6H1R2Ruleset.sources,
    );
    expect(ccrPhase6H1ActiveRuleset.terminology).toEqual(
      ccrPhase6H1R2Ruleset.terminology,
    );
  });
});
