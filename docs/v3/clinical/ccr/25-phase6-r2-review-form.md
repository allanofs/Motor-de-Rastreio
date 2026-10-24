# 25 — Formulário de segunda revisão médica independente (R2) — CCR

**Candidato a revisar:** `crc-0.5.3-phase6-r1-reconfirmed-draft`  
**Branch:** `v3-ccr-rules-pilot`  
**PR:** #3 — Draft  
**Estado:** pronto para revisão médica independente; não ativo; não liberado publicamente; não mergeado.

## Objetivo da R2

A pergunta central para o segundo revisor é:

> **As decisões clínicas executáveis do piloto CCR representam de forma correta, segura e fiel as fontes declaradas e o escopo aprovado?**

O revisor não precisa validar arquitetura de software em profundidade. Ele deve priorizar conteúdo clínico, limites de escopo, segurança, fontes e situações de abstensão/revisão.

## Revisor R2

- Nome completo:
- Médico / especialidade:
- Registro profissional: (opcional no repositório público; pode ser mantido em registro privado)
- Instituição/afiliação: (opcional)
- Data da revisão:
- Conflitos de interesse relevantes: [ ] Não  [ ] Sim — descrever:
- Confirma ser pessoa diferente do revisor R1 (Allan Ramos Costa): [ ] Sim

## Material recomendado

Leitura mínima, nesta ordem:

1. `27-phase6-r2-external-review-packet.md` — resumo clínico autoexplicativo.
2. Este formulário.
3. `12-adversarial-cases.md` — 60 cenários de segurança.
4. `26-phase6-r2-technical-corrections.md` — correções de provenance/evidência pré-R2.
5. Se desejar aprofundar: `v3/src/clinical/ccr/rules/**`, `resolvers/**`, `r2Sources.ts` e goldens executáveis.

## Segurança global

Marque somente após conferir:

- [ ] O módulo é restrito a contexto de rastreamento preventivo confirmado pelo profissional.
- [ ] O módulo não faz triagem de sintomas, urgência ou probabilidade diagnóstica.
- [ ] `unknown`, `not_asked` e `never_performed` permanecem conceitos diferentes.
- [ ] Datas parciais/same-day não recebem ordem temporal inventada.
- [ ] FIT+ aberto suprime screening redundante.
- [ ] `HandedOff` exige assunção real do cuidado; encaminhamento/agendamento isolado não basta.
- [ ] CRC prévio, surveillance por pólipo relevante, DII colônica e síndrome hereditária saem da rotina average-risk para revisão explícita.
- [ ] Disponibilidade local de recurso muda rota operacional, não a recomendação científica.

## SUS / Brasil oficial

- [ ] Rotina populacional 50–75 anos inclusive.
- [ ] FIT é o exame nuclear da estratégia SUS e é bienal.
- [ ] A fonte normativa do intervalo/faixa é a Portaria SAES/MS nº 5.215/2026.
- [ ] FIT+ exige colonoscopia diagnóstica; repetir FIT não resolve o episódio.
- [ ] FIT− posterior não encerra FIT+ anterior.
- [ ] Colonoscopia inadequada/incompleta não fecha FIT+.
- [ ] Colonoscopia normal, completa e adequada pode fechar o episódio diagnóstico, mas o próximo relógio SUS não é automaticamente inventado.
- [ ] ≥76 anos não inicia nova rotina populacional, mas não apaga follow-up diagnóstico já aberto.
- [ ] História familiar positiva relevante leva a revisão; algoritmo ACG não é importado silenciosamente.

## Brasil ampliado BA-A

- [ ] <45 sem rotina average-risk automática.
- [ ] 45–49 em `SharedDecision`, não `Due` automático.
- [ ] 50–75 com FIT q2 como apresentação padrão da curadoria.
- [ ] Colonoscopia primária q10 é alternativa elegível e explicitamente selecionada por humano.
- [ ] Troca futura de estratégia não apaga cobertura válida anterior.
- [ ] >75 permanece individualizado/revisão.
- [ ] História familiar positiva relevante permanece em revisão, sem importar ACG automaticamente.

## Internacional

- [ ] USPSTF Grade B refere-se à decisão populacional de rastrear 45–49 anos.
- [ ] USPSTF Grade A refere-se à decisão populacional de rastrear 50–75 anos.
- [ ] USPSTF Grade C refere-se ao rastreamento seletivo 76–85 anos.
- [ ] FIT anual e colonoscopia q10 são estratégias elegíveis; não recebem uma falsa graduação A/B individual por modalidade.
- [ ] >85 encerra a rotina populacional sem inventar Grade D.
- [ ] FIT+ exige colonoscopia; FIT− posterior não resolve.
- [ ] Pós-FIT+ com colonoscopia normal high-quality pode estabelecer q10 quando average-risk e sem outro gatilho aberto.
- [ ] ACG é usado somente na policy Internacional.
- [ ] 1 FDR com CRC/pólipo avançado <60 ou ≥2 FDR -> colonoscopia aos 40 ou 10 anos antes do mais jovem, q5.
- [ ] 1 FDR ≥60 -> iniciar aos 40/10 anos antes e depois seguir recomendações average-risk; sem q5 universal.
- [ ] 1 SDR isolado -> average-risk se não houver outros modificadores.
- [ ] História familiar incompleta/complexa gera informação faltante/revisão, não inferência agressiva.

## Findings pré-R2 que devem ser independentemente confirmados como resolvidos

### R2-01 — graduação USPSTF

Correção aplicada no candidato atual:

- [ ] Confirmo que Grade A/B/C está atribuída à recomendação populacional por faixa etária, não a FIT/colonoscopia individualmente.

### R2-02 — provenance SUS

Correção aplicada no candidato atual:

- [ ] Confirmo que a Portaria SAES/MS nº 5.215/2026 sustenta a faixa 50–75 e FIT bienal.
- [ ] Confirmo que `B12` está reconciliada como protocolo OCI 2ª edição 2025 e não é usada como fonte normativa principal da rotina populacional FIT 50–75/q2.
- [ ] Confirmo que as demais referências SUS usadas no candidato são clinicamente compatíveis com os locators declarados.

## Casos de segurança que merecem atenção especial

- [ ] FIT+ seguido de FIT− continua aberto até resolução adequada.
- [ ] Colonoscopia anterior ao FIT+ não resolve o FIT+ posterior.
- [ ] FIT+ e colonoscopia na mesma data sem ordem demonstrável -> não inferir resolução automaticamente.
- [ ] Novo FIT+ depois de episódio anterior resolvido abre novo follow-up.
- [ ] FIT+ permanece acionável mesmo após sair da faixa etária de rotina.
- [ ] História familiar desconhecida não é tratada como negativa e não apaga indicação mínima já conhecida pela idade.
- [ ] Diagnóstico/risco especial não é automaticamente `HandedOff`.

## Resultado global da revisão

Escolher uma opção:

- [ ] **APROVADO INTEGRALMENTE** — as 43 traduções executáveis podem receber `reviewed_by_2`.
- [ ] **APROVADO PARCIALMENTE** — listar exatamente quais blocos/regras estão aprovados.
- [ ] **MUDANÇAS REQUERIDAS** — não registrar `reviewed_by_2` global até correção e nova confirmação.

### Regras/blocos aprovados parcialmente, se aplicável


### Mudanças obrigatórias / comentários / ressalvas


## Declaração do revisor

Ao aprovar, declaro que sou pessoa distinta do revisor R1, revisei de forma independente o conteúdo clínico, as fontes e a tradução executável apresentada no candidato `crc-0.5.3-phase6-r1-reconfirmed-draft`, e compreendo que `reviewed_by_2` **não equivale** a `lifecycleStatus=active`, release público ou merge da PR #3.

### Texto curto recomendado para aprovação integral

> Eu, **[NOME COMPLETO]**, médico(a) **[ESPECIALIDADE]**, após revisão independente do candidato CCR `crc-0.5.3-phase6-r1-reconfirmed-draft` em **[DATA]**, aprovo integralmente as 43 traduções executáveis como segunda revisão médica (`reviewed_by_2`). Confirmo que revisei os limites de escopo, as três policies, os fluxos FIT+/colonoscopia, história familiar, hard exclusions e as correções R2-01/R2-02. Declaro ser pessoa diferente do revisor R1 e informar eventuais conflitos de interesse acima. Esta aprovação não autoriza automaticamente ativação, release público ou merge.
