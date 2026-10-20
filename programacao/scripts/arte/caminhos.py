# Onde ficam as coisas das camadas (Reino e Mapa, 20/10/2026). As imagens originais do Pablo e as edições do PixelLab
# ficam em programacao/arte-original/ (fora do git; cópia no computador do Pablo); o trabalho intermediário em
# arte-original/camadas/trabalho/; o resultado vai para src/assets/arte/ (reino/, mapa/ e as pastas animacao/).
import os

PROGRAMACAO = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
ORIGINAL_REINO = os.path.join(PROGRAMACAO, 'arte-original', 'fundo-reino-original.png')
ORIGINAL_MAPA = os.path.join(PROGRAMACAO, 'arte-original', 'fundo-mapa-original.jpg')
EDITADOS = os.path.join(PROGRAMACAO, 'arte-original', 'camadas')  # os pedaços editados no PixelLab (limpo-*.png)
TRABALHO = os.path.join(EDITADOS, 'trabalho')
ARTE = os.path.join(PROGRAMACAO, 'src', 'assets', 'arte')
os.makedirs(TRABALHO, exist_ok=True)
