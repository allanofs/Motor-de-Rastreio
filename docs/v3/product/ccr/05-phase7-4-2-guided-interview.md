# Fase 7.4.2 — entrevista guiada

Data: 24/10/2026. Branch exclusiva: `v3-ccr-product-integration`. PR #4 — Draft.
HEAD inicial confirmado: `e28f3d387c1329e8daf54b08e2d43d3436c71a9f`.

## Resultado

A UI apresenta uma unidade de aquisição atual, etapas concluídas compactas com resumo e edição explícita, e oculta etapas futuras. Não há stepper fixo nem lista antecipada de etapas possíveis. O roteamento de aquisição da Fase 7.4.1 é reutilizado. Os pedidos adaptativos continuam vindo exclusivamente de `presentCcrProduct(...).requestedInputs`: `strategy_selection`, `fit_availability` e `colonoscopy_availability`.

O Motor decide a necessidade clínica e devolve estados, ações e pedidos. A UI organiza sua apresentação. Esta fase não altera engine, model, regras, normalizador, adaptador ou contrato de apresentação do produto.

## Etapas compactas e edição

Cada seção elegível mantém seu conteúdo, um resumo de respostas e um botão Editar. A apresentação recolhida usa um contêiner interno `step-body`; não muda a elegibilidade da seção nem descarta respostas só porque seu conteúdo está recolhido. Isso preserva a coleta do draft existente.

Conclusão de aquisição significa respostas preenchidas, não conclusão clínica. Datas/idade não fecham a seção durante a digitação: o avanço automático ocorre após a confirmação por change. Na edição explícita, o bloco permanece aberto até Concluir edição, permitindo corrigir vários campos sem perder foco. Um campo que continua pendente mantém a unidade atual aberta. O botão de terminar exames encerra apenas o registro da UI; não afirma que o histórico é suficiente, completo ou normal e não exige inventar exame.

O mesmo caminho de invalidação da Fase 7.4.1 continua descartando pedidos adaptativos anteriores quando seus dados de origem mudam. A UI não introduz critérios clínicos para validar respostas posteriores. Após mudança, o resultado visível e os cards técnicos anteriores são removidos; uma nova avaliação consulta o Motor. Etapas que deixam de ser elegíveis seguem as mesmas regras de omissão do draft já existentes.

## Escolhas acessíveis

Controles pequenos de respostas usam radios nativos dentro de fieldset/legend, com labels envolvendo cada input. Preservam os valores semânticos originais, inclusive `yes`, `no`, `unknown` e a ausência inicial `not_asked` (sem seleção visual). Não há valor negativo presumido.

A transformação inclui contexto, condições especiais, história familiar, suficiência do histórico, estratégia e disponibilidade. Em exames, inclui status, preparo, completude e suficiência para resolução. Selects permanecem para conjuntos maiores ou especializados: referencial, conhecimento do histórico, faixas e achados familiares, papel e resultados dos exames.

A seleção tem radio marcado, borda reforçada e peso de texto, além da cor. Foco de teclado permanece visível. Tab/Shift+Tab e setas/Space usam o comportamento nativo de radio, sem emular seleção por código. Os testes DOM verificam valores, clique, agrupamento, ausência de seleção inicial e foco programático; não certificam o comportamento padrão de um navegador ou leitor de tela real.

O foco acompanha a nova unidade quando uma resposta recolhe a unidade que continha o foco. Editar foca os controles reabertos; Concluir edição retorna à aquisição pendente ou ao botão de avaliação. Os fluxos de adicionar/remover exame e resultados continuam cobertos. Enter durante aquisição incompleta mantém a coleta pendente; não fabrica erro clínico nem abstensão.

## Painel de síntese

Durante coleta, o painel mostra avaliação em andamento, Até aqui e próxima informação. Os resumos usam respostas das unidades elegíveis; dados de etapas inativas não aparecem como conclusão atual.

Após avaliação, o painel prioriza uma síntese baseada somente nos estados/pedidos já devolvidos e apresenta as ações governadas. Há distinção explícita entre:

- informação pendente;
- escolha de estratégia solicitada;
- disponibilidade de FIT ou colonoscopia solicitada;
- conflito/falha segura;
- revisão clínica efetivamente devolvida;
- decisão compartilhada;
- conclusão e acompanhamento.

`EvaluatedAction.text` continua em `textContent`, verbatim. Não há tradução clínica nem troca de discutir/considerar por solicitar. A rota operacional é separada. Ações idênticas são apresentadas uma vez na síntese, sem remover sua rastreabilidade nos cards originais. Não se agravam estados de coleta em revisão clínica.

Uma orientação pode coexistir com revisão clínica em outro caminho devolvido pelo Motor. Exemplo observado nos testes: SUS 60 anos, história familiar negativa, FIT devido e disponibilidade informada ainda retornam `ClinicalReviewRequired` no track familiar. A UI conserva a orientação e a revisão real; não corrige regras nem elimina essa revisão por suposição de irrelevância. Em cenários com revisão real e informação faltante simultâneas, ambas são sinalizadas. Esse comportamento pré-existente pode exigir discussão clínica futura, fora desta fase.

Os cards completos, resumos técnicos originais (inclusive inglês), status, guardrails, faltas e fontes permanecem em **Detalhes técnicos**, fechado por padrão. Ruleset e versão ficam nesse disclosure. Um disclosure de estados de acompanhamento também está disponível na síntese, sem expor todos os domínios internos como cards principais. Erros de normalização/controle têm explicação em português e diagnóstico original recolhido.

`asOf` só permanece como nome de contrato no código, não no rótulo da interface. Microcopy de vigilância e rastreamento de rotina está em português. A superfície principal não mostra os resumos técnicos crus do Motor; o texto clínico governado não é reescrito, mesmo que uma futura versão precise de revisão de linguagem.

## Rolagem

Foi removido `overflow: auto` e o limite de altura do painel. Ele acompanha o fluxo normal, sem sticky nem scrollbar independente. CSS define uma etapa atual destacada, etapas completas secundárias e adapta escolhas/resumos a telas estreitas. Esta é implementação de layout, não aprovação visual em navegador.

## Arquivos alterados

1. `v3/pilot/ccr/index.html` — superfície de síntese e disclosure técnico; rótulos.
2. `v3/pilot/ccr/main.ts` — controles de escolha, apresentação das etapas, resumos, edição/foco, síntese e invalidação de saída.
3. `v3/pilot/ccr/styles.css` — hierarquia atual/concluído/futuro, radios e remoção de rolagem interna.
4. `v3/tests/ccr/pilotUiInteraction.test.js` — 13 novos testes; atualização de duas expectativas de interação (foco em radio em vez de select e Enter com aquisição incompleta permanece pendente).
5. Este relatório.

Nenhuma dependência nova. Nenhuma persistência, rede, analytics ou logging de paciente foi adicionada. O armazenamento continua exclusivamente em memória; testes de privacidade existentes passam.

## Testes e gate

Gate inicial: `npm ci` e `npm run check`, 521/521 testes, 33/33 arquivos, 62/62 schema checks; dois typechecks e dois builds verdes.

Gate final: **534/534 testes**, **33/33 arquivos**, **62/62 schema checks**; Foundation typecheck verde, pilot typecheck verde, Foundation build verde, pilot build verde. Os 13 novos testes cobrem compactação/resumos/edição, etapa atual e futuras, radios e ausência de negativo presumido, foco ao avançar, digitação/edição sem recolhimento prematuro, conclusão do registro sem exame fictício, separação de pendência/escolha/revisão, disponibilidade adaptativa, disclosure/rastreabilidade e ações verbatim, invalidação após edição, ausência de inglês técnico na superfície, rolagem e fronteira de arquitetura. Os testes prévios de strategy/fit/colonoscopy requests e cenários clínicos permanecem passando.

V2 preservada byte-for-byte: blob `e40c75c5c877c00a94c932cdbe5bd33a5afa71b9`. Diff contra o HEAD inicial vazio em `v3/src/engine/**`, `v3/src/model/**`, `v3/src/clinical/ccr/**` e `index.html`. `git diff --check` passou. Release warning, noindex e gate de integração preservados.

## Limitações e encerramento

Validação desta fase por typecheck, testes DOM e build. Não se afirma inspeção visual, teclado real, leitor de tela, responsividade renderizada ou inspeção de rede/storage em execução. A Fase 7.5 não foi iniciada nesta rodada, conforme instrução. O registro anterior de bloqueio da auditoria real não é tratado como resolvido por estes testes.

PR #4 permanece Draft. Sem merge, deploy, publicação do site ou alteração de main. HEAD final entregue na descrição da PR e na resposta, sem SHA autorreferente neste documento.
