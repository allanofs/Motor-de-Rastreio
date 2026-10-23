import { describe, expect, it } from "vitest";
import { evaluatePatient } from "../src/engine/evaluatePatient";
import { contentIssues, validateBundle, assertValidBundle } from "../src/engine/validateContent";
import type { RuleDefinition, Ruleset, Policy } from "../src/model/content";
import { asOf, bundle, patient, policy, rule, source } from "./fixtures";

// Technical aliases only: these are not real SUS/international clinical policies.
const susRule: RuleDefinition = { ...rule, ruleId: "rule_sus" };
const foreignRule: RuleDefinition = { ...rule, ruleId: "rule_int",
  sourceRefs: [{ sourceId: "foreign-source", locator: "synthetic foreign proposition" }] };
const sus: Policy = { ...policy, policyId: "technical-sus", ruleIds: ["rule_sus"] };
const international: Policy = { ...policy, policyId: "technical-international", ruleIds: ["rule_int"] };
const foreignSource = { ...source, sourceId: "foreign-source" };
const base: Ruleset = { ...bundle, rules: [susRule], policies: [sus] };
const twoPolicies: Ruleset = { ...bundle, rules: [susRule, foreignRule],
  sources: [source, foreignSource], policies: [sus, international] };
const run = (content: unknown, policyId = sus.policyId) =>
  evaluatePatient({ patient, asOf, policyId, ruleset: content });
const status = (content: unknown, policyId = sus.policyId) =>
  run(content, policyId).plan.topics[0]!.tracks[0]!.state.status;

describe("policy runtime isolation", () => {
  it("POL-01: invalid international rule cannot invalidate the SUS test policy", () => {
    const content = { ...twoPolicies, rules: [susRule, { ...foreignRule, computability: "invalid" }] };
    expect(status(content)).toBe("Due"); expect(run(content)).toEqual(run(base));
    expect(validateBundle(content).length).toBeGreaterThan(0);
  });
  it("POL-02: the same invalid rule selected by the active policy fails explicitly", () => {
    const content = { ...twoPolicies, rules: [susRule, { ...foreignRule, computability: "invalid" }] };
    expect(status(content, international.policyId)).toBe("ComputationError");
    expect(run(content, international.policyId).plan.actions).toEqual([]);
  });
  it("POL-03: an invalid foreign source cannot invalidate SUS runtime", () => {
    const content = { ...twoPolicies, sources: [source, { ...foreignSource, url: "invalid-url" }] };
    expect(run(content)).toEqual(run(base)); expect(validateBundle(content).length).toBeGreaterThan(0);
  });
  it("POL-04: an invalid source selected by SUS fails explicitly", () => {
    const content = { ...base, sources: [{ ...source, url: "invalid-url" }] };
    expect(status(content)).toBe("ComputationError"); expect(run(content).plan.actions).toEqual([]);
  });
  it("POL-05: an unselected draft/experimental rule cannot change active output", () => {
    const draft = { ...foreignRule, lifecycleStatus: "draft", reviewStatus: "source_verified",
      governance: { ...foreignRule.governance, reviews: [] },
      compositionPolicy: "choose_shorter_interval", supersedes: ["absent"] };
    expect(run({ ...twoPolicies, rules: [susRule, draft] })).toEqual(run(base));
  });
  it("POL-06: adding/removing unselected rules preserves the entire normalized output", () => {
    const expanded = { ...twoPolicies, rules: [foreignRule, susRule, { ...foreignRule, ruleId: "orphan" }] };
    const expected = run(base);
    expect(run(twoPolicies)).toEqual(expected); expect(run(expanded)).toEqual(expected);
    expect(run({ ...expanded, rules: [susRule] })).toEqual(expected);
  });
  it.each(["missing_source", "non_final_source", "insufficient_clinical_review", "invalid_rule_reference"])(
    "runtime contentIssues ignores foreign %s", (kind) => {
      let foreign: RuleDefinition = foreignRule;
      let sources = [source, foreignSource];
      if (kind === "missing_source") foreign = { ...foreignRule, sourceRefs: [{ sourceId: "absent", locator: "test" }] };
      if (kind === "non_final_source") sources = [source, { ...foreignSource, documentStatus: "withdrawn" }];
      if (kind === "insufficient_clinical_review") foreign = { ...foreignRule, reviewStatus: "source_verified" };
      if (kind === "invalid_rule_reference") foreign = { ...foreignRule, supersedes: ["absent"] };
      expect(contentIssues({ ...twoPolicies, rules: [susRule, foreign], sources }, sus, rule.topicId)).toEqual([]);
    });
  it("proves irrelevance using an unselected ruleId despite malformed topic", () =>
    expect(run({ ...twoPolicies, rules: [susRule, { ruleId: "rule_int", topicId: false }] })).toEqual(run(base)));
  it("fails selected content whose topic identity cannot be recovered", () =>
    expect(status({ ...base, rules: [{ ...susRule, topicId: undefined }] })).toBe("ComputationError"));
  it("proves an anonymous rule in a foreign topic irrelevant", () =>
    expect(run({ ...base, rules: [susRule, { topicId: "foreign-topic" }] })).toEqual(run(base)));
  it("fails an anonymous rule in the evaluated topic rather than assuming irrelevance", () =>
    expect(status({ ...base, rules: [susRule, { topicId: rule.topicId }] })).toBe("ComputationError"));
  it("fails explicitly for unrouteable rule identity", () =>
    expect(status({ ...base, rules: [susRule, {}] })).toBe("ComputationError"));
  it("ignores a foreign policy with recoverable identity and invalid body", () => {
    const content = { ...base, policies: [sus, { policyId: international.policyId, ruleIds: false }] };
    expect(run(content)).toEqual(run(base)); expect(validateBundle(content).length).toBeGreaterThan(0);
  });
  it("does not choose silently between duplicate active policy identities", () =>
    expect(() => run({ ...base, policies: [sus, sus] })).toThrow("Ambiguous active policy"));
  it("does not let foreign duplicate identities contaminate the active policy", () => {
    const content = { ...twoPolicies, rules: [susRule, foreignRule, foreignRule],
      sources: [source, foreignSource, foreignSource], policies: [sus, international, international] };
    expect(run(content)).toEqual(run(base));
    expect(validateBundle(content)).toContain("duplicate_rule_id");
    expect(validateBundle(content)).toContain("duplicate_source_id");
    expect(validateBundle(content)).toContain("duplicate_policy_id");
  });
  it("does reject duplicate selected rule/source identities", () => {
    expect(status({ ...base, rules: [susRule, susRule] })).toBe("ComputationError");
    expect(status({ ...base, sources: [source, source] })).toBe("ComputationError");
  });
  it("isolates source validation between topics within the active policy", () => {
    const second = { ...foreignRule, topicId: "technical-b" };
    const combined = { ...sus, ruleIds: ["rule_sus", "rule_int"], topicIds: [rule.topicId, "technical-b"] };
    const content = { ...twoPolicies, rules: [susRule, second], policies: [combined],
      sources: [source, { ...foreignSource, url: "invalid-url" }] };
    expect(run(content).plan.topics.map(topic => topic.tracks[0]!.state.status)).toEqual(["Due", "ComputationError"]);
  });
});
describe("global bundle validation remains stricter than policy runtime", () => {
  it("accepts and returns a coherent synthetic bundle", () => {
    expect(validateBundle(twoPolicies)).toEqual([]); expect(assertValidBundle(twoPolicies)).toEqual(twoPolicies);
  });
  it.each(["rule", "source", "policy"])("detects an unselected invalid %s", (kind) => {
    const content = kind === "rule" ? { ...twoPolicies, rules: [susRule, { ...foreignRule, stance: "invalid" }] }
      : kind === "source" ? { ...twoPolicies, sources: [source, { ...foreignSource, publicationYear: -1 }] }
      : { ...twoPolicies, policies: [sus, { ...international, family: "invalid" }] };
    expect(run(content)).toEqual(run(base));
    expect(validateBundle(content).some(issue => issue.startsWith("schema:"))).toBe(true);
    expect(() => assertValidBundle(content)).toThrow("Invalid content bundle");
  });
  it("detects a broken reference in a valid orphan rule", () => {
    const content = { ...base, rules: [susRule, { ...foreignRule, sourceRefs: [{ sourceId: "absent", locator: "test" }] }] };
    expect(run(content)).toEqual(run(base)); expect(validateBundle(content)).toContain("missing_source:absent");
  });
  it("detects a broken policy rule reference", () =>
    expect(validateBundle({ ...base, policies: [sus, { ...international, ruleIds: ["absent"] }] })).toContain("unknown_rule:absent"));
  it("detects a broken source supersession reference", () =>
    expect(validateBundle({ ...twoPolicies, sources: [source, { ...foreignSource, supersededBy: "absent" }] }))
      .toContain("invalid_source_reference:foreign-source:absent"));
  it("checks the entire supersedes graph, including unselected draft content", () => {
    const first = { ...foreignRule, ruleId: "draft-one", lifecycleStatus: "draft", supersedes: ["draft-two"] };
    const second = { ...foreignRule, ruleId: "draft-two", lifecycleStatus: "draft", supersedes: ["draft-one"] };
    const content = { ...twoPolicies, rules: [susRule, first, second] };
    expect(run(content)).toEqual(run(base)); expect(validateBundle(content)).toContain("supersedes_cycle");
  });
});
