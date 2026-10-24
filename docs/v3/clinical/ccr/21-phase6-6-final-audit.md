# 21 — Fase 6.6: auditoria final de trace, governança e readiness do piloto CCR

**Data:** 24/10/2026  
**Branch:** `v3-ccr-rules-pilot`  
**PR:** #3 — deve permanecer **Draft**  
**Candidato auditado:** `crc-0.5.0-phase6.5-draft`

## 1. Objetivo da Fase 6.6

Fechar a Fase 6 sem adicionar nova medicina. A auditoria verifica a cadeia:

`proposição clínica aprovada -> regra/resolver -> policy -> fonte -> ação/estado -> trace -> golden/teste`

Esta fase **não** promove automaticamente regra alguma para `reviewed_by_1`, não muda `v3/src/engine/**`, não muda `v3/src/model/**`, não inicia nova doença, não cria UI e não faz merge.

## 2. Veredicto executivo

**READINESS TÉCNICO: APROVADO PARA FREEZE E REVISÃO HUMANA DE TRADUÇÃO.**

**ATIVAÇÃO CLÍNICA: AINDA NÃO AUTORIZADA.**

Motivo: a especificação clínica já recebeu primeira revisão humana na Fase 5, mas o código traduzido continua corretamente em `draft/source_verified`, sem `governance.reviews`. A próxima promoção de lifecycle/review status deve ocorrer apenas depois de revisão humana explícita da tradução código <- especificação.

Não foi identificado bloqueio arquitetural da Foundation. O gate técnico da antiga OQ-CCR-023 está cumprido.

## 3. Inventário do bundle executável

O ruleset 6.5 contém **43 regras clínicas draft** distribuídas de forma exclusiva entre as três policies:

| Policy | Regras | Fontes permitidas |
|---|---:|---|
| SUS / Brasil oficial | 10 | B12 |
| Brasil ampliado BA-A | 13 | B12, S01 |
| Internacional USPSTF | 20 | I01, I03, I04, I05 |
| **Total** | **43** | **6 fontes registradas no bundle** |

Componentes adicionais:

- 8 actions CCR registradas;
- 7 decision-support considerations;
- 9 tracks CCR, incluindo `crc-special-risk-status`;
- resolvers especializados para cobertura de estratégia, episódios FIT+, pós-FIT e história familiar;
- 3 policies independentes;
- nenhuma regra compartilhada simultaneamente por duas policies no ruleset candidato.

## 4. Auditoria de fontes

### B12 — Ministério da Saúde / SAES 2026

Fonte operacional final publicada em 27/08/2026. Sustenta o núcleo SUS usado pelo piloto: população de 50–75 anos, FIT como triagem e colonoscopia após teste positivo. Comunicações oficiais MS/INCA de 2026 corroboram FIT bienal e implantação gradual.

**Uso no código:** somente SUS e, quando deliberadamente brasileiro, BA-A.

**Limite preservado:** B12 não é tratado como substituto de uma futura diretriz clínica brasileira final pós-consulta para definir o relógio de rotina após FIT+ -> colonoscopia normal. Por isso o piloto continua abstendo nesse ponto.

### S01 — SBOC 2026 final

Documento final `Cólon: doença localizada`, publicado em 18/05/2026. A auditoria visual das páginas de prevenção/rastreamento confirmou:

- sangue oculto nas fezes como método recomendado;
- intervalo de 1–2 anos para sangue oculto;
- colonoscopia completa como método de screening;
- 10 anos após colonoscopia negativa;
- faixa habitual 50–75;
- individualização 75–85;
- fatores de risco especiais exigindo diretrizes específicas.

**Uso no código:** BA-A. O intervalo FIT de 2 anos é uma curadoria explicitamente aprovada do projeto dentro da faixa 1–2 anos da fonte, e não é apresentado como texto literal da SBOC.

### I01 — USPSTF 2021

Recomendação final continua governando a policy Internacional:

- 45–49: Grade B;
- 50–75: Grade A;
- 76–85: Grade C seletivo;
- >85: interrupção do screening habitual sem inventar Grade D;
- FIT anual e colonoscopia a cada 10 anos estão entre as estratégias aceitas;
- recomendação se aplica a average-risk, excluindo CRC prévio, adenomas, DII e síndromes genéticas de alto risco.

### I03 — ACG 2021

Mantido somente como suplemento de história familiar na policy Internacional. A fonte oficial confirma:

- 1 FDR <60 ou >=2 FDR: colonoscopia, início aos 40 e repetição q5;
- 1 FDR >=60: início aos 40 e depois modalidade/intervalos average-risk;
- 1 SDR isolado: average-risk.

A implementação permanece mais conservadora quando dados familiares são incompletos/complexos.

### I04 — USMSTF FIT 2017

Mantido somente na policy Internacional. Confirma que FIT positivo deve ser seguido por colonoscopia e não por repetição de FIT.

### I05 — USMSTF colonoscopia 2020

Mantido somente na policy Internacional. Confirma 10 anos após colonoscopia normal high-quality em average-risk e explicita que a recomendação não se aplica automaticamente às populações de maior risco listadas.

### Fontes deliberadamente ausentes do bundle executável

- ACS 2026;
- novos testes sanguíneos/RNA/CTC;
- regras completas de surveillance pós-polipectomia;
- I06/USMSTF 2025 como hard deadline.

Esses itens permanecem documentais/fora de escopo e não vazam para as policies executáveis.

## 5. Auditoria das 45 proposições da Fase 5

Legenda de implementação:

- `RULE`: regra declarativa no ruleset;
- `RESOLVER`: lógica longitudinal/especializada no DomainResolver;
- `CONTRACT`: modelagem/qualifier/action/guardrail/test sem regra clínica isolada;
- `ABSTENTION`: comportamento deliberado de não automatizar;
- `DOC_ONLY`: não deve existir como regra;
- `TECH_GATE`: propriedade técnica da Fase 6.

| Prop | Status R1 | Tradução executável / verificação | Resultado 6.6 |
|---|---|---|---|
| 001 | MODIFIED | SUS routine + gate de screening context + hard exclusions | PASS |
| 002 | R1 | ação FIT SUS; Care Setting não cria fallback clínico | PASS |
| 003 | MODIFIED | FIT qualifier + q2 + data do evento como anchor | PASS |
| 004 | R1 | `crc.sus.routine.under-50` / início aos 50 | PASS |
| 005 | MODIFIED | `crc.sus.routine.76-plus`; follow-up separado | PASS |
| 006 | MODIFIED | resultado categórico final/pending/invalid; sem threshold bruto | PASS |
| 007 | DOC_ONLY | nenhum threshold bruto executável | PASS |
| 008 | R1 | FIT+ resolver + diagnostic colonoscopy action; sem deadline | PASS |
| 009 | MODIFIED | resolução FIT+ high-quality + `postFitRoutineResolver` brasileiro abstém relógio futuro | PASS |
| 010 | REPLACED | gate profissional de contexto; nenhum checklist de sintomas | PASS |
| 011 | R1 | special-risk CRC prévio -> ClinicalReviewRequired; HandedOff separado | PASS após correção 6.5 |
| 012 | R1 | special-risk surveillance/pólipo + follow-up specialized | PASS após correção 6.5 |
| 013 | R1 | special-risk DII -> ClinicalReviewRequired | PASS após correção 6.5 |
| 014 | R1 | special-risk síndrome hereditária -> ClinicalReviewRequired | PASS após correção 6.5 |
| 015 | MODIFIED | family profile `unknown`; population indication pode persistir e estratégia ser retida | PASS |
| 016 | MODIFIED | FIT negative qualifier + open-FIT gate + evento como anchor | PASS |
| 017 | R1 | FIT+ track independe do teto etário de rotina | PASS |
| 018 | R1 | episódio FIT+ não é resolvido por FIT- posterior | PASS |
| 019 | R1 | pending -> PendingResult; não ancora | PASS |
| 020 | R1 | invalid/inconclusive -> não anchor; histórico válido anterior preservado | PASS |
| 021 | R1 | colonoscopia incompleta/inadequada/insuficiente não resolve FIT+ | PASS |
| 022 | R1 | achado não normal pós-FIT -> ClinicalReviewRequired; HandedOff exige fato separado | PASS |
| 023 | R1 | Internacional 50–75 Grade A + estratégia humana | PASS |
| 024 | R1 | Internacional 45–49 Grade B | PASS |
| 025 | R1 | 76–85 SharedDecision Grade C; sem Due automático por ausência de histórico | PASS |
| 026 | R1 | >85 NotApplicable para rotina; FIT+ aberto continua em track separado | PASS |
| 027 | MODIFIED | FIT Internacional q1 com qualifier válido | PASS |
| 028 | MODIFIED | colonoscopia screening q10; exclusividade por estratégia/cobertura | PASS |
| 029 | R1 | post-FIT normal high-quality Internacional -> q10 | PASS |
| 030 | R1 | colonoscopia anterior não resolve FIT+ posterior | PASS |
| 031 | MODIFIED | ACG high-risk resolver + q5 colonoscopy | PASS |
| 032 | MODIFIED | one-FDR-60-plus -> início aos 40 e depois estratégias average-risk | PASS |
| 033 | MODIFIED | one-SDR-only -> retorno ao average-risk | PASS |
| 034 | R1 | BA-A colonoscopia primária q10 | PASS |
| 035 | MODIFIED | BA-A FIT selecionado q2 | PASS |
| 036 | R1 | BA-A 45–49 SharedDecision | PASS |
| 037 | DOC_ONLY | ACS não integra `ccrSources`/policies | PASS |
| 038 | R1 | surveillance fora do piloto -> review; não há algoritmo pós-polipectomia | PASS |
| 039 | MODIFIED | preparo inadequado não fecha episódio; nenhum hard deadline | PASS |
| 040 | DOC_ONLY | radioterapia ACS não integra gate executável | PASS |
| 041 | DOC_ONLY | instrução de kit não é regra clínica central | PASS |
| 042 | MODIFIED | completude/preparo/resultado/resolutionInformation governam qualificação; PDF não exigido | PASS |
| 043 | R1 | Care Setting muda rota operacional; indicação FIT permanece | PASS |
| 044 | R1 | FIT+ + colonoscopia indisponível -> InFollowUp/referral; sem repetir FIT | PASS |
| 045 | TECH_GATE | follow-up aberto suprime screening redundante sem alterar Foundation | **PASS / GATE CUMPRIDO** |

### Resultado da matriz

- 39 proposições clínicas R1/R1-modified: **39 traduzidas de forma representável dentro do escopo aprovado**;
- 4 documentais: **0 vazamento intencional para o bundle executável**;
- 1 proposição rejeitada/substituída: **substituição implementada**;
- 1 gate técnico: **cumprido**.

## 6. Auditoria de policy isolation

A Fase 6.6 adiciona um allowlist explícito testável:

```text
SUS  -> B12
BA-A -> B12 + S01
INTL -> I01 + I03 + I04 + I05
```

Cada uma das 43 regras deve pertencer a **exatamente uma** policy 6.5. O prefixo da rule (`crc.sus.`, `crc.ba-a.`, `crc.intl.`) deve coincidir com a policy proprietária. Rule IDs, source IDs e action IDs devem ser únicos.

Isso transforma isolamento de fonte/policy em invariante executável, não apenas documentação.

## 7. Auditoria de trace e evidência

Já demonstrado pelas suítes 6.3–6.5 e reforçado na 6.6:

- `policyId`, `rulesetVersion` e `asOf` são preservados;
- `recordsUsed` pertencem a `recordsConsidered` nos cenários auditados;
- source IDs são resolvíveis no bundle;
- locators não podem ser vazios;
- Grades USPSTF só aparecem quando explicitamente codificados e verificados;
- >85 não recebe Grade D inventada;
- ACG não aparece em SUS/BA-A;
- Care Setting não altera evidência científica;
- hard exclusions são review explícito, não handoff presumido.

## 8. Auditoria arquitetural

Comparação da base da PR (`f2a61bb7d8392598ccd3d37859f049c43dcb0d12`) com a Fase 6 mostra que todo código novo clínico está em `v3/src/clinical/ccr/**` e testes/docs associados.

**Nenhum arquivo em `v3/src/engine/**` foi modificado.**  
**Nenhum arquivo em `v3/src/model/**` foi modificado.**

`v3/tests/architecture.test.ts` recebeu somente reforço de teste; isso não altera a Foundation runtime/schema.

Conclusão: FG01–FG04 não exigiram alteração arquitetural para o piloto CCR.

## 9. Questões ainda abertas após a Fase 6

### Não bloqueiam o freeze técnico

- **OQ-001 / SA-BR-FINAL:** texto clínico brasileiro final pós-CP para agenda depois de FIT+ -> colonoscopia normal. O piloto já abstém, portanto não inventa regra.
- **OQ-006:** metadado/grade de threshold bruto; threshold não é automatizado.
- **OQ-008:** parte brasileira do relógio pós-FIT normal continua deliberadamente não automatizada.
- **OQ-020 / I06:** prazo específico após preparo inadequado não é hardcoded.
- **OQ-022:** rota operacional local/geografia permanece separada da recomendação.
- **OQ-002:** detalhe administrativo/código não governa a clínica do piloto.

### Resolvida pela Fase 6

- **OQ-023:** coordenação routine/follow-up/history foi demonstrada sem mudança da Foundation.

## 10. Readiness por camada

| Camada | Estado |
|---|---|
| Especificação clínica R1 | ✅ aprovada |
| Representabilidade Foundation | ✅ aprovada |
| Contrato/routine | ✅ |
| Estratégias | ✅ |
| FIT+ longitudinal | ✅ |
| História familiar | ✅ |
| Hard exclusions | ✅ corrigidos e testados |
| Golden/adversarial | ✅ |
| Policy isolation | ✅ |
| Source/locator integrity | ✅ |
| Trace invariants | ✅ |
| Typecheck/schema/build/CI | ✅ após gate verde |
| Primeira revisão humana **do código traduzido** | ⏳ pendente explícita |
| Segunda revisão médica independente | ⏳ obrigatória antes de release público |
| Release clínico público | ❌ não autorizado nesta fase |

## 11. Recomendação de governança

As **43 regras** podem ser apresentadas ao autor/revisor humano como **um candidato coerente para primeira revisão de tradução**, porque:

1. derivam apenas de proposições R1/R1-modified ou de abstensões necessárias para mantê-las seguras;
2. têm source refs resolvíveis;
3. respeitam policy isolation;
4. passaram golden/adversarial coverage;
5. não exigiram mudança da Foundation.

Porém, a Fase 6.6 **não deve auto-promovê-las**. O status correto ao final desta execução continua:

```text
lifecycleStatus = draft
reviewStatus = source_verified
governance.reviews = []
```

A promoção para `reviewed_by_1` deve ser um ato explícito de revisão humana do código/tradução, registrando reviewer e data. Isso preserva a distinção entre:

- aprovação da **decisão clínica** na Fase 5; e
- aprovação de que a **implementação executável representa corretamente essa decisão**.

## 12. Freeze recomendado

Ao final da Fase 6.6, se CI permanecer verde:

- congelar `crc-0.5.0-phase6.5-draft` como **candidate-for-R1-code-review**;
- não adicionar novas regras clínicas no mesmo ciclo;
- manter PR #3 Draft;
- não mergear;
- não promover lifecycle/review status automaticamente;
- qualquer mudança clínica futura deve reabrir especificação + golden correspondente.

## 13. Próxima ação humana

A próxima ação adequada não é “Fase 6.7 com mais código”. É uma **revisão humana de tradução clínica** do candidato, usando este relatório como checklist.

Após aprovação explícita do autor/revisor:

1. registrar `reviewed_by_1` nas regras aprovadas;
2. rodar toda a suíte novamente;
3. gerar snapshot/freeze final da Fase 6;
4. somente depois planejar UI/piloto ou segunda revisão médica independente.
