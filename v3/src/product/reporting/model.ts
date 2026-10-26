import type { ReportProvenance } from "./provenance";

export type ReportBoundary<TCode extends string> = {
  code: TCode;
  triggerTrackIds: string[];
};

export type ReportOperationalAction = {
  availability: "available" | "unavailable" | "unknown";
  route: "local" | "referral" | "clinical_review" | "clarify_availability";
  routeLabel: string;
};

export type ReportPrimaryAction = {
  actionId: string;
  kind: string;
  text: string;
  resourceId?: string;
  operational?: ReportOperationalAction;
};

export type ReportRationale<TStatus extends string> = {
  trackId: string;
  trackLabel: string;
  status: TStatus;
  summary: string;
  activatedRuleIds: string[];
  guardrails: string[];
};

/**
 * Cross-module report envelope. Clinical input snapshots and status/boundary vocabularies
 * remain module-owned and are supplied through generic parameters.
 */
export type StructuredReportModel<
  TContractVersion extends string,
  TReleaseGate,
  TPolicy,
  TBoundaryCode extends string,
  TRationaleStatus extends string,
  TInputSnapshot,
> = {
  contractVersion: TContractVersion;
  releaseGate: TReleaseGate;
  rulesetVersion: string;
  policy: TPolicy;
  asOf: string;
  boundary: ReportBoundary<TBoundaryCode>;
  rationale: ReportRationale<TRationaleStatus>[];
  inputs: TInputSnapshot;
  primaryActions: ReportPrimaryAction[];
  unresolvedInformation: string[];
  provenance: ReportProvenance;
};
