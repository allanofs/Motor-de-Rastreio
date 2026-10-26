import type { ReportProvenance } from "./provenance";

export function escapeReportHtml(value: unknown): string {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function formatReportIsoDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : iso;
}

export function renderReportProvenanceHtml(provenance: ReportProvenance): string {
  const esc = escapeReportHtml;
  const warning = provenance.status === "incomplete"
    ? `<div class="warning"><strong>Rastreabilidade bibliográfica incompleta.</strong> ${provenance.unresolved.map((item) => `${esc(item.sourceId)} (${esc(item.locator)})`).join("; ")}. Nenhuma referência ausente foi inventada.</div>`
    : "";
  const sources = provenance.sources.map((source, index) => `<article class="source">
    <h3>${index + 1}. ${esc(source.documentTitle)}</h3>
    <p><strong>Instituição:</strong> ${esc(source.institution)}</p>
    <p><strong>Ano / versão:</strong> ${esc(source.publicationYear)} - ${esc(source.version)}</p>
    <p><strong>Jurisdição:</strong> ${esc(source.jurisdiction)}</p>
    <p><strong>Identificador:</strong> <code>${esc(source.sourceId)}</code></p>
    <p><strong>Fonte oficial:</strong> <a href="${esc(source.url)}">${esc(source.url)}</a></p>
    <p><strong>Localizador(es):</strong></p>
    <ul>${source.references.map((ref) => `<li>${esc(ref.locator)}</li>`).join("")}</ul>
  </article>`).join("");
  return `${warning}${sources || '<p class="muted">Nenhuma fonte governada foi resolvida para esta conclusão.</p>'}`;
}

export const REPORT_A4_BASE_CSS = `:root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#172033}*{box-sizing:border-box}body{margin:0;background:#eef1f6}.toolbar{position:sticky;top:0;z-index:5;display:flex;justify-content:center;padding:12px;background:#172033}.toolbar button{border:0;border-radius:8px;padding:10px 16px;font:inherit;font-weight:750;cursor:pointer;background:#fff;color:#172033}.page{width:min(210mm,calc(100% - 24px));min-height:297mm;margin:16px auto;background:#fff;padding:18mm 16mm;box-shadow:0 10px 30px rgba(0,0,0,.08)}.eyebrow{text-transform:uppercase;letter-spacing:.08em;font-size:10px;font-weight:800;color:#5269aa}h1{font-size:25px;margin:4px 0}h2{font-size:17px;margin:24px 0 10px;border-bottom:1px solid #dfe4ee;padding-bottom:6px}h3{font-size:13px;margin:14px 0 6px}p,li{font-size:12px;line-height:1.55}ul{padding-left:20px}.meta{display:grid;grid-template-columns:1fr 1fr;gap:8px 18px;margin:18px 0;padding:12px;border:1px solid #dfe4ee;border-radius:10px;background:#f7f9fc}.meta div{font-size:11px}.result{border-left:5px solid #304c9b;padding:12px 14px;background:#f5f7fc;border-radius:8px}.result h2{border:0;margin:0 0 6px;padding:0;font-size:20px}.rationale{border-left:3px solid #7b8abb;padding:3px 0 3px 12px;margin:10px 0}.rationale h3{margin-top:0}.warning{margin:12px 0;padding:10px 12px;border:1px solid #e2bf55;background:#fff4cc;border-radius:8px;font-size:11px;line-height:1.5}.muted{color:#626c80}.badge{display:inline-block;margin-left:6px;padding:2px 6px;border-radius:999px;background:#edf7f1;color:#205f43;font-size:9px;font-weight:750}.source{page-break-inside:avoid;border:1px solid #dfe4ee;border-radius:8px;padding:10px 12px;margin:10px 0}.source p{margin:4px 0}details{font-size:11px}a{color:#304c9b;overflow-wrap:anywhere}code{font-size:10px;overflow-wrap:anywhere}footer{margin-top:28px;padding-top:10px;border-top:1px solid #dfe4ee;color:#6b7486;font-size:9px;line-height:1.5}@page { size: A4; margin: 12mm; }@media print{body{background:#fff}.toolbar{display:none!important}.page{width:auto;min-height:0;margin:0;padding:0;box-shadow:none}a{color:#000;text-decoration:none}}@media(max-width:650px){.page{padding:24px 18px}.meta{grid-template-columns:1fr}}`;

export type PrintableReportDocument = {
  title: string;
  bodyHtml: string;
  language?: string;
  printButtonLabel?: string;
};

/**
 * Wraps already-escaped module report content in the proven local A4 shell.
 * This helper does not evaluate clinical data and does not attach browser behavior.
 */
export function renderPrintableReportDocument({
  title,
  bodyHtml,
  language = "pt-BR",
  printButtonLabel = "Imprimir / salvar como PDF",
}: PrintableReportDocument): string {
  return `<!doctype html>
<html lang="${escapeReportHtml(language)}"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>${escapeReportHtml(title)}</title>
<style>
${REPORT_A4_BASE_CSS}
</style></head><body>
<div class="toolbar"><button id="print-report" type="button">${escapeReportHtml(printButtonLabel)}</button></div>
<main class="page">
${bodyHtml}
</main></body></html>`;
}
