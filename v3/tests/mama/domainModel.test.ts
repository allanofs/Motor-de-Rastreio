import { describe, expect, it } from "vitest";
import { IdSchema } from "../../src/model/common";
import * as mama from "../../src/clinical/mama";
import {
  MAMA_HARD_EXIT_CONCEPTS,
  MAMA_IDS,
  MAMA_NON_ROUTINE_MODALITIES,
  MAMA_ROUTINE_MODALITIES,
  MAMA_ROUTINE_RESOURCES,
  MAMA_ROUTINE_RESULT_CLASSES,
  MAMA_TRACKS,
  mamaTerminology,
} from "../../src/clinical/mama";

describe("Mama M1 domain representability", () => {
  it("uses valid, unique terminology IDs", () => {
    expect(new Set(mamaTerminology).size).toBe(mamaTerminology.length);
    for (const id of mamaTerminology) expect(IdSchema.parse(id)).toBe(id);
  });

  it("keeps the first release intentionally shallow", () => {
    expect(MAMA_ROUTINE_MODALITIES).toEqual([
      MAMA_IDS.modalities.mammographyScreening,
    ]);
    expect(MAMA_NON_ROUTINE_MODALITIES).toEqual([
      MAMA_IDS.modalities.mammographyDiagnostic,
    ]);
    expect(MAMA_ROUTINE_RESOURCES).toEqual([MAMA_IDS.resources.mammography]);

    const vocabulary = mamaTerminology.join(" ").toLowerCase();
    for (const forbidden of ["birads", "ultrasound", "mri", "biopsy", "histology"]) {
      expect(vocabulary).not.toContain(forbidden);
    }
  });

  it("represents hard exits without diagnostic-management tracks", () => {
    expect(MAMA_HARD_EXIT_CONCEPTS).toEqual(
      expect.arrayContaining([
        MAMA_IDS.concepts.suspiciousBreastSymptoms,
        MAMA_IDS.concepts.priorBreastCancer,
        MAMA_IDS.concepts.highRiskGeneticContext,
        MAMA_IDS.concepts.priorHighRiskChestRadiation,
        MAMA_IDS.concepts.priorHighRiskBreastLesion,
        MAMA_IDS.concepts.specificBreastCareActive,
        MAMA_IDS.concepts.priorMammographyNeedsSpecificAttention,
      ]),
    );
    expect(MAMA_TRACKS).toHaveLength(5);
  });

  it("keeps anatomy explicit instead of inferring sex or gender", () => {
    expect(MAMA_IDS.concepts.relevantBreastTissuePresent).toBe(
      "breast-relevant-tissue-present",
    );
    const vocabulary = mamaTerminology.join(" ").toLowerCase();
    expect(vocabulary).not.toContain("gender");
    expect(vocabulary).not.toContain("female-sex");
  });

  it("supports only the minimal result classes needed for routine vs exit", () => {
    expect(MAMA_ROUTINE_RESULT_CLASSES).toEqual([
      "routine-clearing",
      "attention-required",
      "indeterminate",
    ]);
  });

  it("does not export executable rules, policies or actions in M1", () => {
    const exportedNames = Object.keys(mama);
    expect(exportedNames.some((name) => /Rule|Policy|Action/.test(name))).toBe(false);
  });
});
