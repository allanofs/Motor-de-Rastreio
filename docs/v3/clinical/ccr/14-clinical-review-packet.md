# 14 — Clinical review packet — resultado da primeira revisão humana

**Data:** 24/10/2026. **Status:** primeira revisão concluída; pacote pronto para consolidação pré-Fase 6.

## Escopo aprovado do produto

1. V3 é clinical decision support para **uso profissional**.
2. Não é ferramenta autônoma de paciente, triagem, diagnóstico ou urgência.
3. O profissional confirma que o módulo está sendo usado em contexto preventivo apropriado.
4. Quando houver mais de uma estratégia válida, a escolha é humana; o Motor calcula status/intervalo e explica a evidência.
5. Disponibilidade local altera operacionalização, não indicação/evidência.

## Policy SUS aprovada

- 50–75 anos inclusive;
- FIT como estratégia nuclear;
- FIT final negativo válido → 2 anos;
- anchor na coleta/realização;
- FIT+ → colonoscopia;
- sem deadline universal após FIT+;
- invalid/pending não qualificam;
- ≥76 fora de nova rotina, mas follow-up aberto persiste;
- agenda após FIT+→colonoscopia normal permanece bloqueada até fonte brasileira final suficiente.

## Brasil ampliado BA-A aprovada

- <45: sem rotina automática average-risk;
- 45–49: decisão compartilhada/revisão;
- 50–75: FIT bienal default;
- colonoscopia primária q10 como estratégia alternativa escolhida;
- sem mistura automática de fontes internacionais.

## Internacional aprovada

Governante populacional: USPSTF.

- 45–49: screening, Grade B;
- 50–75: screening, Grade A;
- 76–85: seletivo/compartilhado, Grade C;
- >85: não continuar screening habitual;
- FIT anual ou colonoscopia q10 como estratégias escolhidas pelo humano;
- ACG complementa história familiar;
- USMSTF complementa FIT+ e colonoscopia high-quality.

## História familiar

- unknown nunca vira ausência;
- unknown pode impedir estratégia definitiva, mas não necessariamente apagar indicação mínima por idade/policy;
- coleta em etapas: familiar, grau, número, idade ao diagnóstico e CRC/pólipo avançado quando necessário;
- Internacional/ACG:
  - 1 FDR <60 ou ≥2 FDR → colonoscopia aos 40/10a antes, q5;
  - 1 FDR ≥60 → iniciar aos 40/10a antes e depois average-risk;
  - 1 SDR isolado → average-risk se sem outros modificadores;
- SUS/BA-A: história familiar positiva relevante → revisão, sem importação silenciosa do ACG.

## Colonoscopia e resolução longitudinal

Informação profissional suficiente substitui exigência de upload de PDF. Para encerrar FIT+ automaticamente é preciso saber que o exame foi posterior, completo, com preparo adequado, resultado final suficiente e sem pendência relevante.

- normal high-quality resolve FIT+;
- Internacional → q10 se sem exceções de maior risco;
- SUS → nova agenda não automatizada ainda;
- inadequada/incompleta → follow-up continua;
- pólipo/lesão/AP pendente → revisão;
- FIT− posterior nunca resolve FIT+.

## Estados e histórico

- Current somente com qualifying event válido dentro do intervalo e sem gatilho aberto;
- Due com intervalo expirado ou never_performed realmente confirmado;
- não criar Overdue genérico sem fonte;
- never_performed é global para CCR;
- unknown/not_asked não viram Due por presunção;
- histórico suficiente para a decisão basta; não exigir prontuário vitalício completo;
- HandedOff somente com transferência efetiva de cuidado.

## Limites deliberados

Fora do piloto automático:

- sintomas/urgência/diagnóstico;
- surveillance pós-polipectomia completa;
- Lynch/FAP/DII automatizados;
- novos testes sanguíneos/RNA/CTC;
- geografia e cadastro persistente;
- deadlines rígidos de preparo inadequado/FIT+ sem base específica da policy.

## Auditoria das proposições

- 24 `APPROVED_R1`;
- 15 `APPROVED_R1_MODIFIED`;
- 1 `REJECTED_REPLACED` (PROP-010, sintomas → gate 17B);
- 4 `DOCUMENTARY_ONLY`;
- 1 `PHASE6_TECHNICAL_GATE`.

Ver `04-proposition-register.md`.

## Gates antes da Fase 6 clínica

1. este commit documental deve tocar somente `docs/v3/clinical/ccr/**`;
2. PR #2 continua Draft e baseia-se em `v3-foundation-technical`;
3. nenhuma alteração da Foundation nesta consolidação;
4. Fase 6 deve primeiro provar representabilidade de history/follow-up/current com a Foundation existente;
5. qualquer contraexemplo arquitetural deve ser apresentado isoladamente antes de mudar schema/engine;
6. segunda revisão médica independente é necessária antes de release clínico público.

## Pendências que NÃO exigem nova decisão do autor agora

- localizar texto final brasileiro pós-CP;
- autenticar detalhes administrativos B07 quando necessários;
- ler integralmente I06 caso se pretenda automatizar prazos;
- mapear rota operacional local;
- executar prova técnica da Fase 6.

Nenhuma nova decisão clínica vital está pendente nesta primeira revisão.