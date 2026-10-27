import { describe, expect, it } from "vitest";
import {
  MAMA_ACTIVATION_BLOCKERS,
  MAMA_ACTIVATION_READINESS_VERSION,
  MAMA_M3_1_R2_SNAPSHOT_VERSION,
  MAMA_M3_1_SCOPE_VERSION,
  assessMamaActivationReadiness,
  mamaM3R2Ruleset,
} from "../../src/clinical/mama";

describe("Mama activation readiness after focused M3.1 R2 approval", () => {
  it("keeps the R2-reviewed core immutable and still draft", () => {
    expect(mamaM3R2Ruleset.rulesetVersion).toBe(
      "breast-0.1.2-m3-r2-reviewed-draft",
    );
    expect(mamaM3R2Ruleset.rules).toHaveLength(15);
    expect(
      mamaM3R2Ruleset.rules.every(
        (rule) =>
          rule.reviewStatus === "reviewed_by_2" &&
          rule.lifecycleStatus === "draft" &&
          rule.governance.reviews.length >= 2,
      ),
    ).toBe(true);
  });

  it("recognizes the focused M3.1 R2 snapshot while preserving draft lifecycle", () => {
    const readiness = assessMamaActivationReadiness();
    expect(readiness.version).toBe(MAMA_ACTIVATION_READINESS_VERSION);
    expect(readiness.under40ScopeVersion).toBe(MAMA_M3_1_SCOPE_VERSION);
    expect(readiness.m31R2SnapshotVersion).toBe(MAMA_M3_1_R2_SNAPSHOT_VERSION);
    expect(readiness.checks.under40HumanGateApproved).toBe(true);
    expect(readiness.checks.under40ScopeSourceBacked).toBe(true);
    expect(readiness.checks.m31IndependentR2Reviewed).toBe(true);
    expect(readiness.checks.m31StillDraft).toBe(true);
  });

  it("reports clinical-content activation readiness with no remaining blockers", () => {
    const readiness = assessMamaActivationReadiness();
    expect(readiness.ready).toBe(true);
    expect(readiness.blockers).toEqual([]);
    expect(readiness.blockers).not.toContain(
      MAMA_ACTIVATION_BLOCKERS.m31IndependentR2ReviewMissing,
    );
  });

  it("keeps canonical under-40 provenance integration closed", () => {
    const readiness = assessMamaActivationReadiness();
    expect(readiness.checks.under40IncludedInCanonicalDecisionTrace).toBe(true);
    expect(readiness.blockers).not.toContain(
      MAMA_ACTIVATION_BLOCKERS.under40CanonicalTraceIntegrationMissing,
    );
  });

  it("never promotes content to active as part of readiness assessment", () => {
    assessMamaActivationReadiness();
    expect(
      mamaM3R2Ruleset.rules.some((rule) => rule.lifecycleStatus === "active"),
    ).toBe(false);
  });
});
