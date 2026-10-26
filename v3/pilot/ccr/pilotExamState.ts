export type FitUiExam = {
  kind: "fit";
  id: string;
  status: "performed" | "not_performed" | "unknown";
  date?: string;
  result?: "positive" | "negative" | "pending" | "invalid" | "unknown";
};

export type ColonoscopyUiExam = {
  kind: "colonoscopy";
  id: string;
  status: "performed" | "not_performed" | "unknown";
  role: "screening" | "post_fit_positive" | "other_or_unknown";
  date?: string;
  result?: "normal" | "polyp_or_lesion" | "cancer" | "pending" | "unknown";
  preparation?: "adequate" | "inadequate" | "unknown";
  completeness?: "complete" | "incomplete" | "unknown";
  resolutionInformation?: "sufficient" | "insufficient" | "unknown";
};

export type UiExam = FitUiExam | ColonoscopyUiExam;

/**
 * Pilot-only in-memory exam state. No persistence, transport or clinical inference.
 * main.ts mutates this collection; report export reads a defensive snapshot.
 */
export const pilotExams: UiExam[] = [];

export function snapshotPilotExams(): UiExam[] {
  return structuredClone(pilotExams);
}
