import { fitPositiveFollowupResolver } from "./fitFollowup";
import {
  colonoscopyStrategyFamilyResolver64,
  familyChoiceResolver64,
  familyHighRiskResolver64,
  familyStatusResolver64,
  fitStrategyFamilyResolver64,
  postFitFamilyResolver64,
  routineFamilyResolver64,
} from "./familyResolvers";
import { populationFamilyGateResolver64 } from "./populationFamilyGate";

export const ccrPhase64Resolvers = [
  routineFamilyResolver64,
  populationFamilyGateResolver64,
  fitStrategyFamilyResolver64,
  colonoscopyStrategyFamilyResolver64,
  fitPositiveFollowupResolver,
  postFitFamilyResolver64,
  familyStatusResolver64,
  familyHighRiskResolver64,
  familyChoiceResolver64,
] as const;
