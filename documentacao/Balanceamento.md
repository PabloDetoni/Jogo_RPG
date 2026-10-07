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

Ainda não existe XP por monstro (etapa 5). A tabela mostra quantos monstros são precisos para ir do nível 1 ao 100, para cada valor possível de XP por monstro. No grupo, o XP de cada monstro é dividido entre os permanentes ativos (RF50): com 5 personagens, cada um recebe um quinto.

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
| Floresta | 1.000 |
| Deserto | 1.000 |
| Tundra | 1.000 |
| Vulcânico | 1.000 |

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
- Ainda sem valor: ouro por monstro, preços do Mercado e da Forja e do pergaminho (etapas 5 e 7). Os contratos já têm preço provisório (seção Guilda).
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
| Sacerdote | 80 | Aura: cura quem está dentro | cura 8 por pulso | 6 s | raio 150; pulso a cada 0,5 s por 3 s |
| Arqueiro | 60 | Flecha: rápida, um alvo só | 18 | 0,35 s | 900 px/s, até 700 |

- Andar: **220 px/s**, igual na diagonal.
- Esquiva (Espaço): avança **160 px** em 0,15 s, sem levar dano; recarga de **0,8 s**.
- Depois de levar um golpe, **0,5 s** de imunidade (RF36).
- Líder sem vida: Derrota depois de **2 s** (provisório até a TASK-044, que traz o desmaio de 30 s).

| Inimigo | Vida | Dano | Velocidade | Persegue a | Desiste a | Recarga | Detalhe |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Mob vermelho | 60 | 12 | 140 px/s | 350 px | 550 px | 1,2 s | aviso de 0,5 s, bote de 120 px |
| Atirador | 40 | 8 | 110 px/s | 600 px | 800 px | 1,8 s | fica entre 300 e 450 px; tiro de 220 px/s |

Boneco de treino: **300** de vida, recupera tudo depois de **3 s** sem apanhar.

## Ainda sem valor (a decidir)

Valores do Conceito §19 que ainda não existem no código:

- XP e ouro por monstro; bônus de Boss na pontuação; chance de drop dos Bosses;
- dano, custo de mana e recarga das habilidades de verdade (a arena usa um ataque de teste por classe);
- vida devolvida e fragilidade na ajuda de 5 s; fortalecimento da Ressurreição;
- preços do Mercado e da Forja e do pergaminho;
- peso de cada item; tempo que um item fica no chão;
- tamanho dos domínios de Boss; território dos mobs no mundo de verdade (a arena tem raios de teste);
- recompensas de missões e conquistas.
