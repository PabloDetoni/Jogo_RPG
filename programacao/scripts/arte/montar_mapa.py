# Mapa em camadas: recorta da imagem do mapa do Pablo os 4 biomas, o Planalto (base, sem clique) e os 4 lugares do
# Planalto (castelo, fazenda, mina, lago), cada um com transparência e no lugar exato; e monta o oceano de fundo.
# Nada é gerado: só recorte (a imagem continua com a mesma qualidade).
# A terra é o que não tem a cor do oceano; as divisas entre os biomas são as linhas abaixo (em pixels da imagem).
import json, os, random
from PIL import Image, ImageChops, ImageDraw, ImageFilter

from caminhos import ORIGINAL_MAPA, TRABALHO
AQUI = TRABALHO
MAPA = Image.open(ORIGINAL_MAPA).convert('RGB')
L, A = MAPA.size
SAIDA = os.path.join(AQUI, 'mapa')
os.makedirs(SAIDA, exist_ok=True)

# Divisas (linhas compartilhadas entre os vizinhos)
TUNDRA_PLANALTO = [(500, 372), (522, 345), (560, 318), (600, 284), (640, 250), (680, 216), (722, 192)]
VULCANICO_PLANALTO = [(722, 192), (760, 214), (820, 236), (880, 270), (930, 310), (975, 360), (1000, 410), (1010, 432)]
DESERTO_PLANALTO = [(1010, 432), (960, 462), (900, 492), (850, 530), (800, 570), (778, 602)]
FLORESTA_PLANALTO = [(778, 602), (740, 556), (690, 520), (640, 490), (590, 452), (540, 410), (500, 372)]
TUNDRA_FLORESTA = [(0, 396), (230, 396), (330, 386), (420, 380), (500, 372)]
VULCANICO_DESERTO = [(1010, 432), (1080, 426), (1150, 422), (1230, 416), (1270, 402), (1320, 392), (L, 402)]
DESERTO_FLORESTA = [(778, 602), (792, 650), (792, A)]

BIOMAS = {
    'tundra': [(0, 0), (722, 0)] + TUNDRA_PLANALTO[::-1] + TUNDRA_FLORESTA[::-1],
    'floresta': TUNDRA_FLORESTA + FLORESTA_PLANALTO[::-1] + DESERTO_FLORESTA[1:] + [(0, A)],
    'vulcanico': [(722, 0), (L, 0)] + VULCANICO_DESERTO[::-1] + VULCANICO_PLANALTO[::-1],
    'deserto': VULCANICO_DESERTO + [(L, A)] + DESERTO_FLORESTA[::-1] + DESERTO_PLANALTO[::-1][1:],
}
PLANALTO = TUNDRA_PLANALTO + VULCANICO_PLANALTO[1:] + DESERTO_PLANALTO[1:] + FLORESTA_PLANALTO[1:]

# Os lugares do Planalto: a área onde cada um está e o que é dele (pela cor)
LUGARES = {
    'lago': ([(648, 262), (700, 240), (722, 246), (752, 246), (790, 268), (812, 300), (800, 330), (760, 340), (700, 338), (650, 318)], 'agua'),
    'castelo': ([(696, 330), (712, 312), (760, 312), (786, 330), (788, 410), (696, 410)], 'construcao'),
    'fazenda': ([(566, 362), (600, 336), (650, 338), (684, 352), (684, 400), (640, 412), (580, 408), (562, 390)], 'construcao'),
    'mina': ([(806, 352), (836, 334), (880, 338), (902, 360), (902, 412), (860, 420), (812, 404)], 'construcao'),
}


def poligono(pontos, tamanho=(L, A)):
    m = Image.new('L', tamanho, 0)
    ImageDraw.Draw(m).polygon(pontos, fill=255)
    return m


def mascara_por_cor(regra):
    m = Image.new('L', (L, A), 0)
    dentro, fora = m.load(), MAPA.load()
    for y in range(A):
        for x in range(L):
            if regra(*fora[x, y]):
                dentro[x, y] = 255
    return m


def sem_buracos(m):
    fundo = m.copy()
    ImageDraw.floodfill(fundo, (0, 0), 128)
    return ImageChops.lighter(m, fundo.point(lambda v: 255 if v == 0 else 0))


oceano = mascara_por_cor(lambda r, g, b: r < 26 and g < 118 and b > g + 38)
# os brilhos das ondas são pontinhos: tira o que é pequeno (abre e fecha)
oceano = oceano.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))
# Só é mar o azul-escuro ligado ao mar aberto (a borda da imagem): as sombras azuis das montanhas da Tundra são terra.
# Antes, a terra fecha os corredores estreitos (para a sombra não vazar até o mar por uma fresta).
terra_fechada = ImageChops.invert(oceano).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))
aberto = ImageChops.invert(terra_fechada)
ImageDraw.floodfill(aberto, (0, 0), 128)
oceano = ImageChops.multiply(oceano, aberto.point(lambda v: 255 if v == 128 else 0))
terra = ImageChops.invert(oceano).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))
terra.save(os.path.join(AQUI, 'mapa-terra.png'))

posicoes = {}


def salvar(nome, alfa, imagem=MAPA):
    alfa = alfa.filter(ImageFilter.GaussianBlur(0.6))
    caixa = alfa.point(lambda v: 255 if v > 10 else 0).getbbox()
    peca = imagem.convert('RGBA')
    peca.putalpha(alfa)
    peca = peca.crop(caixa)
    peca.save(os.path.join(SAIDA, f'{nome}.png'), optimize=True)
    posicoes[nome] = {'x': caixa[0], 'y': caixa[1], 'largura': caixa[2] - caixa[0], 'altura': caixa[3] - caixa[1]}
    print(nome, posicoes[nome])


# Cada região passa 3 px da divisa (as vizinhas se sobrepõem um pouco): sem fresta para o oceano aparecer entre elas
sobra = lambda m: m.filter(ImageFilter.MaxFilter(7))
for nome, pontos in BIOMAS.items():
    salvar(f'mapa-bioma-{nome}', ImageChops.multiply(sobra(poligono(pontos)), terra))
salvar('mapa-planalto', ImageChops.multiply(sobra(poligono(PLANALTO)), terra))

verde = lambda r, g, b: g > r + 12 and g > b + 6
agua = lambda r, g, b: (b > 170 and g > 110 and r < 130) or (r > 170 and g > 200 and b > 220)
for nome, (pontos, tipo) in LUGARES.items():
    if tipo == 'agua':
        cor = mascara_por_cor(agua)
        # o castelo fica na frente do lago: as torres azuis dele não são água
        castelo = ImageChops.multiply(mascara_por_cor(lambda r, g, b: not verde(r, g, b) and not agua(r, g, b)), poligono(LUGARES['castelo'][0]))
        cor = ImageChops.subtract(cor, castelo.filter(ImageFilter.MaxFilter(3)))
    else:
        cor = mascara_por_cor(lambda r, g, b: not verde(r, g, b) and not agua(r, g, b))
    m = ImageChops.multiply(cor, poligono(pontos))
    m = m.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))  # junta as partes
    m = m.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))  # tira os pontinhos
    m = ImageChops.multiply(sem_buracos(m), poligono(pontos))
    salvar(f'mapa-{nome}', m)

# Oceano de fundo: a imagem com a terra trocada por pedaços de mar (sem ilhas grandes), para nada ficar vazio atrás
random.seed(7)
mar = MAPA.crop((8, 712, 128, 820))
fundo = MAPA.copy()
lado = mar.size
for y in range(0, A, lado[1]):
    for x in range(0, L, lado[0]):
        fundo.paste(mar.transpose(random.choice([Image.Transpose.FLIP_LEFT_RIGHT, Image.Transpose.ROTATE_180, Image.Transpose.FLIP_TOP_BOTTOM])) if random.random() < 0.5 else mar, (x, y))
fundo.paste(MAPA, (0, 0), ImageChops.invert(terra.filter(ImageFilter.MaxFilter(5))).filter(ImageFilter.GaussianBlur(2)))
fundo.save(os.path.join(SAIDA, 'mapa-oceano.png'))
posicoes['mapa-oceano'] = {'x': 0, 'y': 0, 'largura': L, 'altura': A}
json.dump(posicoes, open(os.path.join(SAIDA, 'posicoes.json'), 'w'), indent=1)
