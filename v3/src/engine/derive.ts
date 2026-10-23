import type { Patient } from "../model/patient";
import { completedAge, compareDates, toDateInterval } from "../model/dates";
import type { CalendarDate, PartialCalendarDate } from "../model/dates";
function compareEvents(
  a: { id: string },
  b: { id: string },
  dateA: PartialCalendarDate | undefined,
  dateB: PartialCalendarDate | undefined,
): number {
  if (dateA !== undefined && dateB !== undefined) {
    const x = toDateInterval(dateA),
      y = toDateInterval(dateB);
    return (
      compareDates(x.minDate, y.minDate) ||
      compareDates(x.maxDate, y.maxDate) ||
      a.id.localeCompare(b.id, "en")
    );
  }
  if (dateA !== undefined) return -1;
  if (dateB !== undefined) return 1;
  return a.id.localeCompare(b.id, "en");
}
export function normalizePatient(patient: Patient): Patient {
  return {
    ...patient,
    context: { ...patient.context },
    facts: [...patient.facts].sort((a, b) =>
      compareEvents(a, b, a.effectiveDate, b.effectiveDate),
    ),
    examHistory: [...patient.examHistory].sort((a, b) =>
      compareEvents(
        a,
        b,
        a.status === "performed" ? a.date : undefined,
        b.status === "performed" ? b.date : undefined,
      ),
    ),
  };
}
export function deriveContext(patient: Patient, asOf: CalendarDate): Patient {
  const birth = patient.context.birthDate;
  if (patient.context.ageYears === undefined && birth?.precision === "day")
    return {
      ...patient,
      context: {
        ...patient.context,
        ageYears: completedAge(
          { year: birth.year, month: birth.month, day: birth.day },
          asOf,
        ),
      },
    };
  return patient;
}
