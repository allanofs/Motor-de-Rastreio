import type { ClinicalFact } from "../model/patient";
import type { RuleDefinition } from "../model/content";
import { unique } from "../model/common";
export function factAppliesToTopic(
  fact: ClinicalFact,
  topicId: string,
): boolean {
  return fact.topicId === undefined || fact.topicId === topicId;
}
export function referencedConcepts(rules: readonly RuleDefinition[]): string[] {
  return unique(
    rules.flatMap((rule) => [
      ...rule.requiredKnownFacts,
      ...rule.population.facts.map((f) => f.conceptId),
      ...rule.exclusions.flatMap((e) => e.facts.map((f) => f.conceptId)),
    ]),
  );
}
