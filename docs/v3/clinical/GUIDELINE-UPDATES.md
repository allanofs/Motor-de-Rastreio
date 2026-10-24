# Protocolo de atualização de diretrizes e rulesets clínicos — V3

**Criado:** 24/10/2026.

## Princípio

O Motor **não altera conduta clínica automaticamente porque uma página da internet mudou**. Detecção de atualização e ativação clínica são processos separados.

O engine permanece independente de rede e paciente. Atualizações clínicas entram como novas versões imutáveis de conteúdo/ruleset.

## Fluxo

```text
fonte oficial/sociedade publica atualização
        ↓
detecção da mudança
        ↓
triagem: a mudança afeta alguma proposição/rule ativa?
        ↓
clinical diff legível
        ↓
nova versão candidata do ruleset
        ↓
schema + typecheck + golden cases + policy isolation + trace audit
        ↓
revisão humana da tradução
        ↓
segunda revisão independente quando exigida para release público
        ↓
versão aprovada/assinada/publicada
        ↓
aplicação passa a exibir a nova versão
```

## Detecção

### Agora

A detecção é curada: revisão periódica das fontes governantes e `lastVerifiedAt` explícito. Mudança de URL, documento, versão, data ou recomendação abre auditoria; não muda regra ativa.

### Evolução prática futura

Pode haver um job externo/CI que monitore apenas metadados e conteúdo público das fontes oficiais (por exemplo, página de recomendação, versão, hash ou documento novo) e abra automaticamente um alerta/issue do tipo:

`SOURCE_UPDATE_CANDIDATE: crc-src-I01`.

Esse monitor **nunca** recebe dados de pacientes e **nunca** altera um ruleset clínico por conta própria.

## Clinical diff

Toda atualização relevante deve ser traduzida para diferenças compreensíveis, por exemplo:

- faixa etária: `50–75 → 45–75`;
- intervalo: `FIT q2y → FIT q1y`;
- nova modalidade elegível;
- mudança de grade/força;
- mudança de exclusão;
- mudança de follow-up;
- fonte substituída/superseded sem mudança de comportamento.

Uma mudança de texto sem impacto clínico pode atualizar metadados sem alterar outputs.

## Versionamento

Rulesets clínicos publicados são imutáveis. Uma atualização cria nova versão, por exemplo:

- `crc-1.0.0` — release validado;
- `crc-1.0.1` — correção documental/metadado sem mudança de decisão;
- `crc-1.1.0` — nova recomendação compatível/novo comportamento previsto;
- `crc-2.0.0` — mudança de policy/semântica que altera substancialmente decisões.

O app exibe a versão do ruleset utilizada na decisão. Reproduzir uma decisão antiga exige paciente + `asOf` + policy + ruleset version correspondente.

## Atualização no produto

A aplicação não precisa ser reescrita quando muda uma diretriz. Em cenário normal:

1. atualizar/adicionar `Source`;
2. alterar/adicionar `RuleDefinition` e/ou resolver clínico específico;
3. atualizar os goldens afetados;
4. revisar o clinical diff;
5. publicar nova versão do ruleset.

`engine/**` e `model/**` só são reabertos se uma recomendação nova produzir um contraexemplo que não possa ser representado pela Foundation existente.

## Aparência para o usuário

O produto pode mostrar, sem interromper o fluxo clínico:

- `Referencial: SUS / Brasil oficial`;
- `Ruleset: crc-x.y.z`;
- `Fontes verificadas em: AAAA-MM-DD`;
- quando aplicável: `Existe uma versão clínica mais recente disponível`.

A versão nova só substitui a anterior depois de aprovada. Não há “hot update” clínico silencioso no meio de uma consulta.

## Urgência de atualização

Classificação sugerida:

| Classe | Exemplo | Resposta |
|---|---|---|
| metadata-only | URL mudou, conteúdo clínico igual | patch documental |
| clinical-nonbreaking | novo intervalo/opção dentro da mesma arquitetura | novo minor ruleset + goldens/revisão |
| clinical-breaking | faixa, policy ou sequência muda de modo amplo | major ruleset + revisão ampliada |
| safety-critical | recomendação retirada, dano identificado, fonte withdrawn | bloquear release afetado / revisão prioritária |

## Praticidade

A intenção arquitetural é que **a maior parte das atualizações de diretriz seja manutenção de conteúdo, não programação do engine**. Isso permite atualizar um módulo sem revalidar toda a arquitetura, embora toda mudança clínica continue passando pela suíte de regressão global.

Automatizar a **detecção** é desejável; automatizar a **interpretação e ativação clínica** não é.
