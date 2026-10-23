# ADR-007 — Abstensão, evidência e revisão da interpretação

Status: atualizado na Fase 4.1.

## Context

Conferir um documento não equivale a revisar a interpretação clínica. Stance, força da recomendação, certeza da evidência e grau bruto são conceitos distintos.

## Decision

Regra active exige `reviewed_by_1` ou `reviewed_by_2` e, respectivamente, pelo menos um ou dois revisores distintos em `governance.reviews[]`, com reviewer e reviewedAt. `source_verified` pode permanecer draft; não autoriza ativação. A checagem é aplicada também às fixtures técnicas, que usam registros explicitamente fictícios. Fontes finais e não substituídas continuam obrigatórias.

`SourceRef.evidence` registra o sistema original, recommendationStrength, evidenceCertainty, rawGrade e gradeVerified (padrão false). Não há conversão, ranking ou derivação automática de stance entre sistemas.

Regras parcialmente computáveis mantêm ClinicalReviewRequired e nenhuma ação automática nesse track. Seus itens `decisionSupport[]` são preservados com IDs das regras; são considerações para o humano, separadas de guardrails e de actions[]. Outros tracks computáveis continuam ativos.

## Consequences

Metadados não provam que uma pessoa realmente revisou conteúdo: identidade, qualificação, fontes e interpretação devem ser verificadas no processo clínico futuro. Nenhum revisor médico real ou revisão clínica foi inventado nesta entrega. Testes verdes não promovem lifecycle nem reviewStatus. Fonte verificada e interpretação revisada permanecem estados distintos.

## Alternatives rejected

Active apenas com source_verified; contar o mesmo reviewer duas vezes; normalizar escalas incompatíveis; transformar evidência insuficiente em recomendação contrária; emitir consideração como ação automática; usar guardrail para esconder decisão parcialmente computável.
