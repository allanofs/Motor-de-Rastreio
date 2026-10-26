import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { URL as NodeURL } from "node:url";
import type { Source } from "../../src/model/content";
import {
  escapeReportHtml,
  formatReportIsoDate,
  renderPrintableReportDocument,
  renderReportProvenanceHtml,
  resolveReportProvenance,
} from "../../src/product/reporting";

const source: Source = {
  sourceId: "source-1",
  institution: "Sociedade Exemplo",
  documentTitle: "Diretriz Exemplo",
  publicationYear: 2026,
  version: "v1",
  jurisdiction: "Brasil",
  documentStatus: "final",
  url: "https://example.org/guideline",
  lastVerifiedAt: { year: 2026, month: 10, day: 26 },
};

describe("Report Foundation R3", () => {
  it("resolves only governed trace references, deduplicates them and exposes unresolved references", () => {
    const provenance = resolveReportProvenance(
      [
        { sourceId: "source-1", locator: "p. 10" },
        { sourceId: "source-1", locator: "p. 10" },
        { sourceId: "source-1", locator: "table 2" },
        { sourceId: "missing", locator: "section X" },
      ],
      [source],
    );

    expect(provenance.status).toBe("incomplete");
    expect(provenance.sources).toHaveLength(1);
    expect(provenance.sources[0]?.references.map((ref) => ref.locator)).toEqual([
      "p. 10",
      "table 2",
    ]);
    expect(provenance.unresolved).toEqual([
      {
        sourceId: "missing",
        locator: "section X",
        reason: "source_not_found_in_governed_catalog",
      },
    ]);
  });

  it("keeps common HTML helpers safe and A4/print-ready without browser behavior", () => {
    expect(escapeReportHtml('<script id="x">bad()</script>')).toBe(
      "&lt;script id=&quot;x&quot;&gt;bad()&lt;/script&gt;",
    );
    expect(formatReportIsoDate("2026-10-26")).toBe("26/10/2026");
    expect(formatReportIsoDate("unknown")).toBe("unknown");

    const provenanceHtml = renderReportProvenanceHtml(
      resolveReportProvenance([{ sourceId: "source-1", locator: "p. 10" }], [source]),
    );
    expect(provenanceHtml).toContain("Diretriz Exemplo");
    expect(provenanceHtml).toContain("https://example.org/guideline");
    expect(provenanceHtml).toContain("p. 10");

    const html = renderPrintableReportDocument({
      title: "Relatório teste",
      bodyHtml: "<section>conteúdo previamente escapado pelo módulo</section>",
    });
    expect(html).toContain("@page { size: A4");
    expect(html).toContain('id="print-report"');
    expect(html).toContain("Imprimir / salvar como PDF");
    expect(html).not.toContain("window.print");
  });

  it("keeps the shared reporting layer clinically agnostic", () => {
    const files = ["model.ts", "provenance.ts", "html.ts", "index.ts"];
    const sourceText = files
      .map((file) =>
        readFileSync(
          new NodeURL(`../../src/product/reporting/${file}`, import.meta.url),
          "utf8",
        ),
      )
      .join("\n");

    expect(sourceText).not.toMatch(/clinical\/|product\/ccr|CCR_IDS|crc-/);
    expect(sourceText).not.toMatch(/evaluateCcr|presentCcr|buildCcr/);
  });
});
