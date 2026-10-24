# 27 — Pacote para segunda revisão médica independente (R2) — piloto CCR

**Candidato revisado:** `crc-0.5.3-phase6-r1-reconfirmed-draft`  
**Snapshot após R2:** `crc-0.5.4-phase6-r2-reviewed-draft`  
**Branch:** `v3-ccr-rules-pilot`  
**PR:** #3 — Draft  
**Status:** R2 concluída sob governança de identidade preservada; 43/43 regras `reviewed_by_2`; todas permanecem `lifecycleStatus=draft`; nenhuma regra ativa; sem release público.

> **Privacidade do revisor:** a identidade civil/profissional do médico R2 não é armazenada no repositório público. O responsável do projeto atesta que a revisão foi realizada por médico real, distinto do R1, e aprovada integralmente. O ruleset usa apenas o handle público não pessoal `external-physician-r2-private-001`. Ver `29-phase6-r2-private-review-governance.md`.

---

## 1. Para que serviu esta revisão

Este projeto é um motor de apoio à decisão para rastreamento preventivo. O primeiro módulo clínico executável é câncer colorretal (CCR).

A segunda revisão médica independente respondeu à pergunta:

> **As decisões clínicas que o candidato executa são corretas, seguras, compatíveis com as fontes declaradas e adequadamente limitadas ao escopo de rastreamento preventivo?**

O código, traces e testes permaneceram disponíveis para auditoria aprofundada, mas a revisão clínica foi estruturada para priorizar conteúdo clínico, limites de escopo, fontes e situações de abstensão/revisão.

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

## 3. As três policies revisadas

### A. SUS / Brasil oficial

- rotina populacional para assintomáticos de **50 a 75 anos inclusive**;
- **FIT bienal** como estratégia nuclear;
- fonte normativa atual para faixa/intervalo: **Portaria SAES/MS nº 5.215/2026**;
- FIT positivo abre investigação por colonoscopia;
- FIT negativo posterior não encerra FIT positivo anterior;
- colonoscopia incompleta, preparo inadequado ou informação insuficiente não fecha o episódio;
- colonoscopia posterior normal, completa e adequada pode encerrar o episódio diagnóstico;
- o próximo relógio de rotina SUS após FIT+ → colonoscopia normal **não é automaticamente inventado** neste piloto;
- a partir de 76 anos não se inicia nova rotina populacional, mas follow-up diagnóstico já aberto permanece válido;
- história familiar positiva relevante e condições especiais saem da automação average-risk para revisão clínica.

### B. Brasil ampliado BA-A

- <45 anos: sem rotina average-risk automática;
- 45–49: `SharedDecision`;
- 50–75: FIT q2 como apresentação padrão;
- colonoscopia primária q10 como alternativa elegível;
- estratégia é escolhida por humano, não pelo motor;
- >75: individualização/revisão;
- história familiar positiva relevante não recebe automaticamente algoritmo ACG;
- follow-up de FIT+ usa postura brasileira conservadora.

### C. Internacional

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

## 4. História familiar — complemento ACG na policy Internacional

- **1 FDR com CCR/pólipo avançado <60 anos** OU **≥2 FDR em qualquer idade**: colonoscopia aos 40 anos ou 10 anos antes do diagnóstico do familiar mais jovem, o que ocorrer primeiro; repetir a cada 5 anos.
- **1 FDR ≥60 anos**: iniciar aos 40 anos ou 10 anos antes do diagnóstico; depois seguir estratégias/intervalos de risco habitual; sem q5 universal.
- **1 SDR isolado**: pode seguir average-risk se não houver outro modificador.
- história incompleta, padrão complexo, pólipo de tipo desconhecido ou suspeita hereditária: informação faltante ou `ClinicalReviewRequired`, não inferência agressiva.
- SUS e BA-A não importam silenciosamente esse algoritmo.

---

## 5. Hard exclusions / risco especial

As seguintes situações saem da rotina average-risk para revisão explícita:

- CCR prévio;
- pólipo/adenoma relevante em surveillance;
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
   +-- FIT negativo posterior ---------------------> continua aberto
   +-- colonoscopia anterior ao FIT+ --------------> não resolve
   +-- mesma data/ordem não demonstrável ----------> Indeterminate
   +-- colonoscopia incompleta/preparo inadequado -> continua aberto
   +-- resultado da colonoscopia pendente ---------> PendingResult
   +-- pólipo/lesão/câncer ------------------------> ClinicalReviewRequired
   +-- colonoscopia posterior normal,
       completa, adequada e suficiente ------------> episódio resolvido
```

Um novo FIT+ depois de episódio previamente resolvido abre novo follow-up. FIT+ continua acionável mesmo se a pessoa já tiver ultrapassado a faixa etária de nova rotina populacional.

---

## 7. Situações de segurança revisadas explicitamente

1. FIT+ seguido de FIT− — o positivo continua aberto.
2. Colonoscopia normal antes do FIT+ — não resolve gatilho posterior.
3. FIT+ e colonoscopia na mesma data, sem ordem demonstrável — não assumir posterioridade.
4. Data parcial — não inventar dia nem ordem.
5. FIT inválido — não equivale a negativo.
6. `historyKnowledge=unknown` — não equivale a `never_performed`.
7. Colonoscopia válida + escolha futura por FIT — cobertura vigente não é apagada.
8. FIT+ aberto — nenhuma ação rotineira redundante.
9. História familiar desconhecida — não é tratada como negativa.
10. CRC/pólipo/DII/hereditário — revisão explícita.
11. Recurso indisponível — muda rota operacional, não ciência.
12. Mesmos fatos/eventos em ordem diferente — mesma interpretação clínica.

O manifesto completo permanece em `12-adversarial-cases.md`.

---

## 8. Correções pré-R2 confirmadas

### R2-01 — Grade USPSTF

Grade A/B/C pertence à recomendação populacional por faixa etária. FIT anual e colonoscopia q10 permanecem estratégias elegíveis, sem graduação A/B individual da modalidade.

### R2-02 — provenance SUS

`B12` foi reconciliada como Protocolo OCI, 2ª edição 2025, diagnóstico/especializado. A faixa 50–75 e periodicidade bienal do FIT SUS são ancoradas na Portaria SAES/MS nº 5.215/2026. A página profissional do INCA é usada em roteamentos conservadores de história familiar/risco especial quando apropriado.

---

## 9. Fontes centrais do candidato

### Brasil / SUS

- Portaria SAES/MS nº 5.215/2026 — FIT de rastreamento, 50–75, bienal.
- INCA — página profissional CCR para contexto de risco e encaminhamento conservador.
- Protocolo OCI Oncologia, 2ª edição 2025 — somente em locators compatíveis com caráter diagnóstico/especializado.

### Brasil ampliado

- Diretrizes SBOC 2026 — Cólon, prevenção/rastreamento.

### Internacional

- USPSTF 2021 — governança populacional e opções de screening.
- ACG 2021 — história familiar selecionada.
- USMSTF 2017 — FIT positivo e colonoscopia subsequente.
- USMSTF 2020 — intervalo após colonoscopia normal high-quality.

Metadados completos: `v3/src/clinical/ccr/r2Sources.ts`.

---

## 10. Resultado da R2

**APROVAÇÃO INTEGRAL das 43 traduções executáveis.**

A promoção de governança é registrada no snapshot:

`crc-0.5.4-phase6-r2-reviewed-draft`

O registro público do segundo revisor é `external-physician-r2-private-001`, sob atestação do responsável do projeto conforme `29-phase6-r2-private-review-governance.md`.

A aprovação integral autoriza `reviewed_by_2`, mas **não** autoriza automaticamente:

```text
reviewed_by_2 != active
reviewed_by_2 != release público
reviewed_by_2 != uso clínico real
reviewed_by_2 != merge
```

A próxima etapa é um gate separado de **activation/readiness**.
