# 40 — Fase 6.H1: activation/readiness do hotfix `family-status`

**Data:** 25/10/2026  
**Branch:** `v3-ccr-family-status-hotfix`  
**PR:** #6 — Draft  
**Candidato:** `crc-0.5.8-phase6-h1-r2-reviewed-draft`

## Pergunta do gate

O hotfix H1, já revisado em R1 e R2, está tecnicamente apto para que o responsável do projeto tome uma decisão explícita e separada de ativação das três regras corrigidas?

## Resultado

### Conteúdo clínico corrigido — READY FOR ACTIVATION DECISION

O candidato satisfaz os pré-requisitos técnicos/governados definidos para que o responsável do projeto possa decidir explicitamente sobre a ativação das três regras H1:

- 43/43 regras `reviewed_by_2`;
- somente `crc.sus.family-status`, `crc.ba-a.family-status` e `crc.intl.family-status` permanecem `lifecycleStatus=draft`;
- as demais 40 regras preservam o snapshot ativo anterior;
- dois reviewer records distintos nas três regras corrigidas;
- R1 = Allan Ramos Costa;
- R2 = `external-physician-r2-private-001`, mesmo médico externo independente utilizado na R2 anterior, sob identidade pública preservada;
- R2 comunicou **aprovação integral** das três traduções corrigidas;
- promoção R1 → R2 alterou somente governança das três regras;
- fontes preservadas, `final`, HTTPS e sourceRefs resolvíveis com locator não vazio;
- policies, terminology e resolvers preservados;
- `engine/**` e `model/**` intactos;
- `candidate.ts` continua apontando para `crc-0.5.5-phase6-active`;
- nenhum merge, deploy, publicação ou uso clínico real foi autorizado.

## Gate automatizado pós-R2/readiness

GitHub Actions no HEAD `3fee293e388d46f17378be017821f186df5191fd`:

- typecheck: ✅
- schema checks: ✅ **62/62**
- suíte total: ✅ **460/460** em **30/30** arquivos
- `familyStatusHotfix.test.ts`: ✅ 6/6
- `familyStatusHotfixR1.test.ts`: ✅ 6/6
- `familyStatusHotfixR2.test.ts`: ✅ 6/6
- `familyStatusHotfixActivationReadiness.test.ts`: ✅ 4/4
- build: ✅
- V2 byte-for-byte: ✅

Os testes comportamentais R1/R2 usam um preview `active` estritamente dentro do teste porque os snapshots governados persistidos permanecem deliberadamente `draft`. Esse preview não constitui ativação nem evento de governança.

## Comportamento clínico validado

- `family=no` → `NotApplicable` no track family-status em SUS, BA-A e Internacional;
- `family=unknown` → `Indeterminate`, nunca convertido em ausência;
- história positiva SUS/BA-A → `ClinicalReviewRequired`;
- Internacional → delegação apenas aos padrões ACG estreitos já governados, com revisão para padrões complexos;
- estratégia FIT/colonoscopia e disponibilidade operacional não são alteradas.

## Ressalva arquitetural

`stance: recommend` permanece sentinel técnico temporário no scaffold das três regras H1. A eventual ativação não transforma esse campo isolado em recomendação clínica. UI, auditoria e futuro relatório devem derivar recomendações do estado/ações finais e da provenance efetivamente utilizada.

Como dívida arquitetural controlada, uma futura semântica explícita `resolver-only/router` continua preferível antes de ampliar esse padrão para novos módulos.

## Separação de gates

Uma eventual promoção para `active` significará apenas que as três traduções corrigidas passaram a compor o conteúdo clínico selecionável/operacional governado do piloto CCR.

Não significará automaticamente:

- merge da PR #6;
- merge da PR #3 ou #4;
- deploy;
- publicação;
- uso em pacientes;
- validação regulatória;
- conclusão da Fase 7.5.

## Próxima decisão requerida

O próximo passo exige **autorização explícita do responsável do projeto** para promover somente as três regras H1 de `draft` para `active`, criar um novo snapshot imutável e atualizar o entrypoint clínico canônico em uma etapa separada.

Sem essa autorização, `crc-0.5.8-phase6-h1-r2-reviewed-draft` permanece não canônico e `candidate.ts` continua em `crc-0.5.5-phase6-active`.
