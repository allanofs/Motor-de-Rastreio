import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { URL as NodeURL } from "node:url";

const mainSource = readFileSync(
  new NodeURL("../../pilot/ccr/main.ts", import.meta.url),
  "utf8",
);
const reportUiSource = readFileSync(
  new NodeURL("../../pilot/ccr/reportUi.ts", import.meta.url),
  "utf8",
);
const serializerSource = readFileSync(
  new NodeURL("../../pilot/ccr/pilotDraft.ts", import.meta.url),
  "utf8",
);

describe("CCR pilot shared draft serializer", () => {
  it("uses one serializer for evaluation and report export", () => {
    expect(mainSource).toContain('import { collectCcrPilotDraft } from "./pilotDraft"');
    expect(reportUiSource).toContain('import { collectCcrPilotDraft } from "./pilotDraft"');
    expect(mainSource).toContain("evaluateCcrProductDraft(collectCcrPilotDraft())");
    expect(reportUiSource).toContain("const draft = collectCcrPilotDraft();");
  });

  it("keeps clinical inference out of the pilot serializer", () => {
    expect(serializerSource).toContain("export function collectCcrPilotDraft");
    expect(serializerSource).not.toMatch(/evaluateCcrProduct|presentCcrProduct|buildCcrReportModel|automationBoundary/);
    expect(serializerSource).not.toMatch(/clinical\/ccr|engine\/|model\//);
  });
});
