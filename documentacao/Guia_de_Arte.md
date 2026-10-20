# Guia de Arte

O estilo de toda a arte do jogo (cenários, telas e personagens), para ela sair igual não importa quem gere: o grupo à mão ou o Claude pelo PixelLab. **Refeito do zero em 20/10/2026**, a partir das imagens do Pablo; a versão de 15/10 (o Mago chibi do protótipo) foi rejeitada. O que gerar, com os nomes dos arquivos, está na [Lista de Arte e Som](Lista_de_Arte_e_Som.md); as molduras, botões e painéis desenhados em código estão no [Guia de Interface](Guia_de_Interface.md); o passo a passo de gerar pelo PixelLab está na skill `gerar-arte` (`.claude/skills/gerar-arte/SKILL.md`).

**A aparência é decisão do Pablo.** Nada de personagem novo sem um teste de estilo aprovado por ele (seção 6).

## 1. Referências

| Referência | Para quê |
|---|---|
| A imagem do Reino (o fundo da tela do Reino, `fundo-reino`) | O estilo das telas e dos cenários: pixel art viva, vista de cima em perspectiva, e as placas escuras com borda dourada |
| A imagem do mapa dos biomas (o fundo da tela do Mapa, `fundo-mapa`) | O mesmo estilo nos cenários grandes; as cores de cada bioma |
| Uma tela do jogo **Taskbar Hero** (só referência de estilo) | O estilo dos **personagens**: chibi pequeno, de cabeça grande e olhos grandes |

As imagens de outros jogos servem **só como referência de estilo**: nada de copiar os personagens, as roupas marcantes ou a interface deles.

## 2. Cenários e telas (como as imagens do Reino e do mapa)

- **Pixel art ilustrada**, com pixels visíveis de 3 a 4 px na tela, vista de cima em perspectiva suave (o Reino de cima e um pouco de lado; o mapa quase isométrico).
- **Cores vivas e saturadas:** céu azul forte, verdes de vários tons, estandartes azuis com a flor-de-lis, telhados vermelhos e azuis, pedra cinza-azulada.
- **Contorno escuro** nas formas grandes (muralha, prédios, árvores), sombra marcada embaixo e à direita.
- **Placas de texto escuras com borda dourada** (Salão da Glória, Guilda, Mochila...) e o **botão principal vermelho com borda dourada** (o JOGAR). Na tela, essas placas e botões são feitos em código (Guia de Interface), menos no Reino, onde já vêm desenhados na imagem.
- **Fundos das telas internas** (cada uma com o seu lugar: a Forja com fogo e bigorna, o Mercado com as bancas, a Guilda com o quadro de avisos): no mesmo estilo, **sem texto desenhado** (os botões são do código), com o centro mais calmo para os painéis ficarem por cima. Tamanho ideal 1920 × 1080; pelo PixelLab, que gera até 400 px de lado, sai em 400 × 225 e o jogo amplia (seção 5).

### Paleta das telas (tirada da imagem do Reino)

| Papel | Cor |
|---|---|
| Placa (fundo) | quase preto `#0b0807` |
| Dourado (borda, luz e sombra) | `#f8c400`, `#f0a000`, `#f08800` |
| Botão principal (vermelho) | `#a80000`, sombra `#900000` |
| Texto claro | `#f8f8f8` |
| Céu | `#08a0f0` |
| Estandarte azul | `#0070f8`, sombra `#0040d8` |
| Pedra | `#9090a0` |
| Madeira | `#7a4a24`, luz `#a8682e`, sombra `#4a2a14` |
| Pergaminho | `#f0dfb4`, sombra `#c9b07a` |

## 3. Personagens (a partir do Taskbar Hero)

- **Chibi:** a cabeça tem perto de **metade da altura**; **olhos grandes** com um brilho; corpo pequeno e **silhueta fácil de reconhecer** (o chapéu do Mago, o escudo do Tanque, o arco do Arqueiro).
- **Contorno escuro fino**, em **marrom ou cinza bem escuro** (`#2b1d1a` ou `#2a2630`), **nunca preto puro**.
- **Sombreamento suave de 2 a 3 tons** por cor; luz de cima à esquerda.
- **Cores um pouco dessaturadas, com detalhes vivos** (um penacho, uma gema, a capa).
- **Pouco detalhe:** tudo legível no tamanho real. Se some em 48 px, sai.
- **Vista:** a câmera de cima em 3/4 do jogo. O Taskbar Hero mostra os personagens de frente em 3/4, que combina com ela. São geradas **frente, costas e direita**; a **esquerda é a direita espelhada** (o jogo faz sozinho).
- **Tamanho:** **48 px de altura** (mais fiel ao estilo pequeno da referência e à área de golpe de 40 px). O PixelLab põe o boneco de 48 px num quadro de 68 × 68 (sobra para a animação), e o jogo desenha o quadro 1:1, sem esticar.

### As 5 classes (as cores-assinatura do jogo continuam)

| Classe | Aparência | Cor-assinatura (HUD) |
|---|---|---|
| Guerreiro | armadura leve, espada e **capa azul** | azul |
| Mago | **chapéu pontudo**, **manto roxo** e cajado | roxo |
| Tanque | **armadura pesada**, elmo e **escudo grande**, em **laranja e bronze** | laranja |
| Sacerdote | **túnica clara** com detalhes **amarelos e dourados** e **cajado com símbolo sagrado** | amarelo |
| Arqueiro | **capuz ciano**, arco e aljava | ciano |

- **Retrato** de 128 × 128 (`retrato-<classe>.png`): o busto do personagem, de frente, no mesmo estilo.
- **Emblema** de 32 × 32 (`classe-<classe>.png`): a arma ou o símbolo da classe, num disco escuro com borda dourada (como as placas).

### Animações

| Animação | Quadros | Direções |
|---|---|---|
| Parado (respirando) | 2 a 4 | frente, costas, direita |
| Andando | 4 | frente, costas, direita |
| Atacando (o golpe da classe) | 3 a 6 | frente, costas, direita |
| Desmaiado (deitado) | 1 | frente |

Os efeitos dos ataques (a bola mágica, a flecha, a aura, o escudo) são código, com o tempo casado com os quadros da animação. **Quando o modo barato de animar perde detalhes** (o cajado some, o manto vira calça, um quadro sai com defeito), usar o modo mais fiel ao boneco (seção 5).

**Monstros e o Boss:** mesma família de estilo (pequenos, de contorno fino e 2 a 3 tons), definidos no pedido deles.

## 4. O modelo de descrição (para o PixelLab)

- **Boneco:** `tiny chibi <quem>, big head about half of the body height, big shiny eyes, <roupa e cores, com a cor-assinatura>, holding <arma>, thin dark brown outline, soft 2-3 tone shading, slightly desaturated colors with vivid accents, simple readable shapes`; vista `low top-down`, contorno `selective outline`, sombreamento `basic shading`, detalhe `low detail`, 4 direções, tamanho 48.
- **Retrato:** o boneco de frente, ampliado para 128 como imagem de partida, e `bust portrait of the same chibi <quem>, facing the viewer, big shiny eyes, same colors and outfit, thin dark brown outline, soft shading`.
- **Emblema:** `pixel art round class emblem icon: <arma ou símbolo> on a dark disc with a gold rim, thin dark outline`, 32 × 32, fundo transparente.
- **Fundo de tela:** `pixel art scene, <o lugar e o que tem nele>, vivid saturated colors, top-down perspective view, dark outlines on big shapes, fantasy medieval kingdom, no text, calm empty center`, 400 × 225, sem transparência.

## 5. Como gerar (custos de referência no plano trial)

| O quê | Ferramenta | Gerações |
|---|---|---|
| Teste de estilo: um boneco de frente | `create_image_pixflux` (64 × 64) | 1 |
| Girar o boneco aprovado para as direções | `create_character` mode `v3` com a imagem de referência | 2 a 9 |
| Animação por molde | `animate_character` template | 1 por direção |
| Animação mais fiel ao boneco | `animate_character` mode `skeleton-v3` | 2 a 4 por direção |
| Retrato, emblema, ícone, fundo | `create_image_pixflux` | 1 cada |

O trial gera **uma coisa por vez**. Os fundos saem em 400 × 225 e o jogo amplia; o Reino e o mapa, que são ilustrações já grandes, são ampliados de forma suave.

## 6. Ordem de aprovação (personagens)

1. **Um boneco de frente de uma classe**, como teste de estilo, para o Pablo aprovar (1 a 2 gerações).
2. Aprovado: girar para as direções e animar.
3. As outras classes, **uma por vez, sempre dizendo o custo antes** e esperando o ok.

O que o Pablo não aprovar volta para a fila da skill `gerar-arte`, com o comentário dele.

## Alterações

| Quando | O quê |
|---|---|
| 15/10/2026 | Primeira versão (Mago chibi do protótipo da Seleção, contorno preto). **Rejeitada** pelo Pablo. |
| 20/10/2026 | Refeito do zero: telas e cenários pelas imagens do Reino e do mapa (paleta tirada delas); personagens no estilo do Taskbar Hero (chibi pequeno, cabeça grande, olhos grandes, contorno fino marrom, 2 a 3 tons, cores um pouco dessaturadas com detalhes vivos), 48 px de altura, frente, costas e direita (esquerda espelhada), as 5 classes nas cores-assinatura; ordem de aprovação com o teste de estilo primeiro. |
