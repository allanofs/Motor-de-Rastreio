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
  policies: z.array(z.unknown()),
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
  const raw = ContentEnvelopeSchema.parse(input);
  const PolicyIdentity = z.looseObject({ policyId: IdSchema });
  const policyCandidates: unknown[] = [];
  for (const item of raw.policies) {
    const identity = PolicyIdentity.safeParse(item);
    if (!identity.success)
      throw new Error("Cannot establish policy identity; no implicit fallback");
    if (identity.data.policyId === policyId) policyCandidates.push(item);
  }
  if (policyCandidates.length === 0)
    throw new Error("Unknown policy; no implicit fallback");
  if (policyCandidates.length !== 1)
    throw new Error("Ambiguous active policy identity");
  const policy = PolicySchema.parse(policyCandidates[0]);
  const selectedIds = new Set(policy.ruleIds);
  const invalidTopics = new Set<string>();
  const ruleTopics = new Map<string, string>();
  const rules: Ruleset["rules"] = [];
  const RuleIdentity = z.looseObject({ ruleId: IdSchema });
  const ruleCounts = new Map<string, number>();
  const invalidate = (topicId?: string): void => {
    if (topicId !== undefined && policy.topicIds.includes(topicId))
      invalidTopics.add(topicId);
    else for (const topic of policy.topicIds) invalidTopics.add(topic);
  };
  for (const item of raw.rules) {
    const identity = RuleIdentity.safeParse(item);
    const topic = TopicIdentitySchema.safeParse(item);
    if (identity.success && !selectedIds.has(identity.data.ruleId)) continue;
    if (!identity.success) {
      // A foreign topic proves irrelevance even when ruleId is unrecoverable.
      if (selectedIds.size > 0 &&
          (!topic.success || policy.topicIds.includes(topic.data.topicId)))
        invalidate(topic.success ? topic.data.topicId : undefined);
      continue;
    }
    const id = identity.data.ruleId;
    ruleCounts.set(id, (ruleCounts.get(id) ?? 0) + 1);
    if (topic.success) ruleTopics.set(id, topic.data.topicId);
    const parsed = RuleDefinitionSchema.safeParse(item);
    if (!parsed.success) {
      invalidate(topic.success ? topic.data.topicId : undefined);
      continue;
    }
    if (!policy.topicIds.includes(parsed.data.topicId))
      invalidate();
    rules.push(parsed.data);
  }
  // Duplicate selected identities are ambiguous, including across topics.
  for (const [id, count] of ruleCounts) if (count > 1) {
    const topics = rules.filter(rule => rule.ruleId === id).map(rule => rule.topicId);
    if (topics.length === 0) invalidate(ruleTopics.get(id));
    else for (const topic of topics) invalidate(topic);
  }
  const sourceUsers = new Map<string, Set<string>>();
  for (const rule of rules) for (const ref of rule.sourceRefs) {
    const topics = sourceUsers.get(ref.sourceId) ?? new Set<string>();
    topics.add(rule.topicId);
    sourceUsers.set(ref.sourceId, topics);
  }
  const sources: Ruleset["sources"] = [];
  const SourceIdentity = z.looseObject({ sourceId: IdSchema });
  const sourceCounts = new Map<string, number>();
  for (const item of raw.sources) {
    const identity = SourceIdentity.safeParse(item);
    if (!identity.success) {
      // This record cannot safely be proven unrelated to a used source.
      for (const topics of sourceUsers.values()) for (const topic of topics) invalidate(topic);
      continue;
    }
    const id = identity.data.sourceId;
    const users = sourceUsers.get(id);
    if (users === undefined) continue;
    sourceCounts.set(id, (sourceCounts.get(id) ?? 0) + 1);
    const parsed = SourceSchema.safeParse(item);
    if (parsed.success) sources.push(parsed.data);
    else for (const topic of users) invalidate(topic);
  }
  for (const [id, count] of sourceCounts) if (count > 1)
    for (const topic of sourceUsers.get(id) ?? []) invalidate(topic);
  // Runtime sees only the active policy projection. Full-bundle auditing is separate.
  return {
    bundle: { ...raw, rules, sources, policies: [policy] },
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
