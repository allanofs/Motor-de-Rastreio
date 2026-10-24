# 10 — Care Setting e operacionalização — consolidado

Status: reviewed_by_1 em 24/10/2026.

Princípio central: recomendação científica, disponibilidade local e rota assistencial são dimensões separadas. A falta de recurso não transforma “indicado” em “não indicado”.

| Recurso | Estado | Efeito operacional |
|---|---|---|
| FIT | available | ofertar conforme policy/fluxo |
| FIT | unavailable | identificar rota/programa; não trocar automaticamente por colonoscopia |
| FIT | unknown | clarificar disponibilidade |
| colonoscopia após FIT+ | available | realizar/encaminhar e manter follow-up até resolução |
| colonoscopia após FIT+ | unavailable | regulação/serviço referencial; não repetir FIT como substituto |
| colonoscopia após FIT+ | unknown | identificar responsável/rota; investigação continua aberta |
| AP necessário | unavailable/unknown | resolver barreira/resultado; não declarar episódio fechado |
| encaminhamento/regulação | solicitado/agendado | continua InFollowUp |
| cuidado assumido | atendimento/transferência confirmada | pode marcar HandedOff |

## HandedOff

HandedOff exige evidência de que outro profissional/serviço realmente assumiu o pathway. Não basta pedido, regulação, consulta agendada ou procedimento solicitado.

## Sem fallback clínico inventado

Não existe autorização neste pacote para:

- FIT indisponível → colonoscopia automática na policy SUS;
- colonoscopia indisponível após FIT+ → repetir FIT;
- barreira local → considerar paciente Current;
- município/localização → alterar elegibilidade clínica.

## Rollout e cadastro

Anúncios de implantação gradual e códigos administrativos não comprovam disponibilidade real em cada serviço. O piloto pode representar `available/unavailable/unknown`, mas não consulta geografia, não persiste cadastro e não determina competência profissional por CBO.

## Ideal versus operacional

O Motor deve mostrar a recomendação clínica ideal da policy e, quando o perfil do serviço estiver conhecido, a rota operacional autorizada. A alternativa operacional nunca deve ser apresentada como evidência clínica equivalente quando não for.