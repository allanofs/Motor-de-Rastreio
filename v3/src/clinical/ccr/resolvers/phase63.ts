import {
  fitPositiveFollowupResolver,
  postFitRoutineResolver,
} from "./fitFollowup";
import {
  colonoscopyStrategyCoverageResolver63,
  fitStrategyCoverageResolver63,
  internationalStrategyChoiceResolver63,
  routineLongitudinalResolver63,
} from "./strategyCoverage63";

export const ccrPhase63Resolvers = [
  routineLongitudinalResolver63,
  internationalStrategyChoiceResolver63,
  fitStrategyCoverageResolver63,
  colonoscopyStrategyCoverageResolver63,
  fitPositiveFollowupResolver,
  postFitRoutineResolver,
] as const;
