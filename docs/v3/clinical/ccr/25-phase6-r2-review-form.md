# 25 — Formulário de segunda revisão médica independente (R2) — CCR

**Candidato revisado:** `crc-0.5.3-phase6-r1-reconfirmed-draft`  
**Branch:** `v3-ccr-rules-pilot`  
**PR:** #3 — Draft  
**Resultado desta revisão:** aprovação integral das 43 traduções executáveis, registrada por governança com identidade pública preservada.  
**Snapshot derivado:** `crc-0.5.4-phase6-r2-reviewed-draft`

## Modelo de privacidade adotado

A identidade civil e profissional do revisor R2 não é publicada nem armazenada no repositório. O responsável do projeto atesta que a revisão foi realizada por médico real, distinto do revisor R1, e que houve aprovação integral do candidato acima.

O registro público usa somente o handle não pessoal:

`external-physician-r2-private-001`

Esse handle não é nome, CRM nem mecanismo de verificação pública da identidade. A limitação de verificabilidade está documentada em `29-phase6-r2-private-review-governance.md`.

## Objetivo da R2

A pergunta clínica central foi:

> **As decisões clínicas executáveis do piloto CCR representam de forma correta, segura e fiel as fontes declaradas e o escopo aprovado?**

A revisão prioriza conteúdo clínico, limites de escopo, segurança, fontes e situações de abstensão/revisão; não exige auditoria aprofundada da arquitetura TypeScript.

## Declarações de governança R2

- [x] O revisor R2 é uma pessoa médica real.
- [x] O revisor R2 é pessoa distinta do revisor R1, Allan Ramos Costa.
- [x] A revisão foi realizada independentemente sobre o candidato `crc-0.5.3-phase6-r1-reconfirmed-draft`.
- [x] Não foram comunicados conflitos de interesse relevantes que condicionassem a aprovação.
- [x] A identidade do revisor permanece deliberadamente fora do repositório público.
- [x] O responsável do projeto assume a atestação pública desses pontos.

## Segurança global revisada

- [x] O módulo é restrito a contexto de rastreamento preventivo confirmado pelo profissional.
- [x] O módulo não faz triagem de sintomas, urgência ou probabilidade diagnóstica.
- [x] `unknown`, `not_asked` e `never_performed` permanecem distintos.
- [x] Datas parciais/same-day não recebem ordem temporal inventada.
- [x] FIT+ aberto suprime screening redundante.
- [x] `HandedOff` exige assunção real do cuidado; encaminhamento/agendamento isolado não basta.
- [x] CRC prévio, surveillance por pólipo relevante, DII colônica e síndrome hereditária saem da rotina average-risk para revisão explícita.
- [x] Disponibilidade local de recurso muda rota operacional, não a recomendação científica.

## SUS / Brasil oficial

- [x] Rotina populacional 50–75 anos inclusive.
- [x] FIT é o exame nuclear da estratégia SUS e é bienal.
- [x] A fonte normativa do intervalo/faixa é a Portaria SAES/MS nº 5.215/2026.
- [x] FIT+ exige colonoscopia diagnóstica; repetir FIT não resolve o episódio.
- [x] FIT− posterior não encerra FIT+ anterior.
- [x] Colonoscopia inadequada/incompleta não fecha FIT+.
- [x] Colonoscopia normal, completa e adequada pode fechar o episódio diagnóstico, mas o próximo relógio SUS não é automaticamente inventado.
- [x] ≥76 anos não inicia nova rotina populacional, mas não apaga follow-up diagnóstico já aberto.
- [x] História familiar positiva relevante leva a revisão; algoritmo ACG não é importado silenciosamente.

## Brasil ampliado BA-A

- [x] <45 sem rotina average-risk automática.
- [x] 45–49 em `SharedDecision`, não `Due` automático.
- [x] 50–75 com FIT q2 como apresentação padrão da curadoria.
- [x] Colonoscopia primária q10 é alternativa elegível e explicitamente selecionada por humano.
- [x] Troca futura de estratégia não apaga cobertura válida anterior.
- [x] >75 permanece individualizado/revisão.
- [x] História familiar positiva relevante permanece em revisão, sem importar ACG automaticamente.

## Internacional

- [x] USPSTF Grade B refere-se à decisão populacional de rastrear 45–49 anos.
- [x] USPSTF Grade A refere-se à decisão populacional de rastrear 50–75 anos.
- [x] USPSTF Grade C refere-se ao rastreamento seletivo 76–85 anos.
- [x] FIT anual e colonoscopia q10 são estratégias elegíveis; não recebem falsa graduação A/B individual por modalidade.
- [x] >85 encerra a rotina populacional sem inventar Grade D.
- [x] FIT+ exige colonoscopia; FIT− posterior não resolve.
- [x] Pós-FIT+ com colonoscopia normal high-quality pode estabelecer q10 quando average-risk e sem outro gatilho aberto.
- [x] ACG é usado somente na policy Internacional.
- [x] 1 FDR com CRC/pólipo avançado <60 ou ≥2 FDR -> colonoscopia aos 40 ou 10 anos antes do mais jovem, q5.
- [x] 1 FDR ≥60 -> iniciar aos 40/10 anos antes e depois seguir recomendações average-risk; sem q5 universal.
- [x] 1 SDR isolado -> average-risk se não houver outros modificadores.
- [x] História familiar incompleta/complexa gera informação faltante/revisão, não inferência agressiva.

## Findings pré-R2 confirmados como resolvidos

### R2-01 — graduação USPSTF

- [x] Grade A/B/C está atribuída à recomendação populacional por faixa etária, não a FIT/colonoscopia individualmente.

### R2-02 — provenance SUS

- [x] A Portaria SAES/MS nº 5.215/2026 sustenta a faixa 50–75 e FIT bienal.
- [x] `B12` está reconciliada como protocolo OCI 2ª edição 2025 e não é usada como fonte normativa principal da rotina populacional FIT 50–75/q2.
- [x] As demais referências SUS usadas no candidato são clinicamente compatíveis com os locators declarados.

## Resultado global

**APROVADO INTEGRALMENTE** — as 43 traduções executáveis estão autorizadas, sob a governança do projeto, a receber `reviewed_by_2` no snapshot `crc-0.5.4-phase6-r2-reviewed-draft`.

A aprovação R2 **não equivale** a:

- `lifecycleStatus=active`;
- release público;
- autorização de uso clínico real;
- merge da PR #3.

Esses permanecem gates posteriores e independentes.

## Observação evolutiva não bloqueante

A sugestão de considerar, em roadmap futuro, um contexto funcional/expectativa de vida limitada para modular rastreamento em pessoas com benefício potencial reduzido permanece **não bloqueante** e não altera o candidato R2-reviewed atual.
