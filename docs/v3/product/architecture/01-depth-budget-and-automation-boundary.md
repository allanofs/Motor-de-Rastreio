# Depth Budget & Boundary of Automation — V3

**Status:** decisão arquitetural de produto — Fase A  
**Branch:** `v3-automation-boundary-architecture`  
**Escopo:** documentação somente  
**Não altera:** Foundation, engine, model, regras clínicas, UI, persistência ou backend

## Princípio central

> **O MOTOR sabe quando rastrear, sabe quando parar e sabe se ainda está parado.**

Formulação técnica:

> O MOTOR automatiza o rastreamento de rotina e detecta quando o caso saiu da rotina. Ao atingir esse limite, encerra a automação clínica. Mantém apenas estado longitudinal suficiente para impedir um retorno indevido ao rastreamento de rotina.

Este princípio passa a orientar novos módulos e futuras simplificações de produto. O CCR permanece preservado como benchmark interno de profundidade máxima e não define o Depth Budget obrigatório de novos domínios.

---

## 1. Depth Budget

Cada módulo clínico deve declarar explicitamente, antes de implementar regras executáveis, até onde a automação irá.

### Nível 1 — Rastreamento de rotina

É a função principal do produto.

O MOTOR deve ser excelente em:

- elegibilidade;
- faixa etária;
- fatores de risco que realmente modificam rastreamento;
- modalidade;
- periodicidade;
- data/qualidade suficiente do último exame quando necessária à decisão preventiva;
- `Current` / `Due`;
- critérios de início e interrupção;
- escolha de policy/referencial;
- divergência entre guidelines;
- decisão compartilhada quando aplicável;
- modificadores transversais, incluindo contexto geriátrico, apenas quando o guideline/ruleset daquele domínio os utilizar.

### Nível 2 — Desvio da rotina

Quando um fato, sintoma, exame ou achado torna inadequado continuar tratando o caso como rastreamento habitual, o MOTOR deve reconhecer isso e encerrar a automação rotineira.

Exemplos conceituais:

- FIT positivo;
- nódulo mamário palpável;
- resultado cervical relevante;
- outro achado de rastreamento que exija avaliação específica.

A saída de produto pode ser:

> **ATENÇÃO ESPECÍFICA**

O MOTOR pode indicar a categoria geral do próximo passo quando isso estiver claramente sustentado pelo referencial, mas não deve reproduzir automaticamente todo o protocolo diagnóstico, terapêutico ou de surveillance.

### Não existe, por padrão, um Nível 3 clínico profundo

Depois que o caso saiu da rotina, o MOTOR não deve passar a modelar sistematicamente árvores como:

- qualidade técnica detalhada de exames diagnósticos;
- número/tamanho/histologia de lesões;
- biópsias;
- estadiamento;
- tratamento;
- surveillance especializada;
- protocolos assistenciais completos.

Esses elementos só entram em um módulo se forem necessários para decidir prevenção/rastreamento com segurança ou para a exceção longitudinal mínima descrita abaixo.

---

## 2. Continuidade longitudinal mínima

Depois de um evento que acionou o Boundary of Automation, o MOTOR deve manter apenas informação suficiente para responder:

> **Ainda existe motivo para impedir retorno ao rastreamento de rotina?**

O domínio pode representar, de forma mínima, disposições equivalentes a:

1. ainda pendente;
2. desfecho desconhecido;
3. avaliação concluída e liberado para retorno à rotina;
4. acompanhamento específico definido fora do rastreamento habitual.

A continuidade mínima não recalcula intervalos preventivos.

Regra:

> **A pendência decide SE pode voltar; os mecanismos normais decidem COMO fica o rastreamento.**

Depois da liberação, mecanismos existentes como `DomainResolver`, temporalidade, `supersedes`, eventos qualificadores, policy e intervalos continuam responsáveis pela conclusão preventiva.

---

## 3. Boundary of Automation

O limite de automação é uma conclusão semântica do domínio/produto, não um texto livre da UI.

Nesta fase, não será criada uma nova abstração universal na Foundation.

O contrato futuro de um domínio pode derivar uma saída determinística como `automationBoundaryCode` a partir da avaliação já produzida pelo engine, preservando referência aos tracks que provocaram a conclusão.

### Local arquitetural inicial

Até demonstração transversal em pelo menos dois domínios:

- não pertence à UI;
- não pertence à Foundation;
- pertence à camada domínio/produto;
- deve ser derivado de estado clínico já calculado, regras/track e trace;
- não pode corrigir ou substituir a semântica emitida pelo engine.

A UI permanece passiva clinicamente.

---

## 4. Taxonomia de produto desejada

Estados internos da Foundation permanecem ricos. A superfície do produto pode comprimi-los para uma taxonomia simples, desde que a derivação seja determinística e não esconda abstention/erro.

Taxonomia candidata:

- **EM DIA**
- **RASTREAMENTO INDICADO**
- **DECISÃO INDIVIDUAL**
- **PRECISAMOS DE MAIS INFORMAÇÕES**
- **ATENÇÃO ESPECÍFICA**
- **EM ACOMPANHAMENTO ESPECÍFICO**
- **RASTREAMENTO NÃO INDICADO**
- **FORA DO ESCOPO DESTE MÓDULO**

`RASTREAMENTO NÃO INDICADO` é uma conclusão preventiva. `FORA DO ESCOPO DESTE MÓDULO` é um limite de produto. Eles não são equivalentes.

`requiresAttention` existente na Foundation não deve ser redefinido como sinônimo de `ATENÇÃO ESPECÍFICA`; atualmente ele é mais amplo e pode ser verdadeiro para `Due`, `Indeterminate`, `SharedDecision` e outros estados.

---

## 5. Precedência de segurança no produto

Um resultado global simplificado não pode ser obtido por simples renomeação de `PathwayState.status`.

A derivação deve considerar, quando relevante:

- track;
- estado;
- regra(s) ativa(s);
- contexto clínico;
- trace/provenance;
- pendências longitudinais do domínio.

Ordem conceitual de precedência de segurança:

1. erro / conflito;
2. atenção específica / acompanhamento específico ativo;
3. informação necessária;
4. decisão individual;
5. rastreamento indicado;
6. em dia / não indicado.

Uma pendência relevante não resolvida nunca pode ser mascarada por um `Due` ou `Current` de rotina concorrente.

---

## 6. Invariantes

### A. Não retorno silencioso

Uma alteração relevante não resolvida nunca pode virar `Due`/`Current` silenciosamente.

### B. Unknown não significa resolvido

Ausência de informação não equivale a resolução.

### C. Precedência temporal

Um evento anterior não pode resolver um evento posterior.

### D. Evento inferior não apaga automaticamente alerta superior

Exemplo conceitual: um FIT negativo posterior não resolve automaticamente um FIT positivo anterior.

### E. UI passiva clinicamente

A UI nunca cria, remove, corrige ou resolve estado clínico.

### F. Provenance fiel

Relatório e auditoria só podem citar regra, fato, registro e fonte que realmente participaram da execução.

### G. Geriatria não apaga achado conhecido

Contexto geriátrico pode modificar a decisão de rastreamento de rotina conforme a policy, mas não pode apagar silenciosamente um achado clínico ou exame anormal já conhecido.

---

## 7. GeriatricContext

A arquitetura mantém a possibilidade futura de um `GeriatricContext` transversal com elementos como:

- função;
- fragilidade;
- cognição;
- expectativa de vida/horizonte de benefício quando pertinente;
- metas de cuidado.

Não será criada agora uma regra universal do tipo `life expectancy < time-to-benefit -> não rastrear` para todos os domínios.

Cada policy/ruleset determina como esse contexto modifica o Nível 1.

---

## 8. Provenance e exportação

A existência de um Boundary of Automation não reduz a obrigação de explicabilidade.

Quando o MOTOR parar em `ATENÇÃO ESPECÍFICA`, o relatório futuro deve conseguir demonstrar:

- fato que provocou a parada;
- track/regra envolvidos;
- policy ativa;
- guideline/sourceId e locator;
- rulesetVersion;
- `factsUsed` / `recordsUsed` relevantes;
- motivo de suspensão da rotina;
- limite de automação aplicado.

Um eventual `automationBoundaryCode` deve ser determinístico e versionado. Não pode ser texto inventado pela UI ou por IA em runtime.

---

## 9. CCR como benchmark interno

O trabalho longitudinal profundo do CCR será preservado.

Não apagar ou reescrever por causa desta nova filosofia:

- testes;
- resolvers;
- `asOf`;
- datas parciais;
- `supersedes`;
- policies;
- safe failure;
- provenance;
- DecisionTrace;
- mecanismos longitudinais já validados.

O CCR passa a ser tratado como:

> **benchmark interno / módulo-laboratório de profundidade máxima**

A futura camada de produto pode comprimir a saída do CCR para o contrato simplificado sem fazer o domínio esquecer o que sabe.

---

## 10. Regra de ouro

> **Se uma informação é necessária para decidir prevenção/rastreamento com segurança, o MOTOR deve conhecê-la.**

> **Se ela é necessária apenas para conduzir investigação, tratamento ou vigilância especializada depois que o caso já saiu da rotina, o MOTOR deve parar e emitir uma transição segura.**

> **A única exceção é quando conhecer o desfecho mínimo dessa situação é necessário para impedir que o MOTOR produza posteriormente uma recomendação preventiva incorreta.**

---

## 11. Consequência para implementação

Nesta Fase A:

- nenhum novo estado é adicionado à Foundation;
- nenhum schema é alterado;
- nenhum resolver clínico é alterado;
- nenhuma UI é alterada;
- nenhum código de CCR é removido;
- nenhuma persistência/backend é criada;
- nenhum novo módulo clínico é iniciado.

O próximo passo funcional, após aprovação desta documentação, será demonstrar no produto CCR um contrato simplificado de Boundary of Automation sem apagar sua lógica profunda.
