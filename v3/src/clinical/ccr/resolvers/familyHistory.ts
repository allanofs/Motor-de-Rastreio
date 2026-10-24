import {
  CCR_FAMILY_DETAIL_KEYS,
  CCR_FAMILY_VALUES,
  CCR_IDS,
} from "../terminology";

type FamilyFactLike = {
  readonly conceptId: string;
  readonly presence: string;
  readonly details?: Readonly<Record<string, string | number | boolean>>;
};

export type FamilyProfile =
  | { kind: "none" }
  | { kind: "unknown" }
  | { kind: "incomplete"; missingData: string[] }
  | { kind: "complex"; reason: string }
  | { kind: "high-risk"; youngestDiagnosisAgeYears?: number }
  | { kind: "one-fdr-60-plus" }
  | { kind: "one-sdr-only" };

function familyFact(
  facts: readonly FamilyFactLike[],
): FamilyFactLike | undefined {
  return facts.find(
    (fact) => fact.conceptId === CCR_IDS.concepts.familyHistoryRelevant,
  );
}

function detailNumber(fact: FamilyFactLike, key: string): number | undefined {
  const value = fact.details?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function detailString(fact: FamilyFactLike, key: string): string | undefined {
  const value = fact.details?.[key];
  return typeof value === "string" ? value : undefined;
}

function nonNegativeInteger(value: number | undefined): number | undefined {
  return value !== undefined && Number.isInteger(value) && value >= 0
    ? value
    : undefined;
}

export function classifyFamilyHistory(
  facts: readonly FamilyFactLike[],
): FamilyProfile {
  const fact = familyFact(facts);
  if (fact === undefined) return { kind: "unknown" };
  if (fact.presence === "no") return { kind: "none" };
  if (fact.presence !== "yes") return { kind: "unknown" };

  const finding = detailString(fact, CCR_FAMILY_DETAIL_KEYS.findingType);
  if (
    finding === CCR_FAMILY_VALUES.polypUnknownType ||
    finding === CCR_FAMILY_VALUES.findingUnknown
  )
    return {
      kind: "complex",
      reason:
        "Family history is positive but the affected relative's lesion type is not sufficiently classified for automatic ACG routing.",
    };
  if (
    finding !== CCR_FAMILY_VALUES.crc &&
    finding !== CCR_FAMILY_VALUES.advancedPolyp
  )
    return {
      kind: "incomplete",
      missingData: [CCR_FAMILY_DETAIL_KEYS.findingType],
    };

  const fdrCount = nonNegativeInteger(
    detailNumber(fact, CCR_FAMILY_DETAIL_KEYS.affectedFdrCount),
  );
  const sdrCount = nonNegativeInteger(
    detailNumber(fact, CCR_FAMILY_DETAIL_KEYS.affectedSdrCount),
  );
  if (fdrCount === undefined)
    return {
      kind: "incomplete",
      missingData: [CCR_FAMILY_DETAIL_KEYS.affectedFdrCount],
    };
  if (sdrCount === undefined)
    return {
      kind: "incomplete",
      missingData: [CCR_FAMILY_DETAIL_KEYS.affectedSdrCount],
    };

  const exactAge = detailNumber(
    fact,
    CCR_FAMILY_DETAIL_KEYS.youngestDiagnosisAgeYears,
  );
  const youngestDiagnosisAgeYears =
    exactAge !== undefined &&
    Number.isInteger(exactAge) &&
    exactAge >= 0 &&
    exactAge <= 120
      ? exactAge
      : undefined;

  if (fdrCount >= 2)
    return {
      kind: "high-risk",
      ...(youngestDiagnosisAgeYears === undefined
        ? {}
        : { youngestDiagnosisAgeYears }),
    };

  if (fdrCount === 1) {
    const ageBand = detailString(
      fact,
      CCR_FAMILY_DETAIL_KEYS.youngestDiagnosisAgeBand,
    );
    if (ageBand === CCR_FAMILY_VALUES.ageUnder60)
      return {
        kind: "high-risk",
        ...(youngestDiagnosisAgeYears === undefined
          ? {}
          : { youngestDiagnosisAgeYears }),
      };
    if (ageBand === CCR_FAMILY_VALUES.age60OrOlder)
      return { kind: "one-fdr-60-plus" };
    return {
      kind: "incomplete",
      missingData: [CCR_FAMILY_DETAIL_KEYS.youngestDiagnosisAgeBand],
    };
  }

  if (fdrCount === 0 && sdrCount === 1) return { kind: "one-sdr-only" };

  return {
    kind: "complex",
    reason:
      "Positive family history does not match one of the narrow ACG patterns automated by the pilot.",
  };
}

export function highRiskStartAge(profile: FamilyProfile):
  | { status: "known"; age: number }
  | { status: "needs-exact-age" }
  | { status: "not-high-risk" }
  | { status: "clinical-review" } {
  if (profile.kind !== "high-risk") return { status: "not-high-risk" };
  if (profile.youngestDiagnosisAgeYears === undefined)
    return { status: "needs-exact-age" };

  const candidate = Math.min(40, profile.youngestDiagnosisAgeYears - 10);
  if (candidate < 18) return { status: "clinical-review" };
  return { status: "known", age: candidate };
}
