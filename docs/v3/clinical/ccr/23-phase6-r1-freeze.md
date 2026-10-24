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

Ela deve revisar a tradução clínica e não apenas confirmar que testes passam.

A preparação desse gate está documentada em:

- `24-phase6-r2-independent-audit.md` — auditoria independente pré-R2 e findings;
- `25-phase6-r2-review-form.md` — formulário para o segundo médico;
- `tests/ccr/r2Gate.test.ts` — impede `reviewed_by_2`/`active` acidental sem segunda identidade humana.

A auditoria pré-R2 encontrou dois ajustes de evidência/proveniência antes da assinatura R2:

- **R2-01:** Grade USPSTF está replicado nas regras específicas de FIT/colonoscopia. A/B devem permanecer semanticamente vinculados à recomendação populacional de rastrear por faixa etária; as regras de modalidade devem preservar apenas estratégia/intervalo e a referência à USPSTF.
- **R2-02:** o antigo `B12` é um protocolo OCI diagnóstico, 2ª edição 2025, e não é a fonte adequada para afirmar FIT bienal 50–75. A auditoria identificou a **Portaria SAES/MS nº 5.215, de 22/10/2026 (DOU 23/10/2026)** como fonte normativa apropriada para esse comportamento; os sourceRefs SUS precisam ser migrados e `B12` precisa ser corrigido/restrito ao conteúdo que realmente sustenta.

Esses findings não mudaram os outputs clínicos aprovados, mas exigem nova tradução de evidência e reconfirmação R1 antes de R2.

### Gate técnico de preparação R2

Commit `4002daaa172272fef088e5a0ede55eb00ce0c6a0`: workflow `40120075597` **success**.

- **417/417 testes totais**;
- **21/21 arquivos de teste**;
- `r2Gate.test.ts`: **3/3**;
- **62/62 schema checks**;
- typecheck/build: ✅;
- V2 byte-for-byte: ✅.

### Depois das correções pré-R2

1. criar novo candidato ainda `reviewed_by_1`;
2. provar ausência de mudança de outputs clínicos quando aplicável;
3. reconfirmar R1 das alterações de evidência/proveniência;
4. submeter ao segundo médico independente;
5. se aprovado, registrar reviewer/data distintos e produzir `reviewed_by_2`;
6. somente então discutir `active`, release e merge em decisão separada.

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
R2-01                              ⛔ correção pendente
R2-02                              🟡 solução normativa identificada; migração pendente
Gate técnico R2                    ✅ 417/417
Segunda revisão médica humana      ⏳ pendente
Ativação clínica                   ❌ não autorizada
Release público                    ❌ não autorizado
Merge PR #3                        ❌ não realizado
```

**Conclusão:** a Fase 6 está tecnicamente fechada em R1 e o gate R2 está preparado. `reviewed_by_2` continua bloqueado até as correções de evidência/proveniência, reconfirmação R1 e aprovação explícita de um segundo médico humano independente.