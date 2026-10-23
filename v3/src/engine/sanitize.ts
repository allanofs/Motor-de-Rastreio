import { z } from "zod";
const UiMetadataSchema = z.strictObject({
  enabled: z.boolean().optional(),
  answered: z.boolean().optional(),
});
function object(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function record(value: unknown, kind: "fact" | "exam"): unknown {
  if (!object(value)) return value;
  const copy = { ...value };
  if (copy._ui !== undefined) {
    const ui = UiMetadataSchema.parse(copy._ui);
    if (ui.enabled === false || ui.answered === false) return undefined;
    delete copy._ui;
  }
  if (
    kind === "fact" &&
    ["no", "unknown", "not_applicable"].includes(String(copy.presence))
  ) {
    delete copy.details;
    delete copy.value;
  }
  if (
    kind === "exam" &&
    ["not_performed", "unknown"].includes(String(copy.status))
  ) {
    for (const key of [
      "date",
      "result",
      "quality",
      "completeness",
      "resolutionInformation",
    ])
      delete copy[key];
  }
  return copy;
}
/** Raw UI-only metadata is consumed here; it can never become clinical evidence. */
export function sanitizeAndPruneInput(input: unknown): unknown {
  const copy: unknown = structuredClone(input);
  if (!object(copy)) return copy;
  for (const [key, kind] of [
    ["facts", "fact"],
    ["examHistory", "exam"],
  ] as const) {
    const values = copy[key];
    if (Array.isArray(values))
      copy[key] = values
        .map((v) => record(v, kind))
        .filter((v) => v !== undefined);
  }
  if (object(copy.context))
    for (const [key, value] of Object.entries(copy.context)) {
      if (object(value) && value._ui !== undefined) {
        const ui = UiMetadataSchema.parse(value._ui);
        if (ui.answered === false || ui.enabled === false)
          delete copy.context[key];
        else
          throw new Error(
            "Answered context fields must carry a clinical value, not a UI wrapper",
          );
      }
    }
  return copy;
}
