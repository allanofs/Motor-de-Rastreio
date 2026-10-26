# Mama — Fase M0: discovery e escopo clínico

Status: **Draft clínico / sem regras executáveis**.

Base arquitetural: `v3-report-foundation-r3`.

## Objetivo do módulo

Criar o segundo módulo clínico do Motor de Rastreio V3 para **rastreamento de câncer de mama em pessoas assintomáticas**, usando o CCR como benchmark arquitetural, mas respeitando o Depth Budget aprovado:

- automatizar a rotina de rastreamento;
- reconhecer quando a pessoa já está em dia;
- reconhecer quando falta uma informação necessária;
- comparar referenciais divergentes sem escolher um deles silenciosamente;
- interromper a automação quando o caso deixa a rotina;
- preservar provenance e relatório estruturado;
- **não** transformar o Motor em protocolo diagnóstico/terapêutico completo de mastologia.

## População inicial

Escopo determinístico inicial:

- pessoas assintomáticas com tecido mamário relevante para rastreamento;
- contexto preventivo/rastreamento;
- risco habitual conforme o referencial selecionado;
- idade e histórico de mamografia suficientes para definir se há rastreamento devido ou em dia.

A linguagem de produto não deve assumir gênero quando isso for clinicamente desnecessário. O Ministério da Saúde/INCA inclui na recomendação de rastreamento pessoas designadas mulheres ao nascer que mantêm as mamas; a modelagem exata de anatomia/sexo/gênero será definida em M1 sem criar inferência identitária na UI.

## Fora da rotina inicial

Os seguintes cenários **não devem receber automação clínica profunda no primeiro release de Mama**. Eles devem sair da rotina para `SPECIFIC_ATTENTION_REQUIRED`, `SPECIFIC_CARE_ACTIVE` ou safe failure apropriado:

- sinais ou sintomas mamários suspeitos;
- câncer de mama prévio;
- síndrome/mutação genética de alto risco conhecida ou fortemente suspeita;
- história de radioterapia torácica em contexto de alto risco;
- lesão mamária prévia de alto risco em biópsia;
- acompanhamento já assumido por mastologia/oncologia;
- mamografia anterior com achado que não permita retorno simples ao rastreamento de rotina;
- situação pós-tratamento, vigilância oncológica ou seguimento diagnóstico ativo.

A lista exata de fatos computáveis será definida em M1. M0 não cria regras.

## Exames no primeiro release

Exame de rotina primário: **mamografia de rastreamento**.

O primeiro release não automatiza como estratégia de rastreamento de rotina:

- ultrassonografia mamária isolada;
- ressonância magnética isolada;
- biópsia;
- investigação de achados mamográficos;
- seguimento completo por BI-RADS.

Densidade mamária pode ser preservada como contexto futuro, mas **não deve ser exigida para calcular a rotina**. No referencial USPSTF atual, a evidência é insuficiente para recomendar a favor ou contra rastreamento suplementar com ultrassom ou ressonância em mamas densas após mamografia negativa.

## Referenciais propostos

O módulo deve manter três famílias comparáveis, seguindo o padrão já aprovado no CCR:

1. `sus_oficial`
   - Ministério da Saúde / INCA vigente;
   - rastreamento populacional prioritário: mamografia bienal dos 50 aos 74 anos;
   - 40–49 anos e acima de 74 anos podem ter acesso por demanda individual, com orientação sobre riscos e benefícios, mas isso não deve ser apresentado como o mesmo que a política populacional de rotina.

2. `br_ampliado`
   - sociedades brasileiras (SBM/CBR/FEBRASGO) como referencial ampliado;
   - núcleo determinístico inicial proposto: mamografia anual dos 40 aos 74 anos;
   - 75+ deve permanecer individualizado até revisão clínica específica do texto-fonte adotado.

3. `internacional`
   - USPSTF 2024 como referencial governante inicial;
   - mamografia bienal dos 40 aos 74 anos;
   - 75+ = evidência insuficiente para determinar balanço benefício/risco.

O Motor nunca deve fundir essas recomendações numa regra média. A UI pode oferecer `Comparar referenciais`, mas cada cálculo deve ter uma policy explícita.

## Divergência brasileira que precisa permanecer visível

A recomendação oficial brasileira mudou em setembro de 2025. Materiais do INCA publicados no início de 2025 ainda registravam 50–69 anos bienal, mas a orientação vigente do Ministério da Saúde/INCA passou a 50–74 anos bienal.

Portanto:

- fontes históricas 50–69 não devem governar o snapshot atual;
- a provenance deve apontar para a atualização vigente;
- versões anteriores podem permanecer no histórico, nunca como regra ativa silenciosa.

## Resultado de produto esperado

Para um caso rotineiro, o Motor deve conseguir responder apenas o necessário:

- `Rastreamento indicado`;
- `Em dia`;
- `Decisão individual` quando o próprio referencial exigir individualização;
- `Próxima informação necessária`;
- `Atenção específica` quando o caso sair da rotina;
- `Não foi possível concluir com segurança` quando houver conflito/erro de computação.

## Não objetivos da M0

- não implementar regras;
- não definir ainda IDs finais de conceitos/tracks;
- não implementar UI;
- não criar um score universal de risco mamário;
- não automatizar genética;
- não automatizar conduta por BI-RADS;
- não determinar biópsia, ultrassom, ressonância ou tratamento;
- não alterar Foundation, engine ou model;
- não mergear em `main`, fazer deploy ou autorizar uso clínico real.

## Gate para M1

M1 só começa quando estiverem congelados:

- as famílias de referenciais;
- o Depth Budget de Mama;
- o conjunto mínimo de fatos/exames necessários;
- os hard exits da rotina;
- a política temporal para mamografia qualificável;
- a hierarquia de fontes e provenance.