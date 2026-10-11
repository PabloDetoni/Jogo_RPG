# Lista de arte e som do beta

Lista do que precisa de arte e de som, com tamanho e formato (TASK-110 e TASK-104), para o grupo gerar em paralelo ao código. Primeira versão em 08/10/2026; nomes exatos dos arquivos desde 10/10/2026, quando o jogo ficou pronto para receber a arte. Enquanto a arte não chega, o jogo usa quadrados coloridos e telas cinza; quando chegar, o jogo troca o desenho sozinho, sem mexer na física (a hitbox continua separada da imagem).

**PROVISÓRIO – substituir pelo do grupo:** os monstros e o Boss da Floresta abaixo são uma proposta até a TASK-012 sair. Os tamanhos são uma proposta até o grupo decidir (TASK-110, passo 1).

## Como entregar

- **Formato:** PNG com fundo transparente (WEBP também serve; JPG só nos fundos de tela). Música em OGG ou MP3; efeitos em OGG ou WAV.
- **Pasta da arte:** `programacao/src/assets/arte/` (pode separar em subpastas: `bonecos/`, `icones/`, `telas/`...). **Pasta do som:** `programacao/src/assets/audio/`. Se preferirem, mandem para o Pablo, que coloca lá.
- **Nome do arquivo:** o das tabelas abaixo. O jogo encontra sozinho o que estiver na pasta, sem mexer em código. Maiúsculas, acentos, hífen, sublinhado e espaço não importam (`Guerreiro_Andando-Baixo.png` vale o mesmo que `guerreiro-andando-baixo.png`).
- **Animações:** uma imagem por animação e direção, com os quadros (quadrados, todos do mesmo tamanho) lado a lado numa linha só, sem espaço entre eles. Exemplo: `guerreiro-andando-baixo.png` com 4 quadros de 48 × 48 é uma imagem de 192 × 48. Também valem os quadros soltos, numerados: `guerreiro-andando-baixo-1.png`, `guerreiro-andando-baixo-2.png`...
- **Direções:** `baixo` (de frente), `cima` (de costas), `esquerda` e `direita`. Os nomes em inglês do PixelLab também valem: `south`, `north`, `west` e `east`; nas animações, `idle`, `walk` e `attack` (por exemplo, `guerreiro-walk-south.png`). O nome da classe ou do monstro vem sempre na frente.
- **O que faltar não trava nada:** sem a esquerda, o jogo usa a direita espelhada (e o contrário); sem cima, usa a de baixo; sem uma animação, usa a parada; sem imagem nenhuma, continua o quadrado colorido. Dá para entregar aos poucos.
- **Conferir:** `npm run conferir:arte` (na pasta `programacao`) lista o que o jogo achou, o que falta e os nomes ou tamanhos estranhos.
- **Licença (som e arte de terceiros):** anotem a origem e a licença de cada arquivo numa linha de `programacao/public/CREDITOS.md`. Só vale licença que permita usar no trabalho.

## Tamanhos (proposta)

O jogo desenha a partida numa tela de 1600 × 900 px, que depois cresce ou encolhe para caber no monitor. A imagem pode vir maior (64 × 64, por exemplo): o jogo desenha no tamanho desta tabela, sem borrar os pixels.

| O quê | Tamanho do quadro | Por quê |
|---|---|---|
| Personagens (5 classes) | 48 × 48 px | A hitbox é 40 × 40: sobra uma margem para a arma e o cabelo |
| Monstros comuns | 48 × 48 px | Hitbox de 34 a 44 px |
| Boss | 128 × 128 px | Bem maior que o grupo |
| Tiles do chão | 32 × 32 px | Cabem 50 × 28 tiles na tela |
| Retrato da classe | 128 × 128 px | Seleção de classe e HUD |
| Ícones (itens, habilidades, atributos) | 32 × 32 px | Mochila, Mercado, Forja, HUD |
| Fundos de tela | 1920 × 1080 px | Telas 16:9; os botões continuam em cima, pelo código |

## 1. Personagens (TASK-112): 5 folhas

Para cada classe (Guerreiro, Mago, Tanque, Sacerdote e Arqueiro), visto de cima, nas 4 direções (baixo, cima, esquerda e direita):

| Animação | Quadros por direção | Observação |
|---|---|---|
| Parado | 2 | Respirando |
| Andando | 4 | |
| Atacando | 3 | Guerreiro: espada; Arqueiro: arco; Mago: cajado; Tanque: escudo; Sacerdote: mãos para cima |
| Desmaiado | 1 | Deitado; uma direção basta |

Arquivos (classe = `guerreiro`, `mago`, `tanque`, `sacerdote` ou `arqueiro`):

- `<classe>-parado-<direção>.png`, `<classe>-andando-<direção>.png` e `<classe>-atacando-<direção>.png`, nas 4 direções (`baixo`, `cima`, `esquerda`, `direita`);
- `<classe>-desmaiado.png` (uma direção só);
- o retrato de 128 × 128, `retrato-<classe>.png` (aparece na Seleção de classe, no HUD da partida e na Preparação).

Exemplo do Guerreiro: `guerreiro-parado-baixo.png`, `guerreiro-andando-direita.png`, `guerreiro-atacando-cima.png`, `guerreiro-desmaiado.png` e `retrato-guerreiro.png`. Na partida, o Líder ganha um anel branco no chão; sem o `desmaiado`, o boneco tomba e escurece.

## 2. Monstros e Boss da Floresta (TASK-113): PROVISÓRIO até a TASK-012

**Atualizado na Fase 3 (09/10):** estes são os mobs que o jogo já tem (provisórios, em `src/dados/balanceamento.js`, `mundo.mobs`); a arte pode seguir esta lista, e o grupo pode trocar os monstros na TASK-012.

| Monstro (no jogo hoje) | Faz o quê | Quadros | Hitbox hoje |
|---|---|---|---|
| Lobo | Corre e morde (corpo a corpo, rápido); pisca antes do bote | Andar (4) e aviso + mordida (3), 4 direções | 34 × 34 |
| Aranha | Fica longe e atira teia; pisca antes do tiro | Andar (4) e mirar + atirar (3), 4 direções | 30 × 30 |
| Javali | Mais forte e lento; aviso longo e investida | Andar (4) e aviso + investida (3), 4 direções | 42 × 42 |
| Cervo (não hostil) | Passeia; só revida se for atacado | Andar (4) e revidar (3), 4 direções | 34 × 34 |
| Boss: Guardião da Floresta (árvore viva) | Pisão em área, investida em linha e leque de espinhos, sempre avisados no chão | Parado (2), andar (4), aviso (2) e golpe (4); 128 × 128 | 92 × 92 |
| Marcas de aviso do Boss | Círculo, faixa e linhas vermelhas no chão antes do golpe | 1 quadro cada (o código estica) | — |

O aviso do golpe precisa ser fácil de ler (piscar, encolher ou brilhar), como os mobs vermelhos de hoje. O jogo também pisca a imagem de branco no aviso e quando o monstro apanha.

Arquivos (monstro = `lobo`, `aranha`, `javali` ou `cervo`):

- `<monstro>-andando-<direção>.png`;
- `<monstro>-aviso-<direção>.png` (o aviso antes do golpe; sem ele, o jogo usa o ataque; o cervo não tem);
- `<monstro>-atacando-<direção>.png` (a mordida, o tiro, a investida);
- Boss: `guardiao-parado-<direção>.png`, `guardiao-andando-<direção>.png`, `guardiao-aviso-<direção>.png` e `guardiao-atacando-<direção>.png`;
- marcas do Boss: `aviso-circulo.png` (pisão), `aviso-faixa.png` (investida) e `aviso-linha.png` (espinhos).

Um monstro com uma imagem só (`lobo.png`) também serve: ela vale para tudo.

## 3. Floresta e Mapa (TASK-114)

- **Tiles de 32 × 32:**
  - grama em 3 variações: `grama-1.png`, `grama-2.png` e `grama-3.png` (o jogo sorteia entre elas; a primeira aparece mais);
  - flores (decoração por cima da grama, com fundo transparente): `flores.png`;
  - a mata fechada em volta das regiões (a parede): `mata.png`;
  - terra, caminho, borda grama/caminho e água: o mapa provisório ainda não tem caminho nem lago; entram quando o layout do grupo pedir (TASK-013).
- **Obstáculos (com sombra):**
  - pedras pequena (32 × 32), média (64 × 48) e grande (96 × 64): `pedra-pequena.png`, `pedra-media.png` e `pedra-grande.png` (o jogo escolhe pelo tamanho da pedra no mapa);
  - árvore (64 × 96): `arvore.png`, para as soltas e as da beira da mata. O tronco fica embaixo e a copa em cima: quem passa atrás some atrás da copa, que fica transparente na frente do Líder;
  - arbusto (48 × 32): `arbusto.png` (misturado às árvores na beira da mata);
  - tronco caído (96 × 32): `tronco.png` (no lugar de algumas pedras compridas).
- **Pedra de Retorno:** 32 × 48, com brilho azul: `pedra-de-retorno.png` (aparece no HUD durante o retorno com Q e a fuga com F).
- **Regiões (fácil, média, difícil, muito difícil):** a mesma grama com um tom diferente por região, para o jogador perceber a mudança. O jogo tinge a grama sozinho. Se preferirem desenhar uma grama própria para cada região, os nomes são `grama-zonaSegura.png`, `grama-facil.png`, `grama-media.png`, `grama-dificil.png` e `grama-dominioDoBoss.png` (essas ficam sem tinta).
- **Mapa em ovo:** 1920 × 1080, com o Planalto no centro e a Floresta, o Deserto, a Tundra e o Vulcânico em volta: `fundo-mapa.png`. Os 3 biomas fora do beta aparecem claramente bloqueados (cinza ou com neblina). Já existe uma versão em `documentacao/Telas/MapaRPG.jpeg`; os botões do Mapa continuam por cima, pelo código.

## 4. Telas (TASK-111 e TASK-116)

| Tela | Arquivo sugerido | Observação |
|---|---|---|
| Tela inicial e Narrativa | `fundo-inicio.png` | Com o nome do jogo (quando o grupo decidir o nome) |
| Login, criar conta, senha e apelido | `fundo-acesso.png` | |
| Seleção de classe | `fundo-selecao.png` | O pentágono e os botões ficam por cima, pelo código |
| Reino | `fundo-reino.png` | Já existe em `documentacao/Telas/ReinoRPG.png`. Falta corrigir a muralha e tirar da imagem os nomes desenhados (os botões são do código) |
| Mapa | `fundo-mapa.png` | O mapa em ovo (seção 3) |
| Cutscene de derrota | `derrota-1.png` a `derrota-3.png` | 3 imagens em sequência (2,2 s cada; a última fica): o grupo caindo, a Pedra de Retorno brilhando, o Reino |
| Resumo | `fundo-resumo.png` | Opcional |

Qualquer outra tela também pode ter fundo: `fundo-` seguido do nome da tela no código (`fundo-mercado.png`, `fundo-guilda.png`, `fundo-forja.png`...). Sem a imagem, a tela continua cinza. Com ela, o título da tela ganha uma sombra, para dar para ler em cima da imagem.

## 5. Ícones (TASK-116)

- **Atributos:** 5 ícones e o ouro: `atributo-vitalidade.png`, `atributo-forca.png`, `atributo-sabedoria.png`, `atributo-inteligencia.png`, `atributo-agilidade.png` e `ouro.png` (nas Árvores, no HUD do Reino e no Mercado).
- **Habilidades:** um por habilidade, `habilidade-<id>.png` (nas Árvores e nas teclas 1 a 3 do HUD). As 20 do beta provisório (até a TASK-010) são `giro`, `golpePesado`, `furia`, `peleGrossa`, `meteoro`, `descargaEletrica`, `explosaoDeFogo`, `menteClara`, `provocacao`, `golpeDeEscudo`, `muralha`, `peleDeFerro`, `ressurreicao`, `curaEmArea`, `bencao`, `fe`, `tiroPerfurante`, `chuvaDeFlechas`, `flechaCerteira` e `olhoDeAguia` (por exemplo, `habilidade-meteoro.png`).
- **Itens:** um por item do catálogo. O jogo já tem 48 (provisórios, `src/dados/itens.js`; a lista completa, com o tipo e a raridade, está no Balanceamento, seção "Reino com dados"): recursos (cogumelo, erva medicinal, madeira, trigo, peixe), partes de monstros e materiais (pele de lobo, teia de aranha, presa de javali, chifre de cervo, casca antiga, minério de ferro, cristal, pérola do lago), poções e aceleradores (vida, vida grande, mana, tônico ligeiro, elixir do foco), o pergaminho de redefinição, uma arma por classe em duas versões, dois escudos, duas linhas de armadura (couro e ferro), a Coroa de raízes (especial do Boss) e o equipamento de teste. Tamanho sugerido: 32 × 32 (o mesmo desenho serve para o item no chão, a Mochila, o Mercado, a Forja, a Preparação e a mochila da partida). O nome é `item-<id>.png`, com o id do catálogo: `cogumelo`, `ervaMedicinal`, `madeira`, `trigo`, `peixe`, `cristal`, `perolaDoLago`, `peleDeLobo`, `teiaDeAranha`, `presaDeJavali`, `chifreDeCervo`, `cascaAntiga`, `minerioDeFerro`, `pocaoDeVida`, `pocaoGrandeDeVida`, `pocaoDeMana`, `tonicoLigeiro`, `elixirDoFoco`, `pergaminhoDeRedefinicao`, `espadaCurta`, `laminaDePresa`, `arcoDeCaca`, `arcoDeTeia`, `cajadoDeCarvalho`, `cajadoDeChifre`, `marteloDeGuerra`, `cetroDaAurora`, `cetroDeErvas`, `escudoDeMadeira`, `escudoDeCasca`, `capuzDeCouro`, `coleteDeCouro`, `calcasDeCouro`, `botasDeCouro`, `luvasDeCouro`, `elmoDeFerro`, `peitoralDeFerro`, `grevasDeFerro`, `botasDeVento`, `manoplasDeFerro` e `coroaDeRaizes` (por exemplo, `item-pocaoDeVida.png`). O equipamento de teste não precisa de ícone.

## Passo a passo para gerar no PixelLab

O jogo já está pronto para receber a arte: é só gerar, salvar com o nome certo na pasta e conferir. A ordem sugerida é a do que mais aparece na tela.

1. **Personagens:** para cada classe, crie o personagem visto de cima, 48 × 48 (ou 64 × 64), nas 4 direções.
2. **Animações:** gere parado (2 quadros), andando (4) e atacando (3) em cada direção, e o desmaiado (1, uma direção só).
3. **Baixar:** baixe cada animação como uma faixa de quadros numa linha só (ou os quadros soltos).
4. **Salvar:** salve em `programacao/src/assets/arte/` com o nome da tabela, com a classe na frente: `guerreiro-andando-baixo.png` ou, em inglês, `guerreiro-walk-south.png`.
5. **Conferir:** rode `npm run conferir:arte` na pasta `programacao` e veja o que foi achado e o que falta; depois, `npm run dev` para ver no jogo.
6. **Depois:** os monstros e o Boss (seção 2), os tiles e as árvores da Floresta (seção 3), os ícones dos itens (seção 5), os retratos e os fundos de tela (seções 1 e 4).

Não precisa entregar tudo de uma vez: o que faltar continua como hoje.

## 6. Som (TASK-104)

| Tipo | O quê | Arquivo sugerido |
|---|---|---|
| Música | Tela inicial e Reino (calma) | `musica-reino.ogg` |
| Música | Partida na Floresta (aventura, em loop) | `musica-floresta.ogg` |
| Música | Combate com o Boss (opcional) | `musica-boss.ogg` |
| Música | Derrota (curta) | `musica-derrota.ogg` |
| Efeito | Ataque de cada classe (espada, flecha, magia, escudo, cura) | `ataque-guerreiro.ogg` e assim por diante (5) |
| Efeito | Acerto, crítico e bloqueio | `acerto.ogg`, `critico.ogg`, `bloqueio.ogg` |
| Efeito | Esquiva | `esquiva.ogg` |
| Efeito | Desmaio, levantar e perdido (Pedra de Retorno) | `desmaio.ogg`, `levantar.ogg`, `perdido.ogg` |
| Efeito | Subir de nível | `nivel.ogg` |
| Efeito | Moeda (ouro ganho) e clique de botão | `moeda.ogg`, `clique.ogg` |
| Efeito | Fuga começando | `fuga.ogg` |

**Onde pôr os sons (pronto desde a Fase 4, TASK-105):** salve cada arquivo em `programacao/src/assets/audio/`, com o nome desta tabela (`.ogg`, `.mp3` ou `.wav`). O jogo encontra sozinho o que estiver lá, sem mexer em código; os nomes ficam em `programacao/src/dados/sons.js`.

- **Sem arquivo:** cada efeito toca um bipe curto provisório, e a música fica em silêncio.
- **Música do Boss (opcional):** sem ela, continua a da Floresta.
- **Configurações:** Música e Som ligam e desligam cada parte, e a tecla M silencia tudo.
- **Primeiro som:** o áudio começa no primeiro clique ou tecla (os navegadores bloqueiam som automático).
- **Ataque básico:** na partida, só o do Líder toca som (o dos aliados encheria de barulho).
