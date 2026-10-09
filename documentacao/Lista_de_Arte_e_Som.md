# Lista de arte e som do beta

Lista do que precisa de arte e de som, com tamanho e formato (TASK-110 e TASK-104), para o grupo gerar em paralelo ao código. Primeira versão em 08/10/2026. Enquanto a arte não chega, o jogo usa quadrados coloridos e telas cinza; quando chegar, o código troca o desenho sem mexer na física (a hitbox continua separada da imagem).

**PROVISÓRIO – substituir pelo do grupo:** os monstros e o Boss da Floresta abaixo são uma proposta até a TASK-012 sair. Os tamanhos são uma proposta até o grupo decidir (TASK-110, passo 1).

## Como entregar

- **Formato:** PNG com fundo transparente. Música em OGG ou MP3; efeitos em OGG ou WAV.
- **Pasta:** coloquem os arquivos em `programacao/public/arte/` e `programacao/public/som/`, com os nomes sugeridos nas tabelas. Se preferirem, mandem para o Pablo, que coloca lá.
- **Folhas de sprites:** uma linha por animação; todos os quadros do mesmo tamanho, lado a lado, sem espaço entre eles.
- **Licença (som e arte de terceiros):** anotem a origem e a licença de cada arquivo numa linha de `programacao/public/CREDITOS.md`. Só vale licença que permita usar no trabalho.

## Tamanhos (proposta)

O jogo desenha a partida numa tela de 1600 × 900 px, que depois cresce ou encolhe para caber no monitor.

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

Arquivos: `guerreiro.png`, `mago.png`, `tanque.png`, `sacerdote.png` e `arqueiro.png`. Também um retrato de 128 × 128 de cada classe: `retrato-guerreiro.png` e assim por diante.

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

O aviso do golpe precisa ser fácil de ler (piscar, encolher ou brilhar), como os mobs vermelhos de hoje.

## 3. Floresta e Mapa (TASK-114)

- **Tiles de 32 × 32:**
  - grama (3 variações), terra, caminho e borda grama/caminho;
  - água (lago, com 1 tile de borda) e flores (decoração).
- **Obstáculos (com sombra):**
  - pedras pequena (32 × 32), média (64 × 48) e grande (96 × 64);
  - árvore (64 × 96), arbusto (48 × 32) e tronco caído (96 × 32).
- **Pedra de Retorno:** 32 × 48, com brilho azul.
- **Regiões (fácil, média, difícil, muito difícil):** a mesma grama com um tom diferente por região, para o jogador perceber a mudança.
- **Mapa em ovo:** 1920 × 1080, com o Planalto no centro e a Floresta, o Deserto, a Tundra e o Vulcânico em volta. Os 3 biomas fora do beta aparecem claramente bloqueados (cinza ou com neblina). Já existe uma versão em `documentacao/Telas/MapaRPG.jpeg`.

## 4. Telas (TASK-111 e TASK-116)

| Tela | Arquivo sugerido | Observação |
|---|---|---|
| Tela inicial | `fundo-inicio.png` | Com o nome do jogo (quando o grupo decidir o nome) |
| Login e criar conta | `fundo-acesso.png` | |
| Seleção de classe | `fundo-selecao.png` | O pentágono e os botões ficam por cima, pelo código |
| Reino | `fundo-reino.png` | Já existe em `documentacao/Telas/ReinoRPG.png`. Falta corrigir a muralha e tirar da imagem os nomes desenhados (os botões são do código) |
| Cutscene de derrota | `derrota-1.png` a `derrota-3.png` | 3 imagens em sequência: o grupo caindo, a Pedra de Retorno brilhando, o Reino |
| Resumo | `fundo-resumo.png` | Opcional |

## 5. Ícones (TASK-116)

- **Atributos:** 5 ícones (Vitalidade, Força, Sabedoria, Inteligência, Agilidade) e o ouro.
- **Habilidades:** um por habilidade, quando a TASK-010 sair. São até 3 por classe, cerca de 15.
- **Itens:** um por item do catálogo, quando a TASK-014 sair (estimativa: 30 a 40). Os que o jogo já tem (provisórios, `src/dados/itens.js`): cogumelo, erva medicinal, madeira, pele de lobo, teia de aranha, presa de javali, chifre de cervo, casca antiga, poção de vida, Coroa de raízes (especial do Boss) e o equipamento de teste (capacete, peitoral, calças, botas, manoplas, espada e escudo). Tamanho sugerido: 32 × 32 (o mesmo desenho serve para o item no chão e para a Mochila).

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

Até os sons chegarem, o código deixa o sistema de áudio pronto, com Música, Som e o mudo (tecla M) funcionando.
