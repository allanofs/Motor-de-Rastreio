# 08 — Pathways longitudinais consolidados

Status: reviewed_by_1 em 24/10/2026. Documento humano, não executável.

## Entrada

O módulo só roda quando o profissional confirma contexto apropriado de rastreamento preventivo. Se isso não puder ser confirmado, o Motor se abstém. Não existe checklist de sintomas, triagem de urgência ou algoritmo diagnóstico.

## Tracks

- CRC_AVERAGE_RISK_SCREENING: status preventivo e próxima oferta.
- CRC_POSITIVE_STOOL_TEST_FOLLOWUP: investigação de FIT positivo.
- CRC_SPECIAL_RISK_REVIEW: condições fora do piloto automático.
- Surveillance pós-polipectomia não é implementada no piloto.

## FIT

FIT negativo final válido qualifica somente se houver data/precisão suficiente e nenhum FIT positivo não resolvido. A âncora é a coleta/realização. SUS e BA-A usam 2 anos; Internacional usa 1 ano.

FIT positivo abre follow-up por colonoscopia. Não é resolvido por FIT negativo posterior, passagem do tempo, idade, falta de recurso, agendamento ou colonoscopia anterior ao positivo.

FIT pending ou inválido não qualifica e não cria novo clock.

## Colonoscopia após FIT positivo

Para resolver automaticamente o episódio deve ser certamente posterior e haver informação profissional suficiente sobre completude, preparo adequado, resultado final e ausência de pendência relevante. Upload de PDF não é obrigatório; relato leigo isolado não basta.

Colonoscopia normal high-quality:
- resolve o episódio diagnóstico;
- Internacional: novo intervalo 10 anos se não houver exceções de maior risco;
- SUS: agenda futura permanece bloqueada por fonte final brasileira;
- BA-A: não inferir automaticamente regra de colonoscopia primária para o pós-FIT+.

Colonoscopia inadequada/incompleta/qualidade desconhecida não fecha episódio. Pólipo, lesão ou anatomopatológico pendente levam a revisão, sem surveillance automática.

## Múltiplos FIT positivos e cronologia

Cada positivo permanece aberto até existir evento posterior suficiente. O histórico não é apagado; o trace deve identificar gatilho e evento resolutivo. Mesmo dia ou datas parciais sobrepostas não provam ordem e levam a abstensão/revisão.

## Estratégias

FIT e colonoscopia são estratégias da mesma decisão de screening. Trocar estratégia não apaga cobertura anterior válida. Colonoscopia diagnóstica após FIT+ não é troca de estratégia de screening.

## Histórico

never_performed = nenhum screening CCR relevante realizado, explicitamente confirmado. unknown/not_asked nunca viram Due por presunção. Histórico suficientemente conhecido para a decisão basta; não é necessário reconstruir toda a vida do paciente.

## Gate Fase 6

A implementação deve provar que FIT+ aberto impede ação de screening redundante sem alterar a Foundation. Só reabrir arquitetura se houver contraexemplo real não representável.