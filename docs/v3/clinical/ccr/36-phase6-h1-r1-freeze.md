# 36 — Fase 6.H1: freeze R1 do hotfix `family-status`

**Data:** 25/10/2026  
**Branch:** `v3-ccr-family-status-hotfix`  
**PR:** #6 — Draft  
**Candidato R1:** `crc-0.5.7-phase6-h1-r1-draft`

## Decisão humana registrada

Allan Ramos Costa aprovou explicitamente em R1 as três traduções executáveis corrigidas da Fase 6.H1:

- `crc.sus.family-status`;
- `crc.ba-a.family-status`;
- `crc.intl.family-status`.

A aprovação reconhece a ressalva semântica documentada no pacote R1: `stance: recommend` é usado somente como scaffold técnico resolver-safe, sem ação genérica e com outcome genérico `NotApplicable`; a classificação clínica final permanece governada pelo `familyStatusResolver64` existente.

## Consequência de governança

Somente as três regras alteradas passam de:

`draft/source_verified`

para:

`draft/reviewed_by_1`

com exatamente um registro humano de revisão:

- reviewer: `Allan Ramos Costa`;
- reviewedAt: `2026-10-25`.

As demais regras permanecem byte/semanticamente idênticas ao candidato H1 anterior. O snapshot ativo histórico `crc-0.5.5-phase6-active` permanece imutável e o entrypoint canônico `candidate.ts` continua apontando para ele.

## Escopo da aprovação

R1 aprova somente que a tradução executável corrigida representa adequadamente a intenção clínica previamente aprovada para história familiar:

- negativa conhecida -> não gera `ClinicalReviewRequired` por si só;
- desconhecida/incompleta -> mantém incerteza (`Indeterminate`);
- positiva SUS/BA-A -> continua em revisão clínica;
- padrões Internacionais estreitos -> continuam delegados aos tracks ACG já governados;
- padrões complexos -> continuam em revisão.

R1 não autoriza:

- `reviewed_by_2`;
- `active`;
- mudança do entrypoint canônico;
- merge;
- deploy;
- uso clínico real;
- exportação de relatório clínico.

## Gate R1 obrigatório

O snapshot R1 deve passar novamente pelo gate completo e por regressões específicas que comprovem:

1. apenas as três regras mudaram em governança em relação ao candidato H1;
2. cada uma possui exatamente o reviewer/data R1 registrados;
3. comportamento `no / unknown / yes` permanece correto;
4. delegação Internacional permanece correta;
5. fluxo BA-A FIT continua intacto;
6. `candidate.ts` permanece em `crc-0.5.5-phase6-active`;
7. Foundation, Model e V2 permanecem preservados.

## Próximo gate

Após gate automatizado verde, preparar pacote enxuto para **R2 independente**, restrito às três traduções modificadas e à ressalva arquitetural do scaffold.

Somente aprovação R2 válida e distinta de R1 poderá autorizar a criação de um snapshot `reviewed_by_2`. Ativação continua sendo uma etapa posterior e separada.
