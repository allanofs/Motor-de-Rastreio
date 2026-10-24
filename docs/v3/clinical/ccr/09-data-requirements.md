# 09 — Dados mínimos e perguntas humanas — consolidado

Status: reviewed_by_1 em 24/10/2026.

Princípio: coletar apenas o que muda a decisão. Required significa necessário para determinada conclusão, não formulário universal obrigatório.

| Dado | Quando necessário | Se desconhecido |
|---|---|---|
| policy | sempre | pedir escolha; nunca misturar policies |
| asOf | sempre | erro de controle |
| idade em anos | elegibilidade etária | esclarecer; nascimento completo só se necessário |
| confirmação de contexto preventivo profissional | entrada do módulo | abster: fora do escopo |
| CRC prévio | classificação de risco | revisão |
| pólipo/seguimento prévio | classificação de risco | buscar informação; não presumir normal |
| DII conhecida | classificação de risco | revisão quando decisivo |
| síndrome hereditária conhecida/suspeita | classificação de risco | revisão |
| história familiar básica | classificação da estratégia | unknown não vira “não”; indicação mínima pode continuar conhecida |
| grau/número de familiares | se história familiar positiva | revisão se insuficiente |
| idade do diagnóstico familiar | se limiar familiar depende disso | revisão |
| CRC versus pólipo avançado no familiar | se necessário para ACG | não classificar todo pólipo como avançado |
| histórico de screening CCR | status atual | unknown não vira never_performed |
| modalidade do evento | quando exame é informado | esclarecer |
| data/precisão | agenda e ordem | preservar precisão parcial; não inventar dia |
| resultado FIT final | para qualificar | pending/unknown não é negativo |
| validade do FIT | para qualificar | sem qualifying event automático |
| valor/unidade/dispositivo FIT | opcional | não reinterpretar; preferir laudo categórico |
| colonoscopia completa | fechar FIT+ ou ancorar screening | não inferir completude |
| preparo adequado | mesmo contexto | unknown não é adequate |
| resultado colonoscopia | mesmo contexto | resultado insuficiente não fecha episódio |
| pólipo/lesão/AP pendente | quando presente | revisão; sem surveillance automática |
| vínculo temporal com FIT+ | resolução longitudinal | ordem/vínculo incertos não fecham episódio |
| saúde/histórico/preferência | 76–85 e decisões compartilhadas | julgamento clínico; sem calculadora automática |
| disponibilidade/rota local | operacionalização | clarificar; não alterar evidência |
| cuidado efetivamente assumido | marcar HandedOff | encaminhamento/agendamento não bastam |

## História familiar em etapas

Pergunta inicial: algum familiar teve câncer colorretal ou pólipo avançado? Respostas: sim / não / não sei.

Se sim, coletar apenas o necessário: relação (FDR/SDR), número de FDR, idade aproximada ao diagnóstico e tipo de lesão. Para Internacional/ACG isso permite distinguir os subgrupos aprovados. Para SUS/BA-A, história positiva continua em revisão, sem importar automaticamente o algoritmo ACG.

## Colonoscopia mínima

Quando uma colonoscopia for usada para encerrar FIT+ ou sustentar Current, registrar:

- data/precisão;
- completa: sim/não/unknown;
- preparo adequado: sim/não/unknown;
- resultado: normal / pólipo-lesão / câncer / AP pendente / unknown;
- relação com o FIT+ quando clinicamente necessária.

Não exigir upload de PDF. Informação profissional suficiente é aceita; relato leigo isolado não fecha follow-up automaticamente.

## O que não coletar como gate rotineiro

Não coletar checklist de sintomas, sexo, raça, ocupação, município, escolaridade, IMC, tabagismo ou dieta para personalizar intervalos sem regra explícita da policy. O Motor não é triador de sintomas nem cadastro administrativo de paciente.

## Unknown e never_performed

- “não” é resposta conhecida;
- “não sei” é unknown;
- ausência de pergunta é not_asked;
- never_performed é global para screening CCR e só pode ser usado quando explicitamente confirmado;
- colonoscopia existente + “nunca FIT” não é never_performed global.

História conhecida não precisa ser exaustiva por toda a vida; precisa ser suficiente para a decisão e não esconder gatilho positivo conhecido não resolvido.