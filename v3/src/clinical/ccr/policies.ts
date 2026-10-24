import { PolicySchema } from "../../model/content";
import {
  ba45To49Rule,
  baBelow45Rule,
  baOver75Rule,
  brasilAmpliadoRoutineRules,
  internationalPopulationRules,
  susRoutineRules,
} from "./rules/routine";
import {
  baColonoscopyStrategyRule,
  baFitStrategyRule,
  baStrategyChoice50To75Rule,
  internationalStrategyRules,
} from "./rules/strategies";
import { CCR_IDS } from "./terminology";

const phase61SusPolicy = PolicySchema.parse({
  policyId: "crc-policy-sus-oficial",
  label: "CCR — SUS / Brasil oficial",
  family: "sus_oficial",
  topicIds: [CCR_IDS.topic],
  ruleIds: susRoutineRules.map((rule) => rule.ruleId),
  primaryStrategies: [],
});

const phase61BrasilAmpliadoPolicy = PolicySchema.parse({
  policyId: "crc-policy-brasil-ampliado-ba-a",
  label: "CCR — Brasil ampliado BA-A",
  family: "br_ampliado",
  topicIds: [CCR_IDS.topic],
  ruleIds: brasilAmpliadoRoutineRules.map((rule) => rule.ruleId),
  primaryStrategies: [],
});

const phase61InternationalPolicy = PolicySchema.parse({
  policyId: "crc-policy-internacional-uspstf",
  label: "CCR — Internacional (USPSTF governante)",
  family: "internacional",
  topicIds: [CCR_IDS.topic],
  ruleIds: internationalPopulationRules.map((rule) => rule.ruleId),
  primaryStrategies: [],
});

export const ccrPhase61Policies = [
  phase61SusPolicy,
  phase61BrasilAmpliadoPolicy,
  phase61InternationalPolicy,
];

export const susPolicy = PolicySchema.parse({
  ...phase61SusPolicy,
  ruleIds: susRoutineRules.map((rule) => rule.ruleId),
});

export const brasilAmpliadoPolicy = PolicySchema.parse({
  ...phase61BrasilAmpliadoPolicy,
  ruleIds: [
    baBelow45Rule.ruleId,
    ba45To49Rule.ruleId,
    baStrategyChoice50To75Rule.ruleId,
    baOver75Rule.ruleId,
    baFitStrategyRule.ruleId,
    baColonoscopyStrategyRule.ruleId,
  ],
  // Human selection is represented as explicit patient context, not a static policy primary strategy.
  primaryStrategies: [],
});

export const internationalPolicy = PolicySchema.parse({
  ...phase61InternationalPolicy,
  ruleIds: [
    ...internationalPopulationRules.map((rule) => rule.ruleId),
    ...internationalStrategyRules.map((rule) => rule.ruleId),
  ],
  // The policy lists eligible strategies; the engine does not silently select one.
  primaryStrategies: [],
});

export const ccrPolicies = [susPolicy, brasilAmpliadoPolicy, internationalPolicy];
