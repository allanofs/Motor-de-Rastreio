# Mama — M1: contrato temporal mínimo

Status: **Draft de arquitetura clínica / sem intervalos executáveis**.

O contrato temporal de Mama deve ser muito menor que o do CCR. O objetivo é impedir retorno silencioso à rotina e preservar datas suficientes para calcular intervalos quando as regras forem implementadas.

## Invariantes temporais

1. **Nunca realizou ≠ histórico desconhecido**
   - `never_performed` pode ser uma informação confirmada;
   - `unknown` nunca deve ser promovido a `never_performed` por presunção.

2. **Somente mamografia de rastreamento pode ancorar o relógio rotineiro por padrão**
   - mamografia diagnóstica não deve ser usada silenciosamente como âncora de rastreamento;
   - qualquer exceção futura precisa ser explicitamente governada.

3. **Resultado que exige atenção bloqueia retorno automático à rotina**
   - se o episódio anterior é `attention-required`, o Motor deve permanecer fora da rotina até existir informação explícita de que o episódio foi resolvido e que retorno à rotina é permitido;
   - o Motor não precisa saber todos os detalhes da investigação que produziu essa resolução.

4. **Resultado indeterminado não vira normal por ausência de dados posteriores**
   - `indeterminate` preserva incerteza;
   - ausência de registro de seguimento não equivale a seguimento concluído.

5. **Não inventar ordem temporal**
   - datas iguais, parciais ou imprecisas não autorizam o Motor a presumir que um evento resolveu outro;
   - quando a ordem for clinicamente necessária e não puder ser demonstrada, o estado deve permanecer indeterminado/atenção específica.

6. **Evento posterior não apaga automaticamente evento anterior relevante**
   - um novo exame rotineiro não deve apagar um achado anterior ainda não explicitamente resolvido;
   - isto é o equivalente mamário do princípio que o CCR validou com FIT positivo, mas sem importar a árvore longitudinal profunda do CCR.

7. **O intervalo pertence à policy, não ao exame**
   - a mesma mamografia de rastreamento pode estar `Current` em uma policy e `Due` em outra por causa de intervalos diferentes;
   - M1 não codifica anual/bienal. A implementação pertence às rules/policies posteriores.

## Estado mínimo necessário para continuidade

O Motor precisa conseguir distinguir:

- nenhum exame prévio confirmado;
- histórico desconhecido;
- mamografia de rastreamento prévia que potencialmente ancora rotina;
- mamografia/episódio prévio que exige atenção específica;
- episódio já assumido por cuidado específico;
- retorno à rotina explicitamente permitido.

Ele **não** precisa representar, no primeiro release:

- sequência completa de BI-RADS;
- tipo de biópsia;
- histologia detalhada;
- cirurgia/tratamento;
- cadeia completa de imagem diagnóstica.

## Qualificação futura de uma âncora de rotina

Para M2/M3, a definição executável de uma mamografia qualificável deverá exigir, no mínimo, critérios explícitos para:

- modalidade correta;
- data válida suficiente;
- resultado/disposição que permita rotina;
- ausência de episódio não resolvido mais prioritário.

Até essa definição ser governada, M1 apenas representa os conceitos e não cria uma função automática de qualificação.

## Datas e safe failure

Devem ser reutilizadas as primitivas temporais já existentes na Foundation. Mama não cria um novo sistema de datas.

Quando a precisão da data não for suficiente para decidir se o intervalo expirou, a conclusão deve ser indeterminada em vez de arredondar ou inventar um grace period.
