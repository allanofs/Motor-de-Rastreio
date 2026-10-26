import {
  RuleDefinitionSchema,
  type RuleDefinition,
  type SourceRef,
} from "../../model/content";
import {
  MAMA_PROPOSITION_IDS,
  mamaEvidencePropositions,
} from "./evidence";

export type MamaPropositionId =
  (typeof MAMA_PROPOSITION_IDS)[keyof typeof MAMA_PROPOSITION_IDS];

export function sourceRefsFor(
  propositionId: MamaPropositionId,
): SourceRef[] {
  const proposition = mamaEvidencePropositions.find(
    (item) => item.propositionId === propositionId,
  );
  if (proposition === undefined) {
    throw new Error(`Unknown Mama evidence proposition: ${propositionId}`);
  }
  return [...proposition.sourceRefs];
}

export function mamaDraftRule(
  input: Record<string, unknown>,
  rationale: string,
): RuleDefinition {
  return RuleDefinitionSchema.parse({
    ...input,
    lifecycleStatus: "draft",
    reviewStatus: "source_verified",
    governance: {
      author: "Allan Ramos Costa",
      rationale,
      reviews: [],
    },
  });
}
