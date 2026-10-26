# Mama — M2: catálogo governado de fontes

Status: **source catalog estruturado; sem regras executáveis**.

Data de verificação: **2026-10-26**.

A M1 foi explicitamente aprovada pelo responsável do projeto em 2026-10-26. A M2 não altera o vocabulário aprovado; organiza as fontes e proposições que poderão alimentar tradução clínica posterior.

## Objetivo

Para cada afirmação clínica usada futuramente pelo Motor, registrar:

- documento governante;
- instituição;
- versão/data;
- URL/DOI;
- status do documento;
- locator exato;
- policy/família à qual a proposição pertence;
- eventual grau de recomendação/evidência;
- pendências de tradução.

A UI não cria bibliografia e a futura rule não poderá inferir fonte apenas pelo `policyId`.

---

## 1. SUS / Brasil oficial

### Fonte governante

**Ministério da Saúde — Nota Técnica nº 626/2025-CGCAN/DECAN/SAES/MS**

Source ID: `breast-src-sus-nt626-2025`

Locators principais:

- item 2.1, p. 1 — separa rastreamento em assintomáticas de investigação diagnóstica em sintomáticas;
- item 2.2, p. 1 — rastreamento populacional dos 50 aos 74 anos, bienal;
- item 2.4, p. 1 — 40–49 e >74 podem realizar por demanda, com orientação sobre riscos/benefícios;
- itens 2.6–2.16, pp. 1–2 — sinais/sintomas suspeitos e necessidade de investigação diagnóstica;
- item 3.1, p. 2 — esta orientação deve prevalecer sobre recomendações anteriores divergentes até novas diretrizes.

### Fonte oficial de confirmação/escopo

**INCA — Detecção precoce — câncer de mama**, página oficial atualizada em 30/09/2025.

Source ID: `breast-src-inca-early-detection-2025`

Locators principais:

- seção Rastreamento — 50–74 anos, uma vez a cada dois anos;
- nota de inclusão — homens trans e pessoas não-binárias designadas mulheres ao nascer que mantêm as mamas;
- seção de alto risco — acompanhamento individualizado, mutações de alto risco e radioterapia supra-diafragmática em idade jovem.

### Proposições congeladas para tradução posterior

1. `50–74` + contexto assintomático + policy SUS → núcleo do rastreamento populacional bienal.
2. `40–49` ou `>74` no SUS não equivale a `Due` populacional automático; é cenário de acesso por demanda/decisão individual.
3. sintoma suspeito → sair da rotina de rastreamento.
4. alto risco conhecido → cuidado individualizado, não rotina average-risk simples.
5. fontes anteriores 50–69 não podem governar o snapshot atual.

---

## 2. Brasil ampliado

### Fonte societária vigente para o núcleo de mamografia

**Comissão Nacional de Mamografia — CBR / SBM / FEBRASGO — Nota Técnica de 27/01/2025**

Source ID: `breast-src-cnm-2025`

Locators principais:

- p. 1, parágrafo inicial — mamografia anual dos 40 aos 74; individualizada a partir dos 75;
- pp. 4–5, “Recomendação da Comissão Nacional de Mamografia” — reafirma 40–74 anual e individualização em 75+.

### Fonte detalhada de risco e modalidades

**Urban et al. — Radiologia Brasileira 2023;56(4):207–214**  
DOI `10.1590/0100-3984.2023.0064`

Source ID: `breast-src-cbr-sbm-febrasgo-2023`

Locators principais:

- p. 208 — risco populacional usual: mamografia anual 40–74, categoria A;
- p. 208 — 75+: continuar se expectativa de vida ≥7 anos, categoria D;
- p. 208 — tomossíntese associada à mamografia pode ser considerada quando disponível, categoria B;
- pp. 209–210 — lesões de alto risco, câncer prévio, radioterapia torácica e mutação genética/forte história familiar constituem vias diferenciadas.

### Proposições congeladas para tradução posterior

1. núcleo mamográfico de risco habitual: anual dos 40 aos 74;
2. 75+ não deve ser `Due` automático no V1 sem contexto prognóstico governado;
3. categorias de risco especial saem da rotina V1;
4. DBT tem suporte como modalidade mamográfica, mas permanece fora da estratégia separada V1 por Depth Budget.

### Limite de escopo explícito

A diretriz de 2023 também contempla imagem suplementar (US/RM) em cenários específicos. **Brasil ampliado V1 não implementará a diretriz completa de imagem suplementar.** A policy deve ser descrita como núcleo de rastreamento mamográfico + saídas seguras para situações especiais.

---

## 3. Internacional / USPSTF

### Fonte governante

**USPSTF — Breast Cancer: Screening — Final Recommendation Statement, 30/04/2024**

Source ID: `breast-src-uspstf-2024`

Locators principais:

- Recommendation Summary / Clinician Summary — 40–74: mamografia bienal, Grade B;
- Recommendation Summary / Clinician Summary — 75+: evidência insuficiente, I statement;
- Clinician Summary, “To whom does this recommendation apply?” — inclui risco habitual, parente de primeiro grau e mamas densas; exclui mutação/síndrome genética de alto risco, radioterapia torácica em idade jovem, câncer prévio e lesão de alto risco;
- Practice Considerations — Screening Tests — mamografia digital e DBT são modalidades mamográficas primárias eficazes;
- Recommendation Summary / Practice Considerations — mamas densas: evidência insuficiente para US/RM suplementar após mamografia negativa;
- Pathway to Benefit — achados anormais exigem seguimento apropriado.

### Proposições congeladas para tradução posterior

1. 40–74 → mamografia bienal, Grade B;
2. 75+ → `insufficient evidence`, nunca recomendação positiva automática;
3. história familiar em primeiro grau, isoladamente, não deve ser convertida em hard exit;
4. mutação/síndrome genética de alto risco, radioterapia torácica precoce, câncer prévio e lesão de alto risco ficam fora da policy average-risk;
5. DBT é eficaz, mas V1 não a expõe como estratégia separada;
6. densidade mamária não cria recomendação USPSTF automática de US/RM suplementar.

---

# Provenance

O código M2 está em:

- `v3/src/clinical/mama/sources.ts`
- `v3/src/clinical/mama/evidence.ts`

Cada proposição possui `sourceRefs` governados e locator. Não há rule/action/policy executável em M2.

# Regra de ouro para M3

Uma regra só poderá ser criada se:

1. existir proposição M2 correspondente;
2. seus `sourceRefs` estiverem resolvidos;
3. a tradução de texto-fonte para estado/action estiver explicitamente aprovada;
4. qualquer redução de escopo estiver visível em guardrail/documentação;
5. não houver inferência clínica nova criada pela UI.
