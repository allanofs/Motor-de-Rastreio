# ADR-007 — Abstensão e governança

Status: implementado para revisão técnica da foundation.

## Context

Dados ausentes, julgamento clínico, conflito e falha técnica têm significados diferentes.

## Decision

Preservar Indeterminate, ClinicalReviewRequired, Conflict e ComputationError. Exigir stance, computability, locator e governança. Regra ativa requer review diferente de unreviewed e fonte final não substituída.

## Consequences

Testes verdes não contam como revisão médica. Evidência insuficiente não vira recomendação contrária. Não há conteúdo médico para aprovar nesta entrega.

## Alternatives rejected

Booleano clínico ambíguo, unknown convertido em no, fonte preliminar tratada como vigente e promoção automática por CI.
