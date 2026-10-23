import type { Patient } from "../model/patient";
import { PatientSchema } from "../model/patient";
import type { CalendarDate } from "../model/dates";
import { completedAge, validateHistoricalDate } from "../model/dates";
export function validatePatientSchema(input: unknown): Patient {
  return PatientSchema.parse(input);
}
export function semanticIssues(
  patient: Patient,
  asOf: CalendarDate,
  topicId: string,
): string[] {
  const issues: string[] = [];
  const ids = [...patient.facts, ...patient.examHistory].map((x) => x.id);
  if (new Set(ids).size !== ids.length)
    issues.push("duplicate_patient_event_id");
  const birth = patient.context.birthDate;
  if (birth !== undefined) {
    issues.push(
      ...validateHistoricalDate(birth, asOf).map((s) => `birthDate:${s}`),
    );
    if (
      birth.precision === "day" &&
      issues.length === 0 &&
      patient.context.ageYears !== undefined &&
      completedAge(
        { year: birth.year, month: birth.month, day: birth.day },
        asOf,
      ) !== patient.context.ageYears
    )
      issues.push("age_birth_date_mismatch");
  }
  for (const f of patient.facts.filter((f) => f.topicId === topicId))
    if (f.effectiveDate !== undefined)
      issues.push(
        ...validateHistoricalDate(f.effectiveDate, asOf, birth).map(
          (s) => `${f.id}:${s}`,
        ),
      );
  const events = patient.examHistory.filter((e) => e.topicId === topicId);
  for (const e of events)
    if (e.status === "performed" && e.date !== undefined)
      issues.push(
        ...validateHistoricalDate(e.date, asOf, birth).map(
          (s) => `${e.id}:${s}`,
        ),
      );
  if (
    patient.historyKnowledge[topicId] === "never_performed" &&
    events.some((e) => e.status === "performed")
  )
    issues.push("contradictory_history_knowledge");
  // No clinical recency rule exists yet to resolve contradictory observations of one concept.
  const groups = new Map<string, Set<string>>();
  for (const f of patient.facts.filter((f) => f.topicId === topicId)) {
    const values = groups.get(f.conceptId) ?? new Set<string>();
    values.add(JSON.stringify([f.presence, "value" in f ? f.value : null]));
    groups.set(f.conceptId, values);
  }
  for (const [concept, values] of groups)
    if (values.size > 1) issues.push(`contradictory_facts:${concept}`);
  return [...new Set(issues)].sort();
}
