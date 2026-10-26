import { describe, expect, it } from "vitest";
import {
  CCR_H1_FAMILY_STATUS_RULE_IDS,
} from "../../src/clinical/ccr/h1FamilyStatusCandidate";
import {
  CCR_H1_R2_RULESET_VERSION,
  ccrPhase6H1R2Ruleset,
} from "../../src/clinical/ccr/h1FamilyStatusR2Candidate";
import {
  CCR_CANDIDATE_RULESET_VERSION,
  ccrCandidateRuleset,
} from "../../src/clinical/ccr/candidate";

const hotfixRuleIds = new Set<string>(CCR_H1_FAMILY_STATUS_RULE_IDS);

describe("Phase 6.H1 activation readiness audit", () => {
  it("preserves the R2-reviewed H1 snapshot as non-active audit history after canonical activation", () => {
    expect(CCR_H1_R2_RULESET_VERSION).toBe(
      "crc-0.5.8-phase6-h1-r2-reviewed-draft",
    );
    expect(CCR_CANDIDATE_RULESET_VERSION).toBe(
      "crc-0.5.9-phase6-h1-active",
    );
    expect(ccrCandidateRuleset.rulesetVersion).toBe(
      "crc-0.5.9-phase6-h1-active",
    );
  });

  it("keeps all 43 R2 rules reviewed_by_2, with only the three H1 rules draft in the historical R2 snapshot", () => {
    expect(ccrPhase6H1R2Ruleset.rules).toHaveLength(43);

    for (const rule of ccrPhase6H1R2Ruleset.rules) {
      expect(rule.reviewStatus).toBe("reviewed_by_2");
      expect(rule.governance.reviews).toHaveLength(2);

      if (hotfixRuleIds.has(rule.ruleId)) {
        expect(rule.lifecycleStatus).toBe("draft");
      } else {
        expect(rule.lifecycleStatus).toBe("active");
      }
    }
  });

  it("keeps the two reviewer records distinct on each changed rule", () => {
    for (const rule of ccrPhase6H1R2Ruleset.rules.filter((candidate) =>
      hotfixRuleIds.has(candidate.ruleId),
    )) {
      expect(rule.governance.reviews[0]?.reviewer).toBeDefined();
      expect(rule.governance.reviews[1]?.reviewer).toBeDefined();
      expect(rule.governance.reviews[0]?.reviewer).not.toBe(
        rule.governance.reviews[1]?.reviewer,
      );
    }
  });

  it("keeps every source final, HTTPS-backed and every sourceRef resolvable with a non-empty locator", () => {
    const sourceIds = new Set(
      ccrPhase6H1R2Ruleset.sources.map((source) => source.sourceId),
    );

    for (const source of ccrPhase6H1R2Ruleset.sources) {
      expect(source.documentStatus).toBe("final");
      expect(source.url.startsWith("https://")).toBe(true);
    }

    for (const rule of ccrPhase6H1R2Ruleset.rules) {
      expect(rule.sourceRefs.length).toBeGreaterThan(0);
      for (const ref of rule.sourceRefs) {
        expect(sourceIds.has(ref.sourceId)).toBe(true);
        expect(ref.locator.trim().length).toBeGreaterThan(0);
      }
    }
  });
});
