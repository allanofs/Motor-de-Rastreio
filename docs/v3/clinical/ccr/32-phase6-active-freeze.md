# 32 — Fase 6: freeze do conteúdo clínico ativo de CCR

**Data:** 24/10/2026  
**Branch:** `v3-ccr-rules-pilot`  
**PR:** #3 — Draft  
**Ruleset ativo:** `crc-0.5.5-phase6-active`

## Decisão de ativação

O responsável do projeto autorizou explicitamente a promoção do conteúdo clínico CCR após:

- especificação clínica consolidada;
- R1 humana;
- correções pré-R2 de provenance/evidência;
- reconfirmação R1;
- R2 médica independente sob governança de privacidade;
- gate de activation readiness.

As **43 regras** passam a:

- `reviewStatus = reviewed_by_2`;
- `lifecycleStatus = active`.

## O que mudou em 0.5.4 → 0.5.5

A promoção é **somente de lifecycle**.

Permitido:

- `rulesetVersion`;
- `lifecycleStatus: draft -> active`.

Não mudou:

- população/idade;
- intervalos;
- stance;
- computability;
- outcomes;
- actions;
- qualifying-event semantics;
- sourceRefs/evidence metadata;
- sources;
- policies;
- terminology;
- resolvers;
- reviewer records;
- guardrails;
- clinical decision support.

Esse invariante é protegido por `tests/ccr/activationPromotion.test.ts`.

## Significado de `active`

`active` significa apenas que o **conteúdo clínico executável** passou pelos gates internos de conteúdo e pode ser consumido pela camada de integração do produto.

`active` **não significa**:

- deploy público;
- autorização para uso clínico real;
- autorização para uso por pacientes;
- validação de usabilidade/interface;
- validação regulatória;
- monitoramento pós-implantação;
- merge da PR #3;
- release público.

Esses gates permanecem separados.

## Entrypoint canônico

Integrações devem consumir somente:

- `ccrCandidateRuleset`;
- `ccrCandidatePolicies`;
- `ccrCandidateResolvers`;
- `CCR_CANDIDATE_RULESET_VERSION`.

O entrypoint aponta agora para `crc-0.5.5-phase6-active`.

Snapshots anteriores (`0.5.0` a `0.5.4`) permanecem imutáveis para auditoria e regressão.

## Próxima etapa

**Fase 7 — integração de produto/piloto**, em branch separada.

Primeiro gate recomendado:

1. adaptador de produto sem duplicar lógica clínica;
2. policy selecionada explicitamente;
3. `asOf` explícito;
4. Care Setting separado do Patient;
5. safe failure preservado;
6. view-model derivado do `ConsultationPlan`, sem reinterpretar regras;
7. nenhum dado de paciente em URL, localStorage, sessionStorage, analytics ou logs;
8. testes end-to-end antes de qualquer release real.
