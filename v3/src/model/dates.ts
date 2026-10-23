import { z } from "zod";

const year = z.number().int().min(1).max(9999);
export function isLeapYear(y: number): boolean {
  return y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
}
export function daysInMonth(y: number, m: number): number {
  if (
    !Number.isInteger(y) ||
    y < 1 ||
    y > 9999 ||
    !Number.isInteger(m) ||
    m < 1 ||
    m > 12
  )
    throw new Error("Invalid calendar year or month");
  if (m === 2) return isLeapYear(y) ? 29 : 28;
  return [4, 6, 9, 11].includes(m) ? 30 : 31;
}
const dayShape = {
  year,
  month: z.number().int().min(1).max(12),
  day: z.number().int().min(1).max(31),
};
export const CalendarDateSchema = z
  .strictObject(dayShape)
  .refine((d) => d.day <= daysInMonth(d.year, d.month), "Invalid calendar day");
export type CalendarDate = z.infer<typeof CalendarDateSchema>;
export const PartialCalendarDateSchema = z.discriminatedUnion("precision", [
  z.strictObject({ precision: z.literal("year"), year }),
  z.strictObject({
    precision: z.literal("month"),
    year,
    month: dayShape.month,
  }),
  z
    .strictObject({ precision: z.literal("day"), ...dayShape })
    .refine(
      (d) => d.day <= daysInMonth(d.year, d.month),
      "Invalid calendar day",
    ),
]);
export type PartialCalendarDate = z.infer<typeof PartialCalendarDateSchema>;
export const DateIntervalSchema = z
  .strictObject({ minDate: CalendarDateSchema, maxDate: CalendarDateSchema })
  .refine(
    (d) => compareDates(d.minDate, d.maxDate) <= 0,
    "Reversed date interval",
  );
export type DateInterval = z.infer<typeof DateIntervalSchema>;
export const CalendarDurationSchema = z.strictObject({
  unit: z.enum(["months", "years"]),
  amount: z.number().int().positive().max(9999),
});
export type CalendarDuration = z.infer<typeof CalendarDurationSchema>;
export function compareDates(a: CalendarDate, b: CalendarDate): number {
  return Math.sign(a.year - b.year || a.month - b.month || a.day - b.day);
}
export function parsePartialDate(text: string): PartialCalendarDate {
  if (!/^\d{4}(-\d{2})?(-\d{2})?$/.test(text))
    throw new Error("Expected YYYY, YYYY-MM or YYYY-MM-DD");
  const parts = text.split("-").map(Number);
  const value =
    parts.length === 1
      ? { precision: "year", year: parts[0] }
      : parts.length === 2
        ? { precision: "month", year: parts[0], month: parts[1] }
        : { precision: "day", year: parts[0], month: parts[1], day: parts[2] };
  return PartialCalendarDateSchema.parse(value);
}
export function parseCalendarDate(text: string): CalendarDate {
  const d = parsePartialDate(text);
  if (d.precision !== "day")
    throw new Error("asOf requires a complete calendar date");
  return { year: d.year, month: d.month, day: d.day };
}
export function toDateInterval(input: PartialCalendarDate): DateInterval {
  const d = PartialCalendarDateSchema.parse(input);
  const minMonth = d.precision === "year" ? 1 : d.month;
  const maxMonth = d.precision === "year" ? 12 : d.month;
  return {
    minDate: {
      year: d.year,
      month: minMonth,
      day: d.precision === "day" ? d.day : 1,
    },
    maxDate: {
      year: d.year,
      month: maxMonth,
      day: d.precision === "day" ? d.day : daysInMonth(d.year, maxMonth),
    },
  };
}
export function addCalendarDuration(
  input: CalendarDate,
  duration: CalendarDuration,
): CalendarDate {
  const d = CalendarDateSchema.parse(input);
  const n = CalendarDurationSchema.parse(duration);
  const total =
    d.year * 12 + d.month - 1 + n.amount * (n.unit === "years" ? 12 : 1);
  const y = Math.floor(total / 12),
    m = (total % 12) + 1;
  // Clamp to the last valid day; never use timestamp rollover (e.g. Feb 29 -> Mar 1).
  return CalendarDateSchema.parse({
    year: y,
    month: m,
    day: Math.min(d.day, daysInMonth(y, m)),
  });
}
export function dueWindow(
  date: PartialCalendarDate,
  duration: CalendarDuration,
): DateInterval {
  const range = toDateInterval(date);
  return {
    minDate: addCalendarDuration(range.minDate, duration),
    maxDate: addCalendarDuration(range.maxDate, duration),
  };
}
export function scheduleStatus(
  window: DateInterval,
  asOf: CalendarDate,
): "Current" | "Due" | "Indeterminate" {
  const range = DateIntervalSchema.parse(window),
    today = CalendarDateSchema.parse(asOf);
  if (compareDates(today, range.minDate) < 0) return "Current";
  // Due on the anniversary; no ungrounded grace period or Overdue state.
  if (compareDates(today, range.maxDate) >= 0) return "Due";
  return "Indeterminate";
}
export function temporalRelation(
  a: PartialCalendarDate,
  b: PartialCalendarDate,
): "before" | "after" | "same_day" | "overlap" {
  const x = toDateInterval(a),
    y = toDateInterval(b);
  if (compareDates(x.maxDate, y.minDate) < 0) return "before";
  if (compareDates(x.minDate, y.maxDate) > 0) return "after";
  if (a.precision === "day" && b.precision === "day") return "same_day";
  return "overlap";
}
export function validateHistoricalDate(
  date: PartialCalendarDate,
  asOf: CalendarDate,
  birth?: PartialCalendarDate,
): string[] {
  const range = toDateInterval(date),
    today = CalendarDateSchema.parse(asOf);
  const errors: string[] = [];
  if (compareDates(range.minDate, today) > 0) errors.push("future_date");
  else if (compareDates(range.maxDate, today) > 0)
    errors.push("possibly_future_date");
  if (birth !== undefined) {
    const b = toDateInterval(birth);
    if (compareDates(range.maxDate, b.minDate) < 0) errors.push("before_birth");
    else if (compareDates(range.minDate, b.maxDate) < 0)
      errors.push("possibly_before_birth");
  }
  return errors;
}
export function completedAge(birth: CalendarDate, asOf: CalendarDate): number {
  CalendarDateSchema.parse(birth);
  CalendarDateSchema.parse(asOf);
  if (compareDates(birth, asOf) > 0) throw new Error("Future birth date");
  // Calendar comparison: a Feb 29 birthday completes its year on March 1 in non-leap years.
  return (
    asOf.year -
    birth.year -
    (asOf.month < birth.month ||
    (asOf.month === birth.month && asOf.day < birth.day)
      ? 1
      : 0)
  );
}
