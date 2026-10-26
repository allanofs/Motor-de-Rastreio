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
const examStateSource = readFileSync(
  new NodeURL("../../pilot/ccr/pilotExamState.ts", import.meta.url),
  "utf8",
);

describe("CCR pilot shared draft serializer", () => {
  it("uses one serializer and one authoritative exam state for evaluation and export", () => {
    expect(mainSource).toContain('import { collectCcrPilotDraft } from "./pilotDraft"');
    expect(reportUiSource).toContain('import { collectCcrPilotDraft } from "./pilotDraft"');
    expect(mainSource).toContain('import { pilotExams as exams } from "./pilotExamState"');
    expect(reportUiSource).toContain('import { snapshotPilotExams } from "./pilotExamState"');
    expect(mainSource).toContain("evaluateCcrProductDraft(collectCcrPilotDraft(exams))");
    expect(reportUiSource).toContain("collectCcrPilotDraft(snapshotPilotExams())");
  });

  it("keeps clinical inference out of serializer and exam state", () => {
    expect(serializerSource).toContain("export function collectCcrPilotDraft");
    expect(examStateSource).toContain("export const pilotExams");
    expect(examStateSource).toContain("snapshotPilotExams");
    for (const source of [serializerSource, examStateSource]) {
      expect(source).not.toMatch(/evaluateCcrProduct|presentCcrProduct|buildCcrReportModel|automationBoundary/);
      expect(source).not.toMatch(/clinical\/ccr|engine\/|model\//);
    }
  });
});
