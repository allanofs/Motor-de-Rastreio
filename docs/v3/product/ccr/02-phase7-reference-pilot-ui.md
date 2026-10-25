# Phase 7.4 — UI piloto de referência CCR

**Data:** 24/10/2026  
**Branch:** `v3-ccr-product-integration`  
**PR:** #4 — Draft  
**Estado:** implementação de referência local; sem deploy; não autorizada para uso clínico real.

## Objetivo

Criar uma interface mínima e executável que demonstre como integrar o ruleset ativo `crc-0.5.5-phase6-active` sem duplicar lógica clínica na UI.

A UI de referência fica isolada em:

`v3/pilot/ccr/**`

Ela não substitui nem sobrescreve uma interface paralela/local do projeto. Serve como contrato executável e referência para adaptação.

## Dependências

Nenhum framework frontend novo foi adicionado. O piloto usa apenas:

- TypeScript;
- DOM nativo;
- Vite já existente no projeto.

Isso mantém o custo de descarte/refatoração baixo enquanto a arquitetura de produto ainda está em validação.

## Consumo permitido

A UI importa somente:

`../../src/product/ccr`

Ela não pode importar diretamente:

- `clinical/ccr/**`;
- `engine/**`;
- `model/**`.

Todo comportamento clínico atravessa:

`evaluateCcrProductDraft()` → `presentCcrProduct()`.

## Funcionalidades do piloto

- seletor explícito das três policies;
- `asOf` visível e explícito;
- idade;
- confirmação de contexto preventivo;
- hard exclusions / risco especial;
- história familiar com disclosure condicional;
- historyKnowledge e suficiência do histórico;
- seleção humana de estratégia onde aplicável;
- múltiplos FIT e colonoscopias em memória;
- papel explícito da colonoscopia;
- precisão parcial de datas via texto `AAAA`, `AAAA-MM` ou `AAAA-MM-DD`;
- disponibilidade de FIT/colonoscopia;
- resultado nas seis seções aprovadas;
- actions com texto clínico governado sem reescrita;
- rota operacional separada da indicação;
- expansão de auditoria com missing data, guardrails e source IDs;
- ruleset version visível.

## Privacidade

O piloto não usa:

- localStorage;
- sessionStorage;
- IndexedDB;
- cookies de paciente;
- parâmetros de URL para paciente;
- rede/fetch/XHR/sendBeacon;
- analytics;
- logs.

Os dados existem apenas em memória na página e desaparecem ao recarregar/fechar a sessão.

## Release gate

O topo da interface mostra explicitamente:

> PILOTO LOCAL DE INTEGRAÇÃO — NÃO AUTORIZADO PARA USO CLÍNICO REAL OU LIBERAÇÃO PÚBLICA

O HTML também contém `noindex,nofollow`.

## Build isolado

Comandos locais:

```bash
cd v3
npm ci
npm run dev:ccr-pilot
```

Build sem deploy:

```bash
npm run typecheck:ccr-pilot
npm run build:ccr-pilot
```

Saída:

`v3/dist-ccr-pilot/**`

O build da Foundation continua separado em `v3/dist/**`.

O `npm run check` agora exige:

1. typecheck Foundation;
2. typecheck da UI piloto;
3. schema checks;
4. testes;
5. build Foundation;
6. build UI piloto.

## O que ainda NÃO foi validado

Build verde não equivale a validação de usabilidade.

Ainda faltam antes de qualquer release real:

- inspeção visual/interativa em navegador;
- revisão de linguagem por usuários-alvo;
- teclado/foco/acessibilidade em execução;
- comportamento responsivo em dispositivos reais;
- teste de erro humano/uso incorreto do formulário;
- avaliação de tempo de preenchimento;
- eventual teste com profissionais;
- decisão explícita de release/deploy.

## Próximo gate

**Phase 7.5 — revisão visual/interativa e usabilidade do piloto**, sem deploy.

Esse é um ponto em que uma execução com navegador/Work é útil: abrir o piloto, percorrer cenários clínicos representativos, observar disclosure, foco, estados vazios/erro, responsividade e comparar a UI existente do projeto com este contrato de referência.