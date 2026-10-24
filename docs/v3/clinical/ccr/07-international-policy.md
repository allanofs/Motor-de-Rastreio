# 07 — Policy Internacional — consolidada

**Status:** `reviewed_by_1` em 24/10/2026.

## Governante populacional

A policy Internacional aprovada usa **USPSTF 2021** como governante populacional. ACS 2026 permanece alternativa comparativa, não governante desta policy.

## Faixas etárias

| Faixa | Resultado |
|---|---|
| <45 | sem screening populacional de rotina average-risk |
| 45–49 | screening recomendado — USPSTF Grade B |
| 50–75 | screening recomendado — USPSTF Grade A |
| 76–85 | decisão seletiva/compartilhada — Grade C; considerar saúde, histórico e preferências |
| >85 | não iniciar/continuar screening habitual; follow-up diagnóstico aberto persiste |

O Motor não calcula expectativa de vida nem benefício líquido por algoritmo próprio.

## Estratégias do piloto

Quando elegíveis, o Motor apresenta estratégias e o humano escolhe.

### FIT

- anual;
- anchor = coleta/realização;
- resultado final válido necessário para qualificar;
- FIT+ exige colonoscopia;
- repetir FIT não resolve FIT+.

### Colonoscopia primária

- a cada 10 anos após exame normal high-quality;
- não combinar rotineiramente com FIT;
- mudança futura de estratégia não invalida cobertura anterior válida.

## História familiar — complemento ACG

### 1 FDR com CRC/pólipo avançado <60 ou ≥2 FDR em qualquer idade

- colonoscopia aos 40 anos **ou** 10 anos antes do diagnóstico do familiar mais jovem, o que ocorrer primeiro;
- repetir a cada 5 anos;
- só automatizar com grau, número, tipo de lesão e idade do diagnóstico suficientemente conhecidos.

### 1 FDR com CRC/pólipo avançado ≥60

- iniciar aos 40 ou 10 anos antes do diagnóstico;
- depois seguir estratégia de risco habitual;
- não impor 5 anos universalmente.

### 1 SDR isolado

- seguir recomendações average-risk se não houver outro modificador.

História familiar complexa, contraditória, múltiplos casos jovens ou suspeita hereditária → revisão especializada.

## FIT+ e colonoscopia — complementos USMSTF

- FIT+ mantém follow-up até colonoscopia resolutiva suficiente;
- colonoscopia anterior não resolve novo FIT+ posterior;
- FIT− posterior não substitui colonoscopia indicada pelo positivo;
- colonoscopia posterior normal high-quality, em paciente sem exceções de maior risco, resolve o episódio e permite novo intervalo de **10 anos**;
- colonoscopia incompleta/preparo inadequado não fecha episódio.

## Preparo inadequado

Prazos especializados da USMSTF podem ser exibidos como `decisionSupport`, mas **não viram deadline automático** no primeiro piloto.

## Escopo e exclusões

CRC prévio, pólipos que exigem surveillance, DII, Lynch/FAP e outras síndromes hereditárias saem da rotina average-risk. O piloto reconhece e encaminha/revisa; não implementa surveillance completa nem genética.

## Escopo profissional

O módulo presume uso por profissional em contexto apropriado de rastreamento preventivo; não faz triagem de sintomas, urgência ou diagnóstico.