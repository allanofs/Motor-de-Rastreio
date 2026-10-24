# 25 — Formulário de segunda revisão médica independente (R2) — CCR

**Candidato-base atual:** `crc-0.5.1-phase6-r1-draft`  
**PR:** #3 — Draft  
**Objetivo:** registrar uma revisão médica humana independente da tradução executável do módulo de rastreamento colorretal.

> Este formulário não deve ser preenchido pelo autor/revisor R1. O segundo revisor precisa ser uma pessoa diferente e deve revisar o conteúdo clínico, não apenas confirmar que os testes passam.

> **BLOQUEADO PARA ASSINATURA FINAL:** antes de `reviewed_by_2`, aplicar e testar R2-01/R2-02, reconfirmar R1 e então entregar a versão corrigida ao segundo médico.

## Identificação do revisor R2

- Nome completo:
- Profissão/especialidade:
- Registro profissional (opcional no repositório público; pode ser mantido em registro privado de governança):
- Instituição/afiliação (opcional):
- Data da revisão:
- Conflitos de interesse relevantes:

## Material mínimo revisado

- [ ] `21-phase6-6-final-audit.md`
- [ ] `23-phase6-r1-freeze.md`
- [ ] `24-phase6-r2-independent-audit.md`
- [ ] regras em `v3/src/clinical/ccr/rules/**`
- [ ] resolvers em `v3/src/clinical/ccr/resolvers/**`
- [ ] fontes em `v3/src/clinical/ccr/sources.ts`
- [ ] goldens críticos: `longitudinal.test.ts`, `familyHistory.test.ts`, `goldenSafety.test.ts`, `specialRisk.test.ts`

## Checklist clínico

### Segurança global
- [ ] Suporte exclusivamente a rastreamento preventivo confirmado pelo profissional.
- [ ] Sem triagem automática de sintomas/urgência.
- [ ] `unknown`, `not_asked` e `never_performed` distintos.
- [ ] FIT+ aberto suprime screening redundante.
- [ ] `HandedOff` exige assunção real do cuidado.
- [ ] hard exclusions produzem revisão explícita.

### SUS
- [ ] 50–75 inclusive.
- [ ] FIT de rotina q2.
- [ ] FIT+ -> colonoscopia diagnóstica.
- [ ] FIT− posterior não encerra FIT+ anterior.
- [ ] colonoscopia inadequada/incompleta não encerra FIT+.
- [ ] após colonoscopia normal pós-FIT+, episódio pode fechar, mas próximo clock SUS não é automatizado.
- [ ] >=76 sem nova rotina, sem apagar follow-up aberto.
- [ ] história familiar positiva relevante -> revisão, sem ACG silencioso.

### Brasil ampliado BA-A
- [ ] <45 sem rotina automática.
- [ ] 45–49 shared decision/review como curadoria explícita.
- [ ] 50–75 FIT q2 como default curatorial.
- [ ] colonoscopia primária q10 como alternativa elegível.
- [ ] escolha de estratégia humana.
- [ ] >75 individualização/revisão.
- [ ] história familiar positiva -> revisão, sem ACG silencioso.

### Internacional
- [ ] 45–49 Grade B para a decisão de rastrear.
- [ ] 50–75 Grade A para a decisão de rastrear.
- [ ] 76–85 Grade C seletivo, sem Due automático.
- [ ] >85 fim da rotina sem Grade D inventado.
- [ ] FIT anual / colonoscopia q10 como opções elegíveis.
- [ ] FIT+ -> colonoscopia.
- [ ] pós-FIT normal high-quality -> q10 se average-risk.
- [ ] ACG apenas na Internacional.
- [ ] 1 FDR <60 ou >=2 FDR -> colonoscopia q5, início 40/10 anos antes.
- [ ] 1 FDR >=60 -> início 40/10 anos antes, depois opções average-risk.
- [ ] 1 SDR isolado -> average-risk se sem modificadores.

## Findings obrigatoriamente resolvidos

### R2-01 — Grade USPSTF
- [ ] Grade A/B permanece apenas na recomendação populacional por idade e não é apresentado como graduação própria de FIT/colonoscopia.

### R2-02 — fonte SUS
- [ ] Portaria SAES/MS nº 5.215/2026 sustenta idade 50–75/FIT bienal.
- [ ] `B12` está corrigido para 2ª edição 2025 e restrito ao conteúdo diagnóstico que realmente sustenta.
- [ ] Todos os sourceRefs SUS de história familiar/hard exclusions foram revalidados.

## Resultado

- [ ] **APROVADO integralmente para `reviewed_by_2`**
- [ ] **APROVADO parcialmente**
- [ ] **MUDANÇAS REQUERIDAS**

### Regras/blocos aprovados parcialmente


### Mudanças requeridas


### Comentários


## Declaração de independência

Ao aprovar, o revisor declara que:

1. não é o revisor R1;
2. revisou conteúdo clínico, fontes e tradução executável;
3. considera corretos os itens aprovados para a policy declarada;
4. entende que `reviewed_by_2` não significa `active`, release público ou merge;
5. informou conflitos de interesse relevantes.

## Texto recomendado

> Eu, **[NOME DO REVISOR]**, após revisão independente do candidato CCR **[VERSÃO CORRIGIDA]** em **[DATA]**, aprovo as 43 traduções executáveis como segunda revisão médica (`reviewed_by_2`). Confirmo que R2-01 e R2-02 foram resolvidos e que esta aprovação não autoriza automaticamente `lifecycleStatus=active`, release público ou merge da PR #3.

Se parcial, substituir “as 43 traduções” pela lista exata aprovada.