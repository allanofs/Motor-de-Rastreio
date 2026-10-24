import {
  fitPositiveFollowupResolver,
  postFitRoutineResolver,
} from "./fitFollowup";
import {
  baStrategyChoiceResolver63,
  colonoscopyStrategyCoverageResolver63,
  fitStrategyCoverageResolver63,
  internationalStrategyChoiceResolver63,
  susRoutineLongitudinalResolver63,
} from "./strategyCoverage63";

export const ccrPhase63Resolvers = [
  susRoutineLongitudinalResolver63,
  baStrategyChoiceResolver63,
  internationalStrategyChoiceResolver63,
  fitStrategyCoverageResolver63,
  colonoscopyStrategyCoverageResolver63,
  fitPositiveFollowupResolver,
  postFitRoutineResolver,
] as const;
