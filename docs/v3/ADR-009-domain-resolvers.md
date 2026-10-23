# ADR-009 — Extensão longitudinal tipada e pura

Status: implementado na Fase 4.1, contrato de evidência refinado na Fase 4.2; sem conteúdo clínico.

## Context

Sequências de eventos não cabem somente em critérios, qualificador e intervalo. A engine não deve importar módulos clínicos nem incorporar condicionais por nome de domínio.

## Decision

Registro explícito `DomainResolverRegistry` por topicId/trackId, com resolverId, version, requiredConceptIds e função síncrona pura. A função recebe snapshots tipados, clonados e profundamente congelados de paciente normalizado, histórico, regras, política, asOf e resultado genérico. Disponibilidade operacional local é removida do snapshot. Saída passa por schema e só pode selecionar ações e considerações declaradas pelas regras ativas.

Sem registro, a avaliação continua genérica. O resolver não ignora critérios obrigatórios ausentes, conflitos, revisão clínica ou comparadores em abstensão. Current não pode ser fabricado: somente pode preservar uma conclusão já sustentada por qualificação/agenda genéricas. Exceções e saídas inválidas viram ComputationError no track, preservando irmãos e outros domínios. Trace registra identidade e versão da extensão.

## Evidência e trace (Fase 4.2)

`factsUsed` contém apenas fatos efetivamente consultados por critérios/exclusões/requiredKnownFacts, respeitando short-circuit. Não inclui automaticamente exames disponíveis. `recordsUsed` registra evidência da conclusão: âncoras da agenda genérica ou IDs declarados pelo resolver. `recordsConsidered` separa eventos inspecionados pelo cálculo de histórico de evidência usada; não é inventário de tudo que foi recebido. Coleções são únicas, ordenadas e agregadas por tópico.

A saída do resolver aceita `evidenceRecordIds[]` (omissão normalizada para []). Cada ID deve existir entre os fatos do paciente ou eventos do histórico do snapshot realmente entregue àquela extensão. Registro existente apenas na entrada bruta, fora da projeção/snapshot, é rejeitado. Saída inválida vira ComputationError do track, sem ações e sem recordsUsed residuais.

Ao substituir a conclusão genérica, a extensão declara a evidência de sua própria conclusão; âncoras genéricas anteriores deixam de ser automaticamente causais. Ao preservar Current, sua âncora validada permanece em recordsUsed, mesmo sem declaração redundante. factsUsed continua documentando consultas reais dos critérios genéricos.

A validação demonstra existência e pertença ao snapshot; não prova que a extensão leu todos os registros que declarou nem que declarou todos os que leu. Essa precisão depende do contrato e revisão do código confiável. Não há instrumentação de acesso ou execução clínica implícita.

## Consequences

Registry é código confiável do aplicativo, não código fornecido por paciente, texto executável, JSON de regras ou mini-CQL. Tipagem e freeze não constituem sandbox de efeitos colaterais e não provam pureza de qualquer função JavaScript: ausência de rede/DOM/storage/relógio/estado externo é contrato obrigatório, sujeito a revisão e testes. Nenhuma extensão clínica foi registrada no código de produção. O resolver fictício existe apenas na suíte.

Mudança do resolver exige revisão e versionamento explícitos, assim como o bundle. A futura lógica clínica poderá resolver sequências e handoffs, mas não ganhará licença para criar Current sem o mesmo padrão de evidência.

## Alternatives rejected

Importação de CCR na engine; dispatch por if(topic); eval de conteúdo; linguagem de regras longitudinal; resolver alterar o paciente; autoações não declaradas; contornar revisão médica ou inventar cronologia em eventos do mesmo dia.
