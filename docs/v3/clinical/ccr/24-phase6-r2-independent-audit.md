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

Referências públicas rechecadas:

- Portaria SAES/MS nº 5.215/2026 — DOU de 23/10/2026;
- CONASEMS — legislação diária de 23/10/2026 confirmando a Portaria 5.215 e a revogação/ineficácia da 4.642;
- INCA — “SUS inclui teste de alta tecnologia para rastreamento de câncer colorretal”, 10/08/2026;
- INCA — “SUS adota novo exame para detectar câncer de intestino antes de sintomas”, 21/05/2026;
- Ministério da Saúde — comunicações de implantação nacional do FIT em outubro de 2026.

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
| SUS 50–75 / FIT q2 | clinicamente corroborado; **fonte normativa correta identificada: Portaria 5.215/2026** |
| SUS FIT+ -> colonoscopia | coerente; protocolo OCI pode continuar como fonte diagnóstica quando usado para esse propósito |
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

**Classificação:** direção de resolução identificada; correção de sourceRefs requerida antes de R2 final.  
**Impacto clínico de output:** nenhum observado.  
**Impacto de auditabilidade:** real.

### Conclusão da investigação

O documento OCI atualmente representado por `crc-src-B12` é **2ª edição – 2025 – versão eletrônica** e é um protocolo de acesso/avaliação diagnóstica. A publicação da landing page em 27/08/2026 não justifica descrevê-lo como se a edição interna fosse uma diretriz de rastreamento de 2026.

Para a regra de **rastreamento SUS 50–75 com FIT bienal**, a fonte normativa mais precisa agora é a **Portaria SAES/MS nº 5.215, de 22/10/2026**, publicada no DOU em 23/10/2026. Ela explicitamente:

- cria o procedimento FIT para rastreamento do CCR;
- limita o procedimento a homens e mulheres assintomáticos de 50–75 anos;
- define periodicidade bienal;
- separa rastreamento de investigação diagnóstica;
- torna sem efeito a Portaria SAES/MS nº 4.642/2026.

### Correção recomendada

- representar a Portaria 5.215/2026 como nova fonte SUS de rastreamento;
- migrar para ela os `sourceRefs` de idade/FIT/periodicidade da rotina SUS;
- corrigir `B12` para refletir sua edição real de 2025 e mantê-la somente onde seu conteúdo diagnóstico realmente sustenta o locator (por exemplo, avaliação diagnóstica/colonoscopia diante de teste fecal positivo, se essa referência continuar necessária);
- não usar `B12` para afirmar FIT bienal 50–75;
- reauditar os sourceRefs de história familiar/hard exclusions SUS: se B12 não sustentar textualmente a proposição, utilizar fonte brasileira adequada ou manter a decisão como curadoria/abstensão claramente documentada, sem locator fictício.

Essa mudança é de proveniência/evidência; não há justificativa para mudar o engine ou a conduta já testada.

## 6. Itens que NÃO foram considerados blockers adicionais

### BA-A 45–49

`SharedDecision` é uma decisão curatorial explicitamente identificada. A SBOC 2026 reconhece início aos 45 por algumas sociedades com evidência menor, mas não dita literalmente o estado computacional `SharedDecision`. Isso é aceitável desde que continue apresentado como política BA-A, não como citação literal da SBOC.

### BA-A FIT q2

A SBOC informa 1–2 anos. BA-A escolhe 2 anos como default conservador e documenta que é curadoria. Não há falsa alegação de que SBOC determina exclusivamente q2.

### “Recommend against” em faixas fora de rotina

O schema usa essa stance para representar `NotApplicable` de nova rotina sem cair em `ClinicalReviewRequired`. Os guardrails deixam explícito que isso não é contraindicação diagnóstica nem cancela follow-up aberto. O segundo revisor deve confirmar que essa semântica interna é aceitável para o produto e não será apresentada ao usuário como uma contraindicação clínica absoluta.

## 7. Gate técnico desta auditoria

Commit auditado antes desta atualização documental:

`4002daaa172272fef088e5a0ede55eb00ce0c6a0`

Workflow `V3 foundation` (`40120075597`): **success**.

Resultados:

- **417/417 testes totais**;
- **21/21 arquivos de teste**;
- `r2Gate.test.ts`: **3/3**;
- **62/62 schema checks**;
- typecheck: ✅;
- build: ✅;
- V2 byte-for-byte: ✅.

O novo `r2Gate.test.ts` impede regressão de governança: enquanto não houver autorização humana independente, todas as 43 regras canônicas devem permanecer `reviewed_by_1`, `lifecycleStatus=draft`, com apenas o reviewer R1 registrado.

## 8. Estado de R2 após esta auditoria

```text
43 regras reviewed_by_1        ✅
Auditoria independente pré-R2  ✅
R2-01                           ⛔ corrigir Grade metadata de modalidade
R2-02                           🟡 fonte normativa correta identificada; aplicar source migration
Segundo médico identificado     ⏳
Assinatura/decisão R2 humana    ⏳
reviewed_by_2                   ❌ NÃO registrar ainda
active                          ❌
release público                 ❌
merge PR #3                     ❌
```

## 9. Próximo passo correto

1. aplicar R2-01 e a migração de fonte R2-02 em um novo candidato ainda R1;
2. reauditar todos os sourceRefs SUS tocados pela mudança;
3. rodar schemas + goldens + regressão completa;
4. obter reconfirmação R1 das mudanças de evidência/proveniência;
5. entregar o candidato corrigido e `25-phase6-r2-review-form.md` a um médico independente;
6. somente após aprovação explícita do segundo médico, registrar reviewer/data distintos e produzir `reviewed_by_2` em uma nova versão de governança;
7. ativação/release/merge continuam decisões separadas.

**Governança:** este documento é uma auditoria de preparação para R2. Ele não deve ser usado como assinatura do segundo revisor.