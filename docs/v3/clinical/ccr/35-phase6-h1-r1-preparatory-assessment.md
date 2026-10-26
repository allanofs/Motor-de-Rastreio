# 35 — Fase 6.H1: avaliação preparatória para decisão R1

**Data:** 25/10/2026  
**Branch:** `v3-ccr-family-status-hotfix`  
**PR:** #6 — Draft  
**Candidato:** `crc-0.5.6-phase6-h1-family-status-draft`

## Resultado preparatório

**Aprovável para R1, com ressalva semântica documentada.**

A comparação entre:

- Fase 6.4 de história familiar;
- policy SUS;
- policy Brasil ampliado BA-A;
- policy Internacional;
- regras-base `family-status`;
- `familyStatusResolver64` existente;
- regressões do hotfix;

mostra que o comportamento corrigido restaura a intenção clínica já aprovada sem introduzir uma nova política clínica.

## Conclusões por cenário

### História familiar negativa

Correto: `crc-family-status = NotApplicable` em SUS, BA-A e Internacional, sem revisão clínica espúria.

### História familiar desconhecida/incompleta

Correto: permanece `Indeterminate`; não é convertida em negativa.

### História familiar positiva — SUS/BA-A

Correto: permanece `ClinicalReviewRequired`; nenhum algoritmo ACG é importado silenciosamente.

### História familiar positiva — Internacional

Correto: padrões estreitos previamente representados são delegados aos tracks familiares ACG; padrões complexos continuam em revisão.

## Ressalva arquitetural

As três regras-base usam `stance: recommend` apenas para atravessar a semântica atual da Foundation e permitir execução do resolver. Isso não representa, por si só, uma recomendação clínica genérica no track `family-status`.

A exceção é aceitável para o hotfix mínimo desde que:

1. permaneça documentada;
2. o scaffold continue sem ações e com outcome genérico `NotApplicable`;
3. futuras camadas de relatório/provenance não tratem `stance` isoladamente como recomendação clínica;
4. seja considerada futuramente uma semântica explícita `resolver-only/router` na Foundation para remover esse sentinel técnico.

## Estado de governança

Esta avaliação é preparatória e **não constitui revisão humana R1**.

As três regras permanecem `draft/source_verified` até decisão humana explícita. Após aprovação R1, uma etapa separada deverá registrar reviewer/data, promover apenas essas três regras para `reviewed_by_1` e executar novamente o gate completo antes do R2 independente.