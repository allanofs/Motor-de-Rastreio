# 20 — Fase 6.5: golden suite ampliada e propriedades de segurança

**Data:** 24/10/2026. **Branch:** `v3-ccr-rules-pilot`. **PR:** #3 (Draft).

## Objetivo

Atacar sistematicamente o módulo CCR já construído, sem adicionar nova medicina, para encontrar traduções inseguras, vazamento entre policies, dependência de ordem de entrada, ambiguidades temporais, ações redundantes e falhas de rastreabilidade antes do freeze da Fase 6.

A Fase 6.5 partiu do manifesto de 60 casos adversariais de `12-adversarial-cases.md` e o transformou em testes executáveis e propriedades transversais. Nem todo caso documental corresponde a um único teste unitário: alguns são exercitados por matrizes de policy, care-setting, ordem de eventos, precisão temporal ou por suítes especializadas das Fases 6.3/6.4.

## Resultado

**Gate aprovado.** A versão clínica draft mais recente passa a ser:

`crc-0.5.0-phase6.5-draft`

A Foundation continuou intacta.

## Suíte adversarial nova

### `goldenSafety.test.ts` — 51 testes

Cobre:

- identidade do manifesto 001–060;
- fronteiras de idade e intervalo;
- divergência SUS × BA-A × Internacional aos 47 anos;
- vencimento exato do FIT SUS no aniversário de 2 anos, sem grace period inventado;
- `unknown` versus `never_performed`;
- contradição `never_performed` + exame realizado;
- exames futuros em relação ao `asOf`;
- gate profissional de contexto preventivo;
- hard exclusions sem ação de rotina;
- Care Setting `available` / `unknown` / `unavailable` mantendo a decisão científica e alterando somente a rota operacional;
- data parcial anual versus bienal;
- mesma data e datas parciais sobrepostas sem ordem fictícia;
- invariância à ordem de entrada de eventos;
- FIT+ prevalecendo sobre ação de rotina;
- FIT inválido posterior sem apagar cobertura negativa válida anterior;
- novo FIT+ depois de episódio anterior resolvido;
- história familiar desconhecida preservando indicação populacional mínima e retendo estratégia;
- isolamento ACG apenas na policy Internacional;
- determinismo byte-for-byte da mesma requisição;
- invariância à ordem de fatos semanticamente idênticos;
- ausência de `actionId` duplicado no plano;
- `policyId`, `rulesetVersion` e `asOf` corretos no trace;
- ausência de fonte ACG em traces SUS/BA-A;
- todo `recordUsed` contido em `recordsConsidered`;
- permutações de ordem de exames nas três policies.

A matriz `goldenSafety` preserva o snapshot 6.4 para demonstrar não regressão dos comportamentos já congelados antes da correção de hard exclusions.

### `specialRisk.test.ts` — 16 testes

O ataque adversarial revelou um gap real de tradução: CRC prévio, surveillance por pólipo relevante, DII colônica e síndrome hereditária já suprimiam a rotina average-risk, mas podiam terminar apenas como `NotApplicable`.

Isso contradizia a decisão clínica revisada de que essas condições devem sair da automação simples com **`ClinicalReviewRequired`**, salvo `HandedOff` realmente confirmado.

Correção implementada sem alterar Foundation:

- novo track `crc-special-risk-status`;
- 4 hard exclusions × 3 policies = 12 regras draft/source_verified;
- cada policy usa apenas sua própria fonte governante:
  - SUS → `crc-src-B12`;
  - BA-A → `crc-src-S01`;
  - Internacional → `crc-src-I01`;
- diagnóstico/risco especial não vira `HandedOff` automaticamente;
- nenhuma ação FIT de rotina é emitida.

Os 16 testes verificam o bundle, isolamento de fonte e todas as combinações policy × hard exclusion.

### `phase65Regression.test.ts` — 5 testes

Depois da correção do track de risco especial, foi criado um smoke explícito contra o **ruleset 6.5 mais recente**, para garantir que a nova camada não regrediu caminhos comuns:

1. SUS, 60 anos, never-screened average-risk → `Due` para FIT;
2. BA-A, 47 anos → `SharedDecision`;
3. Internacional, FIT selecionado → estratégia anual continua executável;
4. FIT+ aberto continua `InFollowUp` e suprime FIT de rotina;
5. FIT− válido recente continua `Current` no SUS.

## Falhas encontradas durante o ataque

### 1. Duas falhas do próprio teste

O primeiro run adversarial falhou por especificações incorretas da suíte, não do Motor:

- o teste esperava o issue temporal `date_after_asOf`, enquanto a Foundation corretamente emite `future_date`;
- um cenário destinado a testar sobreposição temporal usava colonoscopia com precisão apenas `2026`, que ainda incluía futuro possível em `asOf=24/10/2026`; a validação semântica rejeitou o dado antes de chegar ao resolver. O cenário foi corrigido para intervalos parciais totalmente no passado e ainda sobrepostos.

Essas correções preservaram a propriedade clínica testada.

### 2. Um gap clínico real de tradução

Hard exclusions estavam seguros contra emissão de screening average-risk, porém insuficientemente explícitos no estado final. O adversarial mostrou que “não recomendar rotina” não é equivalente a “declarar que este paciente precisa de revisão clínica”.

A correção criou o track `crc-special-risk-status` e tornou `ClinicalReviewRequired` explícito. Esse foi o principal valor clínico descoberto na 6.5.

## Contagem acumulada de testes CCR

| Bloco | Testes |
|---|---:|
| 6.0 representabilidade | 17 |
| 6.1 contrato | 15 |
| 6.2 estratégias | 14 |
| 6.3 longitudinal FIT+ | 19 |
| 6.4 história familiar | 18 |
| 6.5 matriz adversarial | 51 |
| 6.5 hard exclusions | 16 |
| 6.5 regressão do ruleset mais recente | 5 |
| **Total CCR específico** | **155** |

O workflow `npm test` do commit de regressão `1f06c0041136a4caff83a8fff4095c67fc5cb334` terminou com:

- **397/397 testes totais**;
- `goldenSafety.test.ts`: **51/51**;
- `specialRisk.test.ts`: **16/16**;
- `phase65Regression.test.ts`: **5/5**;
- `longitudinal.test.ts`: **19/19**;
- `familyHistory.test.ts`: **18/18**;
- `representability.test.ts`: **17/17**;
- `strategies.test.ts`: **14/14**;
- `contract.test.ts`: **15/15**.

Também passaram:

- typecheck: ✅;
- schema checks: ✅ 62/62;
- build: ✅;
- V2 byte-for-byte: ✅.

## Propriedades de segurança demonstradas

### Determinismo

A mesma entrada produz saída byte-for-byte idêntica. Reordenar facts ou eventos semanticamente equivalentes não muda a interpretação clínica.

### Segurança temporal

Datas futuras são rejeitadas; same-day e intervalos parciais sobrepostos não ganham ordem artificial; precisão parcial pode gerar estados diferentes quando o intervalo anual e bienal cruzam fronteiras diferentes.

### Não redundância

FIT+ aberto nunca coexiste com nova ação de FIT/colonoscopia de screening. Follow-up diagnóstico governa a ação até resolução, revisão ou handoff real.

### Isolamento de policy

ACG não aparece em SUS/BA-A; hard exclusions usam fonte local da policy; divergências de idade/estratégia permanecem deliberadas.

### Care Setting

Disponibilidade de FIT/colonoscopia altera `operational.route`, não `Due`/`InFollowUp` nem a evidência científica.

### Rastreabilidade

Traces preservam policy, ruleset, `asOf`, fontes, records usados/considerados e relações longitudinais relevantes. Nenhum `recordsUsed` fica fora de `recordsConsidered` nos cenários auditados.

## Limites honestos da cobertura

- Os 60 casos adversariais permanecem um **manifesto clínico**, não uma alegação de 60 testes unitários one-to-one.
- Casos deliberadamente fora do piloto (por exemplo, modalidades ACS não governantes ou surveillance completa) são testados principalmente como abstensão/isolamento, não como algoritmos que o Motor não pretende implementar.
- `goldenSafety.test.ts` mantém um snapshot 6.4 para não regressão histórica; `specialRisk.test.ts` e `phase65Regression.test.ts` validam explicitamente o ruleset 6.5 mais recente. A Fase 6.6 deve fazer a auditoria final de trace/governança sobre a versão candidata mais recente como um todo.
- Nenhum resultado desta fase promove regras clínicas a `active`; produção continua `draft/source_verified`.

## Fronteiras preservadas

- `v3/src/engine/**`: **0 mudanças**;
- `v3/src/model/**`: **0 mudanças**;
- nenhuma regra recebeu revisão clínica de código por herança automática;
- PR #3 permanece Draft;
- nenhum merge.

## Próximo gate

**Fase 6.6 — auditoria final de trace, governança e freeze clínico-técnico do piloto CCR.**

Essa fase deve verificar a tradução regra ↔ especificação clínica, promover somente o que tiver revisão humana explícita da tradução, auditar fontes/traces/IDs/versões e produzir um relatório de readiness. Não deve adicionar nova medicina nem expandir o escopo do piloto.