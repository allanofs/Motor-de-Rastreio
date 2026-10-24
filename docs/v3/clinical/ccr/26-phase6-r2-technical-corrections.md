# 26 — Correções técnicas pré-R2 do candidato CCR

**Data:** 24/10/2026  
**Branch:** `v3-ccr-rules-pilot`  
**PR:** #3 — Draft  
**Candidato anterior:** `crc-0.5.1-phase6-r1-draft`  
**Novo candidato canônico:** `crc-0.5.2-phase6-r2-prep-draft`

## Objetivo

Resolver os dois findings da auditoria independente pré-R2 sem alterar comportamento clínico:

1. R2-01 — Grade USPSTF estava granular demais nas regras específicas de FIT/colonoscopia;
2. R2-02 — `crc-src-B12` estava com proveniência/versionamento incorretos para sustentar o núcleo de rastreamento SUS.

## R2-01 resolvido tecnicamente

Nas quatro regras de estratégia Internacional:

- `crc.intl.strategy.fit.45-49-grade-b`;
- `crc.intl.strategy.fit.50-75-grade-a`;
- `crc.intl.strategy.colonoscopy.45-49-grade-b`;
- `crc.intl.strategy.colonoscopy.50-75-grade-a`;

foram removidos do `sourceRef` de modalidade:

- `recommendationStrength`;
- `rawGrade`;
- `gradeVerified=true`.

A referência USPSTF e os intervalos permanecem. Grade A/B/C continua explicitamente registrada nas regras populacionais apropriadas, onde a USPSTF efetivamente gradua a decisão de rastrear por faixa etária.

Nenhuma ação, intervalo, faixa etária, resolver ou policy mudou.

## R2-02 resolvido tecnicamente

### B12 reconciliada

`crc-src-B12` passa a ser representada no candidato corrigido como o documento que realmente é:

- **Protocolo de Acesso às Ofertas de Cuidados Integrados na Atenção Especializada em Oncologia**;
- Ministério da Saúde / SAES;
- **2ª edição — 2025**;
- documento diagnóstico/especializado, não fonte normativa principal do rastreamento populacional 2026.

O snapshot R1 anterior permanece intacto no histórico/export correspondente.

### B13 adicionada — fonte normativa SUS 2026

Nova fonte:

`crc-src-B13` — **Portaria SAES/MS nº 5.215, de 22 de outubro de 2026**.

DOU 23/10/2026, Seção 1, edição 201, pp. 73–74.

O Anexo I define explicitamente:

- procedimento FIT de rastreamento;
- homens e mulheres assintomáticos;
- 50 a 75 anos;
- rastreamento bienal;
- separação explícita entre o FIT de screening e a pesquisa de sangue oculto usada para investigação diagnóstica.

As três regras SUS de idade/rotina passam a citar B13:

- `<50` fora da nova rotina FIT;
- `50–75` FIT q2;
- `>=76` fora da nova rotina FIT.

### B14 adicionada — fonte INCA para risco especial

Nova fonte:

`crc-src-B14` — **INCA, Câncer de intestino — versão para profissionais de saúde**.

Usada para o roteamento conservador de:

- história familiar relevante;
- história pessoal de CCR;
- DII colônica;
- síndromes hereditárias.

Para história relevante de pólipo/surveillance, B14 é combinada com a B12 reconciliada para deixar explícito que o piloto não devolve silenciosamente esse contexto à rotina average-risk.

## Regras que precisam de reconfirmação R1

Como fonte/metadado de evidência mudou depois da revisão registrada, **15 regras** foram deliberadamente resetadas para:

```text
reviewStatus = source_verified
governance.reviews = []
lifecycleStatus = draft
```

São:

- 10 regras SUS;
- `crc.ba-a.fit-positive.followup` (B12 teve metadado de documento corrigido);
- 4 regras de estratégia Internacional afetadas por R2-01.

As outras **28 regras** permanecem `reviewed_by_1`.

Isso impede que uma aprovação R1 antiga seja herdada automaticamente por evidência alterada.

## Prova de ausência de clinical diff

`r2Corrections.test.ts` compara as 43 regras antes/depois removendo apenas:

- `sourceRefs`;
- `reviewStatus`;
- lista de `governance.reviews`.

Todos os demais campos clínicos devem ser estruturalmente idênticos.

Também testa:

- Grade USPSTF apenas no layer populacional;
- B12 = edição 2025 no candidato corrigido;
- B13 = Portaria 5.215/2026;
- B13 nas regras SUS de idade/FIT q2;
- B14 no roteamento de risco/família;
- allowlists de fontes por policy;
- inexistência de `reviewed_by_2`/`active` acidental.

## Gate técnico

Workflow do commit `b69472703c84d5f8839cc75287786415551e44d8`:

- typecheck: ✅
- schema checks: ✅ **62/62**
- testes totais: ✅ **424/424**
- arquivos de teste: ✅ **22/22**
- `r2Corrections.test.ts`: ✅ **7/7**
- build: ✅
- V2 byte-for-byte: ✅

## Estado de governança após a correção

```text
Novo candidato                 crc-0.5.2-phase6-r2-prep-draft
Regras totais                  43
reviewed_by_1 preservadas      28
source_verified (reconfirmar)  15
reviewed_by_2                  0
active                         0
PR #3                          Draft / não mergeada
```

## Próximo gate

1. revisor R1 reconfirma especificamente as 15 mudanças de evidência/proveniência;
2. registrar nova versão com as 43 regras novamente em `reviewed_by_1`;
3. rodar suíte completa;
4. só então entregar o pacote R2 ao segundo médico independente;
5. após resposta explícita desse médico, registrar ou não `reviewed_by_2` conforme o conteúdo real da revisão.
