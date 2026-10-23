# Relatório — V3 Foundation, Fase 4.1

Data: 23/10/2026. Branch: `v3-foundation-technical`. [PR #1](https://github.com/allanofs/Motor-de-Rastreio/pull/1) existente, em rascunho, sem merge. Engine/pacote: `3.0.0-alpha.2`.

## 1. Escopo e resultado

Esta rodada implementa exclusivamente o anexo “Fase 4.1 — correções arquiteturais antes do piloto CCR”. A foundation anterior está no commit base `826f849f218e5441eacd13a5278e84110614fb58`. Nenhuma nova branch foi criada nesta execução; todas as alterações continuam na mesma PR.

A arquitetura agora permite fatos globais do paciente, tracks independentes dentro de um tópico, conhecimento do histórico no scheduler, extensão longitudinal tipada, evidência por proposição, revisão mínima da interpretação e apoio estruturado para regras parcialmente computáveis. O núcleo genérico continua sem conteúdo clínico.

Não foram iniciadas pesquisa de CCR, regras/políticas clínicas, FIT ou colonoscopia clínicos, fontes médicas, golden patients clínicos, UI, outros domínios reais, backend ou persistência. Não houve merge nem deploy.

## 2. Correções implementadas

| Solicitação | Implementação | Evidência técnica |
|---|---|---|
| Fato transversal | ClinicalFact.topicId tornou-se opcional; ausência significa fato global do paciente. Regras selecionadas consultam conceptId; escopo local continua explícito quando necessário | Um único shared-risk=yes satisfaz dois tópicos sem duplicação e com o mesmo ID no trace |
| Isolamento de fato global inválido | Roteamento identifica conceito e consumidores antes da validação local; dependências de regras ativas selecionadas e resolvers usados são explícitas | Malformação afeta consumidores A/B e preserva C; conceito irrecuperável falha explicitamente |
| historyKnowledge no scheduler | calculateSchedule recebe DomainHistory completo, incluindo knowledge e events | never_performed, unknown, not_asked e known sem qualificador têm casos separados |
| Ausência de qualificador | RuleDefinition.noQualifyingEventBehavior.neverPerformed autoriza due somente por declaração; comportamento ausente/indeterminate mantém abstensão | never_performed só gera Due com autorização; unknown/not_asked nunca geram Due pela ausência de eventos |
| Tracks independentes | RuleDefinition.trackId; TopicEvaluation.tracks[]; TrackEvaluation.state é union discriminada única por decisão | Current+Due e revisão+Due preservam ambos, com ação do track devido |
| Estratégias no escopo correto | Policy.primaryStrategies[] declara tópico/track/grupo/regra; seleção, supersedes e composição são locais ao track | Mesmo nome de grupo pode ter escolhas independentes; substituição cruzada é erro de conteúdo |
| Extensão longitudinal | DomainResolverRegistry explícito e opcional; inputs tipados clonados/congelados; resultado validado; identidade/versão no trace | Resolver técnico resolve sequência, é determinístico e sua exceção não apaga irmão ou outro domínio |
| Metadados de evidência | SourceRef.evidence preserva gradingSystem, recommendationStrength, evidenceCertainty, rawGrade e gradeVerified | Sistemas fictícios distintos e grau bruto mantidos sem conversão; stance continua explícito |
| Governança ativa | Active exige reviewed_by_1/2 e ao menos 1/2 revisores distintos com reviewedAt | source_verified active é rejeitado; source_verified draft é permitido; revisão alegada sem registros é rejeitada |
| clinicalRole | monitoring e surveillance acrescentados, preservando os papéis anteriores | Testes apenas de representabilidade em schema; nenhuma regra clínica desses papéis |
| Suporte parcial | decisionSupport[] contém considerações com IDs de regras, separado de actions/guardrails | Track parcial mantém ClinicalReviewRequired, sem ação automática; outro track pode emitir sua ação |
| Conservadorismo temporal/composição | Comparadores de menor intervalo/maior gravidade continuam em revisão; primitivas temporais não mudaram | Mesmo dia, sobreposição de datas e fronteira ambígua continuam em abstensão |

## 3. Modelo atual

| Estrutura | Responsabilidade |
|---|---|
| Patient | Contexto, fatos do paciente, exames e conhecimento explícito de histórico por tópico |
| ClinicalFact | conceptId global reutilizável; topicId opcional para restringir um fato local; nenhuma duplicação obrigatória |
| ExamRecord | Mantém tópico obrigatório, múltiplos eventos, status, data parcial, resultado e qualidade |
| RuleDefinition | trackId obrigatório; critérios, postura, computabilidade, qualificação, agenda, comportamento declarativo sem qualificador e considerações |
| Policy | Seleções de estratégia em lista com escopo explícito, sem chaves concatenadas ambíguas |
| TrackEvaluation | Um state discriminado, ações, regras, dados ausentes, decisionSupport, guardrails, agenda, completude e trace |
| TopicEvaluation | Tracks e agregados derivados. Não há pathwayState único ou summaryState clínico prioritário |
| ConsultationPlan | Agrega ações com identidade tópico/track e deriva requiresAttention sem ordenar gravidade |
| SourceRef.evidence | Grau original e metadados da proposição, independentes de stance e sem escala comum |
| governance.reviews | Registros mínimos de revisão alegada, com revisor distinto e data; não equivalem a verificação humana automática |
| DomainResolver | Função síncrona pura, versão, tópico, track e conceitos adicionais explicitamente declarados |

O input do paciente permanece intacto: “projeção para consumidores” ocorre apenas nas estruturas em memória da avaliação, não por replicação dos fatos enviados ou persistência. Um mesmo ID global projetado em dois domínios não é contado como duplicata de sessão.

## 4. Pipeline e falhas seguras

1. Podar registros ocultos e valores condicionais obsoletos; identificar escopo/conceito.
2. Validar o envelope compartilhado e projetar fatos para os domínios consumidores.
3. Validar schemas e semântica temporal/contradições por domínio.
4. Normalizar calendário e derivar contexto sem relógio global.
5. Resolver histórico incluindo knowledge e events.
6. Avaliar critérios e exclusões por track.
7. Resolver estratégias e supersedes no mesmo track; verificar DAG e integridade de conteúdo.
8. Compor ações compatíveis do track e calcular agenda com âncora positiva.
9. Quando explicitamente registrado e permitido, invocar resolver longitudinal puro.
10. Validar TrackEvaluation; falha técnica retorna ComputationError naquele track.
11. Agregar tracks em TopicEvaluation sem apagar ações independentes.
12. Agregar o plano e gerar trace com versões, fontes/locators/evidência e identidade da extensão.

Falha de entrada/conteúdo identificável por domínio continua explícita e pode bloquear aquele domínio. Falha de avaliação/resolver pode ser isolada ainda mais, ao track. Erro de envelope irrecuperável, política desconhecida ou registry ambíguo é erro da API, sem fallback. Não há lista vazia interpretável como “nada a fazer” em lugar de um erro.

Trace por track preserva ordem das etapas; trace do tópico agrega etapas na ordem do pipeline, sem inventar uma prioridade clínica entre estados. As saídas são identificadas por track.

## 5. Contrato da extensão longitudinal

O registro informa resolverId, version, topicId, trackId, requiredConceptIds e resolve(). Não há importação de módulo clínico pela engine, if por nome de doença, mini-CQL ou execução de texto de regras.

A função recebe paciente normalizado, histórico, regras, política, asOf e resultado genérico em estruturas tipadas, clonadas e profundamente congeladas. O snapshot não contém disponibilidade operacional do serviço. Deve ser determinística, sem DOM, rede, storage, relógio global ou estado externo. A ausência do registro mantém a avaliação genérica.

O resultado passa por schema. Pode selecionar apenas IDs de ações e considerações declaradas pelas regras ativas. Não ultrapassa critérios obrigatórios ausentes, Conflict, ClinicalReviewRequired ou comparadores em abstensão. Não fabrica Current: essa conclusão só pode preservar uma âncora já sustentada pela qualificação/agenda genérica. Exceções não expõem mensagens originais, stack ou dados sensíveis.

Essa interface é para código confiável e revisado do aplicativo. TypeScript e freeze não demonstram pureza de uma função arbitrária nem oferecem sandbox de efeitos colaterais. O callback não é fornecido por formulário, paciente ou conteúdo JSON. Revisão, testes e versionamento do código da extensão continuam obrigatórios. Nesta entrega, apenas o resolver fictício de teste existe; nenhum resolver clínico foi criado ou registrado em produção.

## 6. Testes e adaptação semântica

Os 139 testes anteriores permanecem semanticamente cobertos e passando. Não houve remoção de caso ou rebaixamento de expected para acomodar falha.

Adaptações deliberadas:

- Assertions antigas de um único estado passam a observar o track correspondente; o teste de Current sem evidência permanece no TrackEvaluation.
- Teste de saída completa valida também o TopicEvaluation agregado.
- Fixtures declaram trackId, seleção de estratégia com escopo e revisão explicitamente fictícia. Isso não registra revisão médica real.
- O antigo conflito entre estados diferentes permanece testado dentro do mesmo track; novos casos cobrem a coexistência entre tracks independentes.
- Regras apenas source_verified continuam representáveis como draft; novos testes rejeitam sua ativação. Essa é uma mudança solicitada de governança, não uma promoção silenciosa de conteúdo.
- Bundle técnico das fixtures passou para technical-fixture-2. Engine/pacote passaram a 3.0.0-alpha.2; não houve alteração de versão de dependências ou criação de policyVersion.

| Arquivo / categoria | Total | Passaram | Falharam |
|---|---:|---:|---:|
| dates.test.ts — calendário preservado | 32 | 32 | 0 |
| schemas.test.ts — schemas anteriores | 24 | 24 | 0 |
| content.test.ts — integridade anterior | 10 | 10 | 0 |
| engine.test.ts — invariantes anteriores adaptados aos tracks | 70 | 70 | 0 |
| architecture.test.ts — fronteiras e dependências | 3 | 3 | 0 |
| foundation41.test.ts — novos requisitos e regressões | 64 | 64 | 0 |
| **Total** | **203** | **203** | **0** |

Comandos finais exigidos: `cd v3 && npm ci && npm run check`. Check executa typecheck, schema checks, suíte completa e build Vite. Instalação limpa concluída: npm ci e todas as etapas do check passaram localmente, com 203 testes e build ES de 165,52 kB (41,12 kB gzip). O CI remoto é conferido antes da entrega; os [checks da PR #1](https://github.com/allanofs/Motor-de-Rastreio/pull/1/checks) são a referência do último commit.

Os novos testes cobrem: fato global compartilhado e isolado por conceito, unknown e ghosts, duplicatas reais versus projeção única, conhecimento do histórico no scheduler, ausência de Current sem evidência, tracks em estados distintos, estratégia curada inelegível sem fallback, grupos homônimos em tracks diferentes, callbacks com input imutável, sequência fictícia determinística, erros isolados, ação inventada rejeitada, metadados originais de evidência, revisão mínima e suporte parcial sem autoação.

## 7. Invariantes preservadas

- V2 byte a byte: blob `e40c75c5c877c00a94c932cdbe5bd33a5afa71b9`, 122.933 bytes; main permanece na base V2 `7a6555373c05fa02f26f594bb8666364130ef2f2`.
- /v3 independente; TypeScript strict, Zod, Vite e Vitest preservados.
- asOf obrigatório; sem Date/relógio global dentro da engine.
- Datas parciais, bissextos, intervalos, clamp e aniversários preservados; nenhuma heurística nova para ambiguidades.
- unknown nunca se converte em no; not_asked não vira relato de desconhecimento.
- Nenhum Current sem evento qualificador e evidência positiva. Resolver não contorna essa invariante.
- Nenhuma ação de regra suprimida ou de track em abstensão é emitida.
- Comparadores não definidos permanecem em revisão; não existe mergeMostRestrictive.
- Fonte draft/preliminary/withdrawn/superseded não sustenta regra ativa.
- Revisão clínica não é inferida de fonte verificada nem de testes verdes.
- Nenhuma equivalência entre sistemas de evidência e nenhuma inferência numérica de stance.
- Dados de pacientes, plano e trace permanecem apenas em memória; sem logs clínicos, rede, armazenamento, URL clínica ou analytics de produto.

INV-03/04 do contrato mestre, relativos a FIT positivo clínico, continuam adiados por determinação expressa. Ordem estrita genérica de eventos está testada; isso não equivale à validação de um pathway médico.

## 8. Documentação e arquivos

Inventário integral e arquivos alterados nesta rodada: [FILES.md](FILES.md). O código novo está em `v3/src/engine/facts.ts`, `extensions.ts` e `v3/tests/foundation41.test.ts`.

ADRs 004, 005 e 007 foram substituídos por suas decisões atuais. ADR-008 foi atualizado para registrar o limite da Fase 4.1 na mesma branch/PR. ADR-009 foi acrescentado porque o registry longitudinal introduz um contrato novo de execução e confiança que precisa ser registrado separadamente. ADRs temporais e inspeção original permanecem válidos. README apresenta a API atual e a migração deliberada dos fixtures.

A mudança de forma de saída e das seleções de estratégia é incompatível com a API alpha anterior, mas não afeta a V2: não há migração silenciosa de dados ou conteúdo clínico a preservar no V3.

## 9. P0, decisões e desvios

| Mudança | Base de autorização | Impacto |
|---|---|---|
| Fatos do paciente com escopo local opcional | Anexo Fase 4.1, §2 | Corrige duplicação transversal; sem mudar fato do paciente no input |
| Tracks independentes em lugar de estado único | Anexo Fase 4.1, §4 | Corrige a objeção à P0 registrada na primeira rodada; não é redesenho silencioso |
| Estratégias com escopo tópico/track | Necessário para cumprir §4 | Não há vencedor global nem conflito entre tracks independentes |
| Extensão longitudinal formal | Anexo Fase 4.1, §5 | Interface pura registrada, sem medicina ou mini-linguagem |
| Evidência e revisão mínima | Anexo Fase 4.1, §§6–7 | Proposição preserva grau original; source_verified deixa de autorizar active |
| Suporte parcial e novos papéis | Anexo Fase 4.1, §§8–9 | Representabilidade e considerações estruturadas, sem criar regras clínicas |

Nenhum desvio não autorizado da P0 foi introduzido. Os pontos da P0 explicitamente corrigidos nesta rodada substituem as decisões antigas nos ADRs. Não houve expansão para a Fase 5.

## 10. Blockers e limites restantes

| Ponto | Situação / impacto | Encaminhamento |
|---|---|---|
| choose_shorter_interval / choose_higher_acuity | Permanecem em ClinicalReviewRequired; não bloqueiam a foundation | Só habilitar com semântica clínica específica, fonte e revisão futura |
| Mesmo dia, datas sobrepostas e fronteira ambígua | Abstensão preservada, inclusive no resolver técnico | Não inferir ordem ou precisão; esclarecer/revisar quando necessário |
| Revisores reais e fontes clínicas | Nenhum conteúdo clínico foi ativado; fixtures são explicitamente fictícias | Verificação documental e humana será necessária antes de medicina real |
| Pureza de extensions | Contrato para código confiável, não sandbox de JavaScript arbitrário | Revisão/testes/versionamento antes de registrar extensão clínica; nada de código de usuário |
| historyKnowledge é por tópico | never_performed é uma declaração sobre o domínio inteiro, não apenas uma modalidade/track | Se granularidade maior se tornar necessária, modelá-la explicitamente com evidência; não inferir nesta rodada |
| Current longitudinal sem agenda genérica | Extensão atual não pode fabricar evidência ou novo Current | Preservar garantia de qualificação; qualquer ampliação futura deve declarar evidência verificável |
| Configuração administrativa de Pages | Não obtida na inspeção anterior; publicação não foi alterada | Confirmar origem administrativa somente antes de um futuro deploy autorizado |
| UI futura e erros de envelope | UI não implementada; API lança erro explícito quando não há contexto confiável | Capturar e invalidar resultado antigo ao implementar interface, sem fallback silencioso |

Não há blocker técnico aberto para os requisitos da Fase 4.1; as limitações acima restringem conteúdos e capacidades futuras, que não foram antecipados.

## 11. Dependências, CI e privacidade

Dependências preservadas: zod 4.6.7; typescript 7.0.2; vite 8.3.5; vitest 5.0.5; @types/node 26.6.5. Apenas a versão do pacote/engine mudou. Única dependência de runtime: Zod. Nenhum framework, biblioteca temporal, armazenamento, backend ou sistema de persistência foi adicionado.

Workflow existente da V3 foi preservado: Node 24, npm ci, typecheck, schema checks, testes, build e comparação do blob da V2. Sem deploy e com contents:read. Resultados finais remoto/local e commits novos são entregues junto com este relatório e constam no histórico da PR; um workflow configurado não é confundido com um workflow aprovado.

Os registros de reviewers e as referências de evidência usados em teste são sintéticos. Nenhum nome real foi apresentado como revisor médico. Não existe aprovação clínica inferida de metadados ou CI. As únicas alterações externas autorizadas são commits na branch existente e atualização da PR #1 em rascunho.

**Encerramento obrigatório: Fase 4.1. Sem Fase 5, merge ou publicação.**
