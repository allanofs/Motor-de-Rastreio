import { describe, expect, it } from "vitest";
import {
  createMotorSharedSessionContext,
  knownMotorSharedFact,
  motorIsoDate,
  unknownMotorSharedFact,
} from "../../src/product/shell";
import { projectSharedSessionContextToCcr } from "../../src/product/ccr";
import { projectSharedSessionContextToMama } from "../../src/product/mama";

function knownContext() {
  return createMotorSharedSessionContext({
    evaluationDate: knownMotorSharedFact(
      motorIsoDate("2026-10-28"),
      "system_clock" as const,
    ),
    birthDate: knownMotorSharedFact(
      motorIsoDate("2003-11-15"),
      "user_supplied" as const,
    ),
  });
}

describe("A3 one-way shared session context consumption", () => {
  it("lets CCR derive only module-local asOf and completed age with provenance", () => {
    expect(projectSharedSessionContextToCcr(knownContext())).toEqual({
      asOf: {
        status: "available",
        value: "2026-10-28",
        source: "shared.evaluationDate",
      },
      ageYears: {
        status: "derived",
        value: 22,
        sources: ["shared.birthDate", "shared.evaluationDate"],
      },
    });
  });

  it("lets Mama independently derive the same global facts inside its own boundary", () => {
    expect(projectSharedSessionContextToMama(knownContext())).toEqual({
      asOf: {
        status: "available",
        value: "2026-10-28",
        source: "shared.evaluationDate",
      },
      ageYears: {
        status: "derived",
        value: 22,
        sources: ["shared.birthDate", "shared.evaluationDate"],
      },
    });
  });

  it("preserves explicit unknown birth date instead of inventing age", () => {
    const context = createMotorSharedSessionContext({
      evaluationDate: knownMotorSharedFact(
        motorIsoDate("2026-10-28"),
        "user_supplied" as const,
      ),
      birthDate: unknownMotorSharedFact("declined"),
    });

    expect(projectSharedSessionContextToCcr(context).ageYears).toEqual({
      status: "unavailable",
      reason: "birth_date_declined",
    });
    expect(projectSharedSessionContextToMama(context).ageYears).toEqual({
      status: "unavailable",
      reason: "birth_date_declined",
    });
  });

  it("preserves explicit unknown evaluation date and does not derive age", () => {
    const context = createMotorSharedSessionContext({
      evaluationDate: unknownMotorSharedFact("not_available"),
      birthDate: knownMotorSharedFact(
        motorIsoDate("2000-01-01"),
        "user_supplied" as const,
      ),
    });

    for (const projection of [
      projectSharedSessionContextToCcr(context),
      projectSharedSessionContextToMama(context),
    ]) {
      expect(projection.asOf).toEqual({
        status: "unavailable",
        reason: "evaluation_date_not_available",
      });
      expect(projection.ageYears).toEqual({
        status: "unavailable",
        reason: "evaluation_date_not_available",
      });
    }
  });

  it("fails safely when birth date is after evaluation date", () => {
    const context = createMotorSharedSessionContext({
      evaluationDate: knownMotorSharedFact(
        motorIsoDate("2026-10-28"),
        "system_clock" as const,
      ),
      birthDate: knownMotorSharedFact(
        motorIsoDate("2027-01-01"),
        "user_supplied" as const,
      ),
    });

    expect(projectSharedSessionContextToCcr(context).ageYears).toEqual({
      status: "unavailable",
      reason: "invalid_shared_date_relation",
    });
    expect(projectSharedSessionContextToMama(context).ageYears).toEqual({
      status: "unavailable",
      reason: "invalid_shared_date_relation",
    });
  });

  it("does not mutate or write module-derived age back into Shell context", () => {
    const context = knownContext();
    projectSharedSessionContextToCcr(context);
    projectSharedSessionContextToMama(context);

    expect(Object.keys(context).sort()).toEqual([
      "birthDate",
      "evaluationDate",
      "lifecycle",
      "version",
    ]);
    expect("ageYears" in context).toBe(false);
    expect(Object.isFrozen(context)).toBe(true);
  });

  it("does not expose policy, eligibility, risk or screening status through projections", () => {
    const ccr = projectSharedSessionContextToCcr(knownContext());
    const mama = projectSharedSessionContextToMama(knownContext());

    for (const projection of [ccr, mama]) {
      const serialized = JSON.stringify(projection);
      expect(serialized).not.toMatch(/policy|eligible|eligibility|risk|screening|statusGlobal/i);
      expect(Object.keys(projection).sort()).toEqual(["ageYears", "asOf"]);
    }
  });
});
