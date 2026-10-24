import {
  dueWindow,
  scheduleStatus,
  temporalRelation,
  type CalendarDate,
} from "../../../model/dates";
import type { ExamRecord } from "../../../model/patient";
import { CCR_IDS } from "../terminology";

export type FitEpisodeStatus =
  | "open"
  | "ambiguous"
  | "resolved"
  | "pending_result"
  | "specialized";

export type FitEpisode = {
  triggerId: string;
  status: FitEpisodeStatus;
  evidenceRecordIds: string[];
  resolutionColonoscopyId?: string;
};

export type FitHistoryAnalysis = {
  episodes: FitEpisode[];
  pendingFitIds: string[];
  invalidFitIds: string[];
  resolvedPairs: { triggerId: string; colonoscopyId: string }[];
};

function performed(events: readonly ExamRecord[]): Extract<ExamRecord, { status: "performed" }>[] {
  return events.filter(
    (event): event is Extract<ExamRecord, { status: "performed" }> =>
      event.status === "performed",
  );
}

function positiveFits(events: readonly ExamRecord[]) {
  return performed(events).filter(
    (event) =>
      event.modality === CCR_IDS.modalities.fit &&
      event.result.status === "final" &&
      event.result.code === CCR_IDS.results.fitPositive,
  );
}

function diagnosticColonoscopies(events: readonly ExamRecord[]) {
  return performed(events).filter(
    (event) => event.modality === CCR_IDS.modalities.colonoscopyDiagnostic,
  );
}

function isHighQualityNormal(
  event: Extract<ExamRecord, { status: "performed" }>,
): boolean {
  return (
    event.result.status === "final" &&
    event.result.code === CCR_IDS.results.colonoscopyNormal &&
    event.quality === "adequate" &&
    event.completeness === "complete" &&
    event.resolutionInformation === "sufficient"
  );
}

function isFinalAbnormal(
  event: Extract<ExamRecord, { status: "performed" }>,
): boolean {
  return (
    event.result.status === "final" &&
    event.result.code !== CCR_IDS.results.colonoscopyNormal
  );
}

function relation(
  candidate: Extract<ExamRecord, { status: "performed" }>,
  trigger: Extract<ExamRecord, { status: "performed" }>,
): "before" | "after" | "same_day" | "overlap" | "unknown" {
  if (candidate.date === undefined || trigger.date === undefined) return "unknown";
  return temporalRelation(candidate.date, trigger.date);
}

function pickLatest(
  events: Extract<ExamRecord, { status: "performed" }>[],
): Extract<ExamRecord, { status: "performed" }> | undefined {
  const candidates = events.filter((event) =>
    events.every((other) => {
      if (event.id === other.id) return true;
      const rel = relation(event, other);
      return rel === "after" || rel === "same_day";
    }),
  );
  return candidates.sort((a, b) => a.id.localeCompare(b.id, "en"))[0];
}

export function analyzeFitHistory(events: readonly ExamRecord[]): FitHistoryAnalysis {
  const positives = positiveFits(events);
  const colonoscopies = diagnosticColonoscopies(events);

  const episodes = positives.map<FitEpisode>((trigger) => {
    const after = colonoscopies.filter(
      (candidate) => relation(candidate, trigger) === "after",
    );
    const ambiguous = colonoscopies.filter((candidate) =>
      ["same_day", "overlap", "unknown"].includes(relation(candidate, trigger)),
    );

    const abnormal = after.find(isFinalAbnormal);
    if (abnormal !== undefined)
      return {
        triggerId: trigger.id,
        status: "specialized",
        evidenceRecordIds: [trigger.id, abnormal.id],
      };

    const resolved = pickLatest(after.filter(isHighQualityNormal));
    if (resolved !== undefined)
      return {
        triggerId: trigger.id,
        status: "resolved",
        evidenceRecordIds: [trigger.id, resolved.id],
        resolutionColonoscopyId: resolved.id,
      };

    const pending = after.find((candidate) => candidate.result.status === "pending");
    if (pending !== undefined)
      return {
        triggerId: trigger.id,
        status: "pending_result",
        evidenceRecordIds: [trigger.id, pending.id],
      };

    if (ambiguous.length > 0)
      return {
        triggerId: trigger.id,
        status: "ambiguous",
        evidenceRecordIds: [trigger.id, ...ambiguous.map((event) => event.id)].sort(),
      };

    return {
      triggerId: trigger.id,
      status: "open",
      evidenceRecordIds: [
        trigger.id,
        ...after.map((event) => event.id),
      ].sort(),
    };
  });

  const pendingFitIds = performed(events)
    .filter(
      (event) =>
        event.modality === CCR_IDS.modalities.fit && event.result.status === "pending",
    )
    .map((event) => event.id)
    .sort();

  const invalidFitIds = performed(events)
    .filter(
      (event) =>
        event.modality === CCR_IDS.modalities.fit &&
        ["invalid", "unknown"].includes(event.result.status),
    )
    .map((event) => event.id)
    .sort();

  return {
    episodes,
    pendingFitIds,
    invalidFitIds,
    resolvedPairs: episodes.flatMap((episode) =>
      episode.status === "resolved" && episode.resolutionColonoscopyId !== undefined
        ? [
            {
              triggerId: episode.triggerId,
              colonoscopyId: episode.resolutionColonoscopyId,
            },
          ]
        : [],
    ),
  };
}

export function fitEpisodeEvidence(analysis: FitHistoryAnalysis): string[] {
  return [
    ...new Set([
      ...analysis.episodes.flatMap((episode) => episode.evidenceRecordIds),
      ...analysis.pendingFitIds,
      ...analysis.invalidFitIds,
    ]),
  ].sort();
}

export function resolutionTraceGuardrails(analysis: FitHistoryAnalysis): string[] {
  return analysis.resolvedPairs
    .map(
      (pair) =>
        `resolved_fit_trigger:${pair.triggerId}:by_colonoscopy:${pair.colonoscopyId}`,
    )
    .sort();
}

export function postFitNormalCoverage(
  events: readonly ExamRecord[],
  asOf: CalendarDate,
): {
  status: "none" | "Current" | "Due" | "Indeterminate";
  anchorEventId?: string;
  evidenceRecordIds: string[];
} {
  const analysis = analyzeFitHistory(events);
  const colonoscopyIds = [...new Set(analysis.resolvedPairs.map((pair) => pair.colonoscopyId))];
  if (colonoscopyIds.length === 0)
    return { status: "none", evidenceRecordIds: [] };

  const candidates = performed(events).filter((event) =>
    colonoscopyIds.includes(event.id),
  );
  const anchor = pickLatest(candidates);
  if (anchor === undefined || anchor.date === undefined)
    return {
      status: "Indeterminate",
      evidenceRecordIds: colonoscopyIds.sort(),
    };

  return {
    status: scheduleStatus(
      dueWindow(anchor.date, { unit: "years", amount: 10 }),
      asOf,
    ),
    anchorEventId: anchor.id,
    evidenceRecordIds: [anchor.id],
  };
}
