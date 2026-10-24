# 12 — Casos adversariais — manifesto clínico pós-auditoria

**60 casos documentais de referência.** Desde a Fase 6.5, este arquivo funciona como **manifesto clínico-fonte** da suíte adversarial executável. Nem toda linha corresponde a exatamente um `it()` isolado: alguns casos são cobertos por propriedades transversais, matrizes de policy/care-setting, permutações temporais ou testes especializados das Fases 6.3–6.5. A rastreabilidade executável está distribuída principalmente em `tests/ccr/goldenSafety.test.ts`, `longitudinal.test.ts`, `familyHistory.test.ts`, `specialRisk.test.ts` e regressões da versão mais recente. `asOf` padrão: 24/10/2026 quando não indicado.

| Caso | Cenário | Expected consolidado |
|---|---|---|
| 001 | 49a, risco habitual, SUS | sem rotina SUS; não é contraindicação diagnóstica |
| 002 | completa 50a, SUS, nunca rastreado | Due para FIT se demais gates conhecidos |
| 003 | 60a, SUS, never_performed confirmado | Due FIT |
| 004 | 75a, SUS, never_performed | dentro da faixa: Due FIT se elegível |
| 005 | 76a, SUS, sem episódio aberto | fora da nova rotina SUS |
| 006 | 80a, Internacional, nunca rastreado | decisão seletiva; não Due automático |
| 007 | 80a, Internacional, screening prévio | decisão seletiva com histórico/saúde/preferência |
| 008 | 60a recusa informada | registrar preferência; não inventar realização |
| 009 | histórico desconhecido | não inferir never_performed |
| 010 | declara nunca ter feito qualquer screening CCR | never_performed pode sustentar Due se elegível |
| 011 | FIT− SUS há 14 meses | Current |
| 012 | FIT− SUS 2023 | Due pelo intervalo bienal |
| 013 | FIT+ sem seguimento | InFollowUp; colonoscopia necessária |
| 014 | FIT+ antigo sem resolução | permanece aberto |
| 015 | FIT+→FIT− sem colonoscopia | FIT+ permanece aberto |
| 016 | FIT coletado; resultado pending | PendingResult; não Current |
| 017 | FIT inválido | não ancora; regularizar segundo laboratório/serviço |
| 018 | FIT+→colonoscopia normal high-quality | SUS: episódio resolvido, agenda futura bloqueada; Internacional: q10 |
| 019 | FIT+→colonoscopia com preparo inadequado | follow-up continua aberto |
| 020 | colonoscopia normal anterior→novo FIT+ | novo gatilho; exame anterior não resolve |
| 021 | colonoscopia incompleta após FIT+ | follow-up continua aberto |
| 022 | “sem lesão”, mas preparo inadequado | não qualifica como normal resolutivo |
| 023 | colonoscopia com pólipo | revisão de surveillance, sem intervalo automático |
| 024 | lesão com AP confirmando CRC | sair do screening; HandedOff só se cuidado assumido |
| 025 | CRC prévio tratado | fora da rotina habitual; `ClinicalReviewRequired` se cuidado especializado não estiver confirmado |
| 026 | pólipo prévio de tipo desconhecido | ClinicalReviewRequired |
| 027 | Crohn conhecido, extensão incerta | revisão; não average-risk automático |
| 028 | história familiar nunca perguntada | não assumir ausência; indicação mínima pode continuar conhecida, estratégia pode ficar pendente |
| 029 | 1 FDR CRC aos 70, Internacional | iniciar aos 40/10a antes; depois average-risk; sem q5 universal |
| 030 | 1 FDR CRC aos 42, Internacional | ACG: colonoscopia aos 40/10a antes e q5 |
| 031 | 2 FDR com CRC | ACG: colonoscopia aos 40/10a antes e q5 |
| 032 | Lynch confirmada | revisão/handoff especializado; diagnóstico não prova HandedOff sozinho |
| 033 | FAP confirmada | revisão/handoff especializado; diagnóstico não prova HandedOff sozinho |
| 034 | profissional informa que caso não é contexto de screening | Motor se abstém; não faz triagem/urgência |
| 035 | profissional está incerto se caso é preventivo | Motor se abstém; avaliação clínica fora do módulo |
| 036 | FIT indisponível no SUS | preservar recomendação; clarificar rota |
| 037 | FIT+ e colonoscopia indisponível | InFollowUp + regulação; não repetir FIT como substituto |
| 038 | 47a average-risk | SUS sem rotina; BA-A shared decision; Internacional Grade B |
| 039 | FIT− só “2025” | respeitar data parcial; anual pode ficar Indeterminate, bienal pode permanecer Current conforme janela |
| 040 | mesmos eventos digitados em ordens diferentes | mesma interpretação temporal |
| 041 | FIT+ e colonoscopia no mesmo dia sem hora | ordem não demonstrada; revisão |
| 042 | FIT+ só mês/ano e colonoscopia só ano sobreposto | não provar posterioridade |
| 043 | 85a com FIT+ aberto desde 84 | follow-up não é apagado por teto etário |
| 044 | polipectomia após FIT+ com AP pending | InFollowUp/ClinicalReviewRequired |
| 045 | colonoscopia agendada e cancelada | FIT+ permanece aberto |
| 046 | FIT− válido e depois FIT inválido | inválido não apaga âncora anterior; avaliar nova coleta |
| 047 | FIT+→colo normal→novo FIT+ | último positivo abre novo follow-up |
| 048 | nunca fez FIT, mas tem colonoscopia documentada | historyKnowledge=known, não never_performed global |
| 049 | história familiar unknown, demais dados permitem reconhecer indicação etária | reconhecer indicação mínima; não afirmar estratégia definitiva average-risk |
| 050 | usuário solicita teste sanguíneo ACS 2026 | fora do piloto; explicar sem fallback automático |
| 051 | código administrativo antigo após B07 | não usar código clínico/cadastro por presunção; questão administrativa |
| 052 | radioterapia pélvica prévia, policy Internacional USPSTF | não importar automaticamente critério ACS; revisão se relevante |
| 053 | apenas avó com CRC aos 78 | Internacional/ACG: 1 SDR isolado pode seguir average-risk se sem outros modificadores |
| 054 | laudo “normal” com pólipo hiperplásico | não generalizar; revisar se achado permite rotina habitual |
| 055 | FIT− em 24/10/2024, SUS, asOf 24/10/2026 | Due na data do intervalo; sem grace period inventado |
| 056 | exame futuro em relação ao asOf | dado inválido/Indeterminate; não Current |
| 057 | status de rotina aparentemente Current + novo FIT+ | follow-up prevalece; nenhuma ação redundante de screening |
| 058 | never_performed contradiz FIT existente | contradição explícita; revisão, sem escolher silenciosamente |
| 059 | profissional muda avaliação de preventiva para não preventiva | Motor interrompe rota de screening e se abstém; não faz diagnóstico |
| 060 | adenoma avançado prévio + colonoscopia posterior sem novas lesões | permanece no contexto de surveillance; não retornar ao habitual automaticamente |

## Invariantes executáveis consolidados na Fase 6.5

- mesmas datas/eventos em ordens de entrada diferentes devem gerar a mesma saída;
- `unknown` nunca equivale a `false` nem a `never_performed`;
- same-day/intervalos sobrepostos não ganham ordem fictícia;
- FIT+ aberto nunca pode coexistir com ação rotineira redundante;
- policy comparison preserva divergência sem escolher “vencedora”;
- Care Setting altera rota operacional, não a indicação científica;
- hard exclusions (CRC prévio, surveillance por pólipo relevante, DII colônica, síndrome hereditária) precisam produzir uma saída explícita de revisão, não apenas sumir da rotina;
- diagnóstico/risco especial não equivale a `HandedOff` sem assunção real do cuidado;
- traces devem preservar policy, ruleset, fontes e evidência usada/considerada;
- nenhum caso transforma o Motor em triador de sintomas/urgência.

O detalhamento da cobertura executável e das falhas encontradas durante o ataque adversarial está em `20-phase6-5-golden-suite.md`.