import { z } from 'zod';
import { IdSchema } from './common';
import { ActionDefinitionSchema } from './content';
import { CalendarDateSchema, DateIntervalSchema } from './dates';
export const PathwayStateSchema = z.discriminatedUnion('status',[
  z.strictObject({status:z.literal('Current'),anchorEventId:IdSchema,ruleId:IdSchema}),
  z.strictObject({status:z.literal('Due')}),
  z.strictObject({status:z.literal('NotApplicable'),reason:z.string().min(1)}),
  z.strictObject({status:z.literal('Indeterminate'),reason:z.string().min(1)}),
  z.strictObject({status:z.literal('PendingResult')}),
  z.strictObject({status:z.literal('InFollowUp')}),
  z.strictObject({status:z.literal('SharedDecision')}),
  z.strictObject({status:z.literal('ClinicalReviewRequired'),reason:z.string().min(1)}),
  z.strictObject({status:z.literal('HandedOff')}),
  z.strictObject({status:z.literal('Conflict'),ruleIds:z.array(IdSchema).min(2),reason:z.string().min(1)}),
  z.strictObject({status:z.literal('ComputationError'),code:IdSchema,message:z.string().min(1)}),
]);
export type PathwayState = z.infer<typeof PathwayStateSchema>;
export const DecisionTraceSchema = z.strictObject({
  engineVersion:z.string(),rulesetVersion:z.string(),policyId:IdSchema,asOf:CalendarDateSchema,
  factsUsed:z.array(IdSchema),rulesEvaluated:z.array(IdSchema),rulesActivated:z.array(IdSchema),
  rulesSuppressed:z.array(z.strictObject({ruleId:IdSchema,reason:z.string()})),
  outputs:z.array(z.string()),sourceIds:z.array(IdSchema),
  sourceRefs:z.array(z.strictObject({sourceId:IdSchema,locator:z.string()})),
  stages:z.array(z.string()),issues:z.array(z.string()),
});
export type DecisionTrace = z.infer<typeof DecisionTraceSchema>;
export const EvaluatedActionSchema = ActionDefinitionSchema.extend({ruleIds:z.array(IdSchema).min(1),
  operational:z.strictObject({availability:z.enum(['available','unavailable','unknown']),route:z.enum(['local','referral','clinical_review','clarify_availability'])}).optional(),
});
export type EvaluatedAction = z.infer<typeof EvaluatedActionSchema>;
export const ScheduleInformationSchema = z.strictObject({ruleId:IdSchema,anchorEventId:IdSchema,dueWindow:DateIntervalSchema,status:z.enum(['Current','Due','Indeterminate'])});
export type ScheduleInformation = z.infer<typeof ScheduleInformationSchema>;
export const TopicEvaluationSchema = z.strictObject({
  topicId:IdSchema,completeness:z.enum(['complete','incomplete']),pathwayState:PathwayStateSchema,
  activeRuleIds:z.array(IdSchema),primaryStrategyRuleId:IdSchema.optional(),actions:z.array(EvaluatedActionSchema),
  missingData:z.array(z.string()),guardrails:z.array(z.string()),scheduleInformation:z.array(ScheduleInformationSchema),
  suppressedRules:z.array(z.strictObject({ruleId:IdSchema,reason:z.string()})),trace:DecisionTraceSchema,
}).superRefine((t,ctx)=>{
  const state=t.pathwayState;
  if(state.status==='Current' && !t.scheduleInformation.some(s=>s.status==='Current' && s.anchorEventId===state.anchorEventId && s.ruleId===state.ruleId)) ctx.addIssue({code:'custom',message:'Current requires positive scheduling evidence'});
  if(['ComputationError','Conflict','NotApplicable','ClinicalReviewRequired'].includes(t.pathwayState.status) && t.actions.length>0) ctx.addIssue({code:'custom',message:'Abstention cannot emit automatic actions'});
  if(t.actions.some(a=>a.ruleIds.some(id=>!t.activeRuleIds.includes(id)))) ctx.addIssue({code:'custom',message:'Inactive rule emitted an action'});
});
export type TopicEvaluation = z.infer<typeof TopicEvaluationSchema>;
export const ConsultationPlanSchema = z.strictObject({topics:z.array(TopicEvaluationSchema),actions:z.array(EvaluatedActionSchema),requiresAttention:z.boolean()});
export type ConsultationPlan = z.infer<typeof ConsultationPlanSchema>;
