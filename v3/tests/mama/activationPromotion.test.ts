import { describe, expect, it } from "vitest";
import {
  MAMA_ACTIVE_DOMAIN_SNAPSHOT_VERSION,
  MAMA_ACTIVE_RULESET_VERSION,
  MAMA_M3_1_R2_SNAPSHOT_VERSION,
  MAMA_M3_R2_RULESET_VERSION,
  mamaM31ActiveSnapshot,
  mamaM31R2ReviewedSnapshot,
  mamaM3ActiveRuleset,
  mamaM3R2Ruleset,
} from "../../src/clinical/mama";

function stripRuleLifecycle(rule: unknown) {
  const value = structuredClone(rule) as Record<string, unknown>;
  delete value.lifecycleStatus;
  return value;
}

function stripDomainActivationFields(snapshot: unknown) {
  const value = structuredClone(snapshot) as Record<string, unknown>;
  delete value.snapshotVersion;
  delete value.lifecycleStatus;
  return value;
}

describe("Mama lifecycle activation promotion", () => {
  it("creates distinct active versions from frozen R2-reviewed drafts", () => {
    expect(MAMA_M3_R2_RULESET_VERSION).toBe(
      "breast-0.1.2-m3-r2-reviewed-draft",
    );
    expect(MAMA_ACTIVE_RULESET_VERSION).toBe("breast-0.1.7-m3-1-active");
    expect(MAMA_M3_1_R2_SNAPSHOT_VERSION).toBe(
      "breast-0.1.6-m3-1-r2-reviewed-draft",
    );
    expect(MAMA_ACTIVE_DOMAIN_SNAPSHOT_VERSION).toBe(
      "breast-0.1.7-m3-1-domain-active",
    );
  });

  it("changes only lifecycleStatus at rule level", () => {
    expect(mamaM3R2Ruleset.rules).toHaveLength(15);
    expect(mamaM3ActiveRuleset.rules).toHaveLength(15);

    for (let index = 0; index < mamaM3ActiveRuleset.rules.length; index += 1) {
      const before = mamaM3R2Ruleset.rules[index]!;
      const after = mamaM3ActiveRuleset.rules[index]!;

      expect(before.lifecycleStatus).toBe("draft");
      expect(after.lifecycleStatus).toBe("active");
      expect(after.reviewStatus).toBe("reviewed_by_2");
      expect(after.governance.reviews).toEqual(before.governance.reviews);
      expect(stripRuleLifecycle(after)).toEqual(stripRuleLifecycle(before));
    }
  });

  it("keeps sources, policies and terminology identical", () => {
    expect(mamaM3ActiveRuleset.sources).toEqual(mamaM3R2Ruleset.sources);
    expect(mamaM3ActiveRuleset.policies).toEqual(mamaM3R2Ruleset.policies);
    expect(mamaM3ActiveRuleset.terminology).toEqual(
      mamaM3R2Ruleset.terminology,
    );
  });

  it("activates the reviewed M3.1 domain snapshot without changing reviewed semantics", () => {
    expect(mamaM31R2ReviewedSnapshot.lifecycleStatus).toBe("draft");
    expect(mamaM31ActiveSnapshot.lifecycleStatus).toBe("active");
    expect(mamaM31ActiveSnapshot.reviewStatus).toBe("reviewed_by_2");
    expect(mamaM31ActiveSnapshot.governance).toEqual(
      mamaM31R2ReviewedSnapshot.governance,
    );
    expect(mamaM31ActiveSnapshot.reviewedArtifacts).toEqual(
      mamaM31R2ReviewedSnapshot.reviewedArtifacts,
    );
    expect(stripDomainActivationFields(mamaM31ActiveSnapshot)).toEqual(
      stripDomainActivationFields(mamaM31R2ReviewedSnapshot),
    );
  });
});
