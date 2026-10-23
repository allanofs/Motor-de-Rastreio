import { z } from "zod";
import { IdSchema } from "../model/common";
import {
  CareSettingContextSchema,
  PolicySchema,
  RuleDefinitionSchema,
  SourceSchema,
} from "../model/content";
import type { Ruleset, Policy } from "../model/content";
import { PatientSchema } from "../model/patient";
import type { Patient } from "../model/patient";
import { referencedConcepts } from "./facts";
import { sanitizeAndPruneInput } from "./sanitize";

const ContentEnvelopeSchema = z.strictObject({
  rulesetVersion: z.string().min(1),
  rules: z.array(z.unknown()),
  sources: z.array(z.unknown()),
  policies: z.array(PolicySchema),
  terminology: z.array(IdSchema),
});
const TopicIdentitySchema = z.looseObject({ topicId: IdSchema });
const RawPatientEnvelopeSchema = z.strictObject({
  context: z.unknown(),
  facts: z.array(z.unknown()),
  examHistory: z.array(TopicIdentitySchema),
  historyKnowledge: z.unknown(),
});
export function parseContent(
  input: unknown,
  policyId: string,
): {
  bundle: Ruleset;
  policy: Policy;
  invalidTopics: Set<string>;
  ruleTopics: Map<string, string>;
} {
  // Shared envelope errors have no trustworthy domain identity and are explicit caller errors.
  const raw = ContentEnvelopeSchema.parse(input);
  const policy = raw.policies.find((p) => p.policyId === policyId);
  if (policy === undefined)
    throw new Error("Unknown policy; no implicit fallback");
  const invalidTopics = new Set<string>();
  const ruleTopics = new Map<string, string>();
  const rules: Ruleset["rules"] = [];
  for (const item of raw.rules) {
    const identity = TopicIdentitySchema.extend({ ruleId: IdSchema }).parse(
        item,
      ),
      parsed = RuleDefinitionSchema.safeParse(item);
    ruleTopics.set(identity.ruleId, identity.topicId);
    if (parsed.success) rules.push(parsed.data);
    else invalidTopics.add(identity.topicId);
  }
  const sources: Ruleset["sources"] = [];
  // Invalid sources are omitted, so only domains that refer to them fail integrity checks.
  for (const item of raw.sources) {
    const parsed = SourceSchema.safeParse(item);
    if (parsed.success) sources.push(parsed.data);
  }
  return {
    bundle: { ...raw, rules, sources },
    policy,
    invalidTopics,
    ruleTopics,
  };
}
export function parsePatientDomains(
  input: unknown,
  topicIds: string[],
  rules: readonly import("../model/content").RuleDefinition[],
  extensionConcepts: ReadonlyMap<string, readonly string[]> = new Map(),
): Map<string, Patient | undefined> {
  const result = new Map<string, Patient | undefined>();
  const raw = RawPatientEnvelopeSchema.safeParse(input);
  if (!raw.success) return new Map(topicIds.map((id) => [id, undefined]));
  const FactRoutingSchema = z.looseObject({
    topicId: IdSchema.optional(),
    conceptId: IdSchema,
  });
  // Prune each fact before identifying dependencies; a hidden incomplete branch is not evidence.
  const factEntries = raw.data.facts.flatMap((item, index) => {
    try {
      const wrapper = z
        .looseObject({ facts: z.array(z.unknown()) })
        .parse(
          sanitizeAndPruneInput({
            context: {},
            facts: [item],
            examHistory: [],
            historyKnowledge: {},
          }),
        );
      return wrapper.facts.map((value) => ({ value, index }));
    } catch {
      return [{ value: item, index }];
    }
  });
  const dependencyMap = new Map(
    topicIds.map((topic) => [
      topic,
      new Set([
        ...referencedConcepts(rules.filter((r) => r.topicId === topic)),
        ...(extensionConcepts.get(topic) ?? []),
      ]),
    ]),
  );
  const unrouteable = new Set<string>();
  for (const topic of topicIds) {
    const selected: typeof factEntries = [];
    for (const entry of factEntries) {
      const route = FactRoutingSchema.safeParse(entry.value);
      if (route.success) {
        if (
          route.data.topicId === topic ||
          (route.data.topicId === undefined &&
            dependencyMap.get(topic)?.has(route.data.conceptId))
        )
          selected.push(entry);
      } else {
        const local = TopicIdentitySchema.safeParse(entry.value);
        if (local.success) {
          if (local.data.topicId === topic) selected.push(entry);
        } else unrouteable.add(topic);
      }
    }
    if (unrouteable.has(topic)) {
      result.set(topic, undefined);
      continue;
    }
    try {
      result.set(
        topic,
        PatientSchema.parse(
          sanitizeAndPruneInput({
            ...raw.data,
            facts: selected.map((e) => e.value),
            examHistory: raw.data.examHistory.filter(
              (e) => e.topicId === topic,
            ),
          }),
        ),
      );
    } catch {
      result.set(topic, undefined);
    }
  }
  // One global fact projected into two domains is still ONE session record.
  const originalRecords = [
    ...factEntries.map((e) => e.value),
    ...raw.data.examHistory,
  ];
  const idCounts = new Map<string, number>();
  for (const value of originalRecords) {
    const id = z.looseObject({ id: IdSchema }).safeParse(value);
    if (id.success)
      idCounts.set(id.data.id, (idCounts.get(id.data.id) ?? 0) + 1);
  }
  const owners = new Map<string, Set<string>>();
  for (const [topic, p] of result)
    for (const record of [...(p?.facts ?? []), ...(p?.examHistory ?? [])]) {
      const set = owners.get(record.id) ?? new Set<string>();
      set.add(topic);
      owners.set(record.id, set);
    }
  for (const [id, topics] of owners)
    if ((idCounts.get(id) ?? 0) > 1 && topics.size > 1)
      for (const topic of topics) result.set(topic, undefined);
  return result;
}
export { CareSettingContextSchema };
