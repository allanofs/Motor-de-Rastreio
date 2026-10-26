# Mama — M3 R1 focused clinical review packet

Status: **aguardando decisão humana R1**.

Escopo: somente as traduções executáveis draft de Mama M3.

## O que o revisor deve responder

Para cada bloco abaixo, classificar como:

- `APROVAR`;
- `APROVAR COM RESSALVA`;
- `MUDANÇA NECESSÁRIA`.

A aprovação M3/R1 não ativa regras. Ela apenas autoriza promoção futura para `reviewed_by_1`, seguida de novo gate automatizado e posterior R2 independente.

---

## Bloco A — SUS

### A1 — 40–49 anos

Tradução proposta:

- `SharedDecision`;
- sem mamografia `Due` automática;
- representa acesso sob demanda/decisão individual fora do núcleo populacional.

Pergunta R1:

> Esta tradução preserva corretamente a Nota Técnica 626/2025 sem transformar acesso sob demanda em rastreamento populacional automático?

### A2 — 50–74 anos

Tradução proposta:

- mamografia de rastreamento bienal;
- `Due` quando nunca realizou;
- `Current` enquanto mamografia qualificável `routine-clearing` ainda cobre o intervalo.

Pergunta R1:

> Faixa, periodicidade e qualificação do evento estão corretas?

### A3 — 75+

Tradução proposta:

- `SharedDecision`;
- não `Due` automático.

Pergunta R1:

> A tradução preserva adequadamente a individualização/acesso sob demanda acima de 74 anos?

---

## Bloco B — Brasil ampliado

### B1 — 40–74 anos

Tradução proposta:

- núcleo mamográfico V1;
- mamografia anual;
- `Due`/`Current` conforme evento qualificável.

Pergunta R1:

> A tradução anual 40–74 é fiel às fontes CBR/SBM/FEBRASGO adotadas?

### B2 — 75+

Tradução proposta:

- `SharedDecision`;
- não `Due` automático enquanto o Motor não possuir contexto prognóstico/expectativa de vida governado.

Pergunta R1:

> Esta é uma abstração segura para V1, sem fingir que o critério de expectativa de vida foi calculado?

### B3 — limitação de escopo

Mama V1 implementa apenas o núcleo mamográfico. US/RM/estratégias especiais descritas na diretriz societária não são automatizadas.

Pergunta R1:

> Esta limitação pode permanecer explícita como escopo de produto sem ser interpretada como recomendação contra exames suplementares?

---

## Bloco C — USPSTF

### C1 — 40–74 anos

Tradução proposta:

- mamografia bienal;
- Grade B preservado em provenance;
- `Due`/`Current` conforme evento qualificável.

Pergunta R1:

> A tradução é fiel à USPSTF 2024?

### C2 — 75+

Tradução proposta:

- `stance: insufficient_evidence`;
- `ClinicalReviewRequired` como abstention técnico;
- nenhuma action positiva de mamografia é publicada pelo plano.

Pergunta R1:

> Este comportamento preserva adequadamente o `I statement`, sem convertê-lo em recomendação positiva ou em simples “opcional”?

---

## Bloco D — histórico de mamografia

Um exame só ancora o relógio se for:

- mamografia de rastreamento;
- `routine-clearing` explícito;
- qualidade adequada;
- completo;
- resolução suficiente;
- data suficientemente precisa.

Não ancoram:

- mamografia diagnóstica;
- `attention-required`;
- `indeterminate`;
- evento não resolvido/insuficiente.

Pergunta R1:

> Esta abstração é segura para V1 sem interpretar BI-RADS bruto?

---

## Bloco E — hard exits

M3 interrompe rotina para:

1. sintomas mamários suspeitos;
2. câncer de mama prévio;
3. contexto genético de alto risco;
4. alto risco familiar **já estabelecido**;
5. radioterapia torácica prévia de alto risco;
6. lesão mamária prévia de alto risco;
7. achado mamográfico anterior ainda não liberado para rotina;
8. cuidado mamário específico já ativo.

A saída é rasa: o Motor não prescreve a investigação subsequente.

Pergunta R1:

> O conjunto é apropriado para retirar o caso da rotina average-risk V1 sem sobrecarregar o módulo com manejo diagnóstico?

---

## Bloco F — Gap M2-01: risco familiar

Conceito novo:

`breast-known-high-risk-familial-context`

Semântica proposta:

> risco familiar elevado já estabelecido externamente/clinicamente.

Guardrail:

- qualquer história familiar comum, inclusive parente de primeiro grau isoladamente, **não** ativa este hard exit;
- Mama V1 não calcula risco por Gail/Tyrer-Cuzick/BOADICEA.

Pergunta R1:

> Esta separação é clinicamente adequada e evita sobreclassificação de risco?

---

## Bloco G — cuidado específico ativo

Por contrato da Foundation, `no_formal_recommendation` produz abstention. Portanto M3 mantém:

- track: `breast-specific-care-status`;
- engine: `ClinicalReviewRequired`;
- futura apresentação de produto: poderá ser `Em acompanhamento específico`.

Não foi usado `stance: recommend` artificialmente para forçar `InFollowUp`.

Pergunta R1:

> Esta separação entre semântica técnica do engine e apresentação de produto é aceitável para V1?

---

## Bloco H — Gap M3-01: abaixo de 40 anos

M3 não cria regra explícita de `recommend_against` para average-risk <40.

Hoje, sem regra aplicável, a engine pode produzir `NotApplicable`, mas sem uma regra ativada não existe provenance específica para essa conclusão.

Opções para R1:

1. **Manter gap aberto para M3.1** e extrair uma proposition/translation explícita antes da ativação;
2. aprovar uma regra `recommend_against` apenas se a fonte adotada realmente sustentar essa redação;
3. definir outro padrão de abstention/outside-scope que preserve provenance sem inventar stance.

Recomendação de engenharia:

> opção 1 — manter aberto até haver tradução clínica/provenance explícita.

Pergunta R1:

> Qual opção deve governar <40 antes da ativação?

---

## Bloco I — provenance dos hard exits comuns

Alguns hard exits comuns carregam sourceRefs de mais de uma família de guideline porque funcionam como safety boundary do domínio.

Pergunta R1:

> É aceitável manter provenance multi-fonte para esses gates comuns, ou devemos futuramente criar versões policy-specific para que o relatório cite apenas o referencial selecionado?

Recomendação inicial:

- aceitar multi-fonte durante M3 draft;
- reavaliar antes do relatório Mama/M5;
- não duplicar 8 × 3 regras sem benefício demonstrado.

---

# Golden cases já verdes

- SUS 55 nunca rastreado → `Due`;
- mamografia recente `routine-clearing` → `Current`;
- mesma mamografia: Brasil ampliado `Due` vs USPSTF `Current`;
- SUS 45 → `SharedDecision`;
- Brasil ampliado 76 → `SharedDecision`;
- USPSTF 76 → abstention por evidência insuficiente;
- alto risco familiar conhecido → hard exit;
- achado anterior não resolvido → hard exit;
- mamografia diagnóstica não ancora rotina.

Gate automatizado: **603/603 testes, 46/46 arquivos, 62/62 schemas; builds/typechecks verdes; V2 preservada**.

# Decisão R1 sugerida

O revisor deve retornar:

- aprovação integral;
- aprovação integral com ressalvas nomeadas;
- aprovação parcial por blocos; ou
- mudanças requeridas.

Se houver aprovação, registrar explicitamente quais gaps permanecem abertos; aprovação de M3 não pode ser interpretada como ativação clínica.
