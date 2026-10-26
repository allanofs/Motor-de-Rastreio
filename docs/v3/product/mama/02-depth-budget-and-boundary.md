# Mama — M0: Depth Budget e Boundary of Automation

Status: **Draft de produto clínico**.

Este documento aplica a arquitetura aprovada de `Depth Budget / Boundary of Automation` ao segundo módulo do Motor.

## Princípio central

**Mama automatiza o rastreamento de rotina; não automatiza o cuidado mamário completo.**

O Motor deve saber:

1. quando rastrear;
2. quando a pessoa está em dia;
3. quando uma decisão depende do referencial/individualização;
4. quando falta informação;
5. quando parar porque o caso deixou a rotina.

Ele não precisa decidir toda a investigação diagnóstica após um achado anormal.

---

# Nível 1 — rastreamento de rotina

Automatização permitida no primeiro release:

- identificar policy/referencial;
- idade elegível;
- confirmar contexto preventivo/assintomático;
- identificar hard exits da rotina;
- conhecer se há mamografia qualificável prévia;
- conhecer data suficiente da mamografia qualificável;
- reconhecer resultado que permita retorno simples à rotina;
- calcular intervalo conforme policy;
- concluir `Rastreamento indicado` ou `Em dia`;
- solicitar disponibilidade de mamografia apenas quando isso mudar a rota operacional;
- emitir rationale e provenance da conclusão;
- exportar relatório usando Report Foundation R3.

## Mamografia qualificável

A hipótese inicial para M1 é:

- mamografia de rastreamento realizada;
- data com precisão suficiente para intervalo;
- resultado final que permita retorno à rotina.

A definição exata de quais códigos/achados contam como `routine-clearing` será congelada em M1/M2. Não deve ser inferida da UI.

---

# Nível 2 — saída segura da rotina

Quando o caso deixa o rastreamento average-risk simples, o Motor deve parar com uma conclusão de Boundary, e não construir uma árvore diagnóstica completa.

Exemplos de saída:

## `SPECIFIC_ATTENTION_REQUIRED`

- sintoma mamário suspeito;
- achado mamográfico que não permite retorno à rotina;
- risco hereditário/alto risco conhecido ou fortemente suspeito;
- história de radioterapia torácica de alto risco;
- lesão mamária de alto risco previamente identificada;
- outro contexto em que rastreamento average-risk não seja aplicável.

Copy de produto esperada, em alto nível:

> **Atenção específica**
>
> Há uma situação que precisa ser avaliada fora do rastreamento de rotina. O Motor suspende a automação da rotina neste momento.

Não mostrar automaticamente uma sequência de ultrassom → ressonância → biópsia → cirurgia.

## `SPECIFIC_CARE_ACTIVE`

- investigação diagnóstica já em andamento;
- seguimento mastológico/oncológico ativo;
- vigilância pós-câncer ou pós-lesão de alto risco já assumida.

O Motor reconhece que o caso não pertence ao rastreamento de rotina e não tenta reiniciá-lo silenciosamente.

---

# Nível 3 — deliberadamente fora do primeiro release

Não automatizar profundamente em Mama V1:

- conduta completa por BI-RADS;
- escolha de exame diagnóstico complementar;
- indicação de biópsia;
- interpretação de anatomopatológico;
- algoritmos de genética;
- cálculo detalhado de risco por Tyrer-Cuzick/Gail/BOADICEA;
- protocolos de ressonância em alto risco;
- vigilância pós-tratamento;
- tratamento oncológico;
- manejo de lesões benignas ou provavelmente benignas;
- manejo de densidade mamária com imagem suplementar.

Esses itens podem ser módulos/verticais futuras, mas não devem aumentar o custo de implementação do rastreamento de outros cânceres.

---

# Informação mínima que a entrevista deve buscar

M0 propõe que a entrevista de Mama comece menor que o CCR profundo.

Ordem conceitual provável:

1. Referencial + pessoa
   - policy;
   - data de referência;
   - idade.

2. Contexto
   - rastreamento preventivo/assintomático.

3. Condições que mudam a rota
   - conjunto mínimo de hard exits.

4. Histórico de rastreamento
   - nunca realizou / conhecido / desconhecido;
   - mamografia qualificável mais recente quando necessário.

5. Recurso
   - disponibilidade da mamografia apenas quando uma ação de rotina já foi calculada.

Não perguntar por padrão:

- densidade mamária;
- detalhes extensos de BI-RADS;
- ultrassom;
- ressonância;
- biópsia;
- história oncológica extensa após um hard exit já conhecido.

---

# Tratamento de achado mamográfico anterior

Para evitar repetir o problema de profundidade do CCR:

- resultado claramente compatível com retorno à rotina -> pode ancorar o relógio de rastreamento;
- resultado anormal/indeterminado ou seguimento não resolvido -> `Atenção específica`;
- não automatizar a sequência diagnóstica subsequente no primeiro release.

O objetivo é saber **se o relógio de rastreamento pode continuar**, não resolver toda a mamografia.

---

# Decisão individual

O estado `SHARED_DECISION` deve existir quando o próprio referencial deixa a decisão individualizada, por exemplo:

- faixas etárias fora do núcleo populacional do SUS nas quais a mamografia pode ser acessada sob demanda com discussão de riscos/benefícios;
- idades superiores ao limite de rotina em referenciais que recomendam individualização por saúde/expectativa de vida;
- outros cenários explicitamente descritos pela policy.

A UI não deve converter `SHARED_DECISION` em recomendação positiva automática.

---

# Comparar referenciais

O mesmo draft clínico deve poder produzir resultados diferentes por policy sem alterar os fatos do paciente.

Exemplo arquitetural esperado para pessoa assintomática de 45 anos, risco habitual:

- SUS oficial: decisão individual / acesso sob demanda, conforme policy vigente;
- Brasil ampliado: rastreamento anual indicado;
- USPSTF: rastreamento bienal indicado.

A comparação deve explicar a divergência e apontar as fontes reais utilizadas por cada policy.

---

# Report Foundation R3

Mama deve ser o primeiro consumidor novo de `v3/src/product/reporting/`.

O módulo deverá reutilizar:

- `StructuredReportModel`;
- `resolveReportProvenance`;
- `assessReportExportEligibility`;
- helpers HTML/A4 compartilhados.

Continuam locais de Mama:

- snapshot clínico;
- labels;
- rationale;
- conceitos/modalidades;
- regras que escolhem `sourceRefs`;
- boundary clínico;
- renderer de conteúdo específico.

Não copiar a infraestrutura do CCR.

---

# Gate de M0

M0 será considerado pronto para aprovação humana quando:

- a matriz de referenciais estiver documentada;
- o núcleo de rotina estiver separado dos hard exits;
- a profundidade máxima do primeiro release estiver explícita;
- as divergências SUS vs sociedades brasileiras vs USPSTF estiverem preservadas;
- as pendências que exigem revisão clínica estiverem listadas;
- nenhuma regra executável tiver sido criada prematuramente.