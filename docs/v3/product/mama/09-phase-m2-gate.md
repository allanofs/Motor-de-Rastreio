# Mama — M2 gate

Status: **implementada e tecnicamente verde; aguardando aprovação humana das traduções antes de M3**.

## Gates humanos anteriores

- M0 — escopo, referenciais e Depth Budget: aprovado em 2026-10-26.
- M1 — vocabulário, tracks, hard exits e contrato temporal mínimo: aprovado em 2026-10-26.

## Entregas M2

Código evidence/provenance-only:

- `v3/src/clinical/mama/sources.ts`
- `v3/src/clinical/mama/evidence.ts`

Documentação:

- `07-phase-m2-governed-source-catalog.md`
- `08-phase-m2-translation-decisions.md`
- `09-phase-m2-gate.md`

Teste:

- `v3/tests/mama/sourceEvidence.test.ts`

## Fonte governante por família

### SUS / Brasil oficial

- Nota Técnica nº 626/2025-CGCAN/DECAN/SAES/MS;
- INCA — Detecção precoce, atualização de setembro de 2025 como confirmação de escopo e alto risco.

### Brasil ampliado

- Comissão Nacional de Mamografia (CBR/SBM/FEBRASGO) — Nota Técnica 27/01/2025 para o núcleo atual 40–74 anual / 75+ individualizado;
- Urban et al., Radiol Bras. 2023;56(4):207–214 para locators detalhados, risco especial e grading.

### Internacional

- USPSTF — Breast Cancer: Screening — Final Recommendation Statement 30/04/2024.

## Decisões source-verified

- SUS: 50–74 bienal como núcleo populacional atual;
- SUS: 40–49 e >74 por demanda com orientação, não equivalentes ao núcleo populacional;
- sintomas suspeitos saem do rastreamento de rotina;
- Brasil ampliado: 40–74 anual;
- Brasil ampliado: 75+ depende de individualização/expectativa de vida;
- USPSTF: 40–74 bienal, Grade B;
- USPSTF: 75+ = evidência insuficiente, I statement;
- USPSTF inclui história familiar de primeiro grau no escopo, mas exclui contextos substancialmente elevados como mutação/síndrome de alto risco, radioterapia torácica jovem, câncer prévio e lesão de alto risco;
- achado anormal não permite reinício silencioso da rotina;
- DBT possui suporte como modalidade mamográfica, mas não será estratégia separada V1;
- M1 permanece sem interpretação de BI-RADS bruto.

## Dois gaps explícitos antes de M3

### Gap M2-01 — alto risco familiar sem mutação conhecida

A fonte brasileira detalhada trata forte história familiar / risco vitalício ≥20% como via especial. M1 possui `breast-high-risk-genetic-context`, que não deve ser sobrecarregado para significar qualquer alto risco familiar.

Proposta:

- adicionar `breast-known-high-risk-familial-context` ao vocabulário M1 antes das regras;
- o conceito significa **alto risco familiar já estabelecido**, não cálculo pelo Motor;
- não implementar Gail/Tyrer-Cuzick/BOADICEA em V1.

### Gap M2-02 — escopo do Brasil ampliado

A diretriz societária completa inclui imagem suplementar em cenários específicos; Mama V1 implementará o núcleo mamográfico + saídas seguras.

Proposta:

- deixar isso explícito em UI técnica/relatório;
- não apresentar V1 como implementação completa de US/RM suplementar;
- não interpretar a omissão como recomendação contra esses exames.

## Traduções propostas para o futuro M3

1. SUS 40–49 e >74 → `SharedDecision`/decisão individual, não `Due` populacional automático.
2. Brasil ampliado 75+ → não `Due` automático sem contexto prognóstico governado.
3. USPSTF 75+ → preservar `insufficient_evidence`; nenhuma recommendation action positiva.
4. História familiar comum → não hard exit automático.
5. Alto risco familiar conhecido → hard exit específico se o conceito M2-01 for aprovado.
6. Mamografia prévia → somente `routine-clearing`, `attention-required` ou `indeterminate`; sem BI-RADS bruto.
7. DBT → sem estratégia separada V1.
8. Brasil ampliado V1 → núcleo mamográfico, com limitação de escopo explícita.

## Gate automatizado

Head funcional validado: `6a9df095b3ffebc4d249ead521d2fbdc911825bb`.

- schema checks: **62/62**;
- test files: **45/45**;
- tests: **593/593**;
- Mama M1 domain representability: **6/6**;
- Mama M2 source/evidence gate: **6/6**;
- Foundation typecheck: passou;
- CCR pilot typecheck: passou;
- Foundation build: passou;
- CCR pilot build: passou;
- V2 byte-for-byte: preservada.

## O que M2 não autoriza

- nenhuma regra executável de Mama;
- nenhuma policy ativa;
- nenhuma action clínica;
- nenhum schedule anual/bienal em código de regra;
- nenhuma tradução automática de 75+;
- nenhuma árvore BI-RADS;
- nenhuma calculadora de risco familiar;
- nenhuma UI de Mama;
- nenhum merge/deploy/uso clínico real.

## Gate humano antes de M3

M3 só deve começar após aprovação explícita das oito traduções acima e de uma decisão sobre os gaps M2-01 e M2-02.
