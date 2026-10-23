# V3 Foundation — fases 0–4

Biblioteca técnica experimental, **sem conteúdo clínico**. Não emite recomendações médicas utilizáveis. A V2 permanece no `index.html` da raiz e não é importada pelo V3.

```sh
cd v3
npm ci
npm run check
```

Node 24 é a referência do CI. O build Vite gera `dist/foundation.js` como biblioteca ES; não cria página clínica nem publica nada.

## Uso da API

`evaluatePatient({ patient, asOf, policyId, ruleset, careSetting? })` recebe o calendário explicitamente. `asOf` é um objeto `{ year, month, day }`, não um timestamp; `parseCalendarDate('2026-10-23')` ajuda a construí-lo.

O chamador fornece um bundle validável com regras, fontes, políticas e terminologia. **Nenhum bundle clínico acompanha este pacote.** Os exemplos executáveis em `tests/fixtures.ts` são exclusivamente fictícios, com fontes `example.invalid`, política `technical-only` e intervalos técnicos sem significado médico.

A saída contém `plan.topics[]`, `plan.actions[]` e `traces[]`. Falhas locais produzem `ComputationError` com mensagem segura. Envelope de controle inválido (por exemplo `asOf` ausente), identidade de conteúdo irrecuperável ou política inexistente lançam erro de entrada explícito: não há fallback. O futuro formulário precisa tratar esse erro sem conservar recomendações antigas na tela.

## Contrato de entrada e estados ocultos

O paciente normalizado tem `context`, `facts`, `examHistory` e `historyKnowledge`. Ausência de um campo opcional significa não informado; `unknown` é valor explicitamente declarado. `never_performed` é diferente de ambos.

A entrada bruta pode adicionar `_ui: { enabled: false }` ou `_ui: { answered: false }` a um fato/exame. Esse registro é podado antes do schema. Subcampos `details`/`value` são retirados quando a presença do fato deixa de ser `yes`. Um exame alterado para `not_performed` ou `unknown` perde resultado, data e qualidade antigos. Um campo opcional de contexto não respondido pode usar `{ _ui: { answered: false } }` para ser removido; campos respondidos devem fornecer diretamente o valor clínico. Metadados ambíguos são rejeitados, sem coerção de strings para booleanos.

IDs são estáveis e únicos na sessão; a engine não os gera pelo relógio. Duplicatas e contradições explícitas impedem recomendação. Não há persistência, console clínico, rede, DOM ou dependência de navegador.

## Tempo

`PartialCalendarDate` é uma union discriminada por `precision: year | month | day`. `toDateInterval()` preserva todos os dias possíveis. Datas históricas cujo intervalo invade o futuro ou cruza o nascimento exigem esclarecimento. A engine não trunca intervalos para obter uma conclusão favorável.

Duração em meses/anos usa calendário gregoriano de 1 a 9999. Soma aplica clamp de fim de mês; o vencimento é inclusivo na data calculada. Idade de quem nasceu em 29/02 avança em 01/03 em ano não bissexto. Essas convenções técnicas precisam ser revisadas quando houver conteúdo clínico. Ordem incerta ou mesmo dia não prova que um evento resolveu outro.

## Composição e limites

Regras coexistem por padrão. `strategyGroupId` limita competição; política pode apontar a estratégia curada. `supersedes` deve formar DAG. `excludes` ativo simultaneamente é conflito explícito, nunca um desempate. Ações iguais podem compartilhar suporte; ações contraditórias exigem abstensão.

`replace` exige `supersedes`; `combine_actions` combina ações compatíveis. `manual_conflict` impede resolver uma combinação automaticamente. `choose_shorter_interval` e `choose_higher_acuity` são representáveis, mas produzem `ClinicalReviewRequired`: a P0 não define comparador clínico seguro. Não existe fallback de “mais restritivo”.

`Current` exige evento qualificador com resultado final aceito e os requisitos de qualidade/completude/resolução declarados pela regra, data válida, agenda e `anchorEventId`. Ausência de âncora produz `Indeterminate`. Múltiplos eventos de ordem parcial incerta exigem esclarecimento. Estados incompatíveis permanecem em conflito; não se escolhe vencedor para o domínio inteiro.

Disponibilidade ausente significa `unknown`. Recursos só entram na ação se ela os referencia. Indisponibilidade preserva o texto e o tipo da recomendação e pode produzir encaminhamento explicitamente declarado, ou revisão clínica; nenhuma alternativa clínica é inventada.

## Revisão

Veja `../docs/v3/REPORT.md`, `INSPECTION.md` e ADRs 001–008. Pesquisa, regras, políticas reais, golden patients de CCR, comparação de referenciais e UI ficam fora desta execução.
