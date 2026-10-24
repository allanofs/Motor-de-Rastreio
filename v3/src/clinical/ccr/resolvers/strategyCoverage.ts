import type {
  DomainResolver,
  DomainResolution,
  DomainResolverInput,
} from "../../../engine/extensions";
import { qualifyingEvents } from "../../../engine/resolveHistory";
import {
  dueWindow,
  scheduleStatus,
  temporalRelation,
  type CalendarDate,
  type CalendarDuration,
} from "../../../model/dates";
import type { ExamRecord } from "../../../model/patient";
import {
  colonoscopyScreeningAction,
  fitScreeningAction,
  offerScreeningStrategyAction,
} from "../actions";
import { CCR_IDS, CCR_STRATEGY_VALUES } from "../terminology";

const fitQualifier = {
  modality: CCR_IDS.modalities.fit,
  resultCodes: [CCR_IDS.results.fitNegative],
  requireAdequateQuality: true,
  requireComplete: false,
  requireSufficientResolution: true,
};

const screeningColonoscopyQualifier = {
  modality: CCR_IDS.modalities.colonoscopyScreening,
  resultCodes: [CCR_IDS.results.colonoscopyNormal],
  requireAdequateQuality: true,
  requireComplete: true,
  requireSufficientResolution: true,
};

type Strategy = (typeof CCR_STRATEGY_VALUES)[keyof typeof CCR_STRATEGY_VALUES];
type SupportedFamily = "br_ampliado" | "internacional";
type Coverage =
  | { status: "none"; evidenceRecordIds: string[] }
  | { status: "Current" | "Due" | "Indeterminate"; evidenceRecordIds: string[] };

function intervalFor(
  family: SupportedFamily,
  strategy: Strategy,
): CalendarDuration {
  if (strategy === CCR_STRATEGY_VALUES.colonoscopy)
    return { unit: "years", amount: 10 };
  return family === "br_ampliado"
    ? { unit: "years", amount: 2 }
    : { unit: "years", amount: 1 };
}

function coverageFor(
  events: readonly ExamRecord[],
  strategy: Strategy,
  family: SupportedFamily,
  asOf: CalendarDate,
): Coverage {
  const qualifier =
    strategy === CCR_STRATEGY_VALUES.fit
      ? fitQualifier
      : screeningColonoscopyQualifier;
  const qualifying = qualifyingEvents([...events], qualifier);
  if (qualifying.length === 0) return { status: "none", evidenceRecordIds: [] };
  if (
    qualifying.some(
      (event) => event.status !== "performed" || event.date === undefined,
    )
  )
    return {
      status: "Indeterminate",
      evidenceRecordIds: qualifying.map((event) => event.id),
    };

  const latest = qualifying.filter((event) =>
    qualifying.every(
      (other) =>
        event.id === other.id ||
        (event.status === "performed" &&
          other.status === "performed" &&
          event.date !== undefined &&
          other.date !== undefined &&
          ["after", "same_day"].includes(
            temporalRelation(event.date, other.date),
          )),
    ),
  );
  const anchor = latest.sort((a, b) => a.id.localeCompare(b.id, "en"))[0];
  if (anchor?.status !== "performed" || anchor.date === undefined)
    return {
      status: "Indeterminate",
      evidenceRecordIds: qualifying.map((event) => event.id),
    };

  return {
    status: scheduleStatus(
      dueWindow(anchor.date, intervalFor(family, strategy)),
      asOf,
    ),
    evidenceRecordIds: [anchor.id],
  };
}

function strategySelection(
  facts: readonly { conceptId: string; presence: string; value?: unknown }[],
): { value?: Strategy; conflict: boolean } {
  const values = facts.flatMap((fact) => {
    if (
      fact.conceptId !== CCR_IDS.concepts.screeningStrategySelection ||
      fact.presence !== "yes"
    )
      return [];
    return fact.value === CCR_STRATEGY_VALUES.fit ||
      fact.value === CCR_STRATEGY_VALUES.colonoscopy
      ? [fact.value]
      : [];
  });
  const unique = [...new Set(values)];
  return unique.length === 1
    ? { value: unique[0]!, conflict: false }
    : { conflict: unique.length > 1 };
}

function historyIsSufficient(input: {
  knowledge: string;
  facts: readonly { conceptId: string; presence: string }[];
}): boolean {
  return (
    input.knowledge === "never_performed" ||
    input.facts.some(
      (fact) =>
        fact.conceptId === CCR_IDS.concepts.historySufficientForCurrentStatus &&
        fact.presence === "yes",
    )
  );
}

function evidenceIds(...coverages: Coverage[]): string[] {
  return [...new Set(coverages.flatMap((item) => item.evidenceRecordIds))].sort();
}

function cloneState(input: DomainResolverInput): DomainResolution["state"] {
  return structuredClone(input.genericTrack.state) as DomainResolution["state"];
}

function noActionState(
  state: DomainResolution["state"],
  evidenceRecordIds: string[],
  missingData: string[] = [],
  guardrails: string[] = [],
): DomainResolution {
  return {
    state,
    actionIds: [],
    decisionSupportIds: [],
    evidenceRecordIds,
    missingData,
    guardrails,
  };
}

function mirrorGeneric(input: DomainResolverInput): DomainResolution {
  return {
    state: cloneState(input),
    actionIds: input.genericTrack.actions.map((action) => action.actionId),
    decisionSupportIds: input.genericTrack.decisionSupport.map(
      (item) => item.considerationId,
    ),
    evidenceRecordIds: [...input.genericTrack.trace.recordsUsed],
    missingData: [...input.genericTrack.missingData],
    guardrails: [],
  };
}

function supportedFamily(input: DomainResolverInput): SupportedFamily | undefined {
  return input.policy.family === "br_ampliado" ||
    input.policy.family === "internacional"
    ? input.policy.family
    : undefined;
}

function strategyCoverageResolver(
  trackId: string,
  ownStrategy: Strategy,
  ownActionId: string,
): DomainResolver {
  return {
    resolverId: `crc-strategy-coverage-${ownStrategy}-phase6.2`,
    version: "6.2",
    topicId: CCR_IDS.topic,
    trackId,
    requiredConceptIds: [
      CCR_IDS.concepts.screeningStrategySelection,
      CCR_IDS.concepts.historySufficientForCurrentStatus,
    ],
    resolve(input) {
      const family = supportedFamily(input);
      if (family === undefined) return mirrorGeneric(input);

      const fit = coverageFor(
        input.history.events,
        CCR_STRATEGY_VALUES.fit,
        family,
        input.asOf,
      );
      const colonoscopy = coverageFor(
        input.history.events,
        CCR_STRATEGY_VALUES.colonoscopy,
        family,
        input.asOf,
      );
      const own =
        ownStrategy === CCR_STRATEGY_VALUES.fit ? fit : colonoscopy;
      const other =
        ownStrategy === CCR_STRATEGY_VALUES.fit ? colonoscopy : fit;

      if (input.genericTrack.state.status === "Current")
        return noActionState(cloneState(input), own.evidenceRecordIds, [], [
          "Future strategy preference does not erase current coverage.",
        ]);

      if (other.status === "Current")
        return noActionState(
          {
            status: "NotApplicable",
            reason: "Another approved screening modality still provides current coverage",
          },
          other.evidenceRecordIds,
          [],
          [
            "Do not offer redundant screening while valid cross-modality coverage remains current.",
          ],
        );

      if (own.status === "Indeterminate" || other.status === "Indeterminate")
        return noActionState(
          {
            status: "Indeterminate",
            reason:
              "Current screening coverage cannot be established with available date precision",
          },
          evidenceIds(own, other),
          ["crc_coverage_date_precision"],
        );

      const selection = strategySelection(input.patient.facts);
      if (selection.conflict)
        return noActionState(
          {
            status: "Indeterminate",
            reason: "Conflicting screening strategy selections",
          },
          evidenceIds(own, other),
          ["crc_strategy_selection_conflict"],
        );
      if (selection.value === undefined)
        return noActionState(
          {
            status: "Indeterminate",
            reason: "A human screening strategy selection is required",
          },
          evidenceIds(own, other),
          [CCR_IDS.concepts.screeningStrategySelection],
          [
            "The engine must not choose FIT versus colonoscopy on behalf of the clinician/patient.",
          ],
        );
      if (selection.value !== ownStrategy)
        return noActionState(
          {
            status: "NotApplicable",
            reason: "A different screening strategy was explicitly selected",
          },
          evidenceIds(own, other),
        );

      if (
        !historyIsSufficient({
          knowledge: input.history.knowledge,
          facts: input.patient.facts,
        })
      )
        return noActionState(
          {
            status: "Indeterminate",
            reason:
              "Screening history is insufficient to exclude still-current coverage",
          },
          evidenceIds(own, other),
          [CCR_IDS.concepts.historySufficientForCurrentStatus],
        );

      return {
        state: { status: "Due" },
        actionIds: [ownActionId],
        decisionSupportIds: [],
        evidenceRecordIds: evidenceIds(own, other),
        missingData: [],
        guardrails: [
          "The selected strategy determines the next action only after current coverage is excluded.",
        ],
      };
    },
  };
}

function choicePromptResolver(trackId: string): DomainResolver {
  return {
    resolverId: `crc-strategy-choice-${trackId}-phase6.2`,
    version: "6.2",
    topicId: CCR_IDS.topic,
    trackId,
    requiredConceptIds: [
      CCR_IDS.concepts.screeningStrategySelection,
      CCR_IDS.concepts.historySufficientForCurrentStatus,
    ],
    resolve(input) {
      if (input.genericTrack.state.status !== "Due") return mirrorGeneric(input);
      const family = supportedFamily(input);
      if (family === undefined) return mirrorGeneric(input);

      const fit = coverageFor(
        input.history.events,
        CCR_STRATEGY_VALUES.fit,
        family,
        input.asOf,
      );
      const colonoscopy = coverageFor(
        input.history.events,
        CCR_STRATEGY_VALUES.colonoscopy,
        family,
        input.asOf,
      );

      if (fit.status === "Current" || colonoscopy.status === "Current")
        return noActionState(
          {
            status: "NotApplicable",
            reason:
              "Current screening coverage makes a new strategy action unnecessary today",
          },
          evidenceIds(fit, colonoscopy),
        );
      if (fit.status === "Indeterminate" || colonoscopy.status === "Indeterminate")
        return noActionState(
          {
            status: "Indeterminate",
            reason:
              "Clarify current screening coverage before selecting the next strategy",
          },
          evidenceIds(fit, colonoscopy),
          ["crc_coverage_date_precision"],
        );

      const selection = strategySelection(input.patient.facts);
      if (selection.conflict)
        return noActionState(
          {
            status: "Indeterminate",
            reason: "Conflicting screening strategy selections",
          },
          evidenceIds(fit, colonoscopy),
          ["crc_strategy_selection_conflict"],
        );
      if (selection.value !== undefined)
        return noActionState(
          {
            status: "NotApplicable",
            reason: "Screening strategy has already been explicitly selected",
          },
          evidenceIds(fit, colonoscopy),
        );

      if (
        !historyIsSufficient({
          knowledge: input.history.knowledge,
          facts: input.patient.facts,
        })
      )
        return noActionState(
          {
            status: "Indeterminate",
            reason:
              "Clarify screening history before deciding that a new round is due",
          },
          evidenceIds(fit, colonoscopy),
          [CCR_IDS.concepts.historySufficientForCurrentStatus],
        );

      return {
        state: { status: "Due" },
        actionIds: [offerScreeningStrategyAction.actionId],
        decisionSupportIds: [],
        evidenceRecordIds: evidenceIds(fit, colonoscopy),
        missingData: [],
        guardrails: [
          "Strategy choice remains human; the engine only identifies when a new round needs a strategy.",
        ],
      };
    },
  };
}

export const fitStrategyCoverageResolver = strategyCoverageResolver(
  CCR_IDS.tracks.fitStrategy,
  CCR_STRATEGY_VALUES.fit,
  fitScreeningAction.actionId,
);

export const colonoscopyStrategyCoverageResolver = strategyCoverageResolver(
  CCR_IDS.tracks.colonoscopyStrategy,
  CCR_STRATEGY_VALUES.colonoscopy,
  colonoscopyScreeningAction.actionId,
);

export const baStrategyChoiceResolver = choicePromptResolver(CCR_IDS.tracks.routine);
export const internationalStrategyChoiceResolver = choicePromptResolver(
  CCR_IDS.tracks.population,
);

export const ccrPhase62Resolvers = [
  baStrategyChoiceResolver,
  internationalStrategyChoiceResolver,
  fitStrategyCoverageResolver,
  colonoscopyStrategyCoverageResolver,
] as const;
