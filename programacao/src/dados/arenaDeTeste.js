// Arena de teste da Fase 1 (TASK-004): campo fechado do tamanho da caixa 16:9.
// Posições em pixels da arena (1600 × 900); x e y são o centro de cada coisa.
// O HUD (faixa de cima) e a barra de teste (faixa de baixo) ficam fora da área jogável:
// a borda da arena é a beira dessas faixas, então ninguém anda embaixo delas.

export const tamanhoDaArena = { largura: 1600, altura: 900 }

// Altura das faixas em pixels da arena. O React usa os mesmos números, convertidos por emCqw.
export const faixas = { hud: 96, barraDeTeste: 112 }

// Pixels da arena → "cqw" do CSS (a arena ocupa a caixa 16:9 inteira: 100 cqw = largura da arena)
export function emCqw(pixels) {
  return `${(pixels / tamanhoDaArena.largura) * 100}cqw`
}

// Onde dá para andar: entre as duas faixas. Retângulo com x e y no centro.
export const areaJogavel = {
  x: tamanhoDaArena.largura / 2,
  y: (faixas.hud + tamanhoDaArena.altura - faixas.barraDeTeste) / 2,
  largura: tamanhoDaArena.largura,
  altura: tamanhoDaArena.altura - faixas.hud - faixas.barraDeTeste,
}

export const coresDaArena = {
  chao: 0x5cc85a,
  mancha: 0x49b04b,
  borda: 0x2f6b30,
  faixa: 0x24502a, // chão embaixo do HUD e da barra de teste (fora da área jogável)
  pedra: 0x9aa3ad,
  contorno: 0x1c2230, // contorno escuro fino de tudo
  sombra: 0x000000,
  mobVermelho: 0xf03a3a,
  atirador: 0x9e1b2b, // vermelho escuro
  tiroInimigo: 0x6e0d18,
  boneco: 0xc8a26b,
  flecha: 0xf2ffff,
  bolaMagica: 0xd9a6ff,
  aura: 0xfff3a0,
  escudo: 0xffd9a8,
  numeroDeDano: '#ffffff', // dano que o jogador causa
  danoNoLider: '#ff8f8f', // dano que o Líder leva
  numeroDeCura: '#9dff9d',
  bloqueado: '#fff2a8',
}

// Manchas de verde mais escuro, sempre no mesmo lugar
export const manchas = [
  { x: 180, y: 160, largura: 220, altura: 120 },
  { x: 520, y: 470, largura: 160, altura: 90 },
  { x: 860, y: 140, largura: 260, altura: 110 },
  { x: 1120, y: 420, largura: 200, altura: 150 },
  { x: 1430, y: 260, largura: 180, altura: 100 },
  { x: 330, y: 700, largura: 240, altura: 110 },
  { x: 1300, y: 720, largura: 260, altura: 100 },
  { x: 760, y: 740, largura: 180, altura: 70 },
]

// Pedras: bloqueiam o movimento e os projéteis.
// As duas últimas são coladas e formam um L: o canto de dentro (em 265, 665) serve para testar o travamento.
export const pedras = [
  { x: 700, y: 250, largura: 120, altura: 80 },
  { x: 990, y: 560, largura: 100, altura: 140 },
  { x: 560, y: 640, largura: 150, altura: 70 },
  { x: 1260, y: 330, largura: 90, altura: 90 },
  { x: 190, y: 690, largura: 150, altura: 50 },
  { x: 290, y: 640, largura: 50, altura: 150 },
]

// Onde o Líder começa e onde fica o boneco de treino
export const inicio = { x: 240, y: 430 }
export const boneco = { x: 420, y: 290 }

// Inimigos do começo: longe do início (mais longe que o raio de detecção deles)
export const inimigosIniciais = [
  { tipo: 'mobVermelho', x: 1300, y: 170 },
  { tipo: 'mobVermelho', x: 1400, y: 600 },
  { tipo: 'mobVermelho', x: 1060, y: 740 },
  { tipo: 'atirador', x: 1460, y: 420 },
]

// Onde aparecem os inimigos criados pela barra de teste (o mais longe do Líder)
export const pontosDeSurgimento = [
  { x: 1480, y: 140 },
  { x: 1480, y: 740 },
  { x: 900, y: 120 },
  { x: 420, y: 750 },
  { x: 120, y: 120 },
  { x: 820, y: 440 },
]
