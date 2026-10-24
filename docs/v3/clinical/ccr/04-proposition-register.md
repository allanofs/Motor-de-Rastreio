# 04 — Registro de proposições — consolidação da primeira revisão

**Data:** 24/10/2026. O registro detalhado pré-revisão das 45 proposições permanece no commit `9c12ba39ac70ef94016c11eccf58ad90a71d9241`. Esta versão é o registro governante para planejamento da Fase 6.

## Legenda

- `APPROVED_R1`: texto/conceito aprovado na primeira revisão humana.
- `APPROVED_R1_MODIFIED`: proposição original foi corrigida pela revisão e a formulação abaixo é a aprovada.
- `REJECTED_REPLACED`: formulação original não deve ser implementada.
- `DOCUMENTARY_ONLY`: manter como documentação/apoio, não como regra clínica do piloto.
- `PHASE6_TECHNICAL_GATE`: propriedade técnica a provar, não proposição clínica.

`reviewed_by_1` significa apenas primeira revisão do projeto; não substitui segunda revisão médica independente antes de release público.

## Matriz consolidada das 45 proposições

| ID | Status | Especificação consolidada |
|---|---|---|
| CCR-PROP-001 | `APPROVED_R1_MODIFIED` | SUS: risco habitual em contexto preventivo, 50–75 inclusive; FIT é núcleo. Sintomas não são dado obrigatório do Motor; aplicar gate profissional de escopo. |
| CCR-PROP-002 | `APPROVED_R1` | SUS: FIT é método primário do núcleo; indisponibilidade não autoriza colonoscopia primária automática. |
| CCR-PROP-003 | `APPROVED_R1_MODIFIED` | FIT SUS negativo final válido ancora 2 anos a partir da coleta/realização, respeitando precisão da data e ausência de FIT+ aberto. |
| CCR-PROP-004 | `APPROVED_R1` | SUS não inicia rotina aos 45; início aprovado = 50 anos. |
| CCR-PROP-005 | `APPROVED_R1_MODIFIED` | SUS inclui 75 anos completos; a partir de 76 não iniciar nova rodada de rotina. Follow-up diagnóstico já aberto persiste. |
| CCR-PROP-006 | `APPROVED_R1_MODIFIED` | O piloto não decide pela natureza qualitativa/quantitativa nem por valor bruto; usa classificação final validada do laboratório. |
| CCR-PROP-007 | `DOCUMENTARY_ONLY` | Preservar discussão de ponto de corte/unidades como fonte; não converter valores nem automatizar threshold bruto. |
| CCR-PROP-008 | `APPROVED_R1` | FIT positivo final exige colonoscopia diagnóstica; não há deadline universal automático no piloto. |
| CCR-PROP-009 | `APPROVED_R1_MODIFIED` | Colonoscopia posterior adequada/normal pode resolver o episódio FIT+; nova agenda SUS permanece bloqueada até fonte brasileira final suficiente. |
| CCR-PROP-010 | `REJECTED_REPLACED` | Remover checklist/triagem de sintomas. Substituir pelo gate 17B: profissional confirma contexto apropriado de screening; fora disso o Motor se abstém. |
| CCR-PROP-011 | `APPROVED_R1` | CCR prévio sai da rotina habitual; ClinicalReviewRequired até transferência; HandedOff apenas quando cuidado especializado foi efetivamente assumido. |
| CCR-PROP-012 | `APPROVED_R1` | Pólipo/adenoma prévio relevante ou achado não caracterizado → revisão de surveillance; sem intervalo automático no piloto. |
| CCR-PROP-013 | `APPROVED_R1` | DII conhecida sai da rotina average-risk; revisão, sem algoritmo de surveillance no piloto. |
| CCR-PROP-014 | `APPROVED_R1` | Lynch/FAP/outra predisposição conhecida ou suspeita → revisão/handoff especializado; sem protocolo genético automático. |
| CCR-PROP-015 | `APPROVED_R1_MODIFIED` | História familiar unknown não pode virar “não”, mas não bloqueia reconhecer indicação mínima por idade/policy; pode bloquear a estratégia definitiva. |
| CCR-PROP-016 | `APPROVED_R1_MODIFIED` | FIT negativo qualificador = final válido + data/precisão + nenhum FIT+ não resolvido; anchor = coleta/realização. |
| CCR-PROP-017 | `APPROVED_R1` | FIT+ abre follow-up e não vira Current por envelhecimento ou passagem do teto etário. |
| CCR-PROP-018 | `APPROVED_R1` | FIT− posterior não resolve FIT+ anterior; manter investigação até evento resolutivo suficiente. |
| CCR-PROP-019 | `APPROVED_R1` | Resultado pending = PendingResult; não ancora rotina, não dispara repetição automática e não apaga positivo anterior. |
| CCR-PROP-020 | `APPROVED_R1` | FIT inválido/inconclusivo não é negativo nem âncora; manter histórico válido anterior; repetir/regularizar segundo laboratório/serviço, sem prazo universal. |
| CCR-PROP-021 | `APPROVED_R1` | Colonoscopia incompleta/preparo inadequado/qualidade unknown não fecha FIT+ nem produz Current. |
| CCR-PROP-022 | `APPROVED_R1` | Lesão suspeita exige seguimento/revisão; câncer confirmado sai do screening. HandedOff apenas se transferência real. |
| CCR-PROP-023 | `APPROVED_R1` | Internacional/USPSTF 50–75: screening recomendado (Grade A); estratégia elegível escolhida pelo humano. |
| CCR-PROP-024 | `APPROVED_R1` | Internacional/USPSTF 45–49: screening recomendado (Grade B). |
| CCR-PROP-025 | `APPROVED_R1` | Internacional 76–85: decisão seletiva/compartilhada com saúde, histórico e preferência; sem calculadora automática de benefício. |
| CCR-PROP-026 | `APPROVED_R1` | Internacional >85: não iniciar/continuar screening habitual; isso não encerra follow-up diagnóstico aberto. |
| CCR-PROP-027 | `APPROVED_R1_MODIFIED` | Internacional com FIT escolhido: intervalo anual, anchor na coleta/realização após resultado final válido. |
| CCR-PROP-028 | `APPROVED_R1_MODIFIED` | Internacional: colonoscopia primária normal high-quality = 10 anos; não combinar rotineiramente com FIT; escolha de estratégia é humana. |
| CCR-PROP-029 | `APPROVED_R1` | Internacional: FIT+→colonoscopia posterior normal high-quality, sem exceções de maior risco → episódio resolvido e novo intervalo de 10 anos. |
| CCR-PROP-030 | `APPROVED_R1` | Colonoscopia anterior não resolve FIT+ posterior; novo FIT+ exige nova avaliação/follow-up conforme contexto. |
| CCR-PROP-031 | `APPROVED_R1_MODIFIED` | Internacional/ACG: 1 FDR com CRC/pólipo avançado <60 ou ≥2 FDR → colonoscopia aos 40 ou 10 anos antes do mais jovem, o que vier primeiro, e a cada 5 anos; automatizável com dados suficientes. |
| CCR-PROP-032 | `APPROVED_R1_MODIFIED` | Internacional/ACG: 1 FDR com CRC/pólipo avançado ≥60 → iniciar aos 40 ou 10 anos antes, depois seguir estratégia average-risk; não aplicar 5 anos universalmente. |
| CCR-PROP-033 | `APPROVED_R1_MODIFIED` | Internacional/ACG: 1 SDR isolado com CRC/pólipo avançado → seguir recomendações average-risk se não houver outros modificadores. |
| CCR-PROP-034 | `APPROVED_R1` | Brasil ampliado: colonoscopia primária negativa high-quality pode ser estratégia independente com intervalo de 10 anos. |
| CCR-PROP-035 | `APPROVED_R1_MODIFIED` | Brasil ampliado BA-A: FIT default bienal; não manter intervalo 1–2 anos em aberto no piloto. |
| CCR-PROP-036 | `APPROVED_R1` | Brasil ampliado 45–49: decisão compartilhada/revisão; não rotina automática. |
| CCR-PROP-037 | `DOCUMENTARY_ONLY` | ACS 2026 permanece alternativa comparativa; prazo preferencial pós-positivo não governa a policy Internacional selecionada nem SUS. |
| CCR-PROP-038 | `APPROVED_R1` | Pólipos que exigem surveillance → ClinicalReviewRequired; HandedOff só com cuidado assumido; não digitalizar algoritmo pós-polipectomia nesta rodada. |
| CCR-PROP-039 | `APPROVED_R1_MODIFIED` | Prazos USMSTF após preparo inadequado podem aparecer como decision support internacional; não criar deadline automático no piloto. |
| CCR-PROP-040 | `DOCUMENTARY_ONLY` | Radioterapia abdominal/pélvica é modificador da opção ACS; não é gate universal SUS/BA-A nem da policy Internacional USPSTF escolhida. |
| CCR-PROP-041 | `DOCUMENTARY_ONLY` | Uma amostra/sem preparo ou dieta são informações operacionais; seguir instrução do kit/laboratório, não regra clínica central. |
| CCR-PROP-042 | `APPROVED_R1_MODIFIED` | Para colonoscopia qualificar não é obrigatório upload de PDF; é necessária informação profissional suficiente sobre completude, preparo, resultado e pendências. Relato leigo isolado não fecha FIT+. |
| CCR-PROP-043 | `APPROVED_R1` | FIT indisponível/desconhecido preserva recomendação; esclarecer rota sem fallback clínico automático. |
| CCR-PROP-044 | `APPROVED_R1` | FIT+ com colonoscopia indisponível permanece InFollowUp; buscar regulação/serviço, sem repetir FIT como substituto. |
| CCR-PROP-045 | `PHASE6_TECHNICAL_GATE` | Provar que follow-up aberto suprime ação redundante de rotina sem modificar a Foundation; só reabrir arquitetura diante de contraexemplo real não representável. |

## Contagem pós-auditoria

| Classe | Quantidade |
|---|---:|
| `APPROVED_R1` | 24 |
| `APPROVED_R1_MODIFIED` | 15 |
| `REJECTED_REPLACED` | 1 |
| `DOCUMENTARY_ONLY` | 4 |
| `PHASE6_TECHNICAL_GATE` | 1 |
| **Total** | **45** |

## Gate de promoção

A Fase 6 pode usar como especificação apenas `APPROVED_R1` e `APPROVED_R1_MODIFIED`. Itens `DOCUMENTARY_ONLY` não viram regras. O item técnico 045 vira critério de aceitação. Nenhuma proposição pode ser marcada `reviewed_by_2` sem revisão clínica independente.