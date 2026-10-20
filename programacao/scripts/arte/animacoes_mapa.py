# Peças pequenas das animações do Mapa, recortadas da imagem do mapa (nada gerado): a lava (pulsa devagar) e as
# cachoeiras (a água corre). A fumaça do vulcão, a neve da Tundra, as ondas e o vento nas árvores são desenhados em código.
import json, os
from PIL import Image, ImageFilter

from caminhos import ORIGINAL_MAPA, TRABALHO
AQUI = TRABALHO
MAPA = Image.open(ORIGINAL_MAPA).convert('RGB')
SAIDA = os.path.join(AQUI, 'mapa')
pos = json.load(open(os.path.join(SAIDA, 'posicoes.json')))
dados = {}


def recortar(nome, caixa, regra, dentro=None):
    corte = MAPA.crop(caixa)
    alfa = Image.new('L', corte.size, 0)
    a, c = alfa.load(), corte.load()
    for y in range(corte.size[1]):
        for x in range(corte.size[0]):
            if regra(*c[x, y]):
                a[x, y] = 255
    if dentro is not None:
        from PIL import ImageChops
        alfa = ImageChops.multiply(alfa, dentro)
    alfa = alfa.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(0.6))
    peca = corte.convert('RGBA')
    peca.putalpha(alfa)
    peca.save(os.path.join(SAIDA, f'{nome}.png'), optimize=True)
    return {'x': caixa[0], 'y': caixa[1], 'largura': caixa[2] - caixa[0], 'altura': caixa[3] - caixa[1]}


# A lava: os rios laranja e vermelhos do Vulcânico (dentro da peça do bioma)
v = pos['mapa-bioma-vulcanico']
caixa = (v['x'], v['y'], v['x'] + v['largura'], v['y'] + v['altura'])
dentro = Image.open(os.path.join(SAIDA, 'mapa-bioma-vulcanico.png')).getchannel('A')
dados['lava'] = recortar('mapa-lava', caixa, lambda r, g, b: r > 190 and g < 190 and b < 110 and r > g + 40, dentro)

# As cachoeiras: a água clara que cai (a do Planalto e as três da costa da Floresta)
agua_clara = lambda r, g, b: b > 200 and g > 150 and r > 60
dados['cachoeiras'] = [
    recortar(f'mapa-cachoeira-{i}', c, agua_clara)
    for i, c in enumerate([(724, 248, 750, 300), (195, 580, 223, 646), (373, 652, 398, 720), (635, 640, 667, 698)], start=1)
]
dados['cratera'] = {'x': 1140, 'y': 58}
json.dump(dados, open(os.path.join(SAIDA, 'animacoes.json'), 'w'), indent=1)
print(dados)
