# 25 — Formulário de segunda revisão médica independente (R2) — CCR

**Candidato técnico corrigido:** `crc-0.5.2-phase6-r2-prep-draft`  
**PR:** #3 — Draft

> **AINDA NÃO ASSINAR COMO R2:** R2-01/R2-02 já foram corrigidos tecnicamente e passaram no CI, mas as 15 regras afetadas precisam primeiro de reconfirmação explícita do revisor R1. Após essa reconfirmação será emitida a versão R1 limpa para o segundo médico.

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
- [ ] `26-phase6-r2-technical-corrections.md`
- [ ] versão R1 pós-correção que será emitida após reconfirmação
- [ ] `v3/src/clinical/ccr/rules/**`
- [ ] `v3/src/clinical/ccr/resolvers/**`
- [ ] fontes do candidato canônico
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
- [ ] A faixa/intervalo FIT está ancorada na Portaria SAES/MS nº 5.215/2026.
- [ ] FIT+ -> colonoscopia diagnóstica.
- [ ] FIT− posterior não encerra FIT+ anterior.
- [ ] colonoscopia inadequada/incompleta não fecha FIT+.
- [ ] pós-FIT+ normal: episódio pode fechar, próximo clock SUS não automatizado.
- [ ] >=76 sem nova rotina, sem apagar follow-up.
- [ ] HF positiva relevante -> revisão, sem ACG silencioso.
- [ ] `B12` está corretamente identificada como OCI 2ª edição 2025 e não governa a faixa/intervalo do rastreamento populacional.

## BA-A

- [ ] <45 sem rotina.
- [ ] 45–49 shared decision como curadoria explícita.
- [ ] 50–75 FIT q2 default curatorial.
- [ ] colonoscopia primária q10 como alternativa.
- [ ] estratégia escolhida por humano.
- [ ] >75 individualização/revisão.
- [ ] HF positiva -> revisão.

## Internacional

- [ ] 45–49 Grade B para a decisão populacional de rastrear.
- [ ] 50–75 Grade A para a decisão populacional de rastrear.
- [ ] 76–85 Grade C seletivo.
- [ ] >85 fim da rotina sem Grade D inventado.
- [ ] FIT anual / colonoscopia q10 são estratégias elegíveis, sem apresentar A/B como graduação individual da modalidade.
- [ ] FIT+ -> colonoscopia.
- [ ] pós-FIT normal high-quality -> q10 se average-risk.
- [ ] ACG apenas Internacional.
- [ ] regras familiares ACG conferidas.

## Findings pré-R2

### R2-01 — correção técnica aplicada
- [ ] Confirmo que Grade A/B/C está ligada ao layer populacional USPSTF e não é apresentada como graduação individual de FIT/colonoscopia.

### R2-02 — correção técnica aplicada
- [ ] Confirmo que Portaria SAES/MS nº 5.215/2026 sustenta 50–75/FIT bienal.
- [ ] Confirmo que `B12` está identificada como OCI 2ª edição 2025 e restrita a usos compatíveis com seu conteúdo.
- [ ] Confirmei os sourceRefs SUS restantes e o uso da página profissional do INCA para roteamento conservador de risco especial/família.

## Resultado

- [ ] **APROVADO integralmente para `reviewed_by_2`**
- [ ] **APROVADO parcialmente**
- [ ] **MUDANÇAS REQUERIDAS**

### Mudanças / comentários


## Declaração

Ao aprovar, o revisor declara ser pessoa distinta do R1, ter revisado conteúdo clínico/fontes/tradução executável, entender que `reviewed_by_2` não equivale a `active`, release ou merge, e ter informado conflitos relevantes.

### Texto recomendado

> Eu, **[NOME]**, após revisão independente do candidato CCR **[VERSÃO R1 PÓS-CORREÇÃO]** em **[DATA]**, aprovo as 43 traduções executáveis como segunda revisão médica (`reviewed_by_2`). Confirmo que R2-01 e R2-02 foram resolvidos e que esta aprovação não autoriza automaticamente `lifecycleStatus=active`, release público ou merge da PR #3.

Se houver aprovação parcial ou mudanças requeridas, o revisor deve listar explicitamente os blocos/rules afetados em vez de usar o texto de aprovação integral.