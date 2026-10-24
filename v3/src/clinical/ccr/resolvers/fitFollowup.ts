import type {
  DomainResolver,
  DomainResolution,
  DomainResolverInput,
} from "../../../engine/extensions";
import { diagnosticColonoscopyAfterPositiveFitAction } from "../actions";
import {
  brazilPostFitClockDecisionSupport,
  inadequateColonoscopyDecisionSupport,
  invalidFitDecisionSupport,
  positiveFitFollowupDecisionSupport,
} from "../decisionSupport";
import { CCR_IDS } from "../terminology";
import {
  analyzeFitHistory,
  fitEpisodeEvidence,
  postFitNormalCoverage,
  resolutionTraceGuardrails,
} from "./fitEpisodes";

function noAction(
  state: DomainResolution["state"],
  evidenceRecordIds: string[],
  options: {
    missingData?: string[];
    decisionSupportIds?: string[];
    guardrails?: string[];
  } = {},
): DomainResolution {
  return {
    state,
    actionIds: [],
    decisionSupportIds: options.decisionSupportIds ?? [],
    evidenceRecordIds,
    missingData: options.missingData ?? [],
    guardrails: options.guardrails ?? [],
  };
}

function handoffConfirmed(input: DomainResolverInput): boolean {
  return input.patient.facts.some(
    (fact) =>
      fact.conceptId === CCR_IDS.concepts.specialistCareAssumed &&
      fact.presence === "yes",
  );
}

function hasStatus(
  input: ReturnType<typeof analyzeFitHistory>,
  status: "open" | "ambiguous" | "resolved" | "pending_result" | "specialized",
): boolean {
  return input.episodes.some((episode) => episode.status === status);
}

function episodeIds(
  input: ReturnType<typeof analyzeFitHistory>,
  status: "open" | "ambiguous" | "resolved" | "pending_result" | "specialized",
): string[] {
  return [
    ...new Set(
      input.episodes
        .filter((episode) => episode.status === status)
        .flatMap((episode) => episode.evidenceRecordIds),
    ),
  ].sort();
}

export const fitPositiveFollowupResolver: DomainResolver = {
  resolverId: "crc-fit-positive-followup-phase6.3",
  version: "6.3",
  topicId: CCR_IDS.topic,
  trackId: CCR_IDS.tracks.fitFollowup,
  requiredConceptIds: [CCR_IDS.concepts.specialistCareAssumed],
  resolve(input) {
    const analysis = analyzeFitHistory(input.history.events);
    const allEvidence = fitEpisodeEvidence(analysis);
    const resolutionGuards = resolutionTraceGuardrails(analysis);

    if (
      handoffConfirmed(input) &&
      (analysis.episodes.length > 0 || analysis.pendingFitIds.length > 0)
    )
      return noAction({ status: "HandedOff" }, allEvidence, {
        guardrails: [
          "HandedOff requires evidence that another professional/service actually assumed the pathway; referral or scheduling alone is insufficient.",
          ...resolutionGuards,
        ],
      });

    if (hasStatus(analysis, "specialized"))
      return noAction(
        {
          status: "ClinicalReviewRequired",
          reason:
            "Diagnostic colonoscopy after FIT-positive found a non-normal final result outside the automatic pilot.",
        },
        episodeIds(analysis, "specialized"),
        {
          guardrails: [
            "Polyp, lesion, cancer or another non-normal diagnostic finding exits the automatic routine pilot.",
            ...resolutionGuards,
          ],
        },
      );

    if (hasStatus(analysis, "pending_result"))
      return noAction({ status: "PendingResult" }, episodeIds(analysis, "pending_result"), {
        decisionSupportIds: [positiveFitFollowupDecisionSupport.considerationId],
        guardrails: [
          "A performed diagnostic colonoscopy with a pending result does not justify repeating FIT or declaring the episode resolved.",
          ...resolutionGuards,
        ],
      });

    if (hasStatus(analysis, "open"))
      return {
        state: { status: "InFollowUp" },
        actionIds: [diagnosticColonoscopyAfterPositiveFitAction.actionId],
        decisionSupportIds: [
          positiveFitFollowupDecisionSupport.considerationId,
          ...(episodeIds(analysis, "open").length > 1
            ? [inadequateColonoscopyDecisionSupport.considerationId]
            : []),
        ],
        evidenceRecordIds: episodeIds(analysis, "open"),
        missingData: [],
        guardrails: [
          "Do not repeat FIT to resolve a positive FIT episode.",
          "Incomplete, inadequate or insufficiently documented colonoscopy remains non-qualifying.",
          "No universal time deadline is invented by this pilot.",
          ...resolutionGuards,
        ],
      };

    if (hasStatus(analysis, "ambiguous"))
      return noAction(
        {
          status: "Indeterminate",
          reason:
            "The available dates cannot establish that colonoscopy occurred after the positive FIT.",
        },
        episodeIds(analysis, "ambiguous"),
        {
          missingData: ["crc_fit_colonoscopy_temporal_order"],
          decisionSupportIds: [positiveFitFollowupDecisionSupport.considerationId],
          guardrails: [
            "Same-day or overlapping partial dates never establish post-trigger chronology automatically.",
            ...resolutionGuards,
          ],
        },
      );

    if (analysis.pendingFitIds.length > 0)
      return noAction({ status: "PendingResult" }, analysis.pendingFitIds, {
        guardrails: [
          "FIT collection/realization date is the event anchor, but a pending result never starts or resets the screening interval.",
        ],
      });

    if (analysis.invalidFitIds.length > 0)
      return noAction(
        {
          status: "ClinicalReviewRequired",
          reason:
            "Invalid, inconclusive or unknown FIT result does not qualify as negative and the pilot does not invent a universal repeat interval.",
        },
        analysis.invalidFitIds,
        {
          decisionSupportIds: [invalidFitDecisionSupport.considerationId],
          guardrails: [
            "Invalid/inconclusive FIT never anchors Current and never equals a negative FIT.",
          ],
        },
      );

    if (hasStatus(analysis, "resolved"))
      return noAction(
        {
          status: "NotApplicable",
          reason: "All known FIT-positive episodes have qualifying diagnostic resolution.",
        },
        episodeIds(analysis, "resolved"),
        { guardrails: resolutionGuards },
      );

    return noAction(
      { status: "NotApplicable", reason: "No FIT-positive follow-up episode is present." },
      [],
    );
  },
};

export const postFitRoutineResolver: DomainResolver = {
  resolverId: "crc-post-fit-routine-phase6.3",
  version: "6.3",
  topicId: CCR_IDS.topic,
  trackId: CCR_IDS.tracks.postFitRoutine,
  requiredConceptIds: [],
  resolve(input) {
    const analysis = analyzeFitHistory(input.history.events);
    const unresolved = analysis.episodes.some((episode) =>
      ["open", "ambiguous", "pending_result", "specialized"].includes(
        episode.status,
      ),
    );

    if (unresolved || analysis.resolvedPairs.length === 0)
      return noAction(
        {
          status: "NotApplicable",
          reason:
            unresolved
              ? "Routine post-FIT clock cannot govern while a FIT-positive episode is unresolved or outside the automatic pilot."
              : "No resolved FIT-positive episode establishes a post-FIT routine clock.",
        },
        fitEpisodeEvidence(analysis),
        { guardrails: resolutionTraceGuardrails(analysis) },
      );

    if (
      input.policy.family === "sus_oficial" ||
      input.policy.family === "br_ampliado"
    )
      return noAction(
        {
          status: "ClinicalReviewRequired",
          reason:
            "The FIT-positive diagnostic episode is resolved, but this pilot does not automate the next Brazilian routine screening clock.",
        },
        fitEpisodeEvidence(analysis),
        {
          decisionSupportIds: [brazilPostFitClockDecisionSupport.considerationId],
          guardrails: [
            "Diagnostic resolution and the next routine screening clock are separate decisions.",
            ...resolutionTraceGuardrails(analysis),
          ],
        },
      );

    if (input.policy.family !== "internacional")
      return noAction(
        { status: "NotApplicable", reason: "Unsupported policy family for post-FIT routine routing." },
        [],
      );

    const age = input.patient.context.ageYears;
    if (age === undefined)
      return noAction(
        {
          status: "Indeterminate",
          reason: "Age is required to determine whether population screening remains applicable.",
        },
        fitEpisodeEvidence(analysis),
        { missingData: ["ageYears"] },
      );
    if (age > 85)
      return noAction(
        {
          status: "NotApplicable",
          reason: "Routine population screening stops after age 85; resolved prior FIT-positive follow-up does not reopen routine screening.",
        },
        fitEpisodeEvidence(analysis),
        { guardrails: resolutionTraceGuardrails(analysis) },
      );

    const coverage = postFitNormalCoverage(input.history.events, input.asOf);
    if (coverage.status === "Current") {
      if (
        input.genericTrack.state.status !== "Current" ||
        input.genericTrack.state.anchorEventId !== coverage.anchorEventId
      )
        return noAction(
          {
            status: "Indeterminate",
            reason:
              "Generic schedule and longitudinal FIT-resolution evidence disagree on the current anchor.",
          },
          coverage.evidenceRecordIds,
          { missingData: ["crc_post_fit_anchor_mismatch"] },
        );
      return noAction(
        structuredClone(input.genericTrack.state) as DomainResolution["state"],
        coverage.evidenceRecordIds,
        { guardrails: resolutionTraceGuardrails(analysis) },
      );
    }

    if (coverage.status === "Due")
      return noAction(
        { status: "Due" },
        coverage.evidenceRecordIds,
        {
          guardrails: [
            "Ten years after a qualifying normal high-quality post-FIT colonoscopy, a new screening round is due; policy/strategy tracks determine the human-selected next action.",
            ...resolutionTraceGuardrails(analysis),
          ],
        },
      );

    return noAction(
      {
        status: "Indeterminate",
        reason:
          "The post-FIT colonoscopy exists but date precision is insufficient to determine the 10-year boundary.",
      },
      coverage.evidenceRecordIds,
      {
        missingData: ["crc_post_fit_colonoscopy_date_precision"],
        guardrails: resolutionTraceGuardrails(analysis),
      },
    );
  },
};
