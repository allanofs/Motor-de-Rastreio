# 25 — Formulário de segunda revisão médica independente (R2) — CCR

**Candidato-base atual:** `crc-0.5.1-phase6-r1-draft`  
**PR:** #3 — Draft

> **BLOQUEADO PARA ASSINATURA FINAL:** aplicar e testar R2-01/R2-02, reconfirmar R1 e somente então entregar a versão corrigida ao segundo médico.

## Revisor R2

- Nome completo:
- Profissão/especialidade:
- Registro profissional (opcional no repositório público):
- Instituição/afiliação (opcional):
- Data:
- Conflitos de interesse:

## Material mínimo

- [ ] `21-phase6-6-final-audit.md`
- [ ] `23-phase6-r1-freeze.md`
- [ ] `24-phase6-r2-independent-audit.md`
- [ ] `v3/src/clinical/ccr/rules/**`
- [ ] `v3/src/clinical/ccr/resolvers/**`
- [ ] `v3/src/clinical/ccr/sources.ts`
- [ ] goldens críticos

## Segurança global

- [ ] Módulo restrito a rastreamento preventivo confirmado pelo profissional.
- [ ] Sem triagem de sintomas/urgência.
- [ ] `unknown` / `not_asked` / `never_performed` distintos.
- [ ] FIT+ aberto suprime screening redundante.
- [ ] `HandedOff` exige assunção real do cuidado.
- [ ] hard exclusions produzem revisão explícita.

## SUS

- [ ] 50–75 inclusive; FIT q2.
- [ ] FIT+ -> colonoscopia diagnóstica.
- [ ] FIT− posterior não encerra FIT+ anterior.
- [ ] colonoscopia inadequada/incompleta não fecha FIT+.
- [ ] pós-FIT+ normal: episódio pode fechar, próximo clock SUS não automatizado.
- [ ] >=76 sem nova rotina, sem apagar follow-up.
- [ ] HF positiva relevante -> revisão, sem ACG silencioso.

## BA-A

- [ ] <45 sem rotina.
- [ ] 45–49 shared decision como curadoria explícita.
- [ ] 50–75 FIT q2 default curatorial.
- [ ] colonoscopia primária q10 como alternativa.
- [ ] estratégia escolhida por humano.
- [ ] >75 individualização/revisão.
- [ ] HF positiva -> revisão.

## Internacional

- [ ] 45–49 Grade B para a decisão de rastrear.
- [ ] 50–75 Grade A.
- [ ] 76–85 Grade C seletivo.
- [ ] >85 fim da rotina sem Grade D inventado.
- [ ] FIT anual / colonoscopia q10.
- [ ] FIT+ -> colonoscopia.
- [ ] pós-FIT normal high-quality -> q10 se average-risk.
- [ ] ACG apenas Internacional.
- [ ] regras familiares ACG conferidas.

## Findings obrigatoriamente resolvidos

### R2-01
- [ ] Grade A/B não é apresentado como graduação individual das modalidades FIT/colonoscopia.

### R2-02
- [ ] Portaria SAES/MS nº 5.215/2026 sustenta 50–75/FIT bienal.
- [ ] `B12` está identificado como protocolo OCI diagnóstico, 2ª edição 2025, e restrito aos locators que realmente sustenta.
- [ ] sourceRefs SUS restantes foram revalidados.

## Resultado

- [ ] **APROVADO integralmente para `reviewed_by_2`**
- [ ] **APROVADO parcialmente**
- [ ] **MUDANÇAS REQUERIDAS**

### Mudanças / comentários


## Declaração

Ao aprovar, o revisor declara ser pessoa distinta do R1, ter revisado conteúdo clínico/fontes/tradução executável, entender que `reviewed_by_2` não equivale a `active`, release ou merge, e ter informado conflitos relevantes.

### Texto recomendado

> Eu, **[NOME]**, após revisão independente do candidato CCR **[VERSÃO CORRIGIDA]** em **[DATA]**, aprovo as 43 traduções executáveis como segunda revisão médica (`reviewed_by_2`). Confirmo que R2-01 e R2-02 foram resolvidos e que esta aprovação não autoriza automaticamente `lifecycleStatus=active`, release público ou merge da PR #3.