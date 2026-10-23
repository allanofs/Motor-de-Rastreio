import type { ExamRecord, Patient } from "../model/patient";
import type { QualifyingEventSpec } from "../model/content";
import { temporalRelation } from "../model/dates";
export type DomainHistory = {
  knowledge: "known" | "never_performed" | "unknown" | "not_asked";
  events: ExamRecord[];
};
export function resolveDomainHistory(
  patient: Patient,
  topicId: string,
): DomainHistory {
  return {
    knowledge: patient.historyKnowledge[topicId] ?? "not_asked",
    events: patient.examHistory.filter((e) => e.topicId === topicId),
  };
}
export function qualifyingEvents(
  events: ExamRecord[],
  spec: QualifyingEventSpec,
): ExamRecord[] {
  return events.filter(
    (e) =>
      e.status === "performed" &&
      e.modality === spec.modality &&
      e.result.status === "final" &&
      spec.resultCodes.includes(e.result.code) &&
      (!spec.requireAdequateQuality || e.quality === "adequate") &&
      (!spec.requireComplete || e.completeness === "complete") &&
      (!spec.requireSufficientResolution ||
        e.resolutionInformation === "sufficient"),
  );
}
/** A strict later date is required. Same-day and overlapping dates cannot establish sequence. */
export function isCertainlyAfter(
  candidate: ExamRecord,
  trigger: ExamRecord,
): boolean {
  return (
    candidate.status === "performed" &&
    trigger.status === "performed" &&
    candidate.date !== undefined &&
    trigger.date !== undefined &&
    temporalRelation(candidate.date, trigger.date) === "after"
  );
}
