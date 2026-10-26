# Mama — M3 R1 gate

Status: **R1 aprovado; snapshot reviewed_by_1 criado; gate automatizado verde; ainda draft e não ativo**.

Data do gate humano: 2026-10-26.

Aprovação explícita:

> Aprovo R1 da M3 de Mama, com o gap <40 mantido aberto para M3.1 e a provenance multi-fonte dos hard exits mantida provisoriamente até a integração de produto/relatório.

## Snapshot R1

- ruleset original preservado: `breast-0.1.0-m3-draft`;
- snapshot R1: `breast-0.1.1-m3-r1-draft`;
- 15/15 regras permanecem `lifecycleStatus: draft`;
- 15/15 regras passam de `source_verified` para `reviewed_by_1`;
- nenhuma regra é ativada;
- policies, sources, terminology, sourceRefs, actions, schedules e guardrails clínicos permanecem semanticamente inalterados.

## Ressalvas R1 aprovadas

### Gap M3-01 — idade <40

Permanece aberto. R1 não autoriza inventar `recommend_against` apenas porque as faixas populacionais dos referenciais começam em 40 anos. Antes de ativação, M3.1 deve definir uma tradução source-backed com provenance adequada para o estado abaixo de 40.

### Provenance multi-fonte dos hard exits comuns

Permanece provisoriamente aceita durante regras draft/R2. Antes de integração final de produto/relatório Mama, reavaliar se a apresentação de provenance multi-fonte é suficientemente clara ou se algum hard exit precisa de variantes policy-specific.

## Semânticas explicitamente aprovadas no R1

- `SharedDecision` é computável sem decidir a escolha clínica final;
- SUS 40–49 e >74 permanecem decisão individual, não `Due` automático;
- Brasil ampliado 75+ permanece decisão individual, não `Due` automático;
- USPSTF 75+ preserva evidência insuficiente e não emite recomendação positiva de mamografia;
- história familiar comum não é hard exit automático;
- `breast-known-high-risk-familial-context` significa alto risco familiar já estabelecido, sem cálculo pelo Motor;
- apenas mamografia de rastreamento explicitamente `routine-clearing` pode ancorar o relógio;
- mamografia diagnóstica não ancora rastreamento;
- BI-RADS bruto não é interpretado;
- cuidado específico ativo permanece abstention no engine e será tratado futuramente pelo Boundary de produto sem falsificar `stance`.

## Gate automatizado do snapshot R1

- schema checks: **62/62**;
- test files: **47/47**;
- tests: **608/608**;
- Mama M3 golden cases: **10/10**;
- Mama M3 R1 governance tests: **5/5**;
- Foundation typecheck: passou;
- CCR pilot typecheck: passou;
- Foundation build: passou;
- CCR pilot build: passou;
- V2 byte-for-byte: preservada.

Os testes R1 verificam explicitamente que:

1. o snapshot original `source_verified` permanece preservado;
2. 15/15 regras do snapshot R1 ficam `reviewed_by_1` e ainda `draft`;
3. a mudança é somente de governança;
4. o gap <40 continua aberto;
5. a provenance multi-fonte dos hard exits comuns continua preservada provisoriamente.

## O R1 não autoriza

- `lifecycleStatus: active`;
- `reviewed_by_2`;
- candidate/entrypoint clínico ativo;
- UI ou relatório Mama;
- merge/deploy/uso clínico real;
- fechamento automático do gap <40.

## Próximo gate

Pacote R2 independente preparado em `13-phase-m3-r2-review-packet.md`.

A segunda revisão deve ser realmente independente. O snapshot só poderá receber `reviewed_by_2` após resposta R2 documentada e eventuais correções obrigatórias. Mesmo após R2, ativação permanece um gate humano separado e o gap <40 deve estar resolvido antes de activation readiness.
