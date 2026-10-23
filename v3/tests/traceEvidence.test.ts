import { describe, expect, it } from "vitest";
import { evaluatePatient } from "../src/engine/evaluatePatient";
import type { RuleDefinition } from "../src/model/content";
import type { DomainResolver } from "../src/engine/extensions";
import { ExamRecordSchema } from "../src/model/patient";
import { parsePartialDate } from "../src/model/dates";
import { asOf, bundle, patient, policy, rule } from "./fixtures";
const event = (id: string, when: string, modality: string) => ExamRecordSchema.parse({
  id, topicId: rule.topicId, modality, status: "performed",
  date: parsePartialDate(when), result: { status: "final", code: "accepted" },
  quality: "adequate", completeness: "complete", resolutionInformation: "sufficient",
});
const events = [
  event("A", "2025-01-01", "technical-sequence"),
  event("B", "2026-01-01", "technical-anchor"),
  event("C", "2026-07-01", "technical-sequence"),
];
const scheduled: RuleDefinition = { ...rule, scheduleSpec: { unit: "years", amount: 1 },
  qualifyingEventSpec: { modality: "technical-anchor", resultCodes: ["accepted"],
    requireAdequateQuality: true, requireComplete: true, requireSufficientResolution: true } };
const evaluate = (history = events, active: RuleDefinition = scheduled, extensions: readonly DomainResolver[] = []) =>
  evaluatePatient({ patient: { ...patient, examHistory: history }, asOf, policyId: policy.policyId,
    ruleset: { ...bundle, rules: [active] }, extensions });
const sequence: DomainResolver = {
  resolverId: "technical-evidence", version: "test-1", topicId: rule.topicId,
  trackId: rule.trackId, requiredConceptIds: [],
  resolve(input) {
    const first = input.history.events.find(record => record.id === "A");
    const last = input.history.events.find(record => record.id === "C");
    return { state: { status: "HandedOff" }, actionIds: [],
      evidenceRecordIds: first !== undefined && last !== undefined ? [first.id, last.id] : [] };
  },
};
describe("precise evidence trace", () => {
  it("TRACE-01: B is the anchor; A and C are not used evidence", () => {
    const result = evaluate(); const trace = result.plan.topics[0]!.tracks[0]!.trace;
    expect(trace.factsUsed).toEqual([]); expect(trace.recordsUsed).toEqual(["B"]);
    expect(trace.recordsConsidered).toEqual(["A", "B", "C"]);
    expect(result.traces[0]!.recordsUsed).toEqual(["B"]);
  });
  it("does not call merely available history considered or used in a history-independent rule", () => {
    const trace = evaluate(events, rule).traces[0]!;
    expect(trace.factsUsed).toEqual([]); expect(trace.recordsUsed).toEqual([]);
    expect(trace.recordsConsidered).toEqual([]);
  });
  it("TRACE-02: resolver declares exactly A and C as evidence for its conclusion", () => {
    const result = evaluate(events, rule, [sequence]);
    expect(result.plan.topics[0]!.tracks[0]!.state.status).toBe("HandedOff");
    expect(result.traces[0]!.recordsUsed).toEqual(["A", "C"]);
    expect(result.traces[0]!.factsUsed).toEqual([]);
  });
  it("a resolver replaces generic supporting records with its declared final evidence", () => {
    const result = evaluate(events, scheduled, [sequence]);
    expect(result.traces[0]!.recordsUsed).toEqual(["A", "C"]);
    expect(result.traces[0]!.recordsUsed).not.toContain("B");
  });
  it("TRACE-03: nonexistent evidence produces track ComputationError", () => {
    const invalid: DomainResolver = { ...sequence, resolve() {
      return { state: { status: "HandedOff" }, actionIds: [], evidenceRecordIds: ["missing"] };
    } };
    const result = evaluate(events, scheduled, [invalid]);
    expect(result.plan.topics[0]!.tracks[0]!.state.status).toBe("ComputationError");
    expect(result.traces[0]!.recordsUsed).toEqual([]); expect(result.plan.actions).toEqual([]);
  });
  it("rejects an existing raw record absent from the resolver snapshot", () => {
    const outside = { ...event("outside", "2026-01-01", "technical-anchor"), topicId: "unselected-topic" };
    const invalid: DomainResolver = { ...sequence, resolve() {
      return { state: { status: "HandedOff" }, actionIds: [], evidenceRecordIds: ["outside"] };
    } };
    expect(evaluate([...events, outside], rule, [invalid]).plan.topics[0]!.tracks[0]!.state.status).toBe("ComputationError");
  });
  it("TRACE-04: all permutations preserve the complete result and normalized trace", () => {
    const expected = evaluate(events, scheduled, [sequence]);
    for (const order of [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]])
      expect(evaluate(order.map(index => events[index]!), scheduled, [sequence])).toEqual(expected);
    expect(evaluate([...events].reverse())).toEqual(evaluate());
  });
  it("keeps Current anchor as evidence even if a resolver omits an optional declaration", () => {
    const preserve: DomainResolver = { ...sequence, resolve(input) {
      const state = input.genericTrack.state;
      return { state: state.status === "Current"
        ? { status: "Current", anchorEventId: state.anchorEventId, ruleId: state.ruleId }
        : { status: "Indeterminate", reason: "No generic Current" }, actionIds: [] };
    } };
    const result = evaluate(events, scheduled, [preserve]);
    expect(result.plan.topics[0]!.tracks[0]!.state.status).toBe("Current");
    expect(result.traces[0]!.recordsUsed).toEqual(["B"]);
  });
  it("deduplicates resolver evidence without extra support", () => {
    const duplicates: DomainResolver = { ...sequence, resolve() {
      return { state: { status: "HandedOff" }, actionIds: [], evidenceRecordIds: ["C", "A", "C"] };
    } };
    expect(evaluate(events, rule, [duplicates]).traces[0]!.recordsUsed).toEqual(["A", "C"]);
  });
  it("factsUsed includes consulted criteria but not later short-circuited criteria", () => {
    const first = { id: "first", conceptId: "first-concept", category: "condition", presence: "no" };
    const second = { id: "second", conceptId: "second-concept", category: "condition", presence: "yes" };
    const active: RuleDefinition = { ...rule, population: { facts: [
      { conceptId: "first-concept", presence: "yes" }, { conceptId: "second-concept", presence: "yes" },
    ] }, requiredKnownFacts: ["second-concept"] };
    const result = evaluatePatient({ patient: { ...patient, facts: [second, first] }, asOf, policyId: policy.policyId,
      ruleset: { ...bundle, rules: [active] } });
    expect(result.traces[0]!.factsUsed).toEqual(["first"]); expect(result.traces[0]!.recordsUsed).toEqual([]);
    expect(result.plan.topics[0]!.tracks[0]!.state.status).toBe("NotApplicable");
  });
  it("a resolver may cite a global fact present in its typed snapshot", () => {
    const fact = { id: "global-fact", conceptId: "shared-risk", category: "condition", presence: "yes" };
    const resolver: DomainResolver = { ...sequence, requiredConceptIds: ["shared-risk"], resolve(input) {
      return { state: { status: "HandedOff" }, actionIds: [], evidenceRecordIds: input.patient.facts.map(item => item.id) };
    } };
    const result = evaluatePatient({ patient: { ...patient, facts: [fact] }, asOf, policyId: policy.policyId,
      ruleset: bundle, extensions: [resolver] });
    expect(result.traces[0]!.factsUsed).toEqual([]);
    expect(result.traces[0]!.recordsUsed).toEqual(["global-fact"]);
  });
});
