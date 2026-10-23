# ADR-008 — Limite obrigatório da execução

Status: atualizado na Fase 4.1.

## Context

O contrato mestre prevê CCR, mas a primeira execução autorizou apenas fases 0–4. O novo anexo autoriza explicitamente correções arquiteturais na Fase 4.1, na mesma branch e PR.

## Decision

Executar as correções da foundation, testes e documentação na `v3-foundation-technical` e PR #1, em rascunho. A mudança para tracks e fatos do paciente foi expressamente autorizada; não é um redesenho silencioso. Parar ao final da Fase 4.1.

## Consequences

Continuam excluídos pesquisa clínica, regras/políticas reais, FIT ou colonoscopia clínicos, golden patients clínicos, UI, outros domínios reais, persistência, backend, publicação e merge. Nenhuma nova branch será criada nesta rodada. V2 permanece byte a byte igual; main não será modificada.

## Alternatives rejected

Avançar para a Fase 5, abrir outra PR, copiar medicina da V2 ou usar conhecimento geral para preencher conteúdo clínico.
