# Camadas do Reino e do Mapa (20/10/2026)

Os scripts que fizeram as peças de `src/assets/arte/reino/` e `src/assets/arte/mapa/` a partir das imagens do Pablo.
Precisam do Python 3 com o Pillow (`pip install pillow`) e das imagens em `programacao/arte-original/` (fora do git).
Rodar dentro desta pasta, nesta ordem:

1. `python montar_fundo.py`: o fundo limpo do Reino (a imagem original com cada área apagada trocada pelo pedaço
   editado no PixelLab, `arte-original/camadas/limpo-*.png`; só a área apagada muda).
2. `python recortar_pecas.py`: as peças do Reino (castelo, Guilda, Mercado, Forja, Mochila, Árvore), recortadas da
   imagem original; a transparência vem da diferença com o fundo limpo.
3. `python animacoes_reino.py`: o céu sem nuvens (as nuvens viram peças), os estandartes, as flâmulas, as pás do moinho,
   a copa da árvore do canto e as máscaras do céu e da água; também a versão final do fundo (`reino-fundo`).
4. `python montar_mapa.py` e `python animacoes_mapa.py`: os biomas, o Planalto e os lugares dele, recortados da imagem do
   mapa, o oceano de fundo, a lava e as cachoeiras.
5. `python exportar.py`: copia tudo para `src/assets/arte/` (Reino sem perda; Mapa em WEBP de alta qualidade).

As posições impressas por eles vão para `src/dados/posicoes.js` (`reino` e `mapa`, em pixels da imagem original).
Para trocar UMA peça, não precisa rodar nada: salve a imagem nova com o mesmo nome e o mesmo tamanho.
