# 31 — Gate pós-R2: activation readiness do piloto CCR

**Data:** 24/10/2026  
**Branch:** `v3-ccr-rules-pilot`  
**PR:** #3 — Draft  
**Candidato canônico:** `crc-0.5.4-phase6-r2-reviewed-draft`

## Pergunta deste gate

A conclusão de duas revisões humanas não torna o ruleset automaticamente ativo. Este gate separa duas perguntas:

1. **O conteúdo clínico R2-reviewed está tecnicamente apto a ser promovido de `draft` para `active`?**
2. **O produto completo já está apto a release público ou uso clínico real?**

Essas respostas podem ser diferentes.

## Resultado atual

### Conteúdo clínico — READY FOR ACTIVATION DECISION

O conteúdo clínico satisfaz os pré-requisitos técnicos definidos até aqui para que o responsável do projeto possa tomar, em gate separado, uma decisão explícita de ativação:

- 43/43 regras `reviewed_by_2`;
- dois reviewer records distintos por regra;
- R2 registrada sob modelo de identidade preservada e atestação do responsável do projeto;
- 43/43 regras ainda `lifecycleStatus=draft`;
- todas as fontes do bundle candidato estão `final`, HTTPS e verificadas em 24/10/2026;
- todos os `sourceRefs` resolvem para fonte existente e possuem locator não vazio;
- R2-01 e R2-02 resolvidas;
- promoção R1 → R2 comprovadamente não alterou campos clínicos;
- policies e resolvers preservados;
- Foundation continua genérica, sem mudança específica para CCR;
- V2 preservada byte-for-byte.

Gate automatizado: `tests/ccr/activationReadiness.test.ts`.

### CI do gate

- typecheck: ✅
- schema checks: ✅ 62/62
- suíte total: ✅ **435/435**
- arquivos de teste: ✅ **25/25**
- `activationReadiness.test.ts`: ✅ 4/4
- build: ✅
- V2 byte-for-byte: ✅

## Produto público / uso clínico real — NOT YET AUTHORIZED

O resultado acima é uma conclusão sobre **conteúdo clínico executável**, não sobre deploy ou uso real.

Antes de release público ou uso clínico real, o projeto ainda deve validar a integração do candidato em uma superfície de produto que preserve, no mínimo:

1. identificação clara de que se trata de apoio à decisão para profissional de saúde;
2. gate explícito de contexto preventivo antes de rodar CCR;
3. exibição de policy selecionada e versão do ruleset;
4. diferenciação visível entre `Due`, `Current`, `SharedDecision`, `Indeterminate`, `ClinicalReviewRequired`, `InFollowUp` e `HandedOff`;
5. nenhuma ocultação de abstensão/revisão clínica por simplificação de UI;
6. nenhuma escolha automática de modalidade quando a policy exige decisão humana;
7. ausência de ação rotineira redundante quando FIT+ está aberto;
8. Care Setting alterando operacionalização, não ciência;
9. nenhum armazenamento de dados de paciente em localStorage/sessionStorage/URL/analytics/logs;
10. comportamento de safe failure preservado em integração real;
11. versionamento/reprodutibilidade do ruleset exibidos ao usuário profissional;
12. testes end-to-end da superfície piloto com os principais goldens clínicos.

## Privacidade da R2

O repositório público usa `external-physician-r2-private-001` como identificador de governança. A identidade/CRM do revisor não é armazenada. O responsável do projeto atesta que se trata de médico real distinto do R1.

Essa escolha não bloqueia o gate técnico atual, mas reduz a verificabilidade nominal pública. Se uma futura exigência regulatória/institucional/editorial exigir identificação privada mais forte, isso deve ser tratado antes do respectivo release, sem alterar retroativamente o registro público.

## O que `active` significará se autorizado

Uma futura promoção para `lifecycleStatus=active` deverá significar apenas:

> **esta regra clínica foi aprovada para compor um ruleset clínico selecionável/operacional dentro do escopo técnico governado.**

Não deverá significar automaticamente:

- publicação do produto;
- uso em pacientes;
- recomendação autônoma ao público;
- deploy;
- merge da PR;
- autorização regulatória.

## Próxima decisão requerida

O próximo gate é uma **decisão explícita do responsável do projeto sobre ativação do conteúdo clínico**.

Se autorizada, a promoção deverá criar um novo snapshot imutável, alterando somente:

- `rulesetVersion`;
- `lifecycleStatus: draft -> active` nas 43 regras.

`reviewStatus=reviewed_by_2`, reviewer records, conteúdo clínico, fontes, policies, terminology e resolvers devem permanecer idênticos.

Depois disso, o próximo trabalho técnico recomendado é a integração/piloto de produto, não nova expansão clínica silenciosa.