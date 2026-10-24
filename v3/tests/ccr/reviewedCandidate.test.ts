import { describe, expect, it } from "vitest";
import {
  CCR_R1_REVIEWER,
  CCR_R1_RULESET_VERSION,
  ccrPhase65Ruleset,
  ccrPhase6R1Ruleset,
} from "../../src/clinical/ccr";

function withoutR1ReviewMetadata<T extends {
  reviewStatus: string;
  governance: { reviews: unknown[] };
}>(rule: T) {
  return {
    ...rule,
    reviewStatus: "source_verified",
    governance: {
      ...rule.governance,
      reviews: [],
    },
  };
}

describe("CCR Phase 6 first human executable-translation review", () => {
  it("registers exactly one R1 review on all 43 rules while keeping lifecycle draft", () => {
    expect(CCR_R1_RULESET_VERSION).toBe("crc-0.5.1-phase6-r1-draft");
    expect(ccrPhase6R1Ruleset.rules).toHaveLength(43);

    for (const rule of ccrPhase6R1Ruleset.rules) {
      expect(rule.lifecycleStatus).toBe("draft");
      expect(rule.reviewStatus).toBe("reviewed_by_1");
      expect(rule.governance.reviews).toEqual([
        {
          reviewer: CCR_R1_REVIEWER,
          reviewedAt: { year: 2026, month: 10, day: 24 },
        },
      ]);
    }
  });

  it("changes governance metadata only and preserves every 6.5 clinical rule exactly", () => {
    expect(ccrPhase6R1Ruleset.rules).toHaveLength(ccrPhase65Ruleset.rules.length);

    for (let i = 0; i < ccrPhase65Ruleset.rules.length; i += 1) {
      expect(withoutR1ReviewMetadata(ccrPhase6R1Ruleset.rules[i]!)).toEqual(
        ccrPhase65Ruleset.rules[i],
      );
    }
  });

  it("preserves sources, policies and terminology without clinical changes", () => {
    expect(ccrPhase6R1Ruleset.sources).toEqual(ccrPhase65Ruleset.sources);
    expect(ccrPhase6R1Ruleset.policies).toEqual(ccrPhase65Ruleset.policies);
    expect(ccrPhase6R1Ruleset.terminology).toEqual(ccrPhase65Ruleset.terminology);
  });

  it("keeps the audited 6.5 snapshot immutable and source_verified", () => {
    expect(ccrPhase65Ruleset.rulesetVersion).toBe("crc-0.5.0-phase6.5-draft");
    expect(
      ccrPhase65Ruleset.rules.every(
        (rule) =>
          rule.lifecycleStatus === "draft" &&
          rule.reviewStatus === "source_verified" &&
          rule.governance.reviews.length === 0,
      ),
    ).toBe(true);
  });

  it("does not claim second independent review or activate any rule", () => {
    expect(
      ccrPhase6R1Ruleset.rules.some(
        (rule) => rule.reviewStatus === "reviewed_by_2" || rule.lifecycleStatus === "active",
      ),
    ).toBe(false);
  });
});
