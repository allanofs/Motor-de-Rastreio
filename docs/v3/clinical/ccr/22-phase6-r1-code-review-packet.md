# 22 — Pacote R1 de revisão humana da tradução executável CCR

**Data:** 24/10/2026  
**Branch:** `v3-ccr-rules-pilot`  
**PR:** #3 — Draft  
**Candidato:** `crc-0.5.0-phase6.5-draft`  
**Entrypoint canônico:** `ccrCandidateRuleset`, `ccrCandidatePolicies`, `ccrCandidateResolvers`

## Objetivo

Este pacote existe para uma decisão humana específica:

> **A implementação TypeScript traduz corretamente as decisões clínicas já aprovadas na Fase 5?**

Aprovar a especificação clínica e aprovar o código são atos diferentes. A Fase 5 aprovou o conteúdo clínico. A Fase 6 demonstrou representabilidade e segurança técnica. Este pacote serve para a primeira revisão humana explícita da **tradução executável**.

A aprovação deste pacote pode autorizar `reviewed_by_1` nas regras aprovadas. Ela **não** autoriza release público, não substitui segunda revisão médica independente e não transforma o Motor em ferramenta autônoma de paciente.

## Estado antes da revisão

```text
lifecycleStatus = draft
reviewStatus = source_verified
governance.reviews = []
```

Nenhuma regra deve ser promovida apenas porque os testes passaram.

## Inventário a revisar

| Bloco | Policy | Regras | Principal tradução clínica |
|---|---|---:|---|
| Routine/população | SUS | 3 | <50 fora da rotina; 50–75 FIT q2; >=76 sem nova rotina |
| FIT+ / pós-FIT | SUS | 2 | colonoscopia após FIT+; relógio futuro brasileiro abstém |
| História familiar | SUS | 1 | HF positiva relevante -> revisão, sem ACG |
| Risco especial | SUS | 4 | CRC/pólipo-surveillance/DII/hereditário -> revisão |
| **SUS total** |  | **10** |  |
| Routine/idade | BA-A | 3 | <45 sem rotina; 45–49 shared decision; >75 revisão |
| Estratégias 50–75 | BA-A | 3 | escolha humana; FIT q2; colonoscopia q10 |
| FIT+ / pós-FIT | BA-A | 2 | via brasileira; relógio pós-colo normal abstém |
| História familiar | BA-A | 1 | HF positiva -> revisão, sem importar ACG |
| Risco especial | BA-A | 4 | hard exclusions -> revisão |
| **BA-A total** |  | **13** |  |
| População | Internacional | 5 | <45; 45–49 B; 50–75 A; 76–85 C; >85 stop routine |
| Estratégias | Internacional | 4 | FIT anual ou colonoscopia q10, escolha humana |
| FIT+ / pós-FIT | Internacional | 2 | colonoscopia após FIT+; normal high-quality -> q10 |
| História familiar ACG | Internacional | 5 | q5 high-risk; 1 FDR >=60; 1 SDR average-risk |
| Risco especial | Internacional | 4 | average-risk exclusions -> revisão |
| **Internacional total** |  | **20** |  |
| **TOTAL** |  | **43** |  |

## Checklist clínico 1 — escopo e segurança global

Aprovar somente se todos forem verdadeiros:

- [ ] O Motor é usado em contexto preventivo confirmado pelo profissional.
- [ ] Ausência de confirmação do contexto não dispara triagem de sintomas nem diagnóstico.
- [ ] `unknown` não é tratado como `false`.
- [ ] `not_asked` permanece distinguível de conhecido negativo.
- [ ] `never_performed` só é usado quando realmente confirmado para CCR global.
- [ ] Exame com data futura em relação ao `asOf` não gera Current/Due clínico silencioso.
- [ ] Datas parciais/same-day não recebem ordem temporal inventada.
- [ ] `ClinicalReviewRequired` é usado para conteúdo deliberadamente fora do piloto.
- [ ] `HandedOff` exige assunção efetiva do cuidado; referral/order/agendamento não bastam.
- [ ] Care Setting altera rota operacional, não a evidência ou elegibilidade científica.

## Checklist clínico 2 — SUS

- [ ] Faixa de rotina = 50–75 anos inclusive.
- [ ] FIT é a estratégia nuclear da rotina.
- [ ] FIT negativo final válido ancora 2 anos pela coleta/realização.
- [ ] Pending/invalid/inconclusive não ancoram intervalo.
- [ ] FIT+ abre investigação por colonoscopia e não recebe deadline universal inventado.
- [ ] FIT negativo posterior nunca resolve FIT+ anterior.
- [ ] Colonoscopia incompleta/inadequada/insuficiente não resolve FIT+.
- [ ] Colonoscopia normal high-quality posterior pode resolver o episódio diagnóstico.
- [ ] Próximo relógio SUS após FIT+ -> colonoscopia normal continua não automatizado.
- [ ] >=76 impede nova rotina, mas não apaga follow-up diagnóstico aberto.
- [ ] HF positiva relevante não recebe ACG silenciosamente.
- [ ] Hard exclusions terminam explicitamente em revisão, não apenas `NotApplicable`.

## Checklist clínico 3 — Brasil ampliado BA-A

- [ ] <45: sem rotina average-risk automática.
- [ ] 45–49: `SharedDecision`, não `Due` automático.
- [ ] 50–75: FIT q2 é default de apresentação.
- [ ] Colonoscopia primária q10 é alternativa selecionável.
- [ ] A escolha FIT/colonoscopia é humana e as estratégias não são oferecidas simultaneamente como ações rotineiras redundantes.
- [ ] Troca futura de estratégia não apaga cobertura válida prévia.
- [ ] FIT+ é follow-up diagnóstico, não troca de estratégia.
- [ ] >75 exige revisão/individualização, sem extensão automática.
- [ ] HF positiva relevante exige revisão e não importa algoritmo ACG.
- [ ] Próximo relógio brasileiro após FIT+ -> colo normal permanece não automatizado.

## Checklist clínico 4 — Internacional

- [ ] 45–49 = recomendação USPSTF Grade B.
- [ ] 50–75 = recomendação USPSTF Grade A.
- [ ] 76–85 = Grade C seletiva/compartilhada, sem `Due` automático por never-screened isolado.
- [ ] >85 encerra routine screening sem inventar Grade D.
- [ ] FIT selecionado = anual.
- [ ] Colonoscopia primária normal high-quality = q10.
- [ ] FIT+ exige colonoscopia; FIT posterior negativo não resolve.
- [ ] FIT+ -> colonoscopia normal high-quality, average-risk e sem novo FIT+ = q10.
- [ ] ACG só é usado na policy Internacional.
- [ ] 1 FDR <60 ou >=2 FDR -> colonoscopia aos 40/10 anos antes do mais jovem, q5.
- [ ] 1 FDR >=60 -> iniciar aos 40/10 anos antes e depois seguir modalidades/intervalos average-risk; não q5 universal.
- [ ] 1 SDR isolado -> average-risk se não houver outros modificadores.
- [ ] História familiar incompleta/complexa produz abstensão/revisão, não inferência agressiva.

## Checklist técnico 5 — longitudinalidade

- [ ] FIT+ aberto suprime ações de screening redundantes.
- [ ] Colonoscopia anterior ao FIT+ não resolve o gatilho posterior.
- [ ] Um novo FIT+ depois de episódio anterior resolvido abre novo episódio.
- [ ] Resultado de colonoscopia pending não fecha episódio.
- [ ] Pólipo/lesão/câncer pós-FIT sai do piloto automático para revisão/handoff conforme evidência real.
- [ ] `recordsUsed` permanece rastreável dentro de `recordsConsidered` nos fluxos auditados.
- [ ] Reordenar fatos/eventos semanticamente idênticos não muda o resultado clínico.
- [ ] Mesma requisição produz saída determinística.

## Checklist técnico 6 — fontes e policies

Allowlist que deve permanecer verdadeiro:

```text
SUS  -> B12
BA-A -> B12 + S01
INTL -> I01 + I03 + I04 + I05
```

- [ ] Nenhuma regra SUS usa ACG/USPSTF/USMSTF.
- [ ] BA-A não importa ACG/USPSTF/USMSTF.
- [ ] Internacional não usa B12/S01 para governar suas decisões.
- [ ] ACS 2026 permanece fora do bundle executável selecionado.
- [ ] Novos testes sanguíneos/RNA/CTC permanecem fora do piloto.
- [ ] Source refs possuem locator não vazio.
- [ ] Grade USPSTF só aparece quando explicitamente verificada.

## Evidência técnica disponível para a decisão

No fechamento da Fase 6.6:

- 43 regras candidatas;
- 167 testes CCR específicos;
- 409/409 testes totais;
- 62/62 schema checks;
- typecheck verde;
- build verde;
- V2 preservada byte-for-byte;
- 0 mudanças em `v3/src/engine/**`;
- 0 mudanças em `v3/src/model/**`;
- PR #3 permanece Draft.

## Itens que continuam deliberadamente NÃO resolvidos pela promoção R1

A eventual aprovação das 43 traduções **não** deve autorizar:

- relógio automático SUS/BA-A depois de FIT+ -> colonoscopia normal;
- threshold bruto universal de FIT;
- hard deadline após FIT+ ou preparo inadequado;
- surveillance completa pós-polipectomia;
- algoritmos automáticos de Lynch/FAP/DII;
- novas modalidades ACS 2026;
- geografia/rota local automática;
- release público sem segunda revisão médica independente.

## Decisão de revisão a registrar

### Opção A — aprovar todas as 43 traduções

Significa que, após conferir este pacote e o relatório 6.6, o revisor humano considera que **o código candidato representa corretamente a especificação R1 da Fase 5**. Isso autoriza uma etapa separada de promoção das 43 regras para `reviewed_by_1`, com reviewer/data explícitos, seguida por nova execução completa dos testes.

### Opção B — aprovar parcialmente

Listar os blocos/rules aprovados e manter os demais `draft/source_verified`. Nenhuma policy deve ser apresentada como clinicamente revisada se uma regra necessária ao seu fluxo continuar pendente sem indicação explícita de incompletude.

### Opção C — solicitar mudanças

Descrever a divergência clínica ou de tradução. A correção deve atualizar regra/resolver + golden correspondente antes de nova revisão.

## Registro recomendado da decisão humana

A decisão deve mencionar explicitamente:

1. versão candidata revisada: `crc-0.5.0-phase6.5-draft`;
2. escopo: tradução executável CCR, não release público;
3. resultado: aprovação total / parcial / mudanças requeridas;
4. identidade do revisor;
5. data da revisão;
6. confirmação de que segunda revisão médica independente continua pendente antes de release público.
