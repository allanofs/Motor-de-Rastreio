import { describe, expect, it } from "vitest";
import {
  createMotorSharedSessionContext,
  knownMotorSharedFact,
  unknownMotorSharedFact,
} from "../../src/product/shell/sessionContext";
import {
  consumeMotorNavigationHandoff,
  encodeMotorNavigationHandoff,
} from "../../src/product/shell/navigationHandoff";

function context() {
  return createMotorSharedSessionContext({
    evaluationDate: knownMotorSharedFact("2026-10-28", "system_clock"),
    birthDate: knownMotorSharedFact("1980-02-29", "user_supplied"),
  });
}

describe("A4 single-use navigation handoff", () => {
  it("round-trips only the expected module and clears the carrier", () => {
    const port = { name: encodeMotorNavigationHandoff("ccr", context()) };
    const consumed = consumeMotorNavigationHandoff(port, "ccr");
    expect(consumed).toEqual(context());
    expect(port.name).toBe("");
  });

  it("clears a MOTOR envelope when the target module does not match", () => {
    const port = { name: encodeMotorNavigationHandoff("ccr", context()) };
    expect(consumeMotorNavigationHandoff(port, "mama")).toBeUndefined();
    expect(port.name).toBe("");
  });

  it("does not erase unrelated window.name content", () => {
    const port = { name: "unrelated-host-value" };
    expect(consumeMotorNavigationHandoff(port, "ccr")).toBeUndefined();
    expect(port.name).toBe("unrelated-host-value");
  });

  it("fails safely and clears malformed MOTOR payloads", () => {
    const port = { name: "__MOTOR_HANDOFF__:{bad-json" };
    expect(consumeMotorNavigationHandoff(port, "ccr")).toBeUndefined();
    expect(port.name).toBe("");
  });

  it("rejects invalid calendar dates instead of inventing values", () => {
    const encoded = encodeMotorNavigationHandoff("mama", context());
    const port = { name: encoded.replace("2026-10-28", "2026-02-31") };
    expect(consumeMotorNavigationHandoff(port, "mama")).toBeUndefined();
    expect(port.name).toBe("");
  });

  it("preserves explicit unknown birth date without deriving it in the Shell", () => {
    const shared = createMotorSharedSessionContext({
      evaluationDate: knownMotorSharedFact("2026-10-28", "user_supplied"),
      birthDate: unknownMotorSharedFact("not_asked"),
    });
    const port = { name: encodeMotorNavigationHandoff("mama", shared) };
    const consumed = consumeMotorNavigationHandoff(port, "mama");
    expect(consumed?.birthDate).toEqual({ status: "unknown", reason: "not_asked" });
  });

  it("never places shared facts in a URL-shaped carrier", () => {
    const encoded = encodeMotorNavigationHandoff("ccr", context());
    expect(encoded).not.toContain("?");
    expect(encoded).not.toContain("#");
    expect(encoded.startsWith("__MOTOR_HANDOFF__:")).toBe(true);
  });
});
