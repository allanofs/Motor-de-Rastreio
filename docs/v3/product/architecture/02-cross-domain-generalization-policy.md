# Cross-Domain Generalization Policy — V3

**Status:** decisão arquitetural de produto — Fase A  
**Branch:** `v3-automation-boundary-architecture`

## Objetivo

Evitar que detalhes clínicos ou estruturas criadas para um único domínio sejam promovidos prematuramente para a Foundation.

## Regra arquitetural

> **Uma abstração clínica só deve subir para a Foundation depois de demonstrar utilidade em pelo menos dois domínios independentes, salvo quando necessária para um invariante global de segurança.**

CCR é o primeiro domínio-laboratório. O próximo domínio preferencial para validar transversalidade é Câncer de Mama.

---

## 1. O que permanece na Foundation

A Foundation deve continuar contendo apenas capacidades genéricas necessárias para múltiplos domínios, como:

- fatos normalizados;
- tracks independentes;
- temporalidade;
- `asOf`;
- datas parciais;
- agendas/intervalos genéricos;
- `supersedes` / composição;
- policies;
- CareSettingContext genérico;
- safe failure;
- `DecisionTrace`;
- provenance;
- `DomainResolver` como mecanismo de extensão tipado e puro.

Não adicionar à Foundation uma abstração apenas porque ela parece elegante no CCR.

---

## 2. O que permanece no domínio

Estruturas que representam conhecimento ou workflow específico permanecem no domínio enquanto não houver evidência transversal.

Exemplos CCR:

- episódio de FIT positivo;
- ordenação de eventos pós-FIT;
- resolução por colonoscopia pós-FIT;
- detalhes de estratégia específicos do CCR.

Exemplos futuros de Mama devem permanecer em Mama se não forem necessários fora desse módulo.

---

## 3. O que pertence à camada de produto

A camada de produto pode comprimir semântica clínica já calculada para uma experiência humana mais simples, sem reimplementar medicina.

Exemplos candidatos:

- `automationBoundaryCode` específico do domínio;
- mapeamento determinístico para estados de produto;
- identificação dos tracks que motivaram a parada;
- organização de informações para UI/relatório.

Esses contratos devem começar específicos por domínio (`Ccr...`, `Breast...`) e só depois serem comparados.

---

## 4. Teste de promoção para Foundation

Antes de promover uma abstração, responder:

1. apareceu de forma independente em pelo menos dois domínios?
2. possui a mesma semântica, e não apenas nome parecido?
3. é necessária para segurança/consistência global?
4. pode ser definida sem importar conhecimento clínico de um domínio?
5. reduz duplicação real sem engessar políticas diferentes?
6. possui testes adversariais em mais de um domínio?
7. preserva provenance, safe failure e isolamento de policies?

Se as respostas não forem suficientes, manter a abstração fora da Foundation.

---

## 5. Sequência aprovada de trabalho

### Fase A — Formalização

Documentar:

- Depth Budget;
- Boundary of Automation;
- continuidade longitudinal mínima;
- invariantes;
- taxonomia de produto;
- política de generalização.

**Somente documentação.**

### Fase B — Demonstração no CCR

Sem apagar o mecanismo profundo existente:

- derivar um contrato simplificado de produto;
- provar `sabe quando rastrear / parar / ainda está parado`;
- manter detalhes completos em auditoria/trace;
- não promover abstrações novas para Foundation nesta etapa.

### Fase C — Câncer de Mama

Antes de escrever código, especificar explicitamente:

- Nível 1 — rotina;
- Nível 2 — situações que suspendem rotina;
- continuidade mínima;
- fora do escopo;
- policies;
- sources;
- safe failure;
- goldens/adversariais.

Depois implementar o domínio.

### Fase D — Generalização

Comparar CCR e Mama:

- quais conceitos realmente apareceram nos dois?
- quais possuem semântica equivalente?
- quais são invariantes de segurança?
- quais continuam específicos?

Somente então propor novos contratos universais da Foundation.

---

## 6. Boundary de produto não é licença para esconder complexidade

Simplificar a apresentação não permite:

- esconder `ClinicalReviewRequired` real;
- converter `unknown` em negativo/resolvido;
- ignorar `Conflict` ou `ComputationError`;
- fabricar retorno à rotina;
- descartar provenance;
- permitir que UI resolva estados clínicos.

A simplicidade ocorre na superfície; a auditabilidade permanece completa.

---

## 7. Relação com o CCR profundo

O CCR não será rebaixado para caber em um modelo mais simples.

Seu mecanismo profundo permanece como:

- benchmark arquitetural;
- suíte extrema de regressão;
- fonte de casos adversariais;
- prova de que a V3 suporta longitudinalidade complexa quando necessária.

A nova política significa apenas que **novos domínios não precisam reproduzir essa profundidade por padrão**.

---

## 8. Critério para exceções

Uma abstração pode subir antes de dois domínios somente se for necessária para um invariante global de segurança.

Exemplos conceituais de invariantes globais:

- ausência de informação não pode ser interpretada como resolução;
- provenance não pode citar evidência não utilizada;
- UI não pode criar estado clínico;
- uma extensão de domínio não pode violar safe failure da engine.

Mesmo nesses casos, a proposta deve demonstrar que a semântica é realmente global e não um detalhe clínico disfarçado.

---

## 9. Decisão desta fase

Nenhuma nova abstração será promovida para `v3/src/model/**` ou `v3/src/engine/**` durante a Fase A.

O próximo gate é revisão humana desta documentação. Só depois poderá existir uma Fase B funcional no produto CCR.
