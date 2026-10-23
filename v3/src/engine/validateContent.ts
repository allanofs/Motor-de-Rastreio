import { z } from "zod";
import { IdSchema, unique } from "../model/common";
import { PolicySchema, RuleDefinitionSchema, RulesetSchema, SourceSchema } from "../model/content";
import type { Policy, Ruleset } from "../model/content";

function collectContentIssues(
  bundle: Ruleset,
  policy: Policy,
  topicId: string,
  ruleTopics: ReadonlyMap<string, string>,
  global: boolean,
): string[] {
  const issues: string[] = [];
  const duplicate = (ids: string[], label: string): void => {
    if (new Set(ids).size !== ids.length) issues.push(`duplicate_${label}`);
  };
  const selected = new Set(policy.ruleIds);
  const candidates = global ? bundle.rules : bundle.rules.filter(rule => selected.has(rule.ruleId));
  const rules = candidates.filter(rule => rule.topicId === topicId);
  const relevantIds = new Set(rules.map(rule => rule.ruleId));
  const relevantSources = new Set(rules.flatMap(rule => rule.sourceRefs.map(ref => ref.sourceId)));
  duplicate(candidates.filter(rule => relevantIds.has(rule.ruleId)).map(rule => rule.ruleId), "rule_id");
  duplicate(bundle.sources.filter(source => relevantSources.has(source.sourceId)).map(source => source.sourceId), "source_id");
  duplicate(bundle.policies.filter(item => item.policyId === policy.policyId).map(item => item.policyId), "policy_id");
  duplicate(policy.ruleIds, "policy_rule");
  duplicate(policy.topicIds, "policy_topic");
  const byId = new Map(candidates.map(rule => [rule.ruleId, rule]));
  for (const id of policy.ruleIds)
    if (
      !byId.has(id) &&
      (!ruleTopics.has(id) || ruleTopics.get(id) === topicId)
    )
      issues.push(`unknown_rule:${id}`);
  for (const r of rules) {
    duplicate(
      r.actions.map((a) => a.actionId),
      "action_id",
    );
    for (const id of [...r.supersedes, ...r.excludes]) {
      if (!global && !selected.has(id)) continue;
      if (
        byId.get(id)?.topicId !== topicId ||
        byId.get(id)?.trackId !== r.trackId
      )
        issues.push(`invalid_rule_reference:${r.ruleId}:${id}`);
      if (id === r.ruleId) issues.push(`self_reference:${id}`);
    }
    for (const ref of r.sourceRefs) {
      const source = bundle.sources.find((s) => s.sourceId === ref.sourceId);
      if (source === undefined) issues.push(`missing_source:${ref.sourceId}`);
      else if (
        r.lifecycleStatus === "active" &&
        (source.documentStatus !== "final" || source.supersededBy !== undefined)
      )
        issues.push(`non_final_source:${ref.sourceId}`);
    }
    if (
      r.lifecycleStatus === "active" &&
      (!["reviewed_by_1", "reviewed_by_2"].includes(r.reviewStatus) ||
        new Set(r.governance.reviews.map((review) => review.reviewer)).size <
          (r.reviewStatus === "reviewed_by_2" ? 2 : 1))
    )
      issues.push(`insufficient_clinical_review:${r.ruleId}`);
    if (r.lifecycleStatus === "active" && r.reviewStatus === "unreviewed")
      issues.push(`unreviewed_active_rule:${r.ruleId}`);
    if (r.compositionPolicy === "replace" && r.supersedes.length === 0)
      issues.push(`replace_without_supersedes:${r.ruleId}`);
  }
  const visiting = new Set<string>(),
    done = new Set<string>();
  const visit = (id: string): void => {
    if (visiting.has(id)) {
      issues.push("supersedes_cycle");
      return;
    }
    if (done.has(id)) return;
    visiting.add(id);
    for (const next of byId.get(id)?.supersedes ?? [])
      if ((global || selected.has(next)) && byId.get(next)?.topicId === topicId) visit(next);
    visiting.delete(id);
    done.add(id);
  };
  for (const r of rules) visit(r.ruleId);
  const selectionKeys = policy.primaryStrategies.filter(selection => selection.topicId === topicId).map((s) =>
    JSON.stringify([s.topicId, s.trackId, s.strategyGroupId]),
  );
  duplicate(selectionKeys, "strategy_selection");
  for (const selection of policy.primaryStrategies) {
    const { ruleId: id, strategyGroupId: group } = selection;
    if (selection.topicId !== topicId) continue;
    const r = byId.get(id);
    if (
      r?.strategyGroupId !== group ||
      r.trackId !== selection.trackId ||
      r.topicId !== selection.topicId ||
      !policy.ruleIds.includes(id)
    )
      issues.push(`invalid_primary_strategy:${group}`);
  }
  for (const id of policy.ruleIds)
    if (
      !policy.topicIds.includes(
        byId.get(id)?.topicId ?? ruleTopics.get(id) ?? "",
      )
    )
      issues.push(`unlisted_policy_topic:${id}`);
  return [...new Set(issues)].sort();
}

/** Runtime integrity is scoped to the active policy and evaluated topic. */
export function contentIssues(
  bundle: Ruleset, policy: Policy, topicId: string,
  ruleTopics: ReadonlyMap<string, string> = new Map(),
): string[] {
  return collectContentIssues(bundle, policy, topicId, ruleTopics, false);
}

/** Full-bundle validation for CI/release: unrelated invalid content is still an error here. */
export function validateBundle(input: unknown): string[] {
  const issues: string[] = [];
  const complete = RulesetSchema.safeParse(input);
  if (!complete.success)
    issues.push(...complete.error.issues.map(issue =>
      `schema:${issue.path.map(String).join(".")}:${issue.code}`));
  const envelope = z.strictObject({
    rulesetVersion: z.string().min(1), rules: z.array(z.unknown()),
    sources: z.array(z.unknown()), policies: z.array(z.unknown()),
    terminology: z.array(IdSchema),
  }).safeParse(input);
  if (!envelope.success) return unique(issues);
  const raw = envelope.data;
  const readId = (item: unknown, key: string): string | undefined => {
    if (item === null || typeof item !== "object") return undefined;
    const result = IdSchema.safeParse(Reflect.get(item, key));
    return result.success ? result.data : undefined;
  };
  for (const [items, key, label] of [
    [raw.rules, "ruleId", "rule_id"],
    [raw.sources, "sourceId", "source_id"],
    [raw.policies, "policyId", "policy_id"],
  ] as const) {
    const ids = items.flatMap(item => { const id = readId(item, key); return id === undefined ? [] : [id]; });
    if (new Set(ids).size !== ids.length) issues.push(`duplicate_${label}`);
  }
  const rules = raw.rules.flatMap(item => {
    const parsed = RuleDefinitionSchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
  const sources = raw.sources.flatMap(item => {
    const parsed = SourceSchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
  const policies = raw.policies.flatMap(item => {
    const parsed = PolicySchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
  const bundle: Ruleset = { ...raw, rules, sources, policies };
  const allTopics = unique(rules.map(rule => rule.topicId));
  const auditPolicy: Policy = {
    policyId: "bundle-validation", label: "Technical bundle validation",
    family: "technical", topicIds: allTopics, ruleIds: rules.map(rule => rule.ruleId),
    primaryStrategies: [],
  };
  for (const topic of allTopics)
    issues.push(...collectContentIssues(bundle, auditPolicy, topic, new Map(), true));
  for (const policy of policies) for (const topic of policy.topicIds)
    issues.push(...collectContentIssues(bundle, policy, topic, new Map(), false));
  for (const source of sources)
    if (source.supersededBy !== undefined && !sources.some(other => other.sourceId === source.supersededBy))
      issues.push(`invalid_source_reference:${source.sourceId}:${source.supersededBy}`);
  return unique(issues);
}
export function assertValidBundle(input: unknown): Ruleset {
  const issues = validateBundle(input);
  if (issues.length > 0) throw new Error(`Invalid content bundle: ${issues.join("; ")}`);
  return RulesetSchema.parse(input);
}
