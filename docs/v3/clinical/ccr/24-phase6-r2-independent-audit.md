# 24 — Auditoria independente pré-R2 da tradução executável CCR

**Data:** 24/10/2026  
**Branch:** `v3-ccr-rules-pilot`  
**PR:** #3 — Draft  
**Candidato auditado:** `crc-0.5.1-phase6-r1-draft`

Esta auditoria não conta como segunda revisão médica humana e não autoriza `reviewed_by_2`.

## Findings

### R2-01 — USPSTF

As regras específicas de FIT/colonoscopia Internacional replicam Grade A/B no `sourceRef` da modalidade. A USPSTF gradua a recomendação populacional de rastrear por faixa etária, não cada modalidade isoladamente.

**Corrigir:** manter A/B nas regras populacionais e remover o Grade das quatro rules específicas de modalidade, sem mudar ações, intervalos ou resolvers.

### R2-02 — SUS

`crc-src-B12` representa o **Protocolo de Acesso às OCI em Oncologia, 2ª edição 2025**, de natureza diagnóstica. A landing page republicada em 2026 não o torna uma diretriz de rastreamento 2026.

A fonte normativa apropriada para a rotina é a **Portaria SAES/MS nº 5.215, de 22/10/2026**, publicada no DOU de 23/10/2026. Ela cria o procedimento `02.14.01.032-5` para FIT de rastreamento do CCR e define explicitamente população assintomática de 50–75 anos, periodicidade bienal e separação do uso diagnóstico; também torna sem efeito a Portaria 4.642/2026.

**Corrigir:** adicionar a Portaria 5.215 como fonte SUS de rastreamento; migrar os sourceRefs de idade/FIT/periodicidade; corrigir B12 para sua edição real e restringi-lo ao conteúdo diagnóstico que realmente sustenta; revalidar os locators SUS de história familiar/hard exclusions.

## Não-blockers

- BA-A 45–49 `SharedDecision`: curadoria explícita.
- BA-A FIT q2: escolha curatorial dentro do intervalo SBOC 1–2 anos.
- `recommend_against` fora da rotina: semântica interna; não deve ser exibida como contraindicação diagnóstica absoluta.

## Gate técnico

Commit `4002daaa172272fef088e5a0ede55eb00ce0c6a0`, workflow `40120075597`: success.

- 417/417 testes;
- 21/21 arquivos de teste;
- `r2Gate.test.ts` 3/3;
- 62/62 schema checks;
- typecheck/build ✅;
- V2 byte-for-byte ✅.

## Estado

```text
R1                               ✅ reviewed_by_1
Pré-auditoria R2                 ✅
R2-01                            ⛔ correção pendente
R2-02                            🟡 fonte correta identificada; migração pendente
Segundo médico humano            ⏳
reviewed_by_2                    ❌
active                           ❌
release                          ❌
merge                            ❌
```

## Sequência obrigatória

1. aplicar R2-01/R2-02 em novo candidato ainda R1;
2. reauditar sourceRefs SUS e rerodar a suíte;
3. reconfirmar R1 das mudanças;
4. entregar a versão corrigida ao segundo médico usando `25-phase6-r2-review-form.md`;
5. somente após aprovação explícita de uma pessoa distinta registrar `reviewed_by_2`.

**Este documento é preparação para R2, não assinatura de segundo revisor.**