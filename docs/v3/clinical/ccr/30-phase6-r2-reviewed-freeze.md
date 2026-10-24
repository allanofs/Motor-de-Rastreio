# 30 — Freeze R2-reviewed do piloto CCR

**Data:** 24/10/2026  
**Branch:** `v3-ccr-rules-pilot`  
**PR:** #3 — Draft  
**Snapshot:** `crc-0.5.4-phase6-r2-reviewed-draft`

## Estado congelado

A segunda revisão médica foi registrada sob o modelo de identidade preservada definido em `29-phase6-r2-private-review-governance.md`.

- 43/43 regras: `reviewed_by_2`;
- 43/43 regras: `lifecycleStatus=draft`;
- R1 público: Allan Ramos Costa;
- R2 público: `external-physician-r2-private-001`;
- dois registros de revisão distintos por regra;
- nenhuma regra `active`;
- nenhum release público;
- nenhum merge autorizado.

A identidade civil/profissional do revisor R2 não é armazenada no repositório nem fornecida ao assistente. O responsável do projeto atesta que o handle público corresponde a médico real, distinto do R1, que aprovou integralmente as 43 traduções executáveis.

## Invariante da promoção R2

A passagem:

`crc-0.5.3-phase6-r1-reconfirmed-draft`

→

`crc-0.5.4-phase6-r2-reviewed-draft`

pode alterar apenas:

- `rulesetVersion`;
- `reviewStatus`: `reviewed_by_1` → `reviewed_by_2`;
- adição do segundo reviewer record em `governance.reviews`.

Não pode alterar:

- população;
- critérios/exclusões;
- stance;
- computability;
- outcome;
- ações;
- schedules;
- qualifying events;
- decision support;
- guardrails;
- sourceRefs;
- sources;
- policies;
- terminology;
- resolvers.

Esse invariante é protegido por `tests/ccr/r2Promotion.test.ts`.

## Gate técnico pós-R2

Workflow do HEAD R2-reviewed:

- typecheck: ✅
- schema checks: ✅ 62/62
- suíte total: ✅ **431/431**
- arquivos de teste: ✅ **24/24**
- `r2Promotion.test.ts`: ✅ 3/3
- `r2Gate.test.ts`: ✅ 3/3
- build: ✅
- V2 byte-for-byte: ✅

A Foundation permanece sem alterações específicas para CCR em `v3/src/engine/**` e `v3/src/model/**`.

## Limitação pública deliberada

O repositório prova que há um segundo reviewer record distinto, o candidato revisado e a data. Ele não prova publicamente a identidade ou o registro profissional do R2. Essa limitação é uma decisão explícita de privacidade e deve permanecer transparente.

## Próximo gate

A R2 encerra o gate de revisão clínica da tradução, mas **não ativa regras**.

Próxima etapa: `activation/readiness`.

Esse gate deve responder separadamente:

1. o conteúdo R2-reviewed está tecnicamente apto a ser promovido a `active`?
2. quais condições de integração/produto ainda precisam existir antes de qualquer uso clínico real ou release público?
3. quais invariantes devem impedir que `active` seja confundido com deploy, release ou merge?

Até decisão explícita posterior, `crc-0.5.4-phase6-r2-reviewed-draft` permanece draft.