# 33 — Fase 6.H1: hotfix clínico do family-status

**Data:** 25/10/2026. **Branch:** `v3-ccr-family-status-hotfix`. **Issue:** #5.

## Motivo

A validação real em navegador da Fase 7.5 revelou que uma pessoa com história familiar explicitamente negativa podia receber simultaneamente uma ação de rastreamento válida e um estado global de `ClinicalReviewRequired` no track `crc-family-status`.

O defeito não estava na UI nem na normalização do formulário. A UI registrava `familyHistory = no`, a normalização emitia o fato com `presence: "no"` e `classifyFamilyHistory()` corretamente classificava esse fato como `kind: "none"`.

## Causa raiz

As três regras `family-status` do snapshot ativo (`crc.sus.family-status`, `crc.ba-a.family-status`, `crc.intl.family-status`) tinham como estado genérico `ClinicalReviewRequired`.

O engine deliberadamente não permite que um `DomainResolver` sobreponha um estado genérico que já seja `ClinicalReviewRequired`. Portanto, o `familyStatusResolver64`, embora codificasse corretamente:

- negativo -> `NotApplicable`;
- desconhecido/incompleto -> `Indeterminate`;
- positivo SUS/BA-A -> `ClinicalReviewRequired`;
- padrão Internacional estreito -> delegação aos tracks familiares dedicados;
- padrão complexo -> `ClinicalReviewRequired`;

não era executado quando a regra-base já havia abstido.

## Correção proposta

Não alterar retroativamente o snapshot ativo `crc-0.5.5-phase6-active` nem os snapshots históricos.

Foi criado um candidato separado:

`crc-0.5.6-phase6-h1-family-status-draft`

O candidato transforma somente as três regras `family-status` em **scaffolds neutros de resolver**:

- `outcome: NotApplicable`;
- `actions: []`;
- `lifecycleStatus: draft`;
- `reviewStatus: source_verified`;
- revisões humanas das três regras removidas, pois o comportamento executável foi alterado;
- `sourceRefs` preservados.

Com isso, o resolver existente volta a ser a camada que determina o estado final de acordo com a classificação da história familiar.

## O que NÃO mudou

- `v3/src/engine/**`: nenhuma alteração;
- `v3/src/model/**`: nenhuma alteração;
- policies: nenhuma alteração;
- terminologia: nenhuma alteração;
- resolvers clínicos: nenhuma alteração;
- regras que não sejam as três `family-status`: byte-for-byte preservadas no candidato;
- snapshot ativo `crc-0.5.5-phase6-active`: preservado;
- `candidate.ts`: não apontado para o hotfix;
- nenhuma ativação, merge, deploy ou liberação pública.

## Regressões obrigatórias

A suíte dedicada `familyStatusHotfix.test.ts` cobre:

1. reprodução do defeito no snapshot ativo para história familiar negativa;
2. SUS + história familiar negativa -> `family-status = NotApplicable`;
3. BA-A + história familiar negativa -> `family-status = NotApplicable`;
4. Internacional + história familiar negativa -> `family-status = NotApplicable`;
5. história familiar desconhecida continua diferente de negativa e produz `Indeterminate`;
6. história familiar positiva em SUS/BA-A preserva `ClinicalReviewRequired`;
7. padrão Internacional de alto risco é delegado ao track ACG dedicado;
8. estratégia FIT do BA-A permanece `Due` após história familiar negativa;
9. as três regras alteradas voltam a `draft/source_verified` e preservam suas fontes;
10. todas as demais regras permanecem idênticas ao snapshot ativo.

## Governança

Este arquivo **não autoriza ativação**.

Como houve alteração de comportamento clínico executável, as três regras precisam passar novamente por revisão humana conforme o modelo de governança do projeto. O preview de teste promove as regras apenas com um identificador explicitamente sintético (`phase6-h1-test-preview-only-not-a-clinical-review`) para permitir regressão automatizada; isso não conta como R1 ou R2 real.

Após revisão humana adequada, deve ser criado um snapshot governado subsequente e somente então o entrypoint canônico `candidate.ts` poderá apontar para a versão corrigida.

## Impacto sobre Fase 7.5 e exportação

A Fase 7.5 permanece bloqueada para fechamento até que o hotfix seja revisado e incorporado ao candidato clínico canônico.

A implementação de `Exportar relatório` também permanece posterior a esse gate: um relatório não deve ser gerado sobre uma combinação conhecida de ação válida + abstention espúria.
