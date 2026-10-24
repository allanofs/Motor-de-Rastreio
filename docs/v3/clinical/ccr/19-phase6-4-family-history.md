# 19 — Fase 6.4: história familiar e risco especial limitado

**Data:** 24/10/2026. **Branch:** `v3-ccr-rules-pilot`. **PR:** #3 (Draft).

## Objetivo

Implementar história familiar sem contaminar as policies brasileiras com algoritmo internacional e sem transformar história familiar desconhecida em história familiar negativa.

## Fonte especializada

A policy Internacional usa **ACG 2021 somente como suplemento especializado de história familiar**, mantendo USPSTF como governante populacional.

Padrões automatizados no piloto:

- 1 familiar de primeiro grau (FDR) com CRC/pólipo avançado diagnosticado antes de 60 anos → colonoscopia, início aos 40 anos ou 10 anos antes do familiar mais jovem, o que ocorrer primeiro; repetição a cada 5 anos;
- 2 ou mais FDRs com CRC/pólipo avançado em qualquer idade → mesma via de colonoscopia q5;
- exatamente 1 FDR diagnosticado aos 60 anos ou mais → iniciar aos 40 anos e depois usar modalidades/intervalos de risco habitual;
- exatamente 1 familiar de segundo grau isolado → recomendações de risco habitual;
- história complexa, tipo de pólipo desconhecido, padrão não representado ou suspeita hereditária → abstensão/revisão clínica.

## Dados estruturados

A resposta inicial permanece:

`Algum familiar teve câncer colorretal ou pólipo avançado?` → Sim / Não / Não sei.

Quando positiva, o fato `crc-family-history-relevant` pode carregar detalhes estruturados:

- `affected-fdr-count`;
- `affected-sdr-count`;
- `youngest-diagnosis-age-band` = `under-60` / `60-or-older` / `unknown`;
- `finding-type` = `crc` / `advanced-polyp` / `polyp-unknown-type` / `unknown`;
- `youngest-diagnosis-age-years` é **opcional** e só é necessário para automatizar corretamente a regra “10 anos antes” quando o paciente ainda tem menos de 40 anos.

A idade mais precisa não vira requisito global de formulário. Se o paciente já tem 40 anos ou mais e o padrão ACG alto risco está suficientemente classificado, a ausência dessa idade exata não impede a via q5.

## Tracks adicionados

- `crc-family-status` — qualidade/classificação da informação familiar e policy boundary;
- `crc-family-high-risk` — ACG colonoscopia q5;
- `crc-family-strategy-choice` — ponte ACG para 1 FDR ≥60 entre 40–44 anos.

As rules FIT/colonoscopia de 40–44 anos para 1 FDR ≥60 reutilizam os tracks de estratégia existentes, mantendo a escolha humana.

## Comportamento por policy

### SUS

Qualquer história familiar positiva relevante sai da automação de rotina simples → `ClinicalReviewRequired`. Nenhum intervalo ACG é importado.

História familiar desconhecida em pessoa que já está na faixa populacional 50–75 não é convertida em “sem risco familiar”: a rotina automática FIT é suspensa como `Indeterminate` até esclarecimento.

### Brasil ampliado BA-A

Mesma postura conservadora para história familiar positiva relevante: `ClinicalReviewRequired`, sem algoritmo ACG silencioso.

### Internacional

- `high-risk` ACG → colonoscopia q5;
- 1 FDR ≥60, idade 40–44 → escolha humana FIT anual ou colonoscopia q10;
- após 45 anos, 1 FDR ≥60 volta às modalidades/intervalos de risco habitual;
- 1 SDR isolado usa risco habitual;
- história desconhecida mantém a indicação mínima populacional por idade visível, mas a ação de estratégia/modality fica retida até esclarecimento;
- padrão complexo/incompleto não é forçado em regra simplificada.

## Regra dinâmica abaixo de 40 anos

Para padrão ACG q5, o início é `min(40, idade do familiar mais jovem - 10)`.

Quando o paciente tem menos de 40 anos:

- se `youngest-diagnosis-age-years` estiver disponível → calcular o início;
- se não estiver → `Indeterminate`, porque a informação ausente realmente decide se já está na hora de rastrear;
- se o cálculo cair abaixo do limite adulto do piloto → `ClinicalReviewRequired`/avaliação de risco hereditário, sem extrapolação automática.

## Interação com FIT positivo

Follow-up diagnóstico continua tendo prioridade:

- FIT+ aberto suprime rastreamento familiar de rotina;
- história familiar não bloqueia a colonoscopia diagnóstica necessária;
- uma colonoscopia diagnóstica pós-FIT normal não é silenciosamente convertida no clock q5 de alto risco familiar neste piloto;
- o q10 pós-FIT da policy Internacional é bloqueado para alto risco familiar, pois a recomendação average-risk de 10 anos não deve ser aplicada a esse grupo sem revisão.

## Falha útil encontrada no gate

O primeiro comportamento clínico incorreto detectado pelos goldens foi:

- 62 anos, indicação populacional Internacional presente;
- história familiar desconhecida;
- estratégia FIT já preenchida;
- o resolver antigo escondia `Due` porque interpretava “estratégia já escolhida”.

Correção: quando história familiar está desconhecida/incompleta, o track populacional preserva o **estado genérico de idade** (`Due`/`SharedDecision`) e remove a ação de estratégia. Assim a indicação mínima permanece visível enquanto a estratégia final aguarda esclarecimento familiar.

## Goldens adicionados

18 testes executáveis cobrem:

1. governança draft/source_verified;
2. 1 FDR <60 → q5 colonoscopia;
3. q5 `Current` após colonoscopia de screening recente;
4. ≥2 FDRs → q5;
5. paciente <40 sem idade exata do familiar → `Indeterminate`;
6. regra de 10 anos antes quando idade exata está disponível;
7. 1 FDR ≥60, 40–44 → escolha humana;
8. FIT anual selecionado em 40–44;
9. colonoscopia q10 selecionada em 40–44;
10. 1 FDR ≥60 após 45 → intervalos de risco habitual;
11. 1 SDR isolado → risco habitual;
12. história familiar desconhecida preserva indicação populacional, mas bloqueia estratégia final;
13. unknown ≠ negative;
14. SUS não emite FIT automático com história familiar desconhecida na faixa de rotina;
15. pólipo familiar de tipo desconhecido → `ClinicalReviewRequired`;
16. mesmo alto risco → ACG q5 somente Internacional e review em SUS/BA-A;
17. SDR positivo isolado continua fora da automação brasileira simples;
18. q10 pós-FIT Internacional não é aplicado automaticamente ao alto risco familiar.

## CI

Workflow final verde do commit `830abcfae82f904c8dcc4c46a7f2b7d49e1a8c55`:

- typecheck: ✅
- schema checks: ✅ 62/62
- suíte total: ✅ **325/325**
- `tests/ccr/familyHistory.test.ts`: ✅ **18/18**
- build: ✅
- V2 byte-for-byte: ✅

## Fronteiras preservadas

- `v3/src/engine/**`: **0 mudanças** na 6.4;
- `v3/src/model/**`: **0 mudanças** na 6.4;
- nenhuma regra clínica promovida a `active`;
- regras continuam `draft/source_verified`;
- PR #3 permanece Draft;
- nenhum merge.

## Próximo gate

**Fase 6.5 — golden suite ampliada e propriedades de segurança.**

Objetivo: transformar os casos adversariais da Fase 5 em uma suíte executável mais ampla, adicionar variantes de precisão temporal/ordem de entrada/policy/care-setting e testar invariantes transversais (determinismo, isolamento de policy, ausência de ações redundantes e rastreabilidade completa) antes da auditoria final de trace/governança.
