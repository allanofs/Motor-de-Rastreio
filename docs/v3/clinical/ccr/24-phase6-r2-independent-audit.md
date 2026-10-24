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

Referências públicas rechecadas:

- Ministério da Saúde — protocolo OCI/oncologia, landing page publicada em 27/08/2026;
- INCA — “SUS inclui teste de alta tecnologia para rastreamento de câncer colorretal”, 10/08/2026;
- INCA/MS — comunicações de implantação nacional do FIT em 2026.

### SBOC 2026

A versão final de `Cólon: doença localizada` foi rechecada visualmente nas páginas de prevenção/rastreamento.

A diretriz final sustenta:

- sangue oculto/FIT como método de rastreamento;
- colonoscopia como método de rastreamento;
- teste fecal a cada 1–2 anos;
- colonoscopia a cada 10 anos após teste negativo;
- faixa habitual 50–75;
- 45 anos como possibilidade apoiada por algumas sociedades com evidência menor;
- 75–85 individualizado;
- história familiar/DII/FAP/Lynch exigindo abordagem específica.

### USPSTF 2021 vigente

A recomendação final vigente mantém:

- 45–49: Grade B para rastreamento;
- 50–75: Grade A para rastreamento;
- 76–85: Grade C seletiva;
- FIT anual entre as estratégias recomendadas;
- colonoscopia a cada 10 anos entre as estratégias recomendadas;
- população average-risk exclui CRC prévio, pólipos adenomatosos, DII e síndromes hereditárias conhecidas.

### ACG 2021

A fonte oficial/release continua sustentando:

- 1 FDR com CRC/pólipo avançado <60 ou >=2 FDR: colonoscopia aos 40 anos ou 10 anos antes do familiar mais jovem, o que ocorrer primeiro, q5;
- 1 FDR >=60: iniciar aos 40/10 anos antes e depois utilizar opções/intervalos average-risk;
- 1 SDR isolado: recomendações average-risk.

### US Multi-Society Task Force

Rechecado:

- FIT positivo -> colonoscopia, não repetição de FIT como substituto (2017);
- colonoscopia normal high-quality -> repetir screening em 10 anos, independentemente da indicação, exceto populações de maior risco (2020).

## 3. Resultado por bloco

| Bloco | Resultado pré-R2 |
|---|---|
| SUS 50–75 / FIT q2 | clinicamente corroborado; **proveniência B12 requer reconciliação documental** |
| SUS FIT+ -> colonoscopia | coerente |
| SUS pós-colonoscopia normal | abstensão conservadora coerente |
| BA-A 45–49 shared decision | coerente como **decisão curatorial**, não como transcrição literal da SBOC |
| BA-A FIT q2 | coerente como escolha curatorial conservadora dentro do intervalo SBOC 1–2 anos |
| BA-A colonoscopia q10 | sustentado |
| Internacional idade | sustentado |
| Internacional FIT anual | sustentado |
| Internacional colonoscopia q10 | sustentado |
| Internacional FIT+ | sustentado |
| Internacional pós-FIT normal q10 | sustentado com gate de risco aumentado |
| ACG história familiar | sustentado nos padrões estreitos automatizados |
| Hard exclusions | comportamento conservador e seguro; revisão explícita adequada |
| HandedOff | permanece separado de diagnóstico/encaminhamento |
| Datas parciais / chronology | coerente com especificação e goldens |
| Care Setting | altera operacionalização, não recomendação científica |

## 4. Finding R2-01 — granularidade incorreta do Grade USPSTF

**Classificação:** mudança requerida antes de `reviewed_by_2`.  
**Impacto clínico de output:** nenhum observado.  
**Impacto de evidência/trace:** real.

### Problema

As regras:

- `crc.intl.strategy.fit.45-49-grade-b`;
- `crc.intl.strategy.fit.50-75-grade-a`;
- `crc.intl.strategy.colonoscopy.45-49-grade-b`;
- `crc.intl.strategy.colonoscopy.50-75-grade-a`;

registram `recommendationStrength=Grade B/A` dentro do `sourceRef` específico de cada modalidade.

A USPSTF atribui Grade B/A à recomendação de **rastrear a população por faixa etária**. A mesma recomendação lista FIT anual e colonoscopia q10 como estratégias elegíveis/intervalos recomendados, mas não cria um Grade B ou A separado para cada modalidade.

### Correção recomendada

- manter Grade B/A nas regras `crc.intl.population.*`;
- nas regras específicas de estratégia, manter a referência USPSTF e o locator do intervalo, porém **remover `recommendationStrength`, `rawGrade` e `gradeVerified=true` específicos da modalidade**;
- não mudar ação, intervalo, policy nem resolver.

Isso é um ajuste de metadado de evidência, não um clinical diff de comportamento.

## 5. Finding R2-02 — proveniência/versionamento de B12

**Classificação:** reconciliação documental requerida antes de R2 final.  
**Impacto clínico de output:** nenhum observado; núcleo clínico corroborado por fontes oficiais 2026.  
**Impacto de auditabilidade:** real.

### Problema

`crc-src-B12` é descrita no bundle como:

- publicação 2026;
- versão “publicado em 27/08/2026”;
- protocolo OCI em oncologia.

A landing page oficial realmente foi publicada em 27/08/2026. Porém uma representação indexada/download do PDF acessível durante a auditoria identifica uma edição anterior no conteúdo do arquivo. Isso precisa ser reconciliado para que o `Source` descreva exatamente o documento que o locator pretende citar.

### Evidência clínica paralela

Mesmo com essa inconsistência de proveniência, comunicações oficiais MS/INCA de 2026 confirmam de forma independente:

- FIT;
- assintomáticos 50–75;
- realização bienal;
- colonoscopia após triagem positiva.

Portanto o finding não invalida a conduta implementada; ele impede apenas uma assinatura R2 limpa enquanto a fonte B12 estiver documentalmente ambígua.

### Resolução aceitável

Uma destas opções:

1. confirmar o PDF/edição exata servida pela landing page de 27/08/2026 e ajustar `publicationYear/version/locator` se necessário; ou
2. substituir/complementar B12 por uma fonte oficial 2026 cuja versão e conteúdo estejam inequivocamente identificáveis, preservando os mesmos comportamentos clínicos.

Não alterar o engine por causa disso.

## 6. Itens que NÃO foram considerados blockers

### BA-A 45–49

`SharedDecision` é uma decisão curatorial explicitamente identificada. A SBOC 2026 reconhece início aos 45 por algumas sociedades com evidência menor, mas não dita literalmente o estado computacional `SharedDecision`. Isso é aceitável desde que continue apresentado como política BA-A, não como citação literal da SBOC.

### BA-A FIT q2

A SBOC informa 1–2 anos. BA-A escolhe 2 anos como default conservador e documenta que é curadoria. Não há falsa alegação de que SBOC determina exclusivamente q2.

### “Recommend against” em faixas fora de rotina

O schema usa essa stance para representar `NotApplicable` de nova rotina sem cair em `ClinicalReviewRequired`. Os guardrails deixam explícito que isso não é contraindicação diagnóstica nem cancela follow-up aberto. O segundo revisor deve confirmar que essa semântica interna é aceitável para o produto e não será apresentada ao usuário como uma contraindicação clínica absoluta.

## 7. Estado de R2 após esta auditoria

```text
43 regras reviewed_by_1        ✅
Auditoria independente pré-R2  ✅
Finding R2-01                   ⛔ corrigir metadado de Grade USPSTF
Finding R2-02                   ⛔ reconciliar proveniência B12
Segundo médico identificado     ⏳
Assinatura/decisão R2 humana    ⏳
reviewed_by_2                   ❌ NÃO registrar ainda
active                          ❌
release público                 ❌
merge PR #3                     ❌
```

## 8. Próximo passo correto

1. resolver R2-01 e R2-02;
2. rodar novamente schemas + goldens + regressão completa;
3. manter o candidato em `reviewed_by_1` após qualquer ajuste até nova confirmação R1 das mudanças;
4. entregar `25-phase6-r2-review-form.md` a um médico independente;
5. somente após aprovação explícita do segundo médico, registrar reviewer/data distintos e produzir `reviewed_by_2` em uma nova versão de governança;
6. ainda assim, ativação/release/merge continuam decisões separadas.
