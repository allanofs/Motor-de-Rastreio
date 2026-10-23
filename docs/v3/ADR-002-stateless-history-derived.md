# ADR-002 — Estado derivado sem persistência

Status: implementado para revisão técnica da foundation.

## Context

Fatos e múltiplos exames devem preservar história e identidade sem transformar o produto em prontuário.

## Decision

Patient contém context, facts, examHistory e historyKnowledge. Estado, plano e trace são derivados por chamada; nenhum armazenamento automático ou relógio global.

## Consequences

O chamador injeta asOf e bundle. IDs devem ser fornecidos estavelmente na sessão. Trace tem dados potencialmente sensíveis e permanece apenas em memória.

## Alternatives rejected

Episódios, tarefas e recomendações persistidos; banco de dados e backend.
