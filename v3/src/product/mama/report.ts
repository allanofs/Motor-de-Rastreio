import {
  mamaCandidateRuleset,
  type MamaDecisionContext,
} from "../../clinical/mama";
import type { Source, SourceRef } from "../../model/content";
import type { CalendarDate } from "../../model/dates";
import type { TrackEvaluation } from "../../model/evaluation";
import type { ClinicalFact, ExamRecord } from "../../model/patient";
import {
  assessReportExportEligibility,
  resolveReportProvenance,
  type ReportPrimaryAction,
  type ReportProvenance,
  type ReportRationale,
  type ReportResolvedSource,
  type ReportSourceReference,
  type ReportUnresolvedSource,
  type StructuredReportModel,
} from "../reporting";
import {
  evaluateMamaProductDraft,
  normalizeMamaProductDraft,
  type MamaNormalizedProductInput,
} from "./acquisition";
import type {
  MamaAutomationBoundary,
  MamaAutomationBoundaryCode,
  MamaAutomationBoundaryReasonCode,
} from "./automationBoundary";
import type { MamaProductSuccess } from "./integration";
import { presentMamaProduct } from "./presentation";

export const MAMA_REPORT_CONTRACT_VERSION = "mama-report-r0.1" as const;

export type MamaReportSourceReference = ReportSourceReference;
export type MamaReportResolvedSource = ReportResolvedSource;
export type MamaReportUnresolvedSource = ReportUnresolvedSource;
export type MamaReportProvenance = ReportProvenance;

export type MamaReportInputSnapshot = {
  ageYears?: number;
  factsUsed: ClinicalFact[];
  records: Array<{
    record: ExamRecord;
    used: boolean;
  }>;
  historyKnowledge: MamaNormalizedProductInput["patient"]["historyKnowledge"];
  careSettingResources: MamaNormalizedProductInput["careSetting"]["resources"];
};

export type MamaReportPrimaryAction = ReportPrimaryAction;
export type MamaReportRationale = ReportRationale<TrackEvaluation["state"]["status"]>;

export type MamaReportDecisionContext = {
  version: MamaDecisionContext["version"];
  policyFamily: MamaDecisionContext["policyFamily"];
  ageYears: number;
  routineScopeDisposition: "applied";
  conclusion: NonNullable<MamaDecisionContext["routineScope"]>["conclusion"];
  rationale: string;
  guardrails: string[];
  safetyTrackIds: string[];
};

type MamaStructuredReportBase = StructuredReportModel<
  typeof MAMA_REPORT_CONTRACT_VERSION,
  MamaProductSuccess["releaseGate"],
  MamaProductSuccess["policy"],
  MamaAutomationBoundaryCode,
  TrackEvaluation["state"]["status"],
  MamaReportInputSnapshot
>;

export type MamaReportModel = Omit<MamaStructuredReportBase, "boundary"> & {
  boundary: MamaStructuredReportBase["boundary"] & {
    provenanceCarrier: MamaAutomationBoundary["provenanceCarrier"];
    reasonCode?: MamaAutomationBoundaryReasonCode;
  };
  decisionContext?: MamaReportDecisionContext;
};

export type MamaReportBuildFailure = {
  ok: false;
  code:
    | "invalid_input"
    | "pending_input"
    | "incomplete_evaluation"
    | "evaluation_input_mismatch"
    | "missing_provenance_carrier";
  message: string;
};

export type MamaReportBuildResult =
  | { ok: true; report: MamaReportModel }
  | MamaReportBuildFailure;

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function allTracks(result: MamaProductSuccess): TrackEvaluation[] {
  return result.evaluation.plan.topics.flatMap((topic) => topic.tracks);
}

function tracksById(
  result: MamaProductSuccess,
  trackIds: readonly string[],
): TrackEvaluation[] {
  const ids = new Set(trackIds);
  return allTracks(result).filter((track) => ids.has(track.trackId));
}

function determinationTracks(
  result: MamaProductSuccess,
  boundary: MamaAutomationBoundary,
): TrackEvaluation[] {
  if (boundary.provenanceCarrier === "decision_context") {
    return result.decisionContext === null
      ? []
      : tracksById(result, result.decisionContext.safetyTrackIds);
  }
  return tracksById(result, boundary.triggerTrackIds);
}

function evaluationFingerprint(result: MamaProductSuccess): string {
  const presentation = presentMamaProduct(result);
  return JSON.stringify({
    rulesetVersion: result.rulesetVersion,
    policyId: result.policy.policyId,
    plan: result.evaluation.plan,
    decisionContext: result.decisionContext,
    boundary: presentation.automationBoundary,
  });
}

function calendarDateKey(date: CalendarDate): string {
  const year = String(date.year).padStart(4, "0");
  const month = String(date.month).padStart(2, "0");
  const day = String(date.day).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function sameCalendarDate(a: CalendarDate, b: CalendarDate): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

export function resolveMamaReportProvenance(
  sourceRefs: SourceRef[],
  sourceCatalog: Source[] = mamaCandidateRuleset.sources,
): MamaReportProvenance {
  return resolveReportProvenance(sourceRefs, sourceCatalog);
}

function provenanceRefs(
  result: MamaProductSuccess,
  boundary: MamaAutomationBoundary,
  tracks: TrackEvaluation[],
): SourceRef[] | null {
  if (boundary.provenanceCarrier === "decision_context") {
    if (
      result.decisionContext === null ||
      result.decisionContext.routineScopeDisposition !== "applied" ||
      result.decisionContext.routineScope === null
    )
      return null;
    return [...result.decisionContext.additionalSourceRefs];
  }

  if (boundary.provenanceCarrier === "track_trace")
    return tracks.flatMap((track) => track.trace.sourceRefs);

  return [];
}

function usedInputSnapshot(
  normalized: MamaNormalizedProductInput,
  tracks: TrackEvaluation[],
): MamaReportInputSnapshot {
  const factsUsed = new Set(tracks.flatMap((track) => track.trace.factsUsed));
  const recordsUsed = new Set(tracks.flatMap((track) => track.trace.recordsUsed));
  const recordsConsidered = new Set(
    tracks.flatMap((track) => track.trace.recordsConsidered),
  );
  const operationalResourceIds = new Set(
    tracks.flatMap((track) =>
      track.actions
        .filter(
          (action) =>
            action.operational !== undefined && action.resourceId !== undefined,
        )
        .map((action) => action.resourceId!),
    ),
  );

  const facts = normalized.patient.facts.filter(
    (fact) => factsUsed.has(fact.id) || factsUsed.has(fact.conceptId),
  );

  const records = normalized.patient.examHistory
    .filter(
      (record) => recordsConsidered.has(record.id) || recordsUsed.has(record.id),
    )
    .map((record) => ({ record, used: recordsUsed.has(record.id) }));

  const careSettingResources = Object.fromEntries(
    Object.entries(normalized.careSetting.resources).filter(([resourceId]) =>
      operationalResourceIds.has(resourceId),
    ),
  );

  return {
    ...(normalized.patient.context.ageYears === undefined
      ? {}
      : { ageYears: normalized.patient.context.ageYears }),
    factsUsed: facts,
    records,
    historyKnowledge: { ...normalized.patient.historyKnowledge },
    careSettingResources,
  };
}

function primaryActions(
  result: MamaProductSuccess,
): MamaReportPrimaryAction[] {
  const model = presentMamaProduct(result);
  if (!["ROUTINE_DUE", "SHARED_DECISION"].includes(model.automationBoundary.code))
    return [];

  const triggerIds = new Set(model.automationBoundary.triggerTrackIds);
  const seen = new Set<string>();
  const actions: MamaReportPrimaryAction[] = [];

  for (const action of model.sections.flatMap((section) =>
    section.cards
      .filter((card) => triggerIds.has(card.trackId))
      .flatMap((card) => card.actions),
  )) {
    const key = JSON.stringify([
      action.actionId,
      action.text,
      action.resourceId ?? null,
      action.operational ?? null,
    ]);
    if (seen.has(key)) continue;
    seen.add(key);
    actions.push({ ...action });
  }

  return actions;
}

function rationaleFor(
  result: MamaProductSuccess,
  tracks: TrackEvaluation[],
): MamaReportRationale[] {
  const model = presentMamaProduct(result);
  const cards = new Map(
    model.sections
      .flatMap((section) => section.cards)
      .map((card) => [card.trackId, card] as const),
  );

  return tracks.map((track) => {
    const card = cards.get(track.trackId);
    return {
      trackId: track.trackId,
      trackLabel: card?.trackLabel ?? track.trackId,
      status: track.state.status,
      summary: card?.summary ?? "Conclusão determinada pelo caminho governado.",
      activatedRuleIds: unique(track.trace.rulesActivated),
      guardrails: [...track.guardrails],
    };
  });
}

function unresolvedInformation(tracks: TrackEvaluation[]): string[] {
  return unique(tracks.flatMap((track) => track.missingData));
}

function reportDecisionContext(
  context: MamaDecisionContext | null,
): MamaReportDecisionContext | undefined {
  if (
    context === null ||
    context.routineScopeDisposition !== "applied" ||
    context.routineScope === null
  )
    return undefined;

  return {
    version: context.version,
    policyFamily: context.policyFamily,
    ageYears: context.ageYears,
    routineScopeDisposition: "applied",
    conclusion: context.routineScope.conclusion,
    rationale: context.routineScope.rationale,
    guardrails: [...context.routineScope.guardrails],
    safetyTrackIds: [...context.safetyTrackIds],
  };
}

export function buildMamaReportModel(
  draft: unknown,
  evaluated: MamaProductSuccess,
): MamaReportBuildResult {
  const normalizedResult = normalizeMamaProductDraft(draft);
  if (!normalizedResult.ok)
    return {
      ok: false,
      code: "invalid_input",
      message: normalizedResult.issues.join("; "),
    };

  const recalculated = evaluateMamaProductDraft(draft);
  if (!recalculated.ok)
    return {
      ok: false,
      code: "evaluation_input_mismatch",
      message:
        "Os dados atuais não reproduzem com segurança a avaliação fornecida para o relatório.",
    };

  const presentation = presentMamaProduct(recalculated);
  const exportEligibility = assessReportExportEligibility({
    requestedInputCount: presentation.requestedInputs.length,
    boundaryCode: presentation.automationBoundary.code,
    incompleteBoundaryCodes: ["MORE_INFORMATION_NEEDED"],
  });

  if (!exportEligibility.ok) {
    if (exportEligibility.code === "pending_input")
      return {
        ok: false,
        code: "pending_input",
        message:
          "A avaliação ainda solicita informação humana ou operacional antes de permitir exportação.",
      };
    return {
      ok: false,
      code: "incomplete_evaluation",
      message:
        "A avaliação ainda depende de informação clínica para chegar a uma conclusão exportável.",
    };
  }

  if (evaluationFingerprint(recalculated) !== evaluationFingerprint(evaluated))
    return {
      ok: false,
      code: "evaluation_input_mismatch",
      message:
        "Os dados atuais não reproduzem a avaliação que originou este relatório.",
    };

  if (normalizedResult.value.policyId !== recalculated.policy.policyId)
    return {
      ok: false,
      code: "evaluation_input_mismatch",
      message:
        "O referencial fornecido para o relatório não corresponde à avaliação calculada.",
    };

  const boundary = presentation.automationBoundary;
  const tracks = determinationTracks(recalculated, boundary);

  for (const track of tracks) {
    if (!sameCalendarDate(track.trace.asOf, normalizedResult.value.asOf))
      return {
        ok: false,
        code: "evaluation_input_mismatch",
        message:
          "A data de referência dos caminhos determinantes não corresponde aos dados atuais.",
      };
  }

  const refs = provenanceRefs(recalculated, boundary, tracks);
  if (refs === null)
    return {
      ok: false,
      code: "missing_provenance_carrier",
      message:
        "A conclusão exige provenance do contexto de decisão, mas o carrier revisado não está disponível.",
    };

  const decisionContext =
    boundary.provenanceCarrier === "decision_context"
      ? reportDecisionContext(recalculated.decisionContext)
      : undefined;
  if (
    boundary.provenanceCarrier === "decision_context" &&
    decisionContext === undefined
  )
    return {
      ok: false,
      code: "missing_provenance_carrier",
      message:
        "A conclusão por contexto de decisão não possui snapshot de provenance exportável.",
    };

  return {
    ok: true,
    report: {
      contractVersion: MAMA_REPORT_CONTRACT_VERSION,
      releaseGate: recalculated.releaseGate,
      rulesetVersion: recalculated.rulesetVersion,
      policy: recalculated.policy,
      asOf: calendarDateKey(normalizedResult.value.asOf),
      boundary: {
        code: boundary.code,
        triggerTrackIds: [...boundary.triggerTrackIds],
        provenanceCarrier: boundary.provenanceCarrier,
        ...(boundary.reasonCode === undefined
          ? {}
          : { reasonCode: boundary.reasonCode }),
      },
      rationale: rationaleFor(recalculated, tracks),
      inputs: usedInputSnapshot(normalizedResult.value, tracks),
      primaryActions: primaryActions(recalculated),
      unresolvedInformation: unresolvedInformation(tracks),
      provenance: resolveMamaReportProvenance(refs),
      ...(decisionContext === undefined ? {} : { decisionContext }),
    },
  };
}
