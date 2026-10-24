import { describe, expect, it } from "vitest";
import {
  CCR_CANDIDATE_RULESET_VERSION,
  ccrCandidateRuleset,
} from "../../src/clinical/ccr";

describe("CCR post-R2 activation readiness", () => {
  it("has a fully R2-reviewed canonical candidate while deliberately remaining draft", () => {
    expect(CCR_CANDIDATE_RULESET_VERSION).toBe(
      "crc-0.5.4-phase6-r2-reviewed-draft",
    );
    expect(ccrCandidateRuleset.rules).toHaveLength(43);
    expect(
      ccrCandidateRuleset.rules.every(
        (rule) =>
          rule.reviewStatus === "reviewed_by_2" &&
          rule.lifecycleStatus === "draft" &&
          rule.governance.reviews.length === 2,
      ),
    ).toBe(true);
  });

  it("keeps every candidate source final, HTTPS-backed and verified on the freeze date", () => {
    for (const source of ccrCandidateRuleset.sources) {
      expect(source.documentStatus).toBe("final");
      expect(source.url.startsWith("https://")).toBe(true);
      expect(source.lastVerifiedAt).toEqual({
        year: 2026,
        month: 10,
        day: 24,
      });
    }
  });

  it("keeps all rule source references resolvable with non-empty locators", () => {
    const sourceIds = new Set(
      ccrCandidateRuleset.sources.map((source) => source.sourceId),
    );
    for (const rule of ccrCandidateRuleset.rules) {
      expect(rule.sourceRefs.length).toBeGreaterThan(0);
      for (const ref of rule.sourceRefs) {
        expect(sourceIds.has(ref.sourceId)).toBe(true);
        expect(ref.locator.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("does not activate any rule implicitly as part of review completion", () => {
    expect(
      ccrCandidateRuleset.rules.some(
        (rule) => rule.lifecycleStatus === "active",
      ),
    ).toBe(false);
  });
});
