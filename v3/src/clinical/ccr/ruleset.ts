import { RulesetSchema } from "../../model/content";
import { ccrPolicies } from "./policies";
import { ccrPhase61Rules } from "./rules/routine";
import { ccrSources } from "./sources";
import { ccrTerminology } from "./terminology";

export const ccrPhase61Ruleset = RulesetSchema.parse({
  rulesetVersion: "crc-0.1.0-phase6.1-draft",
  rules: ccrPhase61Rules,
  sources: ccrSources,
  policies: ccrPolicies,
  terminology: ccrTerminology,
});
