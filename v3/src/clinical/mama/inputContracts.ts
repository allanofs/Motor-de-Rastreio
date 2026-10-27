import { MAMA_IDS } from "./terminology";

/**
 * Explicit V1 input contract for already-established high familial risk.
 *
 * This concept is an externally established clinical state. The Motor must not
 * infer it from a generic positive family history or reconstruct a risk model.
 */
export const MAMA_KNOWN_HIGH_RISK_FAMILIAL_CONTEXT_CONTRACT = {
  conceptId: MAMA_IDS.concepts.knownHighRiskFamilialContext,
  yesMeans:
    "High familial breast-cancer risk has already been established by an appropriate external clinical or risk assessment.",
  mustNotInferFrom: [
    "any positive family history alone",
    "a single first-degree relative with post-menopausal breast cancer alone",
    "UI heuristics or simple relative-count rules",
  ],
  calculationsOutsideV1: ["Gail", "Tyrer-Cuzick", "BOADICEA"],
} as const;
