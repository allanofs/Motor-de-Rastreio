# ADR-009 — Extensão longitudinal tipada e pura

Status: implementado na Fase 4.1, sem conteúdo clínico.

## Context

Sequências de eventos não cabem somente em critérios, qualificador e intervalo. A engine não deve importar módulos clínicos nem incorporar condicionais por nome de domínio.

## Decision

Registro explícito `DomainResolverRegistry` por topicId/trackId, com resolverId, version, requiredConceptIds e função síncrona pura. A função recebe snapshots tipados, clonados e profundamente congelados de paciente normalizado, histórico, regras, política, asOf e resultado genérico. Disponibilidade operacional local é removida do snapshot. Saída passa por schema e só pode selecionar ações e considerações declaradas pelas regras ativas.

Sem registro, a avaliação continua genérica. O resolver não ignora critérios obrigatórios ausentes, conflitos, revisão clínica ou comparadores em abstensão. Current não pode ser fabricado: somente pode preservar uma conclusão já sustentada por qualificação/agenda genéricas. Exceções e saídas inválidas viram ComputationError no track, preservando irmãos e outros domínios. Trace registra identidade e versão da extensão.

## Consequences

Registry é código confiável do aplicativo, não código fornecido por paciente, texto executável, JSON de regras ou mini-CQL. Tipagem e freeze não constituem sandbox de efeitos colaterais e não provam pureza de qualquer função JavaScript: ausência de rede/DOM/storage/relógio/estado externo é contrato obrigatório, sujeito a revisão e testes. Nenhuma extensão clínica foi registrada no código de produção. O resolver fictício existe apenas na suíte.

Mudança do resolver exige revisão e versionamento explícitos, assim como o bundle. A futura lógica clínica poderá resolver sequências e handoffs, mas não ganhará licença para criar Current sem o mesmo padrão de evidência.

## Alternatives rejected

Importação de CCR na engine; dispatch por if(topic); eval de conteúdo; linguagem de regras longitudinal; resolver alterar o paciente; autoações não declaradas; contornar revisão médica ou inventar cronologia em eventos do mesmo dia.
