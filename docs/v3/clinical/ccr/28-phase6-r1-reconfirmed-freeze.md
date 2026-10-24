# 28 - Freeze R1 pós-correções pré-R2 - piloto CCR

**Data:** 24/10/2026  
**Branch:** `v3-ccr-rules-pilot`  
**PR:** #3 - Draft  
**Candidato canônico:** `crc-0.5.3-phase6-r1-reconfirmed-draft`

## Decisão registrada

O revisor R1, Allan Ramos Costa, reconfirmou explicitamente as 15 regras modificadas no candidato `crc-0.5.2-phase6-r2-prep-draft`, reconhecendo que as alterações pré-R2 foram limitadas a fontes, metadados de evidência e governança, sem mudança de comportamento clínico.

## Consequência de governança

- 43/43 regras: `reviewStatus=reviewed_by_1`;
- 43/43 regras: `lifecycleStatus=draft`;
- cada regra possui exatamente um revisor humano registrado: Allan Ramos Costa;
- 0 regras `reviewed_by_2`;
- 0 regras `active`;
- nenhum release público;
- nenhum merge autorizado.

O snapshot `crc-0.5.2-phase6-r2-prep-draft` permanece preservado como estado intermediário em que 15 regras estavam deliberadamente resetadas para `source_verified` aguardando esta reconfirmação.

## Correções reconfirmadas

### R2-01 - USPSTF

- Grade A/B/C permanece no layer de recomendação populacional por faixa etária;
- FIT anual e colonoscopia q10 permanecem estratégias elegíveis;
- regras de modalidade não afirmam graduação USPSTF individual da estratégia.

### R2-02 - SUS

- `crc-src-B12` está reconciliada como protocolo OCI, 2ª edição 2025, diagnóstico/especializado;
- Portaria SAES/MS nº 5.215/2026 sustenta faixa 50-75 e FIT bienal;
- página profissional do INCA sustenta roteamento conservador de história familiar/risco especial quando aplicável;
- nenhuma mudança de saída clínica foi introduzida pelas correções de provenance.

## Invariante de reconfirmação

A passagem `0.5.2 -> 0.5.3` só pode alterar:

- `reviewStatus` das 15 regras reconfirmadas;
- `governance.reviews` dessas 15 regras;
- `rulesetVersion`.

Fontes, sourceRefs, policies, terminology, resolvers e campos clínicos das regras devem permanecer idênticos ao candidato 0.5.2.

Esse invariante é protegido por `tests/ccr/r1Reconfirmation.test.ts`.

## Gate final pós-reconfirmação

Workflow PR #3, run `40122322725`, HEAD `80d8aa86f7f665760503607dd0610e182bb66ec1`:

- typecheck: ✅;
- schema checks: ✅ 62/62;
- suíte completa: ✅ **428/428**;
- arquivos de teste: ✅ **23/23**;
- `r1Reconfirmation.test.ts`: ✅ 4/4;
- `r2Corrections.test.ts`: ✅ 7/7;
- `r2Gate.test.ts`: ✅ 3/3;
- build: ✅;
- V2 byte-for-byte: ✅.

## Material entregue ao R2

- `27-phase6-r2-external-review-packet.md` - resumo clínico autoexplicativo;
- `25-phase6-r2-review-form.md` - checklist e declaração formal;
- `12-adversarial-cases.md` - 60 cenários documentais de segurança;
- `26-phase6-r2-technical-corrections.md` - origem e resolução de R2-01/R2-02;
- código e goldens na PR #3 para auditoria aprofundada opcional;
- pacote compartilhável DOCX/PDF gerado a partir do resumo e formulário para envio ao revisor externo.

## Próximo gate

O próximo gate é exclusivamente humano e independente:

1. segundo médico revisa o candidato `crc-0.5.3-phase6-r1-reconfirmed-draft`;
2. resultado deve ser explícito: aprovação integral, parcial ou mudanças requeridas;
3. apenas aprovação humana válida e distinta do R1 pode autorizar registro `reviewed_by_2`;
4. `reviewed_by_2` ainda não autoriza `active`, release público ou merge.
