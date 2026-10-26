# 38 — Fase 6.H1: registro da revisão R2 independente

**Candidato revisado:** `crc-0.5.7-phase6-h1-r1-draft`  
**Escopo:** `crc.sus.family-status`, `crc.ba-a.family-status`, `crc.intl.family-status`  
**Data da revisão:** 25/10/2026  
**Resultado:** **APROVAÇÃO INTEGRAL**

## Identificação de governança

- Revisor distinto do R1: [x] Sim
- Revisor: o mesmo médico externo independente utilizado na R2 anterior do piloto CCR.
- Identidade pública no repositório: preservada, conforme o modelo já adotado.
- Handle público não pessoal: `external-physician-r2-private-001`.
- Identidade civil, CRM, instituição e demais identificadores pessoais: não armazenados no repositório público.
- Conflito de interesse: nenhum conflito adicional foi comunicado nesta confirmação; permanece a governança/atestação do R2 anterior para o mesmo revisor.

O responsável do projeto atesta que o handle acima representa pessoa médica real, distinta do revisor R1, que realizou a revisão independente deste hotfix e comunicou **aprovação integral** das três traduções corrigidas.

## Checklist clínico aprovado

### Negativa conhecida

- [x] SUS: história familiar negativa não gera revisão clínica por si só.
- [x] BA-A: história familiar negativa não gera revisão clínica por si só.
- [x] Internacional: história familiar negativa não gera revisão clínica por si só.

### Desconhecida/incompleta

- [x] `unknown` não é convertido em negativo.
- [x] informação insuficiente capaz de mudar rota produz `Indeterminate`/abstenção apropriada.

### Positiva

- [x] SUS: história positiva relevante exige revisão; ACG não é importado.
- [x] BA-A: história positiva relevante exige revisão; ACG não é importado.
- [x] Internacional: somente padrões ACG previamente representados são automatizados.
- [x] padrões complexos/contraditórios continuam fora da automação simplificada.

## Checklist de não regressão aprovado

- [x] estratégia FIT/colonoscopia não foi modificada pelo hotfix.
- [x] disponibilidade de recurso continua separada da indicação clínica.
- [x] `sourceRefs` das três regras foram preservados.
- [x] nenhuma regra fora das três `family-status` sofreu alteração clínica.
- [x] policies, resolvers, terminology, `engine/**` e `model/**` não foram alterados.
- [x] snapshot ativo `crc-0.5.5-phase6-active` e `candidate.ts` permanecem inalterados durante a revisão.

## Ressalva semântica aceita

A regra-base usa `stance: recommend` como sentinel técnico para permitir execução do resolver no Foundation atual, porém:

- possui `actions: []`;
- possui outcome genérico `NotApplicable`;
- não representa recomendação clínica genérica por si só;
- o estado clínico final é definido pelo resolver governado.

- [x] R2 considera essa solução aceitável como hotfix mínimo temporário.
- [x] R2 concorda que UI/relatório/provenance não devem interpretar `stance` isoladamente como recomendação.

## Resultado formal

- [x] **Aprovação integral** das três traduções corrigidas.
- [ ] Aprovação parcial.
- [ ] Mudanças requeridas.

A aprovação R2 autoriza somente uma etapa separada de promoção de governança para `reviewed_by_2` e posterior avaliação de activation/readiness. Não autoriza `active`, merge, deploy, publicação ou uso clínico real.
