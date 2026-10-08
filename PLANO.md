# Plano até a entrega (03/12/2026)

Atualizado em 08/10/2026: Fase 0 (`d938108`), parte 5a (`1143420`), ajustes da 5a + parte 5b (`e0c8d93`), parte 5b.1 (`55a6025`) e parte 5c (`5dcd43f`) no GitHub. Desde 08/10 o trabalho segue em **modo contínuo** (regras no CLAUDE.md).

## Onde parei

- **Parte atual:** 5e, DOC-003 (documentar ataques de clique, esquiva e cores). A 5d está feita (commit local).
- **O que falta para fechar a Fase 1:**
  - 5e (DOC-003: documentar ataques de clique, esquiva e cores);
  - 7a (TASK-079: contratos na Guilda);
  - 7b (TASK-071: pentágono na seleção e HUD do Reino);
  - os dois relatórios da fase, com o passo a passo do Supabase (TASK-090), a lista de arte (TASK-110) e de som (TASK-104), e as perguntas ao grupo.
- **Próximo passo:** a 5e.
- **Perguntas guardadas para o fim da Fase 1:**
  - **Cura do Sacerdote:** com alguém ferido o tempo todo, a aura fica ligada só 50% do tempo (aura de 3 s, recarga de 6 s, sem custo de mana). Propor um ajuste e perguntar antes de mudar (pedido do Pablo).
  - **DOC-003, para o grupo decidir:** se os 5 ataques de clique são os definitivos, se a aura do Sacerdote é ataque básico ou habilidade, e a cor do Guerreiro.

### Plano das partes que fecham a Fase 1 (modo contínuo)

**5d · Sacerdote e níveis da IA (pedido do Pablo em 08/10): FEITO.** 530 testes e 215 conferências no navegador. A aura ficou ligada 50% do tempo com alguém ferido; o ajuste vai como pergunta no fim da fase.
- **Regra nova do Sacerdote, em todos os níveis:** cura sempre que alguém do grupo (Líder, aliados ou ele mesmo) não estiver com a vida cheia, em combate ou fora dele.
- **Ordem:**
  1. levantar caídos;
  2. o mais ferido;
  3. em empate (diferença pequena, provisório no balanceamento), o Líder.
- **O que o nível muda: só a posição e a escolha do alvo.**
  - Básica: vai até quem precisa, mas, errando, escolhe o ferido mais perto em vez do mais ferido.
  - Média: o mais ferido.
  - Avançada: conta como mais urgente quem está sendo atacado e cura do lado de trás do ferido, longe do mob.
- **Regra pura:** `quemCurar` e `posicaoParaCurar` em `regras/iaDosAliados.js`, com testes.
- **Roteiro:** conferência "aliado ferido e Sacerdote livre: a cura começa em até 3 s".
- **Medir quanto tempo o Sacerdote fica sem curar com alguém ferido** (a aura dura 3 s e recarrega em 6 s). Se for demais, propor ao Pablo um ajuste e perguntar antes de mudar.
- **IA de cada nível sem ser atrapalhada pelas outras:**
  - a avançada desvia de longe de quem está parado no caminho;
  - a média dá um passo para o lado quando quase encosta;
  - a básica continua como está (escorrega e destrava);
  - o Guerreiro avançado não fica esperando um Tanque que errou: se o Tanque não está na frente, ele protege o Líder.
- **Regra pura:** `pontoDeDesvio` em `regras/movimento.js`, com testes e uma conferência no roteiro.
- **Documentação:** RF42, UC31, UC37, HU31, HU37, "Alterações do projeto" e o Conceito 21.5.

**5e · DOC-003:**
- Documentar no RF35, no RF36 e no Conceito o ataque de clique de cada classe, a esquiva (sem dano durante o avanço e com recarga) e as cores, como estão hoje.
- O que o grupo precisa decidir fica marcado como pendente e vai na pergunta do fim da fase:
  - se os 5 ataques são os definitivos;
  - se a aura do Sacerdote é ataque básico ou habilidade;
  - a cor do Guerreiro (azul provisório).

**7a · TASK-079, contratos na Guilda:**
- Abas "Contrato temporário" e "Contrato permanente" usando as regras da `regras/guilda.js`:
  - só aparecem as classes que o jogador não tem;
  - mostram preço, partidas e nível;
  - o permanente encerra o temporário da mesma classe;
  - mostram as partidas restantes de cada temporário;
  - o temporário nunca aparece como Líder na Preparação;
  - a mensagem diz o motivo quando falta ouro.
- O equipamento fixo do temporário espera o catálogo (TASK-070, Fase 4).
- Testes das telas e roteiro: contratar com o ouro ganho na partida e ver o novo aliado na partida seguinte.

**7b · TASK-071, pentágono e HUD do Reino:**
- **Componente de pentágono** (SVG) com os 5 atributos:
  - na Seleção de classe, com a descrição da classe e o pentágono mudando de forma de uma classe para outra;
  - reaproveitado nas Árvores.
- **HUD do Reino:** apelido (convidado: "Convidado"), Líder, ouro e missão ativa, todos do save.
 Os roteiros de teste manual e o registro dos testes ficam na pasta [`testes/`](testes/). Base: o documento "Auditoria e Backlog do Jogo RPG" (06/10), conferido contra o repositório de verdade na TASK-001.

**Regra deste plano:** cumprir todos os requisitos da pasta `documentacao`. A auditoria sugere cortes (seção 12 dela), mas cortar uma funcionalidade é deixar de cumprir um requisito. Por isso, aqui os cortes só entram se o grupo decidir, e o que for cortado vai para o Conceito como "fora do beta".

## 1. Onde o projeto está de verdade (TASK-001)

| Pergunta da TASK-001 | Resposta |
|---|---|
| A etapa 2 foi commitada? | Sim ("Esqueleto Funcional"), e a etapa 3 também ("Telas P1 da parte 3"). O GitHub está no mesmo commit que o computador (`7344f23`). |
| E a etapa 4? | Pronta e testada, mas **ainda não commitada**. |
| O combate foi executado? | **Não.** Não existem `src/jogo/`, `src/dados/ataques.js` nem `src/dados/mobs.js`. O "prompt do combate" não rodou neste repositório. |
| O build passa? | Sim. Lint sem avisos e **231 testes passando** (`npm test`). |
| `base.py` existe? | Não. Os `.md` da documentação são editados à mão. |
| A pasta `docs` antiga existe? | Não, nem no computador nem no GitHub. |
| TODOs e arquivos sem uso | Nenhum TODO. Sem uso: `src/App.css`, `src/assets/` e `public/icons.svg`, sobras do exemplo do Vite (apagadas em 06/10). |

### O que a auditoria não sabia

A auditoria não leu o código. Por isso, vários itens dela estão desatualizados:

- **As etapas 3 e 4 já estão prontas.** Elas incluem salvamento com versão, partida interrompida descartada, uma aba só para o convidado, som e tema salvos, taxa, resultado, pontuação, XP e peso. O Vitest está instalado. A auditoria dá tudo isso como inexistente.
- **O problema 6 da auditoria ("etapas fora de ordem") não aconteceu aqui.** As etapas 3 e 4 vieram antes da 5.
- **I-03 resolvido:** o CLAUDE.md marca a etapa 4 como a atual.
- **I-06 resolvido:** entrar numa conta que já existia não mistura o progresso do convidado.
- **TASK-024:** a regra da aba única usa a trava do navegador (Web Locks). Ela é mais segura que a marca no localStorage sugerida e se solta sozinha quando a aba fecha.
- **TASK-011:** os valores provisórios estão em `src/dados/balanceamento.js`. O `documentacao/Balanceamento.md` é gerado a partir dele (`npm run balanceamento`), e há testes que barram números absurdos.
- **BLOCKER-008 resolvido:** a base da partida não existe, então a TASK-004 começa do zero.

## 2. Situação de cada item do backlog

Legenda: **FEITO** · **FALTA POUCO** (diz o quê) · **A FAZER** · **COM VOCÊS** (não é código: conteúdo, decisão, conta externa) · **BLOQUEADO**.

### EPIC-01 · Verificação e fundação
| Item | Situação |
|---|---|
| TASK-001 Verificar o estado real | FEITO (06/10) |
| TASK-002 Limpar o Vite, CLAUDE.md, commit | FALTA POUCO, COM VOCÊS: só o commit. As sobras do Vite foram apagadas (06/10, com a autorização do Pablo). O CLAUDE.md está atualizado (06/10): Salão da Glória com as Conquistas, Phaser, formato do save, link para este plano e commits com o Pablo |
| TEST-001 Conferir as telas no navegador | FALTA POUCO: 18 telas conferidas por prints no Edge (04/10), sem sobreposição; falta o seu roteiro em 1366×768 |
| TASK-003 Quadro no Trello | COM VOCÊS (posso gerar o texto de cada card) |
| TASK-004 Protótipo de combate | FEITO (06/10) na parte 5a: arena de teste com Phaser 4.2.1, Líder, 5 ataques de teste e 2 inimigos. Teste visual feito pelo Pablo e commit `1143420` |

### EPIC-02 · Documentação sincronizada
| Item | Situação |
|---|---|
| DOC-001 Aplicar as decisões na documentação | FEITO (06/10): Requisitos, Casos de Uso e Histórias com o texto novo e uma seção "Alterações do projeto" no fim de cada um; diagrama 04 atualizado e PNG gerado pelo PlantUML; Conceito com a seção 21 "Alterações do projeto" e o PDF exportado pelo Word; README da documentação |
| DOC-002 Pasta docs antiga | FEITO: ela não existe no GitHub |
| DOC-003 Ataques de clique, esquiva e cores | A FAZER depois da parte 5a |
| DOC-004 Narrativa e Como jogar | COM VOCÊS (texto); posso rascunhar o Como jogar a partir do RF35 |
| DOC-005 README do código | FEITO (06/10): como rodar, pastas, decisões e equipe |
| DOC-006 Revisão final | A FAZER na semana de 23/11 |

### EPIC-03 · Conteúdo e balanceamento (Frente B, até 19/10)
| Item | Situação |
|---|---|
| TASK-010 Habilidades do beta | COM VOCÊS. Até lá, uma habilidade de teste por classe na tecla 1 (feito na 5b, em `src/dados/habilidades.js`) |
| TASK-011 Valores provisórios | FEITO: o `documentacao/Balanceamento.md` é gerado pelo código (agora com os contratos e a multa das missões); falta a aprovação do grupo |
| TASK-012 Mobs e Boss da Floresta | COM VOCÊS (posso propor uma primeira lista) |
| TASK-013 Layout da Floresta | COM VOCÊS (posso propor) |
| TASK-014 Catálogo e rotação do Mercado | COM VOCÊS |
| TASK-015 Missões e conquistas | COM VOCÊS |
| TASK-016 Mecânica dos minijogos | COM VOCÊS |

### EPIC-04 · Estado e salvamento local (etapa 3)
| Item | Situação |
|---|---|
| TASK-020 Modelo do save | FEITO (06/10): habilidades (nível 1 a 5), até 3 ativas e equipamento nos personagens; missão, mochila e contratos com formato conferido ao carregar; formato descrito no CLAUDE.md. O apelido é da conta (etapa 8) |
| TASK-021 Estado real | FEITO |
| TASK-022 Salvamento com versão | FEITO |
| TASK-023 Convidado e partida descartada | FEITO, com o teste do contrato temporário: partida interrompida não muda o ouro nem gasta partida |
| TASK-024 Uma aba por navegador | FEITO |
| TASK-025 Som e tema guardados | FEITO; falta decidir o tema padrão (hoje é o claro) |
| TEST-002 Testes do salvamento | FEITO |

### EPIC-05 · Regras puras com testes (etapa 4)
| Item | Situação |
|---|---|
| TASK-026 Vitest | FEITO |
| TASK-027 Taxa | FEITO, com os exemplos do §12.2 como testes |
| TASK-028 Resultado e pontuação | FEITO |
| TASK-029 XP | FEITO (a sobra vai para o Líder) |
| TASK-030 Mochila | FEITO |
| TASK-031 Regras da Guilda | FEITO (06/10): `src/regras/guilda.js` (aceitar, progresso, entregar, abandonar, contratar), com 19 testes. Cada partida terminada gasta uma partida dos contratos temporários (RF52) |
| TEST-003 Limites das regras | FEITO (06/10): valores negativos, ouro ganho 0 e quantidade 0 testados; limites dos contratos no `balanceamento.test.js`. São 266 testes ao todo |

### EPIC-06 · Partida jogável (etapa 5)
- **TASK-004 (protótipo de combate) e TASK-042 (grupo seguindo o Líder):** FEITO (06/10), parte 5a, com o teste visual do Pablo e o commit `1143420`. Arena de teste com pedras e boneco de treino; Líder com WASD, mira no mouse, esquiva e o ataque de teste da classe; o grupo inteiro do save seguindo em formação; mob vermelho e atirador; HUD e barra de teste em React.
- **Ajustes da 5a (06/10), esperando o teste visual:**
  - Ninguém fica em cima de ninguém: zona de separação em volta de cada corpo, batida entre todos (inclusive aliados com o Líder), outros corpos tratados como parede ao andar e, depois da física, uma correção que desfaz o que ficou um dentro do outro (`regras/movimento.js`). Num aperto forte contra a pedra, as bordas ainda podem se encostar até cerca de 6 px por um instante.
  - Ninguém fica preso: caminho numa grade em volta das pedras (substitui o desvio de uma pedra por vez) e anti-travamento (escorrega, dá a volta e, em último caso, desliza até o ponto livre mais próximo).
  - Ninguém nasce em pedra, fora da borda ou em cima de outro.
  - HUD numa faixa no topo e barra de teste numa faixa embaixo, fora da área jogável.
  - Pedras coladas em L na arena e botão "Juntar todos".
  - Painel de desenvolvimento minimizável ("</> DEV").
  - Roteiro do navegador no repositório: `npm run testar:navegador` (116 conferências; cada rodada usa uma porta livre e fecha o próprio Edge).
- **Parte 5c, a última da partida (07/10):** FEITO, teste visual do Pablo (aprovado em 08/10) e commit `5dcd43f`.
  - **TASK-040 (em combate, pausa e Q):** em combate = dano nos últimos 5 s ou um mob perseguindo o grupo. Esc em combate mostra "Você não pode pausar agora". Q fora de combate começa os 15 s, Q de novo cancela, e o combate faz a contagem voltar a 15 s. O "Voltar ao Reino" da pausa usa a mesma contagem.
  - **TASK-041 (fuga com F):** o primeiro F mostra o custo atual (taxa e ouro), o segundo confirma e Esc cancela. São 5 s, mesmo em combate; se o Líder cair, continua; se todos caírem, é Derrota. Confirmada, não se cancela.
  - **TASK-048 (fim com números reais):** os mobs dão XP e ouro; o fim chama as regras da etapa 4 (resultado, taxa com perdidos e caídos, pontuação, XP). O save recebe ouro, XP, níveis, pontos, monstros e a partida. O Resumo mostra tudo.
  - **TASK-049 (HUD completo):** tempo, pontuação, ouro ganho, custo da fuga, "em combate", foco e mudo, com o lugar do minimapa reservado. As mensagens curtas (crítico, nível, desmaio, perdido, "não pode pausar", retorno) ficam abaixo do HUD. Cabe em 1366×768. Tecla M: mudo.
  - **Relógio da partida:** para na pausa e com a aba escondida (antes, os 30 s do desmaio e as recargas continuavam correndo na pausa).
  - **Crítico:** 5% + 0,5% por ponto de Agilidade, dano ×1,5.
  - **Pendência da 5b.1:** botão "Testar foco" na barra de teste.
  - **TEST-004:** regras novas com testes (`regras/andamentoDaPartida.js`, `regras/ganhosDaPartida.js`, `montarFimDaPartida`) e o roteiro do navegador com os 4 resultados de verdade e os casos de limite.
- **Parte 5b.1, ajustes da IA dos aliados (07/10):** FEITO, teste visual do Pablo e commit `55a6025`.
  - **Sem tremor:** parados, os aliados param em qualquer ponto de uma zona confortável em volta do Líder e só voltam a andar quando ele se afasta além de uma folga. Também têm um detector de tremor e dão passagem ao Líder.
  - **Separação:** só age quando dois corpos se encostam.
  - **Linha de tiro:** Arqueiro e Mago não atiram na pedra de propósito; trocam de alvo ou vão para um lugar livre.
  - **Três níveis de IA, pelo nível de cada personagem:** básica (1 a 29), média (30 a 69) e avançada (70 a 100), com erros sorteados a cada poucos segundos.
    - A avançada tem formação de combate, Arqueiro no inimigo mais forte, recuo andando do golpe avisado e momentos de foco.
    - Os aliados não esquivam.
    - Seletor "IA:" na barra de teste.
  - **Regras:** em `regras/nivelDaIA.js` e `regras/iaDosAliados.js`, com testes.
- **TASK-043 a TASK-046 (parte 5b):** FEITO (06/10), teste visual do Pablo e commit `e0c8d93`.
  - **TASK-043:** IA de cada classe. Tanque atrai, Guerreiro vai no mais próximo, Arqueiro de longe, Mago onde há mais mobs e todos voltam se o Líder se afastar. Os inimigos atacam qualquer um do grupo e os aliados levam dano.
  - **TASK-044:** desmaio de 30 s, ajuda de 5 s com a área limpa, perdido pela Pedra de Retorno (lugar guardado), Retorno forçado se o Líder não for levantado e Derrota quando todos caem. Fica registrado se houve desmaio. A "Derrota em 2 s" saiu.
  - **TASK-045:** Sacerdote cura e levanta, sempre o Líder primeiro, e usa a Ressurreição quando tem mana e recarga.
  - **TASK-046:** mana pela Inteligência, que volta pela Sabedoria; teclas 1 a 3 com custo, recarga e aviso.
  - Regras em `regras/iaDosAliados.js`, `regras/desmaio.js` e `regras/habilidades.js`, com testes.
- **Provisório na partida (anotado para não esquecer):**
  - **Habilidades de teste na tecla 1, até a TASK-010 (19/10):** Giro (Guerreiro), Tiro perfurante (Arqueiro; atravessa os inimigos e para em pedra), Meteoro (Mago) e Provocação (Tanque). A Ressurreição do Sacerdote vem da documentação, mas os números dela são provisórios. As teclas 2 e 3 ficam vazias. Trocar em `src/dados/habilidades.js` e `src/jogo/habilidades/`.
  - **Todos os números novos** (mana, IA, desmaio, separação, travamento) estão no `balanceamento.js` e no `Balanceamento.md`. A área limpa de 250 px foi aprovada pelo Pablo, mas o valor é provisório.
  - **5c (aprovados pelo Pablo em 07/10, mas provisórios):** XP e ouro dos mobs de teste (mob vermelho 20 XP e 12 de ouro; atirador 25 e 15), a borda da arena a 1400 px do ponto inicial (até a etapa 6), o crítico (5% + 0,5% por Agilidade, ×1,5) e o tempo das mensagens do HUD (2,5 s). Os 5 s de "em combate", os 15 s do Q e os 5 s da fuga vêm da documentação (`dados/regras.js`).
  - **IA dos aliados (5b.1):** as faixas de nível, as chances de erro, a zona confortável, o tremor, o foco e o recuo são números provisórios do `balanceamento.js`. Com o XP da 5c, a IA de cada aliado segue o nível dele; o nível ganho vale a partir da partida seguinte.
  - **Minimapa e região:** o lugar no HUD está reservado, sem conteúdo, até a etapa 6. Recursos coletados e itens da partida ficam em zero até a etapa 6 e a TASK-047.
  - **Barra de teste** ("Encher grupo", "Juntar todos", "Recarregar habilidades", "Derrubar aliado", "Derrubar Líder", "Aliados ajudam: sim/não", "IA: pelo nível/básica/média/avançada", "Invencível" só para o Líder, "Testar foco" e os 4 resultados, que agora usam os números reais da partida). Só no `npm run dev`: "Subir nível" e "+300 de ouro", que mexem no que a partida ganhou, e, no painel `</> DEV`, os personagens do save (contratar todas as classes, nível −1/+1/+10 e "Quase subir"), que só funcionam fora da partida. No build do jogo, nada disso existe. Quando a barra sair, a faixa de baixo volta a ser área jogável.
- **TASK-040, TASK-041, TASK-048, TASK-049 e TEST-004:** FEITO na parte 5c (07/10), esperando o teste visual do Pablo.
TASK-047 (itens na partida) depende do catálogo e fica para a Fase 4.

### EPIC-07 · Mundo da Floresta (etapa 6)
TASK-060 a TASK-065 e TEST-005: **A FAZER** na Fase 3. Dependem da TASK-012 e da TASK-013.

### EPIC-08 · Reino com dados (etapa 7)
- **TASK-079 (contratos):** sobe para o fim da Fase 1, porque é o único jeito de ter um grupo.
- **TASK-071 (pentágono):** também sobe para a Fase 1, porque é pequena.
- **Os outros itens (TASK-070 a TASK-081 e TEST-006):** A FAZER na Fase 4.

### EPIC-09 · Contas e Supabase (etapa 8)
- **TASK-090 (prova do e-mail):** COM VOCÊS. Alguém precisa criar um projeto gratuito no Supabase; eu ajudo no resto.
- **TASK-091 a TASK-098 e TEST-007:** A FAZER na Fase 2. Instalar o cliente do Supabase precisa da sua permissão.

### EPIC-10 · Salão da Glória, conquistas e som (etapa 9)
- **TASK-100 a TASK-102 (partidas no banco, ranking e histórico):** A FAZER na Fase 2.
- **TASK-103 (conquistas):** A FAZER na Fase 4.
- **TASK-104 (escolher os sons):** COM VOCÊS.
- **TASK-105 (tocar os sons):** A FAZER na Fase 4.

### EPIC-11 · Arte (etapa 10)
- **TASK-110 a TASK-114 e TASK-116 (gerar a arte):** COM VOCÊS (PixelLab).
- **TASK-111 (integrar o fundo do Reino) e TASK-115 (sprites no jogo):** eu, quando a arte chegar.

### EPIC-12 · Protótipos atualizados
- **TASK-120 (perguntar ao professor):** COM VOCÊS.
- **TASK-121 a TASK-123 (protótipos):** dependem da resposta. Se prints do jogo valerem como protótipo, eu tiro os prints de todas as telas automaticamente, como fiz na etapa 3.

### EPIC-13 · Testes finais e entrega
- **TEST-008 (navegadores e resolução):** eu e vocês.
- **TEST-009 (checklist do professor):** eu preparo, com prints.
- **TEST-010 (regressão final):** vocês executam; eu automatizo parte.
- **TASK-130 (publicar o beta):** BLOQUEADO até escolher a hospedagem.
- **TASK-131 (entrega no GitHub):** eu e você.
- **TASK-132 (apresentação):** BLOQUEADO até saber se ela existe.

## 3. Roadmap novo

Como as etapas 3 e 4 já estão prontas, ganhamos cerca de duas semanas em relação à auditoria. Esse tempo vai para a partida e para as contas, que são as partes mais arriscadas.

| Fase | Datas | O que entra |
|---|---|---|
| 0 · Fechar a base | 06 a 09/10 | TASK-002, TASK-031, acabamentos da TASK-020 e da TEST-003, DOC-001, DOC-005 e o balanceamento em `documentacao`. **Feita em 06/10**; falta o commit |
| 1 · Partida jogável (etapa 5) | 10 a 27/10 | 5a: TASK-004 e TASK-042 (andar, grupo, ataques de cada classe) · 5b: TASK-043 a TASK-046 (IA, desmaio, Sacerdote, uma habilidade) · 5c: TASK-040, TASK-041, TASK-048, TASK-049 e TEST-004 (Q, F, pausa, HUD, fim com números reais) · também TASK-079, TASK-071 e DOC-003 |
| 2 · Contas e Salão da Glória (etapas 8 e 9) | 28/10 a 08/11 | TASK-091 a TASK-098, TEST-007, TASK-100 a TASK-102 |
| 3 · Mundo da Floresta (etapa 6) | 09 a 15/11 | TASK-060 a TASK-065, TEST-005 |
| 4 · Reino com dados (etapa 7) | 09 a 22/11 | TASK-070, TASK-072 a TASK-078, TASK-047, TASK-103, TASK-105, TASK-080 e TASK-081 |
| **Congelamento** | 22/11 | Nenhuma funcionalidade nova depois disso |
| 5 · Polimento e testes | 23 a 29/11 | TEST-006, TEST-008, TEST-009, DOC-006, arte integrada (TASK-111, TASK-115), protótipos (TASK-121 a TASK-123), correção de bugs |
| 6 · Entrega | 30/11 a 03/12 | TEST-010, TASK-131 e, se confirmadas, TASK-130 e TASK-132 |

**Em paralelo, com vocês:**
- conteúdo (TASK-010 a TASK-016) até 19/10;
- prova do e-mail (TASK-090) até 11/10;
- professor (TASK-120) e Trello (TASK-003) até 09/10;
- arte e som de 26/10 a 22/11.

**Atenção às Fases 3 e 4:** as duas ficam na mesma janela e só cabem se outra pessoa da equipe tocar o Reino (Fase 4) em paralelo, com o próprio Claude Code. Os campos do save que o Reino usa já estão reservados, então dá para trabalhar em paralelo sem um atrapalhar o outro. Se ninguém puder, o grupo precisa decidir o que vai para "fora do beta" (ver a regra no topo).

**Caminho crítico:** TASK-004 → TASK-042 → TASK-044 → TASK-048 → TASK-100 → TASK-101 → TEST-010 → TASK-131. Um dia de atraso aqui é um dia de atraso na entrega.

## 4. Próximos passos, em ordem

**Comigo:**
1. Esperar o teste visual da 5c e ajustar o que o Pablo pedir.
2. Fechar a Fase 1: contratos na Guilda (TASK-079), pentágono dos atributos (TASK-071) e DOC-003 (ataques de clique, esquiva e cores). Antes de programar, mostro o plano curto.

**Com vocês**, já:
- fazer o teste visual da 5c (roteiro no relatório e em `testes/Roteiros.md`) e autorizar o commit;
- criar o quadro no Trello (TASK-003);
- perguntar ao professor o formato dos protótipos e se haverá apresentação (TASK-120);
- criar o projeto de teste no Supabase para a prova do e-mail (TASK-090);
- o amigo das habilidades começa a TASK-010.

## 5. Decisões que destravam o trabalho

| # | Decisão | Recomendação ou resposta |
|---|---|---|
| 1 | Tecnologia da partida: Phaser (biblioteca) ou Canvas 2D puro (a auditoria fala em Canvas 2D) | **DECIDIDO: Phaser.** Se existir o "prompt do combate", me mande: sigo os ataques e cores dele. |
| 2 | Commit ao fim de cada tarefa | **DECIDIDO: não.** Os commits ficam com o Pablo. |
| 3 | Imagens dos diagramas | **FEITO:** PlantUML 1.2024.8 (roda no Java 8 do computador), baixado fora do repositório. O PNG antigo do diagrama 04 não tinha sido gerado do `.puml`; o novo é, então os dois agora dizem a mesma coisa. |
| 4 | Conceito em Word e PDF | **FEITO:** o texto original ficou como estava, com a seção 21 "Alterações do projeto" no fim; o PDF foi exportado pelo Word. |
| 5 | Cor do Guerreiro | Por enquanto **azul (provisório)**, como pede o prompt do combate; vermelho é a cor dos inimigos na arena. O protótipo 06 usa vermelho: decisão do grupo |
| 6 | Tema padrão | Escuro, como os protótipos |
| 7 | Horas por semana de cada um e quem pega o Reino em paralelo | Decisão do grupo |
| 8 | Nome do jogo, hospedagem, origem dos sons | Decisão do grupo, até 19/10 |
| 9 | "Área limpa" do desmaio (TASK-044) | **DECIDIDO (06/10):** nenhum inimigo vivo a menos de 250 px (provisório) de quem caiu. A ajuda é automática (ficar parado perto, sem tecla) e a Ressurreição não precisa de área limpa. Já está nos Requisitos (RF43), nos Casos de Uso (UC37), nas Histórias (HU37) e no Conceito (21.5) |
| 10 | HUD | **DECIDIDO (06/10):** faixa no topo, fora da área jogável (ninguém anda embaixo dele) |
| 11 | Nível da IA dos aliados | **DECIDIDO (07/10):** pelo nível de cada personagem (básica 1–29, média 30–69, avançada 70–100), decidido pelo jogo. **Sem opção nas Configurações**: o jogador nunca escolhe (só a barra de teste força, para testar). Momentos de foco na avançada: sim |
| 12 | Esquiva | **DECIDIDO (07/10):** só o Líder esquiva; os aliados, no máximo, recuam andando do golpe avisado (avançada) |
| 13 | Números da 5c | **DECIDIDO (07/10):** crítico de 5% + 0,5% por ponto de Agilidade (×1,5); XP e ouro dos mobs de teste; borda da arena a 1400 px; os 5 s de "em combate" ficam em `dados/regras.js`, porque vêm do RF37 |
| 14 | Fuga e tempo ativo | **DECIDIDO (07/10):** confirmada, a fuga não se cancela, e o aviso dela não pausa. O tempo ativo segue o Conceito §12: só o tempo com dano nos últimos 5 s (ser perseguido sem dano não conta) |
| 15 | Ferramentas de teste | **DECIDIDO (07/10):** o que mexe no save fica no painel `</> DEV` (só no `npm run dev` e só fora da partida); na barra de teste, "Subir nível" e "+ouro" só aparecem no `npm run dev` e mexem só no que a partida ganhou |

## 6. Decisões levadas para a documentação (DOC-001, feito em 06/10)

Todas as decisões abaixo já estão nos Requisitos, nos Casos de Uso, nas Histórias e na seção 21 do Conceito, exceto "a conta de teste não é salva até a etapa 8", que é um detalhe provisório do código e some na etapa 8. Também entraram as decisões da Fase 0: a multa da missão é arredondada para baixo, e a partida usa Phaser (RNF01).

- **Etapa 2 (04/10):**
  - O Salão da Glória reúne Ranking, Histórico e Conquistas.
  - O minijogo volta ao Mapa, e a Preparação tem "Voltar ao Mapa".
  - O convidado tem "Sair do jogo", e Sair recarrega a página.
  - Nas Configurações, "Música" e "Som".
  - Na partida, as Configurações ficam sem as opções de conta.
- **Etapa 3 (05/10):**
  - O jogo também salva ao escolher a classe e ao fechar a aba (RF09).
  - A trava de aba única vale ao entrar como convidado (RF01).
  - A conta de teste não é salva até a etapa 8.
- **Etapa 4 (05/10):**
  - A sobra do XP vai para o Líder.
  - A taxa em moedas e os +10% da Grande Vitória são arredondados para baixo.
  - "Acima do mínimo" quer dizer maior que o mínimo.
  - O XP guardado é o XP dentro do nível atual.
  - O atributo máximo é 100, com a curva de efeito.
- **Etapa 5, parte 5c (07/10):**
  - O mudo (tecla M) é separado da Música e do Som e não vale digitando num campo (RF18, UC14, HU14).
  - Confirmada, a fuga não se cancela (RF46, UC40, HU40).
  - O nível ganho na partida vale a partir da partida seguinte (RF12, RF55, UC41, HU41).
  - No Conceito, a seção 21.5 ganhou: pausa, retorno e fuga; mudo; nível ganho; crítico.
- **Etapa 5, parte 5b.1 (07/10):**
  - A IA dos aliados tem três níveis pelo nível de cada personagem; os aliados não esquivam; parados, não tremem (RF36, RF42, UC31, HU31, Conceito 21.5).
- **Etapa 5, parte 5b (06/10):**
  - Área limpa = nenhum inimigo vivo perto de quem caiu. A ajuda é automática e volta a zero se a área sujar. A Ressurreição não precisa de área limpa (RF43, UC37, HU37, Conceito 21.5).

## 7. Como cada tarefa é feita (definição de pronto)

1. Cumpre o critério de aceitação do card e foi conferida no navegador.
2. `npm run build`, o lint e `npm test` passam.
3. Toda regra nova tem teste no Vitest. Números novos ficam em `src/dados/`; os provisórios, em `balanceamento.js`.
4. O roteiro rápido continua funcionando: Tela inicial → convidado → Reino → Começar partida → Resumo.
5. Se a tarefa mudou uma regra ou uma tela, o CLAUDE.md e o documento afetado são atualizados junto, e a mudança entra na seção "Alterações do projeto" do documento.
6. Os commits ficam com o Pablo (decisão 2), com mensagem clara.
