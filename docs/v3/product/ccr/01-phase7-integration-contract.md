# Phase 7 — contrato de integração do produto CCR

**Data:** 24/10/2026  
**Branch:** `v3-ccr-product-integration`  
**PR:** #4 — Draft  
**Base clínica:** `crc-0.5.5-phase6-active`

## Objetivo

Integrar o conteúdo clínico CCR ativo ao produto sem duplicar lógica clínica na UI e sem transformar `active` em autorização de uso clínico real.

A arquitetura da integração segue:

```text
UI draft
  ↓
normalizeCcrProductDraft
  ↓
Patient + CareSetting + policyId + asOf
  ↓
evaluateCcrProduct
  ↓
Foundation + ccrCandidateRuleset ativo
  ↓
ConsultationPlan / traces
  ↓
buildCcrProductSections
  ↓
presentCcrProduct
  ↓
view-model consumível pela UI
```

A UI não deve chamar regras individuais, resolvers ou snapshots históricos diretamente.

---

## 7.0 — adaptador de produto

Entrada canônica:

- `patient`;
- `policyId` explícito;
- `asOf` explícito;
- `careSetting` opcional e separado do Patient.

O adaptador consome somente:

- `ccrCandidateRuleset`;
- `ccrCandidatePolicies`;
- `ccrCandidateResolvers`.

Saída:

- ruleset version;
- policy efetivamente usada;
- `requiresAttention`;
- avaliação original do engine;
- tracks agrupados nas seis seções aprovadas.

### Seções da interface

1. **Resolver primeiro** — `Conflict` / `ComputationError`;
2. **Falta informação** — `Indeterminate`;
3. **Fazer hoje** — `Due` e `InFollowUp` com ação;
4. **Decisão compartilhada** — `SharedDecision`;
5. **Revisão clínica necessária** — `ClinicalReviewRequired`;
6. **Em dia / acompanhar** — `Current`, `PendingResult`, `HandedOff`, `NotApplicable` e follow-up sem nova ação.

O `TrackEvaluation` original permanece anexado ao card intermediário; trace, guardrails e evidence não são reconstruídos pela UI.

---

## 7.1 — normalização do formulário

A UI pode manter estado local de campos condicionais por conveniência de edição, mas o normalizador aplica **amnésia condicional** antes do engine.

Exemplos:

- `familyHistory=no|unknown|not_asked` → detalhes antigos de familiares são descartados;
- strategy selection antiga → descartada sob policy SUS;
- `historyKnowledge != known` → resposta antiga de suficiência do histórico é descartada;
- exame `not_performed` ou `unknown` → data, resultado e qualidade antigos não entram no `ExamRecord` normalizado.

`not_asked` não vira `false` nem `unknown`: o fato simplesmente não é emitido.

Datas de exames aceitam precisão parcial e preservam `year` / `month` / `day` conforme informado.

### Colonoscopia — papel explícito

A UI deve perguntar o papel somente quando houver colonoscopia relevante:

- `screening` → colonoscopia primária de rastreamento;
- `post_fit_positive` → colonoscopia diagnóstica pós-FIT+;
- `other_or_unknown` → modalidade genérica; não ganhar semântica de resolução por presunção.

---

## 7.2 — contrato de apresentação

A camada de apresentação pode:

- fornecer rótulo humano do track;
- fornecer rótulo humano do estado;
- organizar cards;
- exibir rota operacional;
- expor missing data, guardrails e source IDs.

Ela **não pode reescrever o conteúdo clínico das actions**. `EvaluatedAction.text` é transportado verbatim.

Exemplos de invariantes:

- `Indeterminate` não vira recomendação;
- `ClinicalReviewRequired` não vira “pedir exame”;
- `SharedDecision` não escolhe FIT ou colonoscopia pelo humano;
- indisponibilidade local altera rota operacional, não o texto/evidência da indicação clínica;
- source IDs vêm do trace, não de uma lista inventada pela interface.

---

## 7.3 — cenários end-to-end

Os testes percorrem a cadeia inteira do draft bruto até a apresentação e incluem:

- SUS 49 / 50 / 75 / 76;
- FIT+ aberto;
- FIT+ seguido de FIT−;
- colonoscopia normal adequada pós-FIT+;
- BA-A 45–49 em SharedDecision;
- seleção explícita de colonoscopia na BA-A;
- seleção explícita de FIT na Internacional;
- história familiar desconhecida;
- padrão familiar ACG de maior risco;
- CRC prévio;
- colonoscopia indisponível;
- ambiguidade same-day;
- formulário inválido.

---

## Privacidade e segurança arquitetural

A camada `src/product/ccr/**` está proibida de introduzir:

- `localStorage`;
- `sessionStorage`;
- IndexedDB;
- cookies de paciente;
- estado de paciente na URL;
- `fetch`/XHR/sendBeacon;
- analytics;
- logs de paciente.

A avaliação direta pelo engine fica confinada ao adaptador de integração. Form normalizer e presentation layer não selecionam rulesets nem executam regras diretamente.

---

## Release gate

Toda saída da integração carrega:

`integration-only-not-authorized-for-real-world-use`

Enquanto esse gate existir:

- não é release público;
- não é autorização de uso clínico real;
- não é produto patient-facing;
- não é autorização regulatória;
- não é deploy;
- não é merge da PR #4.

---

## Como uma UI deve integrar agora

Consumir, em ordem:

1. `getCcrProductPolicyOptions()` para o seletor de referencial;
2. montar um `CcrProductDraft` em memória;
3. `evaluateCcrProductDraft(draft)`;
4. se `ok=false`, mostrar somente o erro seguro de normalização/controle;
5. se `ok=true`, chamar `presentCcrProduct(result)`;
6. renderizar `sections` na ordem recebida;
7. exibir `actions[].text` sem reescrita clínica;
8. disponibilizar guardrails/fontes como expansão/auditoria, não como lógica paralela;
9. mostrar `rulesetVersion` no produto;
10. respeitar o release gate.

## Próximo gate

A próxima etapa é um **piloto de UI não implantado**, consumindo exclusivamente este contrato e protegido por testes end-to-end. Se já existir uma UI local/em outra branch, ela deve ser adaptada a este contrato em vez de duplicar regras clínicas.