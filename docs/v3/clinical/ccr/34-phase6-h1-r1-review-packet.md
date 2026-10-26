# 34 — Fase 6.H1: pacote R1 focado do hotfix `family-status`

**Data:** 25/10/2026  
**Branch:** `v3-ccr-family-status-hotfix`  
**PR:** #6 — Draft  
**Candidato:** `crc-0.5.6-phase6-h1-family-status-draft`  
**Escopo R1:** somente `crc.sus.family-status`, `crc.ba-a.family-status`, `crc.intl.family-status`

## Objetivo da revisão

Decidir se o hotfix restaura corretamente a intenção clínica previamente aprovada da Fase 6.4 sem introduzir nova política clínica.

Esta revisão **não** autoriza merge, deploy, uso clínico real nem promoção automática para `active`. A decisão humana R1 deve ser explícita e separada da análise automatizada.

## Defeito que motivou o hotfix

No snapshot ativo `crc-0.5.5-phase6-active`, as três regras `family-status` eram `partially_computable`, `no_formal_recommendation` e possuíam outcome genérico `ClinicalReviewRequired`.

Na Foundation atual, tanto `partially_computable` quanto `no_formal_recommendation` produzem abstention antes da execução do `DomainResolver`; além disso, por segurança, um resolver não pode sobrescrever um `ClinicalReviewRequired` genérico já emitido.

Consequência observada em navegador real: história familiar explicitamente negativa podia coexistir com uma ação válida de rastreamento e um `ClinicalReviewRequired` espúrio em `crc-family-status`.

## Intenção clínica previamente aprovada

### SUS

- história familiar **negativa conhecida**: pode permanecer na rota de rotina se os demais critérios forem atendidos;
- história familiar **desconhecida**: não pode ser convertida em negativa e pode reter a estratégia final;
- história familiar **positiva relevante**: sai da automação simples e requer revisão; nenhum algoritmo ACG é importado silenciosamente.

### Brasil ampliado BA-A

- história familiar **negativa conhecida**: pode seguir BA-A;
- história familiar **desconhecida**: não assumir ausência;
- história familiar **positiva**: revisão clínica; não importar ACG automaticamente.

### Internacional

- história familiar **negativa**: risco habitual;
- história **desconhecida/incompleta**: preservar incerteza;
- padrões ACG estreitos e suficientemente classificados: delegar aos tracks familiares específicos;
- histórias complexas/contraditórias ou fora dos padrões representados: revisão clínica.

## Mudança executável proposta

O hotfix não altera policies, fontes, terminology, resolvers, engine ou model.

Somente as três regras-base `family-status` tornam-se scaffolds neutros para permitir a execução do `familyStatusResolver64` existente:

- `computability: computable`;
- `stance: recommend`;
- `actions: []`;
- `outcome: NotApplicable`;
- `lifecycleStatus: draft`;
- `reviewStatus: source_verified`;
- revisões humanas anteriores removidas para exigir re-review;
- `sourceRefs` preservados.

O resolver existente então produz:

| Entrada familiar | SUS | BA-A | Internacional |
|---|---|---|---|
| `no` | `NotApplicable` | `NotApplicable` | `NotApplicable` |
| `unknown` / incompleta | `Indeterminate` | `Indeterminate` | `Indeterminate` |
| positiva relevante | `ClinicalReviewRequired` | `ClinicalReviewRequired` | delegação aos tracks ACG quando padrão estreito; revisão quando complexo |

## Validação executável

Gate automatizado verde do candidato:

- typecheck ✅
- schema checks ✅ 62/62
- suíte total ✅ 444/444 em 27 arquivos
- `familyStatusHotfix.test.ts` ✅ 6/6
- build ✅
- V2 byte-for-byte ✅

As regressões verificam explicitamente `no`, `unknown`, `yes`, delegação Internacional e preservação do fluxo BA-A FIT.

## Ressalva semântica/arquitetural que o R1 deve conhecer

`stance: recommend` é usado aqui **como compatibilidade técnica do scaffold**, e não como afirmação de que a fonte faz uma recomendação clínica genérica no track `family-status`.

Isso ocorre porque a Foundation atual converte `partially_computable` e `no_formal_recommendation` em `ClinicalReviewRequired` antes que o resolver possa classificar o caso.

Mitigações presentes:

- o scaffold possui `actions: []`;
- o outcome genérico é `NotApplicable`;
- a decisão clínica final é produzida pelo resolver governado;
- a rationale documenta explicitamente a natureza técnica do scaffold;
- nenhum relatório/exportador existe ainda que trate `stance` isoladamente como recomendação ao usuário.

### Implicação futura obrigatória

Antes de implementar `Exportar relatório`, a camada de provenance/apresentação **não deve interpretar `stance: recommend` isoladamente como recomendação clínica**. Recomendações exportadas devem derivar de ações/estado final e provenance efetivamente usados.

Como melhoria arquitetural futura, considerar um tipo/semântica explícita de regra `resolver-only/router` para remover a necessidade desse sentinel técnico. Isso não é necessário para o hotfix mínimo, mas reduz ambiguidade semântica futura.

## Checklist R1 focado

Aprovar somente se todos forem verdadeiros:

- [ ] `family=no` não gera revisão clínica por si só em SUS, BA-A ou Internacional.
- [ ] `family=unknown` continua diferente de `family=no`.
- [ ] história positiva SUS/BA-A continua conservadoramente em revisão clínica.
- [ ] nenhuma policy brasileira importa automaticamente intervalos ACG.
- [ ] Internacional continua delegando somente padrões ACG previamente representados.
- [ ] histórias complexas/incompletas continuam em abstention/indeterminação apropriada.
- [ ] FIT/colonoscopia e disponibilidade operacional não são alterados pelo hotfix.
- [ ] `sourceRefs` das três regras permanecem os mesmos.
- [ ] nenhuma regra fora das três `family-status` muda.
- [ ] `engine/**` e `model/**` permanecem intactos.
- [ ] a exceção semântica de `stance: recommend` como scaffold técnico é aceita conscientemente e registrada como dívida arquitetural controlada.

## Avaliação preparatória do assistente

**Resultado técnico-clínico preparatório: APROVÁVEL PARA R1, COM RESSALVA SEMÂNTICA DOCUMENTADA.**

A mudança restaura o comportamento já aprovado nas policies e não introduz nova recomendação clínica. A ressalva é a utilização técnica de `stance: recommend` em uma regra sem ações; isso deve permanecer documentado e não pode ser usado isoladamente na futura geração de relatório/provenance.

Esta avaliação não é uma aprovação humana e não deve alterar `reviewStatus`.

## Decisão humana R1 a registrar

O revisor humano deve escolher explicitamente uma das opções:

### A — Aprovar as três traduções corrigidas

Autoriza etapa separada para registrar `reviewed_by_1` nas três regras do candidato, com identidade/data explícitas, seguida de gate completo.

### B — Aprovar com condição adicional

Descrever condição necessária antes da promoção R1.

### C — Solicitar mudanças

Descrever a divergência clínica, de provenance ou de semântica executável. O candidato permanece `source_verified` até nova revisão.

A eventual aprovação R1 **não substitui R2 independente**.