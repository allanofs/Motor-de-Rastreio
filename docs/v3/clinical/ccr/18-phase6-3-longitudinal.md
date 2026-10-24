# 18 — Fase 6.3: FIT positivo e pathway longitudinal diagnóstico

**Data:** 24/10/2026. **Branch:** `v3-ccr-rules-pilot`. **PR:** #3 (Draft).

## Objetivo

Transformar o eixo `FIT → resultado → colonoscopia → resolução/não resolução` em comportamento executável sem alterar `engine/**` ou `model/**` e sem transformar o Motor em triagem/urgência.

## Resultado

**Gate aprovado.** O ruleset draft sobe para `crc-0.3.0-phase6.3-draft`.

A implementação preserva as decisões clínicas já revisadas:

- data do FIT = coleta/realização; resultado final válido é requisito para qualificação;
- FIT pendente → `PendingResult`; não pedir novo FIT automaticamente;
- FIT inválido/inconclusivo/status desconhecido não equivale a negativo e não reinicia clock;
- FIT positivo → colonoscopia diagnóstica; FIT negativo posterior não encerra o episódio;
- colonoscopia incompleta, preparo inadequado ou resolução insuficiente não fecha FIT+;
- same-day e datas parciais sobrepostas não estabelecem ordem;
- múltiplos FIT+ podem ser resolvidos por colonoscopia posterior clinicamente suficiente, com mapeamento explícito trigger→resolução;
- colonoscopia com pólipo/lesão/câncer sai da automação do piloto → `ClinicalReviewRequired`, salvo `HandedOff` confirmado;
- referral/order/agendamento não contam como `HandedOff`; somente assunção de cuidado explicitamente registrada;
- nenhum deadline universal pós-FIT+ ou pós-colonoscopia inadequada é inventado.

## Divergência pós-colonoscopia normal

### SUS

Uma colonoscopia diagnóstica normal, completa, adequada e suficientemente documentada pode encerrar o episódio de FIT positivo, porém o próximo relógio de rotina **não é automatizado** neste piloto. O track `crc-post-fit-routine` retorna `ClinicalReviewRequired` e a rotina FIT permanece suprimida.

### Brasil ampliado BA-A

Mesma postura conservadora: resolução diagnóstica não vira automaticamente um novo clock FIT/colonoscopia. O próximo passo permanece em revisão clínica/policy até fonte brasileira suficiente.

### Internacional

Com governança USPSTF e suplemento USMSTF, uma colonoscopia diagnóstica pós-FIT normal de alta qualidade estabelece cobertura de 10 anos quando o contexto average-risk continua aplicável. O track `crc-post-fit-routine` usa o scheduler genérico e preserva `Current` apenas quando o próprio engine encontrou a mesma âncora qualificante. Ao completar 10 anos, o track marca `Due`, mas permanece action-neutral; os tracks de policy/estratégia determinam a ação humana selecionada.

## Representação longitudinal

### Modalidades

- `crc-fit`
- `crc-colonoscopy-screening` — colonoscopia primária de rastreamento
- `crc-colonoscopy-diagnostic` — reservada ao pathway diagnóstico pós-FIT quando essa indicação está estabelecida
- `crc-colonoscopy` permanece apenas como modalidade genérica/legada e não resolve automaticamente FIT+.

### Tracks novos

- `crc-fit-positive-followup`
- `crc-post-fit-routine`

### Resolvers

- `crc-fit-positive-followup-phase6.3`
- `crc-post-fit-routine-phase6.3`
- wrappers 6.3 de `routine`, `population`, `fitStrategy` e `colonoscopyStrategy` para impedir ação de rotina concorrente com follow-up.

A registry mantém o invariante Foundation de **um resolver por tópico+track**. O resolver `crc-routine-longitudinal-phase6.3` ramifica por policy para SUS e BA-A em vez de registrar dois resolvers concorrentes.

## Rastreabilidade trigger → resolução

Sem criar campo novo no schema, a relação é preservada deterministicamente em guardrails de trace no formato:

`resolved_fit_trigger:<FIT_ID>:by_colonoscopy:<COLONOSCOPY_ID>`

Os `recordsUsed/recordsConsidered` continuam contendo os eventos reais. Isso permite auditar quais FIT positivos foram resolvidos por qual colonoscopia sem a Foundation fabricar uma nova relação persistida.

## Goldens adicionados

19 testes executáveis cobrem:

1. FIT+ aberto → `InFollowUp` + colonoscopia diagnóstica;
2. ausência de FIT rotineiro concorrente;
3. FIT− posterior não resolve FIT+;
4. múltiplos FIT+ resolvidos por uma colonoscopia posterior;
5. colonoscopia anterior não resolve FIT+ posterior;
6. same-day → `Indeterminate`;
7. preparo inadequado mantém follow-up aberto;
8. colonoscopia incompleta mantém follow-up aberto;
9. resultado de colonoscopia pendente → `PendingResult`;
10. achado não normal → `ClinicalReviewRequired`;
11. `HandedOff` somente quando assunção de cuidado é explícita;
12. FIT+ continua acionável além da faixa etária SUS;
13. FIT pendente não gera FIT duplicado;
14. FIT inválido não vira negativo/Current;
15. SUS pós-colonoscopia normal → investigação resolvida, próximo clock não automatizado;
16. BA-A idem;
17. Internacional pós-colonoscopia normal high-quality → `Current` q10;
18. vencimento q10 no aniversário → `Due`, sem grace period inventado;
19. FIT+ posterior não é escondido por colonoscopia normal anterior.

## CI

Execução de push do commit `955f1bd96b89551093d9ec614a5935a38b13ae32`: workflow `40115106824`.

- typecheck: ✅
- schema checks: ✅ 62/62
- suíte total: ✅ **307/307**
- `tests/ccr/longitudinal.test.ts`: ✅ **19/19**
- build: ✅
- V2 byte-for-byte: ✅

Distribuição clínica acumulada no gate:

- Foundation original: 242 testes preservados;
- Fase 6.0: 17;
- Fase 6.1: 15;
- Fase 6.2: 14;
- Fase 6.3: 19;
- demais testes Foundation/infra continuam na contagem total de 307.

## Fronteiras preservadas

- `v3/src/engine/**`: **0 mudanças** nesta fase;
- `v3/src/model/**`: **0 mudanças** nesta fase;
- nenhuma regra clínica promovida a `active`;
- regras continuam `draft/source_verified`;
- nenhum merge;
- PR #3 permanece Draft.

## Próximo gate

**Fase 6.4 — história familiar e risco especial limitado.**

Objetivo: implementar o complemento ACG somente na policy Internacional, manter SUS/BA-A em `ClinicalReviewRequired` para história familiar positiva relevante, preservar história familiar desconhecida como informação incompleta sem apagar a indicação mínima por idade e impedir importação silenciosa de algoritmos internacionais entre policies.
