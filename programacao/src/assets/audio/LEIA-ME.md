# Sons do jogo

Ponha aqui os arquivos de som da Lista de Arte e Som (documentacao/Lista_de_Arte_e_Som.md), com o nome da lista:
por exemplo `musica-reino.ogg`, `musica-floresta.ogg`, `acerto.ogg`, `ataque-guerreiro.ogg`.
Servem `.ogg`, `.mp3` e `.wav`. O jogo encontra sozinho os arquivos que estiverem aqui (src/audio/arquivos.js):
não precisa mexer em código. Os nomes de todos os sons ficam em src/dados/sons.js.
Enquanto um efeito não tiver arquivo, toca um bipe curto provisório; música sem arquivo fica em silêncio.
