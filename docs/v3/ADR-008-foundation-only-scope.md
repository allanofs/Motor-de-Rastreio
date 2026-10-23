# ADR-008 — Limite obrigatório da execução

Status: implementado para revisão técnica da foundation.

## Context

O contrato mestre prevê piloto CCR, mas a solicitação atual autoriza somente fases 0–4.

## Decision

Entregar schemas, calendário e engine genérica; usar apenas domínios técnicos fictícios em testes. Não criar bundle clínico, pesquisar CCR ou construir UI clínica. Parar após testes, documentação e PR de revisão.

## Consequences

Sem regras reais, políticas reais, FIT/colonoscopia clínicos, golden patients de CCR, comparação, migração, backend, persistência, publicação ou merge. O build é de biblioteca, sem index.html V3 nesta rodada.

## Alternatives rejected

Executar o contrato completo, aproveitar regras V2 ou usar memória médica para preencher lacunas.
