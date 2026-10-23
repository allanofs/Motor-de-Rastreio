# ADR-003 — Calendário e incerteza temporal

Status: implementado para revisão técnica da foundation.

## Context

Datas clínicas podem ter precisão de ano, mês ou dia e não devem virar timestamps.

## Decision

Usar union discriminada e intervalo inclusivo min/max. Aniversário é Due na própria data. Soma de meses/anos faz clamp de fim de mês. Datas possivelmente futuras ou pré-nascimento exigem esclarecimento; nenhuma precisão é inventada.

## Consequences

Limite 1–9999, overflow falha com segurança. Eventos do mesmo dia não provam sequência. Idade de nascimento em 29/02 completa em 01/03 no ano não bissexto. Essas convenções são técnicas e voltam à revisão ao implementar medicina.

## Alternatives rejected

Date nativo, timezone, completar 01/01, truncar intervalo parcial em asOf ou assumir ordem no mesmo dia.
