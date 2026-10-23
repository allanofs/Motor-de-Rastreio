import type { RuleDefinition } from "../model/content";
import type { ExamRecord } from "../model/patient";
import type { CalendarDate } from "../model/dates";
import { dueWindow, scheduleStatus, temporalRelation } from "../model/dates";
import type { PathwayState, ScheduleInformation } from "../model/evaluation";
import { qualifyingEvents } from "./resolveHistory";
export function calculateSchedule(
  rule: RuleDefinition,
  events: ExamRecord[],
  asOf: CalendarDate,
): { state: PathwayState; schedule: ScheduleInformation[]; missing: string[] } {
  if (rule.computability !== "computable")
    return {
      state: {
        status: "ClinicalReviewRequired",
        reason: "Rule requires unstructured clinical judgment",
      },
      schedule: [],
      missing: [],
    };
  if (
    rule.scheduleSpec !== undefined &&
    rule.qualifyingEventSpec !== undefined
  ) {
    const qualifying = qualifyingEvents(events, rule.qualifyingEventSpec);
    if (qualifying.length === 0)
      return {
        state: {
          status: "Indeterminate",
          reason:
            "No valid qualifying event; absence is not evidence of current status",
        },
        schedule: [],
        missing: [`qualifying_event:${rule.ruleId}`],
      };
    if (
      qualifying.some((e) => e.status !== "performed" || e.date === undefined)
    )
      return {
        state: {
          status: "Indeterminate",
          reason: "Qualifying event date missing",
        },
        schedule: [],
        missing: [`event_date:${rule.ruleId}`],
      };
    const latest = qualifying.filter((e) =>
      qualifying.every(
        (other) =>
          e.id === other.id ||
          (e.status === "performed" &&
            other.status === "performed" &&
            e.date !== undefined &&
            other.date !== undefined &&
            ["after", "same_day"].includes(
              temporalRelation(e.date, other.date),
            )),
      ),
    );
    const anchor = latest.sort((a, b) => a.id.localeCompare(b.id, "en"))[0];
    if (anchor?.status !== "performed" || anchor.date === undefined)
      return {
        state: {
          status: "Indeterminate",
          reason: "Cannot establish latest qualifying event with partial dates",
        },
        schedule: [],
        missing: [`event_order:${rule.ruleId}`],
      };
    const window = dueWindow(anchor.date, rule.scheduleSpec),
      status = scheduleStatus(window, asOf);
    const schedule = [
      {
        ruleId: rule.ruleId,
        anchorEventId: anchor.id,
        dueWindow: window,
        status,
      },
    ];
    return {
      state:
        status === "Current"
          ? { status, anchorEventId: anchor.id, ruleId: rule.ruleId }
          : status === "Due"
            ? { status }
            : { status, reason: "Partial date straddles the due boundary" },
      schedule,
      missing:
        status === "Indeterminate" ? [`date_precision:${anchor.id}`] : [],
    };
  }
  if (rule.stance === "shared_decision")
    return { state: { status: "SharedDecision" }, schedule: [], missing: [] };
  if (
    ["insufficient_evidence", "no_formal_recommendation"].includes(rule.stance)
  )
    return {
      state: {
        status: "ClinicalReviewRequired",
        reason: "No automatic recommendation is supported by this stance",
      },
      schedule: [],
      missing: [],
    };
  const outcome = rule.outcome;
  const state: PathwayState =
    outcome === "NotApplicable"
      ? { status: outcome, reason: "Explicit rule outcome" }
      : outcome === "ClinicalReviewRequired"
        ? { status: outcome, reason: "Explicit clinical review requirement" }
        : { status: outcome };
  return { state, schedule: [], missing: [] };
}
