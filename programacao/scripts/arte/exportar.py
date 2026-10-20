# Copia as camadas prontas para programacao/src/assets/arte/ (reino/, reino/animacao/, mapa/, mapa/animacao/).
# Reino sem perda (WEBP lossless); Mapa em WEBP de alta qualidade (a imagem do mapa já é JPG). Pixels transparentes
# ficam pretos (o arquivo fica menor e nada muda na tela).
import glob, json, os
from PIL import Image

from caminhos import ARTE, TRABALHO
AQUI = TRABALHO


def limpar(im):
    im = im.convert('RGBA')
    vazio = Image.new('RGBA', im.size, (0, 0, 0, 0))
    return Image.composite(im, vazio, im.getchannel('A').point(lambda v: 255 if v > 0 else 0))


def salvar(origem, pasta, perda=False):
    os.makedirs(os.path.join(ARTE, pasta), exist_ok=True)
    nome = os.path.splitext(os.path.basename(origem))[0]
    im = Image.open(origem)
    if 'mascara' in nome:
        # máscara: branco com a transparência (o canvas recorta pela transparência, destination-in)
        m = im.convert('L')
        branco = Image.new('RGBA', m.size, (255, 255, 255, 0))
        branco.putalpha(m)
        branco.save(os.path.join(ARTE, pasta, nome + '.png'), optimize=True)
        return
    im = limpar(im) if im.mode in ('RGBA', 'LA', 'P') else im.convert('RGB')
    if perda:
        im.save(os.path.join(ARTE, pasta, nome + '.webp'), quality=95, method=6, alpha_quality=100)
    else:
        im.save(os.path.join(ARTE, pasta, nome + '.webp'), lossless=True, quality=100, method=6)


salvar(os.path.join(AQUI, 'reino-fundo.png'), 'reino')
for p in glob.glob(os.path.join(AQUI, 'pecas', 'reino-*.png')):
    salvar(p, 'reino')
for p in glob.glob(os.path.join(AQUI, 'reino', '*.png')):
    salvar(p, os.path.join('reino', 'animacao'))
for p in glob.glob(os.path.join(AQUI, 'mapa', 'mapa-*.png')):
    animacao = any(k in p for k in ('lava', 'cachoeira'))
    salvar(p, os.path.join('mapa', 'animacao') if animacao else 'mapa', perda=True)
print('ok')
