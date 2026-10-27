import { describe, expect, it } from "vitest";
import { evaluatePatient } from "../../src/engine/evaluatePatient";
import { RuleDefinitionSchema, RulesetSchema } from "../../src/model/content";
import { parseCalendarDate } from "../../src/model/dates";
import { PatientSchema } from "../../src/model/patient";
import {
  MAMA_HARD_EXIT_CONCEPTS,
  MAMA_IDS,
  buildMamaDecisionContext,
  mamaM3R2Ruleset,
  mamaSusM3DraftPolicy,
} from "../../src/clinical/mama";

const AS_OF = parseCalendarDate("2026-10-26");

const ACTIVE_PREVIEW = RulesetSchema.parse({
  ...mamaM3R2Ruleset,
  rulesetVersion: "breast-0.1.2-m3-r2-context-preview",
  rules: mamaM3R2Ruleset.rules.map((rule) =>
    RuleDefinitionSchema.parse({ ...rule, lifecycleStatus: "active" }),
  ),
});

function fact(
  conceptId: string,
  presence: "yes" | "no" | "unknown" = "no",
) {
  return {
    id: `fact-${conceptId}`,
    conceptId,
    category: "population_context" as const,
    presence,
  };
}

function patient(
  age: number,
  overrides: Record<string, "yes" | "no" | "unknown"> = {},
) {
  const concepts = new Set<string>([
    MAMA_IDS.concepts.screeningContextConfirmed,
    MAMA_IDS.concepts.relevantBreastTissuePresent,
    MAMA_IDS.concepts.historySufficientForCurrentStatus,
    ...MAMA_HARD_EXIT_CONCEPTS,
  ]);
  return PatientSchema.parse({
    context: { ageYears: age },
    facts: [...concepts].map((conceptId) =>
      fact(
        conceptId,
        overrides[conceptId] ??
          (conceptId === MAMA_IDS.concepts.screeningContextConfirmed ||
          conceptId === MAMA_IDS.concepts.relevantBreastTissuePresent ||
          conceptId === MAMA_IDS.concepts.historySufficientForCurrentStatus
            ? "yes"
            : "no"),
      ),
    ),
    examHistory: [],
    historyKnowledge: { [MAMA_IDS.topic]: "never_performed" },
  });
}

function run(age: number, overrides: Record<string, "yes" | "no" | "unknown"> = {}) {
  return evaluatePatient({
    patient: patient(age, overrides),
    ruleset: ACTIVE_PREVIEW,
    asOf: AS_OF,
    policyId: mamaSusM3DraftPolicy.policyId,
  });
}

describe("Mama canonical decision context", () => {
  it("attaches source-backed under-40 provenance only after safety tracks clear", () => {
    const context = buildMamaDecisionContext({
      evaluation: run(35),
      policyFamily: "sus_oficial",
      ageYears: 35,
    });
    expect(context.routineScopeDisposition).toBe("applied");
    expect(context.routineScope?.conclusion).toBe("routine_not_recommended");
    expect(context.additionalSourceRefs.length).toBeGreaterThan(0);
  });

  it("suppresses routine age closure when a higher-acuity hard exit is active", () => {
    const context = buildMamaDecisionContext({
      evaluation: run(35, {
        [MAMA_IDS.concepts.suspiciousBreastSymptoms]: "yes",
      }),
      policyFamily: "sus_oficial",
      ageYears: 35,
    });
    expect(context.routineScopeDisposition).toBe("suppressed_by_safety_track");
    expect(context.routineScope).toBeNull();
    expect(context.additionalSourceRefs).toEqual([]);
  });

  it("fails safe when a hard-exit fact is unknown", () => {
    const context = buildMamaDecisionContext({
      evaluation: run(35, {
        [MAMA_IDS.concepts.highRiskGeneticContext]: "unknown",
      }),
      policyFamily: "sus_oficial",
      ageYears: 35,
    });
    expect(context.routineScopeDisposition).toBe(
      "suppressed_by_incomplete_safety_assessment",
    );
    expect(context.routineScope).toBeNull();
  });

  it("adds no under-40 provenance when age is 40 or older", () => {
    const context = buildMamaDecisionContext({
      evaluation: run(40),
      policyFamily: "sus_oficial",
      ageYears: 40,
    });
    expect(context.routineScopeDisposition).toBe("not_applicable_age");
    expect(context.routineScope).toBeNull();
    expect(context.additionalSourceRefs).toEqual([]);
  });
});
