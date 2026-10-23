# 04 — Registro de proposições candidatas

Corte 23/10/2026. **45 proposições documentais; todas awaiting_clinical_review.** IDs não são RuleIDs. Fonte → interpretação clínica → especificação proposta estão separados. Nenhum dado abaixo é JSON de RuleDefinition ou conteúdo executável.

AUTOMATE e demais rótulos são recomendações para revisão **futura**, nunca autorização nesta fase. Fonte preliminar/acesso parcial/bloqueio de política impede promoção. “Guarda do Work” identifica inferência de segurança e minimização, não recomendação formal da fonte. Grades não foram convertidas entre sistemas.

## CCR-PROP-001

| Campo | Conteúdo |
|---|---|
| Pergunta clínica | CQ-CCR-001 |
| Política candidata | SUS |
| População | Adulto assintomático, risco habitual |
| Situação | screening |
| Enunciado documental verificado (síntese) | B12 descreve FIT para assintomáticos 50–75; B05 registra manutenção do início 50 após CP. |
| Proposição clínica candidata — autoria do Work | Núcleo proposto 50–75/FIT; confirmar a abrangência normativa e a fronteira de 75 antes de parametrizar. |
| Interpretação clínica do Work | Aplicação limitada à população e contexto descritos; dados desconhecidos que mudem a rota impedem conclusão automática. |
| Especificação humana proposta | Manter proposta bloqueada até resolver questões e revisão clínica. |
| Stance proposto | recommend |
| Computability proposta | partially_computable |
| Por que esta computabilidade? | Há gates estruturáveis, mas julgamento, fonte, qualidade ou escolha de política impede conclusão integral. |
| Dados mínimos necessários | idade, sintomas, antecedentes e história familiar conhecidos; preferência |
| Pode permanecer desconhecido | sexo para decisões iguais em ambos; data de nascimento completa se idade suficiente; detalhes de exame/família não usados pela decisão. Dados críticos acima não podem ser convertidos em 'não'. |
| Ação proposta | Sem ação clínica automática; proposta para decisão humana. |
| Qualifying event | Não cria âncora temporal própria; quando houver exame usar critérios específicos CCR-PROP-016/P0 28/P0 29. |
| Schedule / evento âncora | Não estabelecido nesta proposição; não inventar intervalo ou clock. |
| O que suprime | Somente a rotina/estratégia incompatível no mesmo contexto; não apagar investigação diagnóstica necessária. Ver exceções no pathway. |
| O que não resolve | Ausência de relato, recurso indisponível, resultado pendente/inválido e registro cronologicamente anterior não comprovam resolução de FIT+. |
| Source IDs | [B12](https://www.gov.br/saude/pt-br/composicao/saes/agora-tem-especialistas/publicacoes/protocolo-de-acesso-as-ofertas-de-cuidados-integrados-em-oncologia.pdf/@@download/file); [B05](https://www.gov.br/conitec/pt-br/midias/reuniao_conitec/2026/ata-da-152o-reuniao-da-conitec_pcdt_site/@@display-file/file); [B06](https://www.conass.org.br/conass-informa-n-158-2026-publicada-portaria-saes-ms-n-4-642-que-inclui-procedimento-e-altera-atributos-de-procedimento-da-tabela-de-procedimentos-medicamentos-orteses-proteses-e-m/) |
| Locator | B12 pp.17–18; B05 PDF p.9; B06 Anexo I |
| Grade original / sistema | B12 not formally graded; B06 administrativo, sem grade |
| Status das fontes | B12: FINAL_TECHNICAL; operational scope; B05: FINAL_DELIBERATION_RECORD; B06: IMPLEMENTATION_ONLY; substituição relatada, ver B07 |
| Confiança na interpretação | médio |
| Questão aberta | OQ-CCR-001, 002, 003 |
| Automation candidate | DO_NOT_IMPLEMENT_YET |
| Scope candidato | V3 CCR PILOT como candidato documental |
| Review status | awaiting_clinical_review |

## CCR-PROP-002

| Campo | Conteúdo |
|---|---|
| Pergunta clínica | CQ-CCR-004 |
| Política candidata | SUS |
| População | Risco padrão assintomático elegível |
| Situação | screening primário |
| Enunciado documental verificado (síntese) | B12 identifica FIT como referência; B03 rec.2 compara métodos fecais. |
| Proposição clínica candidata — autoria do Work | FIT é o método primário proposto; não deduzir equivalência com colonoscopia primária por disponibilidade. |
| Interpretação clínica do Work | Aplicação limitada à população e contexto descritos; dados desconhecidos que mudem a rota impedem conclusão automática. |
| Especificação humana proposta | Manter proposta bloqueada até resolver questões e revisão clínica. |
| Stance proposto | recommend |
| Computability proposta | computable |
| Por que esta computabilidade? | Predicado/intervalo pode ser determinado com dados explícitos; isso não valida fonte, política ou implementação. |
| Dados mínimos necessários | elegibilidade, método identificado |
| Pode permanecer desconhecido | sexo para decisões iguais em ambos; data de nascimento completa se idade suficiente; detalhes de exame/família não usados pela decisão. Dados críticos acima não podem ser convertidos em 'não'. |
| Ação proposta | Sem ação clínica automática; proposta para decisão humana. |
| Qualifying event | Não cria âncora temporal própria; quando houver exame usar critérios específicos CCR-PROP-016/P0 28/P0 29. |
| Schedule / evento âncora | Não estabelecido nesta proposição; não inventar intervalo ou clock. |
| O que suprime | Somente a rotina/estratégia incompatível no mesmo contexto; não apagar investigação diagnóstica necessária. Ver exceções no pathway. |
| O que não resolve | Ausência de relato, recurso indisponível, resultado pendente/inválido e registro cronologicamente anterior não comprovam resolução de FIT+. |
| Source IDs | [B12](https://www.gov.br/saude/pt-br/composicao/saes/agora-tem-especialistas/publicacoes/protocolo-de-acesso-as-ofertas-de-cuidados-integrados-em-oncologia.pdf/@@download/file); [B03](https://www.gov.br/conitec/pt-br/midias/consultas/relatorios/2026/relatorio-preliminar-diretrizes-brasileiras-do-rastreamento-do-cancer-de-colon-e-reto-cp-20/@@display-file/file) |
| Locator | B12 p.17; B03 rec.2, impressa 7/PDF 13 |
| Grade original / sistema | B03 GRADE forte/certeza alta; B12 not formally graded |
| Status das fontes | B12: FINAL_TECHNICAL; operational scope; B03: PRELIMINARY |
| Confiança na interpretação | médio, condicionado à pendência descrita |
| Questão aberta | OQ-CCR-001 |
| Automation candidate | DO_NOT_IMPLEMENT_YET |
| Scope candidato | V3 CCR PILOT como candidato documental |
| Review status | awaiting_clinical_review |

## CCR-PROP-003

| Campo | Conteúdo |
|---|---|
| Pergunta clínica | CQ-CCR-007 |
| Política candidata | SUS |
| População | Risco habitual, FIT final negativo válido, sem episódio positivo aberto |
| Situação | nova rodada |
| Enunciado documental verificado (síntese) | B12 informa periodicidade bienal; B03 rec.7 e comunicação mencionam nova rodada. |
| Proposição clínica candidata — autoria do Work | Periodicidade bienal proposta; não aplicar ao seguimento de FIT positivo. |
| Interpretação clínica do Work | Aplicação limitada à população e contexto descritos; dados desconhecidos que mudem a rota impedem conclusão automática. |
| Especificação humana proposta | Manter proposta bloqueada até resolver questões e revisão clínica. |
| Stance proposto | recommend |
| Computability proposta | computable |
| Por que esta computabilidade? | Predicado/intervalo pode ser determinado com dados explícitos; isso não valida fonte, política ou implementação. |
| Dados mínimos necessários | data/precisão, resultado final e validade, história relevante |
| Pode permanecer desconhecido | sexo para decisões iguais em ambos; data de nascimento completa se idade suficiente; detalhes de exame/família não usados pela decisão. Dados críticos acima não podem ser convertidos em 'não'. |
| Ação proposta | Sem ação clínica automática; proposta para decisão humana. |
| Qualifying event | FIT final negativo, amostra aceitável, data, sem alerta posterior; condições de validade são guarda de engenharia proposta |
| Schedule / evento âncora | 2 anos a partir do exame negativo; marco coleta versus laudo requer OQ-CCR-004 |
| O que suprime | Somente a rotina/estratégia incompatível no mesmo contexto; não apagar investigação diagnóstica necessária. Ver exceções no pathway. |
| O que não resolve | Ausência de relato, recurso indisponível, resultado pendente/inválido e registro cronologicamente anterior não comprovam resolução de FIT+. |
| Source IDs | [B12](https://www.gov.br/saude/pt-br/composicao/saes/agora-tem-especialistas/publicacoes/protocolo-de-acesso-as-ofertas-de-cuidados-integrados-em-oncologia.pdf/@@download/file); [B03](https://www.gov.br/conitec/pt-br/midias/consultas/relatorios/2026/relatorio-preliminar-diretrizes-brasileiras-do-rastreamento-do-cancer-de-colon-e-reto-cp-20/@@display-file/file) |
| Locator | B12 p.17; B03 rec.7, impressa 15/PDF 21; implementação comunicação impressa 18/PDF 24 |
| Grade original / sistema | B03 GRADE condicional/certeza baixa; B12 not formally graded |
| Status das fontes | B12: FINAL_TECHNICAL; operational scope; B03: PRELIMINARY |
| Confiança na interpretação | médio, condicionado à pendência descrita |
| Questão aberta | OQ-CCR-001, 004 |
| Automation candidate | DO_NOT_IMPLEMENT_YET |
| Scope candidato | V3 CCR PILOT como candidato documental |
| Review status | awaiting_clinical_review |

## CCR-PROP-004

| Campo | Conteúdo |
|---|---|
| Pergunta clínica | CQ-CCR-005 |
| Política candidata | SUS |
| População | Assintomático risco habitual abaixo versus a partir de 50 |
| Situação | início |
| Enunciado documental verificado (síntese) | B05 registra que a proposta de antecipar 45 não foi acatada. |
| Proposição clínica candidata — autoria do Work | Não antecipar automaticamente para 45 na política SUS; propor início 50. |
| Interpretação clínica do Work | Aplicação limitada à população e contexto descritos; dados desconhecidos que mudem a rota impedem conclusão automática. |
| Especificação humana proposta | Manter proposta bloqueada até resolver questões e revisão clínica. |
| Stance proposto | recommend |
| Computability proposta | computable |
| Por que esta computabilidade? | Predicado/intervalo pode ser determinado com dados explícitos; isso não valida fonte, política ou implementação. |
| Dados mínimos necessários | elegibilidade, risco e contexto explicitados; resultado/data quando alteram a decisão |
| Pode permanecer desconhecido | sexo para decisões iguais em ambos; data de nascimento completa se idade suficiente; detalhes de exame/família não usados pela decisão. Dados críticos acima não podem ser convertidos em 'não'. |
| Ação proposta | Sem ação clínica automática; proposta para decisão humana. |
| Qualifying event | Não cria âncora temporal própria; quando houver exame usar critérios específicos CCR-PROP-016/P0 28/P0 29. |
| Schedule / evento âncora | idade como gate; não é agenda diagnóstica |
| O que suprime | Somente a rotina/estratégia incompatível no mesmo contexto; não apagar investigação diagnóstica necessária. Ver exceções no pathway. |
| O que não resolve | Ausência de relato, recurso indisponível, resultado pendente/inválido e registro cronologicamente anterior não comprovam resolução de FIT+. |
| Source IDs | [B05](https://www.gov.br/conitec/pt-br/midias/reuniao_conitec/2026/ata-da-152o-reuniao-da-conitec_pcdt_site/@@display-file/file); [B03](https://www.gov.br/conitec/pt-br/midias/consultas/relatorios/2026/relatorio-preliminar-diretrizes-brasileiras-do-rastreamento-do-cancer-de-colon-e-reto-cp-20/@@display-file/file); [B12](https://www.gov.br/saude/pt-br/composicao/saes/agora-tem-especialistas/publicacoes/protocolo-de-acesso-as-ofertas-de-cuidados-integrados-em-oncologia.pdf/@@download/file) |
| Locator | B05 PDF p.9; B03 rec.5, impressas 12–13/PDF 18–19; B12 p.17 |
| Grade original / sistema | B03 GRADE condicional/certeza moderada; ata/protocolo sem grade formal |
| Status das fontes | B05: FINAL_DELIBERATION_RECORD; B03: PRELIMINARY; B12: FINAL_TECHNICAL; operational scope |
| Confiança na interpretação | médio, condicionado à pendência descrita |
| Questão aberta | OQ-CCR-001 |
| Automation candidate | DO_NOT_IMPLEMENT_YET |
| Scope candidato | V3 CCR PILOT como candidato documental |
| Review status | awaiting_clinical_review |

## CCR-PROP-005

| Campo | Conteúdo |
|---|---|
| Pergunta clínica | CQ-CCR-006 |
| Política candidata | SUS |
| População | Pessoa aos 75 ou acima, com ou sem screening anterior |
| Situação | término/continuação |
| Enunciado documental verificado (síntese) | B12 e tabela descrevem 50–75; B03 rec.6 discute término. |
| Proposição clínica candidata — autoria do Work | 75 é o teto descrito; não confundir encerramento da rotina com abandono de FIT+ já aberto. Inclusão de todo o ano 75 precisa revisão. |
| Interpretação clínica do Work | Aplicação limitada à população e contexto descritos; dados desconhecidos que mudem a rota impedem conclusão automática. |
| Especificação humana proposta | Manter proposta bloqueada até resolver questões e revisão clínica. |
| Stance proposto | shared_decision |
| Computability proposta | clinician_judgment_required |
| Por que esta computabilidade? | Exige avaliação clínica ou resolução documental que não cabe em predicado automático. |
| Dados mínimos necessários | idade, saúde/benefício, histórico e FIT+ pendente |
| Pode permanecer desconhecido | sexo para decisões iguais em ambos; data de nascimento completa se idade suficiente; detalhes de exame/família não usados pela decisão. Dados críticos acima não podem ser convertidos em 'não'. |
| Ação proposta | Sem ação clínica automática; proposta para decisão humana. |
| Qualifying event | Não cria âncora temporal própria; quando houver exame usar critérios específicos CCR-PROP-016/P0 28/P0 29. |
| Schedule / evento âncora | Não estabelecido nesta proposição; não inventar intervalo ou clock. |
| O que suprime | Somente a rotina/estratégia incompatível no mesmo contexto; não apagar investigação diagnóstica necessária. Ver exceções no pathway. |
| O que não resolve | Ausência de relato, recurso indisponível, resultado pendente/inválido e registro cronologicamente anterior não comprovam resolução de FIT+. |
| Source IDs | [B03](https://www.gov.br/conitec/pt-br/midias/consultas/relatorios/2026/relatorio-preliminar-diretrizes-brasileiras-do-rastreamento-do-cancer-de-colon-e-reto-cp-20/@@display-file/file); [B06](https://www.conass.org.br/conass-informa-n-158-2026-publicada-portaria-saes-ms-n-4-642-que-inclui-procedimento-e-altera-atributos-de-procedimento-da-tabela-de-procedimentos-medicamentos-orteses-proteses-e-m/); [B12](https://www.gov.br/saude/pt-br/composicao/saes/agora-tem-especialistas/publicacoes/protocolo-de-acesso-as-ofertas-de-cuidados-integrados-em-oncologia.pdf/@@download/file) |
| Locator | B03 rec.6 impressas 14–15/PDF 20–21; B06 Anexo I idade máxima 75; B12 p.17 |
| Grade original / sistema | B03 GRADE condicional/certeza moderada; demais not formally graded |
| Status das fontes | B03: PRELIMINARY; B06: IMPLEMENTATION_ONLY; substituição relatada, ver B07; B12: FINAL_TECHNICAL; operational scope |
| Confiança na interpretação | médio, condicionado à pendência descrita |
| Questão aberta | OQ-CCR-001, 003 |
| Automation candidate | DO_NOT_IMPLEMENT_YET |
| Scope candidato | V3 CCR PILOT como candidato documental |
| Review status | awaiting_clinical_review |

## CCR-PROP-006

| Campo | Conteúdo |
|---|---|
| Pergunta clínica | CQ-CCR-008 |
| Política candidata | SUS |
| População | Assintomático elegível que realiza FIT |
| Situação | operação do teste |
| Enunciado documental verificado (síntese) | B03 rec.3 admite FIT quantitativo ou qualitativo. |
| Proposição clínica candidata — autoria do Work | Relatório preliminar admite FIT qualitativo ou quantitativo; isso não autoriza intercambiar limiares nem inferir validade do kit. |
| Interpretação clínica do Work | Aplicação limitada à população e contexto descritos; dados desconhecidos que mudem a rota impedem conclusão automática. |
| Especificação humana proposta | Manter proposta bloqueada até resolver questões e revisão clínica. |
| Stance proposto | recommend |
| Computability proposta | partially_computable |
| Por que esta computabilidade? | Há gates estruturáveis, mas julgamento, fonte, qualidade ou escolha de política impede conclusão integral. |
| Dados mínimos necessários | tipo de teste e interpretação validada pelo laboratório |
| Pode permanecer desconhecido | sexo para decisões iguais em ambos; data de nascimento completa se idade suficiente; detalhes de exame/família não usados pela decisão. Dados críticos acima não podem ser convertidos em 'não'. |
| Ação proposta | Sem ação clínica automática; proposta para decisão humana. |
| Qualifying event | Não cria âncora temporal própria; quando houver exame usar critérios específicos CCR-PROP-016/P0 28/P0 29. |
| Schedule / evento âncora | Não estabelecido nesta proposição; não inventar intervalo ou clock. |
| O que suprime | Somente a rotina/estratégia incompatível no mesmo contexto; não apagar investigação diagnóstica necessária. Ver exceções no pathway. |
| O que não resolve | Ausência de relato, recurso indisponível, resultado pendente/inválido e registro cronologicamente anterior não comprovam resolução de FIT+. |
| Source IDs | [B03](https://www.gov.br/conitec/pt-br/midias/consultas/relatorios/2026/relatorio-preliminar-diretrizes-brasileiras-do-rastreamento-do-cancer-de-colon-e-reto-cp-20/@@display-file/file) |
| Locator | rec.3, impressa 9/PDF 15 |
| Grade original / sistema | Condicional baseada em viabilidade; certeza não explicitada na sentença |
| Status das fontes | B03: PRELIMINARY |
| Confiança na interpretação | médio, condicionado à pendência descrita |
| Questão aberta | OQ-CCR-001, 005 |
| Automation candidate | DO_NOT_IMPLEMENT_YET |
| Scope candidato | V3 CCR PILOT como candidato documental |
| Review status | awaiting_clinical_review |

## CCR-PROP-007

| Campo | Conteúdo |
|---|---|
| Pergunta clínica | CQ-CCR-009 |
| Política candidata | SUS |
| População | Resultado quantitativo/qualitativo de FIT |
| Situação | laboratório |
| Enunciado documental verificado (síntese) | B03 rec.4 usa 50 ng/m L; discussão/Quadro F não têm a mesma graduação do enunciado. |
| Proposição clínica candidata — autoria do Work | Registrar proposta 50 ng/m L conforme fonte, sem conversão universal a µg/g ou reclassificação automática do laudo. |
| Interpretação clínica do Work | Não resolver discordância interna de GRADE nem unidade por inferência. |
| Especificação humana proposta | Manter proposta bloqueada até resolver questões e revisão clínica. |
| Stance proposto | no_formal_recommendation |
| Computability proposta | clinician_judgment_required |
| Por que esta computabilidade? | Exige avaliação clínica ou resolução documental que não cabe em predicado automático. |
| Dados mínimos necessários | dispositivo, unidade e corte validados; preferir laudo final categórico |
| Pode permanecer desconhecido | sexo para decisões iguais em ambos; data de nascimento completa se idade suficiente; detalhes de exame/família não usados pela decisão. Dados críticos acima não podem ser convertidos em 'não'. |
| Ação proposta | Sem ação clínica automática; proposta para decisão humana. |
| Qualifying event | Não cria âncora temporal própria; quando houver exame usar critérios específicos CCR-PROP-016/P0 28/P0 29. |
| Schedule / evento âncora | Não estabelecido nesta proposição; não inventar intervalo ou clock. |
| O que suprime | Somente a rotina/estratégia incompatível no mesmo contexto; não apagar investigação diagnóstica necessária. Ver exceções no pathway. |
| O que não resolve | Ausência de relato, recurso indisponível, resultado pendente/inválido e registro cronologicamente anterior não comprovam resolução de FIT+. |
| Source IDs | [B03](https://www.gov.br/conitec/pt-br/midias/consultas/relatorios/2026/relatorio-preliminar-diretrizes-brasileiras-do-rastreamento-do-cancer-de-colon-e-reto-cp-20/@@display-file/file); [B05](https://www.gov.br/conitec/pt-br/midias/reuniao_conitec/2026/ata-da-152o-reuniao-da-conitec_pcdt_site/@@display-file/file) |
| Locator | B03 rec.4 impressa 10/PDF 16; discussão impressa 12/PDF 18 e Quadro F PDF 51; B05 PDF p.9 |
| Grade original / sistema | Sentença rec.4: forte/alta; discussão e Quadro F: moderada; divergência preservada |
| Status das fontes | B03: PRELIMINARY; B05: FINAL_DELIBERATION_RECORD |
| Confiança na interpretação | baixo |
| Questão aberta | OQ-CCR-005, 006 |
| Automation candidate | DO_NOT_IMPLEMENT_YET |
| Scope candidato | V3 CCR PILOT como candidato documental |
| Review status | awaiting_clinical_review |

## CCR-PROP-008

| Campo | Conteúdo |
|---|---|
| Pergunta clínica | CQ-CCR-011 |
| Política candidata | SUS |
| População | FIT de screening positivo |
| Situação | investigação diagnóstica |
| Enunciado documental verificado (síntese) | B12 inclui FIT positivo nos critérios de encaminhamento e descreve colonoscopia diagnóstica. |
| Proposição clínica candidata — autoria do Work | Encaminhar para colonoscopia diagnóstica. A investigação tem prioridade conceitual sobre a próxima rodada preventiva. |
| Interpretação clínica do Work | Aplicação limitada à população e contexto descritos; dados desconhecidos que mudem a rota impedem conclusão automática. |
| Especificação humana proposta | Aplicar somente após escolha da política, dados críticos conhecidos e revisão; usar o estado correspondente no pathway, sem automatização nesta fase. |
| Stance proposto | recommend |
| Computability proposta | computable |
| Por que esta computabilidade? | Predicado/intervalo pode ser determinado com dados explícitos; isso não valida fonte, política ou implementação. |
| Dados mínimos necessários | FIT positivo final e identificação/data; status do seguimento |
| Pode permanecer desconhecido | sexo para decisões iguais em ambos; data de nascimento completa se idade suficiente; detalhes de exame/família não usados pela decisão. Dados críticos acima não podem ser convertidos em 'não'. |
| Ação proposta | Ver pathway e policy; não emitir ação fora desta população. |
| Qualifying event | Não cria âncora temporal própria; quando houver exame usar critérios específicos CCR-PROP-016/P0 28/P0 29. |
| Schedule / evento âncora | Sem prazo universal aprovado; B05 cita até 30 dias como referência de indicador em desenvolvimento |
| O que suprime | Somente a rotina/estratégia incompatível no mesmo contexto; não apagar investigação diagnóstica necessária. Ver exceções no pathway. |
| O que não resolve | Ausência de relato, recurso indisponível, resultado pendente/inválido e registro cronologicamente anterior não comprovam resolução de FIT+. |
| Source IDs | [B12](https://www.gov.br/saude/pt-br/composicao/saes/agora-tem-especialistas/publicacoes/protocolo-de-acesso-as-ofertas-de-cuidados-integrados-em-oncologia.pdf/@@download/file); [B03](https://www.gov.br/conitec/pt-br/midias/consultas/relatorios/2026/relatorio-preliminar-diretrizes-brasileiras-do-rastreamento-do-cancer-de-colon-e-reto-cp-20/@@display-file/file); [B05](https://www.gov.br/conitec/pt-br/midias/reuniao_conitec/2026/ata-da-152o-reuniao-da-conitec_pcdt_site/@@display-file/file) |
| Locator | B12 pp.17–18; B03 rec.8 impressa 17/PDF 23; B05 PDF p.9 |
| Grade original / sistema | B03 forte baseada em aceitabilidade/viabilidade; sem certeza formal na sentença |
| Status das fontes | B12: FINAL_TECHNICAL; operational scope; B03: PRELIMINARY; B05: FINAL_DELIBERATION_RECORD |
| Confiança na interpretação | alto para o limite descrito; não aprovação clínica |
| Questão aberta | OQ-CCR-007 |
| Automation candidate | AUTOMATE_WITH_MISSING_DATA_GUARD |
| Scope candidato | V3 CCR PILOT como candidato documental |
| Review status | awaiting_clinical_review |

## CCR-PROP-009

| Campo | Conteúdo |
|---|---|
| Pergunta clínica | CQ-CCR-018 |
| Política candidata | SUS |
| População | FIT+ seguido de colonoscopia adequada sem achados relevantes |
| Situação | resolução e novo ciclo |
| Enunciado documental verificado (síntese) | B05 informa ajuste do fluxo pós-colonoscopia normal; B03 preliminar traz modalidades futuras não inequívocas. |
| Proposição clínica candidata — autoria do Work | Não fixar próxima modalidade/intervalo ainda: o pós-CP alterou esse fluxo e o texto integral final não foi localizado. |
| Interpretação clínica do Work | O fluxo final pode ter mudado; não é seguro transformar 10 anos da minuta em política vigente. |
| Especificação humana proposta | Manter proposta bloqueada até resolver questões e revisão clínica. |
| Stance proposto | no_formal_recommendation |
| Computability proposta | clinician_judgment_required |
| Por que esta computabilidade? | Exige avaliação clínica ou resolução documental que não cabe em predicado automático. |
| Dados mínimos necessários | datas, indicação, qualidade, completude, laudo, achados e resolução |
| Pode permanecer desconhecido | sexo para decisões iguais em ambos; data de nascimento completa se idade suficiente; detalhes de exame/família não usados pela decisão. Dados críticos acima não podem ser convertidos em 'não'. |
| Ação proposta | Sem ação clínica automática; proposta para decisão humana. |
| Qualifying event | colonoscopia posterior completa/adequada e resultado suficiente; novo clock bloqueado |
| Schedule / evento âncora | Aberta: colonoscopia 10 anos versus retorno FIT do programa, sem promoção do preliminar |
| O que suprime | Somente a rotina/estratégia incompatível no mesmo contexto; não apagar investigação diagnóstica necessária. Ver exceções no pathway. |
| O que não resolve | Ausência de relato, recurso indisponível, resultado pendente/inválido e registro cronologicamente anterior não comprovam resolução de FIT+. |
| Source IDs | [B03](https://www.gov.br/conitec/pt-br/midias/consultas/relatorios/2026/relatorio-preliminar-diretrizes-brasileiras-do-rastreamento-do-cancer-de-colon-e-reto-cp-20/@@display-file/file); [B05](https://www.gov.br/conitec/pt-br/midias/reuniao_conitec/2026/ata-da-152o-reuniao-da-conitec_pcdt_site/@@display-file/file) |
| Locator | B03 Figura 1 impressa 5/PDF 10 e rec.8 impressa 17/PDF 23; B05 PDF p.8, ajuste do fluxo |
| Grade original / sistema | Discussão sem grade independente; não herdar grade da rec.8 para intervalo |
| Status das fontes | B03: PRELIMINARY; B05: FINAL_DELIBERATION_RECORD |
| Confiança na interpretação | baixo |
| Questão aberta | OQ-CCR-008 |
| Automation candidate | DO_NOT_IMPLEMENT_YET |
| Scope candidato | V3 CCR PILOT como candidato documental |
| Review status | awaiting_clinical_review |

## CCR-PROP-010

| Campo | Conteúdo |
|---|---|
| Pergunta clínica | CQ-CCR-003 |
| Política candidata | Todas, com fundamento brasileiro próprio para SUS |
| População | Pessoa com sinal/sintoma suspeito |
| Situação | saída do screening |
| Enunciado documental verificado (síntese) | B08§3.1 distingue diagnóstico de sintomáticos de rastreamento de assintomáticos. |
| Proposição clínica candidata — autoria do Work | Sangue visível/fezes escuras, anemia ferropriva sem causa, alteração persistente, perda inexplicada, massa ou dor persistente exigem avaliação diagnóstica, não rotina assintomática. |
| Interpretação clínica do Work | Aplicação limitada à população e contexto descritos; dados desconhecidos que mudem a rota impedem conclusão automática. |
| Especificação humana proposta | Retirar apenas a rota assintomática e recomendar investigação; urgência específica depende de avaliação |
| Stance proposto | recommend |
| Computability proposta | partially_computable |
| Por que esta computabilidade? | Há gates estruturáveis, mas julgamento, fonte, qualidade ou escolha de política impede conclusão integral. |
| Dados mínimos necessários | sintoma presente e contexto clínico; anemia documentada quando pertinente |
| Pode permanecer desconhecido | sexo para decisões iguais em ambos; data de nascimento completa se idade suficiente; detalhes de exame/família não usados pela decisão. Dados críticos acima não podem ser convertidos em 'não'. |
| Ação proposta | Retirar apenas a rota assintomática e recomendar investigação; urgência específica depende de avaliação |
| Qualifying event | Não cria âncora temporal própria; quando houver exame usar critérios específicos CCR-PROP-016/P0 28/P0 29. |
| Schedule / evento âncora | Não aguardar idade/intervalo de screening |
| O que suprime | Somente a rotina/estratégia incompatível no mesmo contexto; não apagar investigação diagnóstica necessária. Ver exceções no pathway. |
| O que não resolve | Ausência de relato, recurso indisponível, resultado pendente/inválido e registro cronologicamente anterior não comprovam resolução de FIT+. |
| Source IDs | [B08](https://www.gov.br/conitec/pt-br/midias/protocolos/adenocarcinoma-de-colon-e-de-reto-pcdt/@@display-file/file); [B12](https://www.gov.br/saude/pt-br/composicao/saes/agora-tem-especialistas/publicacoes/protocolo-de-acesso-as-ofertas-de-cuidados-integrados-em-oncologia.pdf/@@download/file) |
| Locator | B08 §3.1 p.3; B12 critérios de encaminhamento p.18 |
| Grade original / sistema | not formally graded no trecho; não inventar grau |
| Status das fontes | B08: FINAL_ACTIVE_WITHIN_SCOPE; B12: FINAL_TECHNICAL; operational scope |
| Confiança na interpretação | alto para o limite descrito; não aprovação clínica |
| Questão aberta | OQ-CCR-009 |
| Automation candidate | HAND_OFF |
| Scope candidato | V3 CCR PILOT como candidato documental |
| Review status | awaiting_clinical_review |

## CCR-PROP-011

| Campo | Conteúdo |
|---|---|
| Pergunta clínica | CQ-CCR-021 |
| Política candidata | Todas, por fontes próprias |
| População | CCR prévio confirmado |
| Situação | fora do risco habitual |
| Enunciado documental verificado (síntese) | I01 exclui CCR prévio da população habitual; B08 trata doença estabelecida. |
| Proposição clínica candidata — autoria do Work | Não aplicar rotina habitual; cuidado oncológico/seguimento específico. HandedOff pressupõe transferência documentada, não só recomendada. |
| Interpretação clínica do Work | Aplicação limitada à população e contexto descritos; dados desconhecidos que mudem a rota impedem conclusão automática. |
| Especificação humana proposta | ClinicalReviewRequired até transferência; HandedOff só quando cuidado responsável for conhecido |
| Stance proposto | recommend |
| Computability proposta | computable |
| Por que esta computabilidade? | Predicado/intervalo pode ser determinado com dados explícitos; isso não valida fonte, política ou implementação. |
| Dados mínimos necessários | diagnóstico confirmado; vínculo/encaminhamento efetivo |
| Pode permanecer desconhecido | sexo para decisões iguais em ambos; data de nascimento completa se idade suficiente; detalhes de exame/família não usados pela decisão. Dados críticos acima não podem ser convertidos em 'não'. |
| Ação proposta | ClinicalReviewRequired até transferência; HandedOff só quando cuidado responsável for conhecido |
| Qualifying event | Não cria âncora temporal própria; quando houver exame usar critérios específicos CCR-PROP-016/P0 28/P0 29. |
| Schedule / evento âncora | Não estabelecido nesta proposição; não inventar intervalo ou clock. |
| O que suprime | Somente a rotina/estratégia incompatível no mesmo contexto; não apagar investigação diagnóstica necessária. Ver exceções no pathway. |
| O que não resolve | Ausência de relato, recurso indisponível, resultado pendente/inválido e registro cronologicamente anterior não comprovam resolução de FIT+. |
| Source IDs | [B08](https://www.gov.br/conitec/pt-br/midias/protocolos/adenocarcinoma-de-colon-e-de-reto-pcdt/@@display-file/file); [I01](https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening) |
| Locator | B08 art.1 e introdução/seguimento; I01 Patient population |
| Grade original / sistema | not formally graded para a exclusão operacional |
| Status das fontes | B08: FINAL_ACTIVE_WITHIN_SCOPE; I01: FINAL_CURRENT_LOCATED |
| Confiança na interpretação | alto para o limite descrito; não aprovação clínica |
| Questão aberta | OQ-CCR-010 |
| Automation candidate | HAND_OFF |
| Scope candidato | V3 CCR PILOT como candidato documental |
| Review status | awaiting_clinical_review |

## CCR-PROP-012

| Campo | Conteúdo |
|---|---|
| Pergunta clínica | CQ-CCR-020 |
| Política candidata | Todas com população explicitada |
| População | Adenoma/pólipo relevante prévio ou achado atual não caracterizado |
| Situação | saída da rotina |
| Enunciado documental verificado (síntese) | B03 exclui adenomas prévios; I05 estratifica achados para seguimento. |
| Proposição clínica candidata — autoria do Work | Não inventar intervalo com dado histológico ausente; classificar para revisão de surveillance. Nem todo pólipo é neoplasia de alto risco. |
| Interpretação clínica do Work | Aplicação limitada à população e contexto descritos; dados desconhecidos que mudem a rota impedem conclusão automática. |
| Especificação humana proposta | ClinicalReviewRequired; módulo futuro determina surveillance e intervalo |
| Stance proposto | recommend |
| Computability proposta | partially_computable |
| Por que esta computabilidade? | Há gates estruturáveis, mas julgamento, fonte, qualidade ou escolha de política impede conclusão integral. |
| Dados mínimos necessários | pólipo sim/não, laudo disponível, necessidade de seguimento |
| Pode permanecer desconhecido | sexo para decisões iguais em ambos; data de nascimento completa se idade suficiente; detalhes de exame/família não usados pela decisão. Dados críticos acima não podem ser convertidos em 'não'. |
| Ação proposta | ClinicalReviewRequired; módulo futuro determina surveillance e intervalo |
| Qualifying event | Não cria âncora temporal própria; quando houver exame usar critérios específicos CCR-PROP-016/P0 28/P0 29. |
| Schedule / evento âncora | Não estabelecido nesta proposição; não inventar intervalo ou clock. |
| O que suprime | Somente a rotina/estratégia incompatível no mesmo contexto; não apagar investigação diagnóstica necessária. Ver exceções no pathway. |
| O que não resolve | Ausência de relato, recurso indisponível, resultado pendente/inválido e registro cronologicamente anterior não comprovam resolução de FIT+. |
| Source IDs | [B03](https://www.gov.br/conitec/pt-br/midias/consultas/relatorios/2026/relatorio-preliminar-diretrizes-brasileiras-do-rastreamento-do-cancer-de-colon-e-reto-cp-20/@@display-file/file); [I05](https://www.asge.org/docs/default-source/guidelines/recommendations-for-follow-up-after-colonoscopy-and-polypectomy-a-consensus-update-by-the-us-multi-society-task-force-on-colorectal-cancer-2020-march-gie.pdf) |
| Locator | B03 pressupostos e rec.8 impressa 17; I05 Tables 3–5, conceitos |
| Grade original / sistema | Não há grade única; intervalo específico não extraído para o piloto |
| Status das fontes | B03: PRELIMINARY; I05: FINAL; PRIMARY_ACCESS_PARTIAL |
| Confiança na interpretação | alto para o limite descrito; não aprovação clínica |
| Questão aberta | OQ-CCR-011 |
| Automation candidate | HAND_OFF |
| Scope candidato | V3 CCR PILOT como candidato documental |
| Review status | awaiting_clinical_review |

## CCR-PROP-013

| Campo | Conteúdo |
|---|---|
| Pergunta clínica | CQ-CCR-024 |
| Política candidata | Todas, conforme definição de população |
| População | DII colônica conhecida ou extensão desconhecida |
| Situação | fora da rotina habitual |
| Enunciado documental verificado (síntese) | I01 exclui DII da população habitual; B08 identifica maior risco. |
| Proposição clínica candidata — autoria do Work | Propor revisão específica; não transformar toda suspeita inespecífica de DII em diagnóstico ou aplicar intervalo de risco habitual. |
| Interpretação clínica do Work | Aplicação limitada à população e contexto descritos; dados desconhecidos que mudem a rota impedem conclusão automática. |
| Especificação humana proposta | Aplicar somente após escolha da política, dados críticos conhecidos e revisão; usar o estado correspondente no pathway, sem automatização nesta fase. |
| Stance proposto | recommend |
| Computability proposta | partially_computable |
| Por que esta computabilidade? | Há gates estruturáveis, mas julgamento, fonte, qualidade ou escolha de política impede conclusão integral. |
| Dados mínimos necessários | diagnóstico e acometimento colônico se conhecidos |
| Pode permanecer desconhecido | sexo para decisões iguais em ambos; data de nascimento completa se idade suficiente; detalhes de exame/família não usados pela decisão. Dados críticos acima não podem ser convertidos em 'não'. |
| Ação proposta | Ver pathway e policy; não emitir ação fora desta população. |
| Qualifying event | Não cria âncora temporal própria; quando houver exame usar critérios específicos CCR-PROP-016/P0 28/P0 29. |
| Schedule / evento âncora | Não estabelecido nesta proposição; não inventar intervalo ou clock. |
| O que suprime | Somente a rotina/estratégia incompatível no mesmo contexto; não apagar investigação diagnóstica necessária. Ver exceções no pathway. |
| O que não resolve | Ausência de relato, recurso indisponível, resultado pendente/inválido e registro cronologicamente anterior não comprovam resolução de FIT+. |
| Source IDs | [B08](https://www.gov.br/conitec/pt-br/midias/protocolos/adenocarcinoma-de-colon-e-de-reto-pcdt/@@display-file/file); [I01](https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening) |
| Locator | B08 introdução p.2; I01 Patient population |
| Grade original / sistema | not formally graded para exclusão |
| Status das fontes | B08: FINAL_ACTIVE_WITHIN_SCOPE; I01: FINAL_CURRENT_LOCATED |
| Confiança na interpretação | alto para o limite descrito; não aprovação clínica |
| Questão aberta | OQ-CCR-012 |
| Automation candidate | HAND_OFF |
| Scope candidato | V3 CCR PILOT como candidato documental |
| Review status | awaiting_clinical_review |

## CCR-PROP-014

| Campo | Conteúdo |
|---|---|
| Pergunta clínica | CQ-CCR-023 |
| Política candidata | Todas |
| População | Lynch/FAP/outra predisposição conhecida ou suspeita |
| Situação | alto risco |
| Enunciado documental verificado (síntese) | I01 e B08 identificam predisposição hereditária como contexto distinto. |
| Proposição clínica candidata — autoria do Work | Sair da rotina habitual e solicitar avaliação especializada; não programar protocolos genéticos no piloto. |
| Interpretação clínica do Work | Aplicação limitada à população e contexto descritos; dados desconhecidos que mudem a rota impedem conclusão automática. |
| Especificação humana proposta | Aplicar somente após escolha da política, dados críticos conhecidos e revisão; usar o estado correspondente no pathway, sem automatização nesta fase. |
| Stance proposto | recommend |
| Computability proposta | partially_computable |
| Por que esta computabilidade? | Há gates estruturáveis, mas julgamento, fonte, qualidade ou escolha de política impede conclusão integral. |
| Dados mínimos necessários | síndrome conhecida/suspeita; informação familiar pertinente |
| Pode permanecer desconhecido | sexo para decisões iguais em ambos; data de nascimento completa se idade suficiente; detalhes de exame/família não usados pela decisão. Dados críticos acima não podem ser convertidos em 'não'. |
| Ação proposta | Ver pathway e policy; não emitir ação fora desta população. |
| Qualifying event | Não cria âncora temporal própria; quando houver exame usar critérios específicos CCR-PROP-016/P0 28/P0 29. |
| Schedule / evento âncora | Não estabelecido nesta proposição; não inventar intervalo ou clock. |
| O que suprime | Somente a rotina/estratégia incompatível no mesmo contexto; não apagar investigação diagnóstica necessária. Ver exceções no pathway. |
| O que não resolve | Ausência de relato, recurso indisponível, resultado pendente/inválido e registro cronologicamente anterior não comprovam resolução de FIT+. |
| Source IDs | [B08](https://www.gov.br/conitec/pt-br/midias/protocolos/adenocarcinoma-de-colon-e-de-reto-pcdt/@@display-file/file); [I01](https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening) |
| Locator | B08 introdução p.2; I01 Patient population |
| Grade original / sistema | not formally graded para o gate |
| Status das fontes | B08: FINAL_ACTIVE_WITHIN_SCOPE; I01: FINAL_CURRENT_LOCATED |
| Confiança na interpretação | alto para o limite descrito; não aprovação clínica |
| Questão aberta | OQ-CCR-012 |
| Automation candidate | HAND_OFF |
| Scope candidato | V3 CCR PILOT como candidato documental |
| Review status | awaiting_clinical_review |

## CCR-PROP-015

| Campo | Conteúdo |
|---|---|
| Pergunta clínica | CQ-CCR-022 |
| Política candidata | Todas, com diferenças entre fontes |
| População | História familiar desconhecida ou incompleta |
| Situação | classificação de risco |
| Enunciado documental verificado (síntese) | I03 e S01 descrevem história familiar como variável que pode mudar manejo. |
| Proposição clínica candidata — autoria do Work | Não converter desconhecido/não perguntado em ausência. Perguntar triagem familiar e revisar quando dado crítico não puder ser esclarecido. |
| Interpretação clínica do Work | Aplicação limitada à população e contexto descritos; dados desconhecidos que mudem a rota impedem conclusão automática. |
| Especificação humana proposta | Indeterminate/ClinicalReviewRequired sem declarar risco habitual |
| Stance proposto | no_formal_recommendation |
| Computability proposta | partially_computable |
| Por que esta computabilidade? | Há gates estruturáveis, mas julgamento, fonte, qualidade ou escolha de política impede conclusão integral. |
| Dados mínimos necessários | HF conhecida; grau, número, tipo e idade somente se resposta positiva |
| Pode permanecer desconhecido | sexo para decisões iguais em ambos; data de nascimento completa se idade suficiente; detalhes de exame/família não usados pela decisão. Dados críticos acima não podem ser convertidos em 'não'. |
| Ação proposta | Indeterminate/ClinicalReviewRequired sem declarar risco habitual |
| Qualifying event | Não cria âncora temporal própria; quando houver exame usar critérios específicos CCR-PROP-016/P0 28/P0 29. |
| Schedule / evento âncora | Não estabelecido nesta proposição; não inventar intervalo ou clock. |
| O que suprime | Somente a rotina/estratégia incompatível no mesmo contexto; não apagar investigação diagnóstica necessária. Ver exceções no pathway. |
| O que não resolve | Ausência de relato, recurso indisponível, resultado pendente/inválido e registro cronologicamente anterior não comprovam resolução de FIT+. |
| Source IDs | [I03](https://medicine.uams.edu/familymedicine/wp-content/uploads/sites/7/2021/07/ACG_Clinical_Guidelines__Colorectal_Cancer.14.pdf); [S01](https://sboc.org.br/wp-content/uploads/2026/04/Diretrizes-SBOC-2026-C%E2%94%9C%E2%94%82lon-doen%E2%94%9Coa-localizada-v6-VERS%E2%94%9CaO-FINAL.pdf) |
| Locator | I03 Table 1 rec.9–12; S01 Faixa etária p.6 |
| Grade original / sistema | I03 grades específicas por subgrupo; guarda de unknown é interpretação do Work sem grade |
| Status das fontes | I03: FINAL_CURRENT_LOCATED; S01: FINAL_SOCIETY |
| Confiança na interpretação | alto para o limite descrito; não aprovação clínica |
| Questão aberta | OQ-CCR-012 |
| Automation candidate | AUTOMATE_WITH_MISSING_DATA_GUARD |
| Scope candidato | V3 CCR PILOT como candidato documental |
| Review status | awaiting_clinical_review |

## CCR-PROP-016

| Campo | Conteúdo |
|---|---|
| Pergunta clínica | CQ-CCR-010 |
| Política candidata | SUS e Internacional, com intervalos próprios |
| População | FIT final negativo e aceitável |
| Situação | qualifying event proposto |
| Enunciado documental verificado (síntese) | B03/B12/I01 descrevem repetição de screening e seguimento dos resultados anormais. |
| Proposição clínica candidata — autoria do Work | Só propor âncora de rotina com resultado final válido, data e ausência de evento positivo posterior não resolvido; isso não demonstra inexistência de câncer. |
| Interpretação clínica do Work | Aplicação limitada à população e contexto descritos; dados desconhecidos que mudem a rota impedem conclusão automática. |
| Especificação humana proposta | Aplicar somente após escolha da política, dados críticos conhecidos e revisão; usar o estado correspondente no pathway, sem automatização nesta fase. |
| Stance proposto | recommend |
| Computability proposta | computable |
| Por que esta computabilidade? | Predicado/intervalo pode ser determinado com dados explícitos; isso não valida fonte, política ou implementação. |
| Dados mínimos necessários | resultado, validade, data/precisão, eventos posteriores e elegibilidade |
| Pode permanecer desconhecido | sexo para decisões iguais em ambos; data de nascimento completa se idade suficiente; detalhes de exame/família não usados pela decisão. Dados críticos acima não podem ser convertidos em 'não'. |
| Ação proposta | Ver pathway e policy; não emitir ação fora desta população. |
| Qualifying event | FIT− final/qualidade adequada/data; sequências abertas prevalecem |
| Schedule / evento âncora | SUS 2 anos propostos; I01 anual; respeitar faixa/benefício no vencimento |
| O que suprime | Somente a rotina/estratégia incompatível no mesmo contexto; não apagar investigação diagnóstica necessária. Ver exceções no pathway. |
| O que não resolve | Ausência de relato, recurso indisponível, resultado pendente/inválido e registro cronologicamente anterior não comprovam resolução de FIT+. |
| Source IDs | [B03](https://www.gov.br/conitec/pt-br/midias/consultas/relatorios/2026/relatorio-preliminar-diretrizes-brasileiras-do-rastreamento-do-cancer-de-colon-e-reto-cp-20/@@display-file/file); [B12](https://www.gov.br/saude/pt-br/composicao/saes/agora-tem-especialistas/publicacoes/protocolo-de-acesso-as-ofertas-de-cuidados-integrados-em-oncologia.pdf/@@download/file); [I01](https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening) |
| Locator | B03 implementação/rec.7; B12 p.17; I01 Screening Intervals |
| Grade original / sistema | Grades das recomendações-base; guardas final/validade/data não são recomendação clínica graduada autônoma |
| Status das fontes | B03: PRELIMINARY; B12: FINAL_TECHNICAL; operational scope; I01: FINAL_CURRENT_LOCATED |
| Confiança na interpretação | alto para o limite descrito; não aprovação clínica |
| Questão aberta | OQ-CCR-004, 013 |
| Automation candidate | AUTOMATE_WITH_MISSING_DATA_GUARD |
| Scope candidato | V3 CCR PILOT como candidato documental |
| Review status | awaiting_clinical_review |

## CCR-PROP-017

| Campo | Conteúdo |
|---|---|
| Pergunta clínica | CQ-CCR-011 |
| Política candidata | Todas, cada uma com sua fonte |
| População | FIT+ sem investigação resolutiva posterior |
| Situação | follow-up longitudinal |
| Enunciado documental verificado (síntese) | B12/I04 indicam investigação endoscópica do FIT positivo. |
| Proposição clínica candidata — autoria do Work | O positivo abre investigação; não marca paciente Current preventivo. Antiguidade ou passar do teto etário não comprovam resolução. |
| Interpretação clínica do Work | Aplicação limitada à população e contexto descritos; dados desconhecidos que mudem a rota impedem conclusão automática. |
| Especificação humana proposta | InFollowUp com ação colonoscopia/encaminhamento conforme policy |
| Stance proposto | recommend |
| Computability proposta | computable |
| Por que esta computabilidade? | Predicado/intervalo pode ser determinado com dados explícitos; isso não valida fonte, política ou implementação. |
| Dados mínimos necessários | registro positivo e seguimento, cronologia suficiente |
| Pode permanecer desconhecido | sexo para decisões iguais em ambos; data de nascimento completa se idade suficiente; detalhes de exame/família não usados pela decisão. Dados críticos acima não podem ser convertidos em 'não'. |
| Ação proposta | InFollowUp com ação colonoscopia/encaminhamento conforme policy |
| Qualifying event | Nenhum FIT+ reinicia rotina; evento positivo é trigger |
| Schedule / evento âncora | Não estabelecido nesta proposição; não inventar intervalo ou clock. |
| O que suprime | Somente a rotina/estratégia incompatível no mesmo contexto; não apagar investigação diagnóstica necessária. Ver exceções no pathway. |
| O que não resolve | Ausência de relato, recurso indisponível, resultado pendente/inválido e registro cronologicamente anterior não comprovam resolução de FIT+. |
| Source IDs | [B12](https://www.gov.br/saude/pt-br/composicao/saes/agora-tem-especialistas/publicacoes/protocolo-de-acesso-as-ofertas-de-cuidados-integrados-em-oncologia.pdf/@@download/file); [I04](https://www.asge.org/docs/default-source/education/practice_guidelines/fecal_immunochemical_testing.pdf) |
| Locator | B12 OCI CCR pp.17–18; I04 Recommendation/summary FIT positivo |
| Grade original / sistema | B12 not formally graded; I04 forte/moderada |
| Status das fontes | B12: FINAL_TECHNICAL; operational scope; I04: FINAL; PRIMARY_ACCESS_PARTIAL |
| Confiança na interpretação | alto para o limite descrito; não aprovação clínica |
| Questão aberta | OQ-CCR-007, 014 |
| Automation candidate | AUTOMATE_WITH_MISSING_DATA_GUARD |
| Scope candidato | V3 CCR PILOT como candidato documental |
| Review status | awaiting_clinical_review |

## CCR-PROP-018

| Campo | Conteúdo |
|---|---|
| Pergunta clínica | CQ-CCR-011 |
| Política candidata | Internacional; complemento brasileiro proposto separado |
| População | FIT+ seguido de FIT− sem colonoscopia resolutiva |
| Situação | follow-up |
| Enunciado documental verificado (síntese) | I04 recomenda colonoscopia após FIT positivo, não repetir FIT como avaliação subsequente. |
| Proposição clínica candidata — autoria do Work | FIT− repetido não substitui a colonoscopia indicada pelo positivo. |
| Interpretação clínica do Work | Aplicação limitada à população e contexto descritos; dados desconhecidos que mudem a rota impedem conclusão automática. |
| Especificação humana proposta | Manter investigação aberta; no SUS registrar adoção complementar explícita B12, não transferir grade I04 |
| Stance proposto | recommend |
| Computability proposta | computable |
| Por que esta computabilidade? | Predicado/intervalo pode ser determinado com dados explícitos; isso não valida fonte, política ou implementação. |
| Dados mínimos necessários | ambos os eventos; existência de resolução posterior |
| Pode permanecer desconhecido | sexo para decisões iguais em ambos; data de nascimento completa se idade suficiente; detalhes de exame/família não usados pela decisão. Dados críticos acima não podem ser convertidos em 'não'. |
| Ação proposta | Manter investigação aberta; no SUS registrar adoção complementar explícita B12, não transferir grade I04 |
| Qualifying event | Não cria âncora temporal própria; quando houver exame usar critérios específicos CCR-PROP-016/P0 28/P0 29. |
| Schedule / evento âncora | Não estabelecido nesta proposição; não inventar intervalo ou clock. |
| O que suprime | Somente a rotina/estratégia incompatível no mesmo contexto; não apagar investigação diagnóstica necessária. Ver exceções no pathway. |
| O que não resolve | Ausência de relato, recurso indisponível, resultado pendente/inválido e registro cronologicamente anterior não comprovam resolução de FIT+. |
| Source IDs | [I04](https://www.asge.org/docs/default-source/education/practice_guidelines/fecal_immunochemical_testing.pdf) |
| Locator | Recommendation/summary: positive test, colonoscopy not repeat FIT |
| Grade original / sistema | Forte/moderada para colonoscopia; regra de persistência é interpretação longitudinal |
| Status das fontes | I04: FINAL; PRIMARY_ACCESS_PARTIAL |
| Confiança na interpretação | alto para o limite descrito; não aprovação clínica |
| Questão aberta | OQ-CCR-014 |
| Automation candidate | AUTOMATE_WITH_MISSING_DATA_GUARD |
| Scope candidato | V3 CCR PILOT como candidato documental |
| Review status | awaiting_clinical_review |

## CCR-PROP-019

| Campo | Conteúdo |
|---|---|
| Pergunta clínica | CQ-CCR-014 |
| Política candidata | Todas — guarda de engenharia proposta |
| População | Exame realizado com resultado pendente |
| Situação | pendência |
| Enunciado documental verificado (síntese) | Fontes descrevem sequência exame/resultado/encaminhamento; não normatizam estado computacional PendingResult. |
| Proposição clínica candidata — autoria do Work | Representar PendingResult sem considerar proteção temporal; não gerar repetição automática apenas pela pendência. |
| Interpretação clínica do Work | Aplicação limitada à população e contexto descritos; dados desconhecidos que mudem a rota impedem conclusão automática. |
| Especificação humana proposta | PendingResult; se positivo anterior aberto, preservar follow-up |
| Stance proposto | no_formal_recommendation |
| Computability proposta | computable |
| Por que esta computabilidade? | Predicado/intervalo pode ser determinado com dados explícitos; isso não valida fonte, política ou implementação. |
| Dados mínimos necessários | coleta realizada, resultado pending, positivo prévio aberto sim/não |
| Pode permanecer desconhecido | sexo para decisões iguais em ambos; data de nascimento completa se idade suficiente; detalhes de exame/família não usados pela decisão. Dados críticos acima não podem ser convertidos em 'não'. |
| Ação proposta | PendingResult; se positivo anterior aberto, preservar follow-up |
| Qualifying event | Pendente não qualifica rotina |
| Schedule / evento âncora | Não estabelecido nesta proposição; não inventar intervalo ou clock. |
| O que suprime | Somente a rotina/estratégia incompatível no mesmo contexto; não apagar investigação diagnóstica necessária. Ver exceções no pathway. |
| O que não resolve | Ausência de relato, recurso indisponível, resultado pendente/inválido e registro cronologicamente anterior não comprovam resolução de FIT+. |
| Source IDs | [B12](https://www.gov.br/saude/pt-br/composicao/saes/agora-tem-especialistas/publicacoes/protocolo-de-acesso-as-ofertas-de-cuidados-integrados-em-oncologia.pdf/@@download/file); [I04](https://www.asge.org/docs/default-source/education/practice_guidelines/fecal_immunochemical_testing.pdf) |
| Locator | Processo screening→resultado→investigação; fontes não fornecem algoritmo de PendingResult |
| Grade original / sistema | not formally graded; mapeamento técnico do Work |
| Status das fontes | B12: FINAL_TECHNICAL; operational scope; I04: FINAL; PRIMARY_ACCESS_PARTIAL |
| Confiança na interpretação | alto para o limite descrito; não aprovação clínica |
| Questão aberta | OQ-CCR-015 |
| Automation candidate | AUTOMATE_WITH_MISSING_DATA_GUARD |
| Scope candidato | V3 CCR PILOT como candidato documental |
| Review status | awaiting_clinical_review |

## CCR-PROP-020

| Campo | Conteúdo |
|---|---|
| Pergunta clínica | CQ-CCR-013 |
| Política candidata | Todas — silêncio da fonte SUS |
| População | FIT inválido/inconclusivo |
| Situação | resultado não interpretável |
| Enunciado documental verificado (síntese) | Não foi identificado manejo completo do FIT inválido nos trechos brasileiros consultados; isso é silêncio da busca delimitada. |
| Proposição clínica candidata — autoria do Work | Não é negativo nem âncora; buscar instrução laboratorial de nova coleta. Não há prazo de repetição SUS confirmado nesta busca. |
| Interpretação clínica do Work | Aplicação limitada à população e contexto descritos; dados desconhecidos que mudem a rota impedem conclusão automática. |
| Especificação humana proposta | Aplicar somente após escolha da política, dados críticos conhecidos e revisão; usar o estado correspondente no pathway, sem automatização nesta fase. |
| Stance proposto | no_formal_recommendation |
| Computability proposta | clinician_judgment_required |
| Por que esta computabilidade? | Exige avaliação clínica ou resolução documental que não cabe em predicado automático. |
| Dados mínimos necessários | status invalid, laudo e política laboratorial |
| Pode permanecer desconhecido | sexo para decisões iguais em ambos; data de nascimento completa se idade suficiente; detalhes de exame/família não usados pela decisão. Dados críticos acima não podem ser convertidos em 'não'. |
| Ação proposta | Ver pathway e policy; não emitir ação fora desta população. |
| Qualifying event | Inválido não qualifica; não apaga exame anterior válido nem episódio positivo |
| Schedule / evento âncora | Prazo não estabelecido; não inventar 7/30 dias |
| O que suprime | Somente a rotina/estratégia incompatível no mesmo contexto; não apagar investigação diagnóstica necessária. Ver exceções no pathway. |
| O que não resolve | Ausência de relato, recurso indisponível, resultado pendente/inválido e registro cronologicamente anterior não comprovam resolução de FIT+. |
| Source IDs | [B03](https://www.gov.br/conitec/pt-br/midias/consultas/relatorios/2026/relatorio-preliminar-diretrizes-brasileiras-do-rastreamento-do-cancer-de-colon-e-reto-cp-20/@@display-file/file); [B12](https://www.gov.br/saude/pt-br/composicao/saes/agora-tem-especialistas/publicacoes/protocolo-de-acesso-as-ofertas-de-cuidados-integrados-em-oncologia.pdf/@@download/file) |
| Locator | Recomendações e fluxo não especificam manejo completo de inválido nos trechos examinados |
| Grade original / sistema | Sem recomendação formal localizada; não chamar ausência de recomendação contra |
| Status das fontes | B03: PRELIMINARY; B12: FINAL_TECHNICAL; operational scope |
| Confiança na interpretação | alto para o limite descrito; não aprovação clínica |
| Questão aberta | OQ-CCR-015 |
| Automation candidate | DECISION_SUPPORT_ONLY |
| Scope candidato | V3 CCR PILOT como candidato documental |
| Review status | awaiting_clinical_review |

## CCR-PROP-021

| Campo | Conteúdo |
|---|---|
| Pergunta clínica | CQ-CCR-017 |
| Política candidata | Todas; intervalo complementar só Internacional |
| População | Colonoscopia incompleta/preparo inadequado após FIT+ |
| Situação | investigação incompleta |
| Enunciado documental verificado (síntese) | I05 pressupõe exame de qualidade; I06 recomenda nova avaliação quando preparo é inadequado. |
| Proposição clínica candidata — autoria do Work | Exame sem condições de excluir lesão não fecha automaticamente o episódio. Falta de qualidade conhecida também impede encerramento automático. |
| Interpretação clínica do Work | Aplicação limitada à população e contexto descritos; dados desconhecidos que mudem a rota impedem conclusão automática. |
| Especificação humana proposta | InFollowUp com reavaliação; não transformar em Current |
| Stance proposto | recommend |
| Computability proposta | partially_computable |
| Por que esta computabilidade? | Há gates estruturáveis, mas julgamento, fonte, qualidade ou escolha de política impede conclusão integral. |
| Dados mínimos necessários | ceco/completude, preparo, laudo, cronologia |
| Pode permanecer desconhecido | sexo para decisões iguais em ambos; data de nascimento completa se idade suficiente; detalhes de exame/família não usados pela decisão. Dados críticos acima não podem ser convertidos em 'não'. |
| Ação proposta | InFollowUp com reavaliação; não transformar em Current |
| Qualifying event | Não qualifica; manter episódio aberto |
| Schedule / evento âncora | Não estabelecido nesta proposição; não inventar intervalo ou clock. |
| O que suprime | Somente a rotina/estratégia incompatível no mesmo contexto; não apagar investigação diagnóstica necessária. Ver exceções no pathway. |
| O que não resolve | Ausência de relato, recurso indisponível, resultado pendente/inválido e registro cronologicamente anterior não comprovam resolução de FIT+. |
| Source IDs | [I05](https://www.asge.org/docs/default-source/guidelines/recommendations-for-follow-up-after-colonoscopy-and-polypectomy-a-consensus-update-by-the-us-multi-society-task-force-on-colorectal-cancer-2020-march-gie.pdf); [I06](https://www.asge.org/home/resources/publications/guidelines/optimizing-bowel-preparation-quality-for-colonoscopy--consensus-recommendations-by-the-us-multi-society-task-force-on-colorectal-cancer); [B03](https://www.gov.br/conitec/pt-br/midias/consultas/relatorios/2026/relatorio-preliminar-diretrizes-brasileiras-do-rastreamento-do-cancer-de-colon-e-reto-cp-20/@@display-file/file) |
| Locator | I05 Colonoscopy quality assumptions; I06 Management of inadequate preparation; B03 rec.8 |
| Grade original / sistema | I06 forte/moderada para repetição; guarda de resolução é proposta |
| Status das fontes | I05: FINAL; PRIMARY_ACCESS_PARTIAL; I06: FINAL; PRIMARY_ACCESS_PARTIAL; B03: PRELIMINARY |
| Confiança na interpretação | alto para o limite descrito; não aprovação clínica |
| Questão aberta | OQ-CCR-016 |
| Automation candidate | DECISION_SUPPORT_ONLY |
| Scope candidato | V3 CCR PILOT como candidato documental |
| Review status | awaiting_clinical_review |

## CCR-PROP-022

| Campo | Conteúdo |
|---|---|
| Pergunta clínica | CQ-CCR-021 |
| Política candidata | Todas |
| População | Lesão suspeita versus câncer confirmado |
| Situação | saída para diagnóstico/tratamento |
| Enunciado documental verificado (síntese) | B03 prevê confirmação anatomopatológica de suspeita; B08 trata CCR confirmado. |
| Proposição clínica candidata — autoria do Work | Suspeita requer confirmação e investigação; câncer confirmado sai do screening. Não chamar suspeita de diagnóstico nem handoff de concluído sem evidência. |
| Interpretação clínica do Work | Aplicação limitada à população e contexto descritos; dados desconhecidos que mudem a rota impedem conclusão automática. |
| Especificação humana proposta | InFollowUp/ClinicalReviewRequired na suspeita; HandedOff documentado no confirmado |
| Stance proposto | recommend |
| Computability proposta | partially_computable |
| Por que esta computabilidade? | Há gates estruturáveis, mas julgamento, fonte, qualidade ou escolha de política impede conclusão integral. |
| Dados mínimos necessários | suspeita/confirmado, anatomopatológico quando necessário, responsável pelo cuidado |
| Pode permanecer desconhecido | sexo para decisões iguais em ambos; data de nascimento completa se idade suficiente; detalhes de exame/família não usados pela decisão. Dados críticos acima não podem ser convertidos em 'não'. |
| Ação proposta | InFollowUp/ClinicalReviewRequired na suspeita; HandedOff documentado no confirmado |
| Qualifying event | Não cria âncora temporal própria; quando houver exame usar critérios específicos CCR-PROP-016/P0 28/P0 29. |
| Schedule / evento âncora | Não estabelecido nesta proposição; não inventar intervalo ou clock. |
| O que suprime | Somente a rotina/estratégia incompatível no mesmo contexto; não apagar investigação diagnóstica necessária. Ver exceções no pathway. |
| O que não resolve | Ausência de relato, recurso indisponível, resultado pendente/inválido e registro cronologicamente anterior não comprovam resolução de FIT+. |
| Source IDs | [B03](https://www.gov.br/conitec/pt-br/midias/consultas/relatorios/2026/relatorio-preliminar-diretrizes-brasileiras-do-rastreamento-do-cancer-de-colon-e-reto-cp-20/@@display-file/file); [B08](https://www.gov.br/conitec/pt-br/midias/protocolos/adenocarcinoma-de-colon-e-de-reto-pcdt/@@display-file/file) |
| Locator | B03 rec.8 impressa 17/PDF 23; B08 art.1 e §3 |
| Grade original / sistema | not formally graded para o mapeamento |
| Status das fontes | B03: PRELIMINARY; B08: FINAL_ACTIVE_WITHIN_SCOPE |
| Confiança na interpretação | alto para o limite descrito; não aprovação clínica |
| Questão aberta | OQ-CCR-010 |
| Automation candidate | HAND_OFF |
| Scope candidato | V3 CCR PILOT como candidato documental |
| Review status | awaiting_clinical_review |

## CCR-PROP-023

| Campo | Conteúdo |
|---|---|
| Pergunta clínica | CQ-CCR-001 |
| Política candidata | Internacional opção A/USPSTF |
| População | Assintomático de risco habitual 50–75 |
| Situação | screening |
| Enunciado documental verificado (síntese) | I01 linha 50–75 contém recomendação A. |
| Proposição clínica candidata — autoria do Work | Oferecer rastreamento na população definida pela USPSTF. |
| Interpretação clínica do Work | Aplicação limitada à população e contexto descritos; dados desconhecidos que mudem a rota impedem conclusão automática. |
| Especificação humana proposta | Aplicar somente após escolha da política, dados críticos conhecidos e revisão; usar o estado correspondente no pathway, sem automatização nesta fase. |
| Stance proposto | recommend |
| Computability proposta | computable |
| Por que esta computabilidade? | Predicado/intervalo pode ser determinado com dados explícitos; isso não valida fonte, política ou implementação. |
| Dados mínimos necessários | idade, risco/sintomas/histórico críticos; preferência |
| Pode permanecer desconhecido | sexo para decisões iguais em ambos; data de nascimento completa se idade suficiente; detalhes de exame/família não usados pela decisão. Dados críticos acima não podem ser convertidos em 'não'. |
| Ação proposta | Ver pathway e policy; não emitir ação fora desta população. |
| Qualifying event | Não cria âncora temporal própria; quando houver exame usar critérios específicos CCR-PROP-016/P0 28/P0 29. |
| Schedule / evento âncora | Modalidade selecionada governa intervalo |
| O que suprime | Somente a rotina/estratégia incompatível no mesmo contexto; não apagar investigação diagnóstica necessária. Ver exceções no pathway. |
| O que não resolve | Ausência de relato, recurso indisponível, resultado pendente/inválido e registro cronologicamente anterior não comprovam resolução de FIT+. |
| Source IDs | [I01](https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening) |
| Locator | Recommendation Summary, linha 50–75 |
| Grade original / sistema | USPSTF A |
| Status das fontes | I01: FINAL_CURRENT_LOCATED |
| Confiança na interpretação | alto para o limite descrito; não aprovação clínica |
| Questão aberta | OQ-CCR-017 |
| Automation candidate | AUTOMATE_WITH_MISSING_DATA_GUARD |
| Scope candidato | V3 CCR PILOT como candidato documental |
| Review status | awaiting_clinical_review |

## CCR-PROP-024

| Campo | Conteúdo |
|---|---|
| Pergunta clínica | CQ-CCR-001 |
| Política candidata | Internacional opção A/USPSTF |
| População | Assintomático de risco habitual 45–49 |
| Situação | screening |
| Enunciado documental verificado (síntese) | I01 linha 45–49 contém recomendação B. |
| Proposição clínica candidata — autoria do Work | Oferecer rastreamento; manter a distinção de grade em relação a 50–75. |
| Interpretação clínica do Work | Aplicação limitada à população e contexto descritos; dados desconhecidos que mudem a rota impedem conclusão automática. |
| Especificação humana proposta | Aplicar somente após escolha da política, dados críticos conhecidos e revisão; usar o estado correspondente no pathway, sem automatização nesta fase. |
| Stance proposto | recommend |
| Computability proposta | computable |
| Por que esta computabilidade? | Predicado/intervalo pode ser determinado com dados explícitos; isso não valida fonte, política ou implementação. |
| Dados mínimos necessários | idade e elegibilidade |
| Pode permanecer desconhecido | sexo para decisões iguais em ambos; data de nascimento completa se idade suficiente; detalhes de exame/família não usados pela decisão. Dados críticos acima não podem ser convertidos em 'não'. |
| Ação proposta | Ver pathway e policy; não emitir ação fora desta população. |
| Qualifying event | Não cria âncora temporal própria; quando houver exame usar critérios específicos CCR-PROP-016/P0 28/P0 29. |
| Schedule / evento âncora | Não estabelecido nesta proposição; não inventar intervalo ou clock. |
| O que suprime | Somente a rotina/estratégia incompatível no mesmo contexto; não apagar investigação diagnóstica necessária. Ver exceções no pathway. |
| O que não resolve | Ausência de relato, recurso indisponível, resultado pendente/inválido e registro cronologicamente anterior não comprovam resolução de FIT+. |
| Source IDs | [I01](https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening) |
| Locator | Recommendation Summary, linha 45–49 |
| Grade original / sistema | USPSTF B |
| Status das fontes | I01: FINAL_CURRENT_LOCATED |
| Confiança na interpretação | alto para o limite descrito; não aprovação clínica |
| Questão aberta | OQ-CCR-017 |
| Automation candidate | AUTOMATE_WITH_MISSING_DATA_GUARD |
| Scope candidato | V3 CCR PILOT como candidato documental |
| Review status | awaiting_clinical_review |

## CCR-PROP-025

| Campo | Conteúdo |
|---|---|
| Pergunta clínica | CQ-CCR-025 |
| Política candidata | Internacional opção A/USPSTF |
| População | Adulto 76–85 |
| Situação | continuação/início tardio |
| Enunciado documental verificado (síntese) | I01 linha 76–85 contém oferta seletiva C, com critérios clínicos e preferências. |
| Proposição clínica candidata — autoria do Work | Oferta seletiva considerando saúde, screening anterior e preferências, sem decidir benefício só pela idade. |
| Interpretação clínica do Work | Aplicação limitada à população e contexto descritos; dados desconhecidos que mudem a rota impedem conclusão automática. |
| Especificação humana proposta | ClinicalReviewRequired+apoio à decisão; SharedDecision somente com representação aprovada |
| Stance proposto | shared_decision |
| Computability proposta | clinician_judgment_required |
| Por que esta computabilidade? | Exige avaliação clínica ou resolução documental que não cabe em predicado automático. |
| Dados mínimos necessários | saúde, benefício, histórico, preferências e capacidade de investigação/tratamento |
| Pode permanecer desconhecido | sexo para decisões iguais em ambos; data de nascimento completa se idade suficiente; detalhes de exame/família não usados pela decisão. Dados críticos acima não podem ser convertidos em 'não'. |
| Ação proposta | ClinicalReviewRequired+apoio à decisão; SharedDecision somente com representação aprovada |
| Qualifying event | Não cria âncora temporal própria; quando houver exame usar critérios específicos CCR-PROP-016/P0 28/P0 29. |
| Schedule / evento âncora | Não estabelecido nesta proposição; não inventar intervalo ou clock. |
| O que suprime | Somente a rotina/estratégia incompatível no mesmo contexto; não apagar investigação diagnóstica necessária. Ver exceções no pathway. |
| O que não resolve | Ausência de relato, recurso indisponível, resultado pendente/inválido e registro cronologicamente anterior não comprovam resolução de FIT+. |
| Source IDs | [I01](https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening) |
| Locator | Recommendation Summary; Starting and stopping ages |
| Grade original / sistema | USPSTF C |
| Status das fontes | I01: FINAL_CURRENT_LOCATED |
| Confiança na interpretação | alto para o limite descrito; não aprovação clínica |
| Questão aberta | OQ-CCR-018, 019 |
| Automation candidate | DECISION_SUPPORT_ONLY |
| Scope candidato | V3 CCR PILOT como candidato documental |
| Review status | awaiting_clinical_review |

## CCR-PROP-026

| Campo | Conteúdo |
|---|---|
| Pergunta clínica | CQ-CCR-025 |
| Política candidata | Internacional opção A/USPSTF |
| População | Adulto>85 |
| Situação | rotina preventiva |
| Enunciado documental verificado (síntese) | I01 orienta interrupção após 85; não atribui recomendação D independente nessa linha. |
| Proposição clínica candidata — autoria do Work | Interromper screening; isso não é proibição automática de investigação de sintomas ou FIT+ já conhecido. |
| Interpretação clínica do Work | Aplicação limitada à população e contexto descritos; dados desconhecidos que mudem a rota impedem conclusão automática. |
| Especificação humana proposta | Aplicar somente após escolha da política, dados críticos conhecidos e revisão; usar o estado correspondente no pathway, sem automatização nesta fase. |
| Stance proposto | recommend_against |
| Computability proposta | partially_computable |
| Por que esta computabilidade? | Há gates estruturáveis, mas julgamento, fonte, qualidade ou escolha de política impede conclusão integral. |
| Dados mínimos necessários | idade, finalidade do exame, investigação já aberta |
| Pode permanecer desconhecido | sexo para decisões iguais em ambos; data de nascimento completa se idade suficiente; detalhes de exame/família não usados pela decisão. Dados críticos acima não podem ser convertidos em 'não'. |
| Ação proposta | Ver pathway e policy; não emitir ação fora desta população. |
| Qualifying event | Não cria âncora temporal própria; quando houver exame usar critérios específicos CCR-PROP-016/P0 28/P0 29. |
| Schedule / evento âncora | Não estabelecido nesta proposição; não inventar intervalo ou clock. |
| O que suprime | Somente a rotina/estratégia incompatível no mesmo contexto; não apagar investigação diagnóstica necessária. Ver exceções no pathway. |
| O que não resolve | Ausência de relato, recurso indisponível, resultado pendente/inválido e registro cronologicamente anterior não comprovam resolução de FIT+. |
| Source IDs | [I01](https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening) |
| Locator | Practice Considerations/Starting and stopping ages e Update previous recommendation |
| Grade original / sistema | Sem grade D separada; não converter em USPSTF D |
| Status das fontes | I01: FINAL_CURRENT_LOCATED |
| Confiança na interpretação | alto para o limite descrito; não aprovação clínica |
| Questão aberta | OQ-CCR-018 |
| Automation candidate | DECISION_SUPPORT_ONLY |
| Scope candidato | V3 CCR PILOT como candidato documental |
| Review status | awaiting_clinical_review |

## CCR-PROP-027

| Campo | Conteúdo |
|---|---|
| Pergunta clínica | CQ-CCR-007 |
| Política candidata | Internacional opção A |
| População | Risco habitual, estratégia FIT escolhida |
| Situação | agenda |
| Enunciado documental verificado (síntese) | I01 Screening Intervals descreve FIT anual. |
| Proposição clínica candidata — autoria do Work | FIT anual; não importar periodicidade bienal do SUS. |
| Interpretação clínica do Work | Aplicação limitada à população e contexto descritos; dados desconhecidos que mudem a rota impedem conclusão automática. |
| Especificação humana proposta | Aplicar somente após escolha da política, dados críticos conhecidos e revisão; usar o estado correspondente no pathway, sem automatização nesta fase. |
| Stance proposto | recommend |
| Computability proposta | computable |
| Por que esta computabilidade? | Predicado/intervalo pode ser determinado com dados explícitos; isso não valida fonte, política ou implementação. |
| Dados mínimos necessários | estratégia, exame/data e eventos posteriores |
| Pode permanecer desconhecido | sexo para decisões iguais em ambos; data de nascimento completa se idade suficiente; detalhes de exame/família não usados pela decisão. Dados críticos acima não podem ser convertidos em 'não'. |
| Ação proposta | Ver pathway e policy; não emitir ação fora desta população. |
| Qualifying event | Guarda CCR-PROP-016 aplicada ao FIT− |
| Schedule / evento âncora | 1 ano a partir do exame válido, marco operacional OQ-CCR-004 |
| O que suprime | Somente a rotina/estratégia incompatível no mesmo contexto; não apagar investigação diagnóstica necessária. Ver exceções no pathway. |
| O que não resolve | Ausência de relato, recurso indisponível, resultado pendente/inválido e registro cronologicamente anterior não comprovam resolução de FIT+. |
| Source IDs | [I01](https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening) |
| Locator | Screening Intervals; Table 1 |
| Grade original / sistema | Intervalo da estratégia, sem grade própria separada das faixas |
| Status das fontes | I01: FINAL_CURRENT_LOCATED |
| Confiança na interpretação | alto para o limite descrito; não aprovação clínica |
| Questão aberta | OQ-CCR-004, 017 |
| Automation candidate | AUTOMATE_WITH_MISSING_DATA_GUARD |
| Scope candidato | V3 CCR PILOT como candidato documental |
| Review status | awaiting_clinical_review |

## CCR-PROP-028

| Campo | Conteúdo |
|---|---|
| Pergunta clínica | CQ-CCR-015 |
| Política candidata | Internacional opção A |
| População | Risco habitual; colonoscopia primária normal de qualidade |
| Situação | screening primário |
| Enunciado documental verificado (síntese) | I01 Screening Intervals inclui colonoscopia 10 anos; I05 pressupõe normalidade e qualidade. |
| Proposição clínica candidata — autoria do Work | Colonoscopia é uma estratégia com intervalo 10 anos após exame normal apropriado; não coletar FIT rotineiramente em paralelo. |
| Interpretação clínica do Work | Aplicação limitada à população e contexto descritos; dados desconhecidos que mudem a rota impedem conclusão automática. |
| Especificação humana proposta | Aplicar somente após escolha da política, dados críticos conhecidos e revisão; usar o estado correspondente no pathway, sem automatização nesta fase. |
| Stance proposto | recommend |
| Computability proposta | computable |
| Por que esta computabilidade? | Predicado/intervalo pode ser determinado com dados explícitos; isso não valida fonte, política ou implementação. |
| Dados mínimos necessários | laudo/qualidade/data e fatores de risco posteriores |
| Pode permanecer desconhecido | sexo para decisões iguais em ambos; data de nascimento completa se idade suficiente; detalhes de exame/família não usados pela decisão. Dados críticos acima não podem ser convertidos em 'não'. |
| Ação proposta | Ver pathway e policy; não emitir ação fora desta população. |
| Qualifying event | colonoscopia normal/final/completa/adequada, paciente ainda risco habitual |
| Schedule / evento âncora | 10 anos da colonoscopia; reavaliar elegibilidade/sintomas |
| O que suprime | Somente a rotina/estratégia incompatível no mesmo contexto; não apagar investigação diagnóstica necessária. Ver exceções no pathway. |
| O que não resolve | Ausência de relato, recurso indisponível, resultado pendente/inválido e registro cronologicamente anterior não comprovam resolução de FIT+. |
| Source IDs | [I01](https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening); [I05](https://www.asge.org/docs/default-source/guidelines/recommendations-for-follow-up-after-colonoscopy-and-polypectomy-a-consensus-update-by-the-us-multi-society-task-force-on-colorectal-cancer-2020-march-gie.pdf) |
| Locator | I01 Screening Intervals; I05 Normal high-quality colonoscopy/Table 4 |
| Grade original / sistema | I01 sem grade própria por intervalo; I05 forte/alta |
| Status das fontes | I01: FINAL_CURRENT_LOCATED; I05: FINAL; PRIMARY_ACCESS_PARTIAL |
| Confiança na interpretação | alto para o limite descrito; não aprovação clínica |
| Questão aberta | OQ-CCR-013, 017 |
| Automation candidate | AUTOMATE_WITH_MISSING_DATA_GUARD |
| Scope candidato | V3 CCR PILOT como candidato documental |
| Review status | awaiting_clinical_review |

## CCR-PROP-029

| Campo | Conteúdo |
|---|---|
| Pergunta clínica | CQ-CCR-018 |
| Política candidata | Internacional opção A (USMSTF) |
| População | Risco habitual com FIT+ e colonoscopia posterior normal high-quality |
| Situação | resolução e agenda |
| Enunciado documental verificado (síntese) | I05 recomenda seguimento 10 anos após normal de qualidade, independentemente da indicação, com exceções de risco. |
| Proposição clínica candidata — autoria do Work | Propor seguimento 10 anos aplicando a recomendação independente da indicação, com suas exceções; não tratar 'sem câncer' como sinônimo de normal. |
| Interpretação clínica do Work | Aplicação limitada à população e contexto descritos; dados desconhecidos que mudem a rota impedem conclusão automática. |
| Especificação humana proposta | Manter proposta bloqueada até resolver questões e revisão clínica. |
| Stance proposto | recommend |
| Computability proposta | partially_computable |
| Por que esta computabilidade? | Há gates estruturáveis, mas julgamento, fonte, qualidade ou escolha de política impede conclusão integral. |
| Dados mínimos necessários | datas, qualidade, achados e risco |
| Pode permanecer desconhecido | sexo para decisões iguais em ambos; data de nascimento completa se idade suficiente; detalhes de exame/família não usados pela decisão. Dados críticos acima não podem ser convertidos em 'não'. |
| Ação proposta | Sem ação clínica automática; proposta para decisão humana. |
| Qualifying event | normal, alto padrão, sem exclusões; resolução posterior inequívoca |
| Schedule / evento âncora | 10 anos da colonoscopia, condicionado à revisão e acesso integral; não regra SUS |
| O que suprime | Somente a rotina/estratégia incompatível no mesmo contexto; não apagar investigação diagnóstica necessária. Ver exceções no pathway. |
| O que não resolve | Ausência de relato, recurso indisponível, resultado pendente/inválido e registro cronologicamente anterior não comprovam resolução de FIT+. |
| Source IDs | [I05](https://www.asge.org/docs/default-source/guidelines/recommendations-for-follow-up-after-colonoscopy-and-polypectomy-a-consensus-update-by-the-us-multi-society-task-force-on-colorectal-cancer-2020-march-gie.pdf) |
| Locator | Normal high-quality colonoscopy, Table 4; exceções após 'regardless of indication' |
| Grade original / sistema | Forte/alta; aplicabilidade ao episódio explicitada como interpretação |
| Status das fontes | I05: FINAL; PRIMARY_ACCESS_PARTIAL |
| Confiança na interpretação | médio |
| Questão aberta | OQ-CCR-008, 013, 020 |
| Automation candidate | DO_NOT_IMPLEMENT_YET |
| Scope candidato | V3 CCR PILOT como candidato documental |
| Review status | awaiting_clinical_review |

## CCR-PROP-030

| Campo | Conteúdo |
|---|---|
| Pergunta clínica | CQ-CCR-019 |
| Política candidata | Internacional; SUS requer revisão própria |
| População | Colonoscopia normal anterior e novo FIT+ |
| Situação | novo gatilho diagnóstico |
| Enunciado documental verificado (síntese) | I04 sugere nova colonoscopia quando FIT positivo ocorre após colonoscopia recente, ponderando contexto. |
| Proposição clínica candidata — autoria do Work | Colonoscopia anterior não resolve o FIT posterior; oferecer nova avaliação endoscópica com contexto/qualidade/preferência. |
| Interpretação clínica do Work | Aplicação limitada à população e contexto descritos; dados desconhecidos que mudem a rota impedem conclusão automática. |
| Especificação humana proposta | Aplicar somente após escolha da política, dados críticos conhecidos e revisão; usar o estado correspondente no pathway, sem automatização nesta fase. |
| Stance proposto | recommend |
| Computability proposta | partially_computable |
| Por que esta computabilidade? | Há gates estruturáveis, mas julgamento, fonte, qualidade ou escolha de política impede conclusão integral. |
| Dados mínimos necessários | ordem temporal certa, laudo antigo, novo FIT+, contexto |
| Pode permanecer desconhecido | sexo para decisões iguais em ambos; data de nascimento completa se idade suficiente; detalhes de exame/família não usados pela decisão. Dados críticos acima não podem ser convertidos em 'não'. |
| Ação proposta | Ver pathway e policy; não emitir ação fora desta população. |
| Qualifying event | Colonoscopia anterior não é evento resolutivo |
| Schedule / evento âncora | Não estabelecido nesta proposição; não inventar intervalo ou clock. |
| O que suprime | Somente a rotina/estratégia incompatível no mesmo contexto; não apagar investigação diagnóstica necessária. Ver exceções no pathway. |
| O que não resolve | Ausência de relato, recurso indisponível, resultado pendente/inválido e registro cronologicamente anterior não comprovam resolução de FIT+. |
| Source IDs | [I04](https://www.asge.org/docs/default-source/education/practice_guidelines/fecal_immunochemical_testing.pdf) |
| Locator | Recommendation/summary positive FIT with recent colonoscopy |
| Grade original / sistema | USMSTF fraca/baixa |
| Status das fontes | I04: FINAL; PRIMARY_ACCESS_PARTIAL |
| Confiança na interpretação | alto para o limite descrito; não aprovação clínica |
| Questão aberta | OQ-CCR-014, 020 |
| Automation candidate | DECISION_SUPPORT_ONLY |
| Scope candidato | V3 CCR PILOT como candidato documental |
| Review status | awaiting_clinical_review |

## CCR-PROP-031

| Campo | Conteúdo |
|---|---|
| Pergunta clínica | CQ-CCR-022 |
| Política candidata | Internacional complemento ACG proposto |
| População | 1 FDR com CCR/pólipo avançado<60 ou≥2 FDR em qualquer idade |
| Situação | história familiar |
| Enunciado documental verificado (síntese) | I03 rec.9 distingue FDR jovem/múltiplos e propõe início e intervalo específicos. |
| Proposição clínica candidata — autoria do Work | Candidato especializado: colonoscopia aos 40 ou 10 anos antes do mais jovem, o que vier primeiro, e 5 anos entre exames. |
| Interpretação clínica do Work | Aplicação limitada à população e contexto descritos; dados desconhecidos que mudem a rota impedem conclusão automática. |
| Especificação humana proposta | No piloto: revisão/handoff, sem agenda automática |
| Stance proposto | recommend |
| Computability proposta | partially_computable |
| Por que esta computabilidade? | Há gates estruturáveis, mas julgamento, fonte, qualidade ou escolha de política impede conclusão integral. |
| Dados mínimos necessários | grau, número, tipo de lesão e idade diagnóstica |
| Pode permanecer desconhecido | sexo para decisões iguais em ambos; data de nascimento completa se idade suficiente; detalhes de exame/família não usados pela decisão. Dados críticos acima não podem ser convertidos em 'não'. |
| Ação proposta | No piloto: revisão/handoff, sem agenda automática |
| Qualifying event | Não cria âncora temporal própria; quando houver exame usar critérios específicos CCR-PROP-016/P0 28/P0 29. |
| Schedule / evento âncora | Não estabelecido nesta proposição; não inventar intervalo ou clock. |
| O que suprime | Somente a rotina/estratégia incompatível no mesmo contexto; não apagar investigação diagnóstica necessária. Ver exceções no pathway. |
| O que não resolve | Ausência de relato, recurso indisponível, resultado pendente/inválido e registro cronologicamente anterior não comprovam resolução de FIT+. |
| Source IDs | [I03](https://medicine.uams.edu/familymedicine/wp-content/uploads/sites/7/2021/07/ACG_Clinical_Guidelines__Colorectal_Cancer.14.pdf) |
| Locator | Table 1 rec.9 p.460 |
| Grade original / sistema | GRADE condicional/muito baixa |
| Status das fontes | I03: FINAL_CURRENT_LOCATED |
| Confiança na interpretação | alto para o limite descrito; não aprovação clínica |
| Questão aberta | OQ-CCR-012, 017 |
| Automation candidate | DECISION_SUPPORT_ONLY |
| Scope candidato | V3.x CCR; piloto limita-se a reconhecer/revisar/handoff |
| Review status | awaiting_clinical_review |

## CCR-PROP-032

| Campo | Conteúdo |
|---|---|
| Pergunta clínica | CQ-CCR-022 |
| Política candidata | Internacional complemento ACG proposto |
| População | 1 FDR com CCR/pólipo avançado≥60 |
| Situação | história familiar |
| Enunciado documental verificado (síntese) | I03 rec.11 diferencia um FDR com diagnóstico≥60. |
| Proposição clínica candidata — autoria do Work | Candidato: iniciar 40 ou 10 anos antes, depois retomar opções de risco habitual. |
| Interpretação clínica do Work | Aplicação limitada à população e contexto descritos; dados desconhecidos que mudem a rota impedem conclusão automática. |
| Especificação humana proposta | Revisão no piloto; não aplicar 5 anos universalmente a todo FDR |
| Stance proposto | recommend |
| Computability proposta | partially_computable |
| Por que esta computabilidade? | Há gates estruturáveis, mas julgamento, fonte, qualidade ou escolha de política impede conclusão integral. |
| Dados mínimos necessários | tipo/idade do familiar e grau |
| Pode permanecer desconhecido | sexo para decisões iguais em ambos; data de nascimento completa se idade suficiente; detalhes de exame/família não usados pela decisão. Dados críticos acima não podem ser convertidos em 'não'. |
| Ação proposta | Revisão no piloto; não aplicar 5 anos universalmente a todo FDR |
| Qualifying event | Não cria âncora temporal própria; quando houver exame usar critérios específicos CCR-PROP-016/P0 28/P0 29. |
| Schedule / evento âncora | Não estabelecido nesta proposição; não inventar intervalo ou clock. |
| O que suprime | Somente a rotina/estratégia incompatível no mesmo contexto; não apagar investigação diagnóstica necessária. Ver exceções no pathway. |
| O que não resolve | Ausência de relato, recurso indisponível, resultado pendente/inválido e registro cronologicamente anterior não comprovam resolução de FIT+. |
| Source IDs | [I03](https://medicine.uams.edu/familymedicine/wp-content/uploads/sites/7/2021/07/ACG_Clinical_Guidelines__Colorectal_Cancer.14.pdf) |
| Locator | Table 1 rec.11 p.460 |
| Grade original / sistema | GRADE condicional/muito baixa |
| Status das fontes | I03: FINAL_CURRENT_LOCATED |
| Confiança na interpretação | alto para o limite descrito; não aprovação clínica |
| Questão aberta | OQ-CCR-012, 017 |
| Automation candidate | DECISION_SUPPORT_ONLY |
| Scope candidato | V3.x CCR; piloto limita-se a reconhecer/revisar/handoff |
| Review status | awaiting_clinical_review |

## CCR-PROP-033

| Campo | Conteúdo |
|---|---|
| Pergunta clínica | CQ-CCR-022 |
| Política candidata | Internacional complemento ACG proposto |
| População | 1 familiar de segundo grau com CCR/pólipo avançado |
| Situação | história familiar |
| Enunciado documental verificado (síntese) | I03 rec.12 permite rotina habitual com um SDR isolado. |
| Proposição clínica candidata — autoria do Work | ACG sugere seguir recomendações de risco habitual para esse subgrupo isolado. |
| Interpretação clínica do Work | Aplicação limitada à população e contexto descritos; dados desconhecidos que mudem a rota impedem conclusão automática. |
| Especificação humana proposta | Aplicar somente após escolha da política, dados críticos conhecidos e revisão; usar o estado correspondente no pathway, sem automatização nesta fase. |
| Stance proposto | recommend |
| Computability proposta | partially_computable |
| Por que esta computabilidade? | Há gates estruturáveis, mas julgamento, fonte, qualidade ou escolha de política impede conclusão integral. |
| Dados mínimos necessários | grau e ausência de outros fatores familiares |
| Pode permanecer desconhecido | sexo para decisões iguais em ambos; data de nascimento completa se idade suficiente; detalhes de exame/família não usados pela decisão. Dados críticos acima não podem ser convertidos em 'não'. |
| Ação proposta | Ver pathway e policy; não emitir ação fora desta população. |
| Qualifying event | Não cria âncora temporal própria; quando houver exame usar critérios específicos CCR-PROP-016/P0 28/P0 29. |
| Schedule / evento âncora | Não estabelecido nesta proposição; não inventar intervalo ou clock. |
| O que suprime | Somente a rotina/estratégia incompatível no mesmo contexto; não apagar investigação diagnóstica necessária. Ver exceções no pathway. |
| O que não resolve | Ausência de relato, recurso indisponível, resultado pendente/inválido e registro cronologicamente anterior não comprovam resolução de FIT+. |
| Source IDs | [I03](https://medicine.uams.edu/familymedicine/wp-content/uploads/sites/7/2021/07/ACG_Clinical_Guidelines__Colorectal_Cancer.14.pdf) |
| Locator | Table 1 rec.12 p.460 |
| Grade original / sistema | GRADE condicional/baixa |
| Status das fontes | I03: FINAL_CURRENT_LOCATED |
| Confiança na interpretação | alto para o limite descrito; não aprovação clínica |
| Questão aberta | OQ-CCR-012, 017 |
| Automation candidate | DECISION_SUPPORT_ONLY |
| Scope candidato | V3.x CCR; piloto limita-se a reconhecer/revisar/handoff |
| Review status | awaiting_clinical_review |

## CCR-PROP-034

| Campo | Conteúdo |
|---|---|
| Pergunta clínica | CQ-CCR-015 |
| Política candidata | Brasil ampliado candidato |
| População | Risco habitual e colonoscopia primária negativa |
| Situação | modalidade/agenda |
| Enunciado documental verificado (síntese) | S01 inclui colonoscopia e intervalo 10 anos no enunciado específico para negativo. |
| Proposição clínica candidata — autoria do Work | SBOC inclui colonoscopia com repetição 10 anos após negativo; propor estratégia independente do FIT, não somar ambas. |
| Interpretação clínica do Work | Aplicação limitada à população e contexto descritos; dados desconhecidos que mudem a rota impedem conclusão automática. |
| Especificação humana proposta | Aplicar somente após escolha da política, dados críticos conhecidos e revisão; usar o estado correspondente no pathway, sem automatização nesta fase. |
| Stance proposto | recommend |
| Computability proposta | computable |
| Por que esta computabilidade? | Predicado/intervalo pode ser determinado com dados explícitos; isso não valida fonte, política ou implementação. |
| Dados mínimos necessários | estratégia, qualidade/completude/laudo/data |
| Pode permanecer desconhecido | sexo para decisões iguais em ambos; data de nascimento completa se idade suficiente; detalhes de exame/família não usados pela decisão. Dados críticos acima não podem ser convertidos em 'não'. |
| Ação proposta | Ver pathway e policy; não emitir ação fora desta população. |
| Qualifying event | normal e qualidade suficiente; definição operacional proposta precisa revisão |
| Schedule / evento âncora | 10 anos da colonoscopia; não implica automaticamente pós-FIT+ SUS |
| O que suprime | Somente a rotina/estratégia incompatível no mesmo contexto; não apagar investigação diagnóstica necessária. Ver exceções no pathway. |
| O que não resolve | Ausência de relato, recurso indisponível, resultado pendente/inválido e registro cronologicamente anterior não comprovam resolução de FIT+. |
| Source IDs | [S01](https://sboc.org.br/wp-content/uploads/2026/04/Diretrizes-SBOC-2026-C%E2%94%9C%E2%94%82lon-doen%E2%94%9Coa-localizada-v6-VERS%E2%94%9CaO-FINAL.pdf) |
| Locator | Métodos de rastreio p.5 |
| Grade original / sistema | SBOC NE moderado/FR forte no enunciado específico; lista geral tem NEalto/FRforte |
| Status das fontes | S01: FINAL_SOCIETY |
| Confiança na interpretação | alto para o limite descrito; não aprovação clínica |
| Questão aberta | OQ-CCR-013, 021 |
| Automation candidate | AUTOMATE_WITH_MISSING_DATA_GUARD |
| Scope candidato | V3 CCR PILOT como candidato documental |
| Review status | awaiting_clinical_review |

## CCR-PROP-035

| Campo | Conteúdo |
|---|---|
| Pergunta clínica | CQ-CCR-007 |
| Política candidata | Brasil ampliado candidato |
| População | Risco habitual usando teste fecal |
| Situação | modalidade/agenda |
| Enunciado documental verificado (síntese) | S01 apresenta intervalo 1–2 anos para teste fecal. |
| Proposição clínica candidata — autoria do Work | SBOC apresenta 1–2 anos, não um intervalo único para o Motor. Propor 2 anos alinhados ao núcleo brasileiro; alternativa anual exige escolha explícita. |
| Interpretação clínica do Work | Aplicação limitada à população e contexto descritos; dados desconhecidos que mudem a rota impedem conclusão automática. |
| Especificação humana proposta | Manter proposta bloqueada até resolver questões e revisão clínica. |
| Stance proposto | recommend |
| Computability proposta | partially_computable |
| Por que esta computabilidade? | Há gates estruturáveis, mas julgamento, fonte, qualidade ou escolha de política impede conclusão integral. |
| Dados mínimos necessários | fonte/estratégia selecionada, exame/data |
| Pode permanecer desconhecido | sexo para decisões iguais em ambos; data de nascimento completa se idade suficiente; detalhes de exame/família não usados pela decisão. Dados críticos acima não podem ser convertidos em 'não'. |
| Ação proposta | Sem ação clínica automática; proposta para decisão humana. |
| Qualifying event | Não cria âncora temporal própria; quando houver exame usar critérios específicos CCR-PROP-016/P0 28/P0 29. |
| Schedule / evento âncora | Escolha 1 ou 2 anos em aberto; sem choose_shorter_interval |
| O que suprime | Somente a rotina/estratégia incompatível no mesmo contexto; não apagar investigação diagnóstica necessária. Ver exceções no pathway. |
| O que não resolve | Ausência de relato, recurso indisponível, resultado pendente/inválido e registro cronologicamente anterior não comprovam resolução de FIT+. |
| Source IDs | [S01](https://sboc.org.br/wp-content/uploads/2026/04/Diretrizes-SBOC-2026-C%E2%94%9C%E2%94%82lon-doen%E2%94%9Coa-localizada-v6-VERS%E2%94%9CaO-FINAL.pdf) |
| Locator | Métodos de rastreio p.5 |
| Grade original / sistema | Não há grade adjacente específica ao intervalo 1–2 anos; não herdar a grade da colonoscopia |
| Status das fontes | S01: FINAL_SOCIETY |
| Confiança na interpretação | médio, condicionado à pendência descrita |
| Questão aberta | OQ-CCR-021 |
| Automation candidate | DO_NOT_IMPLEMENT_YET |
| Scope candidato | V3 CCR PILOT como candidato documental |
| Review status | awaiting_clinical_review |

## CCR-PROP-036

| Campo | Conteúdo |
|---|---|
| Pergunta clínica | CQ-CCR-026 |
| Política candidata | Brasil ampliado candidato |
| População | 45–49 e idosos |
| Situação | faixa etária |
| Enunciado documental verificado (síntese) | S01 qualifica antecipação para 45; S03 orienta avaliação a partir 45, sem guideline integral nova recuperada. |
| Proposição clínica candidata — autoria do Work | SBOC descreve 50–75 como maioria e início 45 em algumas sociedades; SBCP orienta avaliação a partir 45. Propor revisão compartilhada 45–49, sem alegar consenso brasileiro único. |
| Interpretação clínica do Work | Aplicação limitada à população e contexto descritos; dados desconhecidos que mudem a rota impedem conclusão automática. |
| Especificação humana proposta | Aplicar somente após escolha da política, dados críticos conhecidos e revisão; usar o estado correspondente no pathway, sem automatização nesta fase. |
| Stance proposto | shared_decision |
| Computability proposta | clinician_judgment_required |
| Por que esta computabilidade? | Exige avaliação clínica ou resolução documental que não cabe em predicado automático. |
| Dados mínimos necessários | idade, risco, benefício, histórico, preferência |
| Pode permanecer desconhecido | sexo para decisões iguais em ambos; data de nascimento completa se idade suficiente; detalhes de exame/família não usados pela decisão. Dados críticos acima não podem ser convertidos em 'não'. |
| Ação proposta | Ver pathway e policy; não emitir ação fora desta população. |
| Qualifying event | Não cria âncora temporal própria; quando houver exame usar critérios específicos CCR-PROP-016/P0 28/P0 29. |
| Schedule / evento âncora | Não estabelecido nesta proposição; não inventar intervalo ou clock. |
| O que suprime | Somente a rotina/estratégia incompatível no mesmo contexto; não apagar investigação diagnóstica necessária. Ver exceções no pathway. |
| O que não resolve | Ausência de relato, recurso indisponível, resultado pendente/inválido e registro cronologicamente anterior não comprovam resolução de FIT+. |
| Source IDs | [S01](https://sboc.org.br/wp-content/uploads/2026/04/Diretrizes-SBOC-2026-C%E2%94%9C%E2%94%82lon-doen%E2%94%9Coa-localizada-v6-VERS%E2%94%9CaO-FINAL.pdf); [S03](https://sbcp.org.br/medico/american-college-of-physicians-recomenda-rastreio-do-cancer-colorretal-a-partir-dos-50-anos/) |
| Locator | S01 Faixa etária p.6; S03 parágrafos finais |
| Grade original / sistema | S01 NEbaixo para antecipação; sem FR explícita ali; S03 not formally graded |
| Status das fontes | S01: FINAL_SOCIETY; S03: COMMUNICATION_ONLY; posição institucional |
| Confiança na interpretação | alto para o limite descrito; não aprovação clínica |
| Questão aberta | OQ-CCR-018, 021 |
| Automation candidate | DECISION_SUPPORT_ONLY |
| Scope candidato | V3 CCR PILOT como candidato documental |
| Review status | awaiting_clinical_review |

## CCR-PROP-037

| Campo | Conteúdo |
|---|---|
| Pergunta clínica | CQ-CCR-027 |
| Política candidata | Internacional opção B/ACS 2026 |
| População | Risco habitual; positivo de teste não colonoscópico |
| Situação | complemento da opção ACS |
| Enunciado documental verificado (síntese) | I02 Table 1/rationale mantém início 45 e orienta colonoscopia oportuna preferencialmente em 6 meses após positivo. |
| Proposição clínica candidata — autoria do Work | ACS mantém início 45 e propõe colonoscopia oportuna após positivo, preferivelmente dentro 6 meses; não transformar preferência em prazo obrigatório SUS. |
| Interpretação clínica do Work | Aplicação limitada à população e contexto descritos; dados desconhecidos que mudem a rota impedem conclusão automática. |
| Especificação humana proposta | Aplicar somente após escolha da política, dados críticos conhecidos e revisão; usar o estado correspondente no pathway, sem automatização nesta fase. |
| Stance proposto | recommend |
| Computability proposta | partially_computable |
| Por que esta computabilidade? | Há gates estruturáveis, mas julgamento, fonte, qualidade ou escolha de política impede conclusão integral. |
| Dados mínimos necessários | policy ACS escolhida, data e status do seguimento |
| Pode permanecer desconhecido | sexo para decisões iguais em ambos; data de nascimento completa se idade suficiente; detalhes de exame/família não usados pela decisão. Dados críticos acima não podem ser convertidos em 'não'. |
| Ação proposta | Ver pathway e policy; não emitir ação fora desta população. |
| Qualifying event | Não cria âncora temporal própria; quando houver exame usar critérios específicos CCR-PROP-016/P0 28/P0 29. |
| Schedule / evento âncora | Preferivelmente 6 meses a partir do teste inicial na fonte; marco de contagem requer confirmação operacional |
| O que suprime | Somente a rotina/estratégia incompatível no mesmo contexto; não apagar investigação diagnóstica necessária. Ver exceções no pathway. |
| O que não resolve | Ausência de relato, recurso indisponível, resultado pendente/inválido e registro cronologicamente anterior não comprovam resolução de FIT+. |
| Source IDs | [I02](https://acsjournals.onlinelibrary.wiley.com/doi/10.3322/caac.70083) |
| Locator | Table 1; Recommendations and rationale, parágrafo follow-up |
| Grade original / sistema | Início 45 qualified; ≥50 strong; prazo sem grade independente na sentença |
| Status das fontes | I02: FINAL_CURRENT_LOCATED |
| Confiança na interpretação | alto para o limite descrito; não aprovação clínica |
| Questão aberta | OQ-CCR-007, 017 |
| Automation candidate | DECISION_SUPPORT_ONLY |
| Scope candidato | V3 CCR PILOT como candidato documental |
| Review status | awaiting_clinical_review |

## CCR-PROP-038

| Campo | Conteúdo |
|---|---|
| Pergunta clínica | CQ-CCR-020 |
| Política candidata | Todas; detalhes USMSTF somente Internacional |
| População | Pólipo que pode requerer surveillance |
| Situação | limite do piloto |
| Enunciado documental verificado (síntese) | I05 separa intervalos segundo achados; B03 remete pólipos a cuidado específico. |
| Proposição clínica candidata — autoria do Work | Propor saída para revisão, não digitalizar Tables 4–5. Tamanho/número/histologia/ressecção necessários se módulo futuro calcular intervalo. |
| Interpretação clínica do Work | Aplicação limitada à população e contexto descritos; dados desconhecidos que mudem a rota impedem conclusão automática. |
| Especificação humana proposta | ClinicalReviewRequired; HandedOff só com transferência conhecida |
| Stance proposto | recommend |
| Computability proposta | clinician_judgment_required |
| Por que esta computabilidade? | Exige avaliação clínica ou resolução documental que não cabe em predicado automático. |
| Dados mínimos necessários | achado e seguimento recomendado; detalhes condicionais ao módulo |
| Pode permanecer desconhecido | sexo para decisões iguais em ambos; data de nascimento completa se idade suficiente; detalhes de exame/família não usados pela decisão. Dados críticos acima não podem ser convertidos em 'não'. |
| Ação proposta | ClinicalReviewRequired; HandedOff só com transferência conhecida |
| Qualifying event | Não cria âncora temporal própria; quando houver exame usar critérios específicos CCR-PROP-016/P0 28/P0 29. |
| Schedule / evento âncora | Não estabelecido nesta proposição; não inventar intervalo ou clock. |
| O que suprime | Somente a rotina/estratégia incompatível no mesmo contexto; não apagar investigação diagnóstica necessária. Ver exceções no pathway. |
| O que não resolve | Ausência de relato, recurso indisponível, resultado pendente/inválido e registro cronologicamente anterior não comprovam resolução de FIT+. |
| Source IDs | [I05](https://www.asge.org/docs/default-source/guidelines/recommendations-for-follow-up-after-colonoscopy-and-polypectomy-a-consensus-update-by-the-us-multi-society-task-force-on-colorectal-cancer-2020-march-gie.pdf); [B03](https://www.gov.br/conitec/pt-br/midias/consultas/relatorios/2026/relatorio-preliminar-diretrizes-brasileiras-do-rastreamento-do-cancer-de-colon-e-reto-cp-20/@@display-file/file) |
| Locator | I05 Tables 4–5; B03 rec.8 parágrafo pólipos |
| Grade original / sistema | Sem grade única; não transpor um grau para todas as lesões |
| Status das fontes | I05: FINAL; PRIMARY_ACCESS_PARTIAL; B03: PRELIMINARY |
| Confiança na interpretação | alto para o limite descrito; não aprovação clínica |
| Questão aberta | OQ-CCR-011 |
| Automation candidate | HAND_OFF |
| Scope candidato | V3.x CCR; piloto limita-se a reconhecer/revisar/handoff |
| Review status | awaiting_clinical_review |

## CCR-PROP-039

| Campo | Conteúdo |
|---|---|
| Pergunta clínica | CQ-CCR-017 |
| Política candidata | Internacional (USMSTF2025), não prazo SUS |
| População | Preparo inadequado não recuperável |
| Situação | repetição |
| Enunciado documental verificado (síntese) | I06 distingue repetição por preparo inadequado em rotina versus exame após teste não colonoscópico anormal. |
| Proposição clínica candidata — autoria do Work | Distinguir repetição em até 12 meses no screening/surveillance de repetição tão cedo quanto possível, em geral até 3 meses, após teste não colonoscópico anormal. |
| Interpretação clínica do Work | Aplicação limitada à população e contexto descritos; dados desconhecidos que mudem a rota impedem conclusão automática. |
| Especificação humana proposta | Aplicar somente após escolha da política, dados críticos conhecidos e revisão; usar o estado correspondente no pathway, sem automatização nesta fase. |
| Stance proposto | recommend |
| Computability proposta | partially_computable |
| Por que esta computabilidade? | Há gates estruturáveis, mas julgamento, fonte, qualidade ou escolha de política impede conclusão integral. |
| Dados mínimos necessários | indicação original, qualidade e contexto |
| Pode permanecer desconhecido | sexo para decisões iguais em ambos; data de nascimento completa se idade suficiente; detalhes de exame/família não usados pela decisão. Dados críticos acima não podem ser convertidos em 'não'. |
| Ação proposta | Ver pathway e policy; não emitir ação fora desta população. |
| Qualifying event | Não cria âncora temporal própria; quando houver exame usar critérios específicos CCR-PROP-016/P0 28/P0 29. |
| Schedule / evento âncora | 12 meses e em geral 3 meses são contextos distintos; não prazo universal FIT+ |
| O que suprime | Somente a rotina/estratégia incompatível no mesmo contexto; não apagar investigação diagnóstica necessária. Ver exceções no pathway. |
| O que não resolve | Ausência de relato, recurso indisponível, resultado pendente/inválido e registro cronologicamente anterior não comprovam resolução de FIT+. |
| Source IDs | [I06](https://www.asge.org/home/resources/publications/guidelines/optimizing-bowel-preparation-quality-for-colonoscopy--consensus-recommendations-by-the-us-multi-society-task-force-on-colorectal-cancer) |
| Locator | Table 2; Management of patient with inadequate and nonsalvageable preparation |
| Grade original / sistema | Forte/moderada; trecho primário indexado, integral pendente |
| Status das fontes | I06: FINAL; PRIMARY_ACCESS_PARTIAL |
| Confiança na interpretação | alto para o limite descrito; não aprovação clínica |
| Questão aberta | OQ-CCR-016, 020 |
| Automation candidate | DECISION_SUPPORT_ONLY |
| Scope candidato | V3.x CCR; piloto limita-se a reconhecer/revisar/handoff |
| Review status | awaiting_clinical_review |

## CCR-PROP-040

| Campo | Conteúdo |
|---|---|
| Pergunta clínica | CQ-CCR-002 |
| Política candidata | Internacional opção ACS |
| População | Risco aumentado por radiação abdominal/pélvica terapêutica |
| Situação | fora do average-risk ACS |
| Enunciado documental verificado (síntese) | I02 Table 1 nota b exclui radioterapia abdominal/pélvica para câncer da definição de risco habitual. |
| Proposição clínica candidata — autoria do Work | Registrar radiação terapêutica como modificador explícito ACS; não transferir automaticamente ao gate SUS nem desenvolver protocolo especial. |
| Interpretação clínica do Work | Aplicação limitada à população e contexto descritos; dados desconhecidos que mudem a rota impedem conclusão automática. |
| Especificação humana proposta | Aplicar somente após escolha da política, dados críticos conhecidos e revisão; usar o estado correspondente no pathway, sem automatização nesta fase. |
| Stance proposto | recommend |
| Computability proposta | partially_computable |
| Por que esta computabilidade? | Há gates estruturáveis, mas julgamento, fonte, qualidade ou escolha de política impede conclusão integral. |
| Dados mínimos necessários | radioterapia abdominal/pélvica apenas se esta política for escolhida |
| Pode permanecer desconhecido | sexo para decisões iguais em ambos; data de nascimento completa se idade suficiente; detalhes de exame/família não usados pela decisão. Dados críticos acima não podem ser convertidos em 'não'. |
| Ação proposta | Ver pathway e policy; não emitir ação fora desta população. |
| Qualifying event | Não cria âncora temporal própria; quando houver exame usar critérios específicos CCR-PROP-016/P0 28/P0 29. |
| Schedule / evento âncora | Não estabelecido nesta proposição; não inventar intervalo ou clock. |
| O que suprime | Somente a rotina/estratégia incompatível no mesmo contexto; não apagar investigação diagnóstica necessária. Ver exceções no pathway. |
| O que não resolve | Ausência de relato, recurso indisponível, resultado pendente/inválido e registro cronologicamente anterior não comprovam resolução de FIT+. |
| Source IDs | [I02](https://acsjournals.onlinelibrary.wiley.com/doi/10.3322/caac.70083) |
| Locator | Table 1 nota b, definição de average-risk |
| Grade original / sistema | Definição de população, sem grade independente |
| Status das fontes | I02: FINAL_CURRENT_LOCATED |
| Confiança na interpretação | alto para o limite descrito; não aprovação clínica |
| Questão aberta | OQ-CCR-012, 017 |
| Automation candidate | HAND_OFF |
| Scope candidato | V3 CCR PILOT como candidato documental |
| Review status | awaiting_clinical_review |

## CCR-PROP-041

| Campo | Conteúdo |
|---|---|
| Pergunta clínica | CQ-CCR-008 |
| Política candidata | SUS; correspondência internacional separada |
| População | Pessoa recebendo FIT |
| Situação | operação/minimização |
| Enunciado documental verificado (síntese) | B09/B03 descrevem amostra única e ausência de preparo/dieta restritiva para FIT. |
| Proposição clínica candidata — autoria do Work | Uma amostra e ausência de preparo intestinal/dieta são comunicadas pelo INCA; especificação de kit, transporte, falha e medicações exige instrução laboratorial. |
| Interpretação clínica do Work | Aplicação limitada à população e contexto descritos; dados desconhecidos que mudem a rota impedem conclusão automática. |
| Especificação humana proposta | Aplicar somente após escolha da política, dados críticos conhecidos e revisão; usar o estado correspondente no pathway, sem automatização nesta fase. |
| Stance proposto | recommend |
| Computability proposta | partially_computable |
| Por que esta computabilidade? | Há gates estruturáveis, mas julgamento, fonte, qualidade ou escolha de política impede conclusão integral. |
| Dados mínimos necessários | instruções validadas do kit/laboratório; não coletar dieta rotineiramente |
| Pode permanecer desconhecido | sexo para decisões iguais em ambos; data de nascimento completa se idade suficiente; detalhes de exame/família não usados pela decisão. Dados críticos acima não podem ser convertidos em 'não'. |
| Ação proposta | Ver pathway e policy; não emitir ação fora desta população. |
| Qualifying event | Não cria âncora temporal própria; quando houver exame usar critérios específicos CCR-PROP-016/P0 28/P0 29. |
| Schedule / evento âncora | Não estabelecido nesta proposição; não inventar intervalo ou clock. |
| O que suprime | Somente a rotina/estratégia incompatível no mesmo contexto; não apagar investigação diagnóstica necessária. Ver exceções no pathway. |
| O que não resolve | Ausência de relato, recurso indisponível, resultado pendente/inválido e registro cronologicamente anterior não comprovam resolução de FIT+. |
| Source IDs | [B09](https://www.gov.br/inca/pt-br/assuntos/noticias/2026/sus-adota-novo-exame-para-detectar-cancer-de-intestino-antes-dos-sintomas); [B03](https://www.gov.br/conitec/pt-br/midias/consultas/relatorios/2026/relatorio-preliminar-diretrizes-brasileiras-do-rastreamento-do-cancer-de-colon-e-reto-cp-20/@@display-file/file) |
| Locator | B09 lista de vantagens; B03 comparação FIT/retossigmoidoscopia, impressa 7/PDF 13 |
| Grade original / sistema | not formally graded no trecho operacional |
| Status das fontes | B09: COMMUNICATION_ONLY; B03: PRELIMINARY |
| Confiança na interpretação | alto para o limite descrito; não aprovação clínica |
| Questão aberta | OQ-CCR-005, 015 |
| Automation candidate | DECISION_SUPPORT_ONLY |
| Scope candidato | V3 CCR PILOT como candidato documental |
| Review status | awaiting_clinical_review |

## CCR-PROP-042

| Campo | Conteúdo |
|---|---|
| Pergunta clínica | CQ-CCR-016 |
| Política candidata | Internacional; requisito mínimo proposto SUS/BR |
| População | Colonoscopia para encerrar investigação/âncora |
| Situação | qualidade |
| Enunciado documental verificado (síntese) | I05 premissas combinamceco/preparo/ressecção e qualidade do examinador. |
| Proposição clínica candidata — autoria do Work | Qualidade combina exame até o ceco, preparo para detectar lesões>5 mm e atenção à ressecção completa; indicador do serviço não é resposta leiga do paciente. |
| Interpretação clínica do Work | Aplicação limitada à população e contexto descritos; dados desconhecidos que mudem a rota impedem conclusão automática. |
| Especificação humana proposta | Aplicar somente após escolha da política, dados críticos conhecidos e revisão; usar o estado correspondente no pathway, sem automatização nesta fase. |
| Stance proposto | recommend |
| Computability proposta | partially_computable |
| Por que esta computabilidade? | Há gates estruturáveis, mas julgamento, fonte, qualidade ou escolha de política impede conclusão integral. |
| Dados mínimos necessários | laudo, completude, preparo e achados; verificar contexto do profissional |
| Pode permanecer desconhecido | sexo para decisões iguais em ambos; data de nascimento completa se idade suficiente; detalhes de exame/família não usados pela decisão. Dados críticos acima não podem ser convertidos em 'não'. |
| Ação proposta | Ver pathway e policy; não emitir ação fora desta população. |
| Qualifying event | Laudo suficiente, sem achado pendente; não inferir 'adequado' porque exame foi feito |
| Schedule / evento âncora | Não estabelecido nesta proposição; não inventar intervalo ou clock. |
| O que suprime | Somente a rotina/estratégia incompatível no mesmo contexto; não apagar investigação diagnóstica necessária. Ver exceções no pathway. |
| O que não resolve | Ausência de relato, recurso indisponível, resultado pendente/inválido e registro cronologicamente anterior não comprovam resolução de FIT+. |
| Source IDs | [I05](https://www.asge.org/docs/default-source/guidelines/recommendations-for-follow-up-after-colonoscopy-and-polypectomy-a-consensus-update-by-the-us-multi-society-task-force-on-colorectal-cancer-2020-march-gie.pdf); [B03](https://www.gov.br/conitec/pt-br/midias/consultas/relatorios/2026/relatorio-preliminar-diretrizes-brasileiras-do-rastreamento-do-cancer-de-colon-e-reto-cp-20/@@display-file/file) |
| Locator | I05 Table 3/Colonoscopy quality assumptions; B03 rec.8 |
| Grade original / sistema | Premissas de qualidade, não grade autônoma |
| Status das fontes | I05: FINAL; PRIMARY_ACCESS_PARTIAL; B03: PRELIMINARY |
| Confiança na interpretação | alto para o limite descrito; não aprovação clínica |
| Questão aberta | OQ-CCR-013, 020 |
| Automation candidate | AUTOMATE_WITH_MISSING_DATA_GUARD |
| Scope candidato | V3 CCR PILOT como candidato documental |
| Review status | awaiting_clinical_review |

## CCR-PROP-043

| Campo | Conteúdo |
|---|---|
| Pergunta clínica | CQ-CCR-030 |
| Política candidata | SUS |
| População | FIT local indisponível/desconhecido |
| Situação | Care Setting |
| Enunciado documental verificado (síntese) | B11 anuncia implantação gradual; B12 não fornece fallback universal FIT ausente→colonoscopia. |
| Proposição clínica candidata — autoria do Work | Não trocar automaticamente recomendação por colonoscopia primária; esclarecer disponibilidade e rota pactuada. |
| Interpretação clínica do Work | Aplicação limitada à população e contexto descritos; dados desconhecidos que mudem a rota impedem conclusão automática. |
| Especificação humana proposta | Recomendação preservada; regulação/clarificação, sem declarar serviço disponível |
| Stance proposto | no_formal_recommendation |
| Computability proposta | partially_computable |
| Por que esta computabilidade? | Há gates estruturáveis, mas julgamento, fonte, qualidade ou escolha de política impede conclusão integral. |
| Dados mínimos necessários | disponibilidade e rota local sem município como elegibilidade clínica |
| Pode permanecer desconhecido | sexo para decisões iguais em ambos; data de nascimento completa se idade suficiente; detalhes de exame/família não usados pela decisão. Dados críticos acima não podem ser convertidos em 'não'. |
| Ação proposta | Recomendação preservada; regulação/clarificação, sem declarar serviço disponível |
| Qualifying event | Não cria âncora temporal própria; quando houver exame usar critérios específicos CCR-PROP-016/P0 28/P0 29. |
| Schedule / evento âncora | Não estabelecido nesta proposição; não inventar intervalo ou clock. |
| O que suprime | Somente a rotina/estratégia incompatível no mesmo contexto; não apagar investigação diagnóstica necessária. Ver exceções no pathway. |
| O que não resolve | Ausência de relato, recurso indisponível, resultado pendente/inválido e registro cronologicamente anterior não comprovam resolução de FIT+. |
| Source IDs | [B12](https://www.gov.br/saude/pt-br/composicao/saes/agora-tem-especialistas/publicacoes/protocolo-de-acesso-as-ofertas-de-cuidados-integrados-em-oncologia.pdf/@@download/file); [B11](https://www.gov.br/saude/pt-br/assuntos/noticias-ms/2026/outubro/ministerio-da-saude-amplia-acesso-a-medicamentos-oncologicos-de-alta-tecnologia-no-rio-de-janeiro) |
| Locator | B12 organização OCI/pp.17–18; B11 seção FIT, implantação gradual |
| Grade original / sistema | Sem fallback normativo localizado; decisão operacional do Work |
| Status das fontes | B12: FINAL_TECHNICAL; operational scope; B11: COMMUNICATION_ONLY |
| Confiança na interpretação | alto para o limite descrito; não aprovação clínica |
| Questão aberta | OQ-CCR-022 |
| Automation candidate | DECISION_SUPPORT_ONLY |
| Scope candidato | V3 CCR PILOT como candidato documental |
| Review status | awaiting_clinical_review |

## CCR-PROP-044

| Campo | Conteúdo |
|---|---|
| Pergunta clínica | CQ-CCR-030 |
| Política candidata | SUS e demais por fonte própria |
| População | FIT+ com colonoscopia indisponível |
| Situação | Care Setting |
| Enunciado documental verificado (síntese) | B12/B08 preveem rede referencial; I04 não aceita repetir FIT como substituto. |
| Proposição clínica candidata — autoria do Work | Preservar necessidade diagnóstica e buscar regulação/serviço responsável; não resolver positivo com repetição FIT ou rótulo Current. |
| Interpretação clínica do Work | Aplicação limitada à população e contexto descritos; dados desconhecidos que mudem a rota impedem conclusão automática. |
| Especificação humana proposta | InFollowUp + encaminhamento; unknown exige esclarecimento |
| Stance proposto | recommend |
| Computability proposta | partially_computable |
| Por que esta computabilidade? | Há gates estruturáveis, mas julgamento, fonte, qualidade ou escolha de política impede conclusão integral. |
| Dados mínimos necessários | recurso/rota/responsável e seguimento |
| Pode permanecer desconhecido | sexo para decisões iguais em ambos; data de nascimento completa se idade suficiente; detalhes de exame/família não usados pela decisão. Dados críticos acima não podem ser convertidos em 'não'. |
| Ação proposta | InFollowUp + encaminhamento; unknown exige esclarecimento |
| Qualifying event | Não cria âncora temporal própria; quando houver exame usar critérios específicos CCR-PROP-016/P0 28/P0 29. |
| Schedule / evento âncora | Não estabelecido nesta proposição; não inventar intervalo ou clock. |
| O que suprime | Somente a rotina/estratégia incompatível no mesmo contexto; não apagar investigação diagnóstica necessária. Ver exceções no pathway. |
| O que não resolve | Ausência de relato, recurso indisponível, resultado pendente/inválido e registro cronologicamente anterior não comprovam resolução de FIT+. |
| Source IDs | [B12](https://www.gov.br/saude/pt-br/composicao/saes/agora-tem-especialistas/publicacoes/protocolo-de-acesso-as-ofertas-de-cuidados-integrados-em-oncologia.pdf/@@download/file); [B08](https://www.gov.br/conitec/pt-br/midias/protocolos/adenocarcinoma-de-colon-e-de-reto-pcdt/@@display-file/file); [I04](https://www.asge.org/docs/default-source/education/practice_guidelines/fecal_immunochemical_testing.pdf) |
| Locator | B12 OCI CCR pp.17–18; B08 art.3; I04 positivos |
| Grade original / sistema | Rota brasileira operacional sem grade; I04 colonoscopia forte/moderada |
| Status das fontes | B12: FINAL_TECHNICAL; operational scope; B08: FINAL_ACTIVE_WITHIN_SCOPE; I04: FINAL; PRIMARY_ACCESS_PARTIAL |
| Confiança na interpretação | alto para o limite descrito; não aprovação clínica |
| Questão aberta | OQ-CCR-022 |
| Automation candidate | DECISION_SUPPORT_ONLY |
| Scope candidato | V3 CCR PILOT como candidato documental |
| Review status | awaiting_clinical_review |

## CCR-PROP-045

| Campo | Conteúdo |
|---|---|
| Pergunta clínica | CQ-CCR-031 |
| Política candidata | Todas — especificação técnica subordinada à clínica |
| População | Decisões clínicas simultâneas |
| Situação | representação |
| Enunciado documental verificado (síntese) | Fontes distinguem oferta preventiva e investigação; a forma de coordenar tracks é interpretação de engenharia, não recomendação de guideline. |
| Proposição clínica candidata — autoria do Work | Separar rotina de follow-up para não emitir novo FIT junto de FIT+ aberto; detectar conflitos de conteúdo antes de registrar resolver. Não alterar Foundation. |
| Interpretação clínica do Work | Proteção de coordenação entre decisões; conteúdo precisa comprovar que a rotina não compete com investigação. |
| Especificação humana proposta | Revisão FG01–FG04; dois tracks não devem produzir ações redundantes |
| Stance proposto | no_formal_recommendation |
| Computability proposta | clinician_judgment_required |
| Por que esta computabilidade? | Exige avaliação clínica ou resolução documental que não cabe em predicado automático. |
| Dados mínimos necessários | estado do episódio, preferência e evidência de resolução |
| Pode permanecer desconhecido | sexo para decisões iguais em ambos; data de nascimento completa se idade suficiente; detalhes de exame/família não usados pela decisão. Dados críticos acima não podem ser convertidos em 'não'. |
| Ação proposta | Revisão FG01–FG04; dois tracks não devem produzir ações redundantes |
| Qualifying event | Não cria âncora temporal própria; quando houver exame usar critérios específicos CCR-PROP-016/P0 28/P0 29. |
| Schedule / evento âncora | Não estabelecido nesta proposição; não inventar intervalo ou clock. |
| O que suprime | Somente a rotina/estratégia incompatível no mesmo contexto; não apagar investigação diagnóstica necessária. Ver exceções no pathway. |
| O que não resolve | Ausência de relato, recurso indisponível, resultado pendente/inválido e registro cronologicamente anterior não comprovam resolução de FIT+. |
| Source IDs | [B12](https://www.gov.br/saude/pt-br/composicao/saes/agora-tem-especialistas/publicacoes/protocolo-de-acesso-as-ofertas-de-cuidados-integrados-em-oncologia.pdf/@@download/file); [I04](https://www.asge.org/docs/default-source/education/practice_guidelines/fecal_immunochemical_testing.pdf) |
| Locator | Fluxo diagnóstico; inspeção Foundation 8c63356, schedule/evaluatePatient/extensions |
| Grade original / sistema | Mapeamento do Work, sem grade clínica |
| Status das fontes | B12: FINAL_TECHNICAL; operational scope; I04: FINAL; PRIMARY_ACCESS_PARTIAL |
| Confiança na interpretação | médio, condicionado à pendência descrita |
| Questão aberta | OQ-CCR-019, 023 |
| Automation candidate | DO_NOT_IMPLEMENT_YET |
| Scope candidato | V3 CCR PILOT como candidato documental |
| Review status | awaiting_clinical_review |

## Computability review consolidada

| Proposição | Computável? | Por quê? | Precisa decisão humana? | Candidato |
|---|---|---|---|---|
| CCR-PROP-001 | partially_computable | Julgamento, curadoria ou lacuna documental explícita | Sim; OQ-CCR-001, 002, 003 | DO_NOT_IMPLEMENT_YET |
| CCR-PROP-002 | computable | Gates e dados estruturáveis; fonte/policy revisadas são pré-condições | Sim; OQ-CCR-001 | DO_NOT_IMPLEMENT_YET |
| CCR-PROP-003 | computable | Gates e dados estruturáveis; fonte/policy revisadas são pré-condições | Sim; OQ-CCR-001, 004 | DO_NOT_IMPLEMENT_YET |
| CCR-PROP-004 | computable | Gates e dados estruturáveis; fonte/policy revisadas são pré-condições | Sim; OQ-CCR-001 | DO_NOT_IMPLEMENT_YET |
| CCR-PROP-005 | clinician_judgment_required | Julgamento, curadoria ou lacuna documental explícita | Sim; OQ-CCR-001, 003 | DO_NOT_IMPLEMENT_YET |
| CCR-PROP-006 | partially_computable | Julgamento, curadoria ou lacuna documental explícita | Sim; OQ-CCR-001, 005 | DO_NOT_IMPLEMENT_YET |
| CCR-PROP-007 | clinician_judgment_required | Julgamento, curadoria ou lacuna documental explícita | Sim; OQ-CCR-005, 006 | DO_NOT_IMPLEMENT_YET |
| CCR-PROP-008 | computable | Gates e dados estruturáveis; fonte/policy revisadas são pré-condições | Sim; OQ-CCR-007 | AUTOMATE_WITH_MISSING_DATA_GUARD |
| CCR-PROP-009 | clinician_judgment_required | Julgamento, curadoria ou lacuna documental explícita | Sim; OQ-CCR-008 | DO_NOT_IMPLEMENT_YET |
| CCR-PROP-010 | partially_computable | Julgamento, curadoria ou lacuna documental explícita | Sim; OQ-CCR-009 | HAND_OFF |
| CCR-PROP-011 | computable | Gates e dados estruturáveis; fonte/policy revisadas são pré-condições | Sim; OQ-CCR-010 | HAND_OFF |
| CCR-PROP-012 | partially_computable | Julgamento, curadoria ou lacuna documental explícita | Sim; OQ-CCR-011 | HAND_OFF |
| CCR-PROP-013 | partially_computable | Julgamento, curadoria ou lacuna documental explícita | Sim; OQ-CCR-012 | HAND_OFF |
| CCR-PROP-014 | partially_computable | Julgamento, curadoria ou lacuna documental explícita | Sim; OQ-CCR-012 | HAND_OFF |
| CCR-PROP-015 | partially_computable | Julgamento, curadoria ou lacuna documental explícita | Sim; OQ-CCR-012 | AUTOMATE_WITH_MISSING_DATA_GUARD |
| CCR-PROP-016 | computable | Gates e dados estruturáveis; fonte/policy revisadas são pré-condições | Sim; OQ-CCR-004, 013 | AUTOMATE_WITH_MISSING_DATA_GUARD |
| CCR-PROP-017 | computable | Gates e dados estruturáveis; fonte/policy revisadas são pré-condições | Sim; OQ-CCR-007, 014 | AUTOMATE_WITH_MISSING_DATA_GUARD |
| CCR-PROP-018 | computable | Gates e dados estruturáveis; fonte/policy revisadas são pré-condições | Sim; OQ-CCR-014 | AUTOMATE_WITH_MISSING_DATA_GUARD |
| CCR-PROP-019 | computable | Gates e dados estruturáveis; fonte/policy revisadas são pré-condições | Sim; OQ-CCR-015 | AUTOMATE_WITH_MISSING_DATA_GUARD |
| CCR-PROP-020 | clinician_judgment_required | Julgamento, curadoria ou lacuna documental explícita | Sim; OQ-CCR-015 | DECISION_SUPPORT_ONLY |
| CCR-PROP-021 | partially_computable | Julgamento, curadoria ou lacuna documental explícita | Sim; OQ-CCR-016 | DECISION_SUPPORT_ONLY |
| CCR-PROP-022 | partially_computable | Julgamento, curadoria ou lacuna documental explícita | Sim; OQ-CCR-010 | HAND_OFF |
| CCR-PROP-023 | computable | Gates e dados estruturáveis; fonte/policy revisadas são pré-condições | Sim; OQ-CCR-017 | AUTOMATE_WITH_MISSING_DATA_GUARD |
| CCR-PROP-024 | computable | Gates e dados estruturáveis; fonte/policy revisadas são pré-condições | Sim; OQ-CCR-017 | AUTOMATE_WITH_MISSING_DATA_GUARD |
| CCR-PROP-025 | clinician_judgment_required | Julgamento, curadoria ou lacuna documental explícita | Sim; OQ-CCR-018, 019 | DECISION_SUPPORT_ONLY |
| CCR-PROP-026 | partially_computable | Julgamento, curadoria ou lacuna documental explícita | Sim; OQ-CCR-018 | DECISION_SUPPORT_ONLY |
| CCR-PROP-027 | computable | Gates e dados estruturáveis; fonte/policy revisadas são pré-condições | Sim; OQ-CCR-004, 017 | AUTOMATE_WITH_MISSING_DATA_GUARD |
| CCR-PROP-028 | computable | Gates e dados estruturáveis; fonte/policy revisadas são pré-condições | Sim; OQ-CCR-013, 017 | AUTOMATE_WITH_MISSING_DATA_GUARD |
| CCR-PROP-029 | partially_computable | Julgamento, curadoria ou lacuna documental explícita | Sim; OQ-CCR-008, 013, 020 | DO_NOT_IMPLEMENT_YET |
| CCR-PROP-030 | partially_computable | Julgamento, curadoria ou lacuna documental explícita | Sim; OQ-CCR-014, 020 | DECISION_SUPPORT_ONLY |
| CCR-PROP-031 | partially_computable | Julgamento, curadoria ou lacuna documental explícita | Sim; OQ-CCR-012, 017 | DECISION_SUPPORT_ONLY |
| CCR-PROP-032 | partially_computable | Julgamento, curadoria ou lacuna documental explícita | Sim; OQ-CCR-012, 017 | DECISION_SUPPORT_ONLY |
| CCR-PROP-033 | partially_computable | Julgamento, curadoria ou lacuna documental explícita | Sim; OQ-CCR-012, 017 | DECISION_SUPPORT_ONLY |
| CCR-PROP-034 | computable | Gates e dados estruturáveis; fonte/policy revisadas são pré-condições | Sim; OQ-CCR-013, 021 | AUTOMATE_WITH_MISSING_DATA_GUARD |
| CCR-PROP-035 | partially_computable | Julgamento, curadoria ou lacuna documental explícita | Sim; OQ-CCR-021 | DO_NOT_IMPLEMENT_YET |
| CCR-PROP-036 | clinician_judgment_required | Julgamento, curadoria ou lacuna documental explícita | Sim; OQ-CCR-018, 021 | DECISION_SUPPORT_ONLY |
| CCR-PROP-037 | partially_computable | Julgamento, curadoria ou lacuna documental explícita | Sim; OQ-CCR-007, 017 | DECISION_SUPPORT_ONLY |
| CCR-PROP-038 | clinician_judgment_required | Julgamento, curadoria ou lacuna documental explícita | Sim; OQ-CCR-011 | HAND_OFF |
| CCR-PROP-039 | partially_computable | Julgamento, curadoria ou lacuna documental explícita | Sim; OQ-CCR-016, 020 | DECISION_SUPPORT_ONLY |
| CCR-PROP-040 | partially_computable | Julgamento, curadoria ou lacuna documental explícita | Sim; OQ-CCR-012, 017 | HAND_OFF |
| CCR-PROP-041 | partially_computable | Julgamento, curadoria ou lacuna documental explícita | Sim; OQ-CCR-005, 015 | DECISION_SUPPORT_ONLY |
| CCR-PROP-042 | partially_computable | Julgamento, curadoria ou lacuna documental explícita | Sim; OQ-CCR-013, 020 | AUTOMATE_WITH_MISSING_DATA_GUARD |
| CCR-PROP-043 | partially_computable | Julgamento, curadoria ou lacuna documental explícita | Sim; OQ-CCR-022 | DECISION_SUPPORT_ONLY |
| CCR-PROP-044 | partially_computable | Julgamento, curadoria ou lacuna documental explícita | Sim; OQ-CCR-022 | DECISION_SUPPORT_ONLY |
| CCR-PROP-045 | clinician_judgment_required | Julgamento, curadoria ou lacuna documental explícita | Sim; OQ-CCR-019, 023 | DO_NOT_IMPLEMENT_YET |
