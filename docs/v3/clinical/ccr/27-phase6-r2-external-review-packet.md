# 27 — Pacote para segunda revisão médica independente (R2) — piloto CCR

**Candidato:** `crc-0.5.3-phase6-r1-reconfirmed-draft`  
**Branch:** `v3-ccr-rules-pilot`  
**PR:** #3 — Draft  
**Status:** 43 regras `reviewed_by_1`, todas `lifecycleStatus=draft`; nenhuma `reviewed_by_2`; nenhuma regra ativa; sem release público.

---

## 1. Para que serve esta revisão

Este projeto é um motor de apoio à decisão para rastreamento preventivo. O primeiro módulo clínico executável é câncer colorretal (CCR).

A segunda revisão médica independente deve responder a uma pergunta prática:

> **As decisões clínicas que o candidato executa são corretas, seguras, compatíveis com as fontes declaradas e adequadamente limitadas ao escopo de rastreamento preventivo?**

Não é necessário validar a arquitetura TypeScript para começar a revisão. O código, traces e testes estão disponíveis para auditoria aprofundada, mas a revisão clínica pode ser iniciada por este pacote, pelo formulário R2 e pelos casos adversariais.

---

## 2. O que o Motor faz — e o que deliberadamente não faz

### Faz

- identifica elegibilidade de rastreamento de CCR conforme uma policy explicitamente selecionada;
- distingue três referenciais: **SUS/Brasil oficial**, **Brasil ampliado BA-A** e **Internacional**;
- calcula estado de rotina (`Due`, `Current`, `SharedDecision`, `Indeterminate`, `ClinicalReviewRequired` etc.);
- acompanha longitudinalmente FIT positivo até resolução diagnóstica suficiente;
- diferencia colonoscopia primária de rastreamento de colonoscopia diagnóstica pós-FIT+;
- preserva datas parciais sem inventar precisão;
- mantém história familiar e condições de risco especial fora da rotina average-risk quando apropriado;
- modifica rota operacional conforme disponibilidade local sem alterar a recomendação científica.

### Não faz

- triagem de sintomas ou urgência;
- cálculo de probabilidade de câncer;
- substituição de avaliação clínica diagnóstica;
- surveillance completa pós-polipectomia;
- algoritmo completo de Lynch/FAP/DII;
- interpretação automática de valor bruto/cutoff de FIT;
- escolha autônoma entre estratégias clinicamente elegíveis quando a policy exige decisão humana;
- criação de prazo universal não sustentado por fonte;
- inferência de `HandedOff` apenas porque houve encaminhamento ou diagnóstico.

O profissional deve confirmar previamente que o encontro está em **contexto preventivo de rastreamento**. Caso contrário, o módulo se abstém.

---

## 3. As três policies

### A. SUS / Brasil oficial

Núcleo executável:

- rotina populacional para assintomáticos de **50 a 75 anos inclusive**;
- **FIT bienal** como estratégia nuclear;
- fonte normativa atual para faixa/intervalo: **Portaria SAES/MS nº 5.215/2026**;
- FIT positivo abre investigação por colonoscopia;
- FIT negativo posterior não encerra FIT positivo anterior;
- colonoscopia incompleta, preparo inadequado ou informação insuficiente não fecha o episódio;
- colonoscopia posterior normal, completa e adequada pode encerrar o episódio diagnóstico;
- o próximo relógio de rotina SUS após FIT+ -> colonoscopia normal **não é automaticamente inventado** neste piloto;
- a partir de 76 anos não se inicia nova rotina populacional, mas follow-up diagnóstico já aberto permanece válido;
- história familiar positiva relevante e condições especiais saem da automação average-risk para revisão clínica.

### B. Brasil ampliado BA-A

Curadoria clínica explícita, separada do SUS oficial:

- <45 anos: sem rotina average-risk automática;
- 45–49: `SharedDecision`;
- 50–75: FIT q2 como apresentação padrão;
- colonoscopia primária q10 como alternativa elegível;
- estratégia é escolhida por humano, não pelo motor;
- >75: individualização/revisão;
- história familiar positiva relevante não recebe automaticamente algoritmo ACG;
- follow-up de FIT+ usa postura brasileira conservadora.

### C. Internacional

Governança populacional USPSTF com suplementos nomeados:

- <45: sem rotina average-risk;
- 45–49: recomendação populacional **Grade B**;
- 50–75: recomendação populacional **Grade A**;
- 76–85: recomendação seletiva **Grade C**;
- >85: encerra rotina populacional sem inventar Grade D;
- estratégias elegíveis: **FIT anual** ou **colonoscopia q10**, selecionadas por humano;
- Grade A/B não é atribuída individualmente à modalidade FIT ou colonoscopia;
- FIT+ exige colonoscopia;
- colonoscopia pós-FIT+ normal de alta qualidade pode estabelecer q10 quando o paciente continua em contexto average-risk;
- ACG é usado apenas para história familiar na policy Internacional.

---

## 4. História familiar — regra Internacional ACG

O piloto implementa apenas o subconjunto revisado:

- **1 familiar de primeiro grau (FDR) com CCR/pólipo avançado <60 anos** OU **≥2 FDR em qualquer idade**:
  - colonoscopia aos 40 anos **ou** 10 anos antes do diagnóstico do familiar mais jovem, o que ocorrer primeiro;
  - repetir a cada 5 anos.
- **1 FDR ≥60 anos**:
  - iniciar aos 40 anos ou 10 anos antes do diagnóstico;
  - depois seguir estratégias/intervalos de risco habitual; não aplicar q5 universal.
- **1 familiar de segundo grau isolado (SDR)**:
  - pode seguir average-risk se não houver outro modificador.
- história incompleta, padrão complexo, pólipo de tipo desconhecido ou suspeita hereditária:
  - informação faltante ou `ClinicalReviewRequired`, não inferência agressiva.

SUS e BA-A **não importam silenciosamente** esse algoritmo.

---

## 5. Hard exclusions / risco especial

As seguintes situações não devem simplesmente desaparecer como `NotApplicable`; o candidato apresenta revisão explícita:

- CCR prévio;
- pólipo/adenoma relevante em contexto de surveillance;
- DII colônica relevante;
- síndrome hereditária conhecida/suspeita.

Resultado esperado: `ClinicalReviewRequired`, salvo quando há evidência separada de que outro serviço/profissional realmente assumiu o cuidado.

**Diagnóstico ou encaminhamento isolado não equivale a `HandedOff`.**

---

## 6. Fluxo longitudinal FIT positivo

```text
FIT positivo
   |
   +-- sem colonoscopia suficiente ----------------> InFollowUp
   |
   +-- FIT negativo posterior ---------------------> continua aberto
   |
   +-- colonoscopia anterior ao FIT+ --------------> não resolve
   |
   +-- mesma data/ordem não demonstrável ----------> Indeterminate
   |
   +-- colonoscopia incompleta/preparo inadequado -> continua aberto
   |
   +-- resultado da colonoscopia pendente ---------> PendingResult
   |
   +-- pólipo/lesão/câncer ------------------------> ClinicalReviewRequired
   |
   +-- colonoscopia posterior normal,
       completa, adequada e suficiente ------------> episódio resolvido
```

Um novo FIT+ depois de episódio previamente resolvido abre novo follow-up.

FIT+ continua acionável mesmo se a pessoa já tiver ultrapassado a faixa etária de nova rotina populacional.

---

## 7. Situações de segurança que merecem revisão explícita

O revisor deve prestar atenção especial a estes cenários:

1. FIT+ seguido de FIT− — o positivo continua aberto.
2. Colonoscopia normal antes do FIT+ — não resolve um gatilho posterior.
3. FIT+ e colonoscopia na mesma data, sem ordem demonstrável — não assumir posterioridade.
4. Data parcial (ano/mês) — não inventar dia nem ordem.
5. FIT inválido — não equivale a negativo.
6. `historyKnowledge=unknown` — não equivale a `never_performed`.
7. Colonoscopia de rastreamento válida + escolha futura por FIT — cobertura vigente não deve ser apagada.
8. FIT+ aberto — nenhuma ação rotineira redundante de FIT/colonoscopia.
9. História familiar desconhecida — não tratar como negativa; pode preservar indicação mínima por idade e bloquear definição final da estratégia.
10. CRC/pólipo/DII/hereditário — revisão explícita; não retorno silencioso à rotina.
11. Recurso indisponível — muda rota operacional, não a ciência.
12. Mesmo conjunto de fatos/eventos em ordem diferente — mesmo resultado clínico.

O manifesto completo contém 60 casos em `12-adversarial-cases.md`.

---

## 8. Correções realizadas antes desta R2

### R2-01 — Grade USPSTF

Foi corrigida uma atribuição de metadado excessivamente forte. Grade A/B/C agora pertence à **recomendação populacional por faixa etária**. FIT anual e colonoscopia q10 permanecem estratégias elegíveis, mas não carregam Grade A/B individual da modalidade.

### R2-02 — provenance SUS

O antigo `B12` foi reconciliado como **Protocolo OCI, 2ª edição 2025**, de caráter diagnóstico/especializado, e não como fonte normativa da rotina populacional.

A faixa 50–75 e periodicidade bienal do FIT SUS passam a ser ancoradas na **Portaria SAES/MS nº 5.215/2026**. A página profissional do INCA é usada em roteamentos conservadores de história familiar/risco especial quando apropriado.

As correções alteraram somente fontes/metadados de evidência e governança; testes estruturais impedem mudança silenciosa de comportamento clínico nesse passo.

---

## 9. Fontes centrais do candidato

### Brasil / SUS

- Portaria SAES/MS nº 5.215/2026 — FIT de rastreamento, 50–75, bienal.
- INCA — página profissional de câncer de intestino/CCR para contexto de risco e encaminhamento conservador.
- Protocolo OCI Oncologia, 2ª edição 2025 — usado somente nos locators compatíveis com caráter diagnóstico/especializado.

### Brasil ampliado

- Diretrizes SBOC 2026 — Cólon: doença localizada, seção de prevenção/rastreamento.

### Internacional

- USPSTF 2021 — governança populacional e opções de screening.
- ACG 2021 — história familiar selecionada.
- US Multi-Society Task Force 2017 — FIT positivo e colonoscopia subsequente.
- US Multi-Society Task Force 2020 — intervalo após colonoscopia normal high-quality.

Os metadados completos e URLs estão em `v3/src/clinical/ccr/r2Sources.ts` e no bundle do candidato.

---

## 10. Evidência técnica disponível

No fechamento para R2, o candidato possui:

- 43 regras clínicas executáveis;
- 3 policies isoladas;
- **428/428 testes totais** em 23 arquivos de teste;
- **62/62 schema checks**;
- typecheck e build verdes;
- regressões de representabilidade, estratégia, longitudinalidade, história familiar, hard exclusions, traces e policy leakage;
- teste dedicado provando que a reconfirmação R1 `0.5.2 -> 0.5.3` altera somente metadados de revisão;
- V2 preservada byte-for-byte;
- nenhuma necessidade de adaptar `v3/src/engine/**` ou `v3/src/model/**` especificamente para CCR.

Testes aprovados não substituem julgamento clínico independente; servem para demonstrar que o comportamento revisado é determinístico e protegido contra regressão.

---

## 11. O que significa a decisão do revisor

### Aprovação integral

O revisor considera corretas e seguras as 43 traduções executáveis dentro do escopo do piloto. Isso autoriza registrar uma segunda revisão humana como `reviewed_by_2`.

### Aprovação parcial

O revisor deve listar exatamente quais regras/blocos foram aprovados. O restante não será promovido por inferência.

### Mudanças requeridas

As regras afetadas permanecem sem R2 global. A correção deve ser aplicada, testada e devolvida ao revisor quando a mudança for clinicamente material.

Mesmo após aprovação integral:

```text
reviewed_by_2 != active
reviewed_by_2 != release público
reviewed_by_2 != merge
```

Esses são gates posteriores e independentes.

---

## 12. Como devolver a revisão

O revisor pode escolher qualquer uma destas formas:

- preencher `25-phase6-r2-review-form.md` e devolver o arquivo/PDF;
- responder por e-mail com aprovação, ressalvas ou mudanças requeridas;
- enviar declaração assinada;
- registrar review/comentários na PR #3;
- fornecer texto livre inequívoco.

Para aprovação integral, a declaração deve conter no mínimo:

- nome completo;
- condição de médico e, idealmente, especialidade;
- data;
- confirmação de ser pessoa distinta do R1;
- conflitos de interesse relevantes, se houver;
- versão revisada: `crc-0.5.3-phase6-r1-reconfirmed-draft`;
- conclusão explícita: aprovação integral, parcial ou mudanças requeridas.

Texto sugerido para aprovação integral:

> Eu, **[NOME COMPLETO]**, médico(a) **[ESPECIALIDADE]**, após revisão independente do candidato CCR `crc-0.5.3-phase6-r1-reconfirmed-draft` em **[DATA]**, aprovo integralmente as 43 traduções executáveis como segunda revisão médica (`reviewed_by_2`). Confirmo que revisei os limites de escopo, as três policies, os fluxos FIT+/colonoscopia, história familiar, hard exclusions e as correções R2-01/R2-02. Declaro ser pessoa diferente do revisor R1 e informar eventuais conflitos de interesse. Esta aprovação não autoriza automaticamente ativação, release público ou merge.
