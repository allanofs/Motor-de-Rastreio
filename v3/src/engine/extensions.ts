import { z } from "zod";
import { IdSchema } from "../model/common";
import { PathwayStateSchema } from "../model/evaluation";
import type { TrackEvaluation } from "../model/evaluation";
import type { Patient } from "../model/patient";
import type { Policy, RuleDefinition } from "../model/content";
import type { CalendarDate } from "../model/dates";
import type { DomainHistory } from "./resolveHistory";
export type DeepReadonly<T> = T extends readonly (infer U)[]
  ? readonly DeepReadonly<U>[]
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;
type MutableDomainResolverInput = {
  topicId: string;
  trackId: string;
  patient: Patient;
  history: DomainHistory;
  rules: RuleDefinition[];
  policy: Policy;
  asOf: CalendarDate;
  genericTrack: TrackEvaluation;
};
export type DomainResolverInput = DeepReadonly<MutableDomainResolverInput>;
export const DomainResolutionSchema = z.strictObject({
  state: PathwayStateSchema,
  actionIds: z.array(IdSchema),
  decisionSupportIds: z.array(IdSchema).default([]),
  missingData: z.array(z.string()).default([]),
  guardrails: z.array(z.string()).default([]),
});
export type DomainResolution = z.infer<typeof DomainResolutionSchema>;
/** Trusted, reviewed pure functions. Metadata explicitly declares every additional concept dependency. */
export type DomainResolver = {
  resolverId: string;
  version: string;
  topicId: string;
  trackId: string;
  requiredConceptIds: readonly string[];
  resolve: (input: DomainResolverInput) => DomainResolution;
};
export type DomainResolverRegistry = readonly DomainResolver[];
const RegistrationSchema = z.strictObject({
  resolverId: IdSchema,
  version: z.string().min(1),
  topicId: IdSchema,
  trackId: IdSchema,
  requiredConceptIds: z.array(IdSchema),
  resolve: z.custom<DomainResolver["resolve"]>(
    (value) => typeof value === "function",
  ),
});
export function validateResolverRegistry(
  input: unknown,
): DomainResolverRegistry {
  const registry = z.array(RegistrationSchema).parse(input);
  const keys = registry.map((r) => JSON.stringify([r.topicId, r.trackId]));
  if (new Set(keys).size !== keys.length)
    throw new Error("Multiple resolvers registered for one track");
  if (new Set(registry.map((r) => r.resolverId)).size !== registry.length)
    throw new Error("Duplicate resolver identity");
  return registry;
}
export function resolverConcepts(
  registry: DomainResolverRegistry,
): ReadonlyMap<string, readonly string[]> {
  const map = new Map<string, string[]>();
  for (const resolver of registry)
    map.set(resolver.topicId, [
      ...(map.get(resolver.topicId) ?? []),
      ...resolver.requiredConceptIds,
    ]);
  return map;
}
function freezeDeep<T>(value: T): DeepReadonly<T> {
  if (value !== null && typeof value === "object") {
    Object.freeze(value);
    for (const child of Object.values(value)) freezeDeep(child);
  }
  return value as DeepReadonly<T>;
}
export function immutableResolverInput(
  input: MutableDomainResolverInput,
): DomainResolverInput {
  const copy = structuredClone(input);
  copy.genericTrack.actions = copy.genericTrack.actions.map((action) => {
    const { operational: _operational, ...scientific } = action;
    return scientific;
  });
  return freezeDeep(copy);
}
