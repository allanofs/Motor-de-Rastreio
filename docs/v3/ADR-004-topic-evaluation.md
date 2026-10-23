# ADR-004 — Tracks independentes e resultado agregado

Status: atualizado pela autorização explícita da Fase 4.1. Substitui a decisão anterior de um único estado por tópico.

## Context

Um tópico pode conter decisões independentes. Current em um track e Due em outro não constituem conflito. Uma revisão clínica ou informação ausente em uma decisão não pode apagar uma ação automática de outra.

## Decision

`RuleDefinition.trackId` identifica a decisão. `TopicEvaluation.tracks[]` contém `TrackEvaluation`, cada qual com um único `state` discriminado, regras, ações, decisionSupport, dados ausentes, guardrails, agenda e trace. Não há `TopicEvaluation.pathwayState` nem prioridade clínica universal. Campos agregados do tópico são derivados dos tracks; `requiresAttention` é apenas um booleano derivado.

Fatos sem `topicId` pertencem ao paciente. Regras ativas selecionadas consultam fatos globais pelo `conceptId`; `topicId` opcional restringe um fato local. Um fato global é projetado em memória nos consumidores e não é duplicado no input nem contado como múltiplos registros da sessão.

## Consequences

Current e Due, ou ClinicalReviewRequired e Due, coexistem em tracks distintos. Exceção em um track preserva seus irmãos e outros domínios. Falha estrutural/semântica de entrada ou conteúdo pode invalidar o domínio afetado como um todo. Fato global malformado com conceito identificável afeta apenas domínios consumidores; se a identidade/escopo não permitir roteamento seguro, ocorre falha explícita. Erros de envelope compartilhado ou política inexistente são erros da API, sem fallback.

Mudanças incompatíveis de API são deliberadas nesta versão alpha: consumidores leem `tracks[].state`, e ações carregam `topicId` e `trackId`. O calendário e a exigência de evidência positiva para Current permanecem.

## Alternatives rejected

Escolher um único estado vencedor no domínio; tratar Current + Due independentes como Conflict; três eixos de estado independentes; replicar fatos transversais; esconder falha como lista vazia.
