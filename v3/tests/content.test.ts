import { expect, it } from "vitest";
import { contentIssues, validateBundle } from "../src/engine/validateContent";
import { bundle, policy, rule, source } from "./fixtures";
it("accepts coherent synthetic bundle", () =>
  expect(contentIssues(bundle, policy, "technical-a")).toEqual([]));
it.each(["draft", "preliminary", "withdrawn", "superseded"] as const)(
  "refuses %s as sole active source",
  (status) =>
    expect(
      contentIssues(
        { ...bundle, sources: [{ ...source, documentStatus: status }] },
        policy,
        "technical-a",
      ),
    ).toContain("non_final_source:technical-source"),
);
it("rejects supersedes cycles in global bundle validation", () =>
  expect(validateBundle({
    ...bundle,
    rules: [
      { ...rule, supersedes: ["r2"] },
      { ...rule, ruleId: "r2", supersedes: ["r1"] },
    ],
  })).toContain("supersedes_cycle"));
it("rejects dangling references in global bundle validation", () =>
  expect(validateBundle({
    ...bundle, rules: [{ ...rule, supersedes: ["absent"] }],
  })).toContain("invalid_rule_reference:r1:absent"));
it("rejects duplicate rule identities", () =>
  expect(
    contentIssues({ ...bundle, rules: [rule, rule] }, policy, "technical-a"),
  ).toContain("duplicate_rule_id"));
it("rejects unreviewed active rule", () =>
  expect(
    contentIssues(
      { ...bundle, rules: [{ ...rule, reviewStatus: "unreviewed" }] },
      policy,
      "technical-a",
    ),
  ).toContain("unreviewed_active_rule:r1"));
it("rejects replacement without explicit relation", () =>
  expect(
    contentIssues(
      { ...bundle, rules: [{ ...rule, compositionPolicy: "replace" }] },
      policy,
      "technical-a",
    ),
  ).toContain("replace_without_supersedes:r1"));
