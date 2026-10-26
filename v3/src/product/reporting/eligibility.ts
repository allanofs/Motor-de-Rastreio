export type ReportExportEligibility =
  | { ok: true }
  | { ok: false; code: "pending_input" | "incomplete_evaluation" };

export type ReportExportEligibilityInput<TBoundaryCode extends string> = {
  requestedInputCount: number;
  boundaryCode: TBoundaryCode;
  incompleteBoundaryCodes: readonly TBoundaryCode[];
};

/**
 * Determines only whether the current product state is complete enough to export.
 * The calling module owns the boundary vocabulary and decides which boundary codes
 * are considered incomplete. No clinical interpretation happens here.
 */
export function assessReportExportEligibility<TBoundaryCode extends string>({
  requestedInputCount,
  boundaryCode,
  incompleteBoundaryCodes,
}: ReportExportEligibilityInput<TBoundaryCode>): ReportExportEligibility {
  if (requestedInputCount > 0) return { ok: false, code: "pending_input" };
  if (incompleteBoundaryCodes.includes(boundaryCode))
    return { ok: false, code: "incomplete_evaluation" };
  return { ok: true };
}
