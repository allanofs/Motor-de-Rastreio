# ADR-006 — Recursos separados do paciente

Status: implementado para revisão técnica da foundation.

## Context

Recurso local não deve substituir a recomendação científica.

## Decision

CareSettingContext é separado, opcional e sem persistência nesta rodada. Chaves ausentes são unknown. Somente ações que referenciam um recurso ganham metadados operacionais.

## Consequences

Texto e kind científicos permanecem iguais entre serviços. Rota de indisponibilidade deve ser referral explicitamente declarado ou clinical_review, sem inventar alternativa clínica.

## Alternatives rejected

Inferir indisponibilidade de ausência de configuração ou rebaixar recomendação por acesso.
