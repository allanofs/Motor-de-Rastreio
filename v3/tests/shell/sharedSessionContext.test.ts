import { describe, expect, it } from "vitest";
import {
  createMotorSharedSessionContext,
  knownMotorSharedFact,
  motorIsoDate,
  unknownMotorSharedFact,
} from "../../src/product/shell";

describe("Unified MOTOR Shell A2 shared session context", () => {
  it("carries only explicit global facts with an ephemeral lifecycle", () => {
    const context = createMotorSharedSessionContext({
      evaluationDate: knownMotorSharedFact(
        motorIsoDate("2026-10-28"),
        "system_clock" as const,
      ),
      birthDate: knownMotorSharedFact(
        motorIsoDate("1980-05-12"),
        "user_supplied" as const,
      ),
    });

    expect(context).toEqual({
      version: "motor-shared-session-v1",
      lifecycle: "ephemeral",
      evaluationDate: {
        status: "known",
        value: "2026-10-28",
        source: "system_clock",
      },
      birthDate: {
        status: "known",
        value: "1980-05-12",
        source: "user_supplied",
      },
    });
    expect(Object.keys(context).sort()).toEqual(
      ["birthDate", "evaluationDate", "lifecycle", "version"].sort(),
    );
  });

  it("preserves explicit unknown state instead of inventing values", () => {
    const context = createMotorSharedSessionContext({
      evaluationDate: knownMotorSharedFact(
        motorIsoDate("2026-10-28"),
        "system_clock" as const,
      ),
      birthDate: unknownMotorSharedFact("not_asked"),
    });

    expect(context.birthDate).toEqual({
      status: "unknown",
      reason: "not_asked",
    });
  });

  it("rejects malformed or impossible calendar dates", () => {
    expect(() => motorIsoDate("28/10/2026")).toThrow();
    expect(() => motorIsoDate("2026-02-30")).toThrow();
    expect(motorIsoDate("2024-02-29")).toBe("2024-02-29");
  });

  it("freezes the shared context and its fact records", () => {
    const context = createMotorSharedSessionContext({
      evaluationDate: knownMotorSharedFact(
        motorIsoDate("2026-10-28"),
        "user_supplied" as const,
      ),
      birthDate: unknownMotorSharedFact("declined"),
    });

    expect(Object.isFrozen(context)).toBe(true);
    expect(Object.isFrozen(context.evaluationDate)).toBe(true);
    expect(Object.isFrozen(context.birthDate)).toBe(true);
  });

  it("contains no derived clinical decision or module-specific state", () => {
    const context = createMotorSharedSessionContext({
      evaluationDate: knownMotorSharedFact(
        motorIsoDate("2026-10-28"),
        "system_clock" as const,
      ),
      birthDate: unknownMotorSharedFact("not_available"),
    });

    const serialized = JSON.stringify(context);
    expect(serialized).not.toMatch(
      /eligib|screen|rastream|risk|policy|rule|boundary|ccr|mama|fit|colonoscop|mamograf/i,
    );
  });
});
