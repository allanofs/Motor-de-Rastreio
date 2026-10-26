# Mama — M0: matriz de referenciais e fontes

Data da auditoria: **2026-10-26**.

Esta matriz serve para governança clínica e provenance. Ela **não é uma regra executável**.

## Hierarquia de fonte por família

### 1. SUS / Brasil oficial

Fonte governante proposta para o snapshot atual:

**Ministério da Saúde — Nota Técnica nº 626/2025-CGCAN/DECAN/SAES/MS**

- rastreamento mamográfico populacional: 50–74 anos;
- periodicidade: bienal;
- mulheres/pessoas de 40–49 anos e acima de 74 anos, assintomáticas, podem realizar mamografia por demanda, com orientação profissional sobre riscos e benefícios;
- sinais/sintomas pertencem à investigação diagnóstica, não ao rastreamento de rotina.

URL oficial:
`https://www.gov.br/saude/pt-br/centrais-de-conteudo/publicacoes/notas-tecnicas/2025/nota-tecnica-no-626-2025-cgcan-decan-saes-ms.pdf/@@download/file`

Confirmação operacional/educacional vigente:

**INCA — Detecção precoce (atualizado em 30/09/2025)**

- registra que, a partir de setembro de 2025, a mamografia de rotina passou a ser recomendada de 50 a 74 anos, a cada dois anos;
- inclui mulheres, homens trans e pessoas não-binárias designadas mulheres ao nascer que mantêm as mamas.

URL oficial:
`https://www.gov.br/inca/pt-br/assuntos/cancer/tipos/mama/versao-para-profissionais-de-saude/deteccao-precoce`

### Fontes históricas que não devem governar o snapshot atual

O INCA publicou em janeiro/março de 2025 posicionamentos reafirmando 50–69 anos bienal. Esses documentos são importantes para histórico/versionamento, mas foram superados pela atualização do Ministério da Saúde de setembro de 2025 para 50–74 anos.

Regra de governança para M1:

- manter fonte histórica como superseded/historical quando necessário;
- nunca misturar 50–69 e 50–74 no mesmo snapshot ativo;
- provenance do resultado atual deve apontar para a fonte vigente.

---

## 2. Brasil ampliado

Fonte societária principal proposta:

**Sociedade Brasileira de Mastologia (SBM), Colégio Brasileiro de Radiologia (CBR) e FEBRASGO — Nota de Esclarecimento: Recomendações da Mamografia (22/10/2024)**

- mamografia anual a partir dos 40 anos;
- recomendação anual até aproximadamente 74/75 anos;
- após essa idade, continuidade individualizada conforme saúde/expectativa de vida;
- situações familiares de maior risco podem demandar início mais precoce e avaliação especializada.

URL SBM:
`https://sbmastologia.com.br/para-o-medico/nota-de-esclarecimento-recomendacoes-da-mamografia/`

Fonte societária atual de apoio:

**SBM — Rastreamento mamográfico**

- risco habitual: anual dos 40 aos 74 anos;
- 75+ pode continuar quando não houver comorbidades que reduzam a expectativa de vida.

URL:
`https://sbmastologia.com.br/para-a-populacao/rastreamento-mamografico/`

### Snapshot proposto para o núcleo determinístico

- 40–74 anos: mamografia anual;
- 75+: decisão individual, não rotina automática;
- <40: não automatizar rotina average-risk; risco especial deve sair para Atenção específica.

A redação final da policy só deve ser ativada após revisão clínica formal das fontes adotadas.

---

## 3. Internacional

Fonte governante proposta:

**USPSTF — Breast Cancer: Screening, Final Recommendation Statement, 30/04/2024**

- 40–74 anos: mamografia bienal;
- grau B;
- 75+: evidência insuficiente;
- mamografia digital e tomossíntese mamária digital podem ser modalidades primárias de rastreamento;
- evidência insuficiente para rastreamento suplementar por ultrassom ou ressonância em pessoas com mamas densas e mamografia negativa.

URL oficial:
`https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/breast-cancer-screening`

Escopo do USPSTF inclui pessoas de risco habitual e também alguns fatores de risco comuns, como história familiar em primeiro grau ou mamas densas, mas exclui condições de risco substancialmente elevado, como síndrome genética de alto risco, radioterapia torácica em idade jovem, câncer de mama prévio e lesão mamária de alto risco em biópsia.

### Snapshot proposto

- 40–74: mamografia bienal;
- 75+: `SHARED_DECISION` ou estado de evidência insuficiente a ser definido em M1, sem inventar recomendação;
- alto risco conhecido: fora da rotina average-risk.

---

# Divergências que o Motor deve preservar

| Cenário | SUS oficial | Brasil ampliado | USPSTF |
|---|---|---|---|
| 40–49, risco habitual | acesso sob demanda/individualizado; não é o núcleo do rastreamento populacional | mamografia anual | mamografia bienal |
| 50–74, risco habitual | mamografia bienal | mamografia anual | mamografia bienal |
| 75+ | demanda individual/avaliação de risco-benefício | individualizado conforme saúde/expectativa de vida | evidência insuficiente |
| imagem suplementar por densidade | não incorporar como rotina no M0 | não incorporar como rotina no M0 | evidência insuficiente para US/RM suplementar após mamografia negativa |

O Motor não deve resolver essa divergência produzindo uma periodicidade média.

# Fonte e locator

Em M2, cada regra deverá carregar `sourceRefs` com:

- `sourceId` governado;
- locator exato (seção, item, página ou tabela);
- metadata de evidência quando disponível.

Nenhuma bibliografia poderá ser criada na UI ou inferida apenas de `policyId`.

# Pendências para revisão clínica

1. definir o tratamento exato de 75+ em cada policy;
2. congelar o texto societário final do limite superior (74 vs 75) para `br_ampliado`;
3. definir quais padrões familiares constituem hard exit para alto risco, sem confundir qualquer história familiar com alto risco hereditário;
4. definir como anatomia mamária relevante será representada sem inferência inadequada de sexo/gênero;
5. decidir se tomossíntese entra como modalidade equivalente no primeiro release ou apenas como futura extensão.