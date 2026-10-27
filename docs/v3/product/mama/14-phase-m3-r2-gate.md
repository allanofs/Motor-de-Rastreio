# Mama — M3 R2 independent review gate

Status: **R2 independente aprovado integralmente; snapshot reviewed_by_2 criado; ainda draft e não ativo**.

Data do gate: 2026-10-26.

## Anonimato e independência

A identidade e o registro profissional do segundo revisor clínico **não são armazenados neste repositório público** e **não foram fornecidos ao assistente de software**.

O repositório utiliza apenas o identificador público não identificável:

`external-physician-r2-private-breast-001`

Sob a governança atual do projeto, o líder do projeto atesta que esse identificador representa um **médico real, distinto do revisor R1**, que realizou revisão clínica independente do candidato M3 R1.

Não se deve inferir identidade, instituição, especialidade ou número de registro profissional a partir desse handle.

## Veredito R2

**APPROVE** — aprovação integral do snapshot `breast-0.1.1-m3-r1-draft`, sem correções obrigatórias nas 15 regras M3 atuais.

O parecer ocorreu após o revisor receber a passagem dos pontos levantados em uma auditoria externa pré-R2 baseada em Gemini e a análise subsequente do projeto. O Gemini **não é contabilizado como revisor clínico R2**, não recebe registro de governança e não substitui revisão médica humana independente.

A revisão R2 aceitou a manutenção da política SUS vigente com núcleo populacional de 50–74 anos bienal e não solicitou regressão para a faixa histórica 50–69 anos.

## Snapshot R2

- original source-verified: `breast-0.1.0-m3-draft`;
- R1: `breast-0.1.1-m3-r1-draft`;
- R2: `breast-0.1.2-m3-r2-reviewed-draft`;
- 15/15 regras permanecem `lifecycleStatus: draft`;
- 15/15 regras passam a `reviewStatus: reviewed_by_2`;
- cada regra preserva o registro R1 e acrescenta um segundo registro com o handle público anônimo do R2;
- nenhuma mudança clínica é introduzida pela transformação R2.

## O que o R2 aprovou no snapshot atual

- SUS 40–49: decisão individual / acesso sob demanda, não `Due` populacional automático;
- SUS 50–74: mamografia de rastreamento bienal;
- SUS 75+: decisão individual, não `Due` automático;
- Brasil ampliado 40–74: mamografia anual;
- Brasil ampliado 75+: decisão individual;
- USPSTF 40–74: mamografia bienal;
- USPSTF 75+: evidência insuficiente, sem recomendação positiva automática;
- hard exits de sintomas suspeitos, câncer prévio, alto risco genético, alto risco familiar já estabelecido, radioterapia torácica de alto risco, lesão mamária de alto risco, achado prévio ainda não resolvido e cuidado específico ativo;
- história familiar simples não é automaticamente alto risco;
- mamografia diagnóstica não ancora o relógio de rastreamento;
- BI-RADS bruto não é interpretado pelo módulo V1;
- nenhum protocolo profundo de US/RM/biópsia/genética/tratamento é autorizado.

## Auditoria Gemini pré-R2 — disposição

Os quatro pontos levantados foram tratados como **auditoria externa de apoio**, não como governança clínica:

1. **SUS 50–69 vs 70–74:** rejeitado como correção do ruleset atual porque a política federal vigente de 2025 usa 50–74 bienal; nenhuma regra M3 foi alterada para retornar a 50–69.
2. **Subtipo/polaridade do SharedDecision:** reconhecido como refinamento válido de domínio/produto Mama, sem promover nova abstração para Foundation nesta fase.
3. **Hard exits antes de <40:** aceito como invariant obrigatório para a futura M3.1.
4. **Contrato de `known_high_risk_familial_context`:** aceito como hardening; o conceito continua significando alto risco familiar já estabelecido, e não mera história familiar positiva.

## Pendências que continuam abertas apesar do R2 APPROVE

### M3.1 — faixa <40

R2 não transforma ausência de regra abaixo de 40 em autorização de ativação. Antes de activation readiness, M3.1 deve:

- definir tradução source-backed/provenance para pessoa average-risk <40;
- **avaliar hard exits antes do corte etário de rotina**;
- incluir golden cases de pessoa <40 sintomática, de alto risco genético/familiar estabelecido e com radioterapia torácica de alto risco;
- não inventar `recommend_against` sem suporte explícito da fonte.

Como a M3.1 introduzirá tradução/regra clínica que **não existia no snapshot visto pelo R2**, qualquer regra clínica nova deverá passar por gate humano próprio antes de activation readiness; a aprovação R2 atual não deve ser retroativamente aplicada a código futuro.

### SharedDecision reason semantics

A diferença entre decisão individual por estar fora do núcleo populacional e continuidade favorável condicionada deve ser preservada no domínio/produto Mama. Isso ainda não justifica alteração genérica da Foundation.

### Provenance multi-fonte dos hard exits

Permanece provisoriamente aceita. Deve ser reavaliada antes da integração final de produto/relatório Mama para verificar se a apresentação ao usuário é suficientemente clara ou se algum caso exige apresentação ou variante policy-specific.

### Contrato de alto risco familiar

`breast-known-high-risk-familial-context = yes` deve representar classificação de alto risco familiar já estabelecida externamente. O Motor V1 não deve derivar esse estado automaticamente de um único familiar de primeiro grau nem reconstruir Gail/Tyrer-Cuzick/BOADICEA.

## Gate automatizado pós-R2

HEAD R2 passou integralmente:

- schema checks: **62/62**;
- test files: **48/48**;
- tests: **613/613**;
- Mama M3 golden cases: **10/10**;
- Mama M3 R1 governance: **5/5**;
- Mama M3 R2 governance/anonymity: **5/5**;
- Foundation typecheck ✅;
- CCR pilot typecheck ✅;
- Foundation build ✅;
- CCR pilot build ✅;
- V2 byte-for-byte preserved ✅.

## O R2 não autoriza

- `lifecycleStatus: active`;
- candidate/entrypoint clínico ativo;
- fechamento automático do gap <40;
- UI ou relatório Mama;
- merge da PR;
- deploy ou publicação;
- uso clínico real.

## Próximo gate

1. congelar a PR M3/R2;
2. executar **M3.1** em branch/PR separada para resolver o gap <40 e os invariants associados;
3. rerodar golden/safety cases;
4. revisar humanamente qualquer nova tradução clínica da M3.1;
5. somente depois avaliar activation readiness de Mama em gate humano separado.
