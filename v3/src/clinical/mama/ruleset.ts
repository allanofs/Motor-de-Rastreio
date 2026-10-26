import { RulesetSchema } from "../../model/content";
import { mamaM3DraftPolicies } from "./policies";
import { mamaM3HardExitRules } from "./rules/hardExits";
import {
  brasilAmpliadoM3RoutineRules,
  internationalM3RoutineRules,
  susM3RoutineRules,
} from "./rules/routine";
import { mamaSources } from "./sources";
import { mamaTerminology } from "./terminology";

export const mamaM3DraftRules = [
  ...susM3RoutineRules,
  ...brasilAmpliadoM3RoutineRules,
  ...internationalM3RoutineRules,
  ...mamaM3HardExitRules,
];

/**
 * First executable breast-screening ruleset. It is intentionally draft-only:
 * every rule remains lifecycleStatus=draft and reviewStatus=source_verified.
 */
export const mamaM3DraftRuleset = RulesetSchema.parse({
  rulesetVersion: "breast-0.1.0-m3-draft",
  rules: mamaM3DraftRules,
  sources: mamaSources,
  policies: mamaM3DraftPolicies,
  terminology: mamaTerminology,
});
