# 16 — Fase 6.1: contrato clínico executável CCR

**Data:** 24/10/2026. **Branch:** `v3-ccr-rules-pilot`. **PR:** #3 (Draft).

## Objetivo

Criar a primeira camada de conteúdo clínico real do CCR sobre a Foundation congelada, sem alterar `v3/src/engine/**` ou `v3/src/model/**`.

Esta subfase cria terminologia estável, fontes, ações, decision support, três policies e primeiras `RuleDefinition` de faixa etária/rotina. Ela **não** implementa ainda o resolver longitudinal definitivo, história familiar ACG, colonoscopia alternativa BA-A, seleção humana completa de estratégia Internacional ou os 60 goldens.

## Governança das rules

As proposições documentais da Fase 5 foram `reviewed_by_1`, mas a tradução TypeScript é um novo artefato. Portanto todas as rules reais desta subfase nascem:

- `lifecycleStatus: draft`;
- `reviewStatus: source_verified`;
- sem registro de revisor clínico no código;
- não publicáveis/não ativáveis até revisão explícita da tradução.

Os testes podem clonar essas rules em memória para `active/reviewed_by_1` usando um revisor fictício explicitamente marcado como **test-only/not a clinical review**. Isso prova semântica do contrato sem promover o conteúdo real.

## Estrutura adicionada

`v3/src/clinical/ccr/`:

- `terminology.ts` — IDs de tópico, tracks, modalidades, resultados, fatos e recursos;
- `sources.ts` — B12, S01, I01, I03, I04 e I05 com metadados tipados;
- `actions.ts` — ações reutilizáveis do piloto;
- `decisionSupport.ts` — considerações BA-A e USPSTF 76–85;
- `rules/routine.ts` — 12 rules draft de idade/rotina;
- `policies.ts` — SUS, BA-A e Internacional;
- `ruleset.ts` — `crc-0.1.0-phase6.1-draft`;
- `index.ts` — export interno do módulo (não exportado ainda pelo package root).

Teste:

- `v3/tests/ccr/contract.test.ts`.

## Fontes nucleares codificadas

| ID | Fonte | Uso nesta etapa |
|---|---|---|
| `crc-src-B12` | MS/SAES OCI Oncologia 2026 | SUS 50–75 e FIT bienal |
| `crc-src-S01` | SBOC 2026, Cólon doença localizada v6 FINAL | BA-A |
| `crc-src-I01` | USPSTF 2021 | governante populacional Internacional |
| `crc-src-I03` | ACG 2021 | reservado para história familiar da 6.4 |
| `crc-src-I04` | USMSTF FIT 2017 | reservado para FIT+ longitudinal |
| `crc-src-I05` | USMSTF pós-colonoscopia 2020 | reservado para colonoscopia normal high-quality |

`FINAL` continua descrevendo o documento-fonte, não a aprovação da interpretação executável.

## Rules iniciais

### SUS

- `<50`: fora da nova rotina populacional;
- `50–75`: FIT bienal, anchor apenas em FIT final negativo válido;
- `>=76`: fora da nova rotina populacional;
- follow-up diagnóstico aberto nunca é encerrado por essas rules de idade.

### Brasil ampliado BA-A

- `<45`: fora da rotina automática;
- `45–49`: `SharedDecision`;
- `50–75`: FIT bienal como default curado;
- `>=76`: `ClinicalReviewRequired`/individualização.

A colonoscopia primária alternativa de 10 anos ainda não entra nesta subfase para não fingir que a seleção humana de estratégia já está completa.

### Internacional

- `<45`: fora da rotina average-risk;
- `45–49`: recomendação populacional USPSTF Grade B;
- `50–75`: Grade A;
- `76–85`: `SharedDecision`, Grade C;
- `>=86`: rotina encerrada sem inventar Grade D.

As rules 45–75 são **population-governor drafts** e têm guardrail explícita proibindo promoção até que estratégia e cobertura atual sejam compostas na Fase 6.2.

## Limites deliberados antes de promoção

1. história familiar positiva/unknown ainda precisa da composição aprovada por policy;
2. FIT+ aberto ainda precisa do resolver longitudinal real;
3. colonoscopia alternativa BA-A e FIT/colonoscopia Internacional ainda precisam de seleção humana completa;
4. `Current` entre modalidades diferentes precisa ser ligado ao ruleset real, embora a representabilidade já tenha sido provada na 6.0a;
5. nenhuma rule desta etapa deve ser marcada `active` no repositório.

## Gate de saída 6.1

A subfase só passa se:

- `validateBundle` aceitar o ruleset draft;
- todas as rules reais permanecerem `draft/source_verified`;
- as três policies forem isoladas;
- source refs e grades USPSTF A/B/C forem preservados sem grade inventado >85;
- preview test-only reproduzir as fronteiras etárias aprovadas;
- `npm run check` ficar verde;
- V2 permanecer byte-for-byte idêntica;
- nenhum arquivo de `engine/**` ou `model/**` mudar.

## Resultado do gate

**PASSOU em 24/10/2026.** Commit funcional final da subfase: `052ee0549942c718a9a0e02256917a913d19bee4`.

CI `V3 foundation` da PR #3:

- `npm run typecheck`: verde;
- `npm run schema:check`: **62/62**;
- `npm test`: **274/274** em 10 arquivos de teste;
  - 242 testes preexistentes da Foundation;
  - 17 testes da Fase 6.0 de representabilidade;
  - 15 testes do contrato clínico da Fase 6.1;
- `npm run build`: verde;
- V2 preservada byte-for-byte: verde.

Nenhum arquivo em `v3/src/engine/**` ou `v3/src/model/**` foi alterado.

## Achados de implementação consolidados

1. **Conteúdo clínico pode existir em `src/clinical/**` sem contaminar a Foundation.** O teste arquitetural passou a exigir que `engine/**` e `model/**` não importem conteúdo clínico, em vez de proibir a existência de conteúdo clínico no repositório.
2. **Faixas fora da rotina usam `recommend_against` restrito à rotina populacional daquela policy**, com guardrail explícita de que isso não encerra follow-up diagnóstico. `no_formal_recommendation` é corretamente conservador na Foundation e levaria a `ClinicalReviewRequired`, não a `NotApplicable`.
3. **`NotApplicable` é estado de abstensão e não emite ação automática.** Por isso a interrupção da rotina após 85 anos é auditada por rule/stance/guardrail/trace, e não por uma ação automática `avoid` no plano.
4. As rules continuam `draft/source_verified`; o sucesso do CI **não constitui revisão clínica da tradução TypeScript**.

## Conclusão

A Fase 6.1 estabelece um contrato clínico executável mínimo e válido sobre a Foundation congelada. O conteúdo ainda não está pronto para release, mas a estrutura de terminologia, fontes, actions, decision support, policies e regras etárias/rotineiras está tipada, auditável e testada sem alteração do engine/schema.

A próxima etapa é **6.2 — estratégias executáveis e cobertura atual**, incluindo seleção humana FIT↔colonoscopia, preservação de cobertura entre modalidades e composição necessária antes de qualquer promoção clínica das rules.
