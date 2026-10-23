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
  facts: z.array(TopicIdentitySchema),
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
): Map<string, Patient | undefined> {
  const result = new Map<string, Patient | undefined>();
  const raw = RawPatientEnvelopeSchema.safeParse(input);
  if (!raw.success) return new Map(topicIds.map((id) => [id, undefined]));
  for (const topicId of topicIds) {
    const scoped = {
      ...raw.data,
      facts: raw.data.facts.filter((f) => f.topicId === topicId),
      examHistory: raw.data.examHistory.filter((e) => e.topicId === topicId),
    };
    try {
      result.set(topicId, PatientSchema.parse(sanitizeAndPruneInput(scoped)));
    } catch {
      result.set(topicId, undefined);
    }
  }
  const owners = new Map<string, string[]>();
  for (const [topicId, p] of result)
    for (const e of [...(p?.facts ?? []), ...(p?.examHistory ?? [])])
      owners.set(e.id, [...(owners.get(e.id) ?? []), topicId]);
  for (const topics of owners.values())
    if (new Set(topics).size > 1)
      for (const topic of topics) result.set(topic, undefined);
  return result;
}
export { CareSettingContextSchema };
