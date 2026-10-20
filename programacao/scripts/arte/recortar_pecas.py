# Recorta as peças do Reino da imagem original: a transparência vem da diferença entre a imagem (com a placa
# apagada pelo PixelLab, onde ela cobria o prédio) e o fundo limpo. Onde os dois são iguais, a peça é transparente.
# Saída: pecas/reino-<nome>.png (RGBA, no tamanho original) e pecas/posicoes.json (x, y, largura, altura na imagem).
import json, os
from PIL import Image, ImageChops, ImageDraw, ImageFilter

from caminhos import ORIGINAL_REINO, EDITADOS, TRABALHO
AQUI = TRABALHO
ORIGINAL = Image.open(ORIGINAL_REINO).convert('RGB')
LIMPO = Image.open(os.path.join(AQUI, 'fundo-limpo.png')).convert('RGB')

# nome: (onde pode ter peça, sementes (o miolo do objeto), placa a apagar com o pedaço editado: (arquivo, caixa do corte, caixa da placa))
PECAS = {
    'castelo': ((842, 62, 1160, 330), [(885, 100, 1125, 312)], None),
    'guilda': ((700, 282, 976, 508), [(722, 330, 948, 492), (812, 296, 862, 352)], ('limpo-placa-guilda.png', (692, 280, 980, 504), (770, 362, 902, 412))),
    'mercado': ((546, 520, 780, 658), [(568, 548, 752, 632)], None),
    'forja': ((1100, 486, 1340, 666), [(1128, 512, 1318, 640)], ('limpo-placa-forja.png', (1100, 480, 1340, 656), (1176, 520, 1300, 618))),
    # A Mochila e a Árvore terminam na linha de cima da placa (a placa cobria a base delas na imagem)
    'mochila': ((8, 584, 244, 751), [(42, 612, 214, 749)], None),
    'arvores': ((1406, 498, 1670, 771), [(1450, 530, 1670, 670), (1548, 650, 1612, 769)], None),
}

# Forma de onde a peça pode ter pixel (dentro da caixa): tira o que está na frente dela (a muralha na frente da Forja)
LIMITES = {
    'forja': [(1100, 486), (1332, 486), (1332, 604), (1190, 656), (1100, 668)],
}


def retangulos(tamanho, lista, origem):
    m = Image.new('L', tamanho, 0)
    d = ImageDraw.Draw(m)
    for x0, y0, x1, y1 in lista:
        d.rectangle((x0 - origem[0], y0 - origem[1], x1 - origem[0], y1 - origem[1]), fill=255)
    return m


def recortar(nome, alto=58, baixo=34):
    caixa, sementes, placa = PECAS[nome]
    fonte = ORIGINAL.copy()
    if placa:
        arquivo, corte, caixa_placa = placa
        editado = Image.open(os.path.join(EDITADOS, arquivo)).convert('RGB').resize((corte[2] - corte[0], corte[3] - corte[1]), Image.LANCZOS)
        m = retangulos(editado.size, [caixa_placa], corte[:2]).filter(ImageFilter.GaussianBlur(2))
        fonte.paste(editado, corte[:2], m)
    a = fonte.crop(caixa)
    b = LIMPO.crop(caixa)
    dif = ImageChops.difference(a, b).convert('L').filter(ImageFilter.GaussianBlur(1.5))
    sem = retangulos(a.size, sementes, caixa[:2])
    if nome in LIMITES:
        limite = Image.new('L', a.size, 0)
        ImageDraw.Draw(limite).polygon([(x - caixa[0], y - caixa[1]) for x, y in LIMITES[nome]], fill=255)
        dif = ImageChops.multiply(dif, limite)
    m = ImageChops.multiply(dif.point(lambda v: 255 if v > alto else 0), sem)
    m = m.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))
    pode = dif.point(lambda v: 255 if v > baixo else 0)
    for _ in range(80):
        maior = ImageChops.lighter(m, ImageChops.multiply(m.filter(ImageFilter.MaxFilter(3)), pode))
        if ImageChops.difference(maior, m).getbbox() is None:
            break
        m = maior
    m = m.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))
    fundo = m.copy()
    ImageDraw.floodfill(fundo, (0, 0), 128)
    m = ImageChops.lighter(m, fundo.point(lambda v: 255 if v == 0 else 0))
    alfa = m.filter(ImageFilter.GaussianBlur(0.7))
    peca = a.convert('RGBA')
    peca.putalpha(alfa)
    x0, y0, x1, y1 = alfa.point(lambda v: 255 if v > 10 else 0).getbbox()
    peca = peca.crop((x0, y0, x1, y1))
    os.makedirs(os.path.join(AQUI, 'pecas'), exist_ok=True)
    peca.save(os.path.join(AQUI, 'pecas', f'reino-{nome}.png'), optimize=True)
    return {'x': caixa[0] + x0, 'y': caixa[1] + y0, 'largura': x1 - x0, 'altura': y1 - y0}


if __name__ == '__main__':
    import sys
    nomes = sys.argv[1:] or list(PECAS)
    caminho = os.path.join(AQUI, 'pecas', 'posicoes.json')
    posicoes = json.load(open(caminho)) if os.path.exists(caminho) else {}
    for nome in nomes:
        posicoes[nome] = recortar(nome)
        print(nome, posicoes[nome])
    json.dump(posicoes, open(caminho, 'w'), indent=1)
