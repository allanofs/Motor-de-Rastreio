import type { Criteria, RuleDefinition } from "../model/content";
import type { Patient } from "../model/patient";
import { factAppliesToTopic } from "./facts";
import { unique } from "../model/common";
export function criteriaMatch(
  criteria: Criteria,
  patient: Patient,
  topicId: string,
): "match" | "no_match" | "missing" {
  const age = patient.context.ageYears;
  let missing = false;
  if (criteria.minAge !== undefined || criteria.maxAge !== undefined) {
    if (age === undefined) missing = true;
    else if (
      (criteria.minAge !== undefined && age < criteria.minAge) ||
      (criteria.maxAge !== undefined && age > criteria.maxAge)
    )
      return "no_match";
  }
  for (const required of criteria.facts) {
    const facts = patient.facts.filter(
      (f) =>
        factAppliesToTopic(f, topicId) && f.conceptId === required.conceptId,
    );
    if (facts.length === 0) {
      missing = true;
      continue;
    }
    if (
      facts.some(
        (f) =>
          f.presence === required.presence &&
          (required.value === undefined ||
            ("value" in f && f.value === required.value)),
      )
    )
      continue;
    if (
      facts.some(
        (f) =>
          f.presence === "unknown" ||
          (f.presence === required.presence &&
            required.value !== undefined &&
            (!("value" in f) || f.value === undefined)),
      )
    ) {
      missing = true;
      continue;
    }
    return "no_match";
  }
  return missing ? "missing" : "match";
}
export function evaluateApplicableRules(
  rules: RuleDefinition[],
  patient: Patient,
): {
  active: RuleDefinition[];
  missing: string[];
  suppressed: { ruleId: string; reason: string }[];
  factsUsed: string[];
} {
  const active: RuleDefinition[] = [],
    missing: string[] = [],
    suppressed: { ruleId: string; reason: string }[] = [],
    factsUsed: string[] = [];
  for (const rule of rules) {
    if (rule.lifecycleStatus !== "active") {
      suppressed.push({ ruleId: rule.ruleId, reason: "inactive_lifecycle" });
      continue;
    }
    const used = new Set([
      ...rule.requiredKnownFacts,
      ...rule.population.facts.map((f) => f.conceptId),
      ...rule.exclusions.flatMap((e) => e.facts.map((f) => f.conceptId)),
    ]);
    factsUsed.push(
      ...patient.facts
        .filter(
          (f) => factAppliesToTopic(f, rule.topicId) && used.has(f.conceptId),
        )
        .map((f) => f.id),
    );
    const population = criteriaMatch(rule.population, patient, rule.topicId);
    if (population === "no_match") {
      suppressed.push({ ruleId: rule.ruleId, reason: "outside_population" });
      continue;
    }
    const exclusions = rule.exclusions.map((e) =>
      criteriaMatch(e, patient, rule.topicId),
    );
    if (exclusions.includes("match")) {
      suppressed.push({ ruleId: rule.ruleId, reason: "excluded_population" });
      continue;
    }
    const absent = rule.requiredKnownFacts.filter(
      (concept) =>
        !patient.facts.some(
          (f) =>
            factAppliesToTopic(f, rule.topicId) &&
            f.conceptId === concept &&
            f.presence !== "unknown",
        ),
    );
    if (
      population === "missing" ||
      exclusions.includes("missing") ||
      absent.length > 0
    ) {
      missing.push(...absent.map((id) => `fact:${id}`));
      if (population === "missing" || exclusions.includes("missing"))
        missing.push(`criteria:${rule.ruleId}`);
      suppressed.push({ ruleId: rule.ruleId, reason: "missing_data" });
      continue;
    }
    active.push(rule);
  }
  return {
    active,
    missing: unique(missing),
    suppressed,
    factsUsed: unique(factsUsed),
  };
}
