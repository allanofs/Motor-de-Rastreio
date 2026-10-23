import type { Policy, RuleDefinition } from "../model/content";
export function resolveStrategies(
  rules: RuleDefinition[],
  policy: Policy,
): {
  active: RuleDefinition[];
  suppressed: { ruleId: string; reason: string }[];
  conflicts: string[];
} {
  const suppressed: { ruleId: string; reason: string }[] = [],
    conflicts: string[] = [];
  // Supersession precedes strategy selection; only applicable rules may suppress another.
  let active = rules.filter((r) => {
    const superseder = rules.find((other) =>
      other.supersedes.includes(r.ruleId),
    );
    if (superseder !== undefined) {
      suppressed.push({
        ruleId: r.ruleId,
        reason: `superseded_by:${superseder.ruleId}`,
      });
      return false;
    }
    return true;
  });
  const groups = new Set(
    active.flatMap((r) =>
      r.strategyGroupId === undefined ? [] : [r.strategyGroupId],
    ),
  );
  for (const group of groups) {
    const candidates = active.filter((r) => r.strategyGroupId === group);
    const selected = policy.primaryStrategies[group];
    if (selected !== undefined) {
      if (!candidates.some((r) => r.ruleId === selected)) {
        conflicts.push(...candidates.map((r) => r.ruleId));
        continue;
      }
      active = active.filter((r) => {
        if (r.strategyGroupId === group && r.ruleId !== selected) {
          suppressed.push({
            ruleId: r.ruleId,
            reason: `policy_strategy:${selected}`,
          });
          return false;
        }
        return true;
      });
    } else if (candidates.length > 1)
      conflicts.push(...candidates.map((r) => r.ruleId));
  }
  for (const r of active)
    for (const other of active)
      if (r.excludes.includes(other.ruleId))
        conflicts.push(r.ruleId, other.ruleId);
  return { active, suppressed, conflicts: [...new Set(conflicts)].sort() };
}
