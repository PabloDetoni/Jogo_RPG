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
- **Placas de texto escuras com borda dourada** (Salão da Glória, Guilda, Mochila...) e o **botão principal vermelho com borda dourada** (o JOGAR). Na tela, essas placas e botões são feitos em código (Guia de Interface), também no Reino (as peças do Pablo não têm placas; seção 7).
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

**Correção facial mais recente — rodada 3 (12/11/2026):** usar o rosto do Tanque antigo escolhido na imagem anexada por Pablo: olhos escuros verticais discretos, sem branco, e pele com cantos suavizados/queixo afunilado. Substitui os olhos largos em L da rodada 2. Rosto do Tanque recuperado exatamente; Sacerdote/Arqueiro adaptados às próprias cores. Mago preservado integralmente, roupa do Sacerdote preservada; nova frente fechada do elmo e dobras do Tanque. Saída em `programacao/arte-original/classes-pablo-32-r3-2026-11-12/finais/`, ainda aguardando avaliação. Não alterar novamente partes aprovadas sem pedido do Pablo.

**Instrução mais recente do Pablo (12/11/2026, após avaliar o teste 64):** voltar a **32 × 32 por personagem**. A imagem própria com o reino continua sendo a referência principal; Mago, Guerreiro, Tanque e Arqueiro 64 servem de base, mantendo o elmo fechado; o Sacerdote 64 foi rejeitado e deve voltar ao capuz, cabelo, túnica e cajado da referência original. Olhos escuros em L **sem branco**, sem boca nem bochechas. Contorno escuro em todas as peças sólidas, exceto a ponta luminosa do cajado do Mago; espada mantém contorno. Arqueiro com arco simples, sem corda desenhada nem flecha armada. Revisar os cinco juntos até Pablo mandar parar de alterar uma classe; depois preservar essa classe exatamente. A nova saída está em `programacao/arte-original/classes-pablo-32-r2-2026-11-12/finais/`, ainda para avaliação. Esta instrução substitui o tamanho e os olhos do teste 64 descrito no registro abaixo.

**Direção atual — teste concluído em 12/11/2026:** a referência aprovada é a imagem própria dos cinco personagens fornecida por Pablo Detoni, preservada em `programacao/arte-original/classes-pablo-2026-11-08/referencia-pablo.png`. As versões grandes já existem nessa referência; produzir as pequenas mantendo sua identidade. Todas masculinas por enquanto, cabeça grande, tronco e membros curtos, olhos legíveis, **sem boca nem bochechas marcadas** (substitui o pedido anterior de sorriso). Pablo autorizou testar **64 × 64 por personagem** para preservar detalhes. Tanque maior, Guerreiro segundo, Mago/Sacerdote próximos, Arqueiro menor. Os cinco PNGs corrigidos e a folha estão em `programacao/arte-original/classes-pablo-64-final-2026-11-12/`; ainda aguardam aprovação visual, sem mudança no tamanho configurado do jogo. [Relatório](../testes/2026-11-12-personagens-64.md).

**A roupa do teste segue a nova referência, substituindo a proposta visual da tabela abaixo:** Mago azul-arroxeado e dourado, cajado azul luminoso; Guerreiro com armadura cinza/dourada, elmo totalmente fechado, capa e penacho vermelhos; Tanque com cabelo castanho, armadura azul/dourada e escudo com emblema dourado; Sacerdote com capuz branco de borda dourada, túnica branca, faixa azul e cruz legível no cajado; Arqueiro com capuz verde, couro marrom, arco e aljava. As cores-assinatura do HUD continuam inalteradas. Variantes femininas e animações são etapas posteriores.

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

## 7. O Reino e o Mapa em camadas, com as peças do Pablo (21/10/2026)

O Reino e o Mapa são montados com **as peças que o Pablo fez**: um fundo e cada objeto separado, em
`documentacao/Telas/reino_pixel_art/` e `mapa_pixel_art/`. Essas imagens são a fonte oficial: o jogo **só monta**
(nada redesenhado, nenhuma cor ou forma mudada, nada gerado no PixelLab) e os originais não se mexem. As peças
geradas no PixelLab e os recortes da imagem inteira, feitos em 20/10, foram **rejeitados** pelo Pablo e saíram do jogo.

- **Cópias sem perda.** Cada peça vira um WEBP sem perda em `programacao/src/assets/arte/reino/` ou `mapa/`. Cada pixel
  foi conferido igual ao do original. A Lista de Arte e Som (seção 4b) diz de qual original veio cada arquivo.
- **Lugar e tamanho pela imagem principal.** A escala e a posição de cada peça são as que deixam a montagem mais
  parecida com `ReinoRPG.png` e `MapaRPG.jpeg` (a menor diferença de cor nos pixels da peça). A medida da cena é o
  fundo do Pablo: 1672 × 941 no Reino, 1920 × 1080 (o oceano) no Mapa. As posições ficam em `src/dados/posicoes.js`.
  Três casos foram encaixados de outro jeito:
  - **muralha:** pelo muro desenhado no fundo, para cobri-lo;
  - **moinho:** as pás e o corpo vêm no mesmo quadro de 1254 × 1254, então foram encaixados juntos;
  - **chão do Planalto:** pelo buraco do anel de montanhas.
- **A muralha em duas.** A peça `04_muralhas` foi cortada em duas partes, sem mudar pixel: as duas juntas dão a imagem
  original. A parte de trás fica atrás dos prédios; a da frente (as torres dos cantos, as paredes de baixo e o portão)
  fica na frente do Mercado e da Forja, como na imagem principal.
- **A mesma forma de escalar** em todas as peças da mesma tela (Guia de Interface): as peças grandes do Pablo ficam
  menores na tela, e a redução suave mantém os detalhes sem serrilhar.
- **Clique pelo desenho.** O clique e o contorno dourado vêm da transparência de cada peça. Os enfeites (castelo,
  muralhas, estandarte e moinho no Reino; chão do Planalto e montanhas no Mapa) não abrem nada e tapam o que está atrás.
- **Trocar uma peça.** Salve a imagem nova por cima da cópia, com o mesmo nome. Se o desenho mudar de tamanho ou de
  lugar no quadro, a posição em `posicoes.js` precisa ser encaixada de novo.

**Animações** (lentas e discretas; números em `src/dados/animacoesDoCenario.js`):
- **No Reino:** as pás do moinho giram, a luz da lanterna do estandarte pisca de leve, a água do lago e da fonte brilha e
  sai fumaça da Forja e de três chaminés.
- **No Mapa:**
  - a fumaça do vulcão (a peça 12) sobe devagar e nunca passa abaixo da cratera;
  - a lava pulsa e a água da cachoeira do lago e das três cachoeiras da Floresta desce, as duas pela cor da própria peça;
  - neva na Tundra, o vento passa pelas copas da Floresta e o oceano vai e volta.

Tudo desliga pela opção das Configurações e pelo "reduzir movimento" do sistema.

**As nuvens** (as peças `nuvem (1)` a `(3)`) andam devagar para a direita, no tamanho e na altura das nuvens da imagem
principal. Elas aparecem só onde o fundo é céu: em cada coluna, de cima para baixo, até a primeira montanha ou copa.
Assim passam atrás das montanhas e voltam por trás da copa da árvore do canto.

**A Árvore de Habilidades** (`11_arvore`) é outra árvore, diferente da imagem principal. Ela foi encaixada pelo
contorno da árvore de lá: o alto da copa, a base do tronco e o meio. A frente dela (`12_frente_arvore`: cerca, moitas
e pedras) foi encaixada pelo próprio fundo e fica na frente da base.

**Sem animação por enquanto:** bandeiras e árvores (o Pablo anima depois).

## Alterações

| Quando | O quê |
|---|---|
| 12/11/2026 — rodada 32 r3 | Rosto antigo do Tanque explicitamente selecionado por Pablo recuperado pixel a pixel; olhos pequenos verticais substituem os L largos. Mago e roupa do Sacerdote preservados; elmo fechado com pequenos respiros e dobras do Tanque. |
| 12/11/2026 — rodada 32 r2 | Pedido posterior ao teste 64: novas miniaturas 32 × 32, olhos escuros em L sem branco, contornos, Sacerdote refeito a partir da referência original e arco sem corda. Preservar classes individualmente quando Pablo mandar parar de alterá-las. |
| 12/11/2026 | Referência própria aprovada do Pablo para as cinco classes; teste em 64 × 64 autorizado, masculino, sem boca/bochechas, elmo fechado e capuz branco/cruz. Roupas seguem a nova imagem, sem alterar cores do HUD. Lote final de poses estáticas revisado e entregue para avaliação, ainda externo ao jogo. |
| 15/10/2026 | Primeira versão (Mago chibi do protótipo da Seleção, contorno preto). **Rejeitada** pelo Pablo. |
| 21/10/2026 | Seção 7: o Reino e o Mapa em camadas, montados com as peças do Pablo (as geradas no PixelLab e os recortes de 20/10 foram rejeitados e saíram); a muralha em duas partes, a Árvore de Habilidades e a frente dela, as nuvens e as animações (bandeiras e árvores ficam para o Pablo animar). |
| 20/10/2026 | Refeito do zero: telas e cenários pelas imagens do Reino e do mapa (paleta tirada delas); personagens no estilo do Taskbar Hero (chibi pequeno, cabeça grande, olhos grandes, contorno fino marrom, 2 a 3 tons, cores um pouco dessaturadas com detalhes vivos), 48 px de altura, frente, costas e direita (esquerda espelhada), as 5 classes nas cores-assinatura; ordem de aprovação com o teste de estilo primeiro. |

**14/11/2026 — Miniaturas 32 × 32, rodada 4:** Mago recebeu o padrão facial do Tanque e simplificação de tons; Guerreiro recebeu fenda em T no elmo; Sacerdote recebeu ajuste de cabelo/cobertura e cajado afastado; Arqueiro recebeu arco inclinado. Tanque intacto, roupa inferior do Sacerdote preservada. Arquivos em `programacao/arte-original/classes-pablo-32-r4-2026-11-14/finais/`. Ainda em avaliação, sem integração; zero gerações adicionais. Relatório: `testes/2026-11-14-personagens-32-r4.md`.

**14/11/2026 — Miniaturas, rodada 5:** Mago e Tanque da rodada 4 aprovados pelo Pablo e congelados (arquivos idênticos). Corrigidos somente: frente do elmo com leve orientação à direita; Sacerdote com cabeça anterior restaurada, lateral da roupa fechada e cajado dourado junto à mão; arco do Arqueiro aproximado, corpo e rosto intactos. Saída `programacao/arte-original/classes-pablo-32-r5-2026-11-14/finais/`. Três correções ainda em avaliação; sem integração e sem gerações adicionais. Relatório `testes/2026-11-14-personagens-32-r5.md`.

**15/11/2026 — Teste simplificado 16 × 16:** por pedido do Pablo, cinco miniaturas redesenhadas em grade nativa, com 9–12 cores, divisão marcada entre cabeça, tronco, braços e pés e equipamentos de cada classe. Versões 32 × 32 e aprovações anteriores preservadas. Saída `programacao/arte-original/classes-pablo-16-2026-11-15/finais/`; relatório `testes/2026-11-15-personagens-16.md`. Teste em avaliação, sem integração; zero gerações adicionais.

**15/11/2026 — Refinamento 16 × 16 (rodada 2):** cinco variantes redesenhadas com silhuetas, sombras, rostos e equipamentos mais definidos; 10–13 cores por classe. Chapéu curvo, elmo sombreado, emblema no escudo, capuz branco/cruz dourada e arco sem corda. Saída `programacao/arte-original/classes-pablo-16-r2-2026-11-15/finais/`, relatório `testes/2026-11-15-personagens-16-r2.md`. Arquivos 16/32 anteriores preservados. Avaliação pendente; sem integração, custo zero.

**15/11/2026 — Comandos 64 × 64 corrigidos:** matrizes enviadas por Pablo convertidas para cinco comandos completos no mesmo formato pixel-matrix. Pé do Tanque, elmo fechado/dourado vertical, cobertura/cajado do Sacerdote, furos do Arqueiro e contornos externos. Mago preservado em todos os pixels existentes, apenas contorno adicional. Comandos e PNGs conferidos: 4096/4096 pixels iguais por classe. Saída programacao/arte-original/classes-64-comandos-corrigidos-2026-11-15; relatório testes/2026-11-15-comandos-personagens-64.md. Custo zero; sem integração.


**15/11/2026 — Tanque 64 × 64 em avaliação:** perna posterior reconstruída da lateral do tecido azul até a bota, com canela sombreada pela borda do escudo e sola na mesma linha da outra bota. Prévia 8×, PNG e comando novos em `programacao/arte-original/tanque-64-perna-2026-11-15/`. A próxima edição de arte é a cobertura e o cajado do Sacerdote, após a avaliação do Pablo.

**15/11/2026 — Revisão do Sacerdote 64 × 64:** Pablo liberou a revisão do Sacerdote após avaliar a perna do Tanque. A cobertura branca ganhou uma curva baixa com borda dourada legível e o cajado agora tem uma haste dourada contínua junto à mão. Prévia 8×, PNG transparente e JSON em `programacao/arte-original/sacerdote-64-cobertura-cajado-2026-11-15/`. A edição do Sacerdote segue em avaliação. Relatório em `testes/2026-11-15-sacerdote-64.md`.

**15/11/2026 — Sacerdote 64 × 64, revisão 2:** cajado redesenhado com meia-lua aberta, cruz de centro frio e brilho superior dourado. Dobra e friso separam a boina branca do cabelo. Tons quentes corrigem o cinza ao redor dos olhos. Entrega em `programacao/arte-original/sacerdote-64-cajado-meia-lua-2026-11-15/`. [Relatórios e conferências](testes/2026-11-15-sacerdote-64-r2.md).

**15/11/2026 — Sacerdote com cetro antigo:** a pose aprovada por Pablo foi convertida para 64 × 64. O cetro segue o recorte original, com haste fina, meia-lua assimétrica, encaixe na mão, cruz de núcleo azul e brilho superior inclinado. PNG, prévia e comando em `programacao/arte-original/sacerdote-64-cetro-antigo-2026-11-15/`. Relatório: `testes/2026-11-15-sacerdote-64-cetro-antigo.md`.
