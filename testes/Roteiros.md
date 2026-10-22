# Roteiros de teste à mão

Situações para testar o jogo, passo a passo. Cada uma tem um código para anotar o resultado no [Registro.md](Registro.md).
Atualizado em 21/10/2026, nas camadas do Reino e do Mapa com as peças do Pablo (seção CM). A cada parte nova, o Claude acrescenta as situações dela aqui.

## Antes de começar (vale para todas)

1. Dentro de `programacao`, rode `npm run dev` e abra o endereço que aparecer (normalmente http://localhost:5173).
2. **Iniciar jogo → Jogar como convidado.** Na primeira vez, aparece a narrativa: **Continuar** e escolha uma classe.
3. Para entrar na arena: **Jogar → Floresta → Início do bioma → Começar partida**.
4. **Barra de teste:** a faixa de baixo, com o selo TESTE. Ela troca a classe do Líder, cria mobs, derruba gente, força a IA...
5. **Painel DEV:** o botão **</> DEV** no canto de baixo à esquerda (só existe no `npm run dev`). Em "Personagens do save" ele mexe nos personagens, mas só fora da partida.
6. **Teclas:**
   - WASD anda, o mouse mira e o clique ataca;
   - 1 usa a habilidade e Espaço esquiva;
   - Q volta ao Reino e F foge;
   - Esc pausa e M muta.
7. **Para começar do zero:** no painel DEV, **Apagar progresso do convidado**.

Legenda: **Fazer** = o que você faz. **Deve acontecer** = o que o jogo tem que mostrar. Se for diferente, anote como **falhou**.

---

## CM. O Reino e o Mapa em camadas (20/10; com as suas peças desde 21/10)

Os VN-01 a VN-05 abaixo valiam para o Reino e o Mapa de antes (as áreas invisíveis); agora valem estes.

**CM-01 · Os botões não saem do lugar**
- Fazer: na Tela inicial, passe o mouse no "Como jogar", aperte e segure o botão do mouse em cima dele, solte fora; aperte Tab até ele; troque o tema nas Configurações. Repita em outras telas (Guilda, Mercado, Mapa) e no Reino.
- Deve acontecer: nenhum botão se mexe (nem um pixel). Apertado, ele só escurece um pouco por dentro.

**CM-02 · O Reino é montado com as suas peças**
- Fazer: entre no Reino e compare com a `ReinoRPG.png` e com as peças de `documentacao/Telas/reino_pixel_art`.
- Deve acontecer: o seu fundo, com o castelo, a Guilda, o Mercado, a Forja, a mochila, o estandarte, o moinho, a muralha, a Árvore de Habilidades (com a cerca e as pedras na frente) e as nuvens no lugar e no tamanho da imagem principal, com as cores e as formas das suas peças. A muralha da frente passa na frente do Mercado e da Forja; a Guilda fica na frente da muralha de trás. As placas são do jogo.

**CM-03 · Clique pelo desenho no Reino**
- Fazer: clique em qualquer parte da Guilda (uma torre, o portão), das bancas e das casas do Mercado, do telhado da Forja, da mochila e da copa da Árvore de Habilidades. Depois clique no chão entre eles (a praça da fonte, as casas do meio), no castelo, numa torre da muralha, no moinho e nas pedras na frente da Árvore.
- Deve acontecer: cada parte visível dos cinco lugares abre o lugar dela; o chão, as casas do meio, o castelo, a muralha, o moinho e as pedras não abrem nada.

**CM-04 · Mouse em cima no Reino**
- Fazer: passe o mouse devagar sobre cada objeto e cada placa; depois aperte Tab até cada placa.
- Deve acontecer: um contorno dourado brilhante aparece em volta do desenho do objeto (não um retângulo), a placa dele acende, aparece a legenda embaixo da placa e o cursor vira a mãozinha. O objeto não se mexe. Com o Tab, o mesmo; Enter abre.

**CM-05 · Mapa com as suas peças**
- Fazer: compare o Mapa com a `MapaRPG.jpeg`. Passe o mouse e clique em cada bioma, no castelo, na Fazenda, na Mina e no Lago; clique também no mar e nas montanhas cinzas em volta do Planalto.
- Deve acontecer: as suas peças no lugar da imagem principal (o chão do Planalto preenche o anel de montanhas; a fumaça sai da cratera e passa da borda de cima). O contorno dourado acende em volta do desenho e aparece o nome. Floresta: "Jogar", abre a Preparação. Tundra, Vulcânico e Deserto: cores normais; com o mouse em cima, cadeado e "Em breve" (contorno claro), e o clique não abre. Castelo: volta ao Reino. Fazenda, Mina e Lago: "Rodadas hoje" e abrem os minijogos. Mar e montanhas: nada.

**CM-06 · Tamanhos e tela cheia**
- Fazer: repita o CM-03 e o CM-05 com a janela em 1366×768, maximizada em 1920×1080 e em tela cheia (o JOGAR entra nela).
- Deve acontecer: igual em todos; nada fica deslocado, e as peças ficam nítidas (sem serrilhado).

**CM-07 · Animações do cenário**
- Fazer: fique uns 20 s olhando o Reino e o Mapa.
- Deve acontecer: no Reino, as nuvens andam bem devagar (passando atrás das montanhas e da copa do canto), as pás do moinho giram devagar, a lanterna do estandarte pisca de leve, a água do lago e da fonte brilha e sai fumaça da Forja e de três chaminés. No Mapa: a fumaça do vulcão sobe devagar, a lava pulsa, a água das cachoeiras (a do lago e as três da Floresta) desce, neva na Tundra, uma luz fraca de vento passa pela Floresta e o mar vai e volta. Tudo lento; nada pisca forte. Bandeiras e árvores ficam paradas (você anima depois).

**CM-08 · Desligar as animações**
- Fazer: Configurações → "Animações do cenário: ligadas" (vira "desligadas"). Depois ligue de novo e, no Windows, ligue Configurações → Acessibilidade → Efeitos visuais → "Efeitos de animação" desligado (o "reduzir movimento").
- Deve acontecer: desligadas, o cenário fica parado (do jeito das suas peças, com a fumaça do vulcão no lugar). Com o "reduzir movimento" do Windows, também parado, e as Configurações dizem "O computador pede menos movimento: o cenário fica parado."

**CM-09 · Internet lenta**
- Fazer: abra o site numa internet mais lenta (ou no celular roteado) e vá da Tela inicial até o Reino e depois ao Mapa.
- Deve acontecer: as peças aparecem todas juntas (nunca uma a uma por cima do fundo); como elas já começam a carregar nas telas de entrada, o Reino normalmente já abre inteiro.

---

## VN. Visual novo (20/10)

**VN-01 · O Reino igual à imagem**
- Fazer: entre no Reino e compare com a imagem que você mandou.
- Deve acontecer: a tela é a sua imagem, inteira, sem botões cinza por cima. No alto, uma faixa discreta com o apelido, o Líder, o ouro e a missão. O "?" fica ao lado da engrenagem.

**VN-02 · As placas desenhadas clicam**
- Fazer: passe o mouse em cada placa (Salão da Glória, Configurações, Guilda, Mercado, Forja, Mochila, JOGAR, Árvores de Habilidades) e clique em cada uma. Clique também na coroa, na engrenagem, no estandarte da Guilda, na banca do Mercado, na bigorna e na mochila desenhada.
- Deve acontecer: ao passar o mouse, a placa clareia com um brilho dourado, o cursor vira a mãozinha e aparece embaixo para que o lugar serve ("missões e contratos"...). O clique leva ao lugar certo; o desenho em cima da placa também.

**VN-03 · Tela cheia**
- Fazer: clique em JOGAR (o jogo entra em tela cheia) e volte ao Reino. Repita o VN-02 em tela cheia.
- Deve acontecer: as áreas continuam exatamente em cima das placas.

**VN-04 · O Mapa igual à imagem**
- Fazer: abra o Mapa e passe o mouse em cada região.
- Deve acontecer: o contorno da região acende em dourado e aparece o nome. A Floresta diz "Jogar"; a Tundra, o Vulcânico e o Deserto têm cadeado e "Em breve" e não abrem. No Planalto: o castelo volta ao Reino; a Fazenda (campos e moinho), a Mina (entrada na montanha) e o Lago (com a cachoeira) mostram "Rodadas hoje" e abrem os minijogos.

**VN-05 · O clique vale no formato da região**
- Fazer: clique no mar, perto da borda da Floresta, e depois logo dentro dela.
- Deve acontecer: no mar, nada; dentro da Floresta, abre a Preparação.

**VN-06 · A identidade nas outras telas**
- Fazer: passe pela Tela inicial, Login, Seleção, Guilda, Mercado, Forja, Mochila, Árvores, Salão da Glória, Preparação, Resumo, um minijogo, Configurações, Pausa e Como jogar, nos dois temas (Configurações → Tema).
- Deve acontecer: botões em placas escuras com borda dourada; o botão principal de cada tela em vermelho e dourado; o título numa faixa vermelha; painéis de pergaminho (claro) ou madeira escura (escuro); a fonte em pixel. Tudo continua legível, e a trilha, as dicas, os verbos e as confirmações continuam lá.

**VN-07 · Carregamento e partida**
- Fazer: recarregue o site e comece uma partida.
- Deve acontecer: as telas de carregamento ficam na noite azul, com o título na faixa vermelha e a barra dourada; o HUD da partida fica em placas escuras com borda dourada fina.

---

## AP. Ajustes na partida (14/10)

**AP-01 · O Líder nunca é teletransportado (Parte 2)**
- Fazer: na Floresta, ande encostado na mata fechada em volta das regiões, de frente e na diagonal, e entre nas quinas. Os pontos onde o salto acontecia: a parede de cima da região Média (perto de x 2.878 a 4.066, y 513, uns 2 minutos andando para a direita a partir do Reino, subindo até a mata) e as árvores do domínio do Boss (perto de x 5.655, y 1.452 e x 5.686, y 1.748).
- Deve acontecer: empurrando de frente, o Líder para na parede (não escorrega de lado); na diagonal, segue a parede devagar; na quina, para. Ele nunca some e aparece em outro lugar.

**AP-02 · O grupo abre caminho em campo aberto (Parte 3)**
- Fazer: com o grupo cheio e parado num campo aberto, ande com o Líder bem no meio dele.
- Deve acontecer: cada aliado no caminho sai para o lado antes de o Líder encostar, e o grupo se fecha atrás. O Líder não para. Com aliados de nível alto (IA avançada), eles saem mais cedo.

**AP-03 · Passar por quem não tem para onde ir (Parte 3)**
- Fazer: leve o grupo para um corredor estreito entre árvores ou pedras (ou um canto) e ande com o Líder contra eles.
- Deve acontecer: o Líder passa por dentro de quem não tem para onde sair, sem travar e sem empurrar ninguém para dentro da pedra. Depois de passar, eles voltam a colidir. Nenhum aliado fica em cima de outro.

**AP-04 · Fugindo pelo meio do grupo (Parte 3)**
- Fazer: aperte F duas vezes (fuga) e corra pelo meio do grupo. Teste também com Q (voltar ao Reino) fora de combate.
- Deve acontecer: durante a contagem, o Líder passa por todos os aliados sem parar.

**AP-05 · A MOCHILA no meio da tela (Parte 1)**
- Fazer: na partida, com poções na mochila, aperte Tab. Tente andar (WASD) e atacar.
- Deve acontecer: a janela "MOCHILA" abre no meio, com "Peso usado / capacidade" e o mapa um pouco escuro atrás. O tempo do jogo continua correndo (os mobs se mexem), mas o Líder não anda, não ataca e não pega nada do chão.

**AP-06 · Pegar, metade, pôr e trocar (Parte 1)**
- Fazer: com a mochila aberta, passe o mouse numa poção; clique nela; clique num quadradinho vazio; clique com o botão direito numa pilha; clique noutro item com algo na mão.
- Deve acontecer: passar o mouse mostra uma caixinha com o nome e o que o item faz. O clique pega a pilha inteira (ela segue o mouse); clicar no vazio põe lá. O botão direito pega a metade (de 5, pega 3). Com item na mão, clicar noutro item troca os dois de lugar.

**AP-07 · Jogar no chão e fechar com item na mão (Parte 1)**
- Fazer: pegue a metade de uma pilha e clique fora da janela (no mapa escuro). Depois pegue outro item e aperte Tab (ou Esc).
- Deve acontecer: o item cai no chão perto do Líder, com o anel do tempo (some em 30 s), sem pedir confirmação. Ao fechar com item na mão, ele volta para a mochila (nada cai no chão).

**AP-08 · E e R com o mouse no item (Parte 1)**
- Fazer: deixe o Líder e um aliado feridos. Com a mochila aberta, passe o mouse numa poção de vida e aperte E; depois R.
- Deve acontecer: E cura o Líder; R cura o aliado mais ferido (com uma poção de mana, o com menos mana; com um acelerador, o mais perto do Líder).

**AP-09 · Lixeira na Mochila do Reino (Parte 1)**
- Fazer: no Reino, abra a Mochila. Pegue uma pilha com o botão direito e clique na lixeira; clique em Cancelar. Pegue de novo e confirme.
- Deve acontecer: a lixeira fica vermelha com item na mão. Ao soltar nela, o detalhe pergunta "Descartar N …? … somem para sempre". Cancelar devolve o item para a grade; "Sim, descartar" tira do save, com a mensagem "Você descartou …". O filtro por tipo apaga os outros itens sem mudar ninguém de lugar.

**AP-10 · Escudo segura o lobo e rompe com o Boss (Parte 4)**
- Fazer: jogue com o Tanque como Líder (Força do começo, 15, sem equipamento de Força). Fique de frente para um lobo da região Fácil e deixe ele morder. Depois vá ao domínio do Boss, fique de frente para ele e espere a investida (a faixa no chão).
- Deve acontecer: a mordida do lobo é bloqueada ("BLOQUEADO", sem perder vida). A investida do Boss (40) passa do limite (32,5): aparece "Escudo rompido!", o escudo treme e fica avermelhado, e o Tanque perde a vida do golpe inteiro. O pisão (área) continua acertando o Tanque mesmo de frente.

**AP-11 · Escudo com mais Força (Parte 4)**
- Fazer: nas Árvores, ponha pontos em Força no Tanque até pelo menos 20 e repita a investida do Boss.
- Deve acontecer: com Força 20 ou mais, a investida é bloqueada ("BLOQUEADO").

---

## VF. Ajustes da versão final (14/10)

**VF-01 · Trilha no alto**
- Fazer: no Reino, entre na Forja e clique nas abas (Equipar, Comprar...).
- Deve acontecer: no alto aparece "Reino › Forja › Equipar"; o nome da aba muda junto. Clicar em "Reino" na trilha volta ao Reino.

**VF-02 · Esc igual ao Voltar**
- Fazer: entre no Mercado e aperte Esc duas vezes. Depois abra o Mapa, entre na Fazenda e aperte Esc.
- Deve acontecer: o primeiro Esc fecha a dica (se ela estiver aberta); o segundo volta ao Reino. Da Fazenda, o Esc volta ao Mapa. No Reino e na Tela inicial, o Esc não faz nada. Na partida, o Esc continua pausando.

**VF-03 · Dica da primeira visita**
- Fazer: com um convidado novo (painel DEV: Apagar progresso do convidado), passe pelas telas. Feche uma dica com **Entendi**. Volte para a mesma tela. Clique no **?**.
- Deve acontecer: cada tela mostra, na primeira vez, uma frase curta dizendo para que serve. Fechada, ela não volta sozinha; o **?** reabre. **Como funciona** abre a explicação completa.

**VF-04 · Confirmação das ações**
- Fazer: no Mercado, compre 1 Poção de vida; venda 1; na Guilda, aceite uma missão.
- Deve acontecer: embaixo aparece "Você comprou 1 Poção de vida · −25 de ouro", "Você vendeu 1 Poção de vida · +12 de ouro" e "Você aceitou a missão ...".

**VF-05 · Como jogar**
- Fazer: na Tela inicial, clique em **Como jogar**.
- Deve acontecer: à esquerda os controles (WASD, mouse, clique, Espaço, 1 2 3, E, Tab, Q, F, Esc, M) e à direita as regras (objetivo, grupo, voltar com o ouro, itens no chão, entre as partidas).

**VF-06 · Descartar na Mochila do Reino**
- Fazer: na Mochila, escolha um item com 3 ou mais. Clique em **Descartar…**, aperte **+** uma vez e depois **Todas**. Cancele. Repita escolhendo 2 e confirme.
- Deve acontecer: a caixa mostra o item, a quantidade e "Eles somem para sempre". Cancelar não muda nada; confirmar tira só os 2 e mostra "Você descartou 2 ...".

**VF-07 · Descartar na partida (critério do Pablo)**
- Fazer: leve 3 poções na Preparação. Na partida, aperte Tab, escolha a poção, **Descartar…**, **+** (fica 2) e **Sim, descartar 2**.
- Deve acontecer: fica 1 poção na mochila e 2 caem no chão perto do Líder, com um anel amarelo em volta que vai esvaziando. Em 30 s elas somem (piscando nos últimos 5 s). Pegar de volta com E antes disso devolve as 2.

**VF-08 · Item natural e item dropado**
- Fazer: na Floresta, olhe um cogumelo ou uma madeira no chão. Derrote um lobo que deixe uma pele.
- Deve acontecer: o recurso do mapa não tem anel e nunca some. A pele tem o anel do tempo, some em 30 s e pisca no fim. Com a mochila cheia (barra de teste: Encher mochila), apertar E perto da pele avisa que não cabe e o tempo dela continua o mesmo; perto do cogumelo, ele continua lá, sem tempo.

**VF-09 · Tela cheia**
- Fazer: na Tela inicial, clique em **Iniciar jogo**. Depois clique no X discreto do canto de cima à direita. No Reino, clique em **Jogar**. Nas Configurações, desligue **Tela cheia** e clique em Jogar de novo.
- Deve acontecer: o clique em Iniciar jogo já entra em tela cheia (sem F11). O X sai dela. Jogar entra de novo. Desligada nas Configurações, nenhum clique entra mais em tela cheia. Se o navegador recusar, o jogo segue sem erro.

**VF-10 · Esc em tela cheia na partida**
- Fazer: comece uma partida em tela cheia, fora de combate, e aperte Esc. No Firefox, faça o mesmo.
- Deve acontecer: no Chrome e no Edge, o Esc pausa e o jogo continua em tela cheia (segurar o Esc sai dela). No Firefox, o Esc sai da tela cheia, o jogo pausa e aparece **Voltar à tela cheia** no canto.

**VF-11 · Tamanhos de tela**
- Fazer: jogue numa tela de 1366×768 e numa de 1920×1080 (ou mude o zoom do navegador para 80% e 125%), com e sem tela cheia.
- Deve acontecer: nada cortado, o HUD inteiro na tela e a mira exatamente onde está o mouse.

**VF-12 · HUD transparente**
- Fazer: na Floresta, com o grupo cheio (barra de teste: Encher grupo), ande até o alto e o canto do mapa; troque o tema nas Configurações.
- Deve acontecer: sem faixa escura em cima: o Líder e o grupo em cima à esquerda; tempo, pontos, ouro e fuga no meio; Configurações e minimapa à direita; a barra de ações (Clique, Espaço, 1, 2, 3) embaixo no meio, com a recarga em volta de cada ícone. Quem passa embaixo do HUD continua aparecendo. Os avisos aparecem embaixo dos números, no máximo 3.

**VF-13 · Minijogos diários**
- Fazer: no Mapa, veja a linha embaixo da Fazenda. Entre e jogue 3 rodadas (pode sair no meio com Esc).
- Deve acontecer: "Rodadas hoje: 3 de 3 · renova em HH:MM", e o número cai a cada rodada começada. Depois da terceira, a Fazenda fica apagada no Mapa e o botão do minijogo diz quando renova. A Mina e o Lago continuam com as 3 deles. Com conta, mudar o relógio do computador não devolve rodadas.

**VF-14 · Hitbox menor**
- Fazer: na Floresta, com o grupo cheio, ande no meio do grupo parado e passe entre duas árvores próximas.
- Deve acontecer: o Líder passa sem grudar; o grupo inteiro passa pelo vão sem travar. Os desenhos podem se encostar um pouco, mas ninguém fica em cima de ninguém.

**VF-15 · Telas de carregamento**
- Fazer: abra o site com a internet lenta (F12 → Network → Slow 4G). Depois comece uma partida.
- Deve acontecer: na hora, uma tela escura com "Jogo RPG" e uma barra, antes do jogo. Na partida, "Carregando a partida", a barra com a porcentagem, a etapa e uma dica. Desligando a internet na hora de começar a partida, aparece "Não deu para carregar a partida" com **Tentar de novo**.

**VF-16 · Arco que carrega (rápido x cheio, no boneco)**
- Fazer: no `npm run dev`, Jogar → **Arena de teste** → Começar partida, com o Arqueiro. Fique a uns 4 quadrados abaixo do boneco (o X) e dê um clique rápido nele. Depois segure o clique até a barra ficar amarela e brilhar, e solte.
- Deve acontecer: o clique rápido solta uma flecha curta e fraca (cerca de 11 de dano), que não chega longe. Segurando, aparecem a barra em cima do Arqueiro, a linha pontilhada até onde a flecha vai e, na carga cheia, um brilho; a flecha vai até o fim da linha, mais rápida, e tira cerca de 38. Enquanto puxa, o Arqueiro anda mais devagar.

**VF-17 · Arco com Agilidade baixa e alta**
- Fazer: no painel `</> DEV`, em "Personagens do save", clique **Agi 5** no Arqueiro e repita o VF-16; depois **Agi 100** e repita.
- Deve acontecer: com Agi 5, a barra leva cerca de 1 s para encher; com Agi 100, cerca de 0,45 s (nunca menos). Em nenhum caso dá para soltar flechas fortes em sequência: depois de soltar, há uma pausa curta antes de puxar de novo.

**VF-18 · Arqueiro aliado**
- Fazer: com outro Líder e o Arqueiro no grupo (Encher grupo), crie mobs (Criar mob vermelho).
- Deve acontecer: o Arqueiro aliado mostra a barra de carga em cima dele antes de cada flecha; na IA básica às vezes a flecha cai antes do mob.

**VF-19 · Tanque e o pisão do Boss**
- Fazer: na Floresta (Muito difícil), com o Tanque como Líder, mire no Boss (escudo de frente) e fique dentro da marca do pisão.
- Deve acontecer: o pisão tira vida do Tanque mesmo com o escudo de frente. Um bote de lobo ou um tiro vindo de frente continua sendo bloqueado ("Bloqueado").

**VF-20 · Claude Code (Parte 0)**
- Fazer: no Claude Code, digite `/mcp` e autentique **supabase** e **vercel**. Depois `/skill-doctor`.
- Deve acontecer: as duas conexões ficam "connected"; o skill-doctor mostra as skills do projeto (modo-continuo, publicar, verify, relatorio-de-fase, balanceamento, run-jogo-rpg).

---

## A. Arena e combate básico (parte 5a)

**A-01 · Andar e mirar**
- Fazer: ande com WASD, inclusive na diagonal; mexa o mouse em volta do Líder.
- Deve acontecer: o Líder anda na mesma velocidade reto e na diagonal, e o triângulo branco gira para o mouse. Ninguém entra embaixo do HUD (em cima) nem da barra de teste (embaixo).

**A-02 · Ataque de cada classe**
- Fazer: troque o Líder na barra (Guerreiro, Mago, Tanque, Sacerdote, Arqueiro) e clique no boneco de treino (o quadrado marrom com X).
- Deve acontecer:
  - Guerreiro: a espada varre um arco;
  - Mago: a bola cresce e explode;
  - Arqueiro: a flecha é rápida;
  - Sacerdote: a aura amarela cura quem está dentro;
  - Tanque: o escudo empurra.

  O boneco mostra o dano e recupera a vida depois de 3 s sem apanhar.

**A-03 · Esquiva**
- Fazer: aperte Espaço andando e parado.
- Deve acontecer: um avanço curto (na direção do movimento ou, parado, da mira), com recarga curta, sem levar dano durante o avanço.

**A-04 · Mob vermelho**
- Fazer: **Criar mob vermelho** e chegue perto dele. Depois fuja para longe.
- Deve acontecer: aparece "!" e ele persegue; antes de bater, pisca e encolhe (aviso) e dá o bote. Longe, aparece "?" e ele desiste.

**A-05 · Atirador e escudo**
- Fazer: com o Tanque como Líder, **Criar atirador**, chegue perto e vire o escudo para ele.
- Deve acontecer: o atirador mantém distância e atira bolinhas lentas; o escudo mostra "BLOQUEADO" e o Líder não perde vida.

**A-06 · Invencível**
- Fazer: **Invencível: não** → vira "sim"; deixe um mob bater.
- Deve acontecer: o Líder não perde vida (os aliados perdem).

## B. Colisão e travamento (parte 5b)

**B-01 · Encher grupo**
- Fazer: **Encher grupo**.
- Deve acontecer: aparece um aliado de cada classe que falta, em volta do Líder; ninguém nasce em cima de outro nem dentro de uma pedra.

**B-02 · Contornar pedras e o canto do L**
- Fazer: ande para o outro lado de uma pedra. Depois entre no canto de dentro do L (as duas pedras coladas embaixo, à esquerda) e saia.
- Deve acontecer: os aliados contornam as pedras e chegam perto do Líder; ninguém fica preso no canto.

**B-03 · Juntar todos**
- Fazer: **Juntar todos**.
- Deve acontecer: todos vão para o mesmo ponto e se separam aos poucos em menos de 2 s, sem pulo e sem ninguém ir para dentro de uma pedra.

**B-04 · Aperto contra a pedra**
- Fazer: com o grupo cheio, encoste numa pedra e continue andando contra ela.
- Deve acontecer: ninguém entra na pedra nem fica um dentro do outro (as bordas podem se encostar um instante).

**B-05 · Aliado parado na frente**
- Fazer: pare, espere os aliados pararem e ande contra um deles.
- Deve acontecer: ele sai da frente; o Líder nunca fica preso atrás de um aliado.

## C. IA dos aliados (partes 5b e 5b.1)

**C-01 · Ninguém treme (faça nos 3 níveis: botão "IA:" na barra)**
- Fazer: **Encher grupo** e pare em três lugares, um de cada vez:
  - num canto da arena;
  - no canto de dentro do L;
  - encostado numa pedra.
- Deve acontecer: os aliados param em volta, mesmo tortos, e ficam imóveis.

**C-02 · Folga**
- Fazer: com os aliados parados, ande um pouquinho (menos de meia pedra). Depois ande para longe.
- Deve acontecer: com pouco movimento eles não se mexem; com mais, vêm atrás.

**C-03 · Combate em cada nível (Mago como Líder, 3 mobs vermelhos)**
- **IA básica:**
  - o Tanque às vezes fica com o grupo e não avança;
  - o Arqueiro às vezes chega quase encostado no mob;
  - o Mago e o Guerreiro vão para o meio da luta;
  - sem ninguém ferido, o Sacerdote fica onde está; com alguém ferido, vai até ele (e às vezes escolhe o ferido mais perto, não o mais ferido).
- **IA média:**
  - o Arqueiro e o Mago ficam mais longe e se reposicionam para ter linha de tiro;
  - o Tanque ainda às vezes não avança;
  - o Sacerdote às vezes vai para trás do grupo.
- **IA avançada:**
  - o Tanque vai à frente, com o contorno vermelho da Provocação, e o Guerreiro fica ao lado dele;
  - o Arqueiro e o Mago ficam lado a lado, atrás, e o Arqueiro escolhe o mob mais forte;
  - o Sacerdote fica no fundo e, para curar, fica atrás do ferido, longe do mob;
  - quando um mob pisca avisando o golpe, às vezes o aliado recua andando (aliados nunca esquivam).

**C-04 · Linha de tiro**
- Fazer:
  1. Troque o Líder para o **Guerreiro**, para o Mago e o Arqueiro ficarem como aliados.
  2. Fique à esquerda da pedra alta do meio de baixo, com um mob do outro lado, perto dela.
- Deve acontecer: na IA média e na avançada, o Arqueiro e o Mago contornam a pedra até ter linha livre e só então atiram. Na básica, às vezes atiram na pedra (é o erro dela).

## D. Desmaio e resgate (parte 5b)

**D-01 · Aliado levantado pela ajuda**
- Fazer: **Encher grupo**, fique longe dos mobs e clique em **Derrubar aliado**.
- Deve acontecer: ele tomba, fica cinza e mostra a contagem de 30 s. Um aliado vai até ele e, parado perto por 5 s, o levanta com pouca vida, e ele fica "frágil".

**D-02 · Área suja**
- Fazer: derrube um aliado perto de um mob.
- Deve acontecer: a ajuda não anda enquanto houver mob perto ("inimigos perto!"); limpando a área, ela recomeça.

**D-03 · Ressurreição**
- Fazer: com o Sacerdote com mana cheia (**Recarregar habilidades**), derrube um aliado perto dele.
- Deve acontecer: o Sacerdote usa a Ressurreição: o aliado volta com a vida cheia e o contorno dourado (fortalecido).

**D-04 · Perdido**
- Fazer: **Aliados ajudam: sim** → vira "não"; derrube um aliado e espere 30 s.
- Deve acontecer: a Pedra de Retorno o leva (brilho azul, "PERDIDO"), ele some do mapa, e o HUD mostra "Classe: perdido".

**D-05 · Líder caído**
- Fazer: com aliados de pé, **Derrubar Líder**.
- Deve acontecer: abaixo do HUD aparece "O Líder desmaiou: 30 s para ser levantado". Os aliados vão até ele e o levantam; o jogo não acaba.

## E. Habilidades e mana (parte 5b)

**E-01 · Tecla 1 de cada classe**
- Fazer: com cada classe como Líder, aperte 1 perto de mobs.
- Deve acontecer:
  - Guerreiro: Giro (golpe em volta);
  - Arqueiro: Tiro perfurante (atravessa os mobs e o mapa, para em pedra);
  - Mago: Meteoro (aviso no chão onde está o mouse, depois a explosão);
  - Tanque: Provocação (contorno vermelho, mobs vão nele);
  - Sacerdote: Ressurreição (só com alguém caído perto).

  O HUD mostra a mana gasta e a barra da recarga.

**E-02 · Sem mana, em recarga, tecla vazia**
- Fazer: use a tecla 1 duas vezes seguidas; aperte 2; gaste toda a mana e tente de novo.
- Deve acontecer: aparecem "EM RECARGA", "TECLA VAZIA" e "SEM MANA" em cima do Líder, e nada sai.

---

## SA. Sacerdote sempre curando (parte 5d)

**SA-01 · Cura fora de combate**
- Fazer:
  1. **Encher grupo** e afaste-se dos mobs.
  2. Deixe um mob bater num aliado (ou ligue o Invencível e deixe os aliados apanharem) e depois derrote o mob.
  3. Espere o grupo sair de combate.
- Deve acontecer: o Sacerdote vai até quem ficou ferido e solta a aura amarela, mesmo fora de combate, até a vida ficar cheia. Com alguém ferido, a aura não para: assim que uma acaba, outra começa (desde 08/10). Antes, ele só curava em combate e quem estivesse abaixo de 70%.

**SA-02 · O mais ferido primeiro**
- Fazer: com o grupo cheio e dois aliados feridos, um bem mais ferido que o outro e longe um do outro.
- Deve acontecer: na IA média e na avançada, ele vai primeiro no mais ferido. Na básica, às vezes vai no mais perto.

**SA-03 · Básica também vai até quem precisa**
- Fazer: "IA: básica" e um aliado ferido longe do Sacerdote.
- Deve acontecer: o Sacerdote anda até ele e cura (a básica só fica parada quando ninguém precisa de cura).

**SA-04 · Avançada protegida**
- Fazer: "IA: avançada", um mob batendo num aliado.
- Deve acontecer: o Sacerdote se coloca atrás do ferido, do lado longe do mob, e cura de lá.

**SA-05 · Ele mesmo se cura**
- Fazer: deixe um mob bater no Sacerdote e depois afaste o mob.
- Deve acontecer: com só ele ferido, ele solta a aura em si mesmo.

## NV. Um nível da IA não atrapalha o outro (parte 5d)

**NV-01 · Desvio de quem está parado**
- Fazer:
  1. Fora da partida, painel DEV → **Personagens do save** → **Contratar todas as classes**.
  2. Deixe o Sacerdote no nível 70 (avançada) e o Guerreiro no 1 (básica).
  3. Na partida, pare num lugar em que o Guerreiro fique parado entre o Sacerdote e um aliado ferido.
- Deve acontecer: o Sacerdote contorna o Guerreiro de longe, sem encostar e sem travar. Com o Sacerdote na média, ele dá um passo para o lado quando quase encosta.

**NV-02 · O Guerreiro avançado não espera o Tanque**
- Fazer: Guerreiro avançado (nível 70+) e Tanque básico (nível 1); entre em combate várias vezes.
- Deve acontecer: quando o Tanque básico erra e fica com o grupo, o Guerreiro não fica parado ao lado do lugar vazio do Tanque: vai no mob mais perto do Líder. Com o Tanque na frente, fica ao lado dele.

## UI. Interface intuitiva (Fase 4.5)

O padrão está no [Guia de Interface](../documentacao/Guia_de_Interface.md). Em cada tela, a pergunta é: dá para entender o que ela faz só de olhar, sem ler o código? Para ter itens e ouro: no `npm run dev`, painel `</> DEV` → **Itens de teste** (no site, jogue e compre).

**UI-01 · Mochila do Reino**
- Fazer: Reino → Mochila. Clique nos filtros (Consumíveis, Materiais, Equipamentos, Especiais) e num item.
- Deve acontecer: uma grade de quadradinhos, com a quantidade no canto e a borda na cor da raridade (cinza, verde, azul, laranja). O filtro deixa só o tipo dele. À direita aparecem o item grande, os selos (raridade, tipo, para quem serve), a função, a descrição e o peso. Descartar pede confirmação.

**UI-02 · Mercado, Comprar**
- Fazer: Mercado → Comprar. Escolha uma oferta barata e depois o Pergaminho (300) com pouco ouro.
- Deve acontecer: o ouro sempre à vista, o preço embaixo de cada item e o selo "ofertas ★ mudam em N partidas". Com ouro, aparece "Seu ouro: X → Y" e o botão "Comprar por 25 de ouro". Sem ouro, o item fica apagado e o botão diz "Ouro insuficiente…".

**UI-03 · Mercado, Vender**
- Fazer: Mercado → Vender → um item.
- Deve acontecer: a sua Mochila em grade, com "+12" (quanto o Mercado paga) embaixo de cada item. O ouro antes e depois aparece em verde, nos botões "Vender 1 por 12" e "Vender todos (6) por 72". Equipamento não aparece (vende na Forja).

**UI-04 · Mercado, Trocar**
- Fazer: Mercado → Trocar.
- Deve acontecer: cada troca numa linha: "Você dá" (o número no canto é quanto pede; embaixo, "tem N", em vermelho se falta) ⇄ "Você recebe". Quando falta item, o botão Trocar fica apagado e diz o que falta.

**UI-05 · Catálogo**
- Fazer: com um convidado novo, Mercado (ou Forja) → Catálogo. Depois jogue, pegue itens e volte.
- Deve acontecer: tudo o que existe no beta, em grade. O que você nunca teve aparece tracejado com "?", e o detalhe diz "Vem de:" (Mercado, Forja, um monstro, o chão, um minijogo). Os itens que você pegou passam a aparecer normais e continuam assim depois de vender.

**UI-06 · Forja, Equipar**
- Fazer: Forja → Equipar. Clique no espaço Arma do boneco, numa arma de outra classe e depois numa da sua classe.
- Deve acontecer: o boneco no meio, com os 7 espaços em volta (vazios tracejados). Ao lado, a grade do que serve naquele espaço, com a de outra classe apagada. Escolhida uma peça, a lista "antes → depois" mostra o que sobe (verde ▲) e o que desce (vermelho ▼). O botão "Equipar …" fica apagado com "… é só para Guerreiro." quando não serve. Com algo equipado, aparece "Tirar …".

**UI-07 · Forja, Fabricar**
- Fazer: Forja → Fabricar. Escolha uma receita sem os materiais e outra com tudo.
- Deve acontecer: a receita desenhada: os materiais (com "tem N" embaixo, em vermelho o que falta), o ouro, uma seta e o resultado. As receitas que não fecham ficam apagadas na grade. O botão "Fabricar …" só acende com tudo; apagado, diz o que falta.

**UI-08 · Guilda, Missões**
- Fazer: Guilda → Missões. Aceite uma missão. Depois clique em Abandonar….
- Deve acontecer: um quadro de cortiça com um cartaz por missão (o símbolo e a cor do tipo, o objetivo e a recompensa em ouro e XP). A missão aceita aparece em destaque em cima, com a barra de progresso. O botão "Entregar: +80 de ouro e +120 XP" fica apagado até cumprir. Abandonar mostra a multa e o ouro antes e depois antes de confirmar.

**UI-09 · Guilda, Contratos**
- Fazer: Guilda → Contrato temporário → Contratar → Assinar o contrato. Depois Contrato permanente.
- Deve acontecer: uma carta por classe, com retrato (a cor da classe até a arte), papel, pentágono pequeno e preço. O temporário tem borda tracejada azul e o selo "3 partidas · nível 5 · não ganha XP"; o permanente, borda dupla vinho e "para sempre · começa no nível 1". Contratar abre o contrato para assinar, com o ouro antes e depois. Os ativos aparecem embaixo, com as partidas restantes.

**UI-10 · Preparação**
- Fazer: Jogar → Floresta. Clique nas poções da esquerda até encher a mochila.
- Deve acontecer: duas grades com uma seta no meio: à esquerda "Mochila do Reino" ("tem N"), à direita "Vai na partida" ("leva N"). A barra de peso enche e fica vermelha no limite. Quando não cabe, aparece o motivo. Clicar à direita devolve 1.

**UI-11 · Mochila da partida (Tab)**
- Fazer: na partida, aperte Tab.
- Deve acontecer: a janela à direita, com a barra de peso e a grade pequena (ícone de 32 px). Os itens que não se usam na partida ficam apagados. Os botões "Usar no Líder (E)" e "Usar no aliado (R)" são cor-de-rosa.

**UI-12 · Salão da Glória**
- Fazer: Salão da Glória → Melhores pontuações (com uma conta que esteja no ranking).
- Deve acontecer: os 3 primeiros com medalha (ouro, prata e bronze) e fundo colorido; a sua linha com contorno laranja e o selo "você".

**UI-13 · Reino**
- Fazer: olhe o Reino.
- Deve acontecer: cada lugar com o seu símbolo e uma linha embaixo dizendo o que ele é ("missões e contratos", "comprar, vender e trocar"…). As posições continuam as mesmas.

**UI-14 · O "?" de cada tela**
- Fazer: em cada tela do Reino, na Preparação, no Mapa e nos minijogos, clique no "?" ao lado de Configurações; depois aperte Esc.
- Deve acontecer: a janela "Como funciona: …" explica a tela em poucas frases; Esc (ou Entendi) fecha.

**UI-15 · Tema escuro e 1366 × 768**
- Fazer: Configurações → Tema: escuro; passe por todas as telas acima numa tela de 1366 × 768.
- Deve acontecer: tudo legível e nada cortado ou por cima de outra coisa; os cartazes de missão continuam papel claro.

**UI-16 · Aviso de conquista**
- Fazer: conclua uma conquista (por exemplo, a primeira partida).
- Deve acontecer: o aviso aparece no canto de cima, à direita, com ★, sem tapar as abas, e some sozinho depois de alguns segundos (ou no OK).

---

## AR. Arte (o jogo pronto para receber as imagens)

As imagens vão em `programacao/src/assets/arte/` com o nome da [Lista de Arte e Som](../documentacao/Lista_de_Arte_e_Som.md). Depois de pôr ou tirar uma imagem, recarregue a página do `npm run dev` (F5). Para estes testes serve qualquer PNG (até um print renomeado).

**AR-01 · Sem arte, nada muda**
- Fazer: sem nenhuma imagem na pasta, jogue uma partida na Floresta e passe pelo Reino, pela Mochila e pelas Árvores.
- Deve acontecer: tudo igual a antes (quadrados coloridos, telas cinza, losangos no chão).

**AR-02 · Fundo de uma tela**
- Fazer: salve um PNG como `fundo-reino.png` na pasta e abra o Reino; depois apague o arquivo.
- Deve acontecer: o Reino mostra a imagem de fundo, com os botões por cima e o título com sombra; sem o arquivo, volta o cinza.

**AR-03 · Conferir o que chegou**
- Fazer: com uma ou duas imagens na pasta (uma com o nome errado, como `guerrero-andando-baixo.png`), rode `npm run conferir:arte` na pasta `programacao`.
- Deve acontecer: aparece cada arquivo achado e para que serve; o de nome errado aparece com "o jogo não conhece este nome"; no fim, quanto da lista já chegou e o que falta.

**AR-04 · Um boneco animado**
- Fazer: salve uma faixa (por exemplo, 192 × 48 = 4 quadros) como `arqueiro-andando-baixo.png` e outra como `arqueiro-andando-direita.png`. Jogue de Arqueiro e ande para baixo, para a direita e para a esquerda.
- Deve acontecer: o quadrado do Arqueiro vira a imagem, mudando de quadro enquanto anda; para a esquerda, a da direita aparece espelhada; o Líder tem um anel branco no chão. Os outros continuam quadrados.

**AR-05 · Ícone de um item**
- Fazer: salve um PNG quadrado como `item-pocaoDeVida.png` e abra a Mochila, o Mercado e a Preparação; na partida, abra a mochila com Tab.
- Deve acontecer: a Poção de vida aparece com o ícone em todas essas listas e no detalhe; os outros itens continuam só com o nome.

---

## RE. Reino com dados (Fase 4)

Para ter itens, ouro e pontos sem jogar horas: no `npm run dev`, painel `</> DEV` → **Itens de teste, +1000 de ouro e pontos livres** (no site publicado esse botão não existe: lá, jogue e compre).

**RE-01 · Comprar sem ouro (TEST-006, caso 1)**
- Fazer: com pouco ouro, Mercado → Comprar → Pergaminho de redefinição → Comprar 1.
- Deve acontecer: nada é comprado e aparece "Ouro insuficiente: custa 300 e você tem X."

**RE-02 · Vender e recomprar (TEST-006, caso 2)**
- Fazer: Mercado → Vender → Poção de vida → Vender 1; depois Comprar → Poção de vida → Comprar 1.
- Deve acontecer: vender soma 12 de ouro (metade do preço); recomprar desconta 25; a quantidade volta.

**RE-03 · Missão de entrega depois de vender os itens (TEST-006, caso 3)**
- Fazer: Guilda → Missões → Peles para o curtidor → Aceitar (com 4 peles ou mais). Venda as peles no Mercado. Volte e clique em Entregar.
- Deve acontecer: com as peles, a linha mostra 4/4; vendidas, volta a 0/4 e Entregar explica que ainda falta.

**RE-04 · Abandonar com ouro abaixo da multa (TEST-006, caso 4)**
- Fazer: aceite O Guardião da Floresta (multa 40), gaste o ouro até ficar com menos de 40 e clique em Abandonar….
- Deve acontecer: o aviso mostra a multa e diz que o ouro vai ficar em zero; confirmado, o ouro fica 0 e a missão sai.

**RE-05 · Arma de outra classe (TEST-006, caso 5)**
- Fazer: Forja → Equipar → Arma → tente equipar uma Espada curta no Arqueiro (ou um Cajado no Guerreiro).
- Deve acontecer: "Espada curta é só para Guerreiro." e nada muda. A arma da própria classe equipa, e a antiga volta para a Mochila.

**RE-06 · Permanente com o temporário da mesma classe ativo (TEST-006, caso 6)**
- Fazer: Guilda → Contrato temporário de uma classe; depois Contrato permanente da mesma classe.
- Deve acontecer: o permanente avisa que encerra o temporário; contratado, o temporário some.

**RE-07 · Recarregar e conferir (TEST-006, caso 7)**
- Fazer: depois de comprar, equipar, distribuir pontos e aceitar uma missão, recarregue a página (F5) e entre de novo.
- Deve acontecer: ouro, Mochila, equipamento, atributos, habilidades, missão e conquistas continuam iguais.

**RE-08 · Mochila do Reino**
- Fazer: Mochila → escolha um item → Descartar 1 → Sim, descartar.
- Deve acontecer: cada item mostra função, descrição, peso e raridade; descartar pede confirmação e tira só 1.

**RE-09 · Forja: comprar e fabricar**
- Fazer: Forja → Comprar (um item); Fabricar → uma receita sem os materiais; depois uma com os materiais.
- Deve acontecer: sem materiais, "Falta(m) ..." e nada gasto; com eles, materiais e ouro saem e o equipamento aparece na Mochila. Em Equipar, os atributos mostram o bônus ("Agi 23 (+1)") e a defesa.

**RE-10 · Árvores: atributos e pergaminho**
- Fazer: Árvores → um personagem com pontos → + em Força duas vezes → Aplicar. Depois Usar pergaminho → Sim, usar.
- Deve acontecer: o pentágono cresce antes de aplicar; aplicado, fica fixo. O pergaminho devolve os pontos, os atributos voltam aos iniciais e ele some; as habilidades não mudam.

**RE-11 · Árvores: habilidades**
- Fazer: Árvores → Habilidades. Evolua a raiz até o nível 5; aprenda a primeira de um ramo; ponha-a numa tecla.
- Deve acontecer: a do ramo fica bloqueada até a raiz chegar ao 5; as "fora do beta" aparecem tracejadas; na partida, a tecla 2 usa a habilidade nova.

**RE-12 · Mochila da partida (Tab, E e R)**
- Fazer: Preparação → + em Poção de vida duas vezes → Começar partida. Leve um golpe, aperte Tab, depois E. Com o grupo cheio, mire perto de um aliado ferido e aperte R. Esc fecha.
- Deve acontecer: a janela abre do lado direito sem pausar; E cura o Líder, R o aliado mais perto da mira; poção não levanta desmaiado. No fim, sai da Mochila do Reino só o que foi usado.

**RE-13 · Missão de matar**
- Fazer: aceite Caçar lobos e derrote lobos na Floresta.
- Deve acontecer: o HUD avisa "Missão: 1/8 lobo" a cada um; no Reino, a linha da missão mostra o progresso; cumprida, Entregar dá o ouro e o XP.

**RE-14 · Conquistas**
- Fazer: jogue a primeira partida e abra Salão da Glória → Conquistas.
- Deve acontecer: aparece "Conquista: Primeiros passos (+20 de ouro)"; a aba mostra a lista com o progresso de cada uma e as concluídas marcadas.

**RE-15 · Som**
- Fazer: clique em qualquer botão, ataque na partida, aperte M, desligue Som e depois Música nas Configurações.
- Deve acontecer: bipes curtos provisórios nos cliques, ataques, acertos e outros acontecimentos (até os arquivos chegarem); M silencia tudo; Som desligado tira os efeitos. A música só toca quando os arquivos estiverem em `programacao/src/assets/audio/`.

**RE-16 · Minijogos**
- Fazer: Jogar → Fazenda (depois Mina e Lago) → Começar; jogue os 30 s.
- Deve acontecer: Fazenda: clicar nas douradas; Mina: 3 cliques por pedra; Lago: clicar quando a boia afunda (antes, o peixe foge). No fim, os recursos vão para a Mochila e o XP é dividido; não aparece no histórico nem gasta contrato. Voltar ao Mapa no meio não dá nada.

## FL. Floresta (Fase 3)

Antes: **Iniciar jogo → Jogar como convidado** (ou entre na sua conta) → **Jogar → Floresta**. Na primeira vez não aparece a tela Ponto de partida: vai direto para a Preparação. No `npm run dev`, a barra de teste (faixa de baixo) tem **Invencível**, **Encher grupo**, **Encher mochila**, **Drop especial do Boss** e **Pior cenário (FPS)**. A Floresta é provisória: o layout, os mobs e o Boss do grupo (TASK-012 e TASK-013) substituem estes.

**FL-01 · Andar até a borda**
- Fazer: ande para a esquerda até o fim (você nasce perto da borda esquerda) e, na zona segura, tente subir e descer até a mata escura.
- Deve acontecer: a câmera para no limite do mapa e o Líder não passa; a mata fechada (verde-escuro, com copas na beira) é parede, em cima e embaixo.

**FL-02 · Câmera e mira**
- Fazer: deixe o mouse parado num ponto da tela e ande com WASD; clique para atacar enquanto anda.
- Deve acontecer: a câmera segue o Líder (ele fica perto do meio da tela); o mundo aparece só entre o HUD e a faixa de baixo; a flecha (ou o ataque) sai na direção do mouse mesmo com a câmera andando.

**FL-03 · Descobrir regiões e ver o minimapa**
- Fazer: ande para a direita, passando pela Fácil e pela Média. Olhe o quadro do minimapa no HUD (em cima, à direita).
- Deve acontecer:
  - o minimapa começa quase todo escuro e acende por onde você passa, com a cor da dificuldade: verde-claro (zona segura), verde (Fácil), amarelo (Média), laranja (Difícil) e vermelho (domínio do Boss);
  - o ponto branco é o Líder, os azuis claros são os aliados e o retângulo é a parte que aparece na tela;
  - embaixo do minimapa, numa linha cada: o nome da região (por exemplo, "Zona segura"; com o mouse em cima, "Região: Zona segura") e "Mochila X/Y", sem nada passar para baixo da faixa do HUD, nem em 1366×768;
  - ao mudar de região, aparece "Região: Fácil" (etc.); na primeira vez em cada área, "Área descoberta: Clareira das Flores (+30 XP)".

**FL-04 · Nascer numa região descoberta e conferir a taxa**
- Fazer: termine uma partida em que você chegou à Média (volte com Q). Depois, **Jogar → Floresta**.
- Deve acontecer:
  - o Resumo mostra "Exploração: N áreas novas (+X XP)";
  - aparece a tela **Ponto de partida**, com Início, Fácil e Média liberados e Difícil e Muito difícil "(não descoberta)";
  - escolhendo **Média**, o grupo nasce no começo da Média, sem mob perto, e o custo da fuga no HUD ("Fuga (F): X%") já começa maior que no início do bioma;
  - o minimapa já começa com o que foi descoberto antes.

**FL-05 · Fugir de um mob até ele desistir**
- Fazer: chegue perto de um lobo (quadrado vermelho) até aparecer o "!" em cima dele; depois corra para longe, de volta para a esquerda.
- Deve acontecer: ele persegue; quando você sai do território dele, aparece o "?" e ele volta para casa; uns 5 s depois o HUD troca "Em combate" por "Fora de combate".

**FL-06 · Passar por um mob não hostil**
- Fazer: ache um cervo (quadrado bege) e passe ao lado dele, bem perto. Depois ataque-o uma vez.
- Deve acontecer: passando ao lado, ele não ataca; atacado, ele revida (persegue quem bateu).

**FL-07 · Coleta com E**
- Fazer: chegue perto de um losango colorido no chão (cogumelo vermelho, erva verde, madeira marrom) e aperte **E**. Derrote um lobo e pegue o que ele deixar.
- Deve acontecer: perto do item aparece "E: pegar Cogumelo"; com E ele some do chão, aparece "+1 Cogumelo" e o "Mochila X/Y" sobe. No fim da partida, o Resumo lista os itens coletados e eles vão para a Mochila do Reino.

**FL-08 · Mochila cheia com item no chão**
- Fazer: na barra de teste, **Encher mochila**; chegue perto de um item e aperte **E**.
- Deve acontecer: aparece "Mochila cheia: não cabe ..." em vermelho; com E, o item continua no chão com o aviso "ficou no chão (some em 30 s)"; nos últimos segundos ele pisca e depois some.

**FL-09 · Enfrentar o Boss**
- Fazer: vá até o domínio do Boss (o fundo, à direita; ou escolha **Muito difícil** no Ponto de partida). Deixe o Guardião da Floresta (quadrado grande marrom com uma faixa verde) atacar; tente sair das marcas vermelhas no chão. Para ver o drop especial: **Drop especial do Boss: 100%** antes de derrotá-lo (ligue o **Invencível** se precisar).
- Deve acontecer:
  - ao entrar no domínio: a mensagem "Domínio do Boss: aqui a fuga e os perdidos custam mais", a região em vermelho no HUD e a barra grande do Boss embaixo do HUD;
  - antes de cada golpe, uma marca vermelha no chão (círculo em volta dele, faixa reta até você ou linhas em leque); quem sai da marca a tempo não leva dano;
  - derrotado: "+500 pontos", a casca antiga no chão e, com 100%, a Coroa de raízes; o Resumo mostra "Boss: derrotado (+500 pontos)".

**FL-10 · O grupo atravessa a Floresta sem ninguém ficar preso**
- Fazer: com o grupo cheio (**Encher grupo**), atravesse a Floresta inteira, passando entre árvores e pedras e pelos degraus entre as regiões.
- Deve acontecer: ninguém fica preso atrás de pedra nem fora da tela. Se um aliado ficar muito para trás, ele reaparece logo fora da tela e chega correndo (você não deve ver ele sumir nem "pular").

**FL-11 · 60 FPS no pior cenário (TEST-005)**
- Fazer: no `npm run dev`, na Floresta, **Pior cenário (FPS)** e jogue 2 minutos (ligue o **Invencível** para não cair).
- Deve acontecer: o grupo de 5 fica no meio da Difícil, cercado por todos os mobs dela; o número de FPS na barra de teste fica perto de 60 no seu computador.

**FL-12 · A arena de teste só no desenvolvimento**
- Fazer: no `npm run dev`, abra o Mapa; depois, no endereço principal (`https://jogo-rpg-six.vercel.app`), abra o Mapa.
- Deve acontecer: no `npm run dev` existe o botão **Arena de teste** (a arena da Fase 1, para testar o combate); na Vercel, ele não existe.

## CT. Contas e Salão da Glória (Fase 2)

Antes: o SQL rodado e as URLs configuradas no Supabase (`documentacao/Supabase_passo_a_passo.md`, parte 2). Use um e-mail de verdade que você abra (no Gmail, `seunome+algo@gmail.com` chega na sua caixa e conta como outro e-mail). Para ser "outro navegador", use outro programa (Edge e Chrome) ou uma janela anônima (Ctrl+Shift+N): cada um guarda as coisas separado.

**CT-01 · Criar conta e confirmar o e-mail**
- Fazer:
  1. Tela inicial → **Iniciar jogo** → **Criar conta**.
  2. Preencha e-mail, senha (8 ou mais) e um apelido, e clique em **Criar conta**.
  3. Abra o e-mail (veja o spam) e clique no link.
- Deve acontecer:
  - a tela **Confirme seu e-mail** mostra o e-mail usado e tem **Reenviar e-mail**;
  - o link abre o jogo numa aba nova, no Login, com "E-mail confirmado! Agora é só entrar na conta." em verde e o botão **Continuar como seu@email**;
  - **Continuar** (ou e-mail e senha + **Entrar**) leva à narrativa e à escolha da classe; depois, o Reino mostra o seu apelido no HUD.

**CT-02 · Cadastro com problema**
- Fazer: tente criar conta com (a) um apelido que já existe, em maiúsculas diferentes; (b) senha de 5 letras; (c) e-mail sem @; (d) um e-mail que já tem conta.
- Deve acontecer: nada é criado, a mensagem em vermelho diz o que corrigir e o campo com problema fica marcado. Em (d): "Já existe uma conta com este e-mail".

**CT-03 · E-mail não confirmado**
- Fazer: crie uma conta e, sem abrir o link, tente **Entrar** com ela.
- Deve acontecer: "Este e-mail ainda não foi confirmado..." e aparece o botão **Reenviar e-mail de confirmação**, que manda outro e-mail.

**CT-04 · Senha errada**
- Fazer: **Entrar** com a senha errada.
- Deve acontecer: "E-mail ou senha errados..." e nada mais muda.

**CT-05 · Continuar como ...**
- Fazer: entre na conta, aperte **F5** (recarregar) e vá ao Login.
- Deve acontecer: o jogo volta à Tela inicial; no Login aparece **Continuar como seu@email**, que entra sem digitar a senha, com o progresso de antes.

**CT-06 · Esqueci minha senha**
- Fazer:
  1. Login → **Esqueci minha senha** → o e-mail da conta → **Enviar link**.
  2. Abra o e-mail e clique no link.
  3. Escreva a senha nova duas vezes e clique em **Salvar senha nova**.
  4. Entre com a senha nova; depois tente a antiga.
- Deve acontecer: o link abre a tela **Senha nova**; depois de salvar, o jogo volta ao Login com "Senha trocada!"; a nova funciona e a antiga não. Escrever duas senhas diferentes avisa sem trocar nada.

**CT-07 · Dois navegadores na mesma conta**
- Fazer:
  1. Entre na conta no navegador 1.
  2. No navegador 2, tente entrar na mesma conta.
  3. No navegador 1, Configurações → **Sair da conta**; tente de novo no 2.
  4. Repita, mas no passo 3 feche a aba do navegador 1 (sem sair).
- Deve acontecer:
  - no passo 2: "Conta em uso: ela está aberta em outro lugar...";
  - no passo 3: o navegador 1 volta à Tela inicial e o 2 entra na hora;
  - no passo 4: fechar a aba também libera a conta (no máximo uns segundos). Se o navegador fechar de um jeito brusco (travou, acabou a bateria), a conta libera sozinha em cerca de 3 minutos.

**CT-08 · Duas abas do mesmo navegador**
- Fazer: com a conta aberta numa aba, abra o jogo em outra aba do mesmo navegador e tente entrar (ou **Continuar como ...**).
- Deve acontecer: "O jogo já está aberto com uma conta em outra aba deste navegador...". A primeira aba continua normal.

**CT-09 · Convidado virando conta**
- Fazer:
  1. Jogue como convidado, escolha uma classe e ganhe algum ouro numa partida.
  2. Configurações → **Criar conta** (a tela avisa que o progresso vai junto) e confirme o e-mail.
  3. Entre na conta neste mesmo navegador.
- Deve acontecer: o Reino mostra a mesma classe e o mesmo ouro do convidado, com o aviso "O progresso do convidado deste navegador agora é da sua conta..."; em **Jogar como convidado** de novo, o convidado começa do zero.

**CT-10 · Conta antiga não mistura o convidado**
- Fazer: jogue como convidado com outra classe e depois entre numa conta que já tinha progresso.
- Deve acontecer: a conta continua com o progresso dela; o do convidado não entra.

**CT-11 · O progresso segue a conta**
- Fazer: entre na conta no navegador 1, jogue uma partida e saia. Entre no navegador 2 (ou em outro computador).
- Deve acontecer: o navegador 2 tem o mesmo ouro, os mesmos personagens e o mesmo XP.

**CT-12 · Sem internet**
- Fazer:
  1. Entre na conta.
  2. Desligue o Wi-Fi (ou tire o cabo).
  3. Jogue uma partida até o Resumo e volte ao Reino.
  4. Abra Configurações.
  5. Ligue a internet de novo e espere uns segundos.
  6. Saia e entre de novo; olhe **Minhas partidas**.
- Deve acontecer:
  - nada trava: a partida começa, termina e mostra o Resumo;
  - Configurações: "Sem conexão com a nuvem agora: seu progresso está guardado neste navegador...";
  - depois da volta, o progresso e a partida sobem sozinhos: em **Minhas partidas** aparece a partida jogada sem internet.

**CT-13 · Ranking sem login**
- Fazer: Tela inicial → **Salão da Glória**, sem entrar em nada. Clique em cada aba; em **Por classe**, troque a classe.
- Deve acontecer: as 6 abas carregam (a tabela, ou "Ninguém no ranking ainda"); só aparecem contas; não há **Minhas partidas** nem Conquistas; o aviso "Só jogadores com conta aparecem no ranking".

**CT-14 · Ranking e histórico com conta**
- Fazer: com conta, jogue uma partida até o Resumo e abra o **Salão da Glória**.
- Deve acontecer: em **Melhores pontuações**, a sua linha fica em destaque (fundo escuro); em **Minhas partidas**, a partida aparece com data, bioma, resultado, tempo ativo, pontuação e ouro.

**CT-15 · Histórico com mais de 20 partidas**
- Fazer: com conta, termine mais de 20 partidas (no `npm run dev`, os botões de resultado da barra de teste deixam rápido) e abra **Minhas partidas**.
- Deve acontecer: 20 por página, as mais novas primeiro; **Próxima** e **Anterior** trocam de página, e "Página 1 de 2" muda.

**CT-16 · Vercel em outra máquina**
- Fazer: no endereço da Vercel (`documentacao/Vercel_passo_a_passo.md`), noutro computador: crie uma conta, confirme o e-mail e jogue uma partida.
- Deve acontecer: o link do e-mail volta para o endereço da Vercel (não para o localhost); tudo do CT-01 ao CT-14 funciona igual.

**CT-17 · Jogo publicado sem as ferramentas de teste**
- Fazer: no endereço da Vercel, entre numa partida.
- Deve acontecer: não há painel **</> DEV**; a faixa de baixo da partida mostra só as teclas (sem o selo TESTE e sem botões).

## T. Seleção de classe, Reino e Árvores (parte 7b, TASK-071)

**T-01 · Seleção de classe**
- Fazer: com um convidado novo (painel DEV → **Apagar progresso do convidado**), chegue à Seleção de classe e clique em cada classe.
- Deve acontecer: a classe clicada fica marcada e aparecem o pentágono na cor dela, o papel e a descrição. O pentágono muda de forma de uma classe para outra (do Tanque para o Arqueiro, por exemplo). Clicar ainda não escolhe: só **Escolher Classe** confirma e leva ao Reino.

**T-02 · HUD do Reino**
- Fazer: olhe a faixa de cima do Reino antes e depois de uma partida em que ganhou ouro.
- Deve acontecer: "Convidado · Líder: Classe · Ouro: N · Missão: nenhuma", com o ouro do save. Missões chegam na Fase 4.

**T-03 · Árvores de Habilidades**
- Fazer: Reino → **Árvores de Habilidades** e clique em cada aba disponível.
- Deve acontecer: só as classes que você tem como permanente ficam ativas. Cada uma mostra o pentágono dos atributos, o nível, o XP até o próximo nível e os pontos livres.

## G. Guilda: contratos (parte 7a, TASK-079)

**G-01 · Contrato temporário**
- Fazer:
  1. Tenha pelo menos 200 de ouro (jogue uma partida com **+300 de ouro** e volte com Q).
  2. Reino → **Guilda** → **Contrato temporário** → **Contratar** numa classe.
- Deve acontecer:
  - aparece "Classe contratado (temporário).";
  - o ouro cai 200;
  - a classe sai da lista e aparece em "Contratos ativos" com "3 partidas restantes".

**G-02 · O temporário vai junto, mas não é Líder**
- Fazer: Jogar → Floresta → Início do bioma.
- Deve acontecer: a Preparação mostra "Também vão: Classe (temporário, 3 partidas)", e essa classe não aparece entre os botões de Líder. Na partida, ela está no grupo.

**G-03 · Uma partida a menos**
- Fazer: termine uma partida (qualquer resultado) e volte à Guilda.
- Deve acontecer: o contrato mostra "2 partidas restantes". Na última partida, o contrato some.

**G-04 · Contrato permanente**
- Fazer: com 1000 de ouro, **Contrato permanente** → **Contratar** numa classe.
- Deve acontecer: o personagem entra no nível 1, aparece como opção de Líder na Preparação e ganha XP. Se havia temporário da mesma classe, a linha avisa "(encerra o contrato temporário)", e o temporário some.

**G-05 · Sem ouro**
- Fazer: tente contratar sem ouro suficiente.
- Deve acontecer: aparece "Ouro insuficiente para este contrato." em vermelho, e nada muda.

## P. Pausa e "em combate" (parte 5c)

**P-01 · Pausar fora de combate**
- Fazer: longe dos mobs, aperte Esc.
- Deve acontecer: abre a Pausa (Continuar, Configurações, Como jogar, Voltar ao Reino (15 s)) e o jogo congela. Esc de novo fecha.

**P-02 · Tentar pausar em combate**
- Fazer: **Criar mob vermelho** e ande até ele até aparecer "!". Olhe o HUD e aperte Esc.
- Deve acontecer: o HUD mostra "Em combate" (vermelho). A pausa não abre, aparece "Você não pode pausar agora", e o jogo continua.

**P-03 · Configurações em combate**
- Fazer: em combate, clique em **Configurações** e depois aperte Esc.
- Deve acontecer: as Configurações abrem sem pausar, e o Esc as fecha (sem abrir a pausa).

**P-04 · Sair de combate**
- Fazer: derrote o mob (ou fuja até ele desistir) e espere 5 s sem ninguém levar ou causar dano.
- Deve acontecer: o HUD volta para "Fora de combate", e o Esc volta a pausar.

**P-05 · A pausa congela o relógio**
- Fazer:
  1. **Aliados ajudam: sim** → vira "não".
  2. **Encher grupo**, **Derrubar aliado** e anote a contagem dele.
  3. Fora de combate, pause, espere 10 s e volte.
- Deve acontecer: a contagem continua de onde parou; ela não andou durante a pausa. O tempo da partida (HUD) também não andou.

## Q. Retorno com Q (parte 5c)

**Q-01 · Q e Q de novo**
- Fazer: fora de combate, aperte Q; espere uns segundos e aperte Q de novo.
- Deve acontecer: abaixo do HUD aparece "Voltando ao Reino em 15 s · Q cancela", contando. No segundo Q, "Retorno ao Reino cancelado".

**Q-02 · Q em combate**
- Fazer: com um mob perseguindo, aperte Q.
- Deve acontecer: aparece "Em combate: não dá para voltar ao Reino agora", e nada começa.

**Q-03 · O combate interrompe o Q**
- Fazer:
  1. Fique a uns dois passos de onde um mob detecta você e aperte Q.
  2. Perto do fim da contagem, ande até o mob até aparecer "!".
- Deve acontecer: a faixa fica vermelha, "Em combate: o retorno espera (15 s)", com a mensagem "o retorno voltou a 15 s". Depois de sair de combate, a contagem volta a correr a partir de 15.

**Q-04 · Voltar ao Reino pela pausa**
- Fazer: fora de combate, Esc → **Voltar ao Reino (15 s)** e espere.
- Deve acontecer: a pausa fecha, a mesma contagem de 15 s corre com o jogo rodando e, no fim, aparece o Resumo.

## F. Fuga com F (parte 5c)

**F-01 · O custo muda com a distância**
- Fazer: olhe "Fuga (F)" no HUD e ande para a direita da arena.
- Deve acontecer: começa em 7% perto do início e sobe até 30% no canto mais longe. O ouro ao lado é quanto a fuga tiraria do ouro ganho.

**F-02 · Aviso e Esc**
- Fazer: aperte F e depois Esc.
- Deve acontecer: abre um aviso pequeno, sem escurecer a tela e sem pausar, com "Custo agora: X% do ouro ganho (Y de ouro)", o mesmo do HUD. O Esc fecha e nada acontece.

**F-03 · Fugir (F e F)**
- Fazer: aperte F e F de novo (ou clique em **Fugir (F)**).
- Deve acontecer: aparece "Fugindo com a Pedra de Retorno em 5 s", contando. Q não faz nada nesse tempo. No fim, o Resumo mostra **Retorno forçado** (em amarelo) com o motivo "Fuga com a Pedra de Retorno" e a taxa do aviso (se o Líder não se mexeu).

**F-04 · Fugir em combate**
- Fazer: com mobs batendo no grupo, F e F.
- Deve acontecer: a fuga corre normalmente, mesmo em combate.

**F-05 · O Líder cai durante a fuga**
- Fazer: **Encher grupo**, F e F, e logo **Derrubar Líder**.
- Deve acontecer: a fuga continua e termina em Retorno forçado por fuga.

**F-06 · Todos caem durante a fuga**
- Fazer: **Encher grupo**, F e F, quatro vezes **Derrubar aliado** e **Derrubar Líder**, tudo em menos de 5 s.
- Deve acontecer: Cutscene de derrota e Resumo com **Derrota**.

## R. Os 4 resultados e o Resumo (parte 5c)

**R-01 · Grande Vitória**
- Fazer:
  1. Ligue o **Invencível**.
  2. Clique 4 vezes em **+300 de ouro** e derrote um mob.
  3. Espere sair de combate, aperte Q e espere os 15 s.
- Deve acontecer:
  - Resumo com **Grande Vitória**;
  - taxa 0% e ouro recebido com +10%;
  - a pontuação final é a base mais 10%, e a base passa de 1000.

**R-02 · Vitória com um perdido**
- Fazer:
  1. **Encher grupo** e **Aliados ajudam: sim** → "não".
  2. **Derrubar aliado** e espere 30 s (ele vira perdido).
  3. **+300 de ouro**, Q e 15 s.
- Deve acontecer: **Vitória**; uma taxa entre 1% e 6% (maior quanto mais longe do início ele caiu); "Perdidos" com a classe dele.

**R-03 · Retorno forçado pelo Líder não levantado**
- Fazer:
  1. **Encher grupo**, **Aliados ajudam: sim** → "não" e **+300 de ouro**.
  2. **Derrubar Líder** e espere 30 s.
- Deve acontecer: **Retorno forçado** com o motivo "Líder não levantado em 30 s". O Líder aparece em "Perdidos" e paga a taxa pela distância de onde caiu, somada à dos outros perdidos.

**R-04 · Derrota só com o Líder**
- Fazer: numa partida sem encher o grupo (com um personagem só no save), **Derrubar Líder**.
- Deve acontecer: Cutscene de derrota e Resumo com **Derrota**; a taxa é de pelo menos 10% (todos desmaiam, pela posição do Líder).

**R-05 · Derrota com o grupo inteiro**
- Fazer: **Encher grupo**, quatro vezes **Derrubar aliado** e **Derrubar Líder**.
- Deve acontecer: **Derrota**. A taxa é única, pela posição do Líder; os caídos não somam.

**R-06 · O Resumo completo e "Jogar novamente"**
- Fazer: em qualquer Resumo, confira as linhas e clique em **Jogar novamente**.
- Deve acontecer:
  - o Resumo mostra motivo, bioma, ouro ganho, taxa (% e moedas), ouro recebido, pontuação (final e base), monstros, itens, tempo total, tempo ativo, perdidos e o XP de cada personagem;
  - "Jogar novamente" volta ao Mapa sem recarregar a página.

**R-07 · O save recebeu**
- Fazer: anote o ouro do Reino (HUD do Reino) antes de uma partida e veja de novo depois do Resumo.
- Deve acontecer: o ouro subiu exatamente o "Ouro recebido" do Resumo.

**R-08 · Botões de resultado da barra**
- Fazer: numa partida com algum ouro ganho, clique num dos 4 botões (Grande Vitória, Vitória, Retorno forçado, Derrota).
- Deve acontecer: a partida acaba com aquele resultado, os números reais dela e "(botão de teste)" no motivo.

## X. XP, nível e IA mudando (parte 5c)

**X-01 · Monstro dá XP e ouro**
- Fazer: derrote um mob vermelho.
- Deve acontecer: aparece "+12 ouro" amarelo em cima dele; o HUD soma o ouro, e os pontos sobem. No Resumo, o XP aparece para os personagens do save. Quem entrou pelo "Encher grupo" não recebe.

**X-02 · Subir de nível com mobs**
- Fazer: com um personagem só, derrote 5 mobs vermelhos (20 XP cada; o nível 2 pede 100).
- Deve acontecer: aparece "Classe subiu para o nível 2! (vale na próxima partida)" e "NÍVEL 2!" em cima dele. No Resumo, "+100 · subiu para o nível 2!".

**X-03 · A IA muda na partida seguinte (29 → 30)**
- Fazer:
  1. Fora da partida, painel DEV → **Personagens do save** → **Contratar todas as classes**.
  2. No Guerreiro, deixe o nível em 29: **+10**, **+10** e oito vezes **+1**. Depois clique em **Quase subir**.
  3. Comece uma partida e veja a IA do Guerreiro no HUD.
  4. Derrote um mob.
  5. Termine com Q e clique em **Jogar novamente**.
- Deve acontecer:
  - no começo, o HUD mostra "IA básica" no Guerreiro;
  - depois do mob, aparece "Guerreiro subiu para o nível 30!", mas ele continua na básica nesta partida;
  - na partida seguinte, o HUD mostra "IA média".

**X-04 · De 69 para 70 com o botão "Subir nível"**
- Fazer:
  1. Fora da partida, deixe o Guerreiro em 69.
  2. Na partida, clique em **Subir nível**.
  3. Termine e comece outra partida.
- Deve acontecer: aparece "Guerreiro subiu para o nível 70!", e na partida seguinte ele está na "IA avançada".

**X-05 · O painel DEV não mexe no save durante a partida**
- Fazer: durante a partida, abra "Personagens do save".
- Deve acontecer: os botões ficam apagados, com "Só fora da partida".

## K. Momento de foco (parte 5c)

**K-01 · Testar foco**
- Fazer: clique em **Testar foco**.
- Deve acontecer:
  - o seletor vira "IA: avançada", o grupo enche, o Invencível liga, o Líder fica com 25% da vida e aparecem 3 mobs;
  - o HUD mostra "Foco!" e a barra mostra "Foco: X erros em Y decisões", quase sempre com 0 ou 1 erro.

  A vida do Líder fica presa em 25% por 20 s, e o foco acaba uns 8 s depois disso.

**K-02 · Foco com alguém caído**
- Fazer: com "IA: avançada", **Derrubar aliado**.
- Deve acontecer: "Foco!" enquanto ele estiver caído e por mais 8 s.

**K-03 · Sem foco na IA básica**
- Fazer: com "IA: básica", **Derrubar aliado**.
- Deve acontecer: não aparece "Foco!" (o foco é só da avançada).

## M. Tecla M e Configurações (parte 5c)

**M-01 · Mudo na partida**
- Fazer: aperte M (também em combate) e abra as Configurações.
- Deve acontecer: o HUD troca "Som (M)" por "Mudo (M)", e as Configurações mostram "Mudo (tecla M): sim". M de novo desliga.

**M-02 · O mudo fica salvo**
- Fazer: ligue o mudo e recarregue a página (F5).
- Deve acontecer: continua mudo. A Música e o Som continuam como estavam.

**M-03 · M digitando**
- Fazer: na tela de Login, digite um e-mail com "m".
- Deve acontecer: o "m" aparece no campo, e o mudo não muda.

## C2. Crítico (parte 5c)

**CR-01 · Crítico**
- Fazer: com o Arqueiro como Líder (16% de chance), ataque o boneco várias vezes.
- Deve acontecer: de vez em quando, aparece "CRÍTICO 27" amarelo e maior (dano 1,5×), e abaixo do HUD aparece "Crítico! 27 de dano". Os críticos dos aliados mostram só o número amarelo.

## S. Salvamento no meio da partida (RF12)

**S-01 · Recarregar no meio não dá ganho**
- Fazer:
  1. Anote o ouro do Reino.
  2. Comece uma partida, clique em **+300 de ouro** e derrote um mob.
  3. Aperte F5 e entre de novo como convidado.
- Deve acontecer: o aviso de que a última partida foi descartada. O ouro, o XP e as partidas jogadas estão iguais a antes dela.

## H. HUD em telas diferentes (parte 5c)

**H-01 · 1366×768**
- Fazer: numa tela (ou janela) de 1366×768, com o grupo cheio, um perdido e o Líder caído.
- Deve acontecer: nada do HUD passa da faixa de cima, nem fica embaixo do botão Configurações. O quadro "Minimapa / Região: —" fica reservado (vazio até a etapa 6).

**H-02 · Janela menor**
- Fazer: diminua a janela do navegador.
- Deve acontecer: o jogo encolhe junto (16:9), o HUD continua cabendo, e a mira continua certa.
