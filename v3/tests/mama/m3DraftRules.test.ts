import { describe, expect, it } from "vitest";
import { evaluatePatient } from "../../src/engine/evaluatePatient";
import {
  RuleDefinitionSchema,
  RulesetSchema,
} from "../../src/model/content";
import { parseCalendarDate, parsePartialDate } from "../../src/model/dates";
import { PatientSchema } from "../../src/model/patient";
import {
  MAMA_HARD_EXIT_CONCEPTS,
  MAMA_IDS,
  breastInsufficientEvidenceAction,
  breastSharedDecisionAction,
  mammographyScreeningAction,
  mamaBrasilAmpliadoM3DraftPolicy,
  mamaInternationalM3DraftPolicy,
  mamaM3DraftRules,
  mamaM3DraftRuleset,
  mamaSusM3DraftPolicy,
} from "../../src/clinical/mama";

const AS_OF = parseCalendarDate("2026-10-26");

function activePreviewRuleset() {
  const rules = mamaM3DraftRules.map((rule) =>
    RuleDefinitionSchema.parse({
      ...rule,
      lifecycleStatus: "active",
      reviewStatus: "reviewed_by_1",
      governance: {
        ...rule.governance,
        reviews: [
          {
            reviewer: "synthetic-m3-preview-only",
            reviewedAt: AS_OF,
          },
        ],
      },
    }),
  );
  return RulesetSchema.parse({
    ...mamaM3DraftRuleset,
    rulesetVersion: "breast-0.1.0-m3-synthetic-preview",
    rules,
  });
}

const PREVIEW = activePreviewRuleset();

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

function baseFacts(overrides: Record<string, "yes" | "no" | "unknown"> = {}) {
  const concepts = new Set<string>([
    MAMA_IDS.concepts.screeningContextConfirmed,
    MAMA_IDS.concepts.relevantBreastTissuePresent,
    MAMA_IDS.concepts.historySufficientForCurrentStatus,
    ...MAMA_HARD_EXIT_CONCEPTS,
  ]);
  return [...concepts].map((conceptId) =>
    fact(
      conceptId,
      overrides[conceptId] ??
        (conceptId === MAMA_IDS.concepts.screeningContextConfirmed ||
        conceptId === MAMA_IDS.concepts.relevantBreastTissuePresent ||
        conceptId === MAMA_IDS.concepts.historySufficientForCurrentStatus
          ? "yes"
          : "no"),
    ),
  );
}

function mammogram(args: {
  id: string;
  date: string;
  modality?: string;
  result?: string;
}) {
  return {
    id: args.id,
    topicId: MAMA_IDS.topic,
    modality: args.modality ?? MAMA_IDS.modalities.mammographyScreening,
    status: "performed" as const,
    date: parsePartialDate(args.date),
    result: {
      status: "final" as const,
      code: args.result ?? MAMA_IDS.results.routineClearing,
    },
    quality: "adequate" as const,
    completeness: "complete" as const,
    resolutionInformation: "sufficient" as const,
  };
}

function patient(args: {
  age: number;
  history?: "known" | "never_performed" | "unknown";
  exams?: ReturnType<typeof mammogram>[];
  overrides?: Record<string, "yes" | "no" | "unknown">;
}) {
  return PatientSchema.parse({
    context: { ageYears: args.age },
    facts: baseFacts(args.overrides),
    examHistory: args.exams ?? [],
    historyKnowledge: {
      [MAMA_IDS.topic]: args.history ?? "never_performed",
    },
  });
}

function run(policyId: string, p: ReturnType<typeof patient>) {
  return evaluatePatient({
    patient: p,
    ruleset: PREVIEW,
    asOf: AS_OF,
    policyId,
  });
}

function track(
  result: ReturnType<typeof run>,
  trackId: string,
) {
  const topic = result.plan.topics.find((item) => item.topicId === MAMA_IDS.topic);
  if (topic === undefined) throw new Error("Missing Mama topic");
  const found = topic.tracks.find((item) => item.trackId === trackId);
  if (found === undefined) throw new Error(`Missing Mama track ${trackId}`);
  return found;
}

describe("Mama M3 draft translation", () => {
  it("keeps every real M3 rule draft/source_verified with no human review recorded", () => {
    expect(mamaM3DraftRuleset.rulesetVersion).toBe("breast-0.1.0-m3-draft");
    expect(mamaM3DraftRules).toHaveLength(15);
    for (const rule of mamaM3DraftRules) {
      expect(rule.lifecycleStatus).toBe("draft");
      expect(rule.reviewStatus).toBe("source_verified");
      expect(rule.governance.reviews).toEqual([]);
      expect(rule.sourceRefs.length).toBeGreaterThan(0);
    }
  });

  it("SUS age 55 never screened previews as biennial mammography Due", () => {
    const result = run(
      mamaSusM3DraftPolicy.policyId,
      patient({ age: 55, history: "never_performed" }),
    );
    expect(track(result, MAMA_IDS.tracks.routine).state.status).toBe("Due");
    expect(result.plan.actions.map((action) => action.actionId)).toContain(
      mammographyScreeningAction.actionId,
    );
  });

  it("a recent routine-clearing screening mammogram keeps SUS current", () => {
    const result = run(
      mamaSusM3DraftPolicy.policyId,
      patient({
        age: 55,
        history: "known",
        exams: [mammogram({ id: "mammo-recent", date: "2025-11-10" })],
      }),
    );
    expect(track(result, MAMA_IDS.tracks.routine).state.status).toBe("Current");
    expect(result.plan.actions).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ actionId: mammographyScreeningAction.actionId }),
      ]),
    );
  });

  it("the same prior mammogram can be Due in Brasil ampliado and Current in USPSTF", () => {
    const p = patient({
      age: 55,
      history: "known",
      exams: [mammogram({ id: "mammo-2025", date: "2025-06-01" })],
    });
    const ba = run(mamaBrasilAmpliadoM3DraftPolicy.policyId, p);
    const intl = run(mamaInternationalM3DraftPolicy.policyId, p);
    expect(track(ba, MAMA_IDS.tracks.routine).state.status).toBe("Due");
    expect(track(intl, MAMA_IDS.tracks.routine).state.status).toBe("Current");
  });

  it("SUS age 45 remains SharedDecision rather than automatic Due", () => {
    const result = run(
      mamaSusM3DraftPolicy.policyId,
      patient({ age: 45, history: "never_performed" }),
    );
    expect(track(result, MAMA_IDS.tracks.population).state.status).toBe(
      "SharedDecision",
    );
    expect(result.plan.actions.map((action) => action.actionId)).toContain(
      breastSharedDecisionAction.actionId,
    );
    expect(result.plan.actions.map((action) => action.actionId)).not.toContain(
      mammographyScreeningAction.actionId,
    );
  });

  it("Brasil ampliado age 76 remains individualized", () => {
    const result = run(
      mamaBrasilAmpliadoM3DraftPolicy.policyId,
      patient({ age: 76, history: "never_performed" }),
    );
    expect(track(result, MAMA_IDS.tracks.population).state.status).toBe(
      "ClinicalReviewRequired",
    );
    expect(result.plan.actions.map((action) => action.actionId)).toContain(
      breastSharedDecisionAction.actionId,
    );
    expect(result.plan.actions.map((action) => action.actionId)).not.toContain(
      mammographyScreeningAction.actionId,
    );
  });

  it("USPSTF age 76 preserves insufficient evidence and emits no recommendation action", () => {
    const result = run(
      mamaInternationalM3DraftPolicy.policyId,
      patient({ age: 76, history: "never_performed" }),
    );
    expect(track(result, MAMA_IDS.tracks.population).state.status).toBe(
      "ClinicalReviewRequired",
    );
    expect(result.plan.actions.map((action) => action.actionId)).toContain(
      breastInsufficientEvidenceAction.actionId,
    );
    expect(result.plan.actions.map((action) => action.actionId)).not.toContain(
      mammographyScreeningAction.actionId,
    );
  });

  it("known high familial risk exits routine without a risk calculator", () => {
    const result = run(
      mamaInternationalM3DraftPolicy.policyId,
      patient({
        age: 55,
        history: "never_performed",
        overrides: { [MAMA_IDS.concepts.knownHighRiskFamilialContext]: "yes" },
      }),
    );
    expect(track(result, MAMA_IDS.tracks.specialRisk).state.status).toBe(
      "ClinicalReviewRequired",
    );
    expect(track(result, MAMA_IDS.tracks.routine).state.status).toBe(
      "NotApplicable",
    );
  });

  it("an unresolved prior mammography attention state blocks silent return to routine", () => {
    const result = run(
      mamaSusM3DraftPolicy.policyId,
      patient({
        age: 60,
        history: "known",
        exams: [
          mammogram({
            id: "mammo-attention",
            date: "2026-01-10",
            result: MAMA_IDS.results.attentionRequired,
          }),
        ],
        overrides: {
          [MAMA_IDS.concepts.priorMammographyNeedsSpecificAttention]: "yes",
        },
      }),
    );
    expect(track(result, MAMA_IDS.tracks.priorFinding).state.status).toBe(
      "ClinicalReviewRequired",
    );
    expect(track(result, MAMA_IDS.tracks.routine).state.status).toBe(
      "NotApplicable",
    );
  });

  it("diagnostic mammography never anchors the screening interval", () => {
    const result = run(
      mamaInternationalM3DraftPolicy.policyId,
      patient({
        age: 55,
        history: "known",
        exams: [
          mammogram({
            id: "diagnostic-mammo",
            date: "2026-03-10",
            modality: MAMA_IDS.modalities.mammographyDiagnostic,
          }),
        ],
      }),
    );
    expect(track(result, MAMA_IDS.tracks.routine).state.status).toBe(
      "Indeterminate",
    );
  });
});
