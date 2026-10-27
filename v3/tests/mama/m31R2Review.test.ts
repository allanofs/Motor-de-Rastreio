import { describe, expect, it } from "vitest";
import {
  MAMA_DECISION_CONTEXT_VERSION,
  MAMA_M3_1_R2_REVIEWER_PUBLIC_ID,
  MAMA_M3_1_R2_SNAPSHOT_VERSION,
  MAMA_M3_1_SCOPE_VERSION,
  MAMA_M3_R1_REVIEWER,
  MAMA_M3_R2_REVIEWER_PUBLIC_ID,
  mamaM31R2ReviewedSnapshot,
} from "../../src/clinical/mama";

describe("Mama M3.1 focused independent R2 governance", () => {
  it("reuses the same anonymous breast R2 handle and keeps it distinct from R1", () => {
    expect(MAMA_M3_1_R2_REVIEWER_PUBLIC_ID).toBe(
      MAMA_M3_R2_REVIEWER_PUBLIC_ID,
    );
    expect(MAMA_M3_1_R2_REVIEWER_PUBLIC_ID).toBe(
      "external-physician-r2-private-breast-001",
    );
    expect(MAMA_M3_1_R2_REVIEWER_PUBLIC_ID).not.toBe(MAMA_M3_R1_REVIEWER);
  });

  it("freezes an approved reviewed_by_2 snapshot while keeping lifecycle draft", () => {
    expect(mamaM31R2ReviewedSnapshot.snapshotVersion).toBe(
      MAMA_M3_1_R2_SNAPSHOT_VERSION,
    );
    expect(mamaM31R2ReviewedSnapshot.lifecycleStatus).toBe("draft");
    expect(mamaM31R2ReviewedSnapshot.reviewStatus).toBe("reviewed_by_2");
    expect(mamaM31R2ReviewedSnapshot.verdict).toBe("APPROVE");
  });

  it("binds the focused review to the exact final M3.1 scope and decision-context versions", () => {
    expect(
      mamaM31R2ReviewedSnapshot.reviewedArtifacts.under40ScopeVersion,
    ).toBe(MAMA_M3_1_SCOPE_VERSION);
    expect(
      mamaM31R2ReviewedSnapshot.reviewedArtifacts.decisionContextVersion,
    ).toBe(MAMA_DECISION_CONTEXT_VERSION);
  });

  it("records a project human gate plus a distinct independent R2 review", () => {
    const reviews = mamaM31R2ReviewedSnapshot.governance.reviews;
    expect(reviews).toHaveLength(2);
    const firstReview = reviews[0];
    const secondReview = reviews[1];
    if (firstReview === undefined || secondReview === undefined)
      throw new Error("Expected two M3.1 governance reviews");
    expect(firstReview.role).toBe("project_human_gate");
    expect(secondReview.role).toBe("independent_r2");
    expect(secondReview.reviewer).toBe(MAMA_M3_1_R2_REVIEWER_PUBLIC_ID);
    expect(secondReview.reviewer).not.toBe(firstReview.reviewer);
  });

  it("keeps all reviewed under-40 policy resolutions source-backed", () => {
    for (const resolution of Object.values(
      mamaM31R2ReviewedSnapshot.reviewedArtifacts.under40ScopeByPolicy,
    )) {
      expect(resolution.sourceRefs.length).toBeGreaterThan(0);
      expect(
        resolution.sourceRefs.every((ref) => ref.locator.trim().length > 0),
      ).toBe(true);
    }
  });
});
