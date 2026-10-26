# Mama — M2: decisões de tradução antes das regras

Status: **propostas de tradução para revisão humana; sem regras executáveis**.

Este documento separa três coisas que não podem ser confundidas:

1. o que a fonte diz;
2. como o Motor pretende representar isso;
3. o que permanece pendente e não pode ser inferido.

---

## 1. SUS 40–49 e >74

### Fonte

A Nota Técnica 626/2025 permite mamografia de rastreamento por demanda em pessoas assintomáticas de 40–49 anos e acima de 74 anos, com orientação profissional sobre riscos e benefícios.

### Tradução proposta

Não traduzir como `Due` populacional automático.

Candidato de produto:

- estado técnico futuro com `stance=shared_decision`;
- apresentação: `Decisão individual`;
- sem dizer que faz parte do núcleo populacional 50–74.

Essa tradução ainda precisará de revisão clínica antes da regra.

---

## 2. Brasil ampliado 75+

### Fonte

- Nota CNM 2025: individualizar ≥75 conforme saúde geral/expectativa de vida;
- diretriz 2023: continuar quando expectativa de vida for de pelo menos sete anos, categoria D.

### Problema de computabilidade

Mama V1 ainda não possui estimador validado de expectativa de vida nem um `GeriatricContext` clínico governado para essa decisão.

### Tradução proposta

Não criar `Due` automático apenas porque a pessoa tem 75+ e parece saudável.

Candidato inicial:

- `SharedDecision`/decisão individual, com rationale da fonte;
- futura promoção para decisão mais específica apenas quando contexto prognóstico for governado.

---

## 3. USPSTF 75+

### Fonte

USPSTF 2024: evidência insuficiente (`I statement`).

### Tradução proposta

Preservar semanticamente a insuficiência de evidência.

Possível representação futura:

- `stance = insufficient_evidence`;
- outcome técnico compatível com discussão/individualização;
- nenhuma action de recomendação positiva.

A UI deve dizer que a evidência é insuficiente, não simplesmente “é opcional”.

---

## 4. História familiar comum não é hard exit automático

### Fonte

A USPSTF inclui no escopo da recomendação pessoas com parente de primeiro grau com câncer de mama. A exclusão se aplica a mutações/síndromes de alto risco e outros contextos substancialmente elevados.

A diretriz brasileira de 2023 possui uma via específica para forte história familiar/risco vitalício ≥20%.

### Consequência

Não perguntar “tem qualquer história familiar?” e automaticamente tirar a pessoa da rotina.

O Motor precisa distinguir:

- história familiar comum/modesto aumento de risco;
- **contexto já reconhecido como alto risco familiar/genético**.

### Gap M2-01

A M1 possui `breast-high-risk-genetic-context`, mas não um conceito separado para alto risco familiar conhecido sem mutação documentada.

**Não sobrecarregar o conceito genético.**

Proposta para aprovação humana antes da M3:

Adicionar um conceito M1 complementar:

`breast-known-high-risk-familial-context`

Sem criar calculadora Gail/Tyrer-Cuzick/BOADICEA no V1. O input deve significar que o contexto de alto risco já foi estabelecido clinicamente/por ferramenta externa governada, não que o Motor calculou o risco.

---

## 5. Resultado mamográfico anterior: sem BI-RADS profundo

### Fontes

- INCA: resultados anormais no rastreamento devem seguir para investigação diagnóstica;
- USPSTF: achados mamográficos anormais requerem avaliação e testes adicionais apropriados.

### Tradução proposta

Mama V1 não interpretará BI-RADS bruto.

A entrada clínica de alto nível será uma das três classes já aprovadas:

- `routine-clearing` — episódio finalizado e autorizado a retornar à rotina;
- `attention-required` — há achado/pendência que exige cuidado específico;
- `indeterminate` — não há informação suficiente para saber se o episódio permite retorno à rotina.

A UI futura poderá perguntar algo como:

> “O resultado final dessa mamografia liberou retorno ao rastreamento de rotina?”

Opções: `Sim / Não / Não sei`.

Isso evita copiar o manual BI-RADS, evita licenciamento desnecessário e mantém o Depth Budget.

---

## 6. Tomossíntese (DBT)

### Fontes

- USPSTF: DBT e mamografia digital são modalidades mamográficas primárias eficazes;
- CBR/SBM/FEBRASGO: DBT associada à mamografia pode ser considerada quando disponível.

### Tradução proposta

Manter M1 como está: uma única modalidade de rotina na superfície, `breast-mammography-screening`.

DBT não vira estratégia V1 separada.

No futuro, um importador estruturado poderá normalizar explicitamente um exame com DBT + mamografia 2D/sintética para o conceito de mamografia de rastreamento, mas **a UI não deve inferir equivalência a partir de texto livre**.

---

## 7. Mamas densas

### Fontes

- USPSTF: ainda dentro do escopo principal; evidência insuficiente para US/RM suplementar após mamografia negativa;
- diretriz brasileira de 2023: contempla imagem suplementar em alguns cenários de densidade.

### Decisão de Depth Budget

Mama V1 não exige densidade mamária para calcular o núcleo de mamografia de rotina.

### Gap M2-02 — escopo de `Brasil ampliado`

Como a fonte brasileira completa contém recomendações suplementares, o produto não deve sugerir que V1 implementa a diretriz societária inteira.

A apresentação futura deve deixar claro:

> `Brasil ampliado — núcleo de rastreamento mamográfico`

ou formulação equivalente em detalhes técnicos/relatório.

Omissão deliberada de US/RM suplementar deve constar como limitação do módulo, não como recomendação contra esses exames.

---

## 8. Sintomas e cuidado específico

Sintomas suspeitos, câncer prévio, cuidado mastológico/oncológico ativo e achado anterior não resolvido não pertencem à rotina.

Tradução proposta:

- `SPECIFIC_ATTENTION_REQUIRED` quando há necessidade de avaliação específica e o Motor não conhece resolução;
- `SPECIFIC_CARE_ACTIVE` quando já há cuidado específico em andamento/assumido.

Não criar árvore diagnóstica.

---

## 9. Anatomia e identidade

A fonte brasileira atual inclui explicitamente homens trans e pessoas não-binárias designadas mulheres ao nascer que mantêm as mamas.

A M1 continuará usando o conceito funcional `breast-relevant-tissue-present`.

Isso é uma decisão de modelagem: o Motor não deve inferir anatomia a partir de gênero. A UI futura deverá perguntar apenas quando a informação for necessária para computabilidade e de forma clinicamente adequada.

---

# Gate humano necessário antes da M3

A M2 pode avançar para tradução de regras apenas se forem aprovados:

1. `40–49` e `>74` SUS como decisão individual, não `Due` populacional;
2. `75+` Brasil ampliado sem `Due` automático enquanto não houver prognóstico governado;
3. USPSTF 75+ preservado como evidência insuficiente;
4. não transformar qualquer história familiar em hard exit;
5. adicionar, se aprovado, `breast-known-high-risk-familial-context` à M1;
6. manter `routine-clearing / attention-required / indeterminate` sem BI-RADS bruto;
7. DBT fora da estratégia separada V1;
8. `Brasil ampliado` explicitamente limitado ao núcleo mamográfico no V1.
