# Mama — M3.1 under-40 scope + safety precedence

Status: **draft/source-verified; aguardando gate humano próprio**.

Base: `v3-mama-rules-draft` (M3 R2 reviewed draft congelado).

## Por que a M3.1 existe

O snapshot M3 R2 possui 15 regras clinicamente revisadas, mas o cenário de pessoa assintomática de risco habitual com idade <40 terminava no engine como `NotApplicable` apenas porque nenhuma regra etária ativa se aplicava. Isso preservava segurança, mas não fornecia provenance explícita para explicar por que a rotina não se aplicava.

M3.1 resolve esse gap **sem reescrever as 15 regras R2 e sem fabricar um stance universal**.

## Decisão arquitetural

Não foi criada uma regra `recommend_against` universal para <40.

Motivo:

- SUS/INCA: a orientação atual permite afirmar que <40 está fora do rastreamento rotineiro e que, fora das faixas recomendadas, o balanço risco-benefício é desfavorável;
- CBR/SBM/FEBRASGO: a diretriz de 2023 afirma explicitamente que rastreamento não é recomendado abaixo de 40 no risco habitual, preservando estratégias diferenciadas em alto risco;
- USPSTF: a recomendação aplica-se a pessoas de risco habitual com 40 anos ou mais; ela **não emite uma recomendação formal contra <40**.

Forçar as três policies para `recommend_against` perderia fidelidade ao documento USPSTF.

Por isso M3.1 cria um artefato de **routine age scope + provenance** no domínio Mama:

- SUS: `routine_not_recommended`;
- Brasil ampliado: `routine_not_recommended`;
- USPSTF: `outside_recommendation_scope`.

O engine continua produzindo `NotApplicable` na rotina average-risk <40 por ausência de regra etária aplicável; o artefato M3.1 fornece a provenance e a nuance normativa que a futura camada de Boundary/relatório deverá consumir.

## Arquivos

- `v3/src/clinical/mama/m3_1Evidence.ts`
- `v3/src/clinical/mama/under40Scope.ts`
- `v3/src/clinical/mama/decisionSemantics.ts`
- `v3/src/clinical/mama/inputContracts.ts`
- `v3/tests/mama/m3_1Under40.test.ts`

## Evidência adicionada

### SUS / Brasil oficial

Fonte: INCA/MS atual + Nota Técnica 626/2025.

Tradução M3.1: pessoa assintomática de risco habitual <40 fica fora da rotina mamográfica; isso **não** encerra sintomas ou alto risco.

### Brasil ampliado

Fonte: CBR/SBM/FEBRASGO 2023, p. 210.

A diretriz declara que rastreamento não é recomendado abaixo de 40 no risco habitual e, separadamente, descreve estratégias precoces para alto risco.

### USPSTF

Fonte: USPSTF 2024 Clinician Summary.

A recomendação aplica-se a pessoas de risco habitual com 40 anos ou mais. M3.1 registra <40 como `outside_recommendation_scope`, não como `recommend_against` e não como I statement.

## Invariant de segurança — hard exits antes do corte etário

O futuro Boundary Mama deve tratar a segurança nesta ordem conceitual:

1. sintoma/alto risco/cuidado específico/achado não resolvido;
2. somente se nenhum hard exit existir, aplicar a conclusão etária da rotina.

Golden cases M3.1 exigem que idade 35 + qualquer um dos seguintes continue produzindo hard exit no engine:

- sintomas suspeitos;
- alto risco genético conhecido;
- alto risco familiar já estabelecido;
- radioterapia torácica de alto risco.

A conclusão de idade <40 nunca pode apagar esses estados.

## SharedDecision — nuance Mama-specific

M3.1 registra reason codes no domínio Mama, sem alterar Foundation:

- SUS 40–49 e 75+: `outside-population-core-access-on-demand`;
- Brasil ampliado 75+: `continuation-conditioned-on-health-horizon`.

A abstração não é promovida para Foundation porque ainda não foi demonstrada em um segundo domínio independente.

## Contrato de alto risco familiar

`breast-known-high-risk-familial-context = yes` significa alto risco familiar **já estabelecido externamente**.

Não pode ser inferido automaticamente por:

- qualquer história familiar positiva;
- um único familiar de primeiro grau pós-menopausa sem outros elementos;
- heurísticas da UI;
- reconstrução parcial de Gail, Tyrer-Cuzick ou BOADICEA.

## Governança

M3.1 é uma tradução clínica nova e **não herda automaticamente** o `reviewed_by_2` do snapshot M3 R2.

Os artefatos M3.1 permanecem:

- lifecycle lógico: `draft`;
- review status: `source_verified`;
- não ativos;
- sem autorização de produto/UI/relatório/merge/deploy/uso clínico.

Antes de activation readiness, M3.1 precisa de gate humano próprio.

## Não objetivos

- não alterar Foundation/engine/model;
- não alterar as 15 regras R2;
- não interpretar BI-RADS;
- não introduzir rastreamento diferenciado de alto risco;
- não calcular risco familiar;
- não criar UI ou relatório Mama.
