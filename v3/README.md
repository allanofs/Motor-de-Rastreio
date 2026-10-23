# V3 Foundation — Fase 4.1

Biblioteca técnica experimental `3.0.0-alpha.2`, sem conteúdo clínico. A V2 permanece no `index.html` da raiz e não é importada pelo V3.

```sh
cd v3
npm ci
npm run check
```

Node 24 é a referência do CI. O build Vite gera `dist/foundation.js` como biblioteca ES. Não há UI, backend, persistência de pacientes ou publicação.

## Entrada e saída

`evaluatePatient({ patient, asOf, policyId, ruleset, careSetting?, extensions? })` recebe o calendário explicitamente. `asOf` é `{ year, month, day }`; `parseCalendarDate('2026-10-23')` constrói a data completa.

O chamador fornece regras, fontes, políticas e terminologia; nenhum bundle clínico acompanha o pacote. As fixtures são fictícias (`example.invalid`) e seus reviewers são explicitamente fictícios, não uma validação clínica real.

A saída contém `plan.topics[].tracks[]`, `plan.actions[]` e `traces[]`. Cada track tem um único `state` discriminado, actions[], decisionSupport[], agenda, dados ausentes e trace. Tópico não possui pathwayState: agrega resultados, e requiresAttention deriva dos estados sem priorizar gravidade.

Erro local de avaliação gera ComputationError no track e preserva irmãos. Dados inválidos de entrada/conteúdo podem impedir o domínio correspondente. Envelope de controle ou identidade de conteúdo irrecuperáveis, asOf inválido e política inexistente lançam erro explícito da API, sem fallback. A futura UI precisa invalidar resultados antigos nesses casos.

## Fatos do paciente e estados ocultos

Patient contém context, facts, examHistory e historyKnowledge. `ClinicalFact.topicId` é opcional: sem ele, o fato é global do paciente; com ele, é local ao tópico. Regras ativas selecionadas referenciam conceptId e consomem o mesmo fato sem duplicação. Resolver declara conceitos adicionais em requiredConceptIds. Conceitos globais irrelevantes não interferem na avaliação. Se um fato global malformado tiver conceito identificável, só consumidores são invalidados; identidade/escopo irrecuperável causa falha explícita. Exames continuam com tópico obrigatório.

Ausência de campo é não informado; unknown é valor declarado. A engine não os converte em no. `never_performed` também é explícito. IDs são fornecidos pelo chamador e permanecem únicos na sessão; a projeção do mesmo fato em vários domínios não é uma duplicata.

Entrada bruta pode usar `_ui: { enabled: false }` ou `_ui: { answered: false }` em um fato/exame. Esse registro é podado antes de virar evidência. Fato que deixa de ser yes perde details/value; exame que deixa de ser performed perde data/resultado/qualidade antigos. Contexto opcional não respondido pode usar `{ _ui: { answered: false } }`; quando respondido, fornece diretamente seu valor clínico. Flags ambíguas são rejeitadas, sem coerção.

## Histórico e agenda

`resolveDomainHistory()` produz knowledge e events; ambos entram em calculateSchedule. Uma regra dependente de histórico pode declarar:

```ts
noQualifyingEventBehavior: { neverPerformed: 'due' }
```

Isso autoriza Due somente quando o histórico afirma never_performed. Sem essa declaração, a ausência de qualificador é Indeterminate. unknown, not_asked e known sem evento qualificador não viram Due pela falta de eventos. Nenhuma ausência produz Current. Um evento válido conhecido pode sustentar Current, com sua âncora e agenda, independentemente da ordem de digitação.

historyKnowledge permanece por tópico: never_performed significa nenhum exame realizado naquele domínio. Não deve ser usado para representar “nunca fez modalidade X” se há outro exame do domínio. Granularidade adicional exigirá modelagem explícita futura; não há heurística por track.

## Tracks e estratégias

Cada regra declara trackId. Current em A e Due em B, ou revisão em A e Due em B, coexistem e preservam a ação de B. Conflict ocorre dentro da mesma decisão. Ações avaliadas carregam topicId/trackId para manter sua identidade no plano agregado.

`Policy.primaryStrategies` é uma lista de `{ topicId, trackId, strategyGroupId, ruleId }`. Grupos de mesmo nome em tracks distintos não competem. supersedes é DAG e, assim como excludes, deve permanecer no mesmo track. Composição e deduplicação ocorrem nesse escopo. choose_shorter_interval e choose_higher_acuity continuam em revisão, sem fallback mais restritivo.

## Extensões longitudinais

`DomainResolverRegistry` é opcional. Cada registro associa topicId/trackId a função pura, com identidade, versão e conceitos consultados. Entrada tipada é clonada/congelada e não expõe disponibilidade local. A função não pode usar DOM, rede, storage, relógio global nem estado externo. A engine não importa módulos clínicos; o único resolver de sequência está nos testes.

Saída é validada e seleciona IDs de ações/considerações já declaradas. Não pode ultrapassar conflito/revisão obrigatória nem inventar Current sem a evidência genérica existente. Callbacks são código confiável sujeito a revisão; a API não é um sandbox nem executa código recebido em formulários. Registro ausente mantém o comportamento genérico. Trace inclui resolverId/version/trackId.

## Evidência e revisão

SourceRef.evidence preserva gradingSystem, recommendationStrength, evidenceCertainty, rawGrade e gradeVerified (false por padrão), sem equivalências entre sistemas e sem inferir stance de grau.

Regra active exige reviewed_by_1/2 e o número correspondente de revisores distintos, com datas. source_verified sozinho só permite draft. Metadados não comprovam identidade ou revisão médica real; o processo futuro terá de verificá-los. Nenhuma regra clínica real foi ativada.

Regras partially_computable mantêm ClinicalReviewRequired e podem exibir decisionSupport separado de actions e guardrails. Seus itens são apoio à decisão humana, não ordens automáticas. monitoring e surveillance são apenas papéis representáveis no schema.

## Calendário preservado

Datas parciais usam precisão year/month/day e intervalos inclusivos; nenhum dia é inventado. Datas possivelmente futuras ou pré-nascimento exigem esclarecimento. Agenda usa clamp de fim de mês e vence na data calculada. Idade de quem nasceu em 29/02 avança em 01/03 no ano não bissexto. Eventos do mesmo dia não provam ordem intradiária; intervalos sobrepostos e fronteiras ambíguas mantêm abstensão.

## Migração deliberada dos testes e revisão

Os 139 casos anteriores permanecem cobertos. Fixtures agora declaram trackId e revisão explicitamente fictícia; assertions antigas de estado passam a observar o track. A seleção de estratégia ganha escopo explícito. Expected de segurança não foi rebaixado para fazer a suíte passar.

Veja `../docs/v3/REPORT.md`, `FILES.md` e ADRs 004, 005, 007–009. Esta é correção da foundation; a Fase 5 não foi iniciada.
