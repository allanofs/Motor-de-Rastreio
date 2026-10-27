import {
  RuleDefinitionSchema,
  RulesetSchema,
  type RuleDefinition,
} from "../../model/content";
import {
  mamaM3R2Policies,
  mamaM3R2Ruleset,
} from "./r2ReviewedCandidate";
import { mamaM31R2ReviewedSnapshot } from "./m31R2ReviewedCandidate";

export const MAMA_ACTIVE_RULESET_VERSION =
  "breast-0.1.7-m3-1-active" as const;
export const MAMA_ACTIVE_DOMAIN_SNAPSHOT_VERSION =
  "breast-0.1.7-m3-1-domain-active" as const;

function activateReviewedRule(rule: RuleDefinition): RuleDefinition {
  return RuleDefinitionSchema.parse({
    ...rule,
    lifecycleStatus: "active",
    reviewStatus: "reviewed_by_2",
  });
}

/**
 * Activated Mama clinical-content snapshot.
 *
 * This is a lifecycle-only promotion of the independently R2-reviewed M3 core.
 * Clinical logic, rule IDs, policies, sources, terminology, evidence metadata,
 * sourceRefs and reviewer records are inherited unchanged from
 * `breast-0.1.2-m3-r2-reviewed-draft`.
 *
 * `active` means that the clinical content passed the project's content
 * governance and explicit lifecycle-activation gate. It does NOT authorize
 * merge, deploy, public release, patient-facing use, real-world clinical use
 * or regulatory validation.
 */
export const mamaM3ActiveRules =
  mamaM3R2Ruleset.rules.map(activateReviewedRule);

export const mamaM3ActiveRuleset = RulesetSchema.parse({
  ...mamaM3R2Ruleset,
  rulesetVersion: MAMA_ACTIVE_RULESET_VERSION,
  rules: mamaM3ActiveRules,
});

export const mamaM3ActivePolicies = mamaM3R2Policies;

/**
 * Active lifecycle copy of the focused M3.1 reviewed domain snapshot.
 *
 * The reviewed artifacts and anonymous-governance records are preserved
 * byte-for-byte at object-field level; only snapshot version/lifecycle change.
 * This keeps the under-40/domain semantics governed without forcing them into
 * Foundation RuleDefinition when they are intentionally domain-level context.
 */
export const mamaM31ActiveSnapshot = {
  ...mamaM31R2ReviewedSnapshot,
  snapshotVersion: MAMA_ACTIVE_DOMAIN_SNAPSHOT_VERSION,
  lifecycleStatus: "active" as const,
  reviewStatus: "reviewed_by_2" as const,
} as const;
