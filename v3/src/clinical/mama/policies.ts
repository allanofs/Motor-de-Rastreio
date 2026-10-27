import { PolicySchema } from "../../model/content";
import { mamaM3HardExitRules } from "./rules/hardExits";
import {
  brasilAmpliadoM3RoutineRules,
  internationalM3RoutineRules,
  susM3RoutineRules,
} from "./rules/routine";
import { MAMA_IDS } from "./terminology";

function ruleIds(rules: readonly { ruleId: string }[]) {
  return rules.map((rule) => rule.ruleId);
}

const commonHardExitRuleIds = ruleIds(mamaM3HardExitRules);

export const mamaSusM3DraftPolicy = PolicySchema.parse({
  policyId: "breast-policy-sus-oficial-m3-draft",
  label: "Mama — SUS / Brasil oficial — M3 draft",
  family: "sus_oficial",
  topicIds: [MAMA_IDS.topic],
  ruleIds: [...ruleIds(susM3RoutineRules), ...commonHardExitRuleIds],
  primaryStrategies: [],
});

export const mamaBrasilAmpliadoM3DraftPolicy = PolicySchema.parse({
  policyId: "breast-policy-brasil-ampliado-m3-draft",
  label: "Mama — Brasil ampliado — núcleo mamográfico M3 draft",
  family: "br_ampliado",
  topicIds: [MAMA_IDS.topic],
  ruleIds: [
    ...ruleIds(brasilAmpliadoM3RoutineRules),
    ...commonHardExitRuleIds,
  ],
  primaryStrategies: [],
});

export const mamaInternationalM3DraftPolicy = PolicySchema.parse({
  policyId: "breast-policy-internacional-uspstf-m3-draft",
  label: "Mama — Internacional (USPSTF) — M3 draft",
  family: "internacional",
  topicIds: [MAMA_IDS.topic],
  ruleIds: [...ruleIds(internationalM3RoutineRules), ...commonHardExitRuleIds],
  primaryStrategies: [],
});

export const mamaM3DraftPolicies = [
  mamaSusM3DraftPolicy,
  mamaBrasilAmpliadoM3DraftPolicy,
  mamaInternationalM3DraftPolicy,
];
