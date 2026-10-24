import { describe, expect, it } from "vitest";
import {
  CCR_ACTIVE_RULESET_VERSION,
  CCR_CANDIDATE_RULESET_VERSION,
  ccrCandidateRuleset,
  ccrPhase6R2ReviewedRuleset,
} from "../../src/clinical/ccr";

describe("CCR activation readiness and post-activation safety", () => {
  it("promotes the canonical candidate to the explicitly authorized active snapshot", () => {
    expect(CCR_CANDIDATE_RULESET_VERSION).toBe("crc-0.5.5-phase6-active");
    expect(CCR_CANDIDATE_RULESET_VERSION).toBe(CCR_ACTIVE_RULESET_VERSION);
    expect(ccrCandidateRuleset.rules).toHaveLength(43);
    expect(
      ccrCandidateRuleset.rules.every(
        (rule) =>
          rule.reviewStatus === "reviewed_by_2" &&
          rule.lifecycleStatus === "active" &&
          rule.governance.reviews.length === 2,
      ),
    ).toBe(true);
  });

  it("preserves the pre-activation R2 snapshot as draft for audit", () => {
    expect(
      ccrPhase6R2ReviewedRuleset.rules.every(
        (rule) =>
          rule.reviewStatus === "reviewed_by_2" &&
          rule.lifecycleStatus === "draft",
      ),
    ).toBe(true);
  });

  it("keeps every active candidate source final, HTTPS-backed and verified on the freeze date", () => {
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

  it("keeps all active rule source references resolvable with non-empty locators", () => {
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
});
