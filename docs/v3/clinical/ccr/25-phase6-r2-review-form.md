# 25 — Formulário de segunda revisão médica independente (R2) — CCR

**Candidato-base atual:** `crc-0.5.1-phase6-r1-draft`  
**PR:** #3 — Draft  
**Objetivo:** registrar uma revisão médica humana independente da tradução executável do módulo de rastreamento colorretal.

> Este formulário não deve ser preenchido pelo autor/revisor R1. O segundo revisor precisa ser uma pessoa diferente e deve revisar o conteúdo clínico, não apenas confirmar que os testes passam.

> **BLOQUEADO PARA ASSINATURA FINAL:** R2-01 e R2-02 precisam ser aplicados ao candidato, testados e reconfirmados em R1 antes de este formulário poder autorizar `reviewed_by_2`.

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
- [ ] resolvers longitudinais/família em `v3/src/clinical/ccr/resolvers/**`
- [ ] fontes em `v3/src/clinical/ccr/sources.ts`
- [ ] goldens críticos: `longitudinal.test.ts`, `familyHistory.test.ts`, `goldenSafety.test.ts`, `specialRisk.test.ts`

## Checklist clínico R2

### Segurança global

- [ ] O módulo é exclusivamente de suporte ao rastreamento preventivo confirmado pelo profissional.
- [ ] Não há triagem automática de sintomas/urgência.
- [ ] `unknown`, `not_asked` e `never_performed` permanecem semanticamente distintos.
- [ ] FIT+ aberto suprime screening redundante.
- [ ] `HandedOff` exige assunção real do cuidado.
- [ ] hard exclusions produzem revisão explícita, não retorno silencioso à rotina average-risk.

### SUS

- [ ] 50–75 inclusive.
- [ ] FIT como estratégia de rotina.
- [ ] FIT negativo válido -> q2.
- [ ] FIT+ -> colonoscopia diagnóstica.
- [ ] FIT negativo posterior não encerra FIT+ prévio.
- [ ] colonoscopia inadequada/incompleta não encerra FIT+.
- [ ] pós-FIT+ -> colonoscopia normal: episódio pode fechar, próximo clock SUS permanece não automatizado.
- [ ] >=76 sem nova rotina, sem apagar follow-up aberto.
- [ ] história familiar positiva relevante -> revisão; sem ACG silencioso.

### Brasil ampliado BA-A

- [ ] <45 sem rotina automática.
- [ ] 45–49 = shared decision/review como decisão curatorial.
- [ ] 50–75 = FIT q2 como default curatorial.
- [ ] colonoscopia primária q10 como alternativa elegível.
- [ ] escolha de estratégia é humana.
- [ ] >75 = individualização/revisão.
- [ ] história familiar positiva relevante -> revisão, sem importação automática do ACG.

### Internacional

- [ ] 45–49 = USPSTF Grade B para a decisão de rastrear.
- [ ] 50–75 = USPSTF Grade A para a decisão de rastrear.
- [ ] 76–85 = seletivo/Grade C, sem Due automático.
- [ ] >85 = fim da rotina sem inventar Grade D.
- [ ] FIT anual e colonoscopia q10 são estratégias elegíveis.
- [ ] FIT+ -> colonoscopia; repetir FIT não substitui avaliação.
- [ ] colonoscopia normal high-quality após FIT+ pode sustentar q10 em average-risk.
- [ ] ACG só entra na policy Internacional.
- [ ] 1 FDR <60 ou >=2 FDR -> colonoscopia q5, início aos 40/10 anos antes do familiar mais jovem.
- [ ] 1 FDR >=60 -> início aos 40/10 anos antes e depois opções/intervalos average-risk.
- [ ] 1 SDR isolado -> average-risk se sem outros modificadores.

## Findings pré-R2 que DEVEM estar resolvidos antes da aprovação final

### R2-01 — Grade USPSTF em regras de modalidade

- [ ] Grade A/B não está atribuído como graduação individual de FIT/colonoscopia; permanece ligado à recomendação populacional de rastrear por faixa etária.

### R2-02 — fonte SUS de rastreamento

- [ ] A Portaria SAES/MS nº 5.215/2026 é a fonte normativa usada para idade 50–75/FIT bienal.
- [ ] O protocolo OCI `B12` está identificado como 2ª edição 2025 e restrito a locators que realmente sustenta.
- [ ] Os sourceRefs SUS de história familiar/hard exclusions foram revistos individualmente e nenhum locator atribui conteúdo inexistente à fonte.

## Resultado da revisão

Escolher uma opção:

- [ ] **APROVADO integralmente para `reviewed_by_2`**
- [ ] **APROVADO parcialmente** — listar rules/blocos abaixo
- [ ] **MUDANÇAS REQUERIDAS** — listar abaixo

### Rules/blocos aprovados parcialmente


### Mudanças requeridas


### Comentários adicionais


## Declaração de independência

Ao aprovar, o revisor declara que:

1. não é o mesmo revisor registrado em R1;
2. revisou a tradução clínica e suas fontes, não apenas a execução técnica;
3. considera que os itens aprovados representam corretamente o referencial/policy declarado;
4. entende que `reviewed_by_2` **não é equivalente a `active`**, release público ou merge;
5. quaisquer conflitos de interesse relevantes foram informados.

## Texto recomendado para autorização explícita

> Eu, **[NOME DO REVISOR]**, após revisão independente do candidato CCR **[VERSÃO CORRIGIDA]** em **[DATA]**, aprovo as 43 traduções executáveis como segunda revisão médica (`reviewed_by_2`). Confirmo que R2-01 e R2-02 foram resolvidos e que esta aprovação não autoriza automaticamente `lifecycleStatus=active`, release público ou merge da PR #3.

Se a aprovação for parcial, substituir “as 43 traduções executáveis” pela lista exata de rules/blocos aprovados.

**Importante:** até a correção R2-01/R2-02 ser aplicada, testada e reconfirmada em R1, qualquer assinatura neste formulário deve ser tratada como revisão em andamento, não como autorização para `reviewed_by_2`.