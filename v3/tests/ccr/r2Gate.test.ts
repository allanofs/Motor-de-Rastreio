import { describe, expect, it } from "vitest";
import {
  CCR_CANDIDATE_RULESET_VERSION,
  ccrCandidateRuleset,
} from "../../src/clinical/ccr";

describe("CCR R2 human-review gate", () => {
  it("keeps the canonical candidate at R1 until a distinct second human review is explicitly recorded", () => {
    expect(CCR_CANDIDATE_RULESET_VERSION).toBe("crc-0.5.1-phase6-r1-draft");
    expect(ccrCandidateRuleset.rules).toHaveLength(43);
    for (const rule of ccrCandidateRuleset.rules) {
      expect(rule.lifecycleStatus).toBe("draft");
      expect(rule.reviewStatus).toBe("reviewed_by_1");
      expect(rule.governance.reviews).toHaveLength(1);
      expect(rule.governance.reviews[0]?.reviewer).toBe("Allan Ramos Costa");
    }
  });

  it("forbids accidental reviewed_by_2 or activation before the independent physician approval", () => {
    expect(
      ccrCandidateRuleset.rules.some(
        (rule) =>
          rule.reviewStatus === "reviewed_by_2" ||
          rule.lifecycleStatus === "active",
      ),
    ).toBe(false);
  });

  it("requires two distinct reviewer identities before any future R2 ruleset can satisfy governance", () => {
    for (const rule of ccrCandidateRuleset.rules) {
      expect(new Set(rule.governance.reviews.map((review) => review.reviewer)).size).toBe(1);
    }
  });
});
