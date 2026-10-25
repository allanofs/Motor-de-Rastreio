# Fase 7.5 — auditoria de usabilidade do piloto CCR

Data: 24/10/2026. Branch: `v3-ccr-product-integration`. PR #4 mantida Draft.
Ruleset: `crc-0.5.5-phase6-active`.

## Conclusão: BLOCKED — auditoria de navegador incompleta

A pergunta central (se a interface preserva a decisão do Motor no uso real) ainda não pode receber aprovação. Houve revisão de código, correções de integração/UI e testes DOM, mas **não houve inspeção visual nem execução dos cenários em navegador real**. Não classificar esta rodada como READY FOR LIMITED INTERNAL PILOT.

O Vite iniciou com `npm run dev:ccr-pilot`, anunciando `http://127.0.0.1:5173/`. O navegador cloud retornou `net::ERR_CONNECTION_REFUSED`, inclusive em nova abertura após o servidor estar ativo. Uma tentativa de selecionar a aba de erro foi recusada pela política de URL do navegador. Não se contornou essa política, não se abriu túnel e não se fez deploy. Servidor e navegador não compartilharam um localhost acessível nesta execução.

## Identificação dos commits

- HEAD inicial, conferido no checkout e na PR: `a331fc6f15a39ce573d960007bc51b1fb3e4794b`.
- HEAD final da implementação auditada/testada: `2893e9b96412355965c344f2d51437722610773c`.
- Este relatório é entregue em commit documental posterior, sem mudança de código. O HEAD remoto final, incluindo esse commit, é registrado na descrição da PR #4 e na entrega. Para obter o SHA do próprio commit deste relatório: `git log -1 --format=%H -- docs/v3/product/ccr/03-phase7-5-browser-usability-audit.md`.
- Base da PR preservada: `v3-ccr-rules-pilot`.

## Gate inicial e método

Checkout limpo na branch exigida. `npm ci` e `npm run check` passaram antes das alterações: 497/497 testes, 32/32 arquivos, 62/62 schema checks, Foundation typecheck/build e pilot typecheck/build verdes. V2: blob `e40c75c5c877c00a94c932cdbe5bd33a5afa71b9`.

Leitura dos contratos 01 e 02, revisão de HTML/CSS/TypeScript, dos limites de privacidade e dos testes existentes. Acrescentados testes da UI real importada em DOM simulado (Happy DOM como dependência **somente de desenvolvimento**, sem biblioteca no bundle do piloto). São testes automatizados de eventos e saída DOM, não um navegador de renderização nem uma avaliação de leitores de tela. O teste é JavaScript para não introduzir a biblioteca DOM no typecheck isolado da Foundation; o TypeScript da UI continua coberto por `typecheck:ccr-pilot`.

## Viewports e acessibilidade em execução

| Alvo | Estado | Evidência / pendência |
|---|---|---|
| Desktop 1440 × 900 | Não testado | Cloud browser sem acesso ao Vite |
| Tablet 768 × 1024 | Não testado | Cloud browser sem acesso ao Vite |
| Mobile 390 × 844 | Não testado | Cloud browser sem acesso ao Vite |
| Tab / Shift+Tab / Enter / Space / selects | Não testado em navegador | Necessário confirmar ordem, operação e foco visual |
| Disclosure e foco programático | Testado em DOM simulado | Não demonstra ordem de Tab nem anúncio por leitor de tela |
| Refresh / URL / tráfego / storage | Revisão de código; execução real pendente | Não foi feita captura de rede ou inspeção de storage |

Não há screenshots nem medição real de overflow, clipping, contraste renderizado, comprimento de cards ou posição do resultado. CSS contém duas colunas em desktop e uma coluna abaixo de 980px, com campos em uma coluna abaixo de 640px; isso descreve a implementação, não comprova responsividade. Permanecem pendentes a visibilidade do warning sticky, versão, resultado ao lado/abaixo do formulário e foco sob o banner.

## Cenários exercitados — DOM simulado

Todos os cenários abaixo passaram pela UI, seus eventos, normalização, Motor ativo e apresentação. **Nenhum está aprovado como cenário de navegador.** O teste automatizado não substitui a leitura clínica humana completa do card e do texto de cada ação.

| Cenário | Resultado automatizado observado |
|---|---|
| A — SUS 60, preventivo, exclusões negativas, nunca realizou | FIT exibido em Fazer hoje |
| B — SUS 76, nunca realizou | Sem ação de rastreamento de rotina |
| C — SUS FIT+ aberto | Ação de colonoscopia exibida |
| D — SUS FIT+ → FIT− posterior | Ação de colonoscopia permanece |
| E — SUS FIT+ → colonoscopia posterior normal, adequada e completa | Ação diagnóstica removida; sem nova ação de rotina |
| F — BA-A 47 | Card SharedDecision; estratégia permanece não selecionada |
| G — BA-A 60, colonoscopia selecionada | Ação de colonoscopia; ao mudar a SUS a seleção antiga é descartada |
| H — Internacional 60, FIT escolhido | Ação FIT sem ação concorrente de colonoscopia |
| I — Internacional 62, familiar desconhecido | Due populacional e Indeterminate visíveis, sem ação definitiva de modalidade |
| J — Internacional, 1 FDR com CCR aos 42 | Ação de colonoscopia; mudar familiar para Não permite estratégia FIT sem influência dos detalhes antigos |
| K — CRC prévio | ClinicalReviewRequired, sem ação average-risk |
| L — FIT+ e colonoscopia no mesmo dia | Indeterminate preservado |

As cinco transições condicionais exigidas foram exercitadas: familiar Sim → Não; colonoscopia BA-A → SUS; conhecido/suficiente → nunca realizou; FIT positivo → não realizado; colonoscopia pós-FIT normal/adequada/completa → status desconhecido. Os valores inativos não contaminaram os resultados testados. O normalizador existente não foi modificado.

## Findings e correções

| ID | Severidade | Problema identificado no código | Correção / estado |
|---|---|---|---|
| UI-01 | P1 importante | Resultado anterior continuava visível após alteração de entrada ou remoção de exame | Qualquer input/change e inclusão/remoção invalidam a exibição; aviso pede nova avaliação |
| UI-02 | P1 importante | Data livre interpolada em innerHTML ao reconstruir exames permitia introduzir markup no DOM | Datas atribuídas por input.value; teste com aspas e tag confirma que não se cria elemento |
| UI-03 | P2 UX | Reconstrução de exames removia o elemento focado; submit não direcionava ao resultado abaixo do formulário | Foco explícito no exame adicionado, remoção restante ou botão de adicionar; resultado/erro recebe foco; reset retorna ao referencial |
| UI-04 | P2 UX | Campos de resultado, data e qualidade continuavam expostos para exame não realizado/desconhecido | Disclosure por status, sem mudar a normalização nem a interpretação clínica |
| UI-05 | P2 UX | Rótulos de status sem quebra e flex items sem min-width podiam exceder cards estreitos | Rótulos com quebra, flex-wrap e containment; inspeção visual ainda pendente |
| UI-06 | P2 UX | Microcopy pequena em #7a8498 sobre fundo claro, foco pouco destacado e campos mobile pequenos | Cor secundária #596276, outline visível, inputs mobile de 16px e alvos button/summary de 44px; validação renderizada pendente |
| UI-07 | P2 UX | Conflict/ComputationError sem acento visual próprio | Acento vermelho, mantendo texto de status e heading Resolver primeiro; significado não depende apenas da cor |
| AUD-01 | P1 importante | Navegador indisponível para validar a experiência real | Não corrigido: bloqueia o encerramento da Fase 7.5 |

Nenhum P0 foi confirmado nos testes realizados. A ausência de auditoria real impede excluir problemas de safety visual/interativa. CSS não recebeu aprovação visual por inferência.

## Linguagem clínica e problemas não corrigidos

`renderAction` continua usando `textContent = action.text`, sem paráfrase, interpolação clínica ou transformação de discutir/considerar em solicitar. Estados e seções continuam derivados do contrato. Não foram alterados apresentação clínica de `src/product/ccr`, engine, model ou regras.

Missing data, guardrails e source IDs continuam dentro da expansão Auditoria e segurança. A compreensibilidade de identificadores técnicos e a facilidade de descobrir informações faltantes exigem avaliação com profissionais; não foram inventadas traduções clínicas nesta rodada. Mensagens de erro e resumos governados também permanecem sem reescrita clínica.

Não foi medido tempo de preenchimento, realizado teste com profissional independente ou certificada conformidade WCAG. Overflow, contraste computado no navegador, foco visível, navegação com teclado, comportamento de selects nativos, anúncio das atualizações e orientação em cards longos continuam pendentes.

## Privacidade

Revisão estática e testes de arquitetura não encontraram primitivas de persistência, cookies, URL-state, rede, analytics ou logging de paciente em `pilot/ccr/**` e `src/product/ccr/**`. Os exames permanecem em array na memória; reset limpa formulário e exames em teste DOM. `autocomplete=off` foi acrescentado como orientação ao navegador, sem promessa de controlar restauração de formulário feita pelo próprio navegador.

**Não foi comprovado em navegador real** que refresh apaga todos os controles nem que o tráfego/URL/storage permanecem vazios de dados. Isso exige abrir Network e Application e realizar o fluxo local. O Vite usa comunicação de desenvolvimento/HMR; não confundir tráfego técnico de desenvolvimento com transmissão dos dados do formulário. Não houve inserção de dados de pacientes reais nesta auditoria.

## Testes e gate final

Adicionado `v3/tests/ccr/pilotUiInteraction.test.js`: 17 testes, com A–L, cinco transições condicionais, invalidação de resultado, foco programático, payload de HTML em data, reset e erro seguro. Testes existentes de texto verbatim, privacidade e integração permanecem passando.

Gate final local: **514/514 testes, 33/33 arquivos, 62/62 schema checks**; Foundation typecheck/build e CCR pilot typecheck/build verdes. Instalação limpa do lockfile e gate completo repetidos após inclusão da dependência de testes. Um primeiro ensaio do novo teste em TypeScript foi retirado porque importava tipos DOM para o typecheck Foundation; a versão final JavaScript mantém os typechecks separados.

`git diff --check` passou. V2 conserva o blob `e40c75c5c877c00a94c932cdbe5bd33a5afa71b9`. Diff desta rodada não altera `v3/src/engine/**`, `v3/src/model/**`, `v3/src/clinical/ccr/**` ou `index.html`. Release warning, `noindex,nofollow` e gate de integração preservados. Dependência nova apenas de testes; nenhum framework de UI nem biblioteca de acessibilidade de produção.

## Para encerrar o bloqueio

Executar novamente a Fase 7.5 em ambiente onde um navegador alcance o Vite local: inspecionar os três viewports, percorrer A–L e as cinco transições com teclado/mouse, confirmar texto governado dos cards e realizar inspeção de privacidade em execução. Acrescentar evidências e revisar esta conclusão somente após esses passos.

PR #4 continua Draft. Sem merge, deploy, publicação do site ou início de nova fase.
