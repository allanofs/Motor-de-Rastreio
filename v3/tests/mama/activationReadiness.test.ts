import { describe, expect, it } from "vitest";
import {
  MAMA_ACTIVATION_BLOCKERS,
  MAMA_ACTIVATION_READINESS_VERSION,
  MAMA_M3_1_SCOPE_VERSION,
  assessMamaActivationReadiness,
  mamaM3R2Ruleset,
} from "../../src/clinical/mama";

describe("Mama activation readiness after M3.1 human approval", () => {
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

  it("reports the approved M3.1 artifact as source-backed but not independently R2-reviewed", () => {
    const readiness = assessMamaActivationReadiness();
    expect(readiness.version).toBe(MAMA_ACTIVATION_READINESS_VERSION);
    expect(readiness.under40ScopeVersion).toBe(MAMA_M3_1_SCOPE_VERSION);
    expect(readiness.checks.under40HumanGateApproved).toBe(true);
    expect(readiness.checks.under40ScopeSourceBacked).toBe(true);
    expect(readiness.checks.m31IndependentR2Reviewed).toBe(false);
  });

  it("does not claim activation readiness while M3.1 lacks independent R2 review", () => {
    const readiness = assessMamaActivationReadiness();
    expect(readiness.ready).toBe(false);
    expect(readiness.blockers).toContain(
      MAMA_ACTIVATION_BLOCKERS.m31IndependentR2ReviewMissing,
    );
  });

  it("keeps under-40 provenance integration as an explicit canonical-trace blocker", () => {
    const readiness = assessMamaActivationReadiness();
    expect(readiness.checks.under40IncludedInCanonicalDecisionTrace).toBe(false);
    expect(readiness.blockers).toContain(
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
