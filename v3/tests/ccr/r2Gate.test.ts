import { describe, expect, it } from "vitest";
import {
  CCR_CANDIDATE_RULESET_VERSION,
  CCR_R2_PREP_R1_RECONFIRM_RULE_IDS,
  ccrCandidateRuleset,
} from "../../src/clinical/ccr";

describe("CCR R2 human-review gate", () => {
  it("keeps the corrected canonical candidate blocked at R1 reconfirmation before R2", () => {
    expect(CCR_CANDIDATE_RULESET_VERSION).toBe(
      "crc-0.5.2-phase6-r2-prep-draft",
    );
    expect(ccrCandidateRuleset.rules).toHaveLength(43);

    const reconfirm = new Set<string>(CCR_R2_PREP_R1_RECONFIRM_RULE_IDS);
    expect(reconfirm.size).toBe(15);

    for (const rule of ccrCandidateRuleset.rules) {
      expect(rule.lifecycleStatus).toBe("draft");
      if (reconfirm.has(rule.ruleId)) {
        expect(rule.reviewStatus).toBe("source_verified");
        expect(rule.governance.reviews).toHaveLength(0);
      } else {
        expect(rule.reviewStatus).toBe("reviewed_by_1");
        expect(rule.governance.reviews).toHaveLength(1);
        expect(rule.governance.reviews[0]?.reviewer).toBe("Allan Ramos Costa");
      }
    }
  });

  it("forbids accidental reviewed_by_2 or activation before R1 reconfirmation and independent physician approval", () => {
    expect(
      ccrCandidateRuleset.rules.some(
        (rule) =>
          rule.reviewStatus === "reviewed_by_2" ||
          rule.lifecycleStatus === "active",
      ),
    ).toBe(false);
  });

  it("does not contain two distinct reviewer identities anywhere in the corrected candidate", () => {
    for (const rule of ccrCandidateRuleset.rules) {
      expect(
        new Set(rule.governance.reviews.map((review) => review.reviewer)).size,
      ).toBeLessThanOrEqual(1);
    }
  });
});
