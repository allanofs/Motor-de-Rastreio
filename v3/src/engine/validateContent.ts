import type { Policy, Ruleset } from '../model/content';

export function contentIssues(bundle: Ruleset, policy: Policy, topicId: string): string[] {
  const issues: string[]=[];
  const duplicate = (ids:string[],label:string):void => {if(new Set(ids).size!==ids.length) issues.push(`duplicate_${label}`);};
  duplicate(bundle.rules.map(r=>r.ruleId),'rule_id'); duplicate(bundle.sources.map(s=>s.sourceId),'source_id');
  duplicate(bundle.policies.map(p=>p.policyId),'policy_id'); duplicate(policy.ruleIds,'policy_rule');duplicate(policy.topicIds,'policy_topic');
  const rules=bundle.rules.filter(r=>r.topicId===topicId), byId=new Map(bundle.rules.map(r=>[r.ruleId,r]));
  for(const id of policy.ruleIds) if(!byId.has(id)) issues.push(`unknown_rule:${id}`);
  for(const r of rules) {
    duplicate(r.actions.map(a=>a.actionId),'action_id');
    for(const id of [...r.supersedes,...r.excludes]) {
      if(byId.get(id)?.topicId!==topicId) issues.push(`invalid_rule_reference:${r.ruleId}:${id}`);
      if(id===r.ruleId) issues.push(`self_reference:${id}`);
    }
    for(const ref of r.sourceRefs) {
      const source=bundle.sources.find(s=>s.sourceId===ref.sourceId);
      if(source===undefined) issues.push(`missing_source:${ref.sourceId}`);
      else if(r.lifecycleStatus==='active' && (source.documentStatus!=='final'||source.supersededBy!==undefined)) issues.push(`non_final_source:${ref.sourceId}`);
    }
    if(r.lifecycleStatus==='active' && r.reviewStatus==='unreviewed') issues.push(`unreviewed_active_rule:${r.ruleId}`);
    if(r.compositionPolicy==='replace' && r.supersedes.length===0) issues.push(`replace_without_supersedes:${r.ruleId}`);
  }
  const visiting=new Set<string>(),done=new Set<string>();
  const visit=(id:string):void=>{
    if(visiting.has(id)) {issues.push('supersedes_cycle');return;}
    if(done.has(id)) return;
    visiting.add(id); for(const next of byId.get(id)?.supersedes??[]) visit(next); visiting.delete(id);done.add(id);
  };
  for(const r of rules) visit(r.ruleId);
  for(const [group,id] of Object.entries(policy.primaryStrategies)) {
    const r=byId.get(id);
    if(r?.strategyGroupId!==group || !policy.ruleIds.includes(id)) issues.push(`invalid_primary_strategy:${group}`);
  }
  for(const id of policy.ruleIds) if(!policy.topicIds.includes(byId.get(id)?.topicId??'')) issues.push(`unlisted_policy_topic:${id}`);
  return [...new Set(issues)].sort();
}
