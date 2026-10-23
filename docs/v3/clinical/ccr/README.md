# CCR — Pesquisa e especificação clínica, Fase 5

**Corte 23/10/2026. Todas as proposições awaiting_clinical_review.** O Work é autor/proponente; nenhum revisor clínico humano foi registrado. Documentação de propostas, não aconselhamento individual ou protocolo ativado.

Comece pelo [clinical-review-packet](14-clinical-review-packet.md), que reúne as decisões essenciais, fontes diretas, limites e perguntas de aprovação sem exigir leitura dos demais arquivos.

| Documento | Conteúdo |
|---|---|
| [01-source-census](01-source-census.md) |27 fontes candidatas distintas, status, acesso, URL e verificação |
| [02-source-authority](02-source-authority.md) | Cadeia brasileira e autoridade por documento |
| [03-clinical-questions](03-clinical-questions.md) |32 perguntas clínicas anteriores à extração |
| [04-proposition-register](04-proposition-register.md) |45 proposições com fonte, interpretação e especificação propostas separadas |
| [05-sus-policy](05-sus-policy.md) | Núcleo e bloqueios da policy SUS |
| [06-brasil-ampliado-policy](06-brasil-ampliado-policy.md) | Curadoria BA-A e alternativas explícitas |
| [07-international-policy](07-international-policy.md) | Opção A/USPSTF e B/ACS 2026; complementos por pergunta |
| [08-longitudinal-pathways](08-longitudinal-pathways.md) | Sequências, qualificadores, estados e cronologia |
| [09-data-requirements](09-data-requirements.md) | Dados mínimos, perguntas humanas eunknown |
| [10-care-setting](10-care-setting.md) | Recursos/rotas, sem fallback clínico inventado |
| [11-policy-divergences](11-policy-divergences.md) | Comparability gate e efeito para paciente |
| [12-adversarial-cases](12-adversarial-cases.md) |60 candidate clinical cases, não executáveis |
| [13-open-questions](13-open-questions.md) |23 questões, 14 P0, bloqueios de acesso e 4 gaps candidatos/limites |
| [14-clinical-review-packet](14-clinical-review-packet.md) | Pacote principal para revisão humana |
| [REPORT](REPORT.md) | Execução, mudanças de conclusão, preservação e entrega |

## Leitura dos rótulos

FINAL descreve a fonte, não aprovação da nossa proposição. PRELIMINARY continua preliminar mesmo quando tem recomendação forte. Fonte inacessível não é fonte inexistente. not formally graded só é usado quando não há graduação naquele enunciado; falta de acesso à graduação deve permanecer não verificada.

AUTOMATE, AUTOMATE_WITH_MISSING_DATA_GUARD, DECISION_SUPPORT_ONLY, HAND_OFF e DO_NOT_IMPLEMENT_YET são candidatos de revisão, sem autorização de execução. “Compartilhada”, “revisão” e “encaminhamento” não são equivalentes a paciente já avaliado ou cuidado transferido.

## Limite do trabalho

Branch local `v3-ccr-clinical-spec`, baseada em `8c63356` da Foundation. O envio ao GitHub e a criação da PR empilhada estão bloqueados pela revisão automática, conforme REPORT.md; nenhuma nova branch remota ou PR foi criada. Apenas este diretório é alterado. PR #1, Foundation e V2 permanecem congeladas. Nenhuma regra, resolver clínico, golden test executável, UI, backend ou persistência. Sem merge/publicação. A fase termina com este pacote documental e as decisões pendentes.
