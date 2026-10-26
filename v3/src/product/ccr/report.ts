import { ccrCandidateRuleset } from "../../clinical/ccr";
import type { Source, SourceRef } from "../../model/content";
import type { CalendarDate } from "../../model/dates";
import type { ClinicalFact, ExamRecord } from "../../model/patient";
import type { TrackEvaluation } from "../../model/evaluation";
import {
  normalizeCcrProductDraft,
  type CcrNormalizedProductInput,
} from "./form";
import type { CcrProductSuccess } from "./integration";
import { presentCcrProduct } from "./presentation";
import type { CcrAutomationBoundaryCode } from "./automationBoundary";

export const CCR_REPORT_CONTRACT_VERSION = "report-r0.1" as const;

export type CcrReportSourceReference = {
  locator: string;
  evidence?: SourceRef["evidence"];
};

export type CcrReportResolvedSource = {
  sourceId: string;
  institution: string;
  documentTitle: string;
  publicationYear: number;
  version: string;
  jurisdiction: string;
  url: string;
  references: CcrReportSourceReference[];
};

export type CcrReportUnresolvedSource = {
  sourceId: string;
  locator: string;
  reason: "source_not_found_in_governed_catalog";
};

export type CcrReportProvenance = {
  status: "complete" | "incomplete";
  sources: CcrReportResolvedSource[];
  unresolved: CcrReportUnresolvedSource[];
};

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

export type CcrReportPrimaryAction = {
  actionId: string;
  kind: string;
  text: string;
  resourceId?: string;
  operational?: {
    availability: "available" | "unavailable" | "unknown";
    route: "local" | "referral" | "clinical_review" | "clarify_availability";
    routeLabel: string;
  };
};

export type CcrReportModel = {
  contractVersion: typeof CCR_REPORT_CONTRACT_VERSION;
  releaseGate: CcrProductSuccess["releaseGate"];
  rulesetVersion: string;
  policy: CcrProductSuccess["policy"];
  asOf: string;
  boundary: {
    code: CcrAutomationBoundaryCode;
    triggerTrackIds: string[];
  };
  inputs: CcrReportInputSnapshot;
  primaryActions: CcrReportPrimaryAction[];
  unresolvedInformation: string[];
  provenance: CcrReportProvenance;
};

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

function sourceRefKey(ref: SourceRef): string {
  return JSON.stringify([ref.sourceId, ref.locator, ref.evidence ?? null]);
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
  const catalog = new Map(sourceCatalog.map((source) => [source.sourceId, source]));
  const grouped = new Map<string, { source: Source; refs: SourceRef[] }>();
  const unresolved: CcrReportUnresolvedSource[] = [];
  const seenRefs = new Set<string>();

  for (const ref of sourceRefs) {
    const key = sourceRefKey(ref);
    if (seenRefs.has(key)) continue;
    seenRefs.add(key);

    const source = catalog.get(ref.sourceId);
    if (source === undefined) {
      unresolved.push({
        sourceId: ref.sourceId,
        locator: ref.locator,
        reason: "source_not_found_in_governed_catalog",
      });
      continue;
    }

    const current = grouped.get(source.sourceId);
    if (current === undefined) grouped.set(source.sourceId, { source, refs: [ref] });
    else current.refs.push(ref);
  }

  const sources = [...grouped.values()].map(({ source, refs }) => ({
    sourceId: source.sourceId,
    institution: source.institution,
    documentTitle: source.documentTitle,
    publicationYear: source.publicationYear,
    version: source.version,
    jurisdiction: source.jurisdiction,
    url: source.url,
    references: refs.map((ref) => ({
      locator: ref.locator,
      ...(ref.evidence === undefined ? {} : { evidence: ref.evidence }),
    })),
  }));

  return {
    status: unresolved.length === 0 ? "complete" : "incomplete",
    sources,
    unresolved,
  };
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

function primaryActions(result: CcrProductSuccess): CcrReportPrimaryAction[] {
  const model = presentCcrProduct(result);
  if (!["ROUTINE_DUE", "SHARED_DECISION"].includes(model.automationBoundary.code))
    return [];

  const seen = new Set<string>();
  const actions: CcrReportPrimaryAction[] = [];

  for (const action of model.sections.flatMap((section) =>
    section.cards.flatMap((card) => card.actions),
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

  const presentation = presentCcrProduct(evaluated);
  if (presentation.requestedInputs.length > 0)
    return {
      ok: false,
      code: "pending_input",
      message:
        "A avaliação ainda solicita informação humana ou operacional antes de permitir exportação.",
    };
  if (presentation.automationBoundary.code === "MORE_INFORMATION_NEEDED")
    return {
      ok: false,
      code: "incomplete_evaluation",
      message:
        "A avaliação ainda depende de informação clínica para chegar a uma conclusão exportável.",
    };

  const tracks = triggerTracks(evaluated);
  const asOf = traceAsOf(tracks);
  if (
    normalizedResult.value.policyId !== evaluated.policy.policyId ||
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
      releaseGate: evaluated.releaseGate,
      rulesetVersion: evaluated.rulesetVersion,
      policy: evaluated.policy,
      asOf: calendarDateKey(asOf),
      boundary: {
        code: presentation.automationBoundary.code,
        triggerTrackIds: [...presentation.automationBoundary.triggerTrackIds],
      },
      inputs: usedInputSnapshot(normalizedResult.value, tracks),
      primaryActions: primaryActions(evaluated),
      unresolvedInformation: unresolvedInformation(tracks),
      provenance: resolveCcrReportProvenance(sourceRefs),
    },
  };
}
