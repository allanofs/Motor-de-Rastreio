# ADR-005 — Estratégias e composição no contexto do track

Status: atualizado na Fase 4.2.

## Context

Regras competem dentro de uma decisão. Dois tracks podem usar o mesmo nome de grupo e selecionar estratégias diferentes sem competir entre si.

## Decision

Coexistência é padrão. Seleções de política são registros explícitos em `primaryStrategies[]`: `{ topicId, trackId, strategyGroupId, ruleId }`. A engine resolve grupos e composição dentro de cada track. `supersedes` e `excludes` devem referir regras do mesmo tópico e track; referência cruzada é erro de conteúdo, não supressão automática de outro pathway. `supersedes` continua um DAG.

## Isolamento de políticas e validação (Fase 4.2)

Conteúdo inválido de política não selecionada não contamina runtime da política ativa, embora possa continuar sendo detectado pela validação global/CI.

`parseContent` recupera ruleId/topicId antes da validação completa, projeta somente as regras de `policy.ruleIds`, suas fontes e a política ativa. `contentIssues` verifica esse conjunto no tópico avaliado. IDs conhecidos não selecionados são irrelevantes mesmo com corpo inválido; tópico comprovadamente externo também permite descartar regra sem ID. Identidade insuficiente para provar irrelevância provoca falha explícita nos consumidores possíveis. Não se escolhe silenciosamente entre identidades ativas duplicadas.

Referências supersedes/excludes cujo alvo não é selecionado não participam da composição runtime. Alvos selecionados continuam sujeitos a escopo de tópico/track e DAG. Isto não autoriza conteúdo quebrado: `validateBundle(unknown)` / `assertValidBundle(unknown)` auditam schemas, IDs duplicados, fontes, revisão, referências e grafo do bundle inteiro, inclusive regras órfãs/draft e políticas não selecionadas. O CI testa esse contrato; um futuro processo de conteúdo deve chamar assertValidBundle sobre cada bundle real antes de release. Nenhum bundle clínico existe nesta entrega.

## Consequences

Ações compatíveis são combinadas dentro do track; as ações dos tracks são agregadas sem escolher prioridade global. Estados incompatíveis na mesma decisão permanecem em Conflict. Uma estratégia curada inelegível não autoriza fallback silencioso. `replace` exige `supersedes` explícito. `manual_conflict` permanece disponível.

`choose_shorter_interval` e `choose_higher_acuity` continuam em ClinicalReviewRequired, inclusive quando houver resolver registrado. A Fase 4.1 não habilita comparador clínico. A mudança do mapa antigo para seleções com escopo é deliberada e não introduz uma policyVersion independente.

## Alternatives rejected

Vencedor global por domínio; chave de grupo sem tópico/track; concatenar IDs para codificar escopo; mergeMostRestrictive; comparador universal de intensidade; resolver usar recurso local como justificativa para trocar recomendação.
