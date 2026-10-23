# ADR-005 — Estratégias e composição no contexto do track

Status: atualizado na Fase 4.1.

## Context

Regras competem dentro de uma decisão. Dois tracks podem usar o mesmo nome de grupo e selecionar estratégias diferentes sem competir entre si.

## Decision

Coexistência é padrão. Seleções de política são registros explícitos em `primaryStrategies[]`: `{ topicId, trackId, strategyGroupId, ruleId }`. A engine resolve grupos e composição dentro de cada track. `supersedes` e `excludes` devem referir regras do mesmo tópico e track; referência cruzada é erro de conteúdo, não supressão automática de outro pathway. `supersedes` continua um DAG.

## Consequences

Ações compatíveis são combinadas dentro do track; as ações dos tracks são agregadas sem escolher prioridade global. Estados incompatíveis na mesma decisão permanecem em Conflict. Uma estratégia curada inelegível não autoriza fallback silencioso. `replace` exige `supersedes` explícito. `manual_conflict` permanece disponível.

`choose_shorter_interval` e `choose_higher_acuity` continuam em ClinicalReviewRequired, inclusive quando houver resolver registrado. A Fase 4.1 não habilita comparador clínico. A mudança do mapa antigo para seleções com escopo é deliberada e não introduz uma policyVersion independente.

## Alternatives rejected

Vencedor global por domínio; chave de grupo sem tópico/track; concatenar IDs para codificar escopo; mergeMostRestrictive; comparador universal de intensidade; resolver usar recurso local como justificativa para trocar recomendação.
