import { PolicySchema } from "../../model/content";
import {
  brasilAmpliadoRoutineRules,
  internationalPopulationRules,
  susRoutineRules,
} from "./rules/routine";
import { CCR_IDS } from "./terminology";

export const susPolicy = PolicySchema.parse({
  policyId: "crc-policy-sus-oficial",
  label: "CCR — SUS / Brasil oficial",
  family: "sus_oficial",
  topicIds: [CCR_IDS.topic],
  ruleIds: susRoutineRules.map((rule) => rule.ruleId),
  primaryStrategies: [],
});

export const brasilAmpliadoPolicy = PolicySchema.parse({
  policyId: "crc-policy-brasil-ampliado-ba-a",
  label: "CCR — Brasil ampliado BA-A",
  family: "br_ampliado",
  topicIds: [CCR_IDS.topic],
  ruleIds: brasilAmpliadoRoutineRules.map((rule) => rule.ruleId),
  primaryStrategies: [],
});

export const internationalPolicy = PolicySchema.parse({
  policyId: "crc-policy-internacional-uspstf",
  label: "CCR — Internacional (USPSTF governante)",
  family: "internacional",
  topicIds: [CCR_IDS.topic],
  ruleIds: internationalPopulationRules.map((rule) => rule.ruleId),
  primaryStrategies: [],
});

export const ccrPolicies = [susPolicy, brasilAmpliadoPolicy, internationalPolicy];
