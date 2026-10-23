import { RuleDefinitionSchema, RulesetSchema, PolicySchema, SourceSchema } from '../src/model/content';
import { PatientSchema } from '../src/model/patient';
import { parseCalendarDate as day } from '../src/model/dates';
// Exclusively technical fixtures. No clinical source, policy or interval is represented here.
export const source=SourceSchema.parse({sourceId:'technical-source',institution:'Technical test suite',documentTitle:'Synthetic contract',publicationYear:2026,version:'test',jurisdiction:'test',documentStatus:'final',url:'https://example.invalid/technical',lastVerifiedAt:day('2026-01-01')});
export const rule=RuleDefinitionSchema.parse({ruleId:'r1',topicId:'technical-a',lifecycleStatus:'active',reviewStatus:'source_verified',clinicalRole:'technical',stance:'recommend',computability:'computable',requiredKnownFacts:[],population:{facts:[]},exclusions:[],actions:[{actionId:'a1',kind:'recommendation',text:'Synthetic action'}],outcome:'Due',supersedes:[],excludes:[],guardrails:[],sourceRefs:[{sourceId:source.sourceId,locator:'technical assertion 1'}],governance:{author:'technical-tests',rationale:'Not a clinical rule'}});
export const policy=PolicySchema.parse({policyId:'technical-only',label:'Technical test only',family:'technical',topicIds:['technical-a'],ruleIds:['r1'],primaryStrategies:{}});
export const bundle=RulesetSchema.parse({rulesetVersion:'technical-fixture-1',rules:[rule],sources:[source],policies:[policy],terminology:[]});
export const patient=PatientSchema.parse({context:{ageYears:40},facts:[],examHistory:[],historyKnowledge:{'technical-a':'unknown'}});
export const asOf=day('2026-10-23');
