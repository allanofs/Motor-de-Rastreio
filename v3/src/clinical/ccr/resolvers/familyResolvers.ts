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
import {
  fitPositiveFollowupResolver,
  postFitRoutineResolver,
} from "./fitFollowup";
import {
  classifyFamilyHistory,
  highRiskStartAge,
  type FamilyProfile,
} from "./familyHistory";
import {
  analyzeFitHistory,
  fitEpisodeEvidence,
} from "./fitEpisodes";
import {
  colonoscopyStrategyCoverageResolver63,
  fitStrategyCoverageResolver63,
  internationalStrategyChoiceResolver63,
  routineLongitudinalResolver63,
} from "./strategyCoverage63";

type Coverage =
  | { status: "none"; evidenceRecordIds: string[] }
  | {
      status: "Current" | "Due" | "Indeterminate";
      evidenceRecordIds: string[];
    };

function cloneState(input: DomainResolverInput): DomainResolution["state"] {
  return structuredClone(input.genericTrack.state) as DomainResolution["state"];
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

function noAction(
  state: DomainResolution["state"],
  evidenceRecordIds: string[] = [],
  options: {
    missingData?: string[];
    guardrails?: string[];
  } = {},
): DomainResolution {
  return {
    state,
    actionIds: [],
    decisionSupportIds: [],
    evidenceRecordIds,
    missingData: options.missingData ?? [],
    guardrails: options.guardrails ?? [],
  };
}

function historySufficient(input: DomainResolverInput): boolean {
  return (
    input.history.knowledge === "never_performed" ||
    input.patient.facts.some(
      (fact) =>
        fact.conceptId === CCR_IDS.concepts.historySufficientForCurrentStatus &&
        fact.presence === "yes",
    )
  );
}

function strategySelection(input: DomainResolverInput):
  | "fit"
  | "colonoscopy"
  | "conflict"
  | undefined {
  const values = input.patient.facts.flatMap((fact) => {
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
  if (unique.length > 1) return "conflict";
  return unique[0];
}

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

function latestQualifying(
  events: readonly ExamRecord[],
  qualifier: typeof fitQualifier | typeof screeningColonoscopyQualifier,
): ExamRecord | undefined {
  const qualifying = qualifyingEvents([...events], qualifier);
  const latest = qualifying.filter((event) =>
    qualifying.every((other) => {
      if (event.id === other.id) return true;
      if (
        event.status !== "performed" ||
        other.status !== "performed" ||
        event.date === undefined ||
        other.date === undefined
      )
        return false;
      return ["after", "same_day"].includes(
        temporalRelation(event.date, other.date),
      );
    }),
  );
  return latest.sort((a, b) => a.id.localeCompare(b.id, "en"))[0];
}

function coverage(
  events: readonly ExamRecord[],
  qualifier: typeof fitQualifier | typeof screeningColonoscopyQualifier,
  interval: CalendarDuration,
  asOf: CalendarDate,
): Coverage {
  const anchor = latestQualifying(events, qualifier);
  if (anchor === undefined) return { status: "none", evidenceRecordIds: [] };
  if (anchor.status !== "performed" || anchor.date === undefined)
    return { status: "Indeterminate", evidenceRecordIds: [anchor.id] };
  return {
    status: scheduleStatus(dueWindow(anchor.date, interval), asOf),
    evidenceRecordIds: [anchor.id],
  };
}

function averageCoverage(input: DomainResolverInput): {
  fit: Coverage;
  colonoscopy: Coverage;
} {
  return {
    fit: coverage(
      input.history.events,
      fitQualifier,
      { unit: "years", amount: 1 },
      input.asOf,
    ),
    colonoscopy: coverage(
      input.history.events,
      screeningColonoscopyQualifier,
      { unit: "years", amount: 10 },
      input.asOf,
    ),
  };
}

function unresolvedPositiveFit(input: DomainResolverInput): boolean {
  const analysis = analyzeFitHistory(input.history.events);
  return analysis.episodes.some((episode) =>
    ["open", "ambiguous", "pending_result", "specialized"].includes(
      episode.status,
    ),
  );
}

function familyProfile(input: DomainResolverInput): FamilyProfile {
  return classifyFamilyHistory(input.patient.facts);
}

function familyUnknownResolution(profile: FamilyProfile): DomainResolution | undefined {
  if (profile.kind === "unknown")
    return noAction(
      {
        status: "Indeterminate",
        reason:
          "Family history is unknown/not established; do not assume average risk when it could change screening strategy.",
      },
      [],
      { missingData: [CCR_IDS.concepts.familyHistoryRelevant] },
    );
  if (profile.kind === "incomplete")
    return noAction(
      {
        status: "Indeterminate",
        reason:
          "Known family history is incomplete and the missing detail can change the screening pathway.",
      },
      [],
      { missingData: profile.missingData },
    );
  if (profile.kind === "complex")
    return noAction(
      { status: "ClinicalReviewRequired", reason: profile.reason },
      [],
      {
        guardrails: [
          "Complex/uncertain family-history patterns and unknown polyp type are not forced into a simplified automated algorithm.",
        ],
      },
    );
  return undefined;
}

export const familyStatusResolver64: DomainResolver = {
  resolverId: "crc-family-status-phase6.4",
  version: "6.4",
  topicId: CCR_IDS.topic,
  trackId: CCR_IDS.tracks.familyStatus,
  requiredConceptIds: [CCR_IDS.concepts.familyHistoryRelevant],
  resolve(input) {
    const profile = familyProfile(input);
    const unresolved = familyUnknownResolution(profile);
    if (unresolved !== undefined) return unresolved;
    if (profile.kind === "none")
      return noAction({ status: "NotApplicable", reason: "No relevant family history reported." });

    if (input.policy.family === "sus_oficial" || input.policy.family === "br_ampliado")
      return noAction(
        {
          status: "ClinicalReviewRequired",
          reason:
            "Relevant positive family history exits the simple Brazilian routine pilot; no foreign family-history algorithm is imported automatically.",
        },
        [],
        {
          guardrails: [
            "SUS/BA-A intentionally abstain rather than silently applying ACG intervals.",
          ],
        },
      );

    return noAction(
      {
        status: "NotApplicable",
        reason:
          "A narrow, sufficiently classified family-history pattern is delegated to the dedicated International family tracks.",
      },
    );
  },
};

export const familyHighRiskResolver64: DomainResolver = {
  resolverId: "crc-family-high-risk-phase6.4",
  version: "6.4",
  topicId: CCR_IDS.topic,
  trackId: CCR_IDS.tracks.familyHighRisk,
  requiredConceptIds: [
    CCR_IDS.concepts.familyHistoryRelevant,
    CCR_IDS.concepts.historySufficientForCurrentStatus,
  ],
  resolve(input) {
    const profile = familyProfile(input);
    if (profile.kind !== "high-risk")
      return noAction({
        status: "NotApplicable",
        reason: "The ACG q5 high-risk family pattern is not present.",
      });
    if (input.policy.family !== "internacional")
      return noAction({ status: "NotApplicable", reason: "ACG family algorithm is International-only." });
    if (unresolvedPositiveFit(input))
      return noAction(
        {
          status: "NotApplicable",
          reason: "Diagnostic FIT-positive follow-up has priority over routine family-history screening.",
        },
        fitEpisodeEvidence(analyzeFitHistory(input.history.events)),
      );

    const analysis = analyzeFitHistory(input.history.events);
    if (analysis.resolvedPairs.length > 0)
      return noAction(
        {
          status: "ClinicalReviewRequired",
          reason:
            "A normal diagnostic post-FIT colonoscopy is present in a high-risk family-history patient; this pilot does not silently convert that diagnostic exam into the q5 family clock.",
        },
        fitEpisodeEvidence(analysis),
      );

    const age = input.patient.context.ageYears;
    if (age === undefined)
      return noAction(
        { status: "Indeterminate", reason: "Age is required for the ACG family-history start threshold." },
        [],
        { missingData: ["ageYears"] },
      );

    let startAge = 40;
    if (age < 40) {
      const start = highRiskStartAge(profile);
      if (start.status === "needs-exact-age")
        return noAction(
          {
            status: "Indeterminate",
            reason:
              "Patient is younger than 40 and the exact youngest relative diagnosis age is needed to determine whether the 10-years-earlier rule has already been reached.",
          },
          [],
          { missingData: ["youngest-diagnosis-age-years"] },
        );
      if (start.status === "clinical-review")
        return noAction(
          {
            status: "ClinicalReviewRequired",
            reason:
              "Calculated family-history start age would fall below the adult pilot boundary; hereditary-risk review is required.",
          },
        );
      if (start.status === "known") startAge = start.age;
    }

    if (age < startAge)
      return noAction({
        status: "NotApplicable",
        reason: `ACG high-risk family screening starts at age ${startAge} for the available family history.`,
      });

    if (input.genericTrack.state.status === "Current")
      return mirrorGeneric(input);
    if (input.genericTrack.state.status === "Due")
      return {
        ...mirrorGeneric(input),
        guardrails: [
          "High-risk ACG family pathway uses colonoscopy every 5 years.",
        ],
      };
    if (historySufficient(input))
      return {
        state: { status: "Due" },
        actionIds: [colonoscopyScreeningAction.actionId],
        decisionSupportIds: [],
        evidenceRecordIds: [],
        missingData: [],
        guardrails: [
          "Reviewed history is sufficient to exclude current qualifying q5 colonoscopy coverage.",
        ],
      };

    return noAction(
      {
        status: "Indeterminate",
        reason: "Screening history is insufficient to determine current q5 colonoscopy coverage.",
      },
      [],
      { missingData: [CCR_IDS.concepts.historySufficientForCurrentStatus] },
    );
  },
};

export const familyChoiceResolver64: DomainResolver = {
  resolverId: "crc-family-choice-phase6.4",
  version: "6.4",
  topicId: CCR_IDS.topic,
  trackId: CCR_IDS.tracks.familyChoice,
  requiredConceptIds: [
    CCR_IDS.concepts.familyHistoryRelevant,
    CCR_IDS.concepts.screeningStrategySelection,
    CCR_IDS.concepts.historySufficientForCurrentStatus,
  ],
  resolve(input) {
    const profile = familyProfile(input);
    if (profile.kind !== "one-fdr-60-plus" || input.policy.family !== "internacional")
      return noAction({ status: "NotApplicable", reason: "This ACG family choice bridge does not apply." });
    const age = input.patient.context.ageYears;
    if (age === undefined || age < 40 || age > 44)
      return noAction({ status: "NotApplicable", reason: "Family choice bridge is limited to ages 40–44." });
    if (unresolvedPositiveFit(input))
      return noAction({
        status: "NotApplicable",
        reason: "Diagnostic FIT-positive follow-up has priority over routine family screening choice.",
      });

    const current = averageCoverage(input);
    if (current.fit.status === "Current" || current.colonoscopy.status === "Current")
      return noAction(
        {
          status: "NotApplicable",
          reason: "Current average-risk interval coverage means no new strategy choice is needed today.",
        },
        [...current.fit.evidenceRecordIds, ...current.colonoscopy.evidenceRecordIds],
      );
    if (current.fit.status === "Indeterminate" || current.colonoscopy.status === "Indeterminate")
      return noAction(
        { status: "Indeterminate", reason: "Current coverage cannot be established from available date precision." },
        [...current.fit.evidenceRecordIds, ...current.colonoscopy.evidenceRecordIds],
        { missingData: ["crc_family_coverage_date_precision"] },
      );

    const selection = strategySelection(input);
    if (selection === "conflict")
      return noAction(
        { status: "Indeterminate", reason: "Conflicting screening strategy selections." },
        [],
        { missingData: ["crc_strategy_selection_conflict"] },
      );
    if (selection !== undefined)
      return noAction({ status: "NotApplicable", reason: "A screening strategy was already selected." });
    if (!historySufficient(input))
      return noAction(
        { status: "Indeterminate", reason: "Clarify screening history before starting a new family-history screening round." },
        [],
        { missingData: [CCR_IDS.concepts.historySufficientForCurrentStatus] },
      );

    return {
      state: { status: "Due" },
      actionIds: [offerScreeningStrategyAction.actionId],
      decisionSupportIds: [],
      evidenceRecordIds: [],
      missingData: [],
      guardrails: [
        "For one FDR diagnosed at age 60 or older, ACG begins screening at age 40 and then uses average-risk modalities/intervals; strategy choice remains human.",
      ],
    };
  },
};

function familyGateForStrategy(base: DomainResolver): DomainResolver {
  return {
    ...base,
    resolverId: `${base.resolverId}-family-phase6.4`,
    version: "6.4",
    requiredConceptIds: [
      ...new Set([...base.requiredConceptIds, CCR_IDS.concepts.familyHistoryRelevant]),
    ],
    resolve(input) {
      const profile = familyProfile(input);
      const unresolved = familyUnknownResolution(profile);
      if (unresolved !== undefined) return unresolved;
      if (profile.kind === "high-risk")
        return noAction({
          status: "NotApplicable",
          reason: "High-risk ACG family pathway uses dedicated q5 colonoscopy, not average-risk strategy tracks.",
        });
      if (profile.kind === "one-fdr-60-plus" || profile.kind === "one-sdr-only" || profile.kind === "none")
        return base.resolve(input);
      return noAction({ status: "ClinicalReviewRequired", reason: "Family-history pattern requires clinical review." });
    },
  };
}

export const fitStrategyFamilyResolver64 = familyGateForStrategy(
  fitStrategyCoverageResolver63,
);
export const colonoscopyStrategyFamilyResolver64 = familyGateForStrategy(
  colonoscopyStrategyCoverageResolver63,
);

export const routineFamilyResolver64: DomainResolver = {
  ...routineLongitudinalResolver63,
  resolverId: "crc-routine-family-phase6.4",
  version: "6.4",
  requiredConceptIds: [
    ...new Set([
      ...routineLongitudinalResolver63.requiredConceptIds,
      CCR_IDS.concepts.familyHistoryRelevant,
    ]),
  ],
  resolve(input) {
    const profile = familyProfile(input);
    const age = input.patient.context.ageYears;

    if (input.policy.family === "sus_oficial" || input.policy.family === "br_ampliado") {
      if (profile.kind === "unknown" || profile.kind === "incomplete") {
        const ageInAutomaticBand =
          input.policy.family === "sus_oficial"
            ? age !== undefined && age >= 50 && age <= 75
            : age !== undefined && age >= 50 && age <= 75;
        if (ageInAutomaticBand)
          return noAction(
            {
              status: "Indeterminate",
              reason:
                "Age establishes a minimum screening need, but family history must be clarified before finalizing the Brazilian routine strategy.",
            },
            [],
            {
              missingData:
                profile.kind === "incomplete"
                  ? profile.missingData
                  : [CCR_IDS.concepts.familyHistoryRelevant],
            },
          );
      }
      if (!["none", "unknown", "incomplete"].includes(profile.kind))
        return noAction(
          {
            status: "ClinicalReviewRequired",
            reason:
              "Relevant positive family history exits simple SUS/BA-A routine automation.",
          },
        );
    }

    return routineLongitudinalResolver63.resolve(input);
  },
};

export const populationFamilyResolver64: DomainResolver = {
  ...internationalStrategyChoiceResolver63,
  resolverId: "crc-population-family-phase6.4",
  version: "6.4",
  requiredConceptIds: [
    ...new Set([
      ...internationalStrategyChoiceResolver63.requiredConceptIds,
      CCR_IDS.concepts.familyHistoryRelevant,
    ]),
  ],
  resolve(input) {
    // Population-level age indication remains visible even when family history is unknown;
    // modality-specific strategy tracks are what abstain until family history is clarified.
    return internationalStrategyChoiceResolver63.resolve(input);
  },
};

export const postFitFamilyResolver64: DomainResolver = {
  ...postFitRoutineResolver,
  resolverId: "crc-post-fit-family-phase6.4",
  version: "6.4",
  requiredConceptIds: [
    ...new Set([
      ...postFitRoutineResolver.requiredConceptIds,
      CCR_IDS.concepts.familyHistoryRelevant,
    ]),
  ],
  resolve(input) {
    const profile = familyProfile(input);
    const unresolved = familyUnknownResolution(profile);
    if (unresolved !== undefined) return unresolved;
    if (profile.kind === "high-risk")
      return noAction(
        {
          status: "ClinicalReviewRequired",
          reason:
            "USMSTF q10 after normal colonoscopy excludes higher-risk family-history pathways; do not apply the average-risk post-FIT clock automatically.",
        },
        fitEpisodeEvidence(analyzeFitHistory(input.history.events)),
      );
    return postFitRoutineResolver.resolve(input);
  },
};

export const fitFollowupFamilyResolver64 = fitPositiveFollowupResolver;
