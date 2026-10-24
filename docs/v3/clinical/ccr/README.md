# CCR — Pesquisa e especificação clínica, Fase 5

**Consolidação clínica pós-auditoria: 24/10/2026.** Este diretório representa a especificação clínica documental do piloto de rastreamento de câncer colorretal do Motor de Rastreio V3. O conteúdo anterior à primeira revisão humana permanece preservado no commit `9c12ba39ac70ef94016c11eccf58ad90a71d9241`.

## Estado da revisão

- primeira revisão humana do projeto concluída;
- decisões clínicas centrais consolidadas neste commit;
- proposições aprovadas/modificadas passam a registrar revisão de primeira camada (`reviewed_by_1`) somente após terem sido reescritas para refletir as decisões aprovadas;
- isso **não equivale a validação clínica independente por médico especialista**;
- uma segunda revisão médica independente continua necessária antes de qualquer release clínico público;
- nenhuma regra executável, resolver, teste clínico, UI ou mudança da Foundation é criada nesta fase.

## Limites do produto aprovados

O V3 é **clinical decision support para uso profissional**, não ferramenta autônoma de triagem, diagnóstico ou urgência para pacientes. O profissional confirma que está usando o módulo em contexto apropriado de rastreamento preventivo. O Motor não coleta nem interpreta sintomas para decidir urgência ou investigação diagnóstica.

Quando uma política admite mais de uma estratégia clinicamente válida, o Motor informa as opções e calcula intervalos/estado; a escolha da estratégia é humana. Disponibilidade local altera a operacionalização, não a evidência nem a indicação clínica.

## Políticas consolidadas

| Política | Núcleo do piloto |
|---|---|
| SUS / Brasil oficial | risco habitual, 50–75 anos inclusive, FIT bienal; FIT+ exige colonoscopia; próxima agenda após FIT+→colonoscopia normal permanece bloqueada até fonte brasileira final suficiente |
| Brasil ampliado — BA-A | 45–49 decisão compartilhada/revisão; 50–75 FIT bienal como default; colonoscopia primária de 10 anos como estratégia alternativa explicitamente escolhida; sem mistura automática de fontes |
| Internacional | USPSTF como governante populacional; FIT anual ou colonoscopia de 10 anos como estratégias escolhidas pelo humano; ACG como complemento familiar; USMSTF para FIT+ e colonoscopia de alta qualidade |

## Documentos

| Documento | Conteúdo consolidado |
|---|---|
| [01-source-census](01-source-census.md) | 27 documentos candidatos, status e atualização de acesso |
| [02-source-authority](02-source-authority.md) | autoridade por pergunta/policy e bloqueios remanescentes |
| [03-clinical-questions](03-clinical-questions.md) | 32 perguntas clínicas com estado pós-revisão |
| [04-proposition-register](04-proposition-register.md) | auditoria das 45 proposições e status de primeira revisão |
| [05-sus-policy](05-sus-policy.md) | policy SUS consolidada |
| [06-brasil-ampliado-policy](06-brasil-ampliado-policy.md) | BA-A consolidada |
| [07-international-policy](07-international-policy.md) | USPSTF + complementos especializados declarados |
| [08-longitudinal-pathways](08-longitudinal-pathways.md) | pathways e qualificadores pós-auditoria |
| [09-data-requirements](09-data-requirements.md) | dados mínimos profissionais; sem checklist sintomático |
| [10-care-setting](10-care-setting.md) | recursos e rotas sem fallback clínico inventado |
| [11-policy-divergences](11-policy-divergences.md) | diferenças clinicamente significativas entre policies |
| [12-adversarial-cases](12-adversarial-cases.md) | 60 casos documentais atualizados para futura golden suite |
| [13-open-questions](13-open-questions.md) | 23 questões com status atual |
| [14-clinical-review-packet](14-clinical-review-packet.md) | pacote de primeira revisão e gates para Fase 6 |
| [REPORT](REPORT.md) | registro da consolidação, escopo e readiness |

## Governança

`FINAL` descreve a fonte, não a nossa interpretação. `reviewed_by_1` descreve primeira revisão do conteúdo consolidado, não equivalência a guideline oficial. Sistemas de graduação permanecem separados (USPSTF, GRADE, NE/FR etc.). Silêncio, inacessibilidade e contradição documental continuam resultados distintos.

A PR #2 permanece **Draft**, com base `v3-foundation-technical`. Não fazer merge nem iniciar implementação clínica até concluir os gates documentais e técnicos registrados neste pacote.
