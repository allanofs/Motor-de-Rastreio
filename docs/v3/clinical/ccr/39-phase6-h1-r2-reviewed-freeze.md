# 39 — Fase 6.H1: freeze R2-reviewed do hotfix `family-status`

**Data:** 25/10/2026  
**Branch:** `v3-ccr-family-status-hotfix`  
**PR:** #6 — Draft  
**Snapshot:** `crc-0.5.8-phase6-h1-r2-reviewed-draft`

## Decisão registrada

O mesmo médico externo independente utilizado na revisão R2 anterior do piloto CCR realizou a segunda revisão do hotfix H1 e comunicou **APROVAÇÃO INTEGRAL** das três traduções corrigidas:

- `crc.sus.family-status`
- `crc.ba-a.family-status`
- `crc.intl.family-status`

A identidade civil/profissional permanece preservada no repositório público. O identificador de governança continua:

`external-physician-r2-private-001`

O responsável do projeto atesta que o revisor é pessoa médica real e distinta do R1.

## Promoção de governança

Somente as três regras alteradas recebem nesta etapa:

- `reviewStatus: reviewed_by_2`;
- segundo reviewer record com o handle público do R2;
- `lifecycleStatus: draft` preservado.

Nenhum campo clínico, fonte, locator, policy, resolver, terminologia, engine ou model é alterado pela promoção R1 → R2.

As outras 40 regras são preservadas exatamente como estavam no snapshot de entrada do H1, já `reviewed_by_2` e `active` no snapshot canônico anterior.

## Semântica clínica aprovada

R2 confirmou integralmente que:

- história familiar negativa conhecida não produz `ClinicalReviewRequired` por si só;
- `unknown` permanece diferente de `no`;
- história positiva em SUS/BA-A continua exigindo revisão clínica e não importa ACG;
- Internacional delega apenas padrões ACG estreitos já governados;
- padrões incompletos/complexos permanecem em indeterminação ou revisão;
- estratégia e disponibilidade operacional não foram alteradas.

## Ressalva arquitetural aceita

O uso de `stance: recommend` nas três regras-base é aceito como sentinel técnico temporário para permitir execução do resolver. Isso não equivale a recomendação clínica por si só porque:

- `actions: []`;
- outcome genérico `NotApplicable`;
- o estado final deriva do resolver governado.

UI, auditoria e futuro relatório não podem inferir recomendação apenas a partir de `stance`.

## O que R2 NÃO autoriza

`reviewed_by_2` não significa automaticamente:

- `active`;
- merge;
- deploy;
- publicação;
- uso clínico real;
- fechamento da Fase 7.5.

O próximo gate é `activation/readiness` específico do hotfix.
