# Mama — M3.1 human review gate

Status: **APROVADO no gate humano; ainda draft; não ativo**.

Data: 2026-10-26.

Aprovação explícita:

> Aprovo a M3.1 de Mama — tradução <40, precedência dos hard exits, semântica dos SharedDecision e contrato de alto risco familiar.

## Escopo aprovado

1. Pessoa assintomática, risco habitual, <40:
   - SUS: `routine_not_recommended`;
   - Brasil ampliado: `routine_not_recommended`;
   - USPSTF: `outside_recommendation_scope`, sem inventar recomendação formal contra rastreamento.
2. Hard exits têm precedência clínica sobre qualquer fechamento etário de rotina.
3. Razões de `SharedDecision` permanecem específicas do domínio Mama:
   - SUS 40–49 e 75+: `outside-population-core-access-on-demand`;
   - Brasil ampliado 75+: `continuation-conditioned-on-health-horizon`.
4. `breast-known-high-risk-familial-context = yes` exige estado de alto risco familiar previamente estabelecido por avaliação externa adequada; não pode ser inferido de história familiar genérica ou de um único familiar de primeiro grau isoladamente.
5. Gail, Tyrer-Cuzick e BOADICEA permanecem fora da V1.
6. O Depth Budget continua sem BI-RADS bruto, US/RM, biópsia, genética ou tratamento automatizados.

## O que este gate não faz

- não altera o snapshot R2 `breast-0.1.2-m3-r2-reviewed-draft`;
- não transforma a M3.1 em `reviewed_by_2`;
- não ativa regras ou entrypoint;
- não autoriza UI/relatório/deploy/merge/uso clínico real;
- não implica que o segundo revisor independente tenha revisado a implementação final da M3.1.

## Próximo passo

Executar activation-readiness audit. Qualquer blocker remanescente deve ser explícito e testável antes de criar um candidato clínico ativo.
