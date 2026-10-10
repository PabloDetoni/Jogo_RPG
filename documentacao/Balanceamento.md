# Balanceamento: valores e limites

> Este arquivo é **gerado pelo código**: não edite à mão. Para mudar um valor, edite `programacao/src/dados/balanceamento.js` (ou `classes.js` e `taxas.js`) e rode `npm run balanceamento` dentro de `programacao`. Depois rode `npm test`: os testes de limite avisam se algum número ficou absurdo.
>
> **Provisório** = valor de balanceamento ainda a decidir (Conceito §19). **Documentação** = vem do Conceito e dos requisitos.

## Resumo dos limites

| O quê | Valor | Origem |
| --- | --- | --- |
| Nível máximo | 100 | Documentação (RF55) |
| XP para subir do nível 1 ao 2 | 100 | Provisório |
| XP para subir do nível 99 ao 100 | 9.900 | Provisório |
| XP total do nível 1 ao 100 | 495.000 | Provisório |
| Maior valor de um atributo | 100 | Provisório |
| Pontos de atributo ganhos até o nível 100 | 297 | Provisório |
| Atributos de um personagem no nível 100 | 50 iniciais + 297 ganhos, de 500 possíveis | Provisório |
| Maior taxa possível | 55% | Documentação (§12.2) |
| Mochila do grupo com as 5 classes no nível 1 | 96 | Provisório |
| Maior mochila possível (5 personagens com Força no máximo) | 1.000 | Provisório |
| Pontuação base para a Grande Vitória | acima de 1.000 | Provisório |
| Bônus da Grande Vitória | +10% no ouro e na pontuação | Documentação (RF47) |
| Contrato temporário / permanente | 200 / 1.000 de ouro | Provisório |

## XP e níveis

XP para passar do nível n para o n + 1 = **100 × n ^ 1** (provisório). A cada nível o personagem ganha **3 pontos de atributo** e **1 de habilidade**. O XP guardado é o que ele juntou dentro do nível atual; no nível 100, o XP a mais é descartado. XP nunca é taxado (RF50).

| Nível | XP para subir ao próximo | XP total para chegar a este nível |
| --- | --- | --- |
| 1 | 100 | 0 |
| 2 | 200 | 100 |
| 3 | 300 | 300 |
| 4 | 400 | 600 |
| 5 | 500 | 1.000 |
| 10 | 1.000 | 4.500 |
| 20 | 2.000 | 19.000 |
| 30 | 3.000 | 43.500 |
| 40 | 4.000 | 78.000 |
| 50 | 5.000 | 122.500 |
| 60 | 6.000 | 177.000 |
| 70 | 7.000 | 241.500 |
| 80 | 8.000 | 316.000 |
| 90 | 9.000 | 400.500 |
| 99 | 9.900 | 485.100 |
| 100 | — | 495.000 |

### Quantos monstros até o nível 100

Na arena de teste (5c), o mob vermelho dá **20 XP** e o atirador **25 XP** (provisório); os monstros de verdade vêm com a Floresta (TASK-012). A tabela mostra quantos monstros são precisos para ir do nível 1 ao 100, para cada valor possível de XP por monstro. No grupo, o XP de cada monstro é dividido entre os permanentes de pé (RF50): com 5 personagens, cada um recebe um quinto.

| XP por monstro | Monstros (personagem sozinho) | Monstros (grupo de 5, todos chegam ao 100 juntos) |
| --- | --- | --- |
| 10 | 49.500 | 247.500 |
| 25 | 19.800 | 99.000 |
| 50 | 9.900 | 49.500 |
| 100 | 4.950 | 24.750 |
| 250 | 1.980 | 9.900 |
| 500 | 990 | 4.950 |

### Ideia em aberto: limitar o XP por monstro

Anotada em 05/10/2026 para decidir depois: limitar quanto XP dá para ganhar com cada monstro, para o jogador precisar enfrentar todo tipo de monstro. Caminhos possíveis:

- teto de XP por tipo de monstro em cada partida;
- XP que diminui quanto mais vezes o mesmo tipo é derrotado;
- XP que depende da diferença de nível entre o monstro e o grupo.

## Atributos

Maior valor de cada atributo: **100** (provisório). Cada nível dá 3 pontos; do nível 1 ao 100 são **297 pontos**. Cada classe começa com 50 pontos, então um personagem no nível 100 tem até 347 pontos espalhados pelos 5 atributos, de 500 possíveis: dá para levar uns **3 atributos ao máximo**, não todos.

### Atributos iniciais (provisório)

| Classe | Vitalidade | Força | Sabedoria | Inteligência | Agilidade | Soma |
| --- | --- | --- | --- | --- | --- | --- |
| Guerreiro | 12 | 14 | 6 | 5 | 13 | 50 |
| Mago | 8 | 4 | 12 | 18 | 8 | 50 |
| Tanque | 18 | 15 | 6 | 4 | 7 | 50 |
| Sacerdote | 8 | 5 | 18 | 12 | 7 | 50 |
| Arqueiro | 6 | 10 | 6 | 6 | 22 | 50 |

### Quanto um atributo alto vale

O efeito de um atributo (dano, vida, mana...) segue a curva **efeito = 100 × (valor ÷ 100) ^ expoente**. Com expoente 1, o atributo 100 vale o dobro do 50. Com expoente maior, os valores altos valem cada vez mais. O expoente escolhido está marcado como atual (provisório); o combate usa a curva a partir da etapa 5.

| Valor do atributo | expoente 1 | expoente 1,25 | expoente 1,5 (atual) | expoente 2 |
| --- | --- | --- | --- | --- |
| 10 | 10,0 | 5,6 | 3,2 | 1,0 |
| 25 | 25,0 | 17,7 | 12,5 | 6,3 |
| 50 | 50,0 | 42,0 | 35,4 | 25,0 |
| 75 | 75,0 | 69,8 | 65,0 | 56,3 |
| 100 | 100,0 | 100,0 | 100,0 | 100,0 |
| **100 vale quantas vezes o 50** | **2,00×** | **2,38×** | **2,83×** | **4,00×** |

## Taxas (documentação)

A taxa incide só sobre o **ouro ganho na partida** (RF48). Cada perdido paga pela distância em linha reta entre o ponto inicial do bioma e o lugar onde caiu: a taxa cresce em linha reta do início até a borda, e cada valor é truncado (3,5% vira 3%). Fuga e "todos desmaiam" usam uma taxa só, pela posição do Líder, no lugar das dos perdidos. No domínio de Boss somam-se +2 pontos por perdido, +7 na fuga e +15 em "todos desmaiam". Itens e XP nunca são taxados.

| Bioma | Distância até a borda (provisório) |
| --- | --- |
| Floresta | 7.026 px (do ponto inicial até o canto andável mais longe do mapa) |
| Deserto | fora do beta (1.000, sem mapa) |
| Tundra | fora do beta (1.000, sem mapa) |
| Vulcânico | fora do beta (1.000, sem mapa) |

### Sem Boss

| Situação | Início | Meio | Borda |
| --- | --- | --- | --- |
| Cada personagem perdido | 1% | 3% | 6% |
| 2 perdidos | 2% | 6% | 12% |
| 3 perdidos | 3% | 9% | 18% |
| 4 perdidos | 4% | 12% | 24% |
| Fuga | 7% | 18% | 30% |
| Todos desmaiam | 10% | 25% | 40% |

### No domínio de Boss

| Situação | Início | Meio | Borda |
| --- | --- | --- | --- |
| Cada personagem perdido | 3% | 5% | 8% |
| 2 perdidos | 6% | 10% | 16% |
| 3 perdidos | 9% | 15% | 24% |
| 4 perdidos | 12% | 20% | 32% |
| Fuga | 14% | 25% | 37% |
| Todos desmaiam | 25% | 40% | 55% |

### A taxa ao longo do caminho (sem Boss)

| Distância | Perdido | Fuga | Todos desmaiam |
| --- | --- | --- | --- |
| 0% do caminho | 1% | 7% | 10% |
| 10% do caminho | 1% | 9% | 13% |
| 20% do caminho | 2% | 11% | 16% |
| 30% do caminho | 2% | 13% | 19% |
| 40% do caminho | 3% | 16% | 22% |
| 50% do caminho | 3% | 18% | 25% |
| 60% do caminho | 4% | 20% | 28% |
| 70% do caminho | 4% | 23% | 31% |
| 80% do caminho | 5% | 25% | 34% |
| 90% do caminho | 5% | 27% | 37% |
| 100% do caminho | 6% | 30% | 40% |
| 150% do caminho (depois da borda) | 6% | 30% | 40% |

### Exemplos do Conceito, calculados pelo jogo

- Ganha 8.000 de ouro, dois personagens caem no meio, volta com Q: **Vitória**, taxa de 6% = 480 de ouro; recebe 7.520.
- O mesmo, mas foge com F no meio: **Retorno forçado**, taxa de 18% = 1.440 de ouro; recebe 6.560.

## Ouro (moedas)

- A taxa em moedas é **arredondada para baixo**, a favor do jogador. O ouro que o jogador já tinha nunca é taxado.
- Grande Vitória: taxa 0% e **+10%** no ouro (também arredondado para baixo).
- Preços do Mercado e da Forja, do pergaminho e dos contratos: provisórios (seções Guilda e Reino com dados).
- **Teto do ouro: ainda não existe.** O maior número que o jogo guarda com segurança é 9.007.199.254.740.991. Se quiser um teto (por exemplo, 999.999.999), é só decidir.

### Quanto o jogador recebe

| Ouro ganho | Taxa 0% | Taxa 6% | Taxa 18% | Taxa 25% | Taxa 55% |
| --- | --- | --- | --- | --- | --- |
| 100 | 100 | 94 | 82 | 75 | 45 |
| 1.000 | 1.000 | 940 | 820 | 750 | 450 |
| 8.000 | 8.000 | 7.520 | 6.560 | 6.000 | 3.600 |
| 50.000 | 50.000 | 47.000 | 41.000 | 37.500 | 22.500 |

## Guilda: contratos e missões

Contratos (RF29, preços provisórios). O **temporário** custa **200 de ouro**, vem no nível 5, dura **3 partidas** e não pode ser Líder. O **permanente** custa **1.000 de ouro** e cria o personagem no nível 1, que evolui normalmente; se já havia um temporário da mesma classe, ele é substituído.

- O temporário perde uma partida a cada partida terminada (RF52). Partida interrompida (aba fechada, queda) não gasta partida, porque não conta (RF12).
- Um personagem por classe: não dá para contratar uma classe que já tem permanente, nem dois temporários da mesma classe.

Missões (RF28): uma por vez. Ao entregar, o ouro vai para o jogador e o XP é dividido entre todos os permanentes (a sobra vai para o Líder); XP nunca é taxado. Missão de entregar consome os itens da Mochila do Reino. Abandonar custa **10% do ouro da recompensa** (documentação), arredondado para baixo; o ouro do jogador nunca fica negativo.

| Ouro da recompensa | 50 | 100 | 500 | 1.000 | 5.000 |
| --- | --- | --- | --- | --- | --- |
| Multa por abandonar | 5 | 10 | 50 | 100 | 500 |

## Peso (mochila da partida)

Capacidade = soma da Força de todo o grupo que vai, contando os contratados × **2** (provisório). É calculada ao começar a partida e não muda durante ela (RF33). O peso de cada item é um número inteiro por unidade; o que não cabe cai no chão. O peso dos itens ainda não existe (etapa 7).

| Grupo | Força somada | Capacidade |
| --- | --- | --- |
| Guerreiro sozinho (nível 1) | 14 | 28 |
| Mago sozinho (nível 1) | 4 | 8 |
| Tanque sozinho (nível 1) | 15 | 30 |
| Sacerdote sozinho (nível 1) | 5 | 10 |
| Arqueiro sozinho (nível 1) | 10 | 20 |
| As 5 classes juntas (nível 1) | 48 | 96 |
| 5 personagens com Força 50 | 250 | 500 |
| 5 personagens com Força 100 | 500 | 1.000 |

## Pontuação e resultado

Pontuação base = monstros × 10 + ouro ganho × 1 + recursos × 5 + bônus de Boss + segundos ativos × 1 (pesos provisórios). Pontuação final = base × (1 − taxa); na Grande Vitória, +10% (RF49).

- **Grande Vitória:** voltou com Q ou pela pausa, ninguém desmaiou na partida inteira e a base passou de 1.000 (provisório).
- **Vitória:** voltou com Q ou pela pausa nos outros casos.
- **Retorno forçado:** fugiu com F, ou o Líder não foi levantado em 30 s.
- **Derrota:** todos desmaiaram.

| Cenário | Base | Resultado | Taxa | Ouro recebido | Pontuação final |
| --- | --- | --- | --- | --- | --- |
| Partida curta: 5 monstros, 50 de ouro, 2 recursos, 60 s ativos, sem desmaio | 170 | Vitória | 0% | 50 | 170 |
| Boa partida: 50 monstros, 2.000 de ouro, 20 recursos, 600 s, sem desmaio | 3.200 | Grande Vitória | 0% | 2.200 | 3.520 |
| A mesma, mas um personagem caiu na borda | 3.200 | Vitória | 6% | 1.880 | 3.008 |
| A mesma, mas fugiu com F no meio | 3.200 | Retorno forçado | 18% | 1.640 | 2.624 |
| Exemplo do Conceito: base 5.100, todos desmaiam no meio | 5.100 | Derrota | 25% | 3.825 | 3.825 |

## Combate de teste (arena da Fase 1, provisório)

Valores da arena de teste da etapa 5 (TASK-004 e TASK-042). Servem para sentir o combate e vão mudar quando as habilidades de verdade chegarem (TASK-010). Distâncias em pixels da arena (1.600 × 900). Vida máxima = Vitalidade × **10**.

| Classe | Vida (nível 1) | Ataque de teste | Dano | Recarga | Detalhe |
| --- | --- | --- | --- | --- | --- |
| Guerreiro | 120 | Espada: varre um arco na frente | 25 | 0,4 s | arco de 120°, alcance 70 |
| Mago | 80 | Bola mágica: explode em área | 30 | 1,5 s | cresce de 10 a 26; explosão de raio 90 |
| Tanque | 180 | Escudo: bloqueia; o clique empurra | 8 | 0,6 s | escudo de 70 px; empurrão até 90 |
| Sacerdote | 80 | Aura: cura quem está dentro | cura 5 por pulso | 3 s | raio 150; pulso a cada 0,5 s por 3 s |
| Arqueiro | 60 | Flecha: rápida, um alvo só | 18 | 0,35 s | 900 px/s, até 700 |

- Andar: **220 px/s**, igual na diagonal.
- Esquiva (Espaço): avança **160 px** em 0,15 s, sem levar dano; recarga de **0,8 s**.
- Depois de levar um golpe, **0,5 s** de imunidade (RF36).
- Separação: cada corpo tem uma zona de **1 px** além do próprio tamanho; dentro dela, os dois se afastam aos poucos, até **320 px/s** quando um está em cima do outro. O Líder pesa **4** (os aliados saem da frente dele) e os inimigos, **1,5**.
- Travamento: quem anda sozinho e, em **0,6 s**, anda menos de **25%** do que queria, escorrega para um lado, depois para o outro, dá a volta e, no nível 4, desliza em **0,15 s** até o ponto livre mais próximo. O caminho em volta das pedras usa uma grade de **20 px**.

| Inimigo | Vida | Dano | Velocidade | Persegue a | Desiste a | Recarga | Detalhe |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Mob vermelho | 60 | 12 | 140 px/s | 350 px | 550 px | 1,2 s | aviso de 0,5 s, bote de 120 px |
| Atirador | 40 | 8 | 110 px/s | 600 px | 800 px | 1,8 s | fica entre 300 e 450 px; tiro de 220 px/s |

Boneco de treino: **300** de vida, recupera tudo depois de **3 s** sem apanhar.

## Partida: mana, habilidades, IA e desmaio (Fase 1, parte 5b, provisório)

Mana máxima = **20 + Inteligência × 5**. Ela volta sozinha: **0,5 + Sabedoria × 0,15** por segundo. A vida não volta sozinha (RF38).

| Classe | Mana (nível 1) | Mana por segundo | Habilidade de teste (tecla 1) | Custo | Recarga | O que faz |
| --- | --- | --- | --- | --- | --- | --- |
| Guerreiro | 45 | 1,4 | Giro (provisória) | 20 | 5 s | 35 de dano em volta, raio 100 |
| Mago | 110 | 2,3 | Meteoro (provisória) | 35 | 8 s | 50 de dano, raio 130, até 600 px; cai 0,7 s depois do aviso |
| Tanque | 40 | 1,4 | Provocação (provisória) | 15 | 10 s | mobs a até 300 px vão nele por 4 s; leva 50% do dano |
| Sacerdote | 80 | 3,2 | Ressurreição (da documentação) | 60 | 180 s | levanta os caídos a até 120 px com vida cheia, 2 s imune e +20% de dano por 8 s |
| Arqueiro | 50 | 1,4 | Tiro perfurante (provisória) | 25 | 6 s | 60 de dano, 1.400 px/s, atravessa os inimigos e vai até 1.800 px (para em pedra) |

As teclas 2 e 3 ficam vazias até as habilidades de verdade (TASK-010). Os números da Ressurreição também são provisórios.

### IA dos aliados

- Lutam com inimigos a até **380 px** do Líder. Se o Líder passar de **420 px**, todos largam a luta e voltam até **160 px** dele.
- Tanque: fica entre o mob e o grupo; mobs a até **260 px** dele vão nele. Guerreiro: o mob mais próximo.
- Arqueiro: ataca de **220 a 320 px**. Mago: de **260 a 420 px**, mirando onde há mais mobs juntos.
- Sacerdote (regra de 08/10): cura **sempre** que alguém do grupo, ele mesmo também, não está com a vida cheia, em combate ou fora dele. Primeiro levanta os caídos (o Líder primeiro), depois cura o mais ferido; diferença de até **5 pontos** de vida conta como empate, e aí vai o Líder. Na avançada, cada inimigo mirando num ferido conta como **10 pontos** a menos de vida, e o Sacerdote cura de trás do ferido, a **55%** do raio da aura.
- Um nível não atrapalha o outro (08/10): a média desvia de quem está parado quando está a **45 px** dele; a avançada, a **140 px**, passando com **10 px** de folga. O Guerreiro avançado só fica ao lado do Tanque se o Tanque estiver a até **90 px** do lugar dele; senão, vai proteger o Líder.

### Níveis da IA dos aliados (5b.1)

A IA de cada aliado vem do nível do próprio personagem; o jogador não escolhe. A cada poucos segundos, cada aliado sorteia se erra "a decisão do momento". Ninguém chega a 0% de erro.

| Nível do personagem | IA | Chance de errar (começo → fim da faixa) |
| --- | --- | --- |
| 1 a 29 | básica | 45% → 30% |
| 30 a 69 | média | 30% → 15% |
| 70 a 100 | avançada | 15% → 5% |

- Parados: cada aliado para em qualquer ponto entre **50 e 130 px** do Líder e só volta a andar quando o Líder passa de **180 px**. Na média e na avançada, para a até **40 px** da vaga do X.
- Tremor: quem vai e volta sem sair do lugar em **0,6 s** fica quieto por **1,2 s**.
- Básica: Arqueiro a **120–180 px** e Mago a **150–230 px** (mais perto da luta). O Tanque da média ainda erra como o da básica; o Sacerdote da média fica atrás em **50%** das decisões.
- Avançada: formação de combate (Tanque a **60 px** do mob, Guerreiro ao lado, Arqueiro e Mago lado a lado a **120 px** um do outro, Sacerdote **70 px** atrás deles). Os aliados não esquivam: recuam andando do golpe avisado em **50%** das vezes.
- Momento de foco (avançada): com o Líder abaixo de **30%** da vida ou alguém caído, por **8 s** o erro cai para **2%** e o recuo sobe para **90%**.

### Desmaio e resgate

- Quem fica sem vida desmaia e tem **30 s** para ser levantado (documentação).
- Ajuda: alguém de pé, parado a até **60 px**, por **5 s** seguidos (documentação), com a **área limpa: nenhum inimigo vivo a menos de 250 px** (decidido em 06/10). Se a área sujar ou o ajudante sair, volta a zero.
- Quem é levantado pela ajuda volta com **10% da vida** (documentação) e fica frágil por **10 s**, levando **+50%** de dano.
- Sem ajuda em 30 s: vira perdido (Pedra de Retorno). Líder não levantado em 30 s: Retorno forçado. Todos caídos: Derrota na hora.

## Partida: em combate, retorno, fuga e ganhos (5c)

- **Em combate** (documentação, RF37): alguém do grupo causou ou recebeu dano nos últimos **5 s**, ou um mob hostil persegue o grupo. Bater no boneco de treino não conta. Em combate não dá para pausar (Esc mostra "Você não pode pausar agora").
- **Retorno com Q ou pela pausa** (documentação, RF45): **15 s**, só começa fora de combate; se o grupo entrar em combate, volta a 15 s e só corre fora dele. Q de novo cancela.
- **Fuga com F** (documentação, RF46): o primeiro F mostra o custo, o segundo confirma; **5 s**, mesmo em combate. Confirmada, não se cancela (decisão de 07/10).
- **Tempo ativo** (documentação, Conceito §12): só o tempo com dano nos últimos 5 s. Ser perseguido sem levar dano não conta. A pausa não conta em nenhum tempo.
- **Taxa por distância na arena** (provisório até a etapa 6): o ponto inicial do bioma é onde o Líder nasce, e a borda fica a **1.400 px** dele. Exemplo, a fuga: 7% no início, 18% no meio e 30% na borda.
- O nível ganho na partida aparece na hora ("subiu de nível"), mas só vale a partir da partida seguinte: o progresso não muda durante a partida (RF12). É também quando a IA do personagem muda.

### Monstros da arena de teste (provisório)

| Monstro | Vida | XP | Ouro |
| --- | --- | --- | --- |
| Mob vermelho | 60 | 20 | 12 |
| Atirador | 40 | 25 | 15 |

### Crítico (provisório, aprovado em 07/10)

Chance = **5% + 0,5% por ponto de Agilidade**; o golpe crítico causa **1,5×** o dano. Vale para o Líder e os aliados. Com Agilidade 100: 55%.

| Classe | Agilidade inicial | Chance de crítico no começo |
| --- | --- | --- |
| Guerreiro | 13 | 11,5% |
| Mago | 8 | 9,0% |
| Tanque | 7 | 8,5% |
| Sacerdote | 7 | 8,5% |
| Arqueiro | 22 | 16,0% |

### HUD e botões de teste

- Mensagens curtas do HUD (crítico, nível, desmaio, perdido, retorno...): ficam **2,5 s**, no máximo **4** juntas.
- Botão "+300 de ouro" (só no npm run dev): soma ao ouro ganho na partida, para chegar à Grande Vitória (pontuação base acima de 1.000) sem jogar horas.
- Botão "Testar foco": IA avançada para todos, Líder com **25%** da vida por **20 s** e **3 mobs** a 300 px.

## Mundo da Floresta (Fase 3, provisório)

Layout em `src/dados/mundo/floresta.js` (PROVISÓRIO – substituir pelo do grupo, TASK-013): mapa de **7.200 × 3.600 px**, começando estreito na zona segura (perto do Reino) e se abrindo até o domínio do Boss. Fora das regiões é mata fechada (parede). O Líder anda a 220 px/s.

| Região | Tamanho (px) | Força dos mobs | XP da 1ª descoberta de cada área | Mobs por partida |
| --- | --- | --- | --- | --- |
| Zona segura | 1.000 × 600 | ×1,0 | 0 | nenhum |
| Fácil | 1.800 × 1.600 | ×1,0 | 30 | 6 lobo, 4 cervo, 2 aranha |
| Média | 1.800 × 2.600 | ×1,5 | 50 | 6 lobo, 5 aranha, 3 javali, 3 cervo |
| Difícil | 1.400 × 3.200 | ×2,2 | 80 | 7 lobo, 6 aranha, 5 javali, 2 cervo |
| Domínio do Boss | 1.200 × 1.600 | ×2,6 | 120 | 2 lobo |

### Mobs (TASK-012, provisório)

Vida, dano, XP e ouro multiplicados pela força da região. O raio de detecção é a distância em que o mob percebe o grupo; o território, até onde ele persegue (contando de onde nasceu): fora dele, desiste e volta para casa.

| Mob | Jeito | Vida (fácil / difícil) | Dano (fácil / difícil) | XP (fácil / difícil) | Ouro (fácil / difícil) | Detecção | Território | Drop |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| lobo | corpo a corpo | 55 / 121 | 10 / 22 | 18 / 40 | 10 / 22 | 340 px | 650 px | peleDeLobo (60%) |
| aranha | atira de longe | 38 / 84 | 8 / 18 | 22 / 48 | 12 / 26 | 560 px | 800 px | teiaDeAranha (70%) |
| javali | corpo a corpo | 110 / 242 | 18 / 40 | 35 / 77 | 18 / 40 | 300 px | 600 px | presaDeJavali (50%) |
| cervo | corpo a corpo, não hostil | 45 / 99 | 7 / 15 | 12 / 26 | 6 / 13 | só se atacado | 700 px | chifreDeCervo (40%) |

### Boss da Floresta (TASK-065, provisório)

- **Guardião da Floresta**: 2.400 de vida, 400 XP, 250 de ouro e **+500 na pontuação** (bônus de Boss, RF49). Território de 720 px no domínio dele.
- Pisão (perto): área de 190 px em volta, aviso de 1 s, 26 de dano.
- Investida (média distância): faixa de 440 × 80 px até o alvo, aviso de 1 s, 22 de dano.
- Espinhos (longe): leque de 5 tiros, aviso de 1 s, 12 de dano cada.
- Um ataque a cada 2 s no máximo. Drop: cascaAntiga sempre e **8%** de chance do equipamento especial (coroaDeRaizes, RF39; no npm run dev dá para forçar 100%).

### Coleta, minimapa e outros

- Coleta com E até **80 px** do Líder. O drop de um mob fica no chão por **60 s**; o que não coube na mochila, por **30 s** (os dois piscam nos últimos 5 s). Os recursos do chão ficam até alguém pegar e voltam a cada partida.
- Minimapa: células de **200 px**; o grupo revela tudo a até **450 px** do Líder.
- Mobs nascem a pelo menos **700 px** do início de cada região (o grupo nunca nasce com mob perto), a **140 px** uns dos outros e com **24 px** livres em volta.
- Mob que desiste volta para casa sem olhar para o grupo por **4 s**; atacado, persegue mesmo fora do território por **5 s**.
- Longe do Líder (mais de **1.500 px**), os mobs dormem (não pensam nem andam), para manter os 60 FPS.
- Aliado fora da tela e a mais de **1.100 px** do Líder (ou preso) por **3 s**: reaparece logo além da borda da tela (70 px) e entra andando.
- Árvores e pedras: uma casa a cada **300 px**, com pelo menos **90 px** livres entre dois obstáculos (sempre há passagem).

## Reino com dados (Fase 4, provisório)

Catálogo, Mercado, Forja, habilidades, missões, conquistas e minijogos, todos PROVISÓRIOS até o conteúdo do grupo (TASK-010, TASK-014, TASK-015 e TASK-016). Para trocar, mude os arquivos de `src/dados/` e rode `npm run balanceamento`.

### Catálogo de itens (TASK-070)

Quem vende (no Mercado, ou equipamento na Forja) recebe **50%** do preço, para baixo. Os testes barram troca ou receita que dê lucro (ouro infinito).

| Item | Tipo | Raridade | Peso | Preço | Venda | Função |
| --- | --- | --- | --- | --- | --- | --- |
| Cogumelo | recurso | Comum | 1 | 3 | 1 | Recurso: vende no Mercado e entra em receitas e trocas. |
| Erva medicinal | recurso | Comum | 1 | 4 | 2 | Recurso: vende no Mercado e entra em receitas e trocas. |
| Madeira | recurso | Comum | 3 | 2 | 1 | Recurso: vende no Mercado e entra em receitas e trocas. |
| Trigo | recurso | Comum | 1 | 3 | 1 | Recurso: vende no Mercado e entra em receitas e trocas. |
| Peixe | recurso | Comum | 1 | 6 | 3 | Recurso: vende no Mercado e entra em receitas e trocas. |
| Cristal | material | Raro | 1 | 40 | 20 | Material: entra nas receitas da Forja e nas trocas do Mercado. |
| Pérola do lago | material | Raro | 1 | 50 | 25 | Material: entra nas receitas da Forja e nas trocas do Mercado. |
| Pele de lobo | material | Comum | 2 | 8 | 4 | Material: entra nas receitas da Forja e nas trocas do Mercado. |
| Teia de aranha | material | Comum | 1 | 6 | 3 | Material: entra nas receitas da Forja e nas trocas do Mercado. |
| Presa de javali | material | Incomum | 2 | 15 | 7 | Material: entra nas receitas da Forja e nas trocas do Mercado. |
| Chifre de cervo | material | Incomum | 3 | 18 | 9 | Material: entra nas receitas da Forja e nas trocas do Mercado. |
| Casca antiga | material | Raro | 4 | 60 | 30 | Material: entra nas receitas da Forja e nas trocas do Mercado. |
| Minério de ferro | material | Comum | 3 | 12 | 6 | Material: entra nas receitas da Forja e nas trocas do Mercado. |
| Poção de vida | consumivel | Comum | 1 | 25 | 12 | Recupera 40% da vida. Não levanta quem desmaiou. Na partida: Tab, depois E (Líder) ou R (aliado). |
| Poção grande de vida | consumivel | Incomum | 2 | 60 | 30 | Recupera 75% da vida. Não levanta quem desmaiou. Na partida: Tab, depois E (Líder) ou R (aliado). |
| Poção de mana | consumivel | Comum | 1 | 30 | 15 | Recupera 50% da mana. Na partida: Tab, depois E (Líder) ou R (aliado). |
| Tônico ligeiro | consumivel | Incomum | 1 | 40 | 20 | Anda 25% mais rápido por 20 s. Na partida: Tab, depois E ou R. |
| Elixir do foco | consumivel | Incomum | 1 | 50 | 25 | Recargas 30% mais rápidas por 20 s. Na partida: Tab, depois E ou R. |
| Pergaminho de redefinição | utilitario | Raro | 1 | 300 | 150 | Devolve os pontos de atributo de um personagem (nas Árvores). Habilidades não mudam. |
| Espada curta | equipamento | Comum | 3 | 120 | 60 | Arma · Força +3 · só Guerreiro |
| Lâmina de presa | equipamento | Incomum | 3 | 260 | 130 | Arma · Força +6 · Agilidade +2 · só Guerreiro |
| Arco de caça | equipamento | Comum | 2 | 120 | 60 | Arma · Agilidade +3 · só Arqueiro |
| Arco de teia | equipamento | Incomum | 2 | 260 | 130 | Arma · Agilidade +6 · Força +2 · só Arqueiro |
| Cajado de carvalho | equipamento | Comum | 3 | 120 | 60 | Arma · Inteligência +3 · só Mago |
| Cajado de chifre | equipamento | Incomum | 3 | 260 | 130 | Arma · Inteligência +6 · Sabedoria +2 · só Mago |
| Martelo de guerra | equipamento | Comum | 5 | 120 | 60 | Arma · Força +2 · Vitalidade +1 · só Tanque |
| Cetro da aurora | equipamento | Comum | 2 | 120 | 60 | Arma · Sabedoria +3 · só Sacerdote |
| Cetro de ervas | equipamento | Incomum | 2 | 260 | 130 | Arma · Sabedoria +6 · Vitalidade +2 · só Sacerdote |
| Escudo de madeira | equipamento | Comum | 4 | 100 | 50 | Escudo · Vitalidade +2 · Defesa 3 · só Tanque |
| Escudo de casca antiga | equipamento | Raro | 5 | 420 | 210 | Escudo · Vitalidade +5 · Força +2 · Defesa 7 · só Tanque |
| Capuz de couro | equipamento | Comum | 1 | 60 | 30 | Capacete · Agilidade +1 · Defesa 1 · todas as classes |
| Colete de couro | equipamento | Comum | 3 | 90 | 45 | Peitoral · Vitalidade +2 · Defesa 2 · todas as classes |
| Calças de couro | equipamento | Comum | 2 | 70 | 35 | Calças · Agilidade +1 · Defesa 1 · todas as classes |
| Botas de couro | equipamento | Comum | 1 | 60 | 30 | Botas · Agilidade +1 · todas as classes |
| Luvas de couro | equipamento | Comum | 1 | 60 | 30 | Manoplas · Força +1 · todas as classes |
| Elmo de ferro | equipamento | Incomum | 3 | 180 | 90 | Capacete · Vitalidade +2 · Defesa 3 · todas as classes |
| Peitoral de ferro | equipamento | Incomum | 6 | 260 | 130 | Peitoral · Vitalidade +4 · Defesa 5 · todas as classes |
| Grevas de ferro | equipamento | Incomum | 4 | 200 | 100 | Calças · Vitalidade +2 · Força +1 · Defesa 3 · todas as classes |
| Botas de vento | equipamento | Incomum | 1 | 220 | 110 | Botas · Agilidade +3 · Recarga −5% · todas as classes |
| Manoplas de ferro | equipamento | Incomum | 3 | 180 | 90 | Manoplas · Força +3 · Defesa 2 · todas as classes |
| Coroa de raízes | equipamento | Especial | 2 | 500 | 250 | Capacete · Vitalidade +6 · Sabedoria +4 · Defesa 4 · todas as classes |
| Capacete de teste | equipamento | Teste | 2 | 10 | 5 | Capacete · Vitalidade +1 · todas as classes |
| Peitoral de teste | equipamento | Teste | 4 | 10 | 5 | Peitoral · Vitalidade +2 · todas as classes |
| Calças de teste | equipamento | Teste | 3 | 10 | 5 | Calças · Agilidade +1 · todas as classes |
| Botas de teste | equipamento | Teste | 2 | 10 | 5 | Botas · Agilidade +1 · todas as classes |
| Manoplas de teste | equipamento | Teste | 2 | 10 | 5 | Manoplas · Força +1 · todas as classes |
| Espada de teste | equipamento | Teste | 3 | 10 | 5 | Arma · Força +2 · só Guerreiro |
| Escudo de teste | equipamento | Teste | 4 | 10 | 5 | Escudo · Vitalidade +2 · só Tanque |

### Mercado (TASK-074)

- Sempre à venda: Poção de vida, Poção de mana, Pergaminho de redefinição, Minério de ferro.
- Rotativas (3 de cada vez, mudam a cada **3 partidas** jogadas): Poção grande de vida, Tônico ligeiro, Elixir do foco, Pele de lobo, Teia de aranha, Presa de javali, Chifre de cervo, Erva medicinal.
- Troca: 3 Pele de lobo → 1 Presa de javali.
- Troca: 4 Teia de aranha → 1 Chifre de cervo.
- Troca: 3 Cogumelo + 3 Erva medicinal → 1 Poção de vida.
- Troca: 4 Madeira → 1 Minério de ferro.
- Troca: 5 Presa de javali → 1 Casca antiga.

### Forja (TASK-075)

À venda (o equipamento comum): Espada curta, Arco de caça, Cajado de carvalho, Martelo de guerra, Cetro da aurora, Escudo de madeira, Capuz de couro, Colete de couro, Calças de couro, Botas de couro, Luvas de couro. Na partida, cada ponto de defesa tira **2%** do dano recebido (até **50%**), e a redução de recarga das peças soma até **30%**.

| Receita | Materiais | Ouro |
| --- | --- | --- |
| Capuz de couro | 2 Pele de lobo | 15 |
| Colete de couro | 4 Pele de lobo | 25 |
| Calças de couro | 3 Pele de lobo | 20 |
| Botas de couro | 2 Pele de lobo | 15 |
| Luvas de couro | 2 Pele de lobo | 15 |
| Elmo de ferro | 3 Minério de ferro + 1 Pele de lobo | 80 |
| Peitoral de ferro | 5 Minério de ferro + 2 Pele de lobo | 120 |
| Grevas de ferro | 4 Minério de ferro + 1 Pele de lobo | 90 |
| Botas de vento | 5 Teia de aranha + 2 Pele de lobo | 100 |
| Manoplas de ferro | 3 Minério de ferro + 1 Presa de javali | 80 |
| Lâmina de presa | 3 Presa de javali + 2 Minério de ferro | 120 |
| Arco de teia | 6 Teia de aranha + 3 Madeira | 120 |
| Cajado de chifre | 2 Chifre de cervo + 3 Madeira | 120 |
| Cetro de ervas | 8 Erva medicinal + 2 Madeira | 120 |
| Escudo de casca antiga | 2 Casca antiga + 4 Madeira | 200 |

Equipamento fixo do contrato temporário (RF29): Guerreiro: Espada curta, Colete de couro; Mago: Cajado de carvalho, Colete de couro; Tanque: Martelo de guerra, Escudo de madeira, Colete de couro; Sacerdote: Cetro da aurora, Colete de couro; Arqueiro: Arco de caça, Colete de couro.

### Habilidades da árvore (TASK-077)

Cada nível custa **1 ponto** de habilidade. A cada nível acima do 1: dano e cura **+15%**, bônus de dano **+10%**, proteção **+8%**, duração **+10%** e recarga **−4%** (do valor do nível 1). No beta, 4 por classe (a raiz e a primeira de cada ramo).

| Classe | Habilidade | Tipo | Mana | Recarga (nível 1 → 5) | Efeito (nível 1 → 5) |
| --- | --- | --- | --- | --- | --- |
| Guerreiro | Giro | ativa | 20 | 5,0 s → 4,2 s | dano 35 → 56 |
| Guerreiro | Golpe pesado | ativa | 25 | 7,0 s → 5,9 s | dano 70 → 112 |
| Guerreiro | Fúria | ativa | 30 | 20,0 s → 16,8 s | +30% → +42% de dano |
| Guerreiro | Pele grossa | passiva (vida) | — | — | +4% → +20% |
| Mago | Meteoro | ativa | 35 | 8,0 s → 6,7 s | dano 50 → 80 |
| Mago | Descarga elétrica | ativa | 25 | 5,0 s → 4,2 s | dano 40 → 64 |
| Mago | Explosão de fogo | ativa | 30 | 7,0 s → 5,9 s | dano 45 → 72 |
| Mago | Mente clara | passiva (mana) | — | — | +8% → +40% |
| Tanque | Provocação | ativa | 15 | 10,0 s → 8,4 s | −50% → −66% de dano recebido |
| Tanque | Golpe de escudo | ativa | 15 | 6,0 s → 5,0 s | dano 20 → 32 |
| Tanque | Muralha | ativa | 30 | 25,0 s → 21,0 s | −30% → −40% de dano recebido |
| Tanque | Pele de ferro | passiva (defesa) | — | — | +2 defesa → +10 defesa |
| Sacerdote | Ressurreição | ativa | 60 | 180,0 s → 151,2 s | +20% → +28% de dano |
| Sacerdote | Cura em área | ativa | 30 | 8,0 s → 6,7 s | cura 30 → 48 |
| Sacerdote | Bênção | ativa | 35 | 20,0 s → 16,8 s | +20% → +28% de dano |
| Sacerdote | Fé | passiva (cura) | — | — | +8% → +40% |
| Arqueiro | Tiro perfurante | ativa | 25 | 6,0 s → 5,0 s | dano 60 → 96 |
| Arqueiro | Chuva de flechas | ativa | 30 | 9,0 s → 7,6 s | dano 40 → 64 |
| Arqueiro | Flecha certeira | ativa | 20 | 4,0 s → 3,4 s | dano 90 → 144 |
| Arqueiro | Olho de águia | passiva (critico) | — | — | +2% → +10% |

### Missões da Guilda (TASK-078)

| Missão | Tipo | Objetivo | Ouro | XP | Multa por abandonar |
| --- | --- | --- | --- | --- | --- |
| Caçar lobos | matar | 8 lobo | 80 | 120 | 8 |
| Aranhas no caminho | matar | 6 aranha | 110 | 180 | 11 |
| Javalis bravos | matar | 4 javali | 150 | 240 | 15 |
| O Guardião da Floresta | matar | 1 Guardião da Floresta | 400 | 600 | 40 |
| Cogumelos para poções | coletar | 6 Cogumelo | 60 | 80 | 6 |
| Lenha para o inverno | coletar | 8 Madeira | 70 | 90 | 7 |
| Peles para o curtidor | entregar | 4 Pele de lobo | 90 | 100 | 9 |
| Fios para a tecelã | entregar | 5 Teia de aranha | 80 | 100 | 8 |
| O coração da mata | explorar | Coração da Mata | 120 | 200 | 12 |
| A clareira do Guardião | explorar | Clareira do Guardião | 150 | 250 | 15 |

### Conquistas (TASK-103)

| Conquista | O que pede | Recompensa |
| --- | --- | --- |
| Primeiros passos | Jogue a primeira partida. | 20 de ouro |
| Caçador | Derrote 50 monstros. | 100 de ouro |
| Exterminador | Derrote 1.000 monstros. | 300 de ouro |
| Lenda da Floresta | Derrote 10.000 monstros. | 1.000 de ouro |
| Queda do Guardião | Derrote o Guardião da Floresta. | 200 de ouro |
| Volta triunfal | Consiga uma Grande Vitória. | 100 de ouro |
| A serviço da Guilda | Entregue 5 missões na Guilda. | 150 de ouro |
| Explorador | Descubra todas as áreas da Floresta. | 150 de ouro |
| Aventureiro | Leve um personagem ao nível 10. | 100 de ouro |
| Mestre | Leve um personagem ao nível 100. | 2.000 de ouro |
| Grupo completo | Tenha as 5 classes como personagens permanentes. | 300 de ouro |
| Cofre cheio | Tenha 2.000 de ouro de uma vez. | — |

### Minijogos do Planalto (TASK-080 e TASK-081)

Rodada de **30 s**, no máximo 60 pontos. Cada ponto dá 1 do recurso e o XP do lugar (dividido entre todos os permanentes); o raro vem com a chance de cada ponto. Não é partida (sem taxa, ranking ou histórico).

| Lugar | Como joga | Recurso | Raro (chance por ponto) | XP por ponto |
| --- | --- | --- | --- | --- |
| Fazenda | Clique nas plantas maduras (douradas) antes que murchem. | Trigo | Erva medicinal (25%) | 4 |
| Mina | Clique 3 vezes em cada pedra para quebrar. Algumas têm cristal. | Minério de ferro | Cristal (15%) | 5 |
| Lago | Quando a boia afundar, clique rápido para fisgar. Antes da hora, o peixe foge. | Peixe | Pérola do lago (10%) | 7 |

## Ainda sem valor (a decidir)

Valores do Conceito §19 que ainda não existem no código:

- os mobs, o Boss e o layout definitivos da Floresta (TASK-012 e TASK-013): os valores acima são provisórios;
- as habilidades de verdade (TASK-010): a árvore provisória já tem números por nível;
- o catálogo, as ofertas, as receitas, as missões, as conquistas e os minijogos do grupo (TASK-014, TASK-015 e TASK-016): os provisórios já têm todos os números acima.
