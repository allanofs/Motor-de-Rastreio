# Mama — Fase M1: modelo de domínio

Status: **Draft de representabilidade / sem regras clínicas executáveis**.

M1 transforma o escopo aprovado na M0 em um vocabulário mínimo de domínio. O objetivo é provar que os cenários necessários podem ser representados sem copiar a profundidade longitudinal do CCR e sem introduzir lógica clínica na UI.

## Princípio

M1 representa **o que o Motor precisa saber**. Não decide ainda **o que o Motor deve concluir**.

Nenhum arquivo da M1 contém:

- limiar etário executável;
- intervalo anual/bienal executável;
- regra de elegibilidade;
- regra por BI-RADS;
- decisão de US/RM/biópsia;
- algoritmo de risco;
- policy ativa;
- action clínica.

## Tema e tracks

Tema:

- `breast-cancer-screening`

Tracks deliberadamente grossos:

1. `breast-routine-screening`
   - estado da rotina de rastreamento average-risk.

2. `breast-population-status`
   - pertencimento ou não à população rotineira do referencial selecionado.

3. `breast-prior-finding-status`
   - identifica que um achado mamográfico prévio impede retorno silencioso à rotina.

4. `breast-special-risk-status`
   - identifica contexto de risco especial que sai do módulo de rotina.

5. `breast-specific-care-status`
   - identifica acompanhamento mastológico/oncológico/diagnóstico já ativo.

Não existem tracks de BI-RADS, ultrassom, ressonância, biópsia ou tratamento na M1.

## Conceitos mínimos

### Contexto de rotina

- `breast-screening-context-confirmed`
- `breast-relevant-tissue-present`
- `breast-history-sufficient-current-status`

`breast-relevant-tissue-present` é propositalmente anatômico. O Motor não deve inferir anatomia mamária a partir de identidade de gênero ou rótulo administrativo quando isso não estiver explicitamente representado.

### Saída da rotina / hard exits

- `breast-suspicious-symptoms`
- `breast-prior-cancer`
- `breast-high-risk-genetic-context`
- `breast-prior-high-risk-chest-radiation`
- `breast-prior-high-risk-lesion`
- `breast-specific-care-active`
- `breast-prior-mammography-needs-specific-attention`

Esses conceitos não codificam ainda a definição clínica final de cada hard exit. A definição executável pertence às fases posteriores e será governada por fontes.

### Histórico mamográfico

- `breast-prior-mammography-allows-routine`
- `breast-prior-mammography-needs-specific-attention`

A M1 não tenta inferir esses conceitos a partir de uma árvore completa de BI-RADS. O objetivo é preservar o limite de automação: o Motor precisa saber se o episódio anterior permite retornar à rotina; não precisa manejar todo o episódio diagnóstico.

## Modalidades

Primeiro release:

- `breast-mammography-screening`

Contexto não rotineiro representável:

- `breast-mammography-diagnostic`

A modalidade diagnóstica existe apenas para evitar que um exame diagnóstico seja confundido com mamografia de rotina. Ela não abre um protocolo diagnóstico automatizado.

Não são modalidades V1 de rotina:

- ultrassonografia mamária;
- ressonância magnética;
- biópsia;
- tomossíntese como estratégia separada.

DBT permanece candidata futura. A USPSTF aceita mamografia digital e tomossíntese como modalidades primárias, mas a M1 não precisa transformar isso em nova estratégia antes de definirmos se há ganho real de produto e operacionalização.

## Classes de resultado mínimas

A M1 usa apenas três classes representacionais:

- `routine-clearing`;
- `attention-required`;
- `indeterminate`.

Esses valores são deliberadamente mais abstratos que BI-RADS. A tradução de um laudo/documento real para essas classes não é implementada nesta fase.

## Recurso operacional

- `breast-resource-mammography`

Este é o único recurso operacional V1. Disponibilidade deve ser perguntada apenas quando uma ação de mamografia já tiver sido calculada pelo Motor.

## O que continua desconhecido em M1

M1 não congela ainda:

- a regra exata de 75+ em cada policy;
- a definição operacional final de alto risco familiar/genético;
- o locator final das fontes de cada regra;
- equivalência ou não de DBT no produto;
- o algoritmo que traduz um resultado mamográfico real em `routine-clearing` ou `attention-required`;
- quais dados mínimos de um exame são necessários para aceitar retorno à rotina.

Esses itens devem permanecer explícitos e não podem ser preenchidos por suposição da UI.
