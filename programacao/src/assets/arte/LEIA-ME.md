# Arte do jogo

Ponha aqui as imagens da Lista de Arte e Som (documentacao/Lista_de_Arte_e_Som.md), com o nome da lista: por exemplo
`guerreiro-andando-baixo.png`, `lobo-atacando-direita.png`, `grama-1.png`, `item-pocaoDeVida.png`, `fundo-reino.png`.
Pode separar em subpastas (bonecos/, icones/, telas/...). O jogo encontra sozinho o que estiver aqui (src/arte/indice.js):
não precisa mexer em código. Os nomes e tamanhos ficam em src/dados/arte.js.

- Formato: PNG com fundo transparente (WEBP também; JPG só nos fundos de tela).
- O nome não liga para maiúsculas, acentos, hífen, sublinhado nem espaço.
- Animação: os quadros (quadrados, do mesmo tamanho) lado a lado numa imagem só, ou soltos e numerados
  (`guerreiro-andando-baixo-1.png`, `-2`...). Os nomes em inglês do PixelLab também valem (south, north, west, east;
  idle, walk, attack).
- Faltou uma direção ou uma animação: o jogo usa a mais parecida. Sem imagem nenhuma, continua o quadrado.

Para conferir o que foi achado e o que falta: `npm run conferir:arte`.
