import { z } from 'zod';
export const IdSchema = z.string().min(1).max(120).regex(/^[a-zA-Z0-9][a-zA-Z0-9_.:-]*$/).refine(s => !['__proto__','constructor','prototype'].includes(s));
export const PresenceSchema = z.enum(['yes','no','unknown','not_applicable']);
export type Presence = z.infer<typeof PresenceSchema>;
export const ScalarSchema = z.union([z.string(),z.number().finite(),z.boolean()]);
export const unique = (values: readonly string[]): string[] => [...new Set(values)].sort();
