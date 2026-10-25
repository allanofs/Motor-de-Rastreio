# 37 — Fase 6.H1: pacote enxuto para R2 independente

**Data de preparação:** 25/10/2026  
**Branch:** `v3-ccr-family-status-hotfix`  
**PR:** #6 — Draft  
**Candidato de entrada:** `crc-0.5.7-phase6-h1-r1-draft`  
**Escopo R2:** somente `crc.sus.family-status`, `crc.ba-a.family-status`, `crc.intl.family-status`

## Pergunta da revisão

> As três traduções executáveis corrigidas preservam de forma correta e segura a intenção clínica de história familiar previamente aprovada, sem introduzir recomendação nova, perda de incerteza ou importação silenciosa de algoritmo estrangeiro?

R2 deve ser realizada por revisor humano distinto do R1. O resultado precisa ser explícito: aprovação integral, aprovação parcial ou mudanças requeridas.

## Defeito original

No snapshot `crc-0.5.5-phase6-active`, a regra-base `family-status` podia gerar `ClinicalReviewRequired` mesmo quando a história familiar era explicitamente negativa. Isso ocorria antes do resolver clínico conseguir distinguir `no`, `unknown`, positiva e padrões complexos.

## Correção revisada em R1

As três regras-base foram convertidas em scaffolds neutros resolver-safe:

- `computability: computable`;
- `stance: recommend` — sentinel técnico, não recomendação clínica por si só;
- `actions: []`;
- `outcome: NotApplicable`;
- classificação final delegada ao `familyStatusResolver64` já existente.

O R1 foi aprovado por Allan Ramos Costa em 25/10/2026. As três regras permanecem `lifecycleStatus=draft` e estão agora `reviewed_by_1`.

## Resultado clínico esperado

| Situação | SUS | BA-A | Internacional |
|---|---|---|---|
| história familiar negativa conhecida | `NotApplicable` no track family-status; seguir rota habitual se demais critérios permitirem | idem | idem |
| história desconhecida/incompleta | `Indeterminate`; não assumir ausência | `Indeterminate`; não assumir ausência | `Indeterminate`; preservar indicação mínima quando aplicável, mas reter estratégia final |
| história positiva relevante | `ClinicalReviewRequired`; sem algoritmo ACG | `ClinicalReviewRequired`; sem algoritmo ACG | delegar apenas padrões ACG estreitos já representados; complexos continuam em revisão |

## O que R2 deve conferir

### 1. Semântica clínica

- história negativa não produz revisão clínica apenas por ser conhecida;
- `unknown` continua diferente de `no`;
- SUS/BA-A não importam automaticamente ACG;
- história positiva brasileira continua conservadoramente em revisão;
- Internacional continua usando ACG apenas nos padrões já governados;
- padrão complexo, contraditório ou insuficiente não é forçado para average-risk.

### 2. Não regressão

- FIT/colonoscopia permanecem governados pelas regras de estratégia já existentes;
- disponibilidade de recurso continua sendo operacional, não evidência clínica;
- nenhuma regra fora das três `family-status` mudou;
- policies, terminology, resolvers, engine e model não foram alterados pelo hotfix.

### 3. Ressalva arquitetural explícita

`stance: recommend` é necessário no Foundation atual para que o resolver execute. O scaffold não possui ações e seu outcome genérico é `NotApplicable`. Portanto, R2 deve avaliar se essa solução mínima é aceitável como tradução executável temporária, sabendo que:

- `stance` não pode ser interpretado isoladamente por UI, auditoria ou futuro relatório;
- a recomendação exportada deve derivar do estado/ação final e da provenance efetivamente usada;
- uma futura semântica `resolver-only/router` seria preferível para eliminar esse sentinel técnico.

## Evidência de regressão automatizada

Gate pós-R1 no commit `ee3d24024d56b8cfe05b248ebe1f5a2949bbd03a`:

- typecheck ✅
- schema checks ✅ 62/62
- suíte total ✅ 450/450 em 28 arquivos
- `familyStatusHotfix.test.ts` ✅ 6/6
- `familyStatusHotfixR1.test.ts` ✅ 6/6
- build ✅
- V2 byte-for-byte ✅

O comportamento clínico do snapshot R1 é verificado por preview ativo exclusivamente dentro do teste; o snapshot persistido permanece `draft`.

## Fontes/policies que devem governar a revisão

- SUS: `05-sus-policy.md` + fontes declaradas da regra;
- Brasil ampliado BA-A: `06-brasil-ampliado-policy.md` + fontes declaradas da regra;
- Internacional: `07-international-policy.md`, com ACG apenas como suplemento de história familiar;
- desenho de história familiar: `19-phase6-4-family-history.md`.

## Decisão R2 permitida

### A — Aprovação integral

As três traduções corrigidas são clinicamente adequadas e podem ser promovidas, em etapa separada, para `reviewed_by_2`.

### B — Aprovação parcial

Listar quais regras são aprovadas e quais permanecem pendentes. Não promover policy como integralmente revisada se uma regra necessária continuar pendente.

### C — Mudanças requeridas

Descrever divergência clínica, de segurança, de provenance ou de semântica executável. Corrigir código + regressões antes de nova R2.

## Limites

R2 aprovada ainda **não** significa:

`reviewed_by_2 = active = merge = deploy = uso clínico real`

Ativação continuará sendo um gate posterior e separado.
