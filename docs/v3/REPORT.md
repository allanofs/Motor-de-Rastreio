# Relatório — V3 Foundation, execução limitada às fases 0–4

Data: 23/10/2026. PR: [#1 — V3 foundation](https://github.com/allanofs/Motor-de-Rastreio/pull/1), em rascunho, sem merge.

## A. Resumo executivo

Existe agora um recipiente técnico isolado para futuras regras médicas: calendário explícito, schemas validados, avaliação reproduzível, múltiplos resultados por domínio, plano e trace em memória. O código distingue desconhecimento, informação não fornecida, revisão clínica, conflito e falha técnica. Nenhuma regra médica foi adicionada.

A V2 foi preservada byte a byte. A implementação foi interrompida no limite da FASE 4. Pesquisa e conteúdo clínico de CCR, políticas clínicas, golden patients clínicos e interface clínica não foram iniciados.

## B. Status

| Item | Status nesta execução | Evidência / limite |
|---|---|---|
| Inspeção | COMPLETO | INSPECTION.md; clone limpo; base V2 identificada |
| Foundation | COMPLETO | /v3 independente; stack e lockfile próprios |
| Temporal | COMPLETO | 32 testes de calendário |
| Modelos | COMPLETO | Schemas estritos e tipos inferidos |
| Engine genérica | COMPLETO no subconjunto seguro | Pipeline, estratégias, ações, agenda, trace e isolamento |
| Comparadores clínicos de composição | PARCIAL, deliberadamente em abstensão | Menor intervalo/maior gravidade dependem de semântica não definida pela P0 |
| CCR | FORA DO ESCOPO DESTA RODADA | Nenhuma fonte, regra, política ou golden patient clínico |
| UI | FORA DO ESCOPO DESTA RODADA | Vite gera biblioteca; nenhum formulário clínico |
| Testes | COMPLETO | 137 passaram; zero falhas finais |
| CI | PASSOU local e remoto no commit de código | Run 39973266172; último commit nos checks da PR |
| PR | COMPLETO | #1 aberta em rascunho; sem merge |

“Completo” acima não significa pronto para uso clínico nem implementação das fases posteriores do contrato mestre.

## C. Branch e commits

Branch remota: `v3-foundation-technical`, baseada em `7a6555373c05fa02f26f594bb8666364130ef2f2` (`V2`).

| Commit remoto | Conteúdo |
|---|---|
| `e71fca22dfb8b10b6a595e8c86312932c93cd0a2` | Foundation isolada, calendário, schemas e verificações de conteúdo |
| `e8d4bd630af2dbc1851d4eed04592e011f0b2960` | Engine determinística, isolamento, invariantes e documentação de uso |
| Commit documental posterior, no histórico da PR | Este relatório, inspeção, inventário e oito ADRs |

O terminal permitiu clone/fetch, mas não push autenticado. Os dois commits foram enviados pela conexão GitHub. O checkout local foi alinhado à branch remota após verificar igualdade exata das árvores. Os checkpoints locais originais foram preservados na branch local `v3-foundation-technical-local`; não são os SHAs da PR.

## D. Arquivos e preservação da V2

Inventário completo: [FILES.md](FILES.md).

| Local | Responsabilidade |
|---|---|
| `v3/package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `.gitignore` | Dependências, comandos, strict, build isolado |
| `v3/src/model/` | Schemas e tipos de calendário, paciente, fatos, exames, conteúdo e avaliação |
| `v3/src/engine/` | Etapas independentes do pipeline |
| `v3/src/index.ts` | API pública da biblioteca |
| `v3/tests/` | Fixtures técnicas, testes temporais, schemas, integridade, engine e arquitetura |
| `v3/README.md` | Contrato de entrada/saída e limites técnicos |
| `.github/workflows/v3-foundation.yml` | CI sem deploy |
| `docs/v3/` | Inspeção, relatório, inventário e ADRs |

Todos são arquivos novos em relação à base V2. Nenhum arquivo preexistente foi alterado. `index.html` conserva o blob Git `e40c75c5c877c00a94c932cdbe5bd33a5afa71b9` (122.933 bytes). A `main` permanece na base original; nenhum merge, deploy, force push ou alteração de configuração de Pages foi feito.

## E. Schemas implementados

| Schema / tipo | Garantia principal |
|---|---|
| CalendarDate / PartialCalendarDate / DateInterval / CalendarDuration | Calendário gregoriano válido; precisão explícita; intervalo não invertido; duração positiva |
| PatientContext | Idade inteira opcional; nascimento opcional; anatomia explícita; contexto funcional opcional |
| ClinicalFact | ID, conceito, tópico, categoria, presença explícita, data/status/origem opcionais; detalhes só em presença yes |
| ExamRecord | Coleção multievento; status discriminado; resultado final/pendente/desconhecido/inválido; qualidade, completude e informação resolutiva |
| Patient | Contexto + fatos + exames + conhecimento explícito do histórico por domínio |
| Source / SourceRef | Instituição, documento, versão, jurisdição, status, URL HTTP(S), verificação, locator e graduação opcional |
| RuleDefinition | Stance, computability, critérios, exclusões, requisitos de dados, ações, qualificador, agenda, composição, governança, lifecycle e review separados |
| Policy | Seleção explícita de domínios, regras e estratégias; famílias representáveis sem instanciar políticas clínicas |
| CareSettingContext | Recursos independentes do paciente; disponibilidade ausente = unknown |
| PathwayState | Union discriminada com os 11 estados previstos; Current exige âncora |
| TopicEvaluation | Completeness, estado, regras ativas/suprimidas, actions[], dados ausentes, guardrails, agenda e trace |
| DecisionTrace | Versões, política, asOf, IDs consultados, regras, fontes + locators, etapas, issues e saídas |
| ConsultationPlan | Topics[], ações compatíveis e sinalizador de atenção |
| Ruleset | Versão própria reunindo regras, fontes, políticas e terminologia; sem policyVersion separada |

Os schemas não atestam validade médica do conteúdo declarado: revisão de fontes e interpretação pertence à fase clínica futura. Todas as estruturas clínicas efetivamente instanciadas nesta entrega estão apenas nos testes e são fictícias.

## F. Pipeline implementado

| Etapa | Implementação | Comportamento |
|---|---|---|
| 1. Sanitize/prune | sanitize.ts | Clona entrada; remove registros ocultos/não respondidos e subcampos obsoletos |
| 2. Schema validation | input.ts, validate.ts | Fronteiras estritas; sem coerção; validação local por tópico |
| 3. Semantic validation | validate.ts | Duplicatas, contradições, idade/nascimento, datas futuras e pré-nascimento |
| 4. Normalize | derive.ts | Ordenação de calendário e desempate técnico por ID; não muda precisão |
| 5. Derive context | derive.ts | Deriva idade somente de nascimento completo, quando não fornecida |
| 6. Resolve history | resolveHistory.ts | Histórico múltiplo; desconhecido/nunca/não informado; filtro de qualificação e ordem conservadora |
| 7. Evaluate rules | evaluateRules.ts | Critérios, exclusões, requiredKnownFacts, lifecycle e dados ausentes |
| 8. Strategies/supersedes | resolveStrategies.ts | Coexistência; grupos exclusivos; escolha curada; substituição explícita |
| 9. Compose actions | composeActions.ts | Combina ações compatíveis; conserva suporte; detecta contradições; operação local separada |
| 10. Schedule | schedule.ts | Âncora válida; aniversário; ambiguidade temporal; nenhuma rotina Current sem evidência |
| 11. TopicEvaluation[] | evaluatePatient.ts | Estado discriminado, completude e validação da saída |
| 12. Plan | buildPlan.ts | Agrega domínios e ações sem apagar erros locais |
| 13. Trace | trace.ts | Registro determinístico, em memória, sem log e sem persistência |

`safeEvaluate.ts` envolve cada avaliação e transforma exceções em `ComputationError`, sem ações, stack, mensagem original ou valores clínicos em logs. Validação malformada de um fato/regra que possui domínio identificável fica naquele domínio. Eventos com datas inválidas também não contaminam os demais domínios.

Erros de envelope compartilhado sem identidade confiável, ausência/invalidade de `asOf` e política inexistente são erros explícitos da API. Não há fallback nem conversão para “nada a fazer”. A futura UI deverá capturá-los e invalidar resultados antigos. Erros em dados compartilhados (por exemplo idade malformada) podem afetar todos os domínios que usam o mesmo paciente.

## G. Modelo temporal e decisões conservadoras

- `asOf` é obrigatório e completo; nenhuma decisão consulta o relógio global.
- Ano/mês não se transformam em um dia escolhido: representam intervalos inclusivos.
- Current: `asOf < minDueDate`; Due: `asOf >= maxDueDate`; entre os dois: Indeterminate.
- Duração de calendário aplica clamp de fim de mês, inclusive 29/02 → 28/02 ao somar um ano.
- Idade de nascimento em 29/02 avança em 01/03 em ano não bissexto. Esta convenção não define automaticamente aniversário de agenda.
- Data histórica possivelmente futura ou anterior ao nascimento exige esclarecimento; não há truncamento silencioso do intervalo.
- Não se presume que eventos no mesmo dia tenham uma ordem intradiária conhecida.
- Quando não é possível estabelecer qual exame qualificador é o mais recente por causa de intervalos sobrepostos, a engine se abstém, mesmo que isso gere pedido de informação conservador.
- Agenda rotineira está restrita a outcome Due; ela não pode transformar outro pathway, como InFollowUp, em Current por acidente de configuração. O fechamento clínico de follow-up ainda não foi implementado.

## H. Testes e resultados finais

Verificação reprodutível: `cd v3 && npm ci && npm run check`.

| Categoria / arquivo | Total | Passaram | Falharam |
|---|---:|---:|---:|
| Calendário — dates.test.ts | 32 | 32 | 0 |
| Schemas — schemas.test.ts | 22 | 22 | 0 |
| Integridade de conteúdo — content.test.ts | 10 | 10 | 0 |
| Engine e invariantes — engine.test.ts | 70 | 70 | 0 |
| Fronteiras de arquitetura — architecture.test.ts | 3 | 3 | 0 |
| **Total** | **137** | **137** | **0** |

Typecheck strict: passou. Schema check: 32 testes passaram (subconjunto do total, não testes adicionais). Build Vite: passou, biblioteca ES de aproximadamente 154,65 kB (38,70 kB gzip). `git diff --check`: passou. Não foi produzido pacote clínico publicável.

Os testes incluem datas impossíveis, bissextos, mês/ano, datas futuras, pré-nascimento, limites de calendário, um dia antes/no dia/depois do vencimento, limite etário puramente sintético, múltiplos eventos e ordenação incerta. A aritmética de meses é exercitada em todos os meses entre 1990 e 2090.

Propriedades são verificadas por permutações exaustivas pequenas, normalização idempotente e repetição com relógio global alterado. Não foi adicionada dependência de property testing. Há testes de inputs imutáveis, ghosts, unknown, Current sem âncora, qualificação por resultado/qualidade/completude, DAG, fontes não finais, incompatibilidade de ações, disponibilidade, falha controlada e preservação de domínios saudáveis.

Falhas encontradas durante desenvolvimento foram corrigidas: projeção da data de nascimento para cálculo de idade; isolamento de referência a regra malformada; critério com valor ausente tratado como informação insuficiente. Um teste de fronteira inicialmente confundia variável local `window` com o navegador e foi corrigido para verificar acesso à API. Não houve mudança de expected clínico, pois não há testes clínicos.

## I. Invariantes do contrato

| Invariante P0 | Status |
|---|---|
| INV-01 unknown não vira no | PASSOU |
| INV-02 sem evento válido nunca Current | PASSOU |
| INV-03/04 persistência de FIT positivo sem resolução | ADIADO: requer regras clínicas CCR, proibidas nesta execução |
| INV-05 resolução exige evento posterior | Primitivo genérico de ordem estrita testado; integração clínica adiada |
| INV-06 exame inadequado não qualifica quando qualidade é requisito | PASSOU com modalidade fictícia; sem colonoscopia clínica |
| INV-07 regra suprimida não emite ação | PASSOU |
| INV-08 fonte draft/withdrawn não sustenta regra ativa | PASSOU; bloqueio inclui preliminary/superseded |
| INV-09 erro local não apaga plano inteiro | PASSOU para exceção, conteúdo e registro malformados identificáveis por domínio |
| INV-10 determinismo com mesma entrada/asOf/política/ruleset | PASSOU |
| INV-11 ordem de entrada dos eventos não altera resultado | PASSOU com seis permutações completas; inclui trace |
| INV-12 campos podados não influenciam engine | PASSOU |

## J. CI

Workflow novo: `.github/workflows/v3-foundation.yml`.

Executa em PRs e pushes de branches `v3-*`, limitado a mudanças em V3/documentação/workflow. Usa Node 24 e `npm ci`; roda typecheck, schema check, testes, build e compara o blob da V2 com a base inspecionada. Permissão somente `contents: read`, sem passos de deploy ou upload de dados clínicos. Não altera o mecanismo existente de Pages.

O CI remoto do commit de código `e8d4bd630af2dbc1851d4eed04592e011f0b2960` passou, incluindo todas as etapas e preservação da V2: [run 39973266172](https://github.com/allanofs/Motor-de-Rastreio/actions/runs/39973266172). Os checks da [PR #1](https://github.com/allanofs/Motor-de-Rastreio/pull/1/checks) são a referência do último commit; o relatório não presume que configuração do workflow equivale a sucesso remoto. A instalação limpa e todos os comandos do workflow passaram localmente.

## K. ADRs

1. ADR-001: TypeScript, schemas estritos e pacote isolado.
2. ADR-002: estado derivado em memória, histórico multievento e sem persistência.
3. ADR-003: calendário parcial, intervalos e convenções explícitas.
4. ADR-004: resultado discriminado e isolamento por domínio.
5. ADR-005: estratégias, DAG e composição conservadora.
6. ADR-006: recursos separados da recomendação científica.
7. ADR-007: abstensão, governança e limites da automação.
8. ADR-008: escopo desta execução limitado às fases 0–4.

Cada ADR contém Context, Decision, Consequences e Alternatives rejected.

## L. Fontes, regras clínicas e golden patients

Fontes clínicas pesquisadas: **nenhuma**, por determinação expressa. Regras clínicas implementadas: **nenhuma**. Políticas clínicas implementadas: **nenhuma**. Golden patients clínicos: **nenhum**. O documento clínico anexo não foi promovido a bundle nem usado para copiar regras da V2.

Apenas fixtures técnicas em `v3/tests/fixtures.ts`, rotuladas como fictícias, usam `https://example.invalid/technical`. Elas não são exportadas pelo entrypoint, não são fontes médicas e não certificam correção clínica.

## M. Desvios em relação à P0

| Decisão | Motivo | Impacto |
|---|---|---|
| Parar após fase 4, sem conteúdo CCR nem UI | Limitação expressa desta execução prevalece sobre o contrato mestre | Entrega técnica; fases 5+ não executadas |
| Build Vite em modo biblioteca ES, sem index.html V3 | UI foi excluída desta rodada | API testável sem navegador; futura UI pode consumir a biblioteca |
| Separar schemas por coesão, em seis módulos, em vez da árvore ilustrativa integral | O contrato admite estrutura equivalente e menos fragmentada | Mesmos conceitos, menos arquivos vazios |
| Comparadores de menor intervalo/maior gravidade permanecem em revisão | P0 fornece nomes, sem semântica clínica suficiente | Não automatizados; nenhum desempate universal inventado |
| Acrescentar entrada explícita historyKnowledge | Exigência de distinguir nunca, desconhecido e não respondido | Não equivale a persistência nem episódio |

Não houve redesenho da arquitetura fundamental. As escolhas não determinadas pela P0 estão expostas abaixo e nos ADRs, sem tratar a implementação como aprovação médica.

## N. BLOCKERS / decisões que precisam de revisão humana

| Problema | Impacto | Base consultada | Opções / recomendação | Status |
|---|---|---|---|---|
| Semântica dos comparadores choose_shorter_interval / choose_higher_acuity | Ativá-los retorna ClinicalReviewRequired | Contrato, §§42–43; ADR-005 | Definir comparador explícito por conjunto clínico, com fonte e testes, antes de habilitar | PENDENTE; não bloqueia foundation |
| Um único pathwayState por domínio diante de ações compatíveis com estados diferentes | Current + Due em regras independentes fica Conflict, com abstensão | Contrato, §§28–30 e 39–43 | Revisar como o conteúdo declarará composição ou precedência; não mudar silenciosamente para múltiplos eixos/estados | OBJEÇÃO À P0 REGISTRADA; antes da clínica |
| Aniversários em 29/02, fim de mês e data parcial cruzando asOf | Pode mudar classificação em fronteiras | Contrato temporal; ADR-003; sem fontes clínicas pesquisadas | Revisar convenções ao selecionar fontes; manter abstensão onde faltar precisão | CONVENÇÕES TÉCNICAS explícitas, revisão clínica futura |
| Ordenação de eventos do mesmo dia ou parcialmente sobrepostos | Não é possível afirmar resolução posterior | Contrato cronológico; ADR-003 | Pedir maior precisão ou usar revisão; não inferir pela ordem de digitação | ABSTENSÃO IMPLEMENTADA |
| Critérios genéricos ainda não representam todas as dependências futuras de histórico ou estado clínico | Pathway de CCR precisará de funções puras específicas após pesquisa | Limite desta rodada; §§23–26 e fase 5 | Implementar somente o necessário depois de revisar as fontes; não usar predicados atuais como linguagem clínica universal | FUTURO, não implementado |
| Fonte declarada final não significa fonte realmente verificada | Schema/CI não substituem pesquisa e revisão médica | Contrato, §§45–49 e 95 | Auditoria humana/documental antes de criar conteúdo real; revisão técnica não conta como revisão médica | BLOQUEIA uso clínico, não foundation |
| Erro de envelope global da API precisa ser tratado pela futura UI | Evitar exibir resultado anterior após entrada inválida | Contrato, §78; README | Capturar exceção de entrada, invalidar saída antiga e exibir mensagem segura | FUTURO, UI fora do escopo |
| Origem administrativa do Pages não pôde ser lida | Inspeção não confirma branch/diretório de publicação | Metadata pública has_pages=true; endpoint Pages público 404 | Verificar configuração antes de qualquer futuro deploy; nesta rodada nenhum deploy foi tentado | NÃO BLOQUEIA esta PR |

## O. Dependências

| Dependência direta | Versão fixada | Motivo |
|---|---|---|
| zod | 4.6.7 | Schemas e validação em runtime |
| typescript | 7.0.2 | Compilação e typecheck strict |
| vite | 8.3.5 | Build isolado da biblioteca |
| vitest | 5.0.5 | Testes técnicos |
| @types/node | 26.6.5 | Tipos das APIs Node usadas apenas em configuração/testes |

Todas fixadas no package.json e package-lock. TypeScript, Vite, Vitest e tipos Node são devDependencies. A única dependência de runtime é Zod. Prettier foi usado pontualmente para formatar os arquivos V3; não foi adicionado ao projeto. Sem framework de UI, biblioteca temporal, backend ou dependência de persistência.

## P. Privacidade e encerramento

Dados de paciente persistidos: **não**. Dados de paciente na URL: **não**. Logs clínicos: **não**. Analytics/telemetria de produto: **não**. Rede ou armazenamento na engine: **não**. Dados de teste: exclusivamente sintéticos.

A PR é um artefato de revisão técnica da foundation. Não constitui release experimental clínico ou release público clínico. Sem aprovação clínica inferida dos testes. Trabalho encerrado após fase 4 e entrega de documentação/PR; sem merge e sem publicação.
