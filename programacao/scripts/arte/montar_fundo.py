# Monta o fundo limpo do Reino: a imagem original com cada área apagada trocada pelo pedaço editado no PixelLab
# (ampliado de volta ao tamanho original). Só a área da máscara muda; o resto fica idêntico ao original.
# A máscara de cada área é a diferença entre o original e o editado (onde o objeto sumiu), presa dentro das formas
# dadas à mão (o objeto e a placa dele), com as bordas suavizadas.
import os, sys
from PIL import Image, ImageChops, ImageDraw, ImageFilter

from caminhos import ORIGINAL_REINO as ORIGINAL, EDITADOS, TRABALHO
AQUI = TRABALHO

# nome: (caixa do corte, formas onde pode trocar [('ret'|'elipse', x0, y0, x1, y1)], formas que trocam sempre)
AREAS = {
    'mochila': ((0, 556, 304, 844), [('ret', 8, 586, 242, 780), ('ret', 44, 742, 274, 822)], [('ret', 52, 750, 266, 814)]),
    'arvore': ((1366, 480, 1670, 880), [('elipse', 1410, 500, 1700, 705), ('ret', 1495, 630, 1670, 785), ('ret', 1414, 766, 1664, 854)], [('ret', 1422, 772, 1656, 848)]),
    'forja': ((1080, 464, 1368, 688), [('ret', 1104, 492, 1334, 664)], [('ret', 1176, 568, 1298, 616), ('ret', 1198, 524, 1266, 580)]),
    'mercado': ((400, 488, 792, 680), [('ret', 545, 522, 775, 655), ('ret', 420, 498, 560, 598)], [('ret', 424, 550, 556, 596), ('ret', 452, 502, 528, 560)]),
    'guilda': ((640, 264, 1032, 544), [('ret', 700, 284, 972, 505)], [('ret', 772, 364, 900, 410)]),
    'castelo': ((776, 40, 1224, 360), [('ret', 845, 66, 1155, 325)], []),
    'salao': ((0, 0, 320, 168), [('ret', 10, 8, 274, 138)], [('ret', 14, 76, 270, 134), ('ret', 74, 10, 208, 84)]),
    'config': ((1368, 0, 1670, 176), [('ret', 1434, 8, 1666, 142)], [('ret', 1438, 72, 1662, 138), ('ret', 1494, 10, 1600, 80)]),
    'jogar': ((600, 720, 1072, 904), [('ret', 636, 738, 1036, 878)], [('ret', 642, 776, 1030, 872), ('ret', 800, 742, 866, 804)]),
    'moinho': ((224, 264, 384, 408), [('ret', 250, 280, 350, 380)], []),
}


def formas(tamanho, lista, deslocamento):
    m = Image.new('L', tamanho, 0)
    d = ImageDraw.Draw(m)
    dx, dy = deslocamento
    for tipo, x0, y0, x1, y1 in lista:
        caixa = (x0 - dx, y0 - dy, x1 - dx, y1 - dy)
        (d.ellipse if tipo == 'elipse' else d.rectangle)(caixa, fill=255)
    return m


def mascara(nome, original_corte, editado, alto=46, baixo=24, folga=44):
    """O objeto (diferença alta dentro das formas) cresce enquanto o original e o editado continuam diferentes
    (diferença acima do "baixo"), até "folga" px além das formas: a emenda cai onde os dois já são parecidos, em vez de
    cortar um pinheiro ao meio."""
    caixa, onde_pode, sempre = AREAS[nome]
    dif = ImageChops.difference(original_corte, editado).convert('L').filter(ImageFilter.GaussianBlur(2.5))
    dentro = formas(dif.size, onde_pode, caixa[:2])
    limite = dentro.filter(ImageFilter.MaxFilter(folga * 2 + 1))
    # nunca encosta na borda do corte (lá não há o que misturar)
    borda = Image.new('L', dif.size, 0)
    ImageDraw.Draw(borda).rectangle((6, 6, dif.size[0] - 7, dif.size[1] - 7), fill=255)
    limite = ImageChops.multiply(limite, borda)
    m = ImageChops.multiply(dif.point(lambda v: 255 if v > alto else 0), dentro)
    m = m.filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.MinFilter(5))
    m = ImageChops.lighter(m, formas(m.size, sempre, caixa[:2]))
    pode_crescer = ImageChops.multiply(dif.point(lambda v: 255 if v > baixo else 0).filter(ImageFilter.MaxFilter(3)), limite)
    for _ in range(60):
        maior = ImageChops.lighter(m, ImageChops.multiply(m.filter(ImageFilter.MaxFilter(3)), pode_crescer))
        if ImageChops.difference(maior, m).getbbox() is None:
            break
        m = maior
    # preenche os buracos de dentro: o que não se liga à borda pelo lado de fora vira parte da máscara
    fundo = m.copy()
    ImageDraw.floodfill(fundo, (0, 0), 128)
    buracos = fundo.point(lambda v: 255 if v == 0 else 0)
    m = ImageChops.lighter(m, buracos)
    return m.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(2.5))


def acertar_cor(original_corte, editado, m):
    """Leva a cor média do editado à do original no anel em volta da máscara (onde os dois mostram o mesmo chão)."""
    anel = ImageChops.subtract(m.filter(ImageFilter.MaxFilter(21)), m.point(lambda v: 255 if v > 8 else 0))
    if anel.getbbox() is None:
        return editado
    from PIL import ImageStat
    a = ImageStat.Stat(original_corte, anel).mean
    b = ImageStat.Stat(editado, anel).mean
    canais = [c.point(lambda v, d=(a[i] - b[i]) * 0.8: max(0, min(255, v + d))) for i, c in enumerate(editado.split())]
    return Image.merge('RGB', canais)


def montar(nomes, saida):
    base = Image.open(ORIGINAL).convert('RGB')
    mascaras = {}
    for nome in nomes:
        arq = os.path.join(EDITADOS, f'limpo-{nome}.png')
        if not os.path.exists(arq):
            print('falta', nome)
            continue
        caixa = AREAS[nome][0]
        corte = base.crop(caixa)
        editado = Image.open(arq).convert('RGB').resize(corte.size, Image.LANCZOS)
        original_corte = Image.open(ORIGINAL).convert('RGB').crop(caixa)
        m = mascara(nome, original_corte, editado)
        editado = acertar_cor(original_corte, editado, m)
        base.paste(editado, caixa[:2], m)
        mascaras[nome] = m
        m.save(os.path.join(AQUI, f'mascara-{nome}.png'))
    base.save(saida)
    return mascaras


if __name__ == '__main__':
    nomes = sys.argv[1:] or list(AREAS)
    montar(nomes, os.path.join(AQUI, 'fundo-limpo.png'))
    print('ok')
