# Plano até a entrega (03/12/2026)

Atualizado em 08/10/2026: Fase 0 (`d938108`), parte 5a (`1143420`), ajustes da 5a + parte 5b (`e0c8d93`), parte 5b.1 (`55a6025`) e parte 5c (`5dcd43f`) no GitHub. Desde 08/10 o trabalho segue em **modo contínuo** (regras no CLAUDE.md).

## Onde parei

- **Fase 2 aprovada pelo Pablo em 09/10** e publicada: o `main` é o jogo público em `https://jogo-rpg-six.vercel.app` (as variáveis do Supabase valem em Production e Preview). Relatório do grupo: https://claude.ai/artifact/7Wj2tXqwcjaffBpyusPjrD.
- **Regra de publicação (Pablo, 09/10, no CLAUDE.md; troca a das prévias por ramo):** um endereço só, `https://jogo-rpg-six.vercel.app`, que mostra sempre o `main`; a Vercel só publica o `main` (`programacao/vercel.json`). Ramos só locais. No fim de cada fase: todos os testes → com tudo passando, junta no `main` e push → confere o endereço principal (`conferir:configuracao` e `testar:contas:publicado`) → relatórios. Nunca publicar com teste falhando; se quebrar no site, `git revert` na hora e avisar.
- **Fase 3 terminada (09/10) e publicada no endereço principal (10/10):** 3a a 3h feitas (Floresta com câmera, regiões, mobs com território, minimapa e áreas com XP, Ponto de partida, coleta com E, drops e mochila da partida, o Guardião da Floresta e o TEST-005). 660 testes; `testar:navegador` 226 de 226; `testar:floresta` 65 de 65; 60 FPS no pior cenário. Documentação: RF31, RF32, RF35, RF39, RF40, RF42, RF48, RF53, UC28, UC34, UC35, "Alterações do projeto", Balanceamento (seção do mundo), lista de arte, CLAUDE.md e `testes/` (roteiros FL-01 a FL-12).
- **Fase 3 aprovada pelo Pablo em 10/10** no endereço principal. Ele apagou o padrão antigo das prévias no Supabase; o ramo `fase-3` foi apagado do GitHub.
- **Ritmo novo (Pablo, 10/10, no CLAUDE.md):** sem esperar o teste dele entre as fases. No fim de cada fase: todos os testes → junta no `main` → confere o endereço principal (`conferir:configuracao` e `testar:contas:publicado`) → os dois relatórios com o "Teste visual" → segue direto. Ele testa em paralelo; problema que ele mandar para tudo e vem primeiro (corrigir, publicar, continuar). Parar só para o que só ele faz (adiantando o resto) ou decisão do grupo que mude regra.
- **O que falta, em ordem:** Fase 4 (4a a 4m, abaixo; minijogos se couberem antes de 22/11) → arte e som (sistema pronto para receber os arquivos; avisar quando for a hora da arte) → Fase 5 (TEST-008, TEST-009, TEST-010, problemas conhecidos, prints das telas, DOC-006) → Fase 6 (TASK-131 e lembrar o Pablo de apagar TesteA e TesteB do ranking).
- **Esperando o Pablo (sem travar nada):** confirmar a proposta do "Painel do Mestre" (seção abaixo). Até lá, ele fica de fora.
- **Fase 4 terminada e publicada (10/10)** no endereço principal (`17f14d9`): partes 4a a 4m. 792 testes; arena 227 de 227; Floresta 68 de 68 (61 FPS); Reino 30 de 30 (novo, com o TEST-006); contas no site 54 de 54. Relatório do grupo: https://claude.ai/code/artifact/d5be35fd-8af7-40ba-9bfd-2a0a4c19c52c. O teste do Pablo é em paralelo (roteiros RE-01 a RE-16).
- **Arte: o jogo está pronto para receber as imagens (10/10, ramo local `arte`).** Partes A1 a A5 feitas (plano abaixo): as imagens salvas em `programacao/src/assets/arte/` com o nome da Lista de Arte e Som entram sozinhas; o que falta continua quadrado ou cinza. `npm run conferir:arte` mostra o que chegou e o que falta (0 de 221 hoje); `npm run testar:arte` confere tudo com imagens de teste (36 de 36). **Avisado o Pablo: é a hora de gerar a arte no PixelLab** (passo a passo no fim da Lista de Arte e Som). O som já estava pronto desde a Fase 4 (falta só ele mandar os arquivos).
- **Fase 4.5, interface intuitiva (pedido do Pablo em 11/10): feita (I1 a I8)**, no ramo local `interface` (saído do `arte`). 828 testes; Reino 41 de 41; arte 39 de 39; arena 227 de 227; Floresta 68 de 68 (60 FPS). Prints de antes e depois (claro e escuro) em `testes-do-navegador/telas/`. **Publicada em 11/10** (`dddd224`, junto com a arte): conferidor tudo certo, `conferir:site` 11 de 11 como convidado; o `testar:contas:publicado` não entrou porque a conta de teste A estava em uso noutra sessão (rodar de novo quando ela estiver livre). Relatório com os prints de antes e depois: https://claude.ai/artifact/TmYLfHmywBgpnYMXXxU95r.
- **Ajustes da versão final (pedido do Pablo em 14/10): partes 0 a 10 feitas e publicadas** (`2425a55` no `main`). 884 testes; arena 235 de 235; Floresta 72 de 72 (60 FPS); Reino 60 de 60; arte 39 de 39; no site: `conferir:configuracao` tudo certo, `testar:contas:publicado` 54 de 54, `conferir:site` 11 de 11. Prints de antes e depois de 36 telas em `testes-do-navegador/telas/` (antes-ajustes e depois-ajustes, claro e escuro). O teste do Pablo é em paralelo (VF-01 a VF-20). Relatório com os prints de antes e depois: https://claude.ai/artifact/X3jwpzrotXQYCQsiWCWdRQ.
- **Agora (14/10): ajustes na partida**, pedido do Pablo (ordem: 2, 3, 1, 4; plano logo abaixo), no ramo local `ajustes-partida`. Feitas as quatro: 2 (`ea05080`), 3 (`2fad81f`), 1 (`1a75d85`) e 4 (`7c41839`). **Publicadas em 14/10** (`dd76b41` no `main`): 920 testes; arena 254 de 254; Floresta 73 de 73 (60 FPS); Reino 68 de 68; paredes 9 de 9; arte 39 de 39; no site, `conferir:configuracao` tudo certo e `testar:contas:publicado` 54 de 54. Relatório do grupo, com os prints: https://claude.ai/artifact/Ftf2kD4f9n54dkuPaHKTHc. O teste do Pablo é em paralelo (AP-01 a AP-11). Plugins do Supabase, da Vercel e o Design instalados (14/10).
- **Arte pelo PixelLab (15 a 19/10):** conectado o MCP "pixellab" (conta trial: 40 gerações, uma por vez). Teste: o ícone da Poção de vida (1 geração). O Mago chibi (boneco, animações, retrato e emblema; 13 gerações) foi **rejeitado pelo Pablo** (o estilo foi escolhido sem consultá-lo): descartado com o ramo local `arte-mago`. Ficaram a skill `gerar-arte`, o importador `scripts/importarPersonagem.mjs`, o emblema da classe (`classe-<id>.png`) e a duração do ataque pela animação. **Gerações usadas: 14 de 40 (sobram 26, mais o bônus diário).**
- **Agora (20/10): visual novo**, pedido do Pablo (plano logo abaixo), no ramo local `visual-novo`. Personagens no estilo novo e a Floresta por dentro ficam para o próximo pedido.
- **Depois: Fase 5** (TEST-008, TEST-009, TEST-010, os problemas conhecidos, os prints dos protótipos em `documentacao/` e o DOC-006).
- **Esperando o Pablo (ajustes de 14/10, sem travar nada):**
  - rodar o `programacao/supabase/002_hora_do_servidor.sql` no SQL Editor (a hora do servidor para as rodadas diárias da conta; até lá, vale a hora do token do login);
  - no Claude Code: `/mcp` para autenticar o Supabase (só leitura, só este projeto) e a Vercel; `/doctor` e `/skill-doctor` (comandos da interface, o Claude não roda);
  - aprovar ou mudar a proposta do escudo do Tanque contra golpes fortes (abaixo, na parte 10).
- **Depois: Fase 5** (polimento e testes): TEST-008, TEST-009, TEST-010, os problemas conhecidos, os prints das telas como protótipos (o `npm run prints` já existe) e o DOC-006.
- **Fase 5** (polimento e testes), sem esperar a arte: a arte entra quando chegar, sem mexer no código. A arte não vai sozinha para o `main`: entra junto com a próxima publicação (a regra é publicar no fim de cada fase; aqui não muda nada no que se vê, então vai com a Fase 5).

### Plano do visual novo (pedido do Pablo em 20/10/2026; ramo local `visual-novo`)

Referências do Pablo: a imagem do Reino, a do mapa dos biomas e uma tela do Taskbar Hero (só estilo). Molduras, botões, painéis e efeitos em código (CSS e SVG), sem gastar gerações; o PixelLab só para os fundos das telas internas, **com o custo dito antes e o ok do Pablo**.

- **A · Limpeza e Guia de Arte:** Mago descartado; `Guia_de_Arte.md` refeito do zero com o estilo novo dos personagens (chibi do Taskbar Hero, cabeça perto de metade da altura, olhos grandes, contorno fino marrom-escuro, 2 a 3 tons, cores um pouco dessaturadas com detalhes vivos; vista de cima em 3/4 com frente, costas e direita, esquerda espelhada; 48 px de altura; as 5 classes nas cores-assinatura; retrato 128 e emblema 32) e com o estilo das telas (as duas imagens do Pablo). Skill `gerar-arte` com o fluxo novo (teste de estilo de um boneco de frente antes de tudo). Nada gerado.
- **B · Reino:** a imagem do Pablo é o `fundo-reino` (escala suave, não "pixelada": é ilustração ampliada). Áreas clicáveis invisíveis no lugar exato de cada placa desenhada (Salão da Glória, Configurações, Guilda, Mercado, Forja, Mochila, JOGAR, Árvores de Habilidades), com a placa e o desenho em cima dela (coroa, engrenagem, estandarte, banca, bigorna, mochila, espadas); posições em `dados/posicoes.js` em % da imagem (valem em qualquer tamanho e em tela cheia, porque a tela tem a mesma proporção). Passar o mouse: brilho dourado em volta da placa e o cursor de clique; teclado e leitor de tela com o nome (texto escondido dentro do botão). Sem botões React por cima; a informação que muda (apelido, Líder, ouro, missão) numa faixa discreta no alto, no estilo das placas. O título fica só para o leitor de tela. RNF04 muda para esta tela (com "Alterações do projeto").
- **C · Mapa:** a imagem do Pablo é o `fundo-mapa`. Cada região é um botão recortado no formato dela (`clip-path: polygon`, o clique só vale dentro do contorno) e um contorno em SVG que acende ao passar o mouse, com o nome do lugar: Floresta (liberada), Tundra, Vulcânico e Deserto (cadeado e "Em breve"), e no Planalto o castelo (volta ao Reino), a Fazenda, a Mina e o Lago (minijogos, com "Rodadas hoje"). Saem os botões antigos; a "Arena de teste" continua só no `npm run dev`, num canto.
- **D · Identidade visual em todas as telas:** fonte em pixel de licença livre (Pixelify Sans, OFL, com os arquivos no projeto e a linha nos créditos); placas escuras com borda dourada e texto claro (tema escuro) e pergaminho com borda dourada e texto escuro (tema claro); o botão principal vermelho e dourado como o JOGAR; títulos numa faixa vermelha com borda dourada; painéis de madeira, pergaminho e pedra; janelas com moldura dourada; HUD da partida, telas de carregamento, trilha, dicas, abas, grades, selos e barras no mesmo estilo. Tudo por variáveis de CSS, trocável pela arte (`componentes/ui/arteDaInterface.js`). Guia de Interface atualizado. A clareza da Fase 4.5 continua (trilha, dicas, verbos, confirmações).
- **E · Fundos das telas internas (PixelLab):** proposta de lote com o custo no relatório; **só depois do ok do Pablo**.
- **F · Testes e entrega:** `npm test`, lint, build, todos os roteiros (com as conferências novas das áreas clicáveis do Reino e do Mapa, em 1366×768 e em tela cheia), prints de todas as telas (claro e escuro) e do Reino e do Mapa ao lado das imagens do Pablo; documentação e `testes/`; publicar e os dois relatórios.

### Plano dos ajustes na partida (pedido do Pablo em 14/10/2026; ramo local `ajustes-partida`)

Ordem pedida: 2 (urgente), 3, 1 e 4. Um commit por parte; roteiros do navegador depois da 2 (mexe no movimento de todos) e no fim.

- **2 · Teletransporte do Líder (urgente):** varredura de todas as paredes da Floresta num roteiro permanente (`npm run testar:paredes`): o Líder anda encostado em cada parede de região, nas quinas e na borda, de frente e em diagonal, com um monitor de saltos por quadro. **Causa achada:** `tirarDasParedes` (regras/movimento.js) testava as 4 saídas do bloco e, se a mais perto dava em outra parede, pegava a seguinte, que num bloco de mata de 1.800 px ficava do outro lado (saltos de até 1.735 px na parede de cima da Média; de 37 a 45 px nas árvores do domínio do Boss). Regras novas, com teste: a saída é pelo lado em que entrou menos em cada parede (numa quina os empurrões somam), nunca mais que `correcaoMaximaPorQuadro` (8 px) por quadro; salto máximo por quadro = `velocidadeMaxima` (1200 px/s) × tempo do quadro + correção; o Líder não desliza para o lado na parede nem nos corpos (só segue a parede o que o jogador empurra e para nas quinas); o anti-travamento nunca reposiciona o Líder; o deslize de aliados e mobs anda a 330 px/s, em linha reta.
- **3 · Passar pelos aliados (modo misto):** regra pura nova (`regras/passagemDoLider.js`): o aliado na frente do caminho do Líder sai para o lado antes do encontro (a IA avançada abre mais cedo); encurralado (pedra, mata, borda ou outro aliado do lado para onde sairia), o Líder atravessa só ele, sem colidir; na fuga (F) e no retorno (Q), o Líder atravessa todos; passou, a colisão volta. Aliados nunca ficam um em cima do outro; mobs continuam colidindo.
- **1 · Mochila do Tab no meio da tela:** janela central "MOCHILA" com peso, o mapa escurecido atrás, sem pausar; com ela aberta o Líder não anda, não ataca e não coleta. Grade com o "item na mão" (clique esquerdo pega a pilha, direito a metade, clique noutro quadradinho põe ou troca, clique fora joga no chão como dropado de 30 s, fechar com item na mão devolve). Regra pura `regras/itemNaMao.js` com testes. E e R com o mouse em cima de um consumível. O mesmo componente na Mochila do Reino, com a lixeira com confirmação.
  - **Como (plano da parte 1):** componente comum `componentes/ui/GradeComMao.jsx` (a grade, o item na mão seguindo o mouse, a caixinha com nome e efeito ao passar o mouse, clique esquerdo e direito, lixeira opcional). A arrumação é só da tela (a partida e o save continuam com a lista por item; `acompanharMochila` mantém a grade igual à mochila de verdade). Na partida: `MochilaNaPartida.jsx` vira a janela central, a arrumação fica guardada enquanto durar a partida, clique fora com item na mão manda `descartarItem` (o mesmo descarte de 30 s), Tab ou Esc devolvem; a cena para o Líder (não anda, não ataca, não esquiva, não usa habilidade, não coleta) com a mochila aberta. **Critério do R (decisão minha):** como o mouse está na mochila (não há mira), R usa no aliado de pé que mais precisa daquele item: poção de vida, o mais ferido (menor fração de vida); de mana, o com menos mana; acelerador, o mais perto do Líder; empate, o mais perto do Líder (`aliadoQueMaisPrecisa`, com teste). Na Mochila do Reino: a mesma grade com a lixeira (soltar o item na mão nela abre a confirmação "Descartar N …? Some para sempre"); o filtro passa a destacar os do tipo (os outros ficam apagados), sem esconder; o detalhe mostra o item embaixo do mouse, o da mão ou o último clicado.
- **4 · Escudo contra golpe forte (aprovado como provisório):** bloqueia golpe e projétil de frente com dano até `10 + 1,5 × Força`; acima, o Tanque leva o dano inteiro, aparece "Escudo rompido!" e o escudo treme. Números no balanceamento. Documentação: RF36, UC32, HU32, Alterações, Conceito, Balanceamento.

**Como ficou (14/10):**
- 2 (`ea05080`): causa achada e corrigida (acima); `npm run testar:paredes` virou roteiro permanente (9 de 9; maior passo do Líder 13,9 px por quadro). A correção máxima subiu de 8 para 12 px por quadro na parte 3 (os aliados encurralados saem mais rápido das pedras, ainda sem salto).
- 3 (`2fad81f`): modo misto como pedido; arena seção 37 (campo aberto, corredor de 30 px, canto em L e fuga pelo grupo). A régua de "um em cima do outro" é a mesma da seção 9 (mais de 6 px).
- 1 (`1a75d85`): como planejado. **R no aliado que mais precisa** (decisão minha, avisada no relatório). O "Descartar…" do detalhe continua no Reino (para o teclado), junto da lixeira. A arrumação do Reino vale enquanto a tela está aberta (o save não guarda lugares).
- 4 (`7c41839`): como aprovado (dano inteiro acima do limite). **A investida do Boss foi de 22 para 40** (decisão minha, provisória): com 22, nada da Floresta romperia o escudo do Tanque do começo e o teste pedido ("rompido pelo Boss") não aconteceria; ela batia menos que a mordida de um lobo no domínio do Boss (26). Com Força 20, o escudo segura.

### Plano dos ajustes da versão final (pedido do Pablo em 14/10/2026; ramo local `ajustes-finais`)

Testes rápidos (`npm test`, lint) a cada parte; roteiros do navegador no fim dos grupos (1-2-3, 4-5-8, 6-7, 9-10) e todos antes de publicar. Números novos em `balanceamento.js`, provisórios.

- **0 · Claude Code mais eficiente:** CLAUDE.md enxuto (só fatos e regras curtas); procedimentos viram skills do projeto em `.claude/skills/` (`modo-continuo`, `publicar`, `verify`, `relatorio-de-fase`, `balanceamento`, `run-jogo-rpg` com o driver do Edge escondido); plugins oficiais `skill-creator` e `frontend-design` (escopo local); conexões do Supabase (só leitura, só o projeto `xvldisgdxuhxrfgxvfkf`) e da Vercel configuradas, esperando o Pablo autenticar pelo `/mcp`; plugin `engineering` desligado neste projeto (10 conexões sem uso).
- **1 · Telas intuitivas:** trilha no alto de cada tela ("Reino › Forja"), vinda de `dados/telas.js` e desenhada pelo `Tela.jsx`; Esc = Voltar em toda tela sem janela aberta (na partida continua pausa); dica da primeira visita (curta, fechável; o "?" reabre), com as telas vistas no save (`dicasVistas`, campo novo pelo `normalizarProgresso`); toda ação do Reino confirma no formato "Você comprou 1 Poção de vida · −25 de ouro" (mensagens de `regras/reino.js`); "Como jogar" atualizado (controles, arco do Arqueiro, itens no chão, minijogos). Prints de antes e depois de cada tela.
- **2 · Descartar:** escolher 1, várias (contador) ou todas, com confirmação que mostra o item, a quantidade e o que acontece. Mochila do Reino: some. Mochila da partida (Tab): cai no chão perto do Líder como item dropado (parte 3). Regra pura em `regras/itensNaPartida.js`.
- **3 · Itens no chão:** regra pura nova `regras/itensNoChao.js` (natural nunca some; dropado some 30 s depois de cair; pegar e descartar faz virar dropado com tempo novo; o que fica no chão no fim da partida se perde). Os 60 s do drop e os 30 s do que não coube viram um só valor, `mundo.coleta.msDoItemDropado` = 30000. `ItemNoChao` mostra o anel do tempo no dropado e pisca nos últimos 5 s.
- **4 · Tela cheia:** `regras/telaCheia.js` (quando pedir) + `componentes/telaCheia.js` (pedir, sair, Keyboard Lock do Esc no Chrome e no Edge); entra no clique de Iniciar jogo, Jogar e Começar partida, a menos que esteja desligada nas Configurações (preferência no navegador, como o tema); botão X discreto num canto; se o Esc do navegador tirar da tela cheia no meio da partida, vale como Esc (pausa, se puder) e aparece "Voltar à tela cheia". Falha ou recusa: segue sem erro. O jogo continua escalando para qualquer tamanho (a mira usa o ponto do mundo).
- **5 · HUD transparente:** a faixa escura de cima vira grupos translúcidos nos cantos (Líder e grupo; tempo, pontos, ouro e fuga; minimapa, região e mochila) e a barra de ações embaixo no meio, com a recarga em volta do ícone; os avisos num lugar fixo, no máximo 3. Na Floresta, a câmera passa a mostrar o mundo até o alto da tela (o HUD fica por cima, translúcido); a arena de teste não muda de tamanho.
- **6 · Minijogos diários:** 3 rodadas por dia em cada minijogo (provisório, `minijogos.rodadasPorDia`), renovando à meia-noite de Brasília. Regra pura `regras/rodadasDoDia.js` (dia de Brasília, rodadas que sobram, tempo até renovar). Conta: hora do servidor (diferença calculada no login e no sinal da sessão); convidado: hora do navegador. Contador no save (`minijogosDoDia`, campo novo). Mapa e minijogo mostram "Rodadas hoje: 2 de 3 · renova em 05:12"; sem rodadas, botão apagado com o motivo. Documentação: RF54, UC e HU ligados, Alterações do projeto e Conceito.
- **7 · Hitbox menor:** o corpo que colide vira um círculo no "pé" (raio provisório no balanceamento, bem menor que o desenho); a zona de separação diminui junto; a área que recebe golpes continua do tamanho do corpo. Conferências: grupo passa por corredor estreito, andar no meio do grupo parado não gruda, ninguém em cima de ninguém, tremor e travamento continuam passando.
- **8 · Carregamento:** tela no `index.html` antes do React (nome provisório e barra); ao entrar na partida, progresso real (Phaser, arte e som) e uma dica sorteada (`dados/dicas.js`); fade entre Reino, Mapa e partida; se demorar demais ou falhar, mensagem clara com "Tentar de novo".
- **9 · Arco que carrega (Arqueiro):** regra pura `regras/arco.js` (carga → alcance, velocidade e dano; Agilidade → tempo para carga cheia, quase linear com mínimo; recarga curta depois de soltar; Arqueiro mais lento puxando), com testes em vários valores de Agilidade (carga cheia rende mais por segundo que clicar rápido; tempo cai pouco por ponto e nunca passa do mínimo). Visual: indicador de carga, linha pontilhada do alcance, brilho na carga cheia. Arqueiro aliado carrega conforme o nível da IA. Tiro perfurante sem mudança. Documentação: RF36, UC, HU, Alterações, Conceito, Balanceamento.
- **10 · Tanque:** conferir se os ataques em área (pisão do Boss, explosões, área dos mobs) atingem o Tanque; se não, corrigir (o escudo só bloqueia golpe e projétil de frente) com teste. Anotar como pendência a regra "escudo não segura golpe forte demais sem Força suficiente" (previsto, depende do balanceamento), com proposta para o Pablo aprovar.

**Como ficou (14/10):**
- 0: feito (skills do projeto, plugins skill-creator e frontend-design, conexões do Supabase e da Vercel configuradas esperando o `/mcp` do Pablo, plugin `engineering` desligado aqui).
- 1 a 9: feitos, cada um com o commit dele (`fe56b47`, `5d265c5`, `3a0c3bc`, `878bbf8`, `544ed48`, `f688525`, `94cf2ff`, `b1ee74b` e o da parte 9).
- 7: o corpo ficou um **quadrado** no meio do desenho, não um círculo no pé: as regras de movimento (separação, escorregar, tirar das pedras) tratam o corpo como quadrado e continuam iguais e testadas; dá para descer para o pé quando a arte chegar.
- 10: era defeito mesmo. O pisão do Boss passava pelo bloqueio do escudo; agora o escudo só segura golpe e projétil de frente (`escudoBloqueia`). As explosões e a área dos mobs ainda não existem; quando existirem, entram como `'area'`.

**Proposta para o Pablo aprovar (previsto, depende do balanceamento): escudo contra golpe forte.** O escudo segura o golpe inteiro só se o dano do golpe for até um limite que cresce com a Força do Tanque: `limite = 10 + 1,5 × Força` (com a Força inicial do Tanque, perto de 30 de dano; com Força 100, 160). Golpe acima do limite atravessa: o Tanque leva a parte que passou do limite (e o empurrão inteiro), e aparece "Escudo quebrou!". O pisão (área) continua fora do escudo. Os números entram no `balanceamento.js` quando o grupo fechar os danos dos monstros e do Boss (TASK-012).

### Plano da Fase 4.5: interface intuitiva (pedido do Pablo em 11/10/2026)

Problema: tudo funciona, mas as telas do Reino parecem listas de texto. Cada tela passa a mostrar a ação (comprar, vender, trocar, fabricar, equipar, aceitar missão, contratar), com a Árvore de Habilidades como referência de clareza. **Nenhuma regra do jogo muda**: só a forma de mostrar e de interagir (as operações continuam as de `regras/reino.js`, `regras/guilda.js` e `regras/missoes.js`).

Regras para não ter retrabalho com a pixel art: só formas simples (quadrados, círculos, símbolos e letras na cor da raridade); molduras, botões, quadradinhos, barras e selos usam o mesmo sistema da arte (com a imagem em `src/assets/arte/`, ela aparece; sem ela, a versão simples); ícones de 32 px mostrados em tamanho inteiro (64 px nas grades do Reino, 32 na mochila da partida), nítidos; temas claro e escuro; 1366 × 768.

- **I1 · Base comum:** `dados/interface.js` (cor e símbolo de cada ação, cor de cada raridade, filtros, tamanhos, nomes da arte de interface), `dados/ajuda.js` (o "?" de cada tela), regras puras em `regras/interface.js` com testes (filtro dos itens, comparação de equipamento antes e depois, de onde vem cada item, itens já vistos), componentes em `componentes/ui/` (Painel, Slot, GradeDeItens, BotaoDeAcao, Selo, Barra, Mudanca, SimboloDeAcao) e o "?" em `Tela.jsx` (janela "Como funciona"). A arte da interface entra por variáveis de CSS na raiz (`moldura-painel`, `botao`, `slot`, `slot-escolhido`, `selo`, `barra-fundo`, `barra-cheia`, `cartaz`, `carta`, `silhueta-boneco`, `acao-...`, `tipo-...`, `lugar-...`). Guia em `documentacao/Guia_de_Interface.md`. Avisos de conquista viram um aviso no canto que some sozinho (não tapam mais as abas).
- **I2 · Mochila do Reino:** grade de quadradinhos (ícone, quantidade no canto, borda da raridade), filtros por tipo, detalhe ao lado, descartar com confirmação, tela vazia que explica.
- **I3 · Preparação e mochila da partida (Tab):** a mesma grade, barra de peso; na Preparação, duas grades lado a lado com seta (clicar leva ou devolve 1).
- **I4 · Forja:** Equipar com o boneco e os 7 espaços em volta, a grade do que serve no espaço escolhido e a comparação de atributos antes de equipar ("todas as classes" ou "só Arqueiro"); Comprar e Vender em grade; Fabricar com a receita desenhada (ingredientes "tem/precisa" → seta → resultado; o botão só acende com tudo); aba Catálogo.
- **I5 · Mercado:** balcão com Comprar (ofertas, ouro sempre à vista, "ofertas ★ mudam em N partidas"), Vender (a mochila com o preço de venda em cada quadradinho), Trocar ("você dá" ⇄ "você recebe", com o que tem e o que falta) e Catálogo (tudo do beta; o que nunca foi visto aparece como silhueta, com de onde vem). Para isso o save ganha `itensVistos` pelo `normalizarProgresso` (campo novo, sem formato novo).
- **I6 · Guilda:** quadro de avisos com cartazes (ícone do tipo, objetivo, recompensa), a missão ativa em destaque com barra de progresso, Entregar e Abandonar dizendo o que ganha ou perde; contratos como cartas (retrato, papel, pentágono pequeno, preço; selos bem diferentes para temporário e permanente), confirmar como "assinar o contrato", contratos ativos com as partidas restantes.
- **I7 · Salão da Glória e Reino:** top 3 e a linha do jogador em destaque; no Reino, cada lugar com símbolo e uma linha dizendo o que é (sem mexer nas posições, que dependem da arte do Reino).
- **I8 · Testes e entrega:** `npm test`, lint, build e todos os roteiros (com os ajustes das telas novas e conferências novas da interface no `testar:reino` e no `testar:arte`), roteiros manuais UI-01 em diante, prints de depois (claro e escuro), relatórios com antes e depois, publicação levando o ramo `arte`.
- **Decisões tomadas por conta própria (registradas nos Requisitos, "Alterações do projeto", e no Guia de Interface):**
  - quadradinho de 72 px com o ícone em 64 (2×) nas grades do Reino; 56 e 44 px com o ícone em 32 (1×) no boneco da Forja, na Preparação, nas receitas, nas trocas e na mochila da partida (nunca 1,5×, que borra a pixel art);
  - até o ícone chegar, uma forma por tipo (círculo, quadrado, losango, escudo, pergaminho) na cor do item, com a inicial;
  - Equipar por clique (escolher o espaço no boneco e a peça na grade): arrastar ficou de fora, para não complicar (o clique faz o mesmo e funciona com teclado);
  - o Catálogo mostra em silhueta o que o jogador nunca teve, com "Vem de"; para isso o save ganhou `itensVistos` (o que esteve na Mochila ou equipado), pelo `normalizarProgresso`, sem formato novo; um save antigo já começa com o que tem;
  - botões desativados com o motivo da própria regra (a prévia roda a mesma operação sem mudar nada): "comprar sem ouro" do TEST-006 passa a ser o botão apagado com o motivo, sem clique;
  - os contratos continuam em duas abas (temporário e permanente), agora com cartas bem diferentes (tracejada azul e borda dupla vinho), e "Contratar" abre o contrato para "assinar";
  - a Guilda (abas e conteúdo) passa a ter o conteúdo preso logo abaixo das abas, como as Árvores;
  - o aviso de conquista vai para o canto de cima, à direita, e some sozinho em 6 s (os de problema no salvamento continuam no meio, até o OK): antes ele tapava as abas;
  - os símbolos das ações, dos tipos de missão e dos lugares são caracteres simples (⊖ ⊕ ⇄ ⚒ ⛨ ✎ ! ✓ ✕ ♥ →), trocáveis por imagens de 16 × 16 (`acao-…`, `tipo-…`, `lugar-…`);
  - roteiro novo `npm run prints` (prints de todas as telas, claro e escuro), que também serve para os protótipos da Fase 5.

### Plano da arte (TASK-110 a TASK-116, a parte do código; ramo local `arte`)

Objetivo: quando as imagens chegarem, basta salvá-las numa pasta com o nome da lista; o jogo encontra sozinho e troca o quadrado pela imagem. O que não tiver imagem continua como hoje (quadrados, cinza). Nenhuma regra muda: a hitbox continua separada do desenho.

- **A1 · Achar as imagens:** pasta `programacao/src/assets/arte/` (com subpastas à vontade), PNG (ou WEBP e JPG nos fundos). O nome não liga para maiúsculas, acentos, hífen, sublinhado ou espaço (`Guerreiro_Andando-Baixo.png` = `guerreiro-andando-baixo.png`). A lista do que o jogo procura e os tamanhos na tela ficam em `dados/arte.js`; as contas puras (nome, direção, quadros, o que usar quando falta uma animação) em `regras/arte.js`, com testes.
- **A2 · Bonecos na partida:** cada classe, mob e o Boss pode ter uma faixa por animação e direção (`guerreiro-andando-baixo.png`: quadros quadrados lado a lado; ou quadros soltos `guerreiro-andando-baixo-1.png`, `-2`...). Falta de uma direção usa a outra (esquerda ↔ direita espelhada; cima e os lados caem no baixo); falta de animação usa a parada; só uma imagem (`guerreiro.png`) serve para tudo. Os nomes em inglês do PixelLab (south, north, west, east; idle, walk, attack) também valem. Piscar, aviso dos mobs, caído e marca do Líder continuam (com tinta na imagem).
- **A3 · Floresta:** chão com os tiles (variações de grama juntadas uma vez numa textura grande, tingida por região; ou `grama-facil`, `grama-media`... se vierem prontas), a mata, árvores e pedras (pela medida da pedra: pequena, média ou grande) com profundidade certa (quem passa atrás da copa some atrás dela), itens no chão pelo ícone e as marcas de aviso do Boss.
- **A4 · Telas:** fundo de cada tela (`fundo-inicio`, `fundo-acesso`, `fundo-selecao`, `fundo-reino`, `fundo-mapa`, `fundo-resumo`; e `fundo-<tela>` para qualquer outra), retratos das classes (Seleção e HUD), ícones (itens nas listas e no detalhe, atributos, habilidades, ouro, Pedra de Retorno no HUD) e a cutscene de derrota com `derrota-1` a `derrota-3`.
- **A5 · Conferir e testar:** `npm run conferir:arte` lista o que foi achado, o que falta e o que tem nome ou tamanho estranho. Roteiro `npm run testar:arte`: cria imagens de teste numa pasta fora do git (`src/assets/arte-de-teste/`), abre o jogo e confere que cada parte troca o quadrado pela imagem; no fim apaga a pasta. Documentação: Lista de Arte e Som com os nomes exatos e o passo a passo do PixelLab, CLAUDE.md e `testes/`.
- **Feito (10/10).** Decisões tomadas por conta própria (registradas nos Requisitos, "Alterações do projeto", RNF04):
  - a pasta da arte é `src/assets/arte/` (a lista dizia `public/arte/`): assim o jogo descobre os arquivos sozinho ao montar, como o som;
  - uma imagem por animação e direção (faixa de quadros quadrados numa linha, ou quadros soltos numerados), no lugar de uma folha só por classe: é como o PixelLab entrega, e dá para mandar aos poucos;
  - o que falta não trava: esquerda ↔ direita espelhada, cima e os lados caem no baixo, animação que falta usa a parada, o aviso dos mobs usa o ataque, o desmaiado sem imagem tomba e escurece; nomes em inglês do PixelLab também valem;
  - tamanho na tela fixo por boneco (personagens 48, lobo e cervo 48, aranha 44, javali 56, Boss 128), qualquer que seja o tamanho da imagem, sem borrar os pixels (`dados/arte.js`; não são números de balanceamento);
  - com arte, o Líder troca o contorno branco por um anel no chão; o boneco não balança mais ao andar (a animação faz isso); as árvores ficam na ordem dos bonecos e a copa na frente do Líder fica transparente (45%);
  - chão: 8 × 8 tiles sorteados uma vez numa textura e repetidos (TEST-005: nenhum objeto por tile), tingidos pelo tom de cada região (ou a grama pronta da região, se vier);
  - terra, caminho e água ficam para quando o layout do grupo (TASK-013) tiver caminho ou lago; o tronco caído aparece no lugar de algumas pedras compridas, e o arbusto na beira da mata;
  - no build, a arte e o som viram arquivos separados (não embutidos no código), para não pesar na abertura do jogo.

### Plano da Fase 4 (modo contínuo, liberado pelo Pablo em 09/10)

Reino com dados: TASK-070, TASK-072 a TASK-078, TASK-047, TASK-103, TASK-105, TASK-080, TASK-081 e TEST-006. Sem o Painel do Mestre (esperando o ok do Pablo). O conteúdo que o grupo ainda não entregou (TASK-010 habilidades, TASK-014 catálogo e Mercado, TASK-015 missões e conquistas, TASK-016 minijogos) entra **PROVISÓRIO – substituir pelo do grupo**, sempre em arquivos de dados (`src/dados/`), para trocar sem mexer no código (e para o futuro Painel do Mestre ou planilha, se aprovados). Os números novos vão no `balanceamento.js`. O save só ganha campos novos pelo `normalizarProgresso` (sem formato novo).

- **4a · Catálogo (TASK-070):** completar `dados/itens.js` (função, descrição, peso, preço e raridade em todos): poções de vida e de mana, um acelerador, o pergaminho de redefinição, materiais, uma arma por classe, escudo do Tanque e duas linhas de armadura (cinco peças cada). Receitas da Forja em `dados/receitas.js`; ofertas do Mercado (fixas, rotativas e trocas) em `dados/mercado.js`. **Rotação provisória:** as rotativas mudam a cada 3 partidas jogadas (decisão da TASK-014 em aberto). Testes: todo item completo, receitas e ofertas só com itens que existem, id desconhecido não trava.
- **4b · Mochila do Reino (TASK-072):** lista com quantidade, detalhe (função, descrição, peso) e descartar com confirmação. Regras puras em `regras/mochila.js`.
- **4c · Mochila da partida na Preparação (TASK-073):** capacidade pela Força do grupo, passar itens do Reino para a partida e de volta, bloquear o que passa do limite com o motivo. O que vai junto só sai da Mochila do Reino no fim da partida (se a página fechar no meio, nada some: RF12); o que sobrou e o que foi coletado voltam em todos os resultados (RF50).
- **4d · Itens na partida (TASK-047):** Tab abre a mochila da partida sem pausar; com ela aberta, E usa o item no Líder e R num aliado (**provisório:** o aliado mais perto da mira); poção não levanta desmaiado; a quantidade cai 1 por uso.
- **4e · Mercado (TASK-074):** Comprar (bloqueia sem ouro, com o motivo), Vender, Trocar item por item; ofertas fixas e rotativas; o pergaminho à venda.
- **4f · Forja (TASK-075):** Equipar (armadura para todas as classes, arma e escudo só da própria), Comprar, Vender e Fabricar por receita (mostra o que falta). O bônus do equipamento entra nos atributos da partida. O contrato temporário ganha o equipamento fixo (RF29).
- **4g · Árvores: atributos e pergaminho (TASK-076):** distribuir os pontos de atributo com o pentágono atualizando; aplicados ficam fixos; o pergaminho devolve os pontos e é consumido (habilidades não mudam).
- **4h · Árvores: habilidades (TASK-077):** árvore provisória por classe (10 habilidades em ramos, níveis 1 a 5; a primeira gratuita; a próxima do ramo libera no nível 5 da anterior; até 3 ativas nas teclas 1 a 3; passivas sempre ligadas). As ativas usam alguns efeitos genéricos com números por habilidade e por nível (a habilidade de teste de cada classe vira a primeira da árvore).
- **4i · Missões da Guilda (TASK-078):** quadro provisório (matar, coletar, entregar e explorar, só com conteúdo da Floresta); aceitar, progresso pelos eventos da partida (soma entre partidas), entregar (ouro e XP dividido entre os permanentes; a de entrega consome os itens) e abandonar com a multa de 10% mostrada antes.
- **4j · Conquistas (TASK-103):** lista provisória com condição e recompensa; progresso pelos eventos e pelas estatísticas; recompensa uma vez só; aviso no HUD; aba Conquistas no Salão da Glória (convidado e conta).
- **4k · Som (TASK-105):** um gerenciador de áudio, música por tela e efeitos nos eventos, respeitando Música, Som e o mudo (M); só começa depois do primeiro clique. **Até a TASK-104:** efeitos provisórios gerados pelo próprio navegador (bipes curtos), sem arquivos.
- **4l · Minijogos (TASK-080 e TASK-081):** base comum e uma mecânica provisória de poucos cliques para Fazenda, Mina e Lago (TASK-016 em aberto); recursos próprios para a Mochila do Reino, XP dividido entre os permanentes, sem taxa, ranking nem histórico; volta ao Mapa.
- **Decisões provisórias da Fase 4 (para os relatórios e as "Alterações do projeto"):**
  - 4a: catálogo com 44 itens (`dados/itens.js`), receitas e loja da Forja (`dados/forja.js`), ofertas e trocas do Mercado (`dados/mercado.js`). A "função" de cada item sai dos campos dele (`funcaoDoItem`), sem texto repetido. Equipamento tem bônus de atributos, **defesa** e às vezes redução de recarga (Conceito §10.3). Quem vende recebe 50% do preço; as rotativas mudam a cada 3 partidas, 3 de cada vez (`balanceamento.js`, `mercado`). O Mercado não vende equipamento (só a Forja, RF22). O minério de ferro fica à venda no Mercado, para as receitas de ferro não dependerem dos minijogos. Testes barram troca ou receita que dê lucro (ouro infinito).
  - 4b: todas as telas do Reino mudam o progresso por um caminho só: uma operação pelo nome (`regras/reino.js`, `operacoesDoReino`), aplicada pelo estado (`noReino`) e testada antes pela tela, que mostra o motivo quando não dá. A Mochila descarta 1 ou todos, sempre com confirmação. Novo componente `ListaComDetalhe` (lista que rola e o detalhe ao lado), reaproveitado no Mercado e na Forja. Painel `</> DEV`: "Itens de teste na Mochila e +1000 de ouro" (só no `npm run dev`).
  - 4c: na Preparação só vão poções e aceleradores (o que se usa na partida); o peso conta na capacidade, junto com o que for coletado. A escolha fica guardada entre partidas e é ajustada à Mochila ao começar. Os itens levados só saem da Mochila do Reino no fim (já descontado o que foi usado): se a página fechar no meio, nada some (RF12). O Resumo mostra só o que foi coletado.
  - 4d: Tab abre a mochila da partida numa janela que não pausa, encostada no lado direito (o Líder fica no meio da tela); ↑ ↓ escolhem; E usa no Líder; **R usa no aliado de pé mais perto da mira** (decisão em aberto no card da TASK-047). A escolha é pelo item: quando ele acaba, o próximo E não gasta outro sem querer. Poção não levanta desmaiado e não é gasta com a vida (ou a mana) cheia. Tônico: +25% de velocidade andando (não na esquiva) por 20 s; Elixir: recargas das habilidades 30% mais curtas por 20 s. Com a mochila aberta, o E não pega do chão; Q e F continuam valendo; Esc fecha a mochila antes de pausar.
  - 4e: Mercado com Comprar (fixas e rotativas ★; a rotação é previsível, passa por todas e muda a cada 3 partidas), Vender (metade do preço; equipamento só na Forja) e Trocar (mostra quanto tem de cada item pedido). O minério de ferro e o pergaminho estão sempre à venda.
  - 4f: Forja com Equipar (por personagem permanente; a peça antiga volta para a Mochila; arma e escudo de outra classe dão o motivo), Comprar (só o equipamento comum; o incomum e o raro saem das receitas), Vender (metade do preço; o equipado precisa ser tirado antes) e Fabricar (mostra o que falta). Na partida, os bônus somam aos atributos (até 100), **cada ponto de defesa tira 2% do dano recebido (até 50%)** e a redução de recarga encurta as habilidades (até 30%) (`balanceamento.js`, `equipamentoNaPartida`). O temporário vai com equipamento fixo (`dados/forja.js`, `equipamentoDosTemporarios`: a arma comum da classe e o colete de couro; o Tanque também com o escudo de madeira), mostrado na Guilda.
  - 4g: nas Árvores, cada personagem tem "Atributos" e "Habilidades". Em Atributos, + e − montam a distribuição (o pentágono já mostra como fica) e "Aplicar" fixa; nada passa de 100. O pergaminho (com confirmação) devolve todos os pontos acima dos iniciais da classe e é consumido; as habilidades não mudam. O botão de teste do painel DEV também dá +10 pontos de atributo e +5 de habilidade a cada permanente.
  - 4h: árvore de cada classe em `dados/arvores.js` (PROVISÓRIO até a TASK-010): 10 lugares (raiz e três ramos de três), 4 no beta (a raiz, gratuita e já no nível 1 na tecla 1, e a primeira de cada ramo: 2 ativas e 1 passiva). Cada nível custa 1 ponto; a primeira de cada ramo libera com a raiz no nível 5, e a seguinte de um ramo, com a anterior no 5. Até 3 ativas nas teclas 1 a 3, na ordem escolhida; com as 3 ocupadas, a tela pede qual trocar. A cada nível, dano e cura +15%, bônus de dano +10%, proteção +8%, duração +10% e recarga −4% (`balanceamento.js`, `evolucaoDasHabilidades`). As ativas novas reaproveitam os efeitos que já existiam (golpe em volta, tiro que atravessa ou para no primeiro, queda avisada) com outros números e cores, mais fortalecer (Fúria e Bênção), proteger (Muralha) e curar em área; as passivas somam vida, mana que volta, crítico, defesa ou cura. Os aliados usam só a raiz da classe, em qualquer tecla em que ela estiver. O save antigo (sem habilidades) ganha a raiz no nível 1, na tecla 1.
  - 4i: quadro provisório de 10 missões (`dados/missoes.js`, até a TASK-015): 4 de matar (lobo, aranha, javali e o Guardião), 2 de coletar, 2 de entregar e 2 de explorar, só com o que existe na Floresta. As regras são as da etapa 4 (`regras/guilda.js`); `regras/missoes.js` liga o quadro, as telas e a partida. A partida conta os abates por tipo, os itens coletados e as áreas visitadas (explorar vale visitar depois de aceitar, mesmo área já conhecida); o progresso só entra no save no fim (RF12). O HUD da partida avisa quando a missão avança ("Missão: 2/8 lobo") e quando é cumprida. A de entrega mostra o que há na Mochila agora. Abandonar mostra a multa antes de confirmar.
  - 4j: 12 conquistas provisórias (`dados/conquistas.js`, até a TASK-015), com os exemplos do Conceito §13 (derrotar um Boss, 10.000 monstros, um personagem no nível 100); algumas dão ouro. O progresso sai do save: estatísticas (com 3 novas, `bossesDerrotados`, `grandesVitorias` e `missoesEntregues`, entradas pelo `normalizarProgresso`), nível, áreas descobertas, classes e ouro. O estado confere depois de cada ação fora da partida: a recompensa entra uma vez só e aparece um aviso (as da partida, no fim dela). Aba Conquistas no Salão da Glória, para convidado e conta. O save antigo que já cumpre alguma recebe ao carregar.
  - 4k: o áudio fica pronto para receber os arquivos da Lista de Arte e Som sem mexer em código: basta salvá-los em `programacao/src/assets/audio/` com o nome da lista. Até lá, os efeitos tocam bipes provisórios gerados pelo navegador e a música fica em silêncio. Música por tela (Reino e menus, Floresta, Boss quando a barra dele aparece, Derrota); efeitos de ataque (só o do Líder), acerto, crítico, bloqueio, esquiva, desmaio, levantar, perdido, nível, moeda, fuga e clique dos botões; o mesmo efeito não repete em menos de 60 ms.
  - 4l: minijogos provisórios (`dados/minijogos.js`, até a TASK-016), com a mesma base: rodada de 30 s, cada ponto dá 1 do recurso do lugar e XP (dividido entre todos os permanentes, RF50), e cada ponto tem uma chance de trazer também um item raro. Fazenda: clicar nas plantas maduras antes que murchem (trigo; raro: erva medicinal). Mina: 3 cliques em cada pedra (minério de ferro; raro: cristal). Lago: clicar quando a boia afunda; antes da hora, o peixe foge (peixe; raro: pérola do lago). Itens novos no catálogo: trigo, peixe, cristal e pérola do lago. Não é partida: sem taxa, ranking, histórico nem contrato; sair no meio não dá nada; volta ao Mapa. Números em `balanceamento.js` (`minijogos`).
  - Habilidades no beta (Conceito §18.1): 3 ou 4 por classe; a árvore mostra a estrutura de 10, com as outras marcadas "fora do beta".
- **Para a Fase 5 (anotado na Fase 4):** duas conferências da arena falham de vez em quando, sem relação com a Fase 4: o aperto contra a pedra (às vezes passa dos 6 px entre dois aliados) e a área suja (a ajuda conta uns quadros a mais quando o mob passa da beira dos 250 px). Rever o limite ou a separação.
- **4m · TEST-006 e fechamento:** roteiro do Reino (comprar sem ouro, vender e recomprar, entrega depois de vender, abandonar sem ouro para a multa, arma de outra classe, permanente com temporário ativo, recarregar e conferir), conferências novas nos roteiros do navegador, documentação ("Alterações do projeto"), Balanceamento e publicação.

### Plano da Fase 3 (modo contínuo, pedido do Pablo em 09/10)

Conteúdo provisório (TASK-012 e TASK-013 ainda não chegaram): o layout da Floresta, os mobs, o Boss e os itens ficam em arquivos de dados marcados **PROVISÓRIO – substituir pelo do grupo**. Números novos no `balanceamento.js`.

- **3a · Mundo e câmera (TASK-060):**
  - a partida passa a acontecer num mapa (`dados/mundo/`): a Floresta (7200 × 3600 px, provisória) e a arena de teste, que fica só no `npm run dev` (botão "Arena de teste" no Mapa, usado pelo roteiro do navegador);
  - a câmera segue o Líder e para nos limites; o mundo aparece entre o HUD e a faixa de baixo (ninguém anda embaixo delas);
  - a mira é recalculada a cada quadro pela câmera (com o mouse parado e a câmera andando, ela continua certa);
  - a mata fechada em volta é parede: ninguém atravessa;
  - longe da tela, os mobs "dormem" (não pensam nem andam), para manter os 60 FPS.
- **3b · Regiões (TASK-061):**
  - a Floresta começa estreita na zona segura, perto do Reino, e se abre da esquerda para a direita: fácil, média, difícil e o domínio do Boss;
  - cada região tem um tom de verde (dá para perceber a mudança até a arte chegar);
  - o HUD mostra a região atual;
  - a taxa usa o ponto inicial e a borda reais do mapa, e o domínio do Boss soma os pontos do RF48 (+7 na fuga).
- **3c · Mobs por região (TASK-062):**
  - mobs provisórios: lobo (corpo a corpo), aranha (atira de longe), javali (mais forte, corpo a corpo) e cervo (não hostil: só reage se for atacado), mais fortes nas regiões mais difíceis;
  - cada mob tem raio de detecção e território: persegue quem entra no raio, desiste quando o grupo sai do território dele e volta para casa;
  - a cada partida o bioma reinicia (mobs e recursos voltam);
  - **ninguém nasce em pedra, em cima de outro ou perto do grupo:** os mobs nascem com uma folga em volta (corrige a falha intermitente da Fase 1, dois inimigos nascendo encostados), e o grupo nunca nasce com mob perto.
  - **Aliado longe ou preso (proposta):** se um aliado ficar fora da tela e longe do Líder (ou preso) por alguns segundos, ele reaparece fora da tela, logo além da borda mais próxima de onde estava, num lugar livre com caminho até o Líder, e entra andando. Como acontece fora da vista, o jogador só vê o aliado chegando correndo, sem sumiço nem salto na frente dele. Caído não volta (continua esperando ajuda).
- **3d · Minimapa e descoberta (TASK-063, parte 1):**
  - no quadro reservado do HUD: começa escuro e revela por onde o grupo passa;
  - mostra a dificuldade das regiões descobertas, o Líder e a zona segura;
  - cada região tem áreas com nome; a primeira descoberta de uma área dá XP, dividido como o dos monstros (RF50);
  - o mapa descoberto entra no save (e na nuvem) no fim da partida, como os outros ganhos (RF12).
- **3e · Ponto de partida (TASK-063, parte 2):** a tela só aparece quando houver outra região descoberta e só libera as descobertas; o grupo nasce no início da região escolhida, sem mob perto, e a taxa já começa naquela distância.
- **3f · Coleta, drops e mochila da partida (TASK-064):**
  - catálogo provisório de itens (`dados/itens.js`), já com o equipamento de teste pedido pelo Pablo (capacete, espada, peitoral, calças, botas, manoplas e escudo de teste);
  - recursos no chão (cogumelo, erva, madeira) e drops dos mobs; E pega o mais perto;
  - a mochila da partida tem a capacidade da Força do grupo (RF33); o que não cabe fica no chão por um tempo, pisca e some;
  - os itens vão para a Mochila do Reino no fim, em todos os resultados (RF50), e aparecem no Resumo.
- **3g · Boss da Floresta (TASK-065):** o Guardião da Floresta no domínio dele, com ataques avisados (marca no chão antes do golpe), barra de vida grande no HUD, bônus de Boss na pontuação e pequena chance de deixar um equipamento especial (no painel DEV dá para forçar 100%).
- **3h · TEST-005 e fechamento:**
  - pior cenário (grupo de 5 e o máximo de mobs numa região), com o FPS medido por 2 minutos;
  - roteiro do navegador com as conferências novas; documentação (RF30 a RF41, RF48, RF53 e "Alterações do projeto"); roteiros manuais;
  - publicação no endereço principal (a regra das prévias por ramo foi trocada em 09/10 por um endereço só) e os dois relatórios.

### Proposta para a Fase 4: conteúdo por planilha e "Painel do Mestre" (esperando o ok do Pablo)

Pedido do Pablo em 09/10: poder colocar o conteúdo do grupo de uma vez e ter uma conta de desenvolvedor ("Mestre do RPG").

1. **Conteúdo por planilha:** itens, equipamentos, ofertas do Mercado, mobs e missões numa planilha modelo; `npm run importar:conteudo` põe tudo no jogo de uma vez e aponta os erros (id repetido, preço negativo) com a linha.
2. **Painel do Mestre no jogo:** só para contas marcadas como mestre no banco. Adicionar e editar itens e ofertas do Mercado num formulário, importar uma planilha inteira e dar itens a uma conta de teste. Vale para todos na hora; sem internet, vale o catálogo base do projeto.
3. **Segurança:** só uma linha de SQL rodada pelo Pablo marca uma conta como mestre (o e-mail dele não vai para o GitHub); o banco só deixa mestre mudar o catálogo. A conta pode ser a pessoal dele, com senha forte e própria.

### Plano da Fase 2 (modo contínuo)

- **8a · Base (TASK-091, TASK-092):**
  - `@supabase/supabase-js` (o cliente oficial, previsto no passo a passo que o Pablo delegou em 08/10);
  - URL e chave publicável no `.env.local` (fora do git) e os nomes no `.env.example`;
  - um único módulo cria o cliente (`src/conta/cliente.js`);
  - o SQL inteiro em `programacao/supabase/` (perfis com apelido único, saves com versão, sessão única, partidas e ranking, todos com RLS), que o Pablo roda no SQL Editor;
  - barra de teste só no `npm run dev`;
  - o projeto pronto para a Vercel e `documentacao/Vercel_passo_a_passo.md`.
- **8b · Cadastro, confirmação, login e senha (TASK-093, TASK-094):**
  - apelido único (conferido antes, e o banco recusa repetido);
  - tela Confirme seu e-mail com Reenviar;
  - login com mensagens claras e reenvio para conta não confirmada;
  - Esqueci minha senha e a tela da senha nova;
  - os links de e-mail funcionam no localhost e na Vercel.
- **8c · Sessão única (TASK-095):**
  - uma aba por navegador (trava do navegador);
  - uma sessão por conta no banco, com sinal a cada 1 minuto e expiração em 3;
  - "conta em uso", e a sessão fecha ao sair ou fechar a aba.
- **8d · Save no banco (TASK-096 a TASK-098):**
  - cópia local da conta com `versaoNoBanco`;
  - envio nos momentos de salvamento (começar partida, fim, primeiro personagem, Sair da conta), com a versão conferida no banco;
  - recuperação no login (RF11);
  - passagem do convidado para a conta nova;
  - sem internet ou com o Supabase fora do ar, nada trava: o save local continua, e a conta mostra uma mensagem clara.
- **9a · Salão da Glória (TASK-100 a TASK-102):** partidas registradas no fim, ranking com as 6 abas (aberto sem login, destacando quem está logado) e histórico "Minhas partidas" com 20 por página.
- **TEST-007 e publicação de teste:**
  - testes de unidade com um Supabase falso;
  - roteiro do navegador com o Supabase de verdade: dois navegadores na mesma conta, save antigo recusado, conta A tentando a B, ranking sem login e queda de internet;
  - publicação de teste na Vercel, feita pelo Pablo.
- **O que depende do Pablo, numa parada só:**
  - rodar o SQL;
  - configurar as URLs do Auth (e o SMTP, se o e-mail não chegar para outras pessoas);
  - criar duas contas de teste;
  - publicar na Vercel.

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

**5e · DOC-003: FEITO** (RF36, UC32, HU32, Conceito 21.5 e "Alterações do projeto"; as decisões do grupo ficaram marcadas como pendentes).
- Documentar no RF35, no RF36 e no Conceito o ataque de clique de cada classe, a esquiva (sem dano durante o avanço e com recarga) e as cores, como estão hoje.
- O que o grupo precisa decidir fica marcado como pendente e vai na pergunta do fim da fase:
  - se os 5 ataques são os definitivos;
  - se a aura do Sacerdote é ataque básico ou habilidade;
  - a cor do Guerreiro (azul provisório).

**7a · TASK-079, contratos na Guilda: FEITO** (539 testes, 222 conferências no navegador). Também: a lista de arte e som (`documentacao/Lista_de_Arte_e_Som.md`) e o passo a passo do Supabase (`documentacao/Supabase_passo_a_passo.md`) já estão escritos para o fim da fase; o roteiro do navegador ganhou um vigia que para tudo se ficar 4 minutos sem andar (o computador dormiu no meio de uma rodada).
- Abas "Contrato temporário" e "Contrato permanente" usando as regras da `regras/guilda.js`:
  - só aparecem as classes que o jogador não tem;
  - mostram preço, partidas e nível;
  - o permanente encerra o temporário da mesma classe;
  - mostram as partidas restantes de cada temporário;
  - o temporário nunca aparece como Líder na Preparação;
  - a mensagem diz o motivo quando falta ouro.
- O equipamento fixo do temporário espera o catálogo (TASK-070, Fase 4).
- Testes das telas e roteiro: contratar com o ouro ganho na partida e ver o novo aliado na partida seguinte.

**7b · TASK-071, pentágono e HUD do Reino: FEITO** (544 testes, 226 conferências no navegador). A Seleção de classe tem dois passos (ver e escolher), com o pentágono e a descrição; as Árvores mostram o pentágono, o nível e o XP de cada permanente; o HUD do Reino mostra a missão ativa com o progresso.
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
| DOC-003 Ataques de clique, esquiva e cores | FEITO (08/10): o RF36, o UC32, a HU32 e o Conceito (21.5) dizem o ataque de clique de cada classe, que a esquiva não deixa levar dano e as cores. FALTA O GRUPO decidir se os 5 ataques são os definitivos, se a aura do Sacerdote é ataque básico ou habilidade, e a cor do Guerreiro |
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
TASK-047 (itens na partida: Tab, E e R): FEITO na Fase 4 (parte 4d).

### EPIC-07 · Mundo da Floresta (etapa 6)
TASK-060 a TASK-065 e TEST-005: **FEITO (09/10) na Fase 3**, com conteúdo PROVISÓRIO (layout, mobs, Boss e itens) até a TASK-012 e a TASK-013. Publicada no endereço principal em 09/10, esperando o teste do Pablo. O TEST-005 deu 60 FPS de média e mínimo de 59 em 2 minutos de pior cenário (grupo de 5 e 20 mobs da Difícil), numa Intel Iris Xe.

### EPIC-08 · Reino com dados (etapa 7)
- **TASK-079 (contratos):** FEITO (08/10) na parte 7a: abas de contrato temporário e permanente na Guilda, com o ouro, os preços, as partidas restantes e o motivo quando falta ouro; a Preparação mostra quem vai como temporário. O equipamento fixo do temporário (RF29) espera o catálogo (TASK-070, Fase 4).
- **TASK-071 (pentágono):** FEITO (08/10) na parte 7b: componente `Pentagono` na Seleção de classe (com papel e descrição do Conceito §5) e nas Árvores; o HUD do Reino mostra apelido, Líder, ouro e a missão ativa com o progresso.
- **Os outros itens (TASK-070, TASK-072 a TASK-078, TASK-080, TASK-081 e TEST-006):** FEITOS na Fase 4 (10/10), com conteúdo PROVISÓRIO (catálogo, ofertas, receitas, árvores, missões, conquistas e minijogos) até a TASK-010, 014, 015 e 016. O TEST-006 virou roteiro automático (`npm run testar:reino`, os 7 casos) e manual (RE-01 a RE-16).

### EPIC-09 · Contas e Supabase (etapa 8)
- **TASK-090 (prova do e-mail):** COM VOCÊS. Alguém precisa criar um projeto gratuito no Supabase; eu ajudo no resto.
- **TASK-091 a TASK-098 e TEST-007:** A FAZER na Fase 2. Instalar o cliente do Supabase precisa da sua permissão.

### EPIC-10 · Salão da Glória, conquistas e som (etapa 9)
- **TASK-100 a TASK-102 (partidas no banco, ranking e histórico):** A FAZER na Fase 2.
- **TASK-103 (conquistas):** FEITO na Fase 4 (12 provisórias, até a TASK-015).
- **TASK-104 (escolher os sons):** COM VOCÊS.
- **TASK-105 (tocar os sons):** FEITO na Fase 4: o sistema está pronto e recebe os arquivos sozinho (`programacao/src/assets/audio/`); até lá, bipes provisórios.

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

**Comigo (modo contínuo):**
1. Esperar o teste visual da Fase 1 e ajustar o que o Pablo pedir.
2. Fase 2 (contas e Salão da Glória), quando o Supabase estiver pronto; senão, a Fase 3 (Floresta) antes.

**Com vocês**, já:
- fazer o teste visual da Fase 1 (roteiro no relatório e em `testes/Roteiros.md`) e autorizar o push;
- criar o projeto no Supabase e testar o e-mail (passo a passo em `documentacao/Supabase_passo_a_passo.md`);
- gerar a arte da lista em `documentacao/Lista_de_Arte_e_Som.md` e escolher os sons;
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
