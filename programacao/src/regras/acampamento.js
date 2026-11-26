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

// O ponto está dentro do acampamento (do círculo da paliçada, ou do retângulo dos muros do forte, mais a folga)?
export function dentroDoAcampamento({ centro, raio, forma, largura, altura }, ponto, folga = 0) {
  if (forma === 'retangulo') return Math.abs(ponto.x - centro.x) <= largura / 2 + folga && Math.abs(ponto.y - centro.y) <= altura / 2 + folga
  return Math.hypot(ponto.x - centro.x, ponto.y - centro.y) <= raio + folga
}

// O raio de um círculo que cobre o acampamento inteiro (o forte é um retângulo: a metade da diagonal)
export function raioExterno({ raio, forma, largura, altura }) {
  return forma === 'retangulo' ? Math.hypot(largura, altura) / 2 : raio
}

// Os muros do forte goblin (Parte 6c): o retângulo dos muros (espessura px), em pedaços de até "pedaco" px (o desenho
// aparece por pedaços do mapa), com um portão de "larguraDoPortao" no meio de cada lado pedido ('norte', 'sul',
// 'leste', 'oeste'). Devolve [{ x, y, largura, altura, tipo: 'muro' }] com o centro.
export function murosDoForte({ centro, largura, altura, portoes = [] }, { espessura, larguraDoPortao, pedaco }) {
  const muros = []
  // um lado reto, de a até b (no eixo do lado), na posição fixa do outro eixo
  const lado = (nome, horizontal, fixo, a, b) => {
    const meio = (a + b) / 2
    const trechos = portoes.includes(nome)
      ? [
          [a, meio - larguraDoPortao / 2],
          [meio + larguraDoPortao / 2, b],
        ]
      : [[a, b]]
    for (const [inicio, fim] of trechos) {
      const quantos = Math.max(1, Math.ceil((fim - inicio) / pedaco))
      const passo = (fim - inicio) / quantos
      for (let i = 0; i < quantos; i++) {
        const c = inicio + passo * (i + 0.5)
        muros.push(
          horizontal
            ? { x: Math.round(c), y: Math.round(fixo), largura: Math.round(passo), altura: espessura, tipo: 'muro' }
            : { x: Math.round(fixo), y: Math.round(c), largura: espessura, altura: Math.round(passo), tipo: 'muro' },
        )
      }
    }
  }
  const x0 = centro.x - largura / 2
  const x1 = centro.x + largura / 2
  const y0 = centro.y - altura / 2
  const y1 = centro.y + altura / 2
  lado('norte', true, y0, x0, x1)
  lado('sul', true, y1, x0, x1)
  // os lados de pé ficam entre os de cima e de baixo (sem sobrepor os cantos)
  lado('oeste', false, x0, y0 + espessura / 2, y1 - espessura / 2)
  lado('leste', false, x1, y0 + espessura / 2, y1 - espessura / 2)
  return muros
}

// As torres dos arqueiros do forte: uma em cada canto, por dentro dos muros ("recuo" px do canto)
export function torresDoForte({ centro, largura, altura }, recuo) {
  return [-1, 1].flatMap((sx) => [-1, 1].map((sy) => ({ x: centro.x + sx * (largura / 2 - recuo), y: centro.y + sy * (altura / 2 - recuo) })))
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

// ---------- O forte por partes (Parte 11) ----------

// A faixa de uma parte do forte, em x: de "de" a "ate" (frações da largura, de -0,5 a 0,5), com a folga para os lados
// (a de fora vai além do muro: os da ponta veem quem chega pelo portão)
export function faixaDaLeva({ centro, largura }, { de, ate }, folga = 0) {
  return { x0: centro.x + de * largura - folga, x1: centro.x + ate * largura + folga }
}

// O ponto está na parte do forte (na faixa dela, com a folga, e na altura do forte, com a folga)?
export function dentroDaLeva(forte, leva, ponto, folga = 0) {
  const { x0, x1 } = faixaDaLeva(forte, leva, folga)
  return ponto.x >= x0 && ponto.x <= x1 && Math.abs(ponto.y - forte.centro.y) <= forte.altura / 2 + folga
}

// A parte do forte onde fica o ponto (sem folga), ou null
export function levaEm(forte, ponto) {
  return (forte.levas ?? []).find((leva) => dentroDaLeva(forte, leva, ponto)) ?? null
}

// O meio de cada parte (os pontos de perigo do mapa da pausa)
export function centrosDasLevas(forte) {
  return (forte.levas ?? []).map((leva) => {
    const { x0, x1 } = faixaDaLeva(forte, leva)
    return { id: leva.id, nome: leva.nome, x: Math.round((x0 + x1) / 2), y: forte.centro.y }
  })
}

// Onde os goblins de uma parte nascem: numa coluna no meio da faixa dela, espalhados de cima a baixo (longe dos muros),
// em zigue-zague, e nunca em cima da fogueira do meio. Devolve [{ tipo, x, y }] na ordem da população.
export function lugaresNaLeva(forte, leva, { longeDosMuros, longeDaFogueira }) {
  const tipos = Object.entries(leva.populacao ?? {}).flatMap(([tipo, quantos]) => Array.from({ length: quantos }, () => tipo))
  const { x0, x1 } = faixaDaLeva(forte, leva)
  const meio = (x0 + x1) / 2
  const topo = forte.centro.y - forte.altura / 2 + longeDosMuros
  const altura = forte.altura - longeDosMuros * 2
  return tipos.map((tipo, i) => {
    let x = meio + (i % 2 === 0 ? -1 : 1) * Math.min(60, (x1 - x0) / 4)
    const y = topo + ((i + 0.5) / tipos.length) * altura
    // perto da fogueira: empurra para o lado (em x) até ficar a "longeDaFogueira" dela
    const dy = y - forte.centro.y
    if (Math.hypot(x - forte.centro.x, dy) < longeDaFogueira) x = forte.centro.x + (x < forte.centro.x ? -1 : 1) * Math.ceil(Math.sqrt(longeDaFogueira ** 2 - dy ** 2) + 1)
    return { tipo, x: Math.round(x), y: Math.round(y) }
  })
}

