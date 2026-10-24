# 24 — Auditoria independente pré-R2 da tradução executável CCR

**Data:** 24/10/2026  
**Branch:** `v3-ccr-rules-pilot`  
**PR:** #3 — Draft  
**Candidato auditado:** `crc-0.5.1-phase6-r1-draft`  
**Estado de governança na entrada:** 43 regras `reviewed_by_1`, todas ainda `lifecycleStatus=draft`

## 1. Objetivo e limite de independência

Esta rodada refaz a checagem da tradução clínica e da evidência com foco em encontrar problemas que a primeira revisão possa ter deixado passar.

Ela **não conta como a segunda revisão médica humana**. O agente que executa esta auditoria não deve ser registrado como segundo revisor e não pode produzir `reviewed_by_2` por conta própria.

O objetivo é entregar ao segundo médico um candidato mais limpo e um conjunto explícito de pontos que exigem julgamento independente.

## 2. Fontes revalidadas

### SUS / Brasil oficial

Fontes oficiais do Ministério da Saúde/INCA publicadas em 2026 continuam corroborando o núcleo clínico executado no piloto:

- FIT como estratégia de rastreamento;
- população assintomática de 50 a 75 anos;
- periodicidade bienal;
- FIT como triagem com colonoscopia após resultado positivo.

A auditoria localizou ainda uma fonte normativa mais apropriada para a regra de rotina:

**Portaria SAES/MS nº 5.215, de 22 de outubro de 2026**, publicada no DOU de 23/10/2026, Seção 1, páginas 73–74. A Portaria torna sem efeito a SAES/MS nº 4.642/2026 e inclui o procedimento `02.14.01.032-5 - Pesquisa de Sangue Oculto nas Fezes por Teste Imunoquímico Fecal (FIT) para Rastreamento do Câncer Colorretal`, cuja descrição define explicitamente rastreamento **bienal**, em homens e mulheres **assintomáticos de 50 a 75 anos**, e distingue esse uso do exame destinado à investigação diagnóstica.

O protocolo OCI atualmente referenciado como `B12` é de natureza diagnóstica e o conteúdo acessível identifica **2ª edição – 2025 – versão eletrônica**. Sua landing page foi republicada/atualizada em 2026, mas isso não transforma a edição interna em uma guideline de rastreamento 2026. Portanto ele não deve permanecer como fonte principal da regra SUS de FIT bienal 50–75.

### SBOC 2026

A versão final de `Cólon: doença localizada` foi rechecada visualmente nas páginas de prevenção/rastreamento e sustenta os métodos/intervalos e limites utilizados pela policy BA-A, com as escolhas curatoriais explicitamente diferenciadas da transcrição literal da diretriz.

### USPSTF 2021 vigente

A recomendação final vigente mantém 45–49 Grade B para rastreamento, 50–75 Grade A, 76–85 Grade C seletiva, FIT anual e colonoscopia a cada 10 anos como estratégias elegíveis, além da população average-risk definida com exclusões relevantes.

### ACG 2021 / US Multi-Society Task Force

As fontes continuam sustentando os suplementos internacionais estreitos usados no piloto para história familiar, FIT positivo e intervalo após colonoscopia normal high-quality.

## 3. Findings pré-R2

### R2-01 — granularidade incorreta do Grade USPSTF

**Status:** ⛔ correção pendente.

As quatro regras específicas de estratégia Internacional atribuem Grade A/B no `sourceRef` da modalidade. A USPSTF gradua a recomendação de rastrear por faixa etária, não FIT/colonoscopia individualmente.

**Correção:** manter A/B nas regras populacionais; remover os metadados de Grade das quatro regras específicas de modalidade sem alterar intervalos, ações ou resolvers.

### R2-02 — fonte SUS de rastreamento

**Status:** 🟡 direção de resolução identificada; migração pendente.

O `B12` atual é um protocolo OCI diagnóstico, 2ª edição 2025. A fonte normativa correta para idade 50–75/FIT bienal é a **Portaria SAES/MS nº 5.215/2026**.

**Correção:** adicionar a Portaria 5.215/2026 como fonte SUS de rastreamento, migrar para ela os `sourceRefs` de idade/FIT/periodicidade, corrigir B12 para sua edição real e revalidar qualquer locator SUS de história familiar/hard exclusions antes de mantê-lo.

## 4. Não-blockers

- BA-A 45–49 `SharedDecision`: escolha curatorial explícita, não falsa citação literal da SBOC.
- BA-A FIT q2: escolha curatorial conservadora dentro do intervalo SBOC 1–2 anos.
- `recommend_against` fora da rotina: semântica interna protegida por guardrails; não pode ser exibida como contraindicação diagnóstica absoluta.

## 5. Gate técnico de preparação

Commit `4002daaa172272fef088e5a0ede55eb00ce0c6a0`; workflow `40120075597`: **success**.

- **417/417 testes**;
- **21/21 arquivos**;
- `r2Gate.test.ts`: **3/3**;
- **62/62 schema checks**;
- typecheck/build: ✅;
- V2 byte-for-byte: ✅.

O gate impede `reviewed_by_2` ou `active` acidental antes de uma segunda identidade humana real.

## 6. Estado atual

```text
43 regras reviewed_by_1        ✅
Auditoria independente pré-R2  ✅
R2-01                           ⛔ correção pendente
R2-02                           🟡 solução normativa identificada; migração pendente
Segundo médico identificado     ⏳
Assinatura/decisão R2 humana    ⏳
reviewed_by_2                   ❌ NÃO registrar ainda
active                          ❌
release público                 ❌
merge PR #3                     ❌
```

## 7. Próximo passo

1. aplicar R2-01 e R2-02 em novo candidato ainda R1;
2. reauditar todos os sourceRefs SUS tocados;
3. rerodar a suíte completa e provar que não houve mudança clínica indevida;
4. obter reconfirmação R1 das mudanças de evidência/proveniência;
5. entregar o candidato corrigido ao segundo médico usando `25-phase6-r2-review-form.md`;
6. somente após aprovação humana independente, registrar `reviewed_by_2` com reviewer/data distintos.

**Governança:** este documento é preparação para R2, não assinatura de segundo revisor.