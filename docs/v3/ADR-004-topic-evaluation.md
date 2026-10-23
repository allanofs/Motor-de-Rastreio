# ADR-004 — Resultado e isolamento por domínio

Status: implementado para revisão técnica da foundation.

## Context

Um domínio incompleto ou com erro não pode apagar todo o plano.

## Decision

TopicEvaluation[] usa pathwayState discriminado e actions[]. Isolar validação local e avaliação por domínio. Validação de saída reforça âncora de Current e proíbe ações de regras inativas.

## Consequences

Falhas locais preservam domínios válidos. Erro de envelope compartilhado sem identidade confiável ou política desconhecida é erro explícito da API, não fallback. Erros não exibem stack ou valores do paciente. Um estado único por domínio ainda não representa ações independentes com estados diferentes: essa lacuna da P0 fica registrada para revisão, e a engine produz Conflict em vez de redesenhar o modelo.

## Alternatives rejected

Card global único, eixos de estados independentes e lista vazia silenciosa em falha.
