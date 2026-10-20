# Peças pequenas das animações do Reino, recortadas do fundo limpo e das peças (nada gerado):
# - o céu sem nuvens (as nuvens viram peças que andam devagar) e a máscara do céu (as nuvens passam atrás das montanhas);
# - os estandartes azuis do fundo (ondulam), as flâmulas do castelo, as pás do moinho (giram);
# - a máscara da água do lago e da fonte (brilhos), a sombra no chão da Mochila e da Árvore.
# Saída: reino/ (as imagens) e reino/animacoes.json (onde cada uma fica, em pixels da imagem original).
import json, os
from collections import deque
from PIL import Image, ImageChops, ImageDraw, ImageFilter

from caminhos import ORIGINAL_REINO, TRABALHO
AQUI = TRABALHO
SAIDA = os.path.join(AQUI, 'reino')
os.makedirs(SAIDA, exist_ok=True)
ORIGINAL = Image.open(ORIGINAL_REINO).convert('RGB')
FUNDO = Image.open(os.path.join(AQUI, 'fundo-limpo.png')).convert('RGB')
L, A = FUNDO.size
dados = {}


def componentes(mascara, minimo=1):
    """Grupos ligados (8 vizinhos) de uma máscara 0/255: lista de listas de (x, y)."""
    w, h = mascara.size
    m = mascara.load()
    visto = bytearray(w * h)
    grupos = []
    for y0 in range(h):
        for x0 in range(w):
            if m[x0, y0] < 128 or visto[y0 * w + x0]:
                continue
            fila = deque([(x0, y0)])
            visto[y0 * w + x0] = 1
            grupo = []
            while fila:
                x, y = fila.popleft()
                grupo.append((x, y))
                for dx in (-1, 0, 1):
                    for dy in (-1, 0, 1):
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < w and 0 <= ny < h and not visto[ny * w + nx] and m[nx, ny] >= 128:
                            visto[ny * w + nx] = 1
                            fila.append((nx, ny))
            if len(grupo) >= minimo:
                grupos.append(grupo)
    return grupos


def caixa_de(grupo, folga=0, limite=(L, A)):
    xs = [p[0] for p in grupo]
    ys = [p[1] for p in grupo]
    return (max(0, min(xs) - folga), max(0, min(ys) - folga), min(limite[0], max(xs) + 1 + folga), min(limite[1], max(ys) + 1 + folga))


def salvar_peca(nome, imagem, alfa, caixa):
    peca = imagem.crop(caixa).convert('RGBA')
    peca.putalpha(alfa.crop(caixa))
    peca.save(os.path.join(SAIDA, f'{nome}.png'), optimize=True)
    return {'x': caixa[0], 'y': caixa[1], 'largura': caixa[2] - caixa[0], 'altura': caixa[3] - caixa[1]}


# ---------- Pás do moinho: o que o original tem e o fundo limpo não (no quadrado do moinho) ----------
moinho = (262, 282, 340, 358)
dif = ImageChops.difference(ORIGINAL.crop(moinho), FUNDO.crop(moinho)).convert('L').filter(ImageFilter.GaussianBlur(1))
pas = dif.point(lambda v: 255 if v > 40 else 0).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))
alfa = Image.new('L', (L, A), 0)
alfa.paste(pas, moinho[:2])
dados['pas'] = salvar_peca('reino-pas-do-moinho', ORIGINAL, alfa.filter(ImageFilter.GaussianBlur(0.5)), moinho)
dados['pas']['eixo'] = {'x': 300, 'y': 320}

# ---------- Céu: tira as nuvens (viram peças) e guarda a máscara do céu ----------
faixa = 262  # o céu nunca desce abaixo disto
px = FUNDO.load()
ceu_azul = lambda r, g, b: b > 200 and r < 110 and b > r + 100 and g > 120
nuvem = lambda r, g, b: r > 118 and g > 170 and b > 205
m_ceu = Image.new('L', (L, faixa), 0)
m_nuvem = Image.new('L', (L, faixa), 0)
pc, pn = m_ceu.load(), m_nuvem.load()
for y in range(faixa):
    for x in range(L):
        r, g, b = px[x, y]
        if ceu_azul(r, g, b):
            pc[x, y] = 255
        elif nuvem(r, g, b):
            pn[x, y] = 255
# a cor do céu de cada linha (a mediana dos pixels de céu)
cor_da_linha = []
for y in range(faixa):
    linha = sorted(px[x, y] for x in range(L) if pc[x, y])
    cor_da_linha.append(linha[len(linha) // 2] if len(linha) > 20 else None)
ultimo = next(c for c in cor_da_linha if c)
for y in range(faixa):
    cor_da_linha[y] = cor_da_linha[y] or ultimo
    ultimo = cor_da_linha[y]
# A linha das montanhas: em cada coluna, o pixel de rocha (azul-acinzentado, mais vermelho e menos azul que o céu) mais
# alto. Só anda a nuvem que fica inteira acima dela; a que encosta nas montanhas (ou na neve) fica parada no fundo.
rocha = lambda r, g, b: r >= 55 and b < 236 and g < 200 and b > r and not (r > 150 and g > 185)
topo = []
for x in range(L):
    y = next((y for y in range(70, faixa) if rocha(*px[x, y])), faixa)
    topo.append(y)
topo = [min(topo[max(0, x - 6):x + 7]) for x in range(L)]
# nuvem = grupo claro cercado quase todo de céu (a neve das montanhas encosta na rocha, não no céu)
nuvens = []
for grupo in componentes(m_nuvem, minimo=40):
    if any(y >= topo[x] - 10 for x, y in grupo):
        continue
    x0, y0, x1, y1 = caixa_de(grupo)
    if (x1 - x0) < 1.5 * (y1 - y0) or len(grupo) < 0.4 * (x1 - x0) * (y1 - y0):
        continue  # nuvem é larga e cheia; os brilhos de neve nas encostas são tiras finas e tortas
    borda = céu = 0
    dentro = set(grupo)
    for x, y in grupo:
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            v = (x + dx, y + dy)
            if v in dentro or not (0 <= v[0] < L and 0 <= v[1] < faixa):
                continue
            borda += 1
            if pc[v] or (px[v][2] > 200 and px[v][0] < 170):
                céu += 1
    if borda and céu / borda > 0.72:
        nuvens.append(grupo)
alfa_nuvens = Image.new('L', (L, A), 0)
an = alfa_nuvens.load()
for grupo in nuvens:
    for x, y in grupo:
        an[x, y] = 255
# a franja azul-clara em volta (2 px): transparência pela claridade em relação ao céu da linha
franja = alfa_nuvens.filter(ImageFilter.MaxFilter(7))
fr = franja.load()
claridade = lambda c: 0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2]
for y in range(faixa):
    base = claridade(cor_da_linha[y])
    for x in range(L):
        if fr[x, y] and not an[x, y]:
            c = px[x, y]
            if c[2] > 190:
                an[x, y] = int(max(0, min(1, (claridade(c) - base) / max(1, 235 - base))) * 255)
celu = FUNDO.copy()
cp = celu.load()
nuvens_info = []
for i, grupo in enumerate(sorted(nuvens, key=lambda g: min(p[0] for p in g)), start=1):
    caixa = caixa_de(grupo, folga=2, limite=(L, faixa))
    nuvens_info.append(salvar_peca(f'reino-nuvem-{i}', FUNDO, alfa_nuvens, caixa))
# o céu sem nuvens: onde havia nuvem (ou a franja dela), a cor do céu daquela linha
for y in range(faixa):
    for x in range(L):
        a = an[x, y]
        if a:
            c, s = px[x, y], cor_da_linha[y]
            k = a / 255
            cp[x, y] = tuple(s) if k > 0.12 else tuple(int(c[j] * (1 - k) + s[j] * k) for j in range(3))
dados['nuvens'] = nuvens_info
# máscara do céu: o céu azul e onde as nuvens estavam (as nuvens andando só aparecem aí)
mascara_ceu = Image.new('L', (L, A), 0)
mascara_ceu.paste(ImageChops.lighter(m_ceu, alfa_nuvens.crop((0, 0, L, faixa)).point(lambda v: 255 if v else 0)), (0, 0))
mascara_ceu = mascara_ceu.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))
mascara_ceu.save(os.path.join(SAIDA, 'reino-mascara-ceu.png'), optimize=True)

# ---------- Sombras no chão (a Mochila e a Árvore terminam onde a placa começava) ----------
sombra = Image.new('L', (L, A), 0)
d = ImageDraw.Draw(sombra)
d.ellipse((22, 738, 228, 762), fill=105)
d.ellipse((1500, 758, 1660, 782), fill=90)
sombra = sombra.filter(ImageFilter.GaussianBlur(6))
celu = Image.composite(Image.new('RGB', (L, A), (20, 30, 10)), celu, sombra)
celu.save(os.path.join(AQUI, 'reino-fundo.png'))

# ---------- Estandartes azuis do fundo (o grande do poste e os das muralhas) ----------
fp = celu.load()
azul = Image.new('L', (L, A), 0)
az = azul.load()
for y in range(150, A):
    for x in range(L):
        r, g, b = fp[x, y]
        if b > 170 and r < 70 and g < 140 and b > g + 60:
            az[x, y] = 255
estandartes = []
for grupo in componentes(azul.filter(ImageFilter.MaxFilter(3)), minimo=260):
    x0, y0, x1, y1 = caixa_de(grupo)
    if (y1 - y0) < 1.2 * (x1 - x0) or (y1 - y0) < 50:
        continue  # estandarte é mais alto que largo (telhados azuis não) e comprido
    if len(grupo) < 0.5 * (x1 - x0) * (y1 - y0):
        continue  # quase todo azul (a fonte azul tem a bacia branca e o chão em volta)
    caixa = (x0 - 3, y0 - 3, x1 + 3, y1 + 4)
    m = Image.new('L', (L, A), 0)
    mm = m.load()
    for x, y in grupo:
        mm[x, y] = 255
    # a flor-de-lis branca e a borda dourada ficam dentro: fecha e engorda um pouco
    regiao = m.crop(caixa).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))
    fundo_r = regiao.copy()
    ImageDraw.floodfill(fundo_r, (0, 0), 128)
    regiao = ImageChops.lighter(regiao, fundo_r.point(lambda v: 255 if v == 0 else 0))
    m.paste(regiao, caixa[:2])
    estandartes.append(salvar_peca(f'reino-estandarte-{len(estandartes) + 1}', celu, m.filter(ImageFilter.GaussianBlur(0.6)), caixa))
dados['estandartes'] = estandartes

# ---------- Flâmulas do castelo (as bandeirinhas azuis no alto das torres) ----------
pos_pecas = json.load(open(os.path.join(AQUI, 'pecas', 'posicoes.json')))
cast = Image.open(os.path.join(AQUI, 'pecas', 'reino-castelo.png')).convert('RGBA')
cx, cy = pos_pecas['castelo']['x'], pos_pecas['castelo']['y']
cpix = cast.load()
azul_c = Image.new('L', cast.size, 0)
ac = azul_c.load()
for y in range(min(cast.size[1], 120)):
    for x in range(cast.size[0]):
        r, g, b, a = cpix[x, y]
        if a > 200 and b > 150 and r < 80 and b > g + 50:
            ac[x, y] = 255
flamulas = []
for grupo in componentes(azul_c, minimo=30):
    x0, y0, x1, y1 = caixa_de(grupo, limite=cast.size)
    if (x1 - x0) < (y1 - y0) or (x1 - x0) > 40 or (y1 - y0) > 18 or (x1 - x0) < 12:
        continue  # flâmula é baixa e mais larga que alta (os telhados cônicos não)
    caixa = (x0 - 2, y0 - 2, x1 + 2, y1 + 2)
    m = Image.new('L', cast.size, 0)
    mm = m.load()
    for x, y in grupo:
        mm[x, y] = 255
    m = m.filter(ImageFilter.MaxFilter(3))
    m = ImageChops.multiply(m, cast.getchannel('A'))
    peca = cast.crop(caixa)
    peca.putalpha(m.crop(caixa))
    nome = f'reino-flamula-{len(flamulas) + 1}'
    peca.save(os.path.join(SAIDA, f'{nome}.png'), optimize=True)
    flamulas.append({'x': cx + caixa[0], 'y': cy + caixa[1], 'largura': caixa[2] - caixa[0], 'altura': caixa[3] - caixa[1]})
dados['flamulas'] = flamulas

# ---------- Água: o lago atrás do castelo e a bacia da fonte (onde os brilhos aparecem) ----------
agua = Image.new('L', (L, A), 0)
ag = agua.load()
for y in range(222, 330):
    for x in range(L):
        r, g, b = fp[x, y]
        if b > 190 and g > 120 and r < 120 and b > r + 90 and g < b - 20:
            ag[x, y] = 255
ImageDraw.Draw(agua).ellipse((806, 566, 862, 588), fill=255)
agua = agua.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))
agua.save(os.path.join(SAIDA, 'reino-mascara-agua.png'), optimize=True)

# ---------- Lugares fixos (lanterna, chaminés, fonte) ----------
dados['lanterna'] = {'x': 115, 'y': 294, 'raio': 30}
dados['chamines'] = [{'x': 1281, 'y': 528}, {'x': 393, 'y': 270}, {'x': 239, 'y': 335}]
dados['fonte'] = {'x': 832, 'y': 532}
json.dump(dados, open(os.path.join(SAIDA, 'animacoes.json'), 'w'), indent=1)
print('nuvens', len(nuvens_info), 'estandartes', len(estandartes), 'flâmulas', len(flamulas))

# ---------- A copa da árvore grande do canto (balança um pouco): o que não é céu no alto à esquerda ----------
copa_caixa = (0, 0, 570, 216)
ceu_m = Image.open(os.path.join(SAIDA, 'reino-mascara-ceu.png'))
alfa_copa = Image.new('L', (L, A), 0)
ImageDraw.Draw(alfa_copa).rectangle(copa_caixa, fill=255)
ImageDraw.Draw(alfa_copa).rectangle((0, 150, 165, 216), fill=0)  # o poste com a lanterna fica parado
alfa_copa = ImageChops.subtract(alfa_copa, ceu_m.filter(ImageFilter.MaxFilter(3)))
fundo_final = Image.open(os.path.join(AQUI, 'reino-fundo.png')).convert('RGB')
dados['copa'] = salvar_peca('reino-copa', fundo_final, alfa_copa.filter(ImageFilter.GaussianBlur(0.5)), copa_caixa)
dados['copa']['ancora'] = {'x': 40, 'y': 216}
json.dump(dados, open(os.path.join(SAIDA, 'animacoes.json'), 'w'), indent=1)
