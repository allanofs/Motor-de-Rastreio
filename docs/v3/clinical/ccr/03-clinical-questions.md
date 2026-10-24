# 03 — Perguntas clínicas — estado pós-auditoria

**Consolidação:** 24/10/2026. A lista abaixo preserva as 32 perguntas originais, mas registra o estado após a primeira revisão humana.

| ID | Pergunta | Estado pós-auditoria |
|---|---|---|
| CQ-CCR-001 | Elegibilidade habitual por política | **RESOLVIDA**: policies separadas; 50–75 SUS, 45–75 USPSTF, BA-A específica |
| CQ-CCR-002 | População de risco não habitual | **RESOLVIDA no piloto**: reconhecer e revisar/handoff; família Internacional tem ACG |
| CQ-CCR-003 | Saída por sintomas | **SUBSTITUÍDA** por gate de escopo profissional 17B; Motor não faz triagem sintomática |
| CQ-CCR-004 | Método primário SUS | **RESOLVIDA**: FIT |
| CQ-CCR-005 | Idade inicial SUS | **RESOLVIDA**: 50 |
| CQ-CCR-006 | Teto SUS | **RESOLVIDA**: 75 inclusive; rotina cessa a partir de 76, sem apagar follow-up aberto |
| CQ-CCR-007 | Intervalo SUS | **RESOLVIDA**: 2 anos; âncora = coleta/realização com resultado final válido |
| CQ-CCR-008 | FIT tipo, amostra e preparo | **DOCUMENTAL/OPERACIONAL**; piloto usa laudo categórico final |
| CQ-CCR-009 | Ponto de corte/unidade | **FORA DA AUTOMAÇÃO**; não converter/reclassificar valor bruto |
| CQ-CCR-010 | FIT negativo qualificador | **RESOLVIDA**: final válido + data + sem FIT+ aberto |
| CQ-CCR-011 | FIT positivo: ação | **RESOLVIDA**: colonoscopia; follow-up persiste até resolução suficiente |
| CQ-CCR-012 | Prazo FIT+ | **RESOLVIDA**: sem deadline universal automático |
| CQ-CCR-013 | FIT inválido | **RESOLVIDA**: não qualifica; sem prazo universal; seguir laboratório/serviço |
| CQ-CCR-014 | FIT pendente | **RESOLVIDA**: PendingResult; não qualifica nem apaga follow-up |
| CQ-CCR-015 | Colonoscopia primária | **RESOLVIDA**: estratégia alternativa onde policy permite; escolha humana |
| CQ-CCR-016 | Qualidade da colonoscopia | **RESOLVIDA**: informação profissional suficiente sobre completude, preparo, resultado e pendências |
| CQ-CCR-017 | Colonoscopia inadequada pós-FIT+ | **RESOLVIDA**: não fecha episódio; prazos apenas decision support |
| CQ-CCR-018 | Normal após FIT+ | **PARCIAL**: resolução diagnóstica definida; Internacional=10 anos se high-quality/sem exceções; agenda SUS ainda bloqueada |
| CQ-CCR-019 | Colonoscopia anterior ao FIT+ | **RESOLVIDA**: não resolve evento posterior |
| CQ-CCR-020 | Pólipos/pós-polipectomia | **RESOLVIDA por escopo**: revisão/handoff; sem surveillance automática |
| CQ-CCR-021 | Câncer detectado/conhecido | **RESOLVIDA**: sai do screening; HandedOff só com transferência confirmada |
| CQ-CCR-022 | História familiar | **RESOLVIDA**: coleta em etapas; unknown não vira ausência; ACG na Internacional |
| CQ-CCR-023 | Síndromes hereditárias | **RESOLVIDA por escopo**: revisão/handoff, sem algoritmo genético |
| CQ-CCR-024 | DII | **RESOLVIDA por escopo**: fora da rotina habitual; revisão |
| CQ-CCR-025 | Idoso/benefício | **RESOLVIDA**: USPSTF 76–85 decisão seletiva; sem calculadora implícita de expectativa de vida |
| CQ-CCR-026 | Composição Brasil ampliado | **RESOLVIDA**: BA-A conservadora |
| CQ-CCR-027 | Política internacional | **RESOLVIDA**: USPSTF governante + complementos especializados |
| CQ-CCR-028 | Histórico conhecido/desconhecido | **RESOLVIDA**: never_performed global explícito; unknown não vira Due por presunção |
| CQ-CCR-029 | Cronologia/qualificadores | **RESOLVIDA**: ordem estrita; gatilhos positivos preservados; same-day/overlap abstêm |
| CQ-CCR-030 | Recursos locais | **RESOLVIDA conceitualmente**: disponibilidade altera rota, não recomendação |
| CQ-CCR-031 | Correspondência com Foundation | **GATE FASE 6**: provar representabilidade sem mudar Foundation |
| CQ-CCR-032 | Futuras modalidades | **ADIADA**: sangue/RNA/CTC e outros fora do piloto |

## Pergunta substituta de escopo

**CQ-CCR-SCOPE:** “O profissional está utilizando este módulo em contexto apropriado de rastreamento preventivo?”

- `sim` → avaliar rastreamento;
- `não` ou `incerto` → abstenção: situação fora do escopo do módulo;
- o Motor não coleta uma lista de sintomas e não decide urgência/diagnóstico.

## Critério para Fase 6

A Fase 6 não deve reabrir perguntas clínicas resolvidas. Só deve retornar à revisão humana se um caso real mostrar que a decisão aprovada não é representável com segurança ou se nova fonte oficial alterar materialmente a policy.