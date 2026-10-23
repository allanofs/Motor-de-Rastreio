# Relatório final — Fase 5 documental de CCR

Data de corte e verificação: 23/10/2026. Base congelada: `8c6335602868d29f4dd43d5a6d8e06ad10e01f21`. Branch: v3-ccr-clinical-spec, criada a partir do HEAD remoto de v3-foundation-technical. PR pretendida: rascunho empilhado para essa mesma branch base, sem modificar PR#1.

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

Base local sincronizada por leitura/fetch antes de criar a branch nova; a branch Foundation não recebeucommit ou atualização nesta fase. Todas as mudanças da nova branch devem estar exclusivamente neste diretório. Verificações da entrega: contagem e integridade de IDs/referências/links internos; somente Markdowndocumental; diff contra 8c 63356; blob V2 inalterado; PRnova emdraft e base Foundation; PR#1 inalterada.

O CI existente pode executar os 242 testes da Foundation na nova PR, sem modificação dos testes. Resultados de execução remota e identificadores dos commits/PR são conferidos e entregues na mensagem final; o arquivo não se declara aprovado por antecipação. Nenhum teste clínico foi criado e teste técnico verde não equivale a revisão clínica.

**Parada obrigatória: Fase 5 documental. Sem implementação clínica, merge ou publicação.**
