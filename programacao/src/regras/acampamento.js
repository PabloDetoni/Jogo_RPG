// Acampamentos e fortes goblin (Parte 6b e 6c de 11/2026). Funções puras.
// Um acampamento é um círculo (centro, raio) cercado por uma paliçada de troncos com 1 ou 2 entradas (ângulos em
// radianos, 0 = para a direita, no sentido do relógio na tela). A paliçada vira retângulos pequenos (os troncos) em
// volta do círculo, que são paredes como as pedras: colisão, caminho e desenho não mudam de formato.

// Os troncos da paliçada: um retângulo quadrado de "tronco" px a cada passo do círculo, menos onde fica uma entrada
// (abertura de "larguraDaEntrada" px no arco). Devolve [{ x, y, largura, altura, tipo: 'palicada', angulo }].
export function troncosDaPalicada({ centro, raio, entradas = [] }, { tronco, larguraDaEntrada }) {
  const passo = tronco * 0.9 // os troncos se encostam um pouco: ninguém passa entre eles
  const quantos = Math.max(8, Math.ceil((2 * Math.PI * raio) / passo))
  const metadeDaEntrada = larguraDaEntrada / 2 / raio // meia abertura, em radianos
  const troncos = []
  for (let i = 0; i < quantos; i++) {
    const angulo = (i / quantos) * Math.PI * 2
    if (entradas.some((entrada) => Math.abs(diferencaDeAngulo(angulo, entrada)) < metadeDaEntrada)) continue
    troncos.push({
      x: Math.round(centro.x + Math.cos(angulo) * raio),
      y: Math.round(centro.y + Math.sin(angulo) * raio),
      largura: tronco,
      altura: tronco,
      tipo: 'palicada',
      angulo,
    })
  }
  return troncos
}

// A diferença entre dois ângulos, de -π a π
export function diferencaDeAngulo(a, b) {
  let d = (a - b) % (Math.PI * 2)
  if (d > Math.PI) d -= Math.PI * 2
  if (d < -Math.PI) d += Math.PI * 2
  return d
}

// O ponto está dentro do acampamento (do círculo da paliçada, mais a folga)?
export function dentroDoAcampamento({ centro, raio }, ponto, folga = 0) {
  return Math.hypot(ponto.x - centro.x, ponto.y - centro.y) <= raio + folga
}

// O acampamento que contém o ponto (com a folga), ou null
export function acampamentoEm(acampamentos, ponto, folga = 0) {
  return acampamentos.find((acampamento) => dentroDoAcampamento(acampamento, ponto, folga)) ?? null
}

// Onde os goblins nascem dentro do acampamento: em anéis em volta da fogueira (longe dela e da paliçada), espalhados
// por igual. Devolve [{ tipo, x, y }] na ordem da população.
export function lugaresNoAcampamento({ centro, raio }, populacao, { longeDaFogueira, longeDaPalicada }) {
  const tipos = Object.entries(populacao).flatMap(([tipo, quantos]) => Array.from({ length: quantos }, () => tipo))
  const interno = longeDaFogueira
  const externo = Math.max(interno, raio - longeDaPalicada)
  return tipos.map((tipo, i) => {
    const angulo = (i / tipos.length) * Math.PI * 2 + 0.3
    const distancia = i % 2 === 0 ? externo : (interno + externo) / 2
    return { tipo, x: Math.round(centro.x + Math.cos(angulo) * distancia), y: Math.round(centro.y + Math.sin(angulo) * distancia) }
  })
}

// Quem o xamã cura (Parte 6b): o mais ferido (pela fração da vida) do bando, vivo, a até "raio" dele e sem a vida
// cheia; em empate, o mais perto. Ninguém precisando: null.
export function goblinParaCurar(xama, bando, raio) {
  let melhor = null
  for (const goblin of bando) {
    if (goblin.morto || goblin.vida >= goblin.vidaMaxima) continue
    const distancia = Math.hypot(goblin.x - xama.x, goblin.y - xama.y)
    if (distancia > raio) continue
    const fracao = goblin.vida / goblin.vidaMaxima
    if (!melhor || fracao < melhor.fracao || (fracao === melhor.fracao && distancia < melhor.distancia)) melhor = { goblin, fracao, distancia }
  }
  return melhor?.goblin ?? null
}
