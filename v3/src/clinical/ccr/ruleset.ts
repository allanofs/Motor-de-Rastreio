import { RulesetSchema } from "../../model/content";
import {
  ccrPhase61Policies,
  ccrPolicies,
  ccrPhase63Policies,
  ccrPhase64Policies,
  ccrPhase65Policies,
} from "./policies";
import {
  ba45To49Rule,
  baBelow45Rule,
  baOver75Rule,
  ccrPhase61Rules,
  internationalPopulationRules,
  susRoutineRules,
} from "./rules/routine";
import { ccrPhase62StrategyRules } from "./rules/strategies";
import { ccrPhase63FollowupRules } from "./rules/followup";
import { ccrPhase64FamilyRules } from "./rules/family";
import { ccrPhase65SpecialRiskRules } from "./rules/specialRisk";
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

export const ccrPhase63Rules = [
  ...ccrPhase62Rules,
  ...ccrPhase63FollowupRules,
];

export const ccrPhase63Ruleset = RulesetSchema.parse({
  rulesetVersion: "crc-0.3.0-phase6.3-draft",
  rules: ccrPhase63Rules,
  sources: ccrSources,
  policies: ccrPhase63Policies,
  terminology: ccrTerminology,
});

export const ccrPhase64Rules = [
  ...ccrPhase63Rules,
  ...ccrPhase64FamilyRules,
];

export const ccrPhase64Ruleset = RulesetSchema.parse({
  rulesetVersion: "crc-0.4.0-phase6.4-draft",
  rules: ccrPhase64Rules,
  sources: ccrSources,
  policies: ccrPhase64Policies,
  terminology: ccrTerminology,
});

export const ccrPhase65Rules = [
  ...ccrPhase64Rules,
  ...ccrPhase65SpecialRiskRules,
];

export const ccrPhase65Ruleset = RulesetSchema.parse({
  rulesetVersion: "crc-0.5.0-phase6.5-draft",
  rules: ccrPhase65Rules,
  sources: ccrSources,
  policies: ccrPhase65Policies,
  terminology: ccrTerminology,
});
