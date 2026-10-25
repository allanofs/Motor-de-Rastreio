# 38 — Fase 6.H1: formulário de revisão R2 independente

**Candidato:** `crc-0.5.7-phase6-h1-r1-draft`  
**Escopo:** `crc.sus.family-status`, `crc.ba-a.family-status`, `crc.intl.family-status`

## Identificação de governança

- Revisor distinto do R1: [ ] Sim [ ] Não
- Data da revisão: __________
- Conflito de interesse relevante comunicado: [ ] Não [ ] Sim — descrever: __________
- Identidade pública no repositório: opcional; pode seguir modelo de identidade preservada já adotado pelo projeto.

## Checklist clínico

### Negativa conhecida

- [ ] SUS: história familiar negativa não gera revisão clínica por si só.
- [ ] BA-A: história familiar negativa não gera revisão clínica por si só.
- [ ] Internacional: história familiar negativa não gera revisão clínica por si só.

### Desconhecida/incompleta

- [ ] `unknown` não é convertido em negativo.
- [ ] informação insuficiente capaz de mudar rota produz `Indeterminate`/abstenção apropriada.

### Positiva

- [ ] SUS: história positiva relevante exige revisão; ACG não é importado.
- [ ] BA-A: história positiva relevante exige revisão; ACG não é importado.
- [ ] Internacional: somente padrões ACG previamente representados são automatizados.
- [ ] padrões complexos/contraditórios continuam fora da automação simplificada.

## Checklist de não regressão

- [ ] estratégia FIT/colonoscopia não foi modificada pelo hotfix.
- [ ] disponibilidade de recurso continua separada da indicação clínica.
- [ ] `sourceRefs` das três regras foram preservados.
- [ ] nenhuma regra fora das três `family-status` sofreu alteração clínica.
- [ ] policies, resolvers, terminology, `engine/**` e `model/**` não foram alterados.
- [ ] snapshot ativo `crc-0.5.5-phase6-active` e `candidate.ts` permanecem inalterados durante a revisão.

## Ressalva semântica obrigatória

A regra-base usa `stance: recommend` como sentinel técnico para permitir execução do resolver no Foundation atual, porém:

- possui `actions: []`;
- possui outcome genérico `NotApplicable`;
- não representa recomendação clínica genérica por si só;
- o estado clínico final é definido pelo resolver governado.

- [ ] R2 considera essa solução aceitável como hotfix mínimo temporário.
- [ ] R2 concorda que UI/relatório/provenance não devem interpretar `stance` isoladamente como recomendação.

## Resultado

Marcar uma opção:

- [ ] **Aprovação integral** das três traduções corrigidas.
- [ ] **Aprovação parcial** — regras aprovadas: ____________________
- [ ] **Mudanças requeridas** — descrição: ____________________

## Comentários clínicos adicionais

__________________________________________________________________

__________________________________________________________________

## Declaração

A aprovação R2, se concedida, autoriza somente a etapa separada de promoção de governança para `reviewed_by_2`. Não autoriza `active`, merge, deploy, publicação ou uso clínico real.
