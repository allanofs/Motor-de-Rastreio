# 01 — Censo de fontes CCR — consolidado pós-auditoria

**Corte clínico original:** 23/10/2026. **Auditoria/consolidação:** 24/10/2026.

A pesquisa dirigida localizou **27 documentos candidatos distintos**. O censo original integral permanece preservado no commit `9c12ba39ac70ef94016c11eccf58ad90a71d9241`. Este arquivo registra o status necessário para a especificação consolidada.

## Fontes brasileiras governantes ou corroboradoras

| ID | Fonte | Status consolidado | Papel no piloto |
|---|---|---|---|
| B03 | Conitec/INCA — Diretrizes Brasileiras do Rastreamento CCR — CP20/2026 | `PRELIMINARY` | não promover detalhes alteráveis; útil para rastreabilidade da proposta |
| B05 | Conitec — Ata 152ª reunião/2026 | `FINAL_DELIBERATION_RECORD` | confirma deliberação pós-CP e que houve ajustes; não substitui o texto final integral |
| B08 | PCDT Adenocarcinoma de Cólon e Reto — 2025 | `FINAL_ACTIVE_WITHIN_SCOPE` | doença estabelecida/diagnóstico; não governa screening populacional |
| B12 | MS/SAES — Protocolo de Acesso às OCI em Oncologia — 2026 | `FINAL_TECHNICAL; operational_scope` | confirma núcleo SUS: FIT bienal, 50–75, FIT+→colonoscopia |
| B06 | Portaria SAES/MS 4.642/2026 | `SUPERSEDED/ADMINISTRATIVE` | histórico administrativo; não usar como cadastro atual |
| B07 | Portaria SAES/MS 5.215/2026 | `ADMINISTRATIVE; corroborated` | CONASEMS/espelhos corroboram substituição de B06; código administrativo não é input clínico do piloto |
| B09–B11 | comunicações INCA/MS 2026 | `COMMUNICATION_ONLY` | implantação, características gerais do FIT e rollout; não substituem guideline completa |

### Links principais

- B03: https://www.gov.br/conitec/pt-br/midias/consultas/relatorios/2026/relatorio-preliminar-diretrizes-brasileiras-do-rastreamento-do-cancer-de-colon-e-reto-cp-20/@@display-file/file
- B05: https://www.gov.br/conitec/pt-br/midias/reuniao_conitec/2026/ata-da-152o-reuniao-da-conitec_pcdt_site/@@display-file/file
- B08: https://www.gov.br/conitec/pt-br/midias/protocolos/adenocarcinoma-de-colon-e-de-reto-pcdt/@@display-file/file
- B12: https://www.gov.br/saude/pt-br/composicao/saes/agora-tem-especialistas/publicacoes/protocolo-de-acesso-as-ofertas-de-cuidados-integrados-em-oncologia.pdf/@@download/file
- B07 DOU identificado: https://www.in.gov.br/web/dou/-/portaria-saes/ms-n-5.215-de-22-de-outubro-de-2026-739944058

## Sociedades brasileiras

| ID | Fonte | Status | Papel |
|---|---|---|---|
| S01 | SBOC — Diretrizes 2026, Cólon doença localizada, v6 FINAL | `FINAL_SOCIETY` | somente seção explícita de prevenção/rastreamento; sustenta BA-A, colonoscopia 10 anos e faixa/intervalos descritos |
| S03 | SBCP — posicionamento 2023 | `COMMUNICATION_ONLY` | apoio contextual para avaliação a partir de 45; não guideline completa |
| S02/S04/S05/S06 | versões históricas, colaboração ou comunicação | histórico/suplementar | não governam regras do piloto |

S01: https://sboc.org.br/wp-content/uploads/2026/04/Diretrizes-SBOC-2026-C%E2%94%9C%E2%94%82lon-doen%E2%94%9Coa-localizada-v6-VERS%E2%94%9CaO-FINAL.pdf

## Fontes internacionais

| ID | Fonte | Status pós-auditoria | Papel aprovado |
|---|---|---|---|
| I01 | USPSTF — CRC Screening 2021 | `FINAL_CURRENT_LOCATED` | governante populacional da policy Internacional |
| I02 | ACS — update 2026 | `FINAL_CURRENT_LOCATED` | alternativa/comparação; não governante do piloto Internacional A |
| I03 | ACG — CRC Screening 2021 | `FINAL_CURRENT_LOCATED` | complemento explícito para história familiar na policy Internacional |
| I04 | USMSTF — FIT 2017 | `FINAL; PRIMARY_ACCESS_CONFIRMED` | FIT+→colonoscopia; não resolver FIT+ repetindo FIT; contexto de FIT+ após colonoscopia prévia |
| I05 | USMSTF — follow-up colonoscopy/polypectomy 2020 | `FINAL; PRIMARY_ACCESS_CONFIRMED` | colonoscopia normal high-quality→10 anos, inclusive independentemente da indicação, salvo exceções de maior risco |
| I06 | USMSTF — bowel preparation 2025 | `FINAL; PRIMARY_ACCESS_PARTIAL` | colonoscopia inadequada não fecha episódio; prazos permanecem decision support, não deadline automático |
| I07 | USMSTF — idade 2022 | `FINAL_UPDATE; supplemental` | não governante escolhido |
| I08 | ACG statement 2026 | `SOCIETY_STATEMENT` | novos testes fora do piloto |

Links:
- I01: https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening
- I03: https://medicine.uams.edu/familymedicine/wp-content/uploads/sites/7/2021/07/ACG_Clinical_Guidelines__Colorectal_Cancer.14.pdf
- I04: https://www.asge.org/home/resources/publications/guidelines/fecal-immunochemical-testing-for-colorectal-neoplasia
- I05: https://www.asge.org/home/resources/publications/guidelines/recommendations-for-follow-up-after-colonoscopy-and-polypectomy-a-consensus-update-by-the-us-multi-society-task-force-on-colorectal-cancer
- I06: https://www.asge.org/home/resources/publications/guidelines/optimizing-bowel-preparation-quality-for-colonoscopy--consensus-recommendations-by-the-us-multi-society-task-force-on-colorectal-cancer

## Bloqueios remanescentes

1. **Texto final integral brasileiro pós-CP e portaria conjunta específica:** ainda não confirmado. Isso bloqueia a agenda SUS após FIT+→colonoscopia normal e metadados dependentes do texto final; não bloqueia o núcleo FIT 50–75/bienal/FIT+→colonoscopia.
2. **I06 integral/exceções:** acesso ainda não é necessário para automatizar deadlines porque o piloto deliberadamente não os automatiza.
3. **Cadastro administrativo B07:** forte corroborado, mas não é requisito clínico do piloto.

Não concluir inexistência a partir de busca negativa. Fonte `FINAL` não significa interpretação aprovada; a aprovação da especificação está registrada nos documentos de revisão.