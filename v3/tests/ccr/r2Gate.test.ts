import { describe, expect, it } from "vitest";
import {
  CCR_CANDIDATE_RULESET_VERSION,
  CCR_R1_REVIEWER,
  CCR_R2_REVIEWER_PUBLIC_ID,
  ccrCandidateRuleset,
} from "../../src/clinical/ccr";

describe("CCR R2 human-review gate", () => {
  it("requires all canonical rules to have two distinct human-review records while remaining draft", () => {
    expect(CCR_CANDIDATE_RULESET_VERSION).toBe(
      "crc-0.5.4-phase6-r2-reviewed-draft",
    );
    expect(ccrCandidateRuleset.rules).toHaveLength(43);

    for (const rule of ccrCandidateRuleset.rules) {
      expect(rule.lifecycleStatus).toBe("draft");
      expect(rule.reviewStatus).toBe("reviewed_by_2");
      expect(rule.governance.reviews).toHaveLength(2);
      expect(rule.governance.reviews[0]?.reviewer).toBe(CCR_R1_REVIEWER);
      expect(rule.governance.reviews[1]?.reviewer).toBe(
        CCR_R2_REVIEWER_PUBLIC_ID,
      );
      expect(
        new Set(rule.governance.reviews.map((review) => review.reviewer)).size,
      ).toBe(2);
    }
  });

  it("keeps the public R2 reviewer handle non-identifying and distinct from R1", () => {
    expect(CCR_R2_REVIEWER_PUBLIC_ID).toBe(
      "external-physician-r2-private-001",
    );
    expect(CCR_R2_REVIEWER_PUBLIC_ID).not.toBe(CCR_R1_REVIEWER);
    expect(CCR_R2_REVIEWER_PUBLIC_ID).not.toMatch(/CRM/i);
    expect(CCR_R2_REVIEWER_PUBLIC_ID).not.toMatch(/TESTE/i);
  });

  it("forbids activation even after R2 until a separate activation gate", () => {
    expect(
      ccrCandidateRuleset.rules.some(
        (rule) => rule.lifecycleStatus === "active",
      ),
    ).toBe(false);
  });
});
