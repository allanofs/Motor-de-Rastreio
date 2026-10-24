import { describe, expect, it } from "vitest";
import {
  CCR_ACTIVE_RULESET_VERSION,
  CCR_R2_REVIEWED_RULESET_VERSION,
  ccrPhase6ActiveRuleset,
  ccrPhase6R2ReviewedRuleset,
} from "../../src/clinical/ccr";

function stripActivationOnlyFields(rule: unknown) {
  const value = structuredClone(rule) as Record<string, unknown>;
  delete value.lifecycleStatus;
  return value;
}

describe("CCR Phase 6 activation promotion", () => {
  it("creates a distinct active snapshot from the frozen R2-reviewed draft", () => {
    expect(CCR_R2_REVIEWED_RULESET_VERSION).toBe(
      "crc-0.5.4-phase6-r2-reviewed-draft",
    );
    expect(CCR_ACTIVE_RULESET_VERSION).toBe("crc-0.5.5-phase6-active");
    expect(ccrPhase6R2ReviewedRuleset.rules).toHaveLength(43);
    expect(ccrPhase6ActiveRuleset.rules).toHaveLength(43);
  });

  it("changes only lifecycleStatus at rule level", () => {
    for (let index = 0; index < ccrPhase6ActiveRuleset.rules.length; index += 1) {
      const before = ccrPhase6R2ReviewedRuleset.rules[index]!;
      const after = ccrPhase6ActiveRuleset.rules[index]!;

      expect(before.lifecycleStatus).toBe("draft");
      expect(after.lifecycleStatus).toBe("active");
      expect(after.reviewStatus).toBe("reviewed_by_2");
      expect(after.governance.reviews).toEqual(before.governance.reviews);
      expect(stripActivationOnlyFields(after)).toEqual(
        stripActivationOnlyFields(before),
      );
    }
  });

  it("keeps sources, policies, terminology and all non-rule bundle content identical", () => {
    expect(ccrPhase6ActiveRuleset.sources).toEqual(
      ccrPhase6R2ReviewedRuleset.sources,
    );
    expect(ccrPhase6ActiveRuleset.policies).toEqual(
      ccrPhase6R2ReviewedRuleset.policies,
    );
    expect(ccrPhase6ActiveRuleset.terminology).toEqual(
      ccrPhase6R2ReviewedRuleset.terminology,
    );
  });
});
