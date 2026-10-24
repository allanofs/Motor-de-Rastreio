# 05 — Policy SUS / Brasil oficial — consolidada

**Status:** `reviewed_by_1` em 24/10/2026. Especificação clínica documental, não regra executável.

## Governante e limites

A policy SUS usa fontes oficiais brasileiras dentro do próprio escopo. O núcleo tem suporte em B12 e é coerente com a cadeia B03/B05/comunicações oficiais. A versão final integral pós-CP ainda não foi confirmada; por isso alguns detalhes permanecem deliberadamente não automatizados.

## População e estratégia aprovadas

| Item | Decisão consolidada |
|---|---|
| contexto | uso profissional em rastreamento preventivo; sintomas/urgência não são triados pelo Motor |
| idade inicial | 50 anos |
| idade final | 75 anos **inclusive** |
| a partir de 76 | fora da nova rotina populacional; não apagar investigação já aberta |
| método nuclear | FIT |
| FIT negativo válido | nova rodada em 2 anos |
| anchor | data de coleta/realização; resultado final válido é condição para qualificar |
| FIT positivo | colonoscopia diagnóstica; follow-up permanece aberto até resolução suficiente |
| prazo FIT+ | sem deadline universal automático |
| FIT pending | não ancora rotina |
| FIT inválido/inconclusivo | não é negativo; não ancora; regularizar/repetir conforme laboratório/serviço sem prazo universal |

## Gate de escopo

O profissional deve confirmar que o módulo está sendo usado em contexto apropriado de screening. O Motor não coleta checklist sintomático nem decide urgência, diagnóstico ou necessidade de investigação de sintomas.

## Risco habitual e exclusões

Saem da rota habitual e vão para revisão/handoff conforme o caso:

- CRC prévio;
- pólipo/adenoma prévio com seguimento especializado conhecido ou achado atual não caracterizado;
- DII colônica conhecida;
- Lynch/FAP/outra predisposição hereditária conhecida ou suspeita.

História familiar positiva relevante **não recebe automaticamente o algoritmo ACG dentro da policy SUS**. Deve ser revisada. História familiar desconhecida não pode ser convertida em ausência, mas também não deve apagar uma indicação mínima já conhecida pela idade/policy; pode impedir a definição da estratégia final.

## Colonoscopia após FIT+

Para uma colonoscopia ser capaz de resolver automaticamente o episódio devem existir informações profissionais suficientes de que:

1. ocorreu certamente depois do FIT+;
2. foi completa;
3. o preparo foi adequado;
4. houve resultado final suficiente;
5. não há pólipo/lesão/AP pendente que exija outra rota.

Upload de PDF não é obrigatório; relato leigo isolado de “deu normal” não é suficiente para fechar automaticamente o episódio.

### Após colonoscopia normal adequada

- o **episódio diagnóstico FIT+ pode ser considerado resolvido**;
- a **próxima modalidade/intervalo SUS não é automatizada ainda**, porque o fluxo final pós-CP integral não foi autenticado;
- não importar 10 anos da policy Internacional nem da colonoscopia primária BA-A para o SUS.

## Colonoscopia inadequada

Colonoscopia incompleta, preparo inadequado ou qualidade desconhecida:

- não fecha FIT+;
- não produz `Current`;
- mantém `InFollowUp`/revisão;
- não recebe prazo automático universal no piloto.

## Histórico e estados

- `never_performed` só quando confirmado que nenhum rastreamento CCR relevante foi realizado;
- `unknown` ou `not_asked` nunca viram `Due` por presunção;
- histórico suficientemente conhecido para a decisão é suficiente; não exigir reconstrução vitalícia completa;
- FIT+ aberto tem prioridade sobre oferta rotineira e não pode ser silenciado por idade, FIT− posterior ou falta de recurso.

## Disponibilidade

Falta de FIT/colonoscopia local muda a rota operacional, não a indicação. Não existe fallback universal FIT indisponível→colonoscopia nem colonoscopia indisponível→novo FIT.

## Bloqueio remanescente

Apenas a agenda SUS **depois** de FIT+ resolvido por colonoscopia normal de alta qualidade e metadados dependentes da versão final brasileira permanecem bloqueados por fonte externa.
