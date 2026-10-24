import { describe, expect, it } from "vitest";
import {
  CCR_CANDIDATE_RULESET_VERSION,
  ccrCandidateRuleset,
} from "../../src/clinical/ccr";

describe("CCR R2 human-review gate", () => {
  it("keeps the canonical candidate fully R1-reviewed but still blocked before distinct R2", () => {
    expect(CCR_CANDIDATE_RULESET_VERSION).toBe(
      "crc-0.5.3-phase6-r1-reconfirmed-draft",
    );
    expect(ccrCandidateRuleset.rules).toHaveLength(43);

    for (const rule of ccrCandidateRuleset.rules) {
      expect(rule.lifecycleStatus).toBe("draft");
      expect(rule.reviewStatus).toBe("reviewed_by_1");
      expect(rule.governance.reviews).toHaveLength(1);
      expect(rule.governance.reviews[0]?.reviewer).toBe("Allan Ramos Costa");
    }
  });

  it("forbids accidental reviewed_by_2 or activation before independent physician approval", () => {
    expect(
      ccrCandidateRuleset.rules.some(
        (rule) =>
          rule.reviewStatus === "reviewed_by_2" ||
          rule.lifecycleStatus === "active",
      ),
    ).toBe(false);
  });

  it("contains exactly one reviewer identity per rule until future R2", () => {
    for (const rule of ccrCandidateRuleset.rules) {
      expect(
        new Set(rule.governance.reviews.map((review) => review.reviewer)).size,
      ).toBe(1);
    }
  });
});
