# 15 — Fase 6.0: prova de representabilidade do CCR

**Data:** 24/10/2026. **Branch:** `v3-ccr-rules-pilot`. **PR:** #3 (Draft).

## Objetivo

Antes de criar regras clínicas de produção, provar que os comportamentos mais difíceis do piloto CCR podem atravessar a Foundation V3 congelada sem alterar `v3/src/engine/**` nem `v3/src/model/**`.

Os artefatos desta subfase são **fixtures técnicas de teste**, não rules clínicas publicáveis. Eles não herdam automaticamente o `reviewed_by_1` das proposições clínicas da Fase 5.

## Implementação do gate

Arquivos adicionados:

- `v3/tests/ccr/representability.fixtures.ts`
- `v3/tests/ccr/representability.test.ts`

O teste usa o `evaluatePatient()` real, rules/policies tipadas e DomainResolvers registrados pelo mecanismo público da Foundation.

## Sentinelas executados

1. `never_performed` confirmado pode gerar `Due` somente quando autorizado pela rule;
2. FIT negativo válido recente gera `Current`;
3. FIT negativo com intervalo expirado gera `Due` sem grace period inventado;
4. FIT+ aberto suprime FIT rotineiro e mantém colonoscopia em `InFollowUp`;
5. FIT− posterior não resolve FIT+ anterior;
6. FIT+ seguido por colonoscopia normal high-quality posterior pode encerrar follow-up e fornecer cobertura atual;
7. colonoscopia inadequada não resolve FIT+;
8. exames no mesmo dia não ganham ordem temporal fictícia;
9. histórico `unknown` não vira `Due` por presunção;
10. preferência futura por FIT não apaga cobertura atual de colonoscopia;
11. o mesmo paciente de 47 anos pode ter resultados diferentes nas policies SUS, BA-A e Internacional sem contaminação entre policies;
12. Internacional 76–85 pode ser representado como `SharedDecision`, não `Due` automático;
13. história familiar pode ser automatizada na policy Internacional enquanto SUS/BA-A abstêm/revisam;
14. história familiar desconhecida pode coexistir com indicação mínima conhecida, bloqueando apenas a estratégia final;
15. encaminhamento não equivale a `HandedOff`; transferência confirmada pode produzir `HandedOff`;
16. recurso indisponível altera a rota operacional, não o estado clínico `Due`.

Há ainda um 17º teste de escopo que garante que estas fixtures permanecem no tópico sintético `ccr-representability`.

## Resultado do CI

Commit corrigido: `6aa6396e886d4a6ee3574ece7e1b0d12bc0c6166`.

Workflow `V3 foundation` da PR #3: **SUCCESS**.

- `npm run typecheck`: verde;
- `npm run schema:check`: 62/62 testes verdes;
- `npm test`: **259/259 testes verdes**;
  - 17 testes CCR de representabilidade;
  - 242 testes preexistentes da Foundation;
- `npm run build`: verde;
- preservação byte-for-byte da V2: verde.

## Conclusão do gate 6.0a

**Nenhum contraexemplo arquitetural obrigatório foi demonstrado pelos 16 sentinelas.** Para este conjunto crítico, CCR é representável usando:

- tracks independentes;
- qualifying events e schedules existentes;
- `historyKnowledge` existente;
- policies isoladas;
- estados já definidos (`Current`, `Due`, `Indeterminate`, `InFollowUp`, `SharedDecision`, `ClinicalReviewRequired`, `HandedOff`, `NotApplicable`);
- Care Setting existente;
- DomainResolvers puros e limitados.

O caso mais sensível — cobertura atual por colonoscopia com escolha futura de FIT — foi representado sem fabricar `Current`: a cobertura fica em um track próprio já sustentado por qualifying evidence, enquanto a estratégia futura permanece sem ação enquanto a cobertura está válida.

Da mesma forma, o FIT+ aberto foi coordenado sem cross-track supersession: o resolver do track de rotina pode retornar `NotApplicable` enquanto o follow-up permanece `InFollowUp`, impedindo ação FIT redundante.

## O que este resultado NÃO prova

- não prova que o ruleset clínico definitivo está correto;
- não transforma fixtures em regras publicáveis;
- não valida todos os 60 casos adversariais;
- não valida ainda troca de estratégia em todas as fronteiras temporais;
- não substitui revisão humana da tradução proposição → RuleDefinition;
- não autoriza mudança da Foundation.

## Próximo gate

### Fase 6.1 — contrato clínico executável

Criar conteúdo CCR de produção em diretório próprio, mantendo engine/model intactos:

- terminologia;
- source metadata;
- action IDs e decision support IDs;
- policies SUS / BA-A / Internacional;
- primeiras rules simples de idade e rotina;
- regras novas inicialmente como tradução clínica ainda não promovida para release público;
- testes que liguem cada rule às proposições aprovadas e às fontes da Fase 5.

Se qualquer novo caso exigir Foundation change, interromper a implementação e registrar um contraexemplo mínimo antes de modificar schema/engine.
