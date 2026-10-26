import type { Source, SourceRef } from "../../model/content";

export type ReportSourceReference = {
  locator: string;
  evidence?: SourceRef["evidence"];
};

export type ReportResolvedSource = {
  sourceId: string;
  institution: string;
  documentTitle: string;
  publicationYear: number;
  version: string;
  jurisdiction: string;
  url: string;
  references: ReportSourceReference[];
};

export type ReportUnresolvedSource = {
  sourceId: string;
  locator: string;
  reason: "source_not_found_in_governed_catalog";
};

export type ReportProvenance = {
  status: "complete" | "incomplete";
  sources: ReportResolvedSource[];
  unresolved: ReportUnresolvedSource[];
};

function sourceRefKey(ref: SourceRef): string {
  return JSON.stringify([ref.sourceId, ref.locator, ref.evidence ?? null]);
}

/**
 * Resolves only the source references already emitted by a governed decision trace.
 * It never infers bibliography from policy names, clinical text, or module identity.
 */
export function resolveReportProvenance(
  sourceRefs: SourceRef[],
  sourceCatalog: Source[],
): ReportProvenance {
  const catalog = new Map(sourceCatalog.map((source) => [source.sourceId, source]));
  const grouped = new Map<string, { source: Source; refs: SourceRef[] }>();
  const unresolved: ReportUnresolvedSource[] = [];
  const seenRefs = new Set<string>();

  for (const ref of sourceRefs) {
    const key = sourceRefKey(ref);
    if (seenRefs.has(key)) continue;
    seenRefs.add(key);

    const source = catalog.get(ref.sourceId);
    if (source === undefined) {
      unresolved.push({
        sourceId: ref.sourceId,
        locator: ref.locator,
        reason: "source_not_found_in_governed_catalog",
      });
      continue;
    }

    const current = grouped.get(source.sourceId);
    if (current === undefined) grouped.set(source.sourceId, { source, refs: [ref] });
    else current.refs.push(ref);
  }

  const sources = [...grouped.values()].map(({ source, refs }) => ({
    sourceId: source.sourceId,
    institution: source.institution,
    documentTitle: source.documentTitle,
    publicationYear: source.publicationYear,
    version: source.version,
    jurisdiction: source.jurisdiction,
    url: source.url,
    references: refs.map((ref) => ({
      locator: ref.locator,
      ...(ref.evidence === undefined ? {} : { evidence: ref.evidence }),
    })),
  }));

  return {
    status: unresolved.length === 0 ? "complete" : "incomplete",
    sources,
    unresolved,
  };
}
