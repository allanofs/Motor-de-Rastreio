import { describe, expect, it } from "vitest";
import {
  MAMA_ACTIVE_DOMAIN_SNAPSHOT_VERSION,
  MAMA_ACTIVE_RULESET_VERSION,
  MAMA_CANDIDATE_DOMAIN_SNAPSHOT_VERSION,
  MAMA_CANDIDATE_RULESET_VERSION,
  mamaCandidateDomainSnapshot,
  mamaCandidatePolicies,
  mamaCandidateRuleset,
  mamaM31ActiveSnapshot,
  mamaM3ActivePolicies,
  mamaM3ActiveRuleset,
} from "../../src/clinical/mama";

describe("Mama canonical active candidate entrypoint", () => {
  it("points only to the explicitly activated clinical-content snapshots", () => {
    expect(MAMA_CANDIDATE_RULESET_VERSION).toBe(MAMA_ACTIVE_RULESET_VERSION);
    expect(MAMA_CANDIDATE_DOMAIN_SNAPSHOT_VERSION).toBe(
      MAMA_ACTIVE_DOMAIN_SNAPSHOT_VERSION,
    );
    expect(mamaCandidateRuleset).toBe(mamaM3ActiveRuleset);
    expect(mamaCandidatePolicies).toBe(mamaM3ActivePolicies);
    expect(mamaCandidateDomainSnapshot).toBe(mamaM31ActiveSnapshot);
  });

  it("exposes only active/reviewed_by_2 rule content through the candidate", () => {
    expect(mamaCandidateRuleset.rulesetVersion).toBe(
      "breast-0.1.7-m3-1-active",
    );
    expect(
      mamaCandidateRuleset.rules.every(
        (rule) =>
          rule.lifecycleStatus === "active" &&
          rule.reviewStatus === "reviewed_by_2",
      ),
    ).toBe(true);
  });

  it("exposes the independently reviewed M3.1 domain snapshot as active", () => {
    expect(mamaCandidateDomainSnapshot.snapshotVersion).toBe(
      "breast-0.1.7-m3-1-domain-active",
    );
    expect(mamaCandidateDomainSnapshot.lifecycleStatus).toBe("active");
    expect(mamaCandidateDomainSnapshot.reviewStatus).toBe("reviewed_by_2");
    expect(mamaCandidateDomainSnapshot.verdict).toBe("APPROVE");
  });
});
