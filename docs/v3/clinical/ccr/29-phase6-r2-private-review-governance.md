# 29 — Governança de R2 com identidade médica preservada

**Data:** 24/10/2026  
**Escopo:** piloto CCR / Fase 6  
**Candidato de entrada:** `crc-0.5.3-phase6-r1-reconfirmed-draft`

## Decisão de governança do responsável do projeto

O projeto adota, para esta revisão R2, um modelo de **revisor médico externo com identidade preservada no repositório público**.

A identidade civil, CRM, instituição, e-mail e outros identificadores pessoais do revisor R2:

- não são publicados no GitHub;
- não são persistidos no código clínico;
- não são exigidos como parte do artefato público de ruleset;
- não foram fornecidos ao assistente de software.

O responsável do projeto, Allan Ramos Costa, atesta sob sua governança que:

1. a revisão R2 foi realizada por uma pessoa médica real;
2. essa pessoa é distinta do revisor R1;
3. a revisão foi independente em relação à tradução clínica executável apresentada;
4. o revisor aprovou integralmente as 43 traduções do candidato `crc-0.5.3-phase6-r1-reconfirmed-draft`;
5. não foram comunicados conflitos de interesse relevantes que condicionassem a aprovação;
6. a aprovação R2 não autoriza, por si só, ativação, release público ou merge.

## Identificador público não pessoal

Para satisfazer a necessidade técnica de dois registros de revisão distintos sem expor identidade pessoal, o ruleset usa o handle público:

`external-physician-r2-private-001`

Esse valor é um **identificador de governança**, não nome, CRM, pseudônimo profissional nem mecanismo de verificação pública da identidade.

## Limitação de verificabilidade

Este modelo privilegia a privacidade do revisor. Como consequência, terceiros que consultem apenas o repositório público conseguem verificar:

- que existe um segundo registro de revisão distinto do R1;
- a data pública da revisão;
- o escopo declarado da revisão;
- o candidato exato que foi revisado;
- a atestação do responsável do projeto;
- que a promoção foi exclusivamente de governança e não alterou comportamento clínico.

Terceiros **não conseguem verificar de forma independente, apenas pelo repositório, a identidade ou o registro profissional do revisor R2**. Essa limitação deve permanecer explícita; o projeto não deve afirmar que o GitHub valida a identidade do segundo revisor.

Se uma futura exigência regulatória, institucional, editorial ou de release clínico demandar rastreabilidade nominal/privada mais forte, esse requisito deverá ser tratado em um gate posterior, sem reescrever retroativamente este registro.

## Estado após esta decisão

O novo snapshot de governança é:

`crc-0.5.4-phase6-r2-reviewed-draft`

Nele:

- 43/43 regras = `reviewed_by_2`;
- cada regra possui dois reviewer records distintos;
- R1 = Allan Ramos Costa;
- R2 público = `external-physician-r2-private-001`;
- 43/43 regras permanecem `lifecycleStatus=draft`;
- nenhuma regra é `active`;
- nenhuma autorização de release público é inferida;
- nenhuma autorização de merge é inferida.

## Próximo gate

A etapa seguinte é **activation/readiness**, não uma terceira revisão clínica automática. O projeto deve avaliar separadamente se o candidato R2-reviewed está pronto para ser promovido de `draft` para `active` em um contexto de release controlado. Essa decisão deve continuar separada de merge, disponibilização pública e uso clínico real.
