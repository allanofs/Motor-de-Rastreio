# Mama — M1 gate

Status: **aprovada pelo responsável do projeto em 2026-10-26; base congelada para M2**.

## Gate humano anterior

A M0 — escopo, referenciais e Depth Budget — foi explicitamente aprovada pelo responsável do projeto em 2026-10-26.

## Entregas M1

Código de representabilidade, sem regras executáveis:

- `v3/src/clinical/mama/terminology.ts`
- `v3/src/clinical/mama/domain.ts`
- `v3/src/clinical/mama/index.ts`

Documentação:

- `03-phase-m1-domain-model.md`
- `04-phase-m1-temporal-contract.md`
- `05-phase-m1-representability-matrix.md`

Teste:

- `v3/tests/mama/domainModel.test.ts`

## Decisões congeladas no candidato M1

- Mama V1 permanece focada em rastreamento de rotina e saída segura da rotina.
- Mamografia de rastreamento é a única modalidade de rotina V1.
- Mamografia diagnóstica é representada apenas para não ser confundida com rastreamento.
- DBT não é estratégia separada V1.
- Não existem tracks de BI-RADS, US, RM, biópsia, histologia ou tratamento.
- Anatomia relevante é conceito explícito; a modelagem não infere anatomia a partir de gênero.
- `never_performed` e `unknown` permanecem semanticamente distintos.
- Achado anterior que exige atenção impede retorno silencioso à rotina.
- Intervalos permanecem responsabilidade futura das policies; M1 não codifica anual/bienal.
- Care setting de V1 contém apenas recurso de mamografia.

## Gate automatizado

Head funcional validado antes da aprovação humana: `a964978454949c52f57c6b21cbe92e97bfbfa882`.

- schema checks: **62/62**;
- test files: **44/44**;
- tests: **587/587**;
- Mama M1 domain representability: **6/6**;
- Foundation typecheck: passou;
- CCR pilot typecheck: passou;
- Foundation build: passou;
- CCR pilot build: passou;
- V2 byte-for-byte: preservada.

## O que a aprovação M1 não autoriza

- nenhuma regra de idade;
- nenhum intervalo de rastreamento;
- nenhuma policy ativa;
- nenhuma action clínica;
- nenhuma tradução executável de guideline;
- nenhuma UI de Mama;
- nenhum merge/deploy/uso clínico real.

## Gate humano registrado

Em 2026-10-26, o responsável do projeto aprovou explicitamente:

> “Aprovo a M1 de Mama — vocabulário, tracks, hard exits e contrato temporal mínimo.”

A M2 pode, portanto, estruturar fontes, proposições e locators, mas continua proibida de criar regras executáveis antes de novo gate humano.
