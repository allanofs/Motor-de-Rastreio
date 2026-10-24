# 17 — Fase 6.2: estratégias executáveis e cobertura atual

**Data:** 24/10/2026. **Branch:** `v3-ccr-rules-pilot`. **PR:** #3 (Draft).

## Objetivo

Transformar a decisão humana FIT ↔ colonoscopia em contrato executável sem permitir que a escolha futura apague cobertura válida existente e sem alterar `engine/**` ou `model/**`.

## Decisões de implementação

1. a estratégia escolhida é registrada como fato explícito `crc-screening-strategy-selection` com valor `fit` ou `colonoscopy`;
2. `Policy.primaryStrategies` permanece vazio nas policies com escolha concorrente — a policy não se passa pelo humano;
3. a suficiência do histórico para decidir o estado atual é explícita em `crc-history-sufficient-current-status`; ausência de eventos não vira automaticamente ausência de cobertura;
4. FIT e colonoscopia primária possuem tracks próprios;
5. um resolver puro coordena cobertura cruzada: se qualquer modalidade aprovada ainda estiver `Current`, a outra não emite ação redundante;
6. o resolver preserva `Current` apenas quando o scheduler genérico já encontrou a evidência qualificadora; ele nunca fabrica `Current`;
7. colonoscopia primária de screening (`crc-colonoscopy-screening`) é semanticamente distinta de colonoscopia diagnóstica pós-FIT+ (`crc-colonoscopy-diagnostic`).

## Policies

### SUS

Permanece FIT-only nesta etapa. A Fase 6.2 não introduz escolha de colonoscopia primária na policy SUS.

### Brasil ampliado BA-A

50–75:
- Motor identifica quando uma nova rodada precisa de estratégia;
- FIT é o default de apresentação, mas a seleção deve ser humana/explicitada;
- FIT selecionado → intervalo de 2 anos;
- colonoscopia primária selecionada → intervalo de 10 anos;
- cobertura válida da modalidade anterior continua valendo após troca de preferência.

### Internacional

45–75:
- USPSTF continua governando elegibilidade/grade;
- piloto oferece somente FIT anual ou colonoscopia primária a cada 10 anos;
- escolha é humana;
- Grade B é preservado em 45–49 e Grade A em 50–75 nas rules específicas de estratégia.

76–85 continua `SharedDecision`; >85 continua fora da rotina populacional. A Fase 6.2 não expande modalidades nesses grupos.

## Guardrail de histórico

Quando não há cobertura atual registrada e a pessoa já possui algum histórico de rastreamento, o Motor não presume que a ausência de um evento de determinada modalidade significa “nunca fez”. Para emitir `Due` após troca de estratégia, exige:

- `historyKnowledge=never_performed`, **ou**
- confirmação profissional de que o histórico é suficiente para definir o status atual.

Isso operacionaliza a decisão clínica aprovada de que o histórico precisa ser suficiente para a decisão, não exaustivo por toda a vida.

## Colonoscopia primária versus diagnóstica

A regra q10 desta etapa só aceita `crc-colonoscopy-screening`. Uma colonoscopia diagnóstica após FIT+ não entra automaticamente como anchor BA-A de 10 anos.

A policy Internacional poderá, na etapa longitudinal, reconhecer uma colonoscopia diagnóstica normal high-quality como novo intervalo de 10 anos quando as condições USMSTF estiverem satisfeitas. Essa conversão deliberadamente não é antecipada aqui.

## Artefatos

- `rules/strategies.ts` — choice gate e rules FIT/colonoscopia por policy;
- `resolvers/strategyCoverage.ts` — coordenação de escolha e cobertura cruzada;
- `strategies.test.ts` — testes de escolha explícita, troca de modalidade, isolamento de policy e distinção screening/diagnóstico;
- ruleset draft sobe para `crc-0.2.0-phase6.2-draft`.

## Gate de saída

A Fase 6.2 só passa se:

- nenhuma policy escolher silenciosamente FIT versus colonoscopia;
- colonoscopia atual impedir FIT redundante mesmo após mudança de preferência;
- FIT atual impedir colonoscopia redundante;
- BA-A manter FIT q2 e Internacional FIT q1 para o mesmo histórico;
- colonoscopia primária normal high-quality permanecer q10;
- colonoscopia diagnóstica não ser tratada como BA-A primária;
- história insuficiente gerar `Indeterminate`, não `Due` por presunção;
- todas as rules continuarem `draft/source_verified`;
- `npm run check` e preservação V2 permanecerem verdes;
- zero mudança em `engine/**` e `model/**`.

**Status do gate:** implementação aplicada na linha da PR no commit `fe5a57b9ee21523ed15d3fd316d21d0521dde51a`; CI ainda precisa validar a tradução antes de encerrar a subfase.

A próxima etapa após este gate é Fase 6.3: FIT+ e resolver longitudinal diagnóstico.
