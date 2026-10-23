# Relatório — V3 Foundation, Fase 4.2 final

Data: 23/10/2026. Branch existente: `v3-foundation-technical`. [PR #1](https://github.com/allanofs/Motor-de-Rastreio/pull/1) existente, em rascunho. Engine/pacote: `3.0.0-alpha.3`. Base desta rodada: `084e00e5167d8a6262c08793a83796a24b409775` (Fase 4.1). O relatório anterior permanece no histórico desse commit.

## 1. Resultado e limite

Esta rodada corrige exclusivamente isolamento runtime entre políticas e precisão da evidência no DecisionTrace. Nenhuma branch foi criada; não houve merge, publicação, pesquisa de CCR, conteúdo clínico, backend ou persistência. Encerramento obrigatório na Fase 4.2; Fase 5 não iniciada.

Conteúdo inválido de política não selecionada não contamina runtime da política ativa, embora possa continuar sendo detectado pela validação global/CI.

Fatos globais, tracks independentes, historyKnowledge, noQualifyingEventBehavior, estratégias, supersedes, DomainResolver, stance, computability, evidence metadata, governança, decisionSupport, CareSettingContext, calendário e safe failure mantêm os contratos da Fase 4.1. As fixtures SUS/internacional são aliases técnicos fictícios, sem diretrizes ou políticas médicas.

## 2. Isolamento e validação global

| Camada | Responsabilidade |
|---|---|
| parseContent | Recupera ruleId/topicId antes de validar o corpo; seleciona política ativa e policy.ruleIds; projeta fontes referenciadas por essas regras |
| contentIssues | Integridade das regras selecionadas no tópico corrente: fontes, revisão, estratégias, referências participantes e grafo |
| validateBundle(unknown) | Auditoria global de schemas, duplicatas e referências, inclusive regras órfãs, draft e políticas não selecionadas |
| assertValidBundle(unknown) | Rejeita qualquer issue global e retorna Ruleset validado; ponto de integração do futuro pipeline de conteúdo |
| schema:check / CI | Exercita schemas e contrato global com fixtures técnicas; não existe bundle clínico nesta entrega |

Regra com ID recuperável não selecionado é descartada antes de validar seu corpo. Fonte com ID conhecido e sem consumidores selecionados também é descartada. Política estrangeira com ID recuperável não é validada no runtime da política ativa.

Se ruleId não puder ser recuperado, tópico comprovadamente externo permite demonstrar irrelevância. Identidade insuficiente para essa demonstração invalida os tópicos consumidores possíveis, sem fallback. Fonte anônima invalida seus consumidores possíveis. Identidade de política irrecuperável ou duplicata da política ativa produz erro explícito da API; não se escolhe uma definição arbitrária.

Fontes inválidas selecionadas continuam produzindo ComputationError no domínio correspondente. Dentro da política ativa, fonte inválida de tópico B não contamina tópico A. IDs ativos duplicados continuam inválidos. Duplicatas exclusivamente estrangeiras são detectadas globalmente, sem contaminar runtime.

Declarações supersedes/excludes com alvo não selecionado não participam da composição runtime. Referências selecionadas preservam validação de tópico/track e DAG. A auditoria global continua detectando referências quebradas e ciclos, inclusive em conteúdo não selecionado.

## 3. Pipeline runtime

1. Validar envelope compartilhado e identificar a política ativa sem fallback.
2. Recuperar identidade mínima e projetar regras/fontes da política.
3. Podar ghosts, projetar fatos globais por consumidores e validar paciente/domínio.
4. Validar integridade de conteúdo relevante ao tópico.
5. Normalizar calendário, derivar contexto e resolver histórico com knowledge/events.
6. Avaliar critérios por track, registrando somente os fatos realmente consultados.
7. Resolver estratégias/supersedes e compor ações preservando a semântica anterior.
8. Calcular agenda; distinguir eventos considerados de âncoras usadas.
9. Invocar extensão registrada quando permitida; validar estado, ações e evidência declarada.
10. Aplicar safe failure por track/domínio e agregar plano/trace deterministicamente.

Falhas de envelope/identidade sem contexto confiável continuam explícitas na API. Falhas de conteúdo localizadas impedem o domínio; falhas de saída do resolver impedem somente seu track. Nenhuma falha vira resultado vazio indistinguível de “nada a fazer”.

## 4. Nova semântica do trace e contrato do resolver

| Campo | Significado |
|---|---|
| factsUsed[] | Fatos efetivamente consultados por population, exclusões e requiredKnownFacts; respeita short-circuit, inclui consultas que sustentam supressão/abstenção |
| recordsUsed[] | Evidência de registros usada na conclusão: âncoras de agenda genérica ou IDs declarados explicitamente pelo resolver |
| recordsConsidered[] | Eventos inspecionados por cálculo dependente de histórico, sem alegar que todos foram causais |
| DomainResolution.evidenceRecordIds[] | Declaração explícita do resolver; omissão normalizada para [] |

Ter eventos disponíveis no histórico não os adiciona a factsUsed nem, por si só, a recordsUsed. Cálculo genérico que usa somente B como âncora declara B; A e C podem permanecer apenas considerados. Regra independente de histórico não infla nenhuma das coleções de registros.

Cada evidenceRecordId deve existir entre os fatos e eventos do snapshot entregue ao resolver. Registro na entrada bruta, porém fora desse snapshot, é rejeitado. IDs inexistentes produzem ComputationError do track, sem ações e sem recordsUsed residuais.

Se o resolver substituir a conclusão genérica, recordsUsed passa a refletir sua declaração explícita; não herda causalidade de âncora abandonada. Se preservar Current, a âncora genérica validada permanece obrigatoriamente em recordsUsed, mesmo sem declaração redundante. factsUsed continua registrando as consultas genéricas que realmente ocorreram.

Listas são únicas e ordenadas. O tópico agrega os traces dos tracks. A validação demonstra existência/pertença ao snapshot; não prova causalidade clínica nem completude da declaração de código arbitrário. Resolver continua sendo código confiável, sujeito a revisão, versionamento e contrato de pureza; freeze não é sandbox.

## 5. Testes e resultados

| Suíte | Testes |
|---|---:|
| dates.test.ts | 32 |
| schemas.test.ts | 24 |
| content.test.ts | 10 |
| engine.test.ts | 70 |
| architecture.test.ts | 3 |
| foundation41.test.ts | 64 |
| policyIsolation.test.ts (nova) | 28 |
| traceEvidence.test.ts (nova) | 11 |
| **Total** | **242** |

Os 203 casos anteriores permanecem semanticamente cobertos e passando; 39 casos foram adicionados. Nenhum teste anterior foi removido. Dois testes de integridade de bundle (ciclo e referência quebrada) passaram de contentIssues para validateBundle: a mesma violação continua rejeitada pela auditoria global, mas não deve contaminar uma política que não seleciona aquelas regras. Não houve relaxamento de expected. O resolver técnico anterior passou a declarar explicitamente a evidência da sequência fictícia.

| Obrigatório | Resultado verificado |
|---|---|
| POL-01 | Regra internacional estruturalmente inválida não altera SUS |
| POL-02 | Selecionar essa mesma regra produz ComputationError |
| POL-03 | Fonte inválida exclusivamente estrangeira não altera SUS |
| POL-04 | Fonte inválida selecionada produz ComputationError |
| POL-05 | Draft/experimental não selecionada não altera output |
| POL-06 | Adição/remoção de regras não selecionadas preserva output completo normalizado, incluindo traces |
| TRACE-01 | A/B/C disponíveis; só B é evidência de âncora |
| TRACE-02 | Resolver declara A+C; trace registra A+C como usados |
| TRACE-03 | Evidência inexistente provoca ComputationError do track |
| TRACE-04 | Todas as seis permutações de A/B/C preservam output/trace; agenda genérica também é testada |

Coberturas adicionais: quatro categorias de contentIssues estrangeiras, identidade mínima/malformada, duplicatas ativas versus estrangeiras, políticas inválidas estrangeiras, isolamento entre tópicos, auditoria de órfãs/draft, registro fora do snapshot, deduplicação, Current preservado, substituição da conclusão genérica e short-circuit de fatos.

## 6. Execução e CI

O ambiente de terminal desta execução não iniciou (exec-server indisponível). Por isso, não se afirma execução local. Código, commits e revisão foram realizados na branch existente; a instalação limpa e os checks foram executados pelo GitHub Actions.

Primeira verificação remota do commit de código `f134fe1ae111ea3612798b42b71e50145c78b48d`: [run 39989932730](https://github.com/allanofs/Motor-de-Rastreio/actions/runs/39989932730), sucesso. Logs confirmam npm ci, typecheck, schema:check (62 casos), suíte completa (242/242), build Vite e hash da V2. Build ES: 170,21 kB / gzip 42,27 kB; instalação reportou zero vulnerabilidades.

O workflow agora executa literalmente `npm ci` e `npm run check` (typecheck → schema:check → testes → build), sem duplicar as etapas. Mantém Node 24, contents:read e comparação byte a byte da V2. Não há job de deploy. A confirmação do último commit é feita antes da entrega; [checks da PR #1](https://github.com/allanofs/Motor-de-Rastreio/pull/1/checks) são a referência corrente.

## 7. Arquivos, commits e ADRs

[FILES.md](FILES.md) contém inventário completo e os 20 arquivos desta rodada (18 modificados, 2 novos). Mudanças principais: input/validateContent, evaluateRules/evaluatePatient, extensions, trace/safeEvaluate, schema de avaliação e duas suítes novas. Pacote/engine passaram a alpha.3; versões das dependências foram preservadas.

Commit de implementação: `f134fe1ae111ea3612798b42b71e50145c78b48d`. A documentação/CI é entregue em commit posterior na mesma branch, identificável no histórico da PR e no relatório final; não há SHA autorreferente neste arquivo.

Somente ADRs pertinentes foram atualizados:
- ADR-005: projeção runtime de política versus auditoria global; referências participantes.
- ADR-009: evidência explícita do resolver, pertença ao snapshot e semântica das coleções do trace.

Não foi criado ADR adicional. README documenta API e responsabilidade do futuro pipeline de conteúdo.

## 8. Preservação, P0 e limites

V2 permanece no blob `e40c75c5c877c00a94c932cdbe5bd33a5afa71b9`; a base main é `7a6555373c05fa02f26f594bb8666364130ef2f2`. Não houve modificação de main, merge, publicação ou persistência de pacientes. O build gera uma biblioteca ES isolada em /v3.

Não foi introduzido redesenho não autorizado da P0. As únicas mudanças de contrato são as solicitadas na Fase 4.2: separação da validação global/runtime e evidência explícita no trace/resolver. O schema de trace agora exige recordsUsed/recordsConsidered; consumidores alpha precisam incorporar os campos. A omissão de evidenceRecordIds é compatível com callbacks anteriores, normalizada para [].

| Limite / revisão humana futura | Situação |
|---|---|
| semanticIssues por track | Não alterado; granularidade atual por domínio preservada |
| historyKnowledge por modalidade | Não alterado; permanece por tópico |
| Mesmo dia, datas sobrepostas e precisão ambígua | Abstensão/calendário preservados; nenhuma ordenação clínica nova |
| choose_shorter_interval / choose_higher_acuity | Continuam em ClinicalReviewRequired |
| Pureza/completude da declaração de evidência do resolver | Contrato de código confiável; exige revisão humana e testes antes de uso clínico |
| Bundle clínico e processo real de release | Inexistentes nesta entrega; futuro CI de conteúdo deve chamar assertValidBundle sobre os bundles reais |
| UI, clinical diff, CCR, PWA, persistência | Fora do escopo; não iniciados |

Não há blocker técnico identificado nos requisitos da Fase 4.2 após a suíte remota aprovada. A indisponibilidade do terminal impediu checks locais, compensados pela execução remota verificável; não foi ocultada nem tratada como teste executado.

**Parada: Fase 4.2. Sem Fase 5, merge ou publicação.**
