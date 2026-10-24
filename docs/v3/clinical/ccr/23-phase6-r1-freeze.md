# 23 — Freeze da Fase 6 após primeira revisão humana da tradução executável

**Data:** 24/10/2026  
**Branch:** `v3-ccr-rules-pilot`  
**PR:** #3 — permanece **Draft**  
**Snapshot clínico pré-revisão preservado:** `crc-0.5.0-phase6.5-draft`  
**Candidato canônico após R1:** `crc-0.5.1-phase6-r1-draft`

## 1. Decisão registrada

Após a auditoria final 6.6 e o pacote de revisão `22-phase6-r1-code-review-packet.md`, o autor/revisor humano autorizou prosseguir para o próximo passo e registrar a primeira revisão da tradução executável.

Revisor registrado nas 43 regras:

`Allan Ramos Costa`

Data de revisão:

`2026-10-24`

Escopo da revisão:

> a implementação executável CCR representa corretamente, em primeira revisão, a especificação clínica R1 aprovada na Fase 5 e auditada na Fase 6.

A revisão **não** autoriza release público e **não** substitui a segunda revisão médica independente.

## 2. Estratégia de versionamento

A revisão humana não alterou comportamento clínico. Por isso foi criada uma versão patch de governança:

```text
crc-0.5.0-phase6.5-draft
        ↓ revisão humana da tradução; sem clinical diff
crc-0.5.1-phase6-r1-draft
```

O snapshot 0.5.0 permanece imutável como evidência do candidato auditado antes da revisão.

## 3. Estado das 43 regras após R1

Todas as 43 regras do candidato canônico possuem:

```text
lifecycleStatus = draft
reviewStatus = reviewed_by_1
governance.reviews = [
  {
    reviewer: "Allan Ramos Costa",
    reviewedAt: 2026-10-24
  }
]
```

Distribuição preservada:

| Policy | Regras |
|---|---:|
| SUS / Brasil oficial | 10 |
| Brasil ampliado BA-A | 13 |
| Internacional USPSTF | 20 |
| **Total** | **43** |

Nenhuma regra foi promovida a `active`. Nenhuma regra recebeu `reviewed_by_2`.

## 4. Implementação de governança

Foi adicionado `reviewedCandidate.ts`, que transforma o snapshot auditado 6.5 exclusivamente em metadados de primeira revisão e cria:

- `ccrPhase6R1Rules`;
- `ccrPhase6R1Ruleset`;
- `ccrPhase6R1Policies`;
- `ccrPhase6R1Resolvers`;
- `CCR_R1_REVIEWER`;
- `CCR_R1_REVIEWED_AT`;
- `CCR_R1_RULESET_VERSION`.

O entrypoint canônico do produto passa a apontar para essa versão:

- `ccrCandidateRuleset`;
- `ccrCandidatePolicies`;
- `ccrCandidateResolvers`.

Snapshots 6.1–6.5 continuam exportáveis para regressão/auditoria histórica, mas integração de produto deve usar o entrypoint canônico.

## 5. Prova de ausência de clinical diff

`reviewedCandidate.test.ts` verifica que:

1. existem exatamente 43 regras R1;
2. todas continuam `lifecycleStatus=draft`;
3. todas possuem exatamente um reviewer R1 e a data correta;
4. removendo apenas `reviewStatus` e `governance.reviews`, cada regra é estruturalmente idêntica à correspondente do ruleset 6.5;
5. sources, policies e terminology são idênticos ao snapshot 6.5;
6. o snapshot 6.5 original continua `source_verified`, sem review records;
7. nenhuma regra é `active` ou `reviewed_by_2`.

Portanto a passagem 0.5.0 -> 0.5.1 é **governance-only**.

## 6. Gate técnico pós-promoção

Commit testado antes deste documento:

`1b5e938a0ecd0a1640d0f288186bedaf443ee760`

Workflow `V3 foundation`: **success**.

Resultados:

- **414/414 testes totais**;
- **20/20 arquivos de teste**;
- `reviewedCandidate.test.ts`: **5/5**;
- `candidateEntrypoint.test.ts`: **1/1**;
- `governancePhase66.test.ts`: **10/10**;
- **62/62 schema checks**;
- typecheck: ✅;
- build: ✅;
- V2 byte-for-byte: ✅.

Contagem CCR específica após R1: **172 testes**.

## 7. Fronteiras preservadas

- `v3/src/engine/**`: **0 mudanças**;
- `v3/src/model/**`: **0 mudanças**;
- nenhuma nova medicina adicionada;
- nenhuma fonte nova adicionada;
- nenhuma policy alterada clinicamente;
- nenhum resolver alterado clinicamente;
- nenhuma regra ativada;
- nenhuma segunda revisão simulada;
- PR #3 permanece Draft;
- nenhum merge.

## 8. O que ainda falta antes de release clínico

### Obrigatório

**Segunda revisão médica independente (`reviewed_by_2`).**

Ela deve revisar a tradução clínica e não apenas confirmar que testes passam. Idealmente deve incluir ao menos:

- faixa etária e intervalos das três policies;
- FIT+ e resolução por colonoscopia;
- hard exclusions;
- história familiar ACG;
- limites deliberados/abstenções;
- divergências SUS × BA-A × Internacional;
- golden cases críticos.

A preparação desse gate foi iniciada em:

- `24-phase6-r2-independent-audit.md` — auditoria independente pré-R2 e findings;
- `25-phase6-r2-review-form.md` — formulário para o segundo médico;
- `tests/ccr/r2Gate.test.ts` — impede `reviewed_by_2`/`active` acidental sem segunda identidade humana.

A auditoria pré-R2 encontrou dois itens a resolver antes da assinatura R2 final: granularidade do Grade USPSTF nas regras de modalidade e reconciliação documental da proveniência `B12`. Esses findings não mudaram outputs clínicos, mas são relevantes para evidência/auditabilidade.

### Depois da segunda revisão

Se aprovada, deve-se criar uma nova versão candidata/release, registrar reviewer/data distintos, executar novamente a suíte completa e somente então discutir `lifecycleStatus=active`, release público e merge.

## 9. Estado final da Fase 6 / gate R2

```text
Foundation representability        ✅
Routine / contrato                 ✅
Estratégias                        ✅
FIT+ longitudinal                  ✅
História familiar                  ✅
Hard exclusions                    ✅
Adversarial / goldens              ✅
Trace / governance audit           ✅
Primeira revisão da tradução       ✅ reviewed_by_1
Auditoria independente pré-R2      ✅
R2-01 / R2-02                      ⏳ requerem resolução
Segunda revisão médica humana      ⏳ pendente
Ativação clínica                   ❌ não autorizada
Release público                    ❌ não autorizado
Merge PR #3                        ❌ não realizado
```

**Conclusão:** a Fase 6 está tecnicamente fechada em R1 e o gate R2 está formalmente preparado. `reviewed_by_2` continua bloqueado até resolução dos findings e aprovação explícita de um segundo médico humano independente.