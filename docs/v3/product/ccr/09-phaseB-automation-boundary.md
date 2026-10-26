# Phase B — CCR Automation Boundary

**Status:** implementação funcional em PR Draft; validação automatizada verde nos subgates anteriores; validação em navegador real ainda pendente.

**Branch:** `v3-ccr-product-boundary`  
**Base arquitetural:** `v3-automation-boundary-architecture`  
**Ruleset canônico consumido nesta branch:** `crc-0.5.9-phase6-h1-active`

## Objetivo

Demonstrar no CCR a filosofia aprovada na Fase A sem remover sua implementação longitudinal profunda:

> **O MOTOR sabe quando rastrear, sabe quando parar e sabe se ainda está parado.**

O CCR permanece como benchmark interno de profundidade máxima. A Fase B acrescenta uma conclusão de produto simples acima da avaliação técnica existente; não reduz engine, ruleset, resolvers, trace ou provenance.

## Camadas

```text
Foundation / engine
        ↓
CCR rules + resolvers profundos
        ↓
CcrProductSuccess / TrackEvaluation / DecisionTrace
        ↓
deriveCcrAutomationBoundary()
        ↓
CcrAutomationBoundary
        ↓
CcrPresentationModel
        ↓
UI
```

A UI não deriva o boundary a partir de idade, guideline, nomes de regras ou status isolados. Ela consome o valor calculado na camada `src/product/ccr/**`.

## Contrato mínimo

`CcrAutomationBoundary` contém somente:

- `contractVersion`;
- `code`;
- `triggerTrackIds`.

Ele não duplica `ruleIds`, `sourceIds`, `sourceRefs`, fatos ou registros clínicos. Esses elementos continuam disponíveis no `DecisionTrace` dos tracks indicados em `triggerTrackIds`.

Versão inicial do contrato: `phaseB.1`.

## Códigos CCR nesta demonstração

- `CANNOT_CONCLUDE_SAFELY`;
- `SPECIFIC_ATTENTION_REQUIRED`;
- `SPECIFIC_CARE_ACTIVE`;
- `MORE_INFORMATION_NEEDED`;
- `SHARED_DECISION`;
- `ROUTINE_DUE`;
- `ROUTINE_CURRENT`;
- `SCREENING_NOT_INDICATED`.

Esses códigos são **específicos da camada produto/domínio CCR**. Não constituem novo schema universal da Foundation.

## Precedência de segurança

A demonstração CCR aplica a seguinte precedência:

1. `Conflict` / `ComputationError` → `CANNOT_CONCLUDE_SAFELY`;
2. `HandedOff` → `SPECIFIC_CARE_ACTIVE`;
3. `ClinicalReviewRequired`, `InFollowUp` e pendência relevante no track FIT+ → `SPECIFIC_ATTENTION_REQUIRED`;
4. `Indeterminate` / demais resultados pendentes → `MORE_INFORMATION_NEEDED`;
5. `SharedDecision` / escolha de estratégia pendente → `SHARED_DECISION`;
6. rastreamento devido → `ROUTINE_DUE`;
7. rastreamento atual → `ROUTINE_CURRENT`;
8. ausência de nova ação de rotina → `SCREENING_NOT_INDICATED`.

A precedência impede que uma ação de rotina menos importante masque um desvio clínico que exige parada segura.

## Continuidade longitudinal mínima demonstrada

O CCR continua capaz de modelar profundamente episódios de FIT positivo. A superfície de produto, porém, usa apenas a conclusão necessária para segurança.

Exemplo:

```text
FIT positivo conhecido
      ↓
CCR profundo continua avaliando episódio e follow-up
      ↓
Boundary = SPECIFIC_ATTENTION_REQUIRED
      ↓
UI = ATENÇÃO ESPECÍFICA
```

Um FIT negativo posterior não encerra silenciosamente um episódio FIT+ prévio. Enquanto o track longitudinal continuar aberto, o boundary permanece em `SPECIFIC_ATTENTION_REQUIRED`.

A disponibilidade local de colonoscopia pode alterar a rota operacional da action, mas não altera o boundary clínico do episódio FIT+.

## H1 reintegrado antes da Fase B

A branch reintegrou primeiro o snapshot governado `crc-0.5.9-phase6-h1-active`.

Isso garante que história familiar explicitamente negativa:

- não produz `ClinicalReviewRequired` espúrio;
- não produz `SPECIFIC_ATTENTION_REQUIRED` por esse motivo;
- permite seguir o fluxo de rastreamento aplicável.

O Issue #5 só deverá ser fechado após confirmação do mesmo comportamento em navegador real.

## Contrato de apresentação

`CcrPresentationModel` agora expõe `automationBoundary` de forma aditiva.

As estruturas anteriores continuam disponíveis:

- sections;
- cards;
- status técnicos;
- actions;
- missingData;
- guardrails;
- sourceIds;
- technical details.

Portanto a simplificação de produto não apaga a auditoria.

## Mapeamento atual da superfície principal

Quando não há input adaptativo pendente:

- `CANNOT_CONCLUDE_SAFELY` → **Não foi possível concluir com segurança**;
- `SPECIFIC_ATTENTION_REQUIRED` → **Atenção específica**;
- `SPECIFIC_CARE_ACTIVE` → **Em acompanhamento específico**;
- `MORE_INFORMATION_NEEDED` → **Próxima informação necessária**;
- `SHARED_DECISION` → **Decisão individual**;
- `ROUTINE_DUE` → **Rastreamento indicado**;
- `ROUTINE_CURRENT` → **Em dia**;
- `SCREENING_NOT_INDICATED` → **Rastreamento não indicado**.

`strategy_selection` e disponibilidade de recurso permanecem como pedidos intermediários explícitos e continuam tendo precedência na interface enquanto aguardam resposta.

## Budget de profundidade na UI

Para `SPECIFIC_ATTENTION_REQUIRED` e `SPECIFIC_CARE_ACTIVE`, a orientação clínica profunda do CCR não é promovida como orientação principal.

A superfície diz que o caso saiu da rotina e precisa de atenção específica. A action profunda e seus metadados continuam disponíveis em **Detalhes técnicos**, permitindo auditoria e preservando o benchmark CCR.

Para rastreamento de rotina (`ROUTINE_DUE`) e escolha compartilhada, a action governada pode continuar visível na superfície principal.

## Invariantes preservados

- nenhuma alteração em `v3/src/engine/**`;
- nenhuma alteração em `v3/src/model/**`;
- nenhuma remoção de resolver ou lógica longitudinal CCR;
- `unknown != no`;
- disponibilidade operacional não reescreve evidência clínica;
- UI não importa engine/model/clinical;
- UI não contém cortes etários ou IDs clínicos;
- provenance permanece alcançável pelo trace original;
- V2 permanece byte-for-byte preservada;
- release gate continua proibindo uso clínico real ou liberação pública.

## Testes de boundary

A suíte específica protege, entre outros:

- rastreamento de rotina elegível → `ROUTINE_DUE`;
- história familiar negativa após H1 → não gera atenção específica;
- hard exclusion → atenção específica;
- FIT+ aberto → atenção específica;
- FIT− posterior não apaga FIT+ anterior;
- disponibilidade local não muda o boundary clínico;
- informação familiar desconhecida mantém incerteza;
- shared decision não vira modalidade automática;
- idade fora da rota de nova ação → `SCREENING_NOT_INDICATED`;
- provenance continua recuperável por `triggerTrackIds`.

Também há teste DOM específico para demonstrar que, após a disponibilidade operacional de colonoscopia ser respondida em um episódio FIT+, a superfície termina em **Atenção específica** sem mostrar a action diagnóstica profunda como orientação principal; a action continua disponível nos detalhes técnicos.

## O que esta fase NÃO prova

Testes DOM simulados não substituem navegador real, teclado real, leitor de tela ou avaliação clínica externa.

A Fase B não:

- generaliza o boundary para outros domínios;
- promove novos tipos para Foundation;
- implementa câncer de mama;
- implementa relatório PDF;
- autoriza uso clínico;
- faz merge ou deploy.

## Próximo gate

Retomar a Fase 7.5 em navegador real na branch `v3-ccr-product-boundary`, com prioridade para:

1. SUS, história familiar negativa, FIT disponível → **Rastreamento indicado**, sem revisão familiar espúria;
2. FIT positivo aberto + disponibilidade de colonoscopia respondida → **Atenção específica**, sem conduta diagnóstica profunda na superfície principal;
3. prior CRC / hard exclusion → **Atenção específica**;
4. BA-A → estratégia antes da disponibilidade;
5. edição de etapa anterior → invalidação dos resultados dependentes;
6. teclado, foco e responsividade;
7. inspeção de privacidade em runtime.

Somente depois desse gate a Fase 7.5 poderá ser considerada concluída e o trabalho de relatório/provenance poderá avançar.