import { ccrCandidateRuleset } from "../../clinical/ccr";
import type { Source, SourceRef } from "../../model/content";
import type { CalendarDate } from "../../model/dates";
import type { ClinicalFact, ExamRecord } from "../../model/patient";
import type { TrackEvaluation } from "../../model/evaluation";
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
  evaluateCcrProductDraft,
  normalizeCcrProductDraft,
  type CcrNormalizedProductInput,
} from "./form";
import type { CcrProductSuccess } from "./integration";
import { presentCcrProduct } from "./presentation";
import type { CcrAutomationBoundaryCode } from "./automationBoundary";

export const CCR_REPORT_CONTRACT_VERSION = "report-r0.1" as const;

export type CcrReportSourceReference = ReportSourceReference;
export type CcrReportResolvedSource = ReportResolvedSource;
export type CcrReportUnresolvedSource = ReportUnresolvedSource;
export type CcrReportProvenance = ReportProvenance;

export type CcrReportInputSnapshot = {
  ageYears?: number;
  factsUsed: ClinicalFact[];
  records: Array<{
    record: ExamRecord;
    used: boolean;
  }>;
  historyKnowledge: CcrNormalizedProductInput["patient"]["historyKnowledge"];
  careSettingResources: CcrNormalizedProductInput["careSetting"]["resources"];
};

export type CcrReportPrimaryAction = ReportPrimaryAction;
export type CcrReportRationale = ReportRationale<TrackEvaluation["state"]["status"]>;

export type CcrReportModel = StructuredReportModel<
  typeof CCR_REPORT_CONTRACT_VERSION,
  CcrProductSuccess["releaseGate"],
  CcrProductSuccess["policy"],
  CcrAutomationBoundaryCode,
  TrackEvaluation["state"]["status"],
  CcrReportInputSnapshot
>;

export type CcrReportBuildFailure = {
  ok: false;
  code:
    | "invalid_input"
    | "pending_input"
    | "incomplete_evaluation"
    | "evaluation_input_mismatch";
  message: string;
};

export type CcrReportBuildResult =
  | { ok: true; report: CcrReportModel }
  | CcrReportBuildFailure;

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function triggerTracks(result: CcrProductSuccess): TrackEvaluation[] {
  const boundary = presentCcrProduct(result).automationBoundary;
  const triggerIds = new Set(boundary.triggerTrackIds);
  return result.evaluation.plan.topics
    .flatMap((topic) => topic.tracks)
    .filter((track) => triggerIds.has(track.trackId));
}

function evaluationFingerprint(result: CcrProductSuccess): string {
  return JSON.stringify({
    rulesetVersion: result.rulesetVersion,
    policyId: result.policy.policyId,
    plan: result.evaluation.plan,
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

export function resolveCcrReportProvenance(
  sourceRefs: SourceRef[],
  sourceCatalog: Source[] = ccrCandidateRuleset.sources,
): CcrReportProvenance {
  return resolveReportProvenance(sourceRefs, sourceCatalog);
}

function usedInputSnapshot(
  normalized: CcrNormalizedProductInput,
  tracks: TrackEvaluation[],
): CcrReportInputSnapshot {
  const factsUsed = new Set(tracks.flatMap((track) => track.trace.factsUsed));
  const recordsUsed = new Set(tracks.flatMap((track) => track.trace.recordsUsed));
  const recordsConsidered = new Set(
    tracks.flatMap((track) => track.trace.recordsConsidered),
  );
  const operationalResourceIds = new Set(
    tracks.flatMap((track) =>
      track.actions
        .filter((action) => action.operational !== undefined && action.resourceId !== undefined)
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
  result: CcrProductSuccess,
  tracks: TrackEvaluation[],
): CcrReportPrimaryAction[] {
  const model = presentCcrProduct(result);
  if (!["ROUTINE_DUE", "SHARED_DECISION"].includes(model.automationBoundary.code))
    return [];

  const triggerIds = new Set(tracks.map((track) => track.trackId));
  const seen = new Set<string>();
  const actions: CcrReportPrimaryAction[] = [];

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
  result: CcrProductSuccess,
  tracks: TrackEvaluation[],
): CcrReportRationale[] {
  const model = presentCcrProduct(result);
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
      summary: card?.summary ?? "Conclusão determinada pelo track governado.",
      activatedRuleIds: unique(track.trace.rulesActivated),
      guardrails: [...track.guardrails],
    };
  });
}

function unresolvedInformation(tracks: TrackEvaluation[]): string[] {
  return unique(tracks.flatMap((track) => track.missingData));
}

function traceAsOf(tracks: TrackEvaluation[]): CalendarDate | undefined {
  return tracks[0]?.trace.asOf;
}

export function buildCcrReportModel(
  draft: unknown,
  evaluated: CcrProductSuccess,
): CcrReportBuildResult {
  const normalizedResult = normalizeCcrProductDraft(draft);
  if (!normalizedResult.ok)
    return {
      ok: false,
      code: "invalid_input",
      message: normalizedResult.issues.join("; "),
    };

  const recalculated = evaluateCcrProductDraft(draft);
  if (!recalculated.ok)
    return {
      ok: false,
      code: "evaluation_input_mismatch",
      message:
        "Os dados atuais não reproduzem com segurança a avaliação fornecida para o relatório.",
    };

  const presentation = presentCcrProduct(recalculated);
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

  const tracks = triggerTracks(recalculated);
  const asOf = traceAsOf(tracks);
  if (
    normalizedResult.value.policyId !== recalculated.policy.policyId ||
    asOf === undefined ||
    !sameCalendarDate(normalizedResult.value.asOf, asOf)
  )
    return {
      ok: false,
      code: "evaluation_input_mismatch",
      message:
        "Os dados fornecidos para o relatório não correspondem à avaliação calculada.",
    };

  const sourceRefs = tracks.flatMap((track) => track.trace.sourceRefs);

  return {
    ok: true,
    report: {
      contractVersion: CCR_REPORT_CONTRACT_VERSION,
      releaseGate: recalculated.releaseGate,
      rulesetVersion: recalculated.rulesetVersion,
      policy: recalculated.policy,
      asOf: calendarDateKey(asOf),
      boundary: {
        code: presentation.automationBoundary.code,
        triggerTrackIds: [...presentation.automationBoundary.triggerTrackIds],
      },
      rationale: rationaleFor(recalculated, tracks),
      inputs: usedInputSnapshot(normalizedResult.value, tracks),
      primaryActions: primaryActions(recalculated, tracks),
      unresolvedInformation: unresolvedInformation(tracks),
      provenance: resolveCcrReportProvenance(sourceRefs),
    },
  };
}
