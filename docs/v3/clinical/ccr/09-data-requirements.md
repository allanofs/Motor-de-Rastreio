# 09 — Dados mínimos e perguntas futuras (sem UI)

**awaiting_clinical_review.** Campos clínicos são conceitos humanos, não adição de schema. Cada decisão tem dependências próprias. required significa necessário para aquela conclusão, não formulário inteiro obrigatório para toda pessoa.

## Matriz de coleta mínima

| Dado | Necessidade / quando | Consequência decisória / fonte | Pergunta humana proposta | Se desconhecido |
|---|---|---|---|---|
| Policy escolhida | required para qualquer recomendação | Define fonte, população e intervalo; P0 01/P0 23/P0 36 | “Qual referencial está sendo utilizado nesta avaliação?” | Não misturar; pedir escolha |
| asOf | required | Data explícita da consulta, Foundation | “Data desta avaliação” | Erro de controle; nenhum relógio implícito |
| Idade em anos | required para convite habitual | Gates B12/I01; P0 04/P0 24 | “Qual sua idade atual?” | Esclarecer; não pedir nascimento completo automaticamente |
| Data de nascimento | optional/conditional | Só se necessária para resolver fronteira etária ou validar idade | “Precisamos confirmar quando completou esta idade?” | Idade suficiente pode bastar; não inventar dia |
| Sintomas relevantes | required para concluir assintomático | B08 §3.1/B12 p.18; P0 10 | “Tem sangue visível nas fezes, mudança persistente do intestino, perda de peso sem explicação ou outro sinal que já motivou investigação?” | Não rotular assintomático; avaliar dado faltante |
| Anemia ferropriva inexplicada | conditional à informação clínica disponível | B08/B12; P0 10 | “Há diagnóstico de anemia por falta de ferro sem causa esclarecida?” | Revisão se houver suspeita; não coletar painel laboratorial de todos |
| CCR prévio | required para rotina habitual | B08/I01; P0 11 | “Já teve diagnóstico de câncer de cólon ou reto?” | Indeterminate/revisão |
| Pólipo prévio/seguimento | required triagem para rotina | B03/I05; P0 12 | “Já retirou pólipo ou recebeu orientação de repetir colonoscopia por um achado?” | Buscar laudo; não presumir normal |
| DII | required triagem de risco; detalhes conditional | B08/I01; P0 13 | “Tem doença de Crohn ou retocolite diagnosticada?” | Revisar; não equiparar síndrome do intestino irritável |
| Síndrome hereditária conhecida/suspeita | required triagem, detalhe conditional | B08/I01; P0 14 | “Você ou alguém da família tem Lynch, polipose ou outra predisposição hereditária conhecida?” | Não confirmar alto risco nem ausência por inferência |
| História familiar básica | required proposta para risco habitual | I03/S01; P0 15 | “Algum familiar teve câncer intestinal ou pólipo avançado? Sim/Não/Não sei/Não perguntei.” | Missing decision-critical information |
| Grau/número de familiares | conditional se triagem positiva | I03 rec.9–12; P0 31–033 | “Pai/mãe/irmão/filho ou outro parente? Quantos?” | Revisão em vez de aplicar 5 anos genericamente |
| Idade do diagnóstico familiar | conditional, limiares clínicos | I03/S01 | “Com quantos anos recebeu o diagnóstico? Sabe se foi antes dos 60?” | Revisão; faixa suficiente quando resolve limiar, sem exigir data de nascimento do familiar |
| Câncer versus pólipo avançado familiar | conditional | I03 subgrupos | “Era câncer ou pólipo? Há laudo que diga avançado?” | Não classificar todo pólipo como avançado |
| Histórico de algum exame de CCR | required para decisão de rotina/ausência | P0 16–020; Foundation historyKnowledge | “Já fez exame de fezes para screening ou colonoscopia? Sim/Não/Não sei.” | unknown; se nem perguntado, not_asked derivado |
| Histórico por modalidade | conditional à estratégia/cronologia | P0 28–030 e FG01 | “Nunca fez FIT, mas já fez colonoscopia?” | Não registrar never_performed global incorretamente |
| Evento: modalidade e realização | conditional se exame mencionado | B12/I01 | “Qual exame foi feito? Foi apenas pedido ou foi realizado?” | Pedido não é exame realizado |
| Evento: data e precisão conhecida | conditional para agenda/ordem | P0 16/P0 29; calendário Foundation | “Quando? Pode informar só o ano/mês se não souber o dia.” | Janela/Indeterminate; não exigir precisão sem efeito |
| Evento: resultado final/pendente/inválido | conditional | P0 16–020 | “O resultado já saiu? Positivo/negativo, inválido, pendente ou desconhecido?” | Não converter pendente/unknown em negativo |
| Laudo categórico FIT/validade da amostra | conditional se pretende qualificar FIT | B03/I04 + guarda CCR-PROP-016 | “O laboratório aceitou a amostra e liberou resultado final?” | Sem qualifying event automático |
| Valor/unidade/dispositivo FIT | optional; conditional só se interpretar número | P0 07/OQ-CCR-005 | Preferir laudo final; não pedir valor bruto sem necessidade | Não reclassificar nem converter por fórmula universal |
| Colonoscopia até o ceco/completude | conditional se encerrar investigação/ancorar | I05 Table 3; P0 42 | “O laudo diz exame completo até o ceco?” | Não inferir completa pelo procedimento |
| Preparo adequado | conditional ao mesmo cenário | I05/I06 | “O laudo classificou o preparo como adequado para avaliação?” | Não tratar unknown como adequate |
| Achado normal/pólipo/lesão e AP | conditional ao exame | I05/B03 rec.8; P0 22/P0 38 | “O laudo estava normal? Houve pólipo, lesão ou biópsia ainda pendente?” | Resultado insuficiente; não fechar episódio |
| Ressecção completa/histologia/tamanho/número | conditional se achado exige decisão especializada | I05 Tables 4–5 | Primeiro pedir laudo; detalhes apenas se houver módulo que os utilize | Revisão; piloto não coleta catálogo histológico para todos |
| Indicação e vínculo com FIT+ | conditional para resolução longitudinal | I04/I05 + guarda CCR-PROP-029 | “Essa colonoscopia foi feita depois e para investigar aquele teste positivo?” | Cronologia/episódio não demonstrados |
| Saúde/benefício e preferência | conditional à decisão individualizada; preferência sempre pode mudar oferta | I01/I02/S01; P0 25/P0 36 | “Quer discutir benefícios e riscos? Há condição que limite realizar investigação ou tratamento?” | Julgamento clínico, não calculadora implícita de sobrevida |
| Radioterapia abdominal/pélvica | conditional se opção ACS/alto risco adotada | I02 Table 1 nota b; P0 40 | “Já recebeu radioterapia nessa região para tratar outro câncer?” | Não coletar como gate universal SUS sem curadoria |
| Recurso e rota local | conditional a ação operacional | B12; P0 43–044 | “FIT/colonoscopia está disponível? Há encaminhamento/regulação?” | unknown→clarificar; não alterar evidência |
| Destino/cuidado efetivamente assumido | conditional para HandedOff | P0 11/P0 22 | “Quem já assumiu o seguimento? Há confirmação do atendimento?” | Encaminhamento recomendado não é handoff concluído |

## Dados dispensáveis no núcleo

Sexo não muda a faixa/intervalo das propostas populacionais selecionadas; não é required. Raça, ocupação, município, escolaridade, IMC, tabagismo e dieta não são entradas para personalizar automaticamente estes intervalos. A fonte pode reconhecer risco populacional sem fornecer regra que justifique coletar o dado neste piloto. Não coletar CPF/CNS do procedimento administrativo: a Foundation não registra pacientes nem fatura SUS.

Qualidade da colonoscopia não é pergunta universal de elegibilidade para quem nunca fez exame. Histologia detalhada não é requerida para decidir “necessita revisão de achado prévio”. Nascimento completo não é necessário se idade já resolve a decisão.

## Unknown, no e not_asked

“Não” é resposta conhecida; “não sei” éunknown; “não perguntei” é ausência de informação, não negação. Patient.historyKnowledge tem known/never_performed/unknown; not_asked é derivado em resolveDomainHistory quando a chave não foi fornecida. Não propor um valor que o schema não aceita.

historyKnowledge known não certifica que todo o passado foi completamente interrogado. A especificação precisa de confirmação humana de que não há gatilho positivo conhecido pendente; essa guarda deve existir como conceito clínico revisável, não concluir ausência apenas por array vazio.

## Proveniência e evidence records

Manter IDs estáveis dos registros fornecidos, laudo/origem quando disponível e precisão declarada da data. Um futuro resolver de sequência declarará IDs de FIT+ e colonoscopia resolutiva, ambos no snapshot. Não promover registro apenas considerado a evidência usada; não inventar evento para justificar Current. A data de laudo versus coleta continua OQ-CCR-004 e não foi resolvida silenciosamente.
