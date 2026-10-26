# 41 — Fase 6.H1: active freeze do hotfix `family-status`

**Data:** 25/10/2026  
**Branch:** `v3-ccr-family-status-hotfix`  
**PR:** #6 — Draft  
**Snapshot ativo:** `crc-0.5.9-phase6-h1-active`

## Decisão

Após R1, R2 independente com aprovação integral e gate separado de activation/readiness, o responsável do projeto autorizou a continuidade para o próximo passo concreto. A promoção H1 cria novo snapshot imutável ativo e reponta o entrypoint clínico canônico.

A promoção altera somente:

- `rulesetVersion`;
- `lifecycleStatus: draft -> active` nas três regras H1:
  - `crc.sus.family-status`;
  - `crc.ba-a.family-status`;
  - `crc.intl.family-status`.

Não altera:

- conteúdo clínico;
- critérios;
- actions;
- sourceRefs;
- evidence metadata;
- policies;
- terminology;
- resolvers;
- reviewer records;
- `engine/**`;
- `model/**`.

## Comportamento governado preservado

- história familiar negativa conhecida → `NotApplicable` no track `family-status`;
- história desconhecida/incompleta → `Indeterminate`;
- história positiva SUS/BA-A → `ClinicalReviewRequired`;
- Internacional → somente padrões ACG estreitos já governados são delegados; padrões complexos permanecem em revisão;
- estratégia FIT/colonoscopia e disponibilidade operacional permanecem independentes do hotfix.

## Ressalva arquitetural

`stance: recommend` continua sendo sentinel técnico temporário no scaffold das três regras H1 para permitir a execução do resolver no Foundation atual. O scaffold não possui ações genéricas e seu outcome genérico é `NotApplicable`.

UI, auditoria e relatório nunca devem inferir recomendação clínica a partir de `stance` isoladamente. A recomendação deve derivar do estado final, actions e provenance efetivamente utilizada.

## Significado de `active`

`active` significa apenas que o conteúdo clínico governado pode ser consumido pela camada de produto.

Não significa:

- merge da PR #6;
- merge das PRs #3 ou #4;
- deploy;
- publicação;
- autorização de uso clínico real;
- autorização regulatória;
- conclusão da Fase 7.5.

## Próximo gate

Reintegrar o snapshot corrigido na camada de produto e repetir o cenário real que revelou o blocker. A nova decisão arquitetural de Depth Budget / Boundary of Automation será tratada em branch e documentação separadas, sem reabrir ou apagar o mecanismo longitudinal profundo já validado no CCR.
