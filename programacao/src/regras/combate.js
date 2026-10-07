// Regras do combate (Fase 1, parte 5a). Funções puras: recebem números e devolvem o resultado.
// O Phaser (src/jogo) só desenha e move; dano, recarga, perseguição, empurrão, cura e acerto são decididos aqui.
// Posições são { x, y }; um retângulo é { x, y, largura, altura } com x e y no centro; ângulos em radianos.

const limitar = (valor, minimo, maximo) => Math.min(maximo, Math.max(minimo, valor))
const distancia = (a, b) => Math.hypot(b.x - a.x, b.y - a.y)

export function grausParaRadianos(graus) {
  return (graus * Math.PI) / 180
}

// WASD vira uma direção (dx e dy entre -1 e 1). Na diagonal a velocidade é a mesma, não √2 vezes maior.
export function velocidadeDoMovimento(dx, dy, velocidade) {
  const tamanho = Math.hypot(dx, dy)
  if (tamanho === 0) return { x: 0, y: 0 }
  return { x: (dx / tamanho) * velocidade, y: (dy / tamanho) * velocidade }
}

// A vida nunca fica negativa. Quem está protegido (imune, esquivando ou invencível) não leva dano.
export function aplicarDano(vida, dano, protegido = false) {
  if (protegido || !(dano > 0) || vida <= 0) return { vida, danoFeito: 0 }
  const danoFeito = Math.min(vida, Math.round(dano))
  return { vida: vida - danoFeito, danoFeito }
}

// Recarga: ultimoUso = null quer dizer que nunca foi usado
export function podeUsar(agora, ultimoUso, recargaMs) {
  return ultimoUso === null || agora - ultimoUso >= recargaMs
}

// Quanto da recarga já passou, de 0 (acabou de usar) a 1 (pronto), para o HUD
export function fracaoDaRecarga(agora, ultimoUso, recargaMs) {
  if (ultimoUso === null || recargaMs <= 0) return 1
  return limitar((agora - ultimoUso) / recargaMs, 0, 1)
}

// Mob hostil (Conceito §11.3): começa a perseguir dentro do raio de detecção e só desiste
// quando o alvo passa do raio de desistência, que é maior. Assim ele não fica indeciso na borda.
export function devePerseguir({ distancia: ate, perseguindo, raioDeDeteccao, raioDeDesistencia }) {
  return perseguindo ? ate <= raioDeDesistencia : ate <= raioDeDeteccao
}

// Empurrão: da origem para o alvo, com a força dada. No mesmo ponto, empurra para a direita.
export function vetorDeEmpurrao(origem, alvo, forca) {
  const dx = alvo.x - origem.x
  const dy = alvo.y - origem.y
  const tamanho = Math.hypot(dx, dy)
  if (tamanho === 0) return { x: forca, y: 0 }
  return { x: (dx / tamanho) * forca, y: (dy / tamanho) * forca }
}

export function anguloEntre(origem, ponto) {
  return Math.atan2(ponto.y - origem.y, ponto.x - origem.x)
}

// Diferença entre dois ângulos, entre -π e π
export function diferencaDeAngulo(a, b) {
  return Math.atan2(Math.sin(a - b), Math.cos(a - b))
}

// O ponto está no arco à frente? (espada do Guerreiro, escudo e empurrão do Tanque)
export function noArco(centro, anguloMira, alcance, aberturaGraus, ponto) {
  const ate = distancia(centro, ponto)
  if (ate > alcance) return false
  if (ate === 0) return true
  return Math.abs(diferencaDeAngulo(anguloEntre(centro, ponto), anguloMira)) <= grausParaRadianos(aberturaGraus) / 2
}

// A bola do Mago cresce enquanto voa: do raio inicial (saindo) ao final (no alcance máximo)
export function raioDaBolaMagica(percorrido, alcance, raioInicial, raioFinal) {
  const fracao = alcance > 0 ? limitar(percorrido / alcance, 0, 1) : 1
  return raioInicial + (raioFinal - raioInicial) * fracao
}

// Projétil (círculo) contra corpo ou pedra (retângulo)
export function circuloTocaRetangulo(circulo, retangulo) {
  const maisPertoX = limitar(circulo.x, retangulo.x - retangulo.largura / 2, retangulo.x + retangulo.largura / 2)
  const maisPertoY = limitar(circulo.y, retangulo.y - retangulo.altura / 2, retangulo.y + retangulo.altura / 2)
  return Math.hypot(circulo.x - maisPertoX, circulo.y - maisPertoY) <= circulo.raio
}

// Projétil contra o escudo do Tanque, que gira com a mira
export function circuloTocaRetanguloGirado(circulo, retangulo, angulo) {
  const dx = circulo.x - retangulo.x
  const dy = circulo.y - retangulo.y
  const cos = Math.cos(-angulo)
  const sin = Math.sin(-angulo)
  const local = { x: dx * cos - dy * sin, y: dx * sin + dy * cos, raio: circulo.raio }
  return circuloTocaRetangulo(local, { x: 0, y: 0, largura: retangulo.largura, altura: retangulo.altura })
}

// Corpo contra corpo (o bote do mob no Líder)
export function retangulosSeTocam(a, b) {
  return Math.abs(a.x - b.x) * 2 <= a.largura + b.largura && Math.abs(a.y - b.y) * 2 <= a.altura + b.altura
}

// Aura do Sacerdote: cura só quem está dentro do raio e de pé, sem passar da vida máxima.
// Devolve só quem foi curado: { id, vida, curado }.
export function curaDaAura(membros, centro, raio, cura) {
  return membros
    .filter((membro) => membro.vida > 0 && membro.vida < membro.vidaMaxima && distancia(centro, membro) <= raio)
    .map((membro) => {
      const vida = Math.min(membro.vidaMaxima, membro.vida + cura)
      return { id: membro.id, vida, curado: vida - membro.vida }
    })
}

// Vagas do grupo em volta do Líder: um círculo, a primeira atrás e à esquerda (embaixo, na tela)
export function vagaNaFormacao(indice, total, raio) {
  const angulo = (3 * Math.PI) / 4 + (2 * Math.PI * indice) / Math.max(1, total)
  return { x: Math.cos(angulo) * raio, y: Math.sin(angulo) * raio }
}

// O segmento de a até b passa por dentro do retângulo? (método de Liang–Barsky)
export function segmentoCortaRetangulo(a, b, retangulo) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const bordas = [
    [-dx, a.x - (retangulo.x - retangulo.largura / 2)],
    [dx, retangulo.x + retangulo.largura / 2 - a.x],
    [-dy, a.y - (retangulo.y - retangulo.altura / 2)],
    [dy, retangulo.y + retangulo.altura / 2 - a.y],
  ]
  let entrada = 0
  let saida = 1
  for (const [p, q] of bordas) {
    if (p === 0) {
      if (q < 0) return false
      continue
    }
    const t = q / p
    if (p < 0) entrada = Math.max(entrada, t)
    else saida = Math.min(saida, t)
    if (entrada > saida) return false
  }
  return true
}

const aumentar = (retangulo, folga) => ({ ...retangulo, largura: retangulo.largura + 2 * folga, altura: retangulo.altura + 2 * folga })

// Desvio de pedras: se o caminho reto até o alvo bate numa pedra, vai antes até um canto dela.
// Prefere o canto de onde já se vê o alvo; entre esses, o que deixa o caminho mais curto. Se nenhum canto
// vê o alvo (a pedra está bem no meio), vai ao canto mais curto e decide de novo de lá.
// "folga" = metade do corpo de quem anda. Devolve o ponto para onde andar agora.
export function desvioDePedras(posicao, alvo, pedras, folga) {
  const pedra = pedras.find((outra) => segmentoCortaRetangulo(posicao, alvo, aumentar(outra, folga)))
  if (!pedra) return alvo
  const corpoDaPedra = aumentar(pedra, folga)
  const contorno = aumentar(pedra, folga + 8)
  const cantos = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ].map(([sx, sy]) => ({ x: contorno.x + (sx * contorno.largura) / 2, y: contorno.y + (sy * contorno.altura) / 2 }))
  const custo = (canto) => distancia(posicao, canto) + distancia(canto, alvo)
  const maisCurto = (lista) => lista.reduce((melhor, canto) => (custo(canto) < custo(melhor) ? canto : melhor))
  const alcancaveis = cantos.filter((canto) => distancia(posicao, canto) > 4 && !segmentoCortaRetangulo(posicao, canto, corpoDaPedra))
  if (alcancaveis.length === 0) return alvo
  const veemOAlvo = alcancaveis.filter((canto) => !segmentoCortaRetangulo(canto, alvo, corpoDaPedra))
  return maisCurto(veemOAlvo.length > 0 ? veemOAlvo : alcancaveis)
}

// Seguir um ponto e frear ao chegar perto (o aliado indo para a vaga dele)
export function velocidadeParaSeguir(posicao, alvo, velocidadeMaxima, raioDeChegada) {
  const dx = alvo.x - posicao.x
  const dy = alvo.y - posicao.y
  const ate = Math.hypot(dx, dy)
  if (ate < 2) return { x: 0, y: 0 }
  const velocidade = ate < raioDeChegada ? (velocidadeMaxima * ate) / raioDeChegada : velocidadeMaxima
  return { x: (dx / ate) * velocidade, y: (dy / ate) * velocidade }
}
