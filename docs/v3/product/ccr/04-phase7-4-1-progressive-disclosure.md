# Fase 7.4.1 — Progressive disclosure do piloto CCR

Data: 24/10/2026. Branch: `v3-ccr-product-integration`. PR #4 mantida Draft.
Ruleset clínico consumido: `crc-0.5.5-phase6-active`.

## Motivo da subfase

A inspeção visual humana da UI de referência da Fase 7.4 revelou um gap de produto importante: embora o motor clínico e a normalização estivessem corretos, quase todo o questionário era exibido simultaneamente.

Isso contrariava uma decisão de produto já aprovada: **perguntar apenas o que é necessário no ponto atual da decisão** e revelar campos condicionais somente quando a resposta anterior muda o próximo passo.

Finding registrado conceitualmente como **UX-08 — P1 produto**:

> A UI piloto apresentava praticamente todo o questionário simultaneamente, fazendo a experiência parecer uma ficha de coleta de variáveis, em vez de um assistente estruturado de decisão clínica.

Não era um bug do engine, da Foundation ou das regras clínicas. A correção foi limitada à camada de produto/UI.

## Princípio de desenho

A interface continua determinística e estruturada. Não foi transformada em chatbot.

Fluxo desejado:

1. coletar uma informação;
2. revelar somente o próximo bloco necessário;
3. interromper perguntas average-risk quando um gate anterior já muda a rota;
4. permitir que o Motor calcule antes de perguntar estratégia ou disponibilidade;
5. pedir estratégia somente quando uma escolha humana é realmente necessária;
6. pedir disponibilidade somente quando já existe uma ação dependente daquele recurso.

Regra de ouro:

> Nenhum campo aparece apenas porque pode ser útil. Ele aparece quando a camada de produto consegue justificar por que é necessário naquele ponto da avaliação.

## Sequência adaptativa implementada

### 1. Referencial, data e idade

A tela inicial contém apenas:

- policy/referencial;
- `asOf`;
- idade.

Somente quando os três estão presentes o gate de contexto preventivo é revelado.

### 2. Contexto preventivo

Se o profissional informa que o caso não é preventivo ou permanece incerto, as perguntas average-risk seguintes não são abertas automaticamente. A interface permite avaliar o estado de escopo sem coletar história familiar, exames ou disponibilidade desnecessariamente.

### 3. Condições que mudam a rota

São mantidos quatro hard-risk facts clínicos já governados:

- CRC prévio;
- pólipo/adenoma prévio em surveillance;
- DII colônica relevante;
- síndrome hereditária CCR/polipose conhecida ou suspeita.

Se qualquer um é positivo:

- o restante do fluxo average-risk permanece fechado;
- a pergunta de cuidado já assumido por outro profissional/serviço pode aparecer;
- história familiar, histórico average-risk, estratégia e disponibilidade não são revelados.

### Nuance de segurança do hard-risk gate

O primeiro CI da 7.4.1 mostrou uma expectativa de UI excessivamente agressiva: permitir avaliação imediatamente após o primeiro hard-risk positivo deixava os demais facts do mesmo gate como `not_asked`, o que podia impedir o engine de produzir o estado forte esperado em alguns cenários.

A solução adotada preserva a semântica da Foundation:

- ao surgir um hard-risk positivo, a UI **para o disclosure downstream**;
- porém pede que o profissional conclua somente as quatro perguntas do próprio gate de condições especiais;
- só depois habilita a avaliação;
- não abre história familiar, exames ou demais perguntas average-risk.

Assim, a UI reduz coleta sem fabricar conhecimento ausente.

## 4. História familiar

A história familiar só aparece quando:

- contexto preventivo = sim;
- os quatro hard-risk facts foram respondidos;
- nenhum hard-risk positivo está presente.

Detalhes familiares só aparecem se `familyHistory=yes`.

Para a versão atual, o mínimo de detalhe exigido pela UI para prosseguir no ramo positivo é:

- número de FDR afetados;
- número de SDR afetados;
- faixa etária do diagnóstico mais jovem;
- tipo de achado familiar.

A idade exata continua opcional e só é transmitida quando informada.

## 5. Conhecimento do histórico

Após a história familiar, a interface pergunta o conhecimento do histórico de rastreamento.

- `never_performed`: não abre aquisição de exames;
- `unknown`: não abre aquisição de exames;
- `known`: abre a seção de exames conhecidos.

O formulário não confunde um exame individual marcado como `not_performed` com `historyKnowledge=never_performed` global.

## 6. Exames

FIT e colonoscopia só podem ser adicionados quando o histórico foi declarado conhecido.

Campos de um exame continuam condicionados ao status `performed`.

Valores ocultos não entram no draft clínico quando o ramo correspondente deixa de estar ativo.

## 7. Estratégia: solicitada após cálculo

A estratégia deixou de ser uma pergunta antecipada.

Foi acrescentado ao contrato de apresentação:

```ts
CcrRequestedInput =
  | "strategy_selection"
  | "fit_availability"
  | "colonoscopy_availability";
```

A presentation layer deriva `strategy_selection` quando o próprio resultado do Motor demonstra que uma escolha humana de modalidade é necessária.

A UI então revela a seção de estratégia e explica explicitamente que:

- o Motor não escolhe FIT versus colonoscopia autonomamente;
- a seleção permanece humana.

SUS continua sem campo de estratégia primária.

## 8. Disponibilidade: solicitada após existir uma ação

A camada de apresentação agora transporta também o `resourceId` da ação governada.

Quando uma ação clínica já existe e sua disponibilidade está `unknown`, o presentation model pode solicitar somente:

- disponibilidade de FIT; ou
- disponibilidade de colonoscopia.

A UI revela somente o recurso necessário.

Exemplos:

- SUS average-risk Due → primeiro calcula FIT; depois pode pedir disponibilidade de FIT;
- FIT+ aberto → primeiro calcula colonoscopia diagnóstica; depois pode pedir disponibilidade de colonoscopia;
- BA-A sem modalidade escolhida → primeiro pede estratégia; somente depois da escolha pede disponibilidade do recurso selecionado.

A disponibilidade continua alterando apenas a operacionalização, nunca a indicação científica.

## Painel lateral: de espaço vazio para jornada clínica

Antes da primeira avaliação, o painel direito agora apresenta:

- próxima etapa necessária;
- resumo das informações já confirmadas;
- indicação de quando o Motor já possui dados suficientes para avaliar.

Após uma avaliação que requer entrada adicional, o painel mostra um bloco de **Próxima informação necessária** com botão `Responder agora`, que leva foco para o controle solicitado.

O texto clínico governado das ações continua vindo de `EvaluatedAction.text` sem paráfrase pela UI.

## Proteção contra estado oculto

`collectDraft()` passou a considerar a visibilidade do ramo da UI.

Campos de seções ocultas são neutralizados antes da normalização:

- family history oculto → `not_asked`;
- histórico oculto → `not_asked`;
- exames ocultos → `[]`;
- strategy oculta → `unselected`;
- specialist care oculto → `not_asked`;
- disponibilidade oculta → não enviada ao `CareSetting`.

Isso adiciona uma segunda barreira contra valores antigos de formulário contaminarem o Motor; a normalização clínica já possuía sua própria proteção.

## Mudanças técnicas

Arquivos desta subfase em relação ao HEAD da auditoria anterior `6223a700126ddc558a473616002e3d6af199b43f`:

1. `v3/pilot/ccr/index.html`
2. `v3/pilot/ccr/main.ts`
3. `v3/pilot/ccr/styles.css`
4. `v3/src/product/ccr/presentation.ts`
5. `v3/tests/ccr/pilotUiInteraction.test.js`
6. `v3/tests/ccr/productPresentation.test.ts`

Não houve alteração em:

- `v3/src/engine/**`;
- `v3/src/model/**`;
- `v3/src/clinical/ccr/**`;
- ruleset clínico ativo;
- Foundation;
- V2.

## Testes acrescentados/ajustados

### Presentation

`productPresentation.test.ts` passou a verificar, entre outros:

- `phase7.4.1` como versão do contrato de apresentação;
- transporte de `resourceId` sem invenção pela UI;
- SUS solicita FIT availability somente após ação FIT;
- BA-A solicita primeiro `strategy_selection`;
- open FIT+ solicita colonoscopy availability;
- disponibilidade já conhecida não gera nova solicitação.

### UI DOM simulada

`pilotUiInteraction.test.js` passou a ter **21 testes** e verifica:

- tela inicial mínima;
- disclosure sequencial dos blocos;
- interrupção downstream por hard exclusion;
- estratégia solicitada após cálculo;
- disponibilidade solicitada somente após ação concreta;
- A–L da auditoria anterior;
- stale output;
- foco;
- valores condicionais antigos;
- exame `not_performed` sem preservar follow-up positivo;
- `never_performed` global distinto de exame individual não realizado;
- reset e proteção contra markup em data.

## Aprendizado do primeiro CI

O primeiro run da versão adaptativa teve 2 falhas de expectativa:

1. o teste esperava `ClinicalReviewRequired` imediatamente após apenas `priorCrc=yes`, deixando os demais fatos do hard-risk gate desconhecidos;
2. o teste esperava FIT de rotina depois de um evento FIT marcado `not_performed`, implicitamente confundindo isso com `never_performed` global.

Nenhum desses achados exigiu mudança de engine ou regra clínica.

A UI/testes foram corrigidos para respeitar os contratos já congelados:

- concluir o pequeno hard-risk gate antes da avaliação;
- `not_performed` de um evento não prova ausência global de rastreamento anterior.

## Gate final automatizado

HEAD funcional testado antes deste commit documental:

`8bd99df5da7de61a7b2cc126aef8000c3146f669`

Resultado do workflow:

- **521/521 testes**;
- **33/33 arquivos de teste**;
- **62/62 schema checks**;
- Foundation typecheck: ✅;
- CCR pilot typecheck: ✅;
- Foundation build: ✅;
- CCR pilot build: ✅;
- V2 byte-for-byte: ✅.

## Estado da Fase 7.5

A auditoria 7.5 anterior permanece historicamente válida para a UI antiga, mas **não encerra o gate da nova UI adaptativa**.

O Work não conseguiu acessar o Vite local naquela execução. Posteriormente, o responsável do projeto conseguiu abrir a UI via GitHub Codespaces/port forwarding e forneceu evidência visual real da interface anterior. Foi essa inspeção que revelou o finding UX-08.

Agora que a interface mudou materialmente, a auditoria visual/interativa deve ser repetida sobre a 7.4.1:

- desktop;
- tablet;
- mobile;
- teclado/foco;
- A–L;
- transitions condicionais;
- runtime privacy/storage/network;
- compreensão do novo fluxo adaptativo.

Até essa repetição, PR #4 permanece Draft e o produto não está autorizado para piloto clínico real, deploy público ou release.
