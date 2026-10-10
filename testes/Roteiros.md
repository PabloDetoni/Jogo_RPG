# Roteiros de teste à mão

Situações para testar o jogo, passo a passo. Cada uma tem um código para anotar o resultado no [Registro.md](Registro.md).
Atualizado em 09/10/2026, na Fase 3 (Floresta). A cada parte nova, o Claude acrescenta as situações dela aqui.

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
