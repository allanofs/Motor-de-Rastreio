export type MamaUiMammography = {
  kind: "mammography";
  id: string;
  role: "screening" | "diagnostic";
  date?: string;
  disposition:
    | "routine_return"
    | "specific_attention"
    | "indeterminate"
    | "pending"
    | "unknown";
  quality: "adequate" | "inadequate" | "unknown";
  completeness: "complete" | "incomplete" | "unknown";
  resolutionInformation: "sufficient" | "insufficient" | "unknown";
};

/**
 * Ephemeral in-memory pilot state only. No persistence, storage or transmission.
 */
export const mamaPilotMammographies: MamaUiMammography[] = [];
