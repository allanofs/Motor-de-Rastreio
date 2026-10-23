# ADR-005 — Estratégias e composição explícitas

Status: implementado para revisão técnica da foundation.

## Context

Mais intenso ou menor intervalo não é um desempate clínico universal.

## Decision

Coexistência é padrão; strategyGroupId restringe competição, política seleciona estratégia, supersedes é DAG, excludes conflitante é erro de conteúdo visível. Ações compatíveis são combinadas.

## Consequences

replace requer supersedes. choose_shorter_interval e choose_higher_acuity ficam representáveis mas abstêm até comparador do domínio ser definido/revisado. Estados incompatíveis produzem Conflict sem ações. A P0 não define semântica suficiente para comparadores genéricos.

## Alternatives rejected

Vencedor global por domínio; mergeMostRestrictive; atribuição automática de prioridade clínica.
