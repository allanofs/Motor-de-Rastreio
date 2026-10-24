import { RulesetSchema } from "../../model/content";
import { ccrPhase61Policies, ccrPolicies } from "./policies";
import {
  ba45To49Rule,
  baBelow45Rule,
  baOver75Rule,
  ccrPhase61Rules,
  internationalPopulationRules,
  susRoutineRules,
} from "./rules/routine";
import { ccrPhase62StrategyRules } from "./rules/strategies";
import { ccrSources } from "./sources";
import { ccrTerminology } from "./terminology";

export const ccrPhase61Ruleset = RulesetSchema.parse({
  rulesetVersion: "crc-0.1.0-phase6.1-draft",
  rules: ccrPhase61Rules,
  sources: ccrSources,
  policies: ccrPhase61Policies,
  terminology: ccrTerminology,
});

export const ccrPhase62Rules = [
  ...susRoutineRules,
  baBelow45Rule,
  ba45To49Rule,
  baOver75Rule,
  ...internationalPopulationRules,
  ...ccrPhase62StrategyRules,
];

export const ccrPhase62Ruleset = RulesetSchema.parse({
  rulesetVersion: "crc-0.2.0-phase6.2-draft",
  rules: ccrPhase62Rules,
  sources: ccrSources,
  policies: ccrPolicies,
  terminology: ccrTerminology,
});
