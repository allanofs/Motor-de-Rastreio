import { describe, expect, it } from "vitest";
import {
  MAMA_HARD_EXIT_CONCEPTS,
  MAMA_IDS,
} from "../../src/clinical/mama";
import { parseCalendarDate } from "../../src/model/dates";
import { PatientSchema } from "../../src/model/patient";
import {
  deriveMamaAutomationBoundary,
  evaluateMamaProduct,
  getMamaProductPolicyOptions,
} from "../../src/product/mama";

const AS_OF = parseCalendarDate("2026-10-27");

function internationalPolicyId() {
  const option = getMamaProductPolicyOptions().find(
    (candidate) => candidate.family === "internacional",
  );
  if (option === undefined) throw new Error("Missing international policy");
  return option.policyId;
}

function patientWithUnknownGeneticRisk() {
  const concepts = new Set<string>([
    MAMA_IDS.concepts.screeningContextConfirmed,
    MAMA_IDS.concepts.relevantBreastTissuePresent,
    MAMA_IDS.concepts.historySufficientForCurrentStatus,
    ...MAMA_HARD_EXIT_CONCEPTS,
  ]);
  return PatientSchema.parse({
    context: { ageYears: 76 },
    facts: [...concepts].map((conceptId) => ({
      id: `fact-${conceptId}`,
      conceptId,
      category: "population_context",
      presence:
        conceptId === MAMA_IDS.concepts.screeningContextConfirmed ||
        conceptId === MAMA_IDS.concepts.relevantBreastTissuePresent ||
        conceptId === MAMA_IDS.concepts.historySufficientForCurrentStatus
          ? "yes"
          : conceptId === MAMA_IDS.concepts.highRiskGeneticContext
            ? "unknown"
            : "no",
    })),
    examHistory: [],
    historyKnowledge: { [MAMA_IDS.topic]: "never_performed" },
  });
}

describe("Mama product boundary safety precedence", () => {
  it("requires missing safety information before surfacing USPSTF 75+ insufficient evidence", () => {
    const result = evaluateMamaProduct({
      patient: patientWithUnknownGeneticRisk(),
      policyId: internationalPolicyId(),
      asOf: AS_OF,
    });
    if (!result.ok) throw new Error(result.message);

    const boundary = deriveMamaAutomationBoundary(result);
    expect(boundary.code).toBe("MORE_INFORMATION_NEEDED");
    expect(boundary.reasonCode).toBeUndefined();
    expect(boundary.triggerTrackIds).toContain(MAMA_IDS.tracks.specialRisk);
  });
});
