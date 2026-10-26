# Mama — M1: matriz de representabilidade

Status: **Draft / sem decisão clínica executável**.

Esta matriz prova que o vocabulário da M1 consegue representar os cenários necessários antes de escrever regras.

| Cenário | Representação mínima esperada | Profundidade permitida |
|---|---|---|
| Pessoa assintomática, risco habitual, nunca rastreada | contexto preventivo + anatomia relevante + histórico suficiente/never-performed | rotina |
| Mamografia de rastreamento prévia com retorno à rotina permitido | exame de rastreamento + data + `routine-clearing`/conceito de retorno à rotina | rotina |
| Histórico desconhecido | `historyKnowledge=unknown` / conceito de suficiência não confirmado | indeterminado |
| Sintoma mamário suspeito | `breast-suspicious-symptoms` | `Atenção específica`; não abrir investigação automática |
| Câncer de mama prévio | `breast-prior-cancer` | sair da rotina |
| Alto risco genético conhecido | `breast-high-risk-genetic-context` | sair da rotina |
| Radioterapia torácica de alto risco prévia | `breast-prior-high-risk-chest-radiation` | sair da rotina |
| Lesão mamária prévia de alto risco | `breast-prior-high-risk-lesion` | sair da rotina |
| Acompanhamento mastológico/oncológico ativo | `breast-specific-care-active` | acompanhamento específico |
| Mamografia anterior que exige investigação | `breast-prior-mammography-needs-specific-attention` + resultado `attention-required` | sair da rotina |
| Resultado anterior indeterminado | resultado `indeterminate` | não presumir normalidade |
| Mamografia diagnóstica registrada | `breast-mammography-diagnostic` | não usar silenciosamente como âncora rotineira |
| Recurso necessário após indicação de mamografia | `breast-resource-mammography` | CareSettingContext; não muda evidência clínica |

## Sentinelas de segurança para fases posteriores

M2/M3 devem preservar pelo menos estes casos adversariais:

1. `unknown` nunca vira `never_performed`;
2. mamografia diagnóstica nunca vira automaticamente rastreamento de rotina;
3. achado `attention-required` não é apagado por ausência de seguimento documentado;
4. evento posterior não resolve evento anterior sem disposição explícita suficiente;
5. data futura não conta como cobertura atual;
6. data imprecisa insuficiente para decidir intervalo deve preservar incerteza;
7. a mesma mamografia pode produzir `Current` numa policy e `Due` em outra sem alterar o registro do exame;
8. indisponibilidade local de mamografia muda rota operacional, não a indicação clínica já calculada;
9. sintomas/alto risco não abrem árvores diagnósticas profundas no módulo de rastreamento;
10. a UI nunca infere anatomia, alto risco ou resultado mamográfico a partir de texto livre.

## Gate para M2

Antes de criar fontes estruturadas/regras, M1 precisa de aprovação humana explícita sobre:

- vocabulário e tracks;
- lista de hard exits;
- separação screening vs diagnostic mammography;
- contrato temporal mínimo;
- decisão de manter DBT fora da estratégia V1;
- manutenção do Depth Budget sem BI-RADS profundo.
