# ADR-001 — Tipagem e fronteiras

Status: implementado para revisão técnica da foundation.

## Context

O contrato requer TypeScript strict, Vite, Vitest e Zod, preservando a V2.

## Decision

Isolar dependências e lockfile em /v3; schemas Zod estritos são a fonte dos tipos inferidos. Habilitar noUncheckedIndexedAccess e exactOptionalPropertyTypes. Construir biblioteca ES com Vite nesta rodada.

## Consequences

Entradas inválidas não sofrem coerção. O V3 não depende do DOM. Build não fornece UI clínica.

## Alternatives rejected

Framework de UI, alteração da raiz V2, any e schema permissivo.
