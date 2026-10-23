# Relatório final — Fase 5 documental de CCR

Data de corte e verificação: 23/10/2026. Base congelada: `8c6335602868d29f4dd43d5a6d8e06ad10e01f21`. Branch **local**: `v3-ccr-clinical-spec`, criada a partir do HEAD remoto de `v3-foundation-technical`. O envio externo e a nova PR estão bloqueados; a PR #1 permanece inalterada.

## Resultado

16 documentos Markdown apenas em docs/v3/clinical/ccr. Pesquisa e especificação, sem RuleDefinition real, DomainResolver clínico, teste clínico executável, alteração de engine/schema/testes/pacotes/workflow, UI, backend ou persistência. Nenhuma proposição aprovada.

| Entrega | Total / situação |
|---|---|
| Fontes distintas candidatas localizadas |27: 7 oficiais finais/atos; 2 preliminares/registros de consulta; 6 sociedades brasileiras; 8 internacionais; 4 suplementares/comunicações |
| Ressalva dos 7 oficiais/atos | B06 lido em reprodução e B07 identificado sem primário autenticado; não são 7 diretrizes clínicas finais verificadas |
| Clinical questions |32 |
| Proposições candidatas |45, todas awaiting_clinical_review |
| Candidate clinical cases |60, sem expected aprovado |
| Questões abertas |23: 14 P0 e 9 P1; módulos P2 adiados |
| Foundation gaps/limites |4: 2 candidatos e 2 limitações confirmadas, sem redesign |
| Documento principal |14-clinical-review-packet.md, autossuficiente para decisões essenciais |

## Ordem executada

5A censo →5B autoridade →5C perguntas →5D proposições →5E políticas →5F sequências →5G dados/recursos →5H divergências →5I casos/pesquisa adversarial →5J pacote de revisão.

Busca dirigida em fontes primárias brasileiras e internacionais; detalhes/URLs em 01. Documentos de terceiros não foram reproduzidos integralmente. PDFs principais brasileiros, SBOC e ACG tiveram trechos de fluxo/tabela inspecionados visualmente; não confundir indexação com leitura integral. As fontes I04–I06 são acesso parcial declarado.

## Pesquisa adversarial: mudanças de conclusão registradas

| Leitura inicial / hipótese | Evidência encontrada | Conclusão corrigida e impacto |
|---|---|---|
| Apenas relatório preliminar e anúncios poderiam indicar estágio da política | Ata 152, B05, registra deliberação pós-CP e alterações | Deliberação confirmada; texto final integral e portaria específica ainda não. Não chamar minuta de final |
|10 anos da minuta poderiam resolver toda agenda após FIT+ | Figura 1 versus texto da rec.8 e B05 informam fluxo revisado | Resolução diagnóstica e novo clock separados; próxima agenda SUS bloqueada |
| Inclusão FIT de agosto poderia ser o último ato | B07 relatado com publicação no próprio corte, tornando B06 sem efeito | Cadastro atual precisa DOU primário; 502 impediu autenticação. Código antigo não é assumido como vigente |
| SBOC arquivo recente poderia ser versão final | Primeiro arquivo era v3 para colaboração; depois localizada v6 FINAL de 18/05 | Governante candidato passa a S01 final; S02 continua registrado como versão anterior |
| ACS 2018 poderia bastar | Guideline ACS2026, atualização confirmada no artigo e portal | Opção ACS é 2026; novidades delimitadas fora do piloto, sem transportá-las a USPSTF |
| Qualquer repetição de colonoscopia inadequada poderia ter 12 meses | Trecho primário I06 distingue teste não colonoscópico anormal, em geral 3 meses | Não usar 12 meses como prazo universal pós-FIT+; sem transposição automática ao SUS |
| SBCP notícia ACP implicaria adoção dos 50 | Parágrafos finais S03 mantêm orientação médica desde 45 e mencionam comissão | Não apresentar ACPcomo posição adotada integralmente pela SBCP |
| Prazo 30 dias seria uma invenção completa ou norma inequívoca | B05 menciona referência de indicador em desenvolvimento; B02 discute OCI | Há referência documental; sua natureza é distinta de deadline normativo universal |
| Fonte final para screening não recuperada significaria ausência de qualquer documento final aplicável | B12 protocolo OCI2026 confirma núcleo e encaminhamento | Núcleo tem apoio técnico final independente; lacuna pós-colonoscopia permanece |

Mudanças são de estado do conhecimento da pesquisa, não versões aprovadas de regra.

## Status das policies

| Policy | Status documental | Recomendação do Work | Bloqueios principais |
|---|---|---|---|
| SUS | Parcialmente especificada, núcleo corroborado por B12; não ativável automaticamente | Preservar fonte oficial por escopo e lacunas | Texto final/aprovação específica; fluxo pós-normal; fronteira 75; cadastro DOU |
| Brasil ampliado | BA-A/BA-B/BA-C propostas, nenhuma aprovada | BA-A com escolhas brasileiras explícitas e revisão nas lacunas | Escolha 1–2 anos/início; complemento de seguimento; definição familiar |
| Internacional | A/USPSTF e B/ACS 2026 com complementos identificados | Apara piloto pequeno, sem aprovação implícita | Governante humano e conferência integral de I04–I06 |

## Não automatizar e revisão humana

Prioridades: autenticar fontes críticas; escolher curadorias; aprovar critérios de risco e dados mínimos; distinguir resolução de agenda; aprovar limite de pólipos; decidir qualidade/âncora/idoso; revisar expected diretamente na fonte. Nada foi marcado active ou reviewed_by_1 como dado clínico.

Não automatizar surveillance completa, genética, benefício individual, repetição de inválido sem instrução, conversão universal de FIT, prazo único pós-positivo, ordem do mesmo dia, fecho por registro antigo/inadequado ou substituição por recurso local. FG01–04 não autorizam redesign da Foundation.

## Preservação e verificação

Base local sincronizada por leitura/fetch antes de criar a branch nova; a branch Foundation não recebeucommit ou atualização nesta fase. Todas as mudanças da nova branch devem estar exclusivamente neste diretório. Verificações da entrega: contagem e integridade de IDs/referências/links internos; somente Markdowndocumental; diff contra 8c63356; blob V2 inalterado; PRnova emdraft e base Foundation; PR#1 inalterada.

Execução local concluída: `npm ci` e `npm run check` passaram, incluindo typecheck, schema checks (62 casos), suíte completa (242/242) e build ES de 170,21 kB (gzip 42,27 kB). O blob V2 permanece `e40c75c5c877c00a94c932cdbe5bd33a5afa71b9`. IDs, campos obrigatórios das 45 proposições, 60 casos, links internos e escopo do diff foram conferidos. Nenhum teste clínico foi criado; teste técnico verde não equivale a revisão clínica.

## Bloqueio do envio externo e estado exato

A revisão automática rejeitou a ação combinada de commit/envio dos documentos para nova branch pública. Motivo declarado: as instruções anteriores na conversa proibiam nova branch/publicação, e a autorização posterior estava apenas no anexo, classificado pelo revisor como contexto não confiável. Não foi tentado contornar a rejeição por outro canal.

O commit documental local `a939dca7413042dbb37ff224b49ef007472f9f11` foi criado antes do bloqueio do envio. A conferência somente leitura com `git ls-remote` mostrou **ausência de v3-ccr-clinical-spec no remoto**, Foundation em `8c6335602868d29f4dd43d5a6d8e06ad10e01f21` e main em `7a6555373c05fa02f26f594bb8666364130ef2f2`. A PR #1 continua aberta, draft, não mesclada, com mesmo HEAD/título. **Não há nova PR nem CI remoto desta Fase 5.** Os arquivos completos estão disponíveis localmente para revisão.

Para concluir o envio e abrir a PR, é necessária autorização explícita na conversa para superar a rejeição; isso não equivale a aprovação clínica das proposições. O título e escopo já estão preparados:

| Campo da PR proposta | Conteúdo |
|---|---|
| Título | docs(v3): especificação clínica de CCR para revisão humana — Fase 5 |
| Head | v3-ccr-clinical-spec |
| Base | v3-foundation-technical |
| Estado | draft |
| Mudanças | Somente os 16 documentos deste diretório; Foundation/V2/PR #1 inalteradas |
| Descrição preparada | Pesquisa com corte23/10/2026:27 fontes candidatas,32 perguntas,45 proposições awaiting_clinical_review e60 casos documentais. Curadorias SUS/BA/Internacional propostas,14P0 e4 gaps/limites; bloqueios de fonte explícitos. Nenhum código clínico, teste novo, merge ou deploy. Revisar primeiro14-clinical-review-packet.md. Checks locais242/242; CI remoto a executar após envio autorizado. |

Além do bloqueio operacional do GitHub, persistem as questões clínicas/documentais P0 descritas no pacote. A preparação da documentação foi concluída; a entrega externa por PR está pendente de autorização.

**Parada obrigatória: Fase 5 documental. Sem implementação clínica, merge ou publicação.**
