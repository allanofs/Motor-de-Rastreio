import type {
  DomainResolver,
  DomainResolution,
  DomainResolverInput,
} from "../../../engine/extensions";
import { CCR_IDS } from "../terminology";
import {
  baStrategyChoiceResolver,
  colonoscopyStrategyCoverageResolver,
  fitStrategyCoverageResolver,
  internationalStrategyChoiceResolver,
} from "./strategyCoverage";
import {
  analyzeFitHistory,
  fitEpisodeEvidence,
  postFitNormalCoverage,
  resolutionTraceGuardrails,
} from "./fitEpisodes";

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

function handoffConfirmed(input: DomainResolverInput): boolean {
  return input.patient.facts.some(
    (fact) =>
      fact.conceptId === CCR_IDS.concepts.specialistCareAssumed &&
      fact.presence === "yes",
  );
}

function criticalLongitudinalGate(
  input: DomainResolverInput,
): DomainResolution | undefined {
  const analysis = analyzeFitHistory(input.history.events);
  const evidence = fitEpisodeEvidence(analysis);
  const has = (status: string) =>
    analysis.episodes.some((episode) => episode.status === status);

  if (
    handoffConfirmed(input) &&
    (analysis.episodes.length > 0 || analysis.pendingFitIds.length > 0)
  )
    return noAction(
      {
        status: "NotApplicable",
        reason: "Routine screening action is suppressed while confirmed handoff governs the pathway.",
      },
      evidence,
      [],
      ["Confirmed handoff never reopens routine screening automatically."],
    );

  if (has("open") || has("pending_result") || has("specialized"))
    return noAction(
      {
        status: "NotApplicable",
        reason: "Routine screening action is suppressed while FIT-positive follow-up governs the pathway.",
      },
      evidence,
      [],
      [
        "Do not emit routine FIT or primary screening colonoscopy while a FIT-positive pathway remains active.",
        ...resolutionTraceGuardrails(analysis),
      ],
    );

  if (has("ambiguous"))
    return noAction(
      {
        status: "Indeterminate",
        reason: "Routine screening cannot be resumed while FIT-to-colonoscopy chronology is ambiguous.",
      },
      evidence,
      ["crc_fit_colonoscopy_temporal_order"],
      ["Same-day or overlapping dates never establish resolution automatically."],
    );

  return undefined;
}

function wrapStrategyResolver(base: DomainResolver): DomainResolver {
  return {
    ...base,
    resolverId: `${base.resolverId}-phase6.3`,
    version: "6.3",
    requiredConceptIds: [
      ...new Set([
        ...base.requiredConceptIds,
        CCR_IDS.concepts.specialistCareAssumed,
      ]),
    ],
    resolve(input) {
      const critical = criticalLongitudinalGate(input);
      if (critical !== undefined) return critical;

      const analysis = analyzeFitHistory(input.history.events);
      const baseResult = base.resolve(input);

      // A pending/invalid FIT never erases already-valid Current coverage, but it must suppress a new screening action.
      if (baseResult.state.status === "Current") return baseResult;

      if (analysis.pendingFitIds.length > 0)
        return noAction(
          {
            status: "NotApplicable",
            reason: "Do not start a new screening action while a FIT result is pending.",
          },
          analysis.pendingFitIds,
          [],
          ["Pending FIT does not start or reset the interval."],
        );

      if (analysis.invalidFitIds.length > 0)
        return noAction(
          {
            status: "NotApplicable",
            reason: "Invalid/inconclusive FIT requires clarification before a new routine action.",
          },
          analysis.invalidFitIds,
          [],
          ["Invalid/inconclusive FIT is not a negative qualifying event."],
        );

      if (analysis.resolvedPairs.length > 0) {
        if (input.policy.family === "br_ampliado")
          return noAction(
            {
              status: "NotApplicable",
              reason:
                "A resolved FIT-positive episode has no automated BA-A next routine clock in this pilot.",
            },
            fitEpisodeEvidence(analysis),
            [],
            resolutionTraceGuardrails(analysis),
          );

        if (input.policy.family === "internacional") {
          const coverage = postFitNormalCoverage(input.history.events, input.asOf);
          if (coverage.status === "Current")
            return noAction(
              {
                status: "NotApplicable",
                reason:
                  "A qualifying normal post-FIT diagnostic colonoscopy still provides current 10-year coverage.",
              },
              coverage.evidenceRecordIds,
              [],
              resolutionTraceGuardrails(analysis),
            );
          if (coverage.status === "Indeterminate")
            return noAction(
              {
                status: "Indeterminate",
                reason:
                  "Post-FIT colonoscopy date precision is insufficient to determine current coverage.",
              },
              coverage.evidenceRecordIds,
              ["crc_post_fit_colonoscopy_date_precision"],
              resolutionTraceGuardrails(analysis),
            );
        }
      }

      return baseResult;
    },
  };
}

export const baStrategyChoiceResolver63 = wrapStrategyResolver(
  baStrategyChoiceResolver,
);
export const internationalStrategyChoiceResolver63 = wrapStrategyResolver(
  internationalStrategyChoiceResolver,
);
export const fitStrategyCoverageResolver63 = wrapStrategyResolver(
  fitStrategyCoverageResolver,
);
export const colonoscopyStrategyCoverageResolver63 = wrapStrategyResolver(
  colonoscopyStrategyCoverageResolver,
);

export const susRoutineLongitudinalResolver63: DomainResolver = {
  resolverId: "crc-sus-routine-longitudinal-phase6.3",
  version: "6.3",
  topicId: CCR_IDS.topic,
  trackId: CCR_IDS.tracks.routine,
  requiredConceptIds: [CCR_IDS.concepts.specialistCareAssumed],
  resolve(input) {
    const critical = criticalLongitudinalGate(input);
    if (critical !== undefined) return critical;

    const analysis = analyzeFitHistory(input.history.events);
    if (analysis.resolvedPairs.length > 0)
      return noAction(
        {
          status: "NotApplicable",
          reason:
            "A resolved FIT-positive episode has no automated next SUS routine clock in this pilot.",
        },
        fitEpisodeEvidence(analysis),
        [],
        [
          "Diagnostic resolution does not silently restart biennial FIT.",
          ...resolutionTraceGuardrails(analysis),
        ],
      );

    const generic = mirrorGeneric(input);
    if (generic.state.status === "Current") return generic;

    if (analysis.pendingFitIds.length > 0)
      return noAction(
        {
          status: "NotApplicable",
          reason: "Do not order another routine FIT while the collected FIT result is pending.",
        },
        analysis.pendingFitIds,
      );

    if (analysis.invalidFitIds.length > 0)
      return noAction(
        {
          status: "NotApplicable",
          reason: "Invalid/inconclusive FIT does not establish a new automatic SUS interval.",
        },
        analysis.invalidFitIds,
      );

    return generic;
  },
};
