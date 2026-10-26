# Mama — M3: tradução executável draft

Status: **implementada, tecnicamente verde e aguardando revisão clínica R1**.

Base: `v3-mama-clinical-spec` (M0–M2 aprovadas).

Ruleset: `breast-0.1.0-m3-draft`.

## Princípio

M3 é a primeira fase executável de Mama, mas **não ativa conteúdo clínico**.

Todas as regras reais permanecem:

- `lifecycleStatus: draft`;
- `reviewStatus: source_verified`;
- sem registros de revisão humana;
- sem entrypoint clínico ativo;
- sem UI/produto de Mama.

Os testes de comportamento usam uma cópia sinteticamente ativa somente dentro da suíte de teste. Essa ativação sintética não é artefato de produto ou governança.

## Escopo traduzido

### SUS / Brasil oficial

- 40–49 anos: `SharedDecision`, não `Due` populacional automático;
- 50–74 anos: mamografia de rastreamento bienal;
- 75+ anos: `SharedDecision`, não `Due` automático.

### Brasil ampliado — núcleo mamográfico V1

- 40–74 anos: mamografia anual;
- 75+ anos: `SharedDecision`; o Motor V1 não calcula expectativa de vida.

### Internacional — USPSTF

- 40–74 anos: mamografia bienal;
- 75+ anos: `insufficient_evidence` + `ClinicalReviewRequired`; nenhuma ação positiva de mamografia é emitida.

## Intervalo e evento qualificável

Somente um evento que satisfaça simultaneamente:

- modalidade `breast-mammography-screening`;
- resultado abstrato `routine-clearing`;
- qualidade adequada;
- completude completa;
- informação de resolução suficiente;

pode ancorar o relógio da rotina.

Não qualificam silenciosamente:

- mamografia diagnóstica;
- `attention-required`;
- `indeterminate`;
- evento com qualidade/completude/resolução insuficientes.

O intervalo permanece propriedade da policy/regra, nunca do registro do exame.

## Hard exits traduzidos

O conjunto M3 contém saídas rasas da rotina para:

- sintomas mamários suspeitos;
- câncer de mama prévio;
- contexto genético de alto risco;
- **alto risco familiar já estabelecido** (`breast-known-high-risk-familial-context`);
- radioterapia torácica prévia de alto risco;
- lesão mamária prévia de alto risco;
- mamografia anterior ainda classificada como `attention-required`;
- cuidado mamário específico já ativo.

Essas regras não implementam BI-RADS, US, RM, biópsia, genética, histologia ou tratamento.

## Gap M2-01 implementado

Foi adicionado:

`breast-known-high-risk-familial-context`

Semântica:

> risco familiar elevado já estabelecido por avaliação externa/clinicamente adequada.

Não significa:

> qualquer história familiar positiva.

Mama V1 não calcula Gail, Tyrer-Cuzick, BOADICEA ou risco vitalício.

## Decisões arquiteturais observadas durante a tradução

### 1. `SharedDecision` é computável

A engine pode determinar que **há necessidade de decisão individual**, mesmo que a decisão final permaneça humana. Portanto SUS 40–49 e Brasil ampliado 75+ usam `computability: computable` e `stance: shared_decision`.

### 2. USPSTF 75+ permanece abstention

A regra preserva `stance: insufficient_evidence`. A engine retorna `ClinicalReviewRequired` e, por desenho de segurança, não publica actions no plano quando o estado é abstention.

Isso é desejável: nenhuma ação positiva de mamografia pode escapar de um `I statement`.

### 3. Cuidado específico ativo

`no_formal_recommendation` é semanticamente um estado de abstention na Foundation. M3 não usa `stance: recommend` como artifício para forçar `InFollowUp`.

Assim, o engine permanece `ClinicalReviewRequired` no track `breast-specific-care-status`. A futura camada de produto pode apresentar esse track como **Em acompanhamento específico** sem mudar o significado clínico nem inventar a conduta do especialista.

### 4. Hard exits comuns e provenance

Alguns hard exits são gates de segurança de domínio usados pelas três policies e carregam evidência de mais de uma família de fontes. R1 deve revisar se essa provenance multi-fonte é aceitável para o relatório ou se alguma saída precisa ser dividida por policy em fase posterior.

## Gap M3-01 — idade abaixo de 40 anos

M3 **não cria uma regra explícita `recommend_against`/`NotApplicable` para <40 anos**.

Motivo:

- os referenciais aprovados começam seu núcleo mamográfico de rotina em 40 anos;
- porém `não há recomendação populacional de rotina` não deve ser transformado automaticamente em `recomendação contra` sem tradução clínica explícita;
- criar um `recommend` artificial apenas para produzir `NotApplicable` violaria a semântica de stance.

No preview atual, a ausência de regra aplicável pode resultar em `NotApplicable`, mas sem uma regra ativada não há provenance específica para essa conclusão.

**R1 deve decidir a tradução adequada antes de qualquer ativação.**

## Golden cases automatizados

A suíte M3 cobre:

1. todas as 15 regras reais permanecem draft/source_verified;
2. SUS 55 nunca rastreado → `Due`;
3. mamografia `routine-clearing` recente → `Current`;
4. mesma mamografia pode ser `Due` no Brasil ampliado e `Current` na USPSTF;
5. SUS 45 → `SharedDecision`;
6. Brasil ampliado 76 → `SharedDecision`;
7. USPSTF 76 → `ClinicalReviewRequired` por evidência insuficiente, sem recomendação de mamografia;
8. alto risco familiar conhecido → hard exit sem calculadora;
9. achado mamográfico não resolvido → hard exit e bloqueio da rotina;
10. mamografia diagnóstica não ancora intervalo de rastreamento.

## Gate automatizado

Head funcional validado: `be278febee6d2feeb2d06b20947fa027cce3f2d4`.

- schema checks: **62/62**;
- test files: **46/46**;
- tests: **603/603**;
- Mama M3 golden cases: **10/10**;
- Foundation typecheck: passou;
- CCR pilot typecheck: passou;
- Foundation build: passou;
- CCR pilot build: passou;
- V2 byte-for-byte: preservada.

## Não autorizado por M3

- nenhuma ativação de Mama;
- nenhuma promoção para `reviewed_by_1` ou `reviewed_by_2`;
- nenhuma UI;
- nenhum relatório Mama;
- nenhum merge/deploy/uso clínico real;
- nenhuma alteração em Foundation/engine/model.
