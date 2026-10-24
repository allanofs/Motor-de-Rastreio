# 24 — Auditoria independente pré-R2 da tradução executável CCR

**Data:** 24/10/2026  
**Branch:** `v3-ccr-rules-pilot`  
**PR:** #3 — Draft  
**Candidato auditado:** `crc-0.5.1-phase6-r1-draft`  
**Estado de governança na entrada:** 43 regras `reviewed_by_1`, todas ainda `lifecycleStatus=draft`

## Objetivo e limite de independência

Esta rodada refez a checagem da tradução clínica e da evidência com foco em encontrar problemas que a primeira revisão pudesse ter deixado passar. Ela **não conta como a segunda revisão médica humana** e não autoriza `reviewed_by_2`.

## Resultado

A lógica clínica principal permaneceu coerente. Dois problemas de evidência/proveniência foram identificados antes de R2:

### R2-01 — Grade USPSTF

As quatro regras específicas de FIT/colonoscopia Internacional replicam Grade A/B no `sourceRef` da modalidade. A USPSTF gradua a **recomendação populacional de rastrear por faixa etária**, não cada modalidade individualmente.

**Correção necessária:** manter A/B nas regras populacionais e remover o Grade específico das quatro rules de modalidade, sem mudar ações/intervalos/resolvers.

### R2-02 — fonte SUS

O antigo `crc-src-B12` é o **Protocolo de Acesso às OCI em Oncologia, 2ª edição 2025**, de natureza diagnóstica. Sua landing page foi republicada em 2026, mas isso não o torna a fonte adequada para afirmar rastreamento FIT bienal 50–75.

A auditoria identificou a fonte normativa correta:

**Portaria SAES/MS nº 5.215, de 22/10/2026 — DOU de 23/10/2026, Seção 1, páginas 73–74.**

Ela inclui o procedimento `02.14.01.032-5` para FIT de rastreamento do CCR e define explicitamente:

- homens e mulheres assintomáticos;
- 50–75 anos;
- rastreamento bienal;
- separação do procedimento usado para investigação diagnóstica;
- revogação/ineficácia da Portaria 4.642/2026.

**Correção necessária:** adicionar a Portaria 5.215 como fonte SUS de rastreamento; migrar os sourceRefs de idade/FIT/periodicidade; corrigir B12 para sua edição real e restringi-lo ao conteúdo diagnóstico que realmente sustenta; revalidar os locators SUS de história familiar/hard exclusions.

## Itens não bloqueantes adicionais

- BA-A 45–49 `SharedDecision` é curadoria explícita, não transcrição literal da SBOC.
- BA-A FIT q2 é escolha curatorial conservadora dentro do intervalo SBOC 1–2 anos.
- `recommend_against` fora da rotina é semântica interna protegida por guardrails e não pode ser exposta como contraindicação diagnóstica absoluta.

## Gate técnico de preparação

Commit `4002daaa172272fef088e5a0ede55eb00ce0c6a0`; workflow `40120075597`: **success**.

- 417/417 testes;
- 21/21 arquivos de teste;
- `r2Gate.test.ts`: 3/3;
- 62/62 schema checks;
- typecheck/build ✅;
- V2 byte-for-byte ✅.

## Estado

```text
R1                               ✅ reviewed_by_1
Auditoria independente pré-R2   ✅
R2-01                            ⛔ correção de evidence metadata pendente
R2-02                            🟡 fonte correta identificada; source migration pendente
Segundo médico humano            ⏳
reviewed_by_2                    ❌
active                           ❌
release                          ❌
merge                            ❌
```

## Próxima sequência obrigatória

1. aplicar R2-01 e R2-02 em um novo candidato ainda R1;
2. reauditar sourceRefs SUS;
3. rerodar a suíte completa;
4. obter reconfirmação R1 das mudanças;
5. entregar o candidato corrigido ao segundo médico com `25-phase6-r2-review-form.md`;
6. somente então, se aprovado por pessoa distinta, registrar `reviewed_by_2`.

**Este documento é preparação para R2, não assinatura de segundo revisor.**