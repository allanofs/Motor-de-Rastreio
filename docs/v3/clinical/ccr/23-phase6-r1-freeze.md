# 23 — Freeze da Fase 6 após primeira revisão humana da tradução executável

**Data:** 24/10/2026  
**Branch:** `v3-ccr-rules-pilot`  
**PR:** #3 — permanece **Draft**  
**Snapshot clínico pré-revisão preservado:** `crc-0.5.0-phase6.5-draft`  
**Candidato canônico após R1:** `crc-0.5.1-phase6-r1-draft`

## Estado congelado R1

As 43 regras do candidato canônico estão em:

```text
lifecycleStatus = draft
reviewStatus = reviewed_by_1
reviewer = Allan Ramos Costa
reviewedAt = 2026-10-24
```

Distribuição:

| Policy | Regras |
|---|---:|
| SUS / Brasil oficial | 10 |
| Brasil ampliado BA-A | 13 |
| Internacional USPSTF | 20 |
| **Total** | **43** |

O snapshot `crc-0.5.0-phase6.5-draft` permanece imutável como evidência pré-R1. A passagem para `crc-0.5.1-phase6-r1-draft` foi apenas de governança e passou 414/414 testes, 62/62 schema checks, typecheck, build e preservação byte-for-byte da V2.

## Gate R2

A segunda revisão médica independente continua obrigatória antes de release público e não pode ser simulada pelo autor ou por um agente automatizado.

A preparação está em:

- `24-phase6-r2-independent-audit.md`;
- `25-phase6-r2-review-form.md`;
- `tests/ccr/r2Gate.test.ts`.

A auditoria pré-R2 encontrou dois ajustes de evidência/proveniência antes de entregar o candidato ao segundo médico:

1. **R2-01 — USPSTF:** Grade A/B deve permanecer ligado à recomendação populacional por faixa etária, não ser apresentado como graduação própria de FIT/colonoscopia.
2. **R2-02 — SUS:** `B12` é protocolo OCI diagnóstico, 2ª edição 2025. A fonte normativa adequada para FIT bienal 50–75 é a **Portaria SAES/MS nº 5.215/2026**; sourceRefs precisam ser migrados e os locators SUS revalidados.

O gate técnico de preparação R2 passou **417/417 testes**, 62/62 schema checks, typecheck, build e V2 byte-for-byte.

## Estado

```text
Fase 6 técnica                    ✅
Primeira revisão humana (R1)      ✅ reviewed_by_1
Auditoria independente pré-R2     ✅
R2-01                             ⛔ correção pendente
R2-02                             🟡 fonte correta identificada; migração pendente
Segunda revisão médica humana     ⏳ pendente
reviewed_by_2                     ❌
active                            ❌
release público                   ❌
merge PR #3                       ❌
```

**Próximo passo:** corrigir R2-01/R2-02 em novo candidato ainda R1, rerodar a suíte, reconfirmar R1 das mudanças e somente então entregar ao segundo médico independente.