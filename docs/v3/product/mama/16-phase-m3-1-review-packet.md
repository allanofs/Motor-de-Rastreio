# Mama — M3.1 focused human review packet

Status: **M3.1 tecnicamente verde; aguardando revisão humana própria antes de activation readiness**.

Base clínica já revisada: `breast-0.1.2-m3-r2-reviewed-draft`.

Artefato novo M3.1: `breast-0.1.3-m3-1-under40-source-verified-draft`.

## Escopo desta revisão

A M3.1 **não altera as 15 regras M3 já aprovadas em R2**. Esta revisão deve avaliar apenas a nova tradução de escopo/provenance para pessoas assintomáticas de risco habitual com idade <40 e os refinamentos de segurança associados.

## A. Tradução <40 por referencial

### SUS / Brasil oficial

Proposta M3.1:

`<40 + assintomática + risco habitual + nenhum hard exit` → `routine_not_recommended` no artefato de escopo Mama.

Racional: a orientação atual mantém o núcleo populacional em 50–74 bienal, explicita acesso sob demanda a partir de 40 anos e o INCA atual descreve balanço risco-benefício desfavorável fora das faixas/periodicidades recomendadas.

Revisar:
- a conclusão `routine_not_recommended` é clinicamente fiel?
- a conclusão deve continuar sendo de escopo de rotina, sem impedir investigação/screening diferenciado em alto risco?

### Brasil ampliado — núcleo mamográfico

Proposta M3.1:

`<40 + risco habitual + nenhum hard exit` → `routine_not_recommended`.

Racional: CBR/SBM/FEBRASGO 2023 declara explicitamente que rastreamento não é recomendado abaixo de 40 no risco populacional usual, enquanto grupos de alto risco possuem estratégias diferenciadas.

Revisar:
- a tradução é fiel?
- está claro que isso não é recomendação contra protocolos específicos de alto risco?

### USPSTF

Proposta M3.1:

`<40 + risco habitual + nenhum hard exit` → `outside_recommendation_scope`.

Racional: USPSTF 2024 define a população da recomendação como pessoas de risco habitual com 40 anos ou mais e não emite recomendação formal contra rastreamento <40.

Revisar:
- é correto evitar `recommend_against` e I statement neste cenário?
- `outside_recommendation_scope` preserva melhor a fidelidade normativa?

## B. Invariant de segurança — hard exits antes da idade

A conclusão etária <40 **nunca deve prevalecer** quando houver um hard exit.

Golden cases já exigem que idade 35 + cada um destes continue em caminho de atenção específica:

1. sintomas mamários suspeitos;
2. alto risco genético conhecido;
3. alto risco familiar já estabelecido;
4. radioterapia torácica de alto risco.

A mesma filosofia vale para câncer prévio, lesão de alto risco, achado anterior não resolvido e cuidado específico ativo.

Revisar:
- APPROVE safety precedence
- ou indicar cenário em que essa precedência esteja errada/incompleta.

## C. SharedDecision reason semantics

M3.1 mantém `SharedDecision` na Foundation, mas registra razão própria de Mama:

- SUS 40–49 e 75+: `outside-population-core-access-on-demand`;
- Brasil ampliado 75+: `continuation-conditioned-on-health-horizon`.

Não há alteração da Foundation.

Revisar:
- a distinção clínica é válida?
- alguma das razões está mal rotulada?

## D. `known_high_risk_familial_context`

Contrato proposto:

`yes` significa que alto risco familiar já foi estabelecido por avaliação externa adequada.

Não inferir automaticamente de:
- qualquer história familiar positiva;
- um único familiar de primeiro grau pós-menopausa isoladamente;
- heurística da UI;
- cálculo parcial de Gail/Tyrer-Cuzick/BOADICEA.

Revisar:
- APPROVE strict input contract
- ou indicar requisito clínico adicional.

## E. Depth Budget

M3.1 não autoriza:

- BI-RADS bruto;
- US/RM/biópsia;
- cálculo de risco familiar;
- estratégia específica de alto risco;
- manejo diagnóstico/tratamento.

Revisar se alguma mudança M3.1 ultrapassa inadvertidamente esse limite.

## Gate automatizado

- schemas: 62/62;
- test files: 49/49;
- tests: 619/619;
- M3 golden cases: 10/10;
- M3 R1 governance: 5/5;
- M3 R2 governance/anonymity: 5/5;
- M3.1 under-40/safety: 6/6;
- Foundation typecheck ✅;
- CCR pilot typecheck ✅;
- Foundation build ✅;
- CCR pilot build ✅;
- V2 byte-for-byte preserved ✅.

## Formato sugerido do parecer

```
Veredito M3.1:
APPROVE
ou
APPROVE WITH CORRECTIONS
ou
REJECT

A. SUS <40:
...

B. Brasil ampliado <40:
...

C. USPSTF <40:
...

D. Hard-exit precedence:
...

E. SharedDecision reasons:
...

F. High-risk familial input contract:
...

G. Depth Budget:
...

Correções obrigatórias:
...
```

## Governança

A aprovação R2 anterior não é estendida automaticamente a este artefato novo. Só após revisão humana explícita da M3.1 ela poderá entrar em activation-readiness junto ao snapshot M3 R2.
