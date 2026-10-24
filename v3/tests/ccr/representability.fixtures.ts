import {
  PolicySchema,
  RuleDefinitionSchema,
  RulesetSchema,
  SourceSchema,
} from "../../src/model/content";
import type {
  CareSettingContext,
  Policy,
  RuleDefinition,
  Ruleset,
} from "../../src/model/content";
import type { PathwayState } from "../../src/model/evaluation";
import {
  ClinicalFactSchema,
  ExamRecordSchema,
  PatientSchema,
} from "../../src/model/patient";
import type {
  ClinicalFact,
  ExamRecord,
  Patient,
} from "../../src/model/patient";
import {
  dueWindow,
  parseCalendarDate as day,
  parsePartialDate as date,
  scheduleStatus,
} from "../../src/model/dates";
import { evaluatePatient } from "../../src/engine/evaluatePatient";
import { isCertainlyAfter } from "../../src/engine/resolveHistory";
import type {
  DomainResolver,
  DomainResolverRegistry,
} from "../../src/engine/extensions";

// PHASE 6.0 ONLY.
// These are technical representability fixtures, not released clinical rules.
// They intentionally exercise approved CCR semantics through the frozen Foundation.
export const TOPIC = "ccr-representability";
export const AS_OF = day("2026-10-24");

export const technicalSource = SourceSchema.parse({
  sourceId: "ccr-representability-source",
  institution: "Motor de Rastreio V3 technical test suite",
  documentTitle: "Phase 6.0 representability contract",
  publicationYear: 2026,
  version: "6.0a",
  jurisdiction: "technical-test",
  documentStatus: "final",
  url: "https://example.invalid/ccr-representability",
  lastVerifiedAt: AS_OF,
});

const technicalGovernance = {
  author: "phase-6-representability-tests",
  rationale:
    "Technical fixture only; validates Foundation representability and is not a clinical release rule.",
  reviews: [
    {
      reviewer: "technical-fixture-review (not independent clinical validation)",
      reviewedAt: AS_OF,
    },
  ],
};

export function makeRule(
  ruleId: string,
  trackId: string,
  overrides: Partial<RuleDefinition> = {},
): RuleDefinition {
  return RuleDefinitionSchema.parse({
    lifecycleStatus: "active",
    reviewStatus: "reviewed_by_1",
    clinicalRole: "technical",
    stance: "recommend",
    computability: "computable",
    requiredKnownFacts: [],
    population: { facts: [] },
    exclusions: [],
    actions: [],
    outcome: "Due",
    decisionSupport: [],
    supersedes: [],
    excludes: [],
    guardrails: [],
    sourceRefs: [
      {
        sourceId: technicalSource.sourceId,
        locator: `phase-6.0:${ruleId}`,
      },
    ],
    governance: technicalGovernance,
    ...overrides,
    ruleId,
    topicId: TOPIC,
    trackId,
  });
}

export function makePolicy(
  policyId: string,
  family: Policy["family"],
  rules: RuleDefinition[],
): Policy {
  return PolicySchema.parse({
    policyId,
    label: `CCR representability ${policyId}`,
    family,
    topicIds: [TOPIC],
    ruleIds: rules.map((rule) => rule.ruleId),
    primaryStrategies: [],
  });
}

export function makeBundle(
  rules: RuleDefinition[],
  policies: Policy[],
): Ruleset {
  return RulesetSchema.parse({
    rulesetVersion: "ccr-representability-6.0a",
    rules,
    sources: [technicalSource],
    policies,
    terminology: [],
  });
}

export function fact(
  id: string,
  conceptId: string,
  presence: "yes" | "no" | "unknown",
  category: ClinicalFact["category"] = "population_context",
): ClinicalFact {
  return ClinicalFactSchema.parse({
    id,
    conceptId,
    topicId: TOPIC,
    category,
    presence,
  });
}

export function exam(
  id: string,
  when: string,
  modality: "fit" | "colonoscopy",
  code: string,
  options: {
    quality?: "adequate" | "inadequate" | "unknown";
    completeness?: "complete" | "incomplete" | "unknown" | "not_applicable";
    resolutionInformation?: "sufficient" | "insufficient" | "unknown";
  } = {},
): ExamRecord {
  return ExamRecordSchema.parse({
    id,
    topicId: TOPIC,
    modality,
    status: "performed",
    date: date(when),
    result: { status: "final", code },
    quality: options.quality ?? "adequate",
    completeness:
      options.completeness ?? (modality === "fit" ? "not_applicable" : "complete"),
    resolutionInformation: options.resolutionInformation ?? "sufficient",
  });
}

export function patient(input: {
  ageYears?: number;
  facts?: ClinicalFact[];
  examHistory?: ExamRecord[];
  historyKnowledge?: "known" | "never_performed" | "unknown";
} = {}): Patient {
  return PatientSchema.parse({
    context: { ageYears: input.ageYears ?? 60 },
    facts: input.facts ?? [],
    examHistory: input.examHistory ?? [],
    historyKnowledge: {
      [TOPIC]: input.historyKnowledge ?? "known",
    },
  });
}

export const OFFER_FIT = {
  actionId: "offer-fit",
  kind: "recommendation" as const,
  text: "Technical representation: offer FIT",
  resourceId: "fit-resource",
  unavailableRoute: "referral" as const,
};

export const OFFER_COLONOSCOPY = {
  actionId: "colonoscopy-after-fit-positive",
  kind: "referral" as const,
  text: "Technical representation: colonoscopy after positive FIT",
  resourceId: "colonoscopy-resource",
  unavailableRoute: "referral" as const,
};

export const fitRoutineRule = makeRule("fit-routine-q2", "fit-routine", {
  actions: [OFFER_FIT],
  outcome: "Due",
  qualifyingEventSpec: {
    modality: "fit",
    resultCodes: ["fit-negative"],
    requireAdequateQuality: false,
    requireComplete: false,
    requireSufficientResolution: true,
  },
  scheduleSpec: { unit: "years", amount: 2 },
  noQualifyingEventBehavior: { neverPerformed: "due" },
  guardrails: ["positive FIT must suppress routine FIT action"],
});

export const fitFollowupRule = makeRule(
  "fit-positive-followup",
  "fit-followup",
  {
    actions: [OFFER_COLONOSCOPY],
    outcome: "InFollowUp",
    guardrails: ["negative FIT never resolves an earlier positive FIT"],
  },
);

export const colonoscopyCoverageRule = makeRule(
  "colonoscopy-coverage-q10",
  "colonoscopy-coverage",
  {
    actions: [],
    outcome: "Due",
    qualifyingEventSpec: {
      modality: "colonoscopy",
      resultCodes: ["colonoscopy-normal"],
      requireAdequateQuality: true,
      requireComplete: true,
      requireSufficientResolution: true,
    },
    scheduleSpec: { unit: "years", amount: 10 },
    noQualifyingEventBehavior: { neverPerformed: "indeterminate" },
  },
);

export const futureFitRule = makeRule(
  "future-fit-strategy",
  "future-fit-strategy",
  {
    population: {
      facts: [{ conceptId: "future-strategy-fit", presence: "yes" }],
    },
    actions: [OFFER_FIT],
    outcome: "Due",
  },
);

export const specialistFollowupRule = makeRule(
  "specialist-followup",
  "specialist-followup",
  {
    actions: [
      {
        actionId: "continue-followup",
        kind: "referral",
        text: "Technical representation: continue follow-up until care is assumed",
      },
    ],
    outcome: "InFollowUp",
  },
);

function qualifyingResolution(
  trigger: ExamRecord,
  candidate: ExamRecord,
): boolean {
  return (
    candidate.status === "performed" &&
    candidate.modality === "colonoscopy" &&
    candidate.result.status === "final" &&
    candidate.result.code === "colonoscopy-normal" &&
    candidate.quality === "adequate" &&
    candidate.completeness === "complete" &&
    candidate.resolutionInformation === "sufficient" &&
    isCertainlyAfter(candidate, trigger)
  );
}

function positiveFits(events: readonly ExamRecord[]): ExamRecord[] {
  return events.filter(
    (event) =>
      event.status === "performed" &&
      event.modality === "fit" &&
      event.result.status === "final" &&
      event.result.code === "fit-positive",
  );
}

function openPositiveFits(events: readonly ExamRecord[]): ExamRecord[] {
  return positiveFits(events).filter(
    (trigger) => !events.some((candidate) => qualifyingResolution(trigger, candidate)),
  );
}

export const fitFollowupResolver: DomainResolver = {
  resolverId: "ccr-fit-followup-representability",
  version: "6.0a",
  topicId: TOPIC,
  trackId: "fit-followup",
  requiredConceptIds: [],
  resolve(input) {
    const open = openPositiveFits(input.history.events);
    return {
      state:
        open.length > 0
          ? { status: "InFollowUp" }
          : {
              status: "NotApplicable",
              reason: "No unresolved positive FIT in technical history",
            },
      actionIds: open.length > 0 ? [OFFER_COLONOSCOPY.actionId] : [],
      decisionSupportIds: [],
      evidenceRecordIds: open.map((event) => event.id),
      missingData: [],
      guardrails:
        open.length > 0
          ? ["unresolved positive FIT suppresses routine screening action"]
          : [],
    };
  },
};

export const routineFitSuppressor: DomainResolver = {
  resolverId: "ccr-fit-routine-suppressor-representability",
  version: "6.0a",
  topicId: TOPIC,
  trackId: "fit-routine",
  requiredConceptIds: [],
  resolve(input) {
    const open = openPositiveFits(input.history.events);
    if (open.length > 0)
      return {
        state: {
          status: "NotApplicable",
          reason: "Routine FIT suppressed while a positive FIT remains unresolved",
        },
        actionIds: [],
        decisionSupportIds: [],
        evidenceRecordIds: open.map((event) => event.id),
        missingData: [],
        guardrails: ["do not offer routine FIT while positive FIT is unresolved"],
      };
    const state = structuredClone(input.genericTrack.state) as PathwayState;
    return {
      state,
      actionIds: state.status === "Due" ? [OFFER_FIT.actionId] : [],
      decisionSupportIds: [],
      evidenceRecordIds: [],
      missingData: [...input.genericTrack.missingData],
      guardrails: [],
    };
  },
};

export const futureFitResolver: DomainResolver = {
  resolverId: "ccr-future-fit-transition-representability",
  version: "6.0a",
  topicId: TOPIC,
  trackId: "future-fit-strategy",
  requiredConceptIds: ["future-strategy-fit"],
  resolve(input) {
    const selected = input.patient.facts.some(
      (item) =>
        item.conceptId === "future-strategy-fit" && item.presence === "yes",
    );
    if (!selected)
      return {
        state: {
          status: "NotApplicable",
          reason: "Future FIT strategy not selected",
        },
        actionIds: [],
        decisionSupportIds: [],
        evidenceRecordIds: [],
        missingData: [],
        guardrails: [],
      };

    const statuses = input.history.events.flatMap((event) => {
      if (
        event.status !== "performed" ||
        event.modality !== "colonoscopy" ||
        event.result.status !== "final" ||
        event.result.code !== "colonoscopy-normal" ||
        event.quality !== "adequate" ||
        event.completeness !== "complete" ||
        event.resolutionInformation !== "sufficient" ||
        event.date === undefined
      )
        return [];
      return [
        {
          eventId: event.id,
          status: scheduleStatus(
            dueWindow(event.date, { unit: "years", amount: 10 }),
            input.asOf,
          ),
        },
      ];
    });
    const current = statuses.find((item) => item.status === "Current");
    if (current !== undefined)
      return {
        state: {
          status: "NotApplicable",
          reason: "Existing colonoscopy coverage remains current",
        },
        actionIds: [],
        decisionSupportIds: [],
        evidenceRecordIds: [current.eventId],
        missingData: [],
        guardrails: ["future strategy preference does not erase current coverage"],
      };
    const uncertain = statuses.find((item) => item.status === "Indeterminate");
    if (uncertain !== undefined)
      return {
        state: {
          status: "Indeterminate",
          reason: "Coverage boundary is uncertain because date precision is insufficient",
        },
        actionIds: [],
        decisionSupportIds: [],
        evidenceRecordIds: [uncertain.eventId],
        missingData: [`date_precision:${uncertain.eventId}`],
        guardrails: [],
      };
    return {
      state: { status: "Due" },
      actionIds: [OFFER_FIT.actionId],
      decisionSupportIds: [],
      evidenceRecordIds: statuses.map((item) => item.eventId),
      missingData: [],
      guardrails: [],
    };
  },
};

export const handoffResolver: DomainResolver = {
  resolverId: "ccr-handoff-representability",
  version: "6.0a",
  topicId: TOPIC,
  trackId: "specialist-followup",
  requiredConceptIds: ["handoff-confirmed"],
  resolve(input) {
    const handedOff = input.patient.facts.some(
      (item) => item.conceptId === "handoff-confirmed" && item.presence === "yes",
    );
    return {
      state: handedOff ? { status: "HandedOff" } : { status: "InFollowUp" },
      actionIds: handedOff ? [] : ["continue-followup"],
      decisionSupportIds: [],
      evidenceRecordIds: [],
      missingData: [],
      guardrails: handedOff
        ? ["handoff requires confirmed assumption of care"]
        : ["referral alone is not handoff"],
    };
  },
};

export function run(input: {
  rules: RuleDefinition[];
  policy: Policy;
  patient: Patient;
  extensions?: DomainResolverRegistry;
  careSetting?: CareSettingContext;
}) {
  const ruleset = makeBundle(input.rules, [input.policy]);
  return evaluatePatient({
    patient: input.patient,
    ruleset,
    asOf: AS_OF,
    policyId: input.policy.policyId,
    extensions: input.extensions ?? [],
    ...(input.careSetting === undefined ? {} : { careSetting: input.careSetting }),
  });
}
