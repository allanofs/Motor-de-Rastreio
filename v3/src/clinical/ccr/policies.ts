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
import {
  baPhase63FollowupRules,
  internationalPhase63FollowupRules,
  susPhase63FollowupRules,
} from "./rules/followup";
import {
  baPhase64FamilyRules,
  internationalPhase64FamilyRules,
  susPhase64FamilyRules,
} from "./rules/family";
import {
  baPhase65SpecialRiskRules,
  internationalPhase65SpecialRiskRules,
  susPhase65SpecialRiskRules,
} from "./rules/specialRisk";
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
  primaryStrategies: [],
});

export const internationalPolicy = PolicySchema.parse({
  ...phase61InternationalPolicy,
  ruleIds: [
    ...internationalPopulationRules.map((rule) => rule.ruleId),
    ...internationalStrategyRules.map((rule) => rule.ruleId),
  ],
  primaryStrategies: [],
});

export const ccrPolicies = [susPolicy, brasilAmpliadoPolicy, internationalPolicy];

export const susPhase63Policy = PolicySchema.parse({
  ...susPolicy,
  ruleIds: [
    ...susPolicy.ruleIds,
    ...susPhase63FollowupRules.map((rule) => rule.ruleId),
  ],
});

export const brasilAmpliadoPhase63Policy = PolicySchema.parse({
  ...brasilAmpliadoPolicy,
  ruleIds: [
    ...brasilAmpliadoPolicy.ruleIds,
    ...baPhase63FollowupRules.map((rule) => rule.ruleId),
  ],
});

export const internationalPhase63Policy = PolicySchema.parse({
  ...internationalPolicy,
  ruleIds: [
    ...internationalPolicy.ruleIds,
    ...internationalPhase63FollowupRules.map((rule) => rule.ruleId),
  ],
});

export const ccrPhase63Policies = [
  susPhase63Policy,
  brasilAmpliadoPhase63Policy,
  internationalPhase63Policy,
];

export const susPhase64Policy = PolicySchema.parse({
  ...susPhase63Policy,
  ruleIds: [
    ...susPhase63Policy.ruleIds,
    ...susPhase64FamilyRules.map((rule) => rule.ruleId),
  ],
});

export const brasilAmpliadoPhase64Policy = PolicySchema.parse({
  ...brasilAmpliadoPhase63Policy,
  ruleIds: [
    ...brasilAmpliadoPhase63Policy.ruleIds,
    ...baPhase64FamilyRules.map((rule) => rule.ruleId),
  ],
});

export const internationalPhase64Policy = PolicySchema.parse({
  ...internationalPhase63Policy,
  ruleIds: [
    ...internationalPhase63Policy.ruleIds,
    ...internationalPhase64FamilyRules.map((rule) => rule.ruleId),
  ],
});

export const ccrPhase64Policies = [
  susPhase64Policy,
  brasilAmpliadoPhase64Policy,
  internationalPhase64Policy,
];

export const susPhase65Policy = PolicySchema.parse({
  ...susPhase64Policy,
  ruleIds: [
    ...susPhase64Policy.ruleIds,
    ...susPhase65SpecialRiskRules.map((rule) => rule.ruleId),
  ],
});

export const brasilAmpliadoPhase65Policy = PolicySchema.parse({
  ...brasilAmpliadoPhase64Policy,
  ruleIds: [
    ...brasilAmpliadoPhase64Policy.ruleIds,
    ...baPhase65SpecialRiskRules.map((rule) => rule.ruleId),
  ],
});

export const internationalPhase65Policy = PolicySchema.parse({
  ...internationalPhase64Policy,
  ruleIds: [
    ...internationalPhase64Policy.ruleIds,
    ...internationalPhase65SpecialRiskRules.map((rule) => rule.ruleId),
  ],
});

export const ccrPhase65Policies = [
  susPhase65Policy,
  brasilAmpliadoPhase65Policy,
  internationalPhase65Policy,
];
