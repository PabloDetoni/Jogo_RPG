// Regras do mundo da partida (Fase 3; Floresta grande na Parte 5): as árvores e pedras espalhadas, em que região e área
// cada ponto está, a borda usada pela taxa (RF48) e a névoa do minimapa (RF40). A mata fechada vem do terreno
// (regras/terreno.js). Funções puras: o mapa vem de src/dados/mundo/. Retângulos de obstáculo têm x e y no centro.
// Regiões: polígonos (com a caixa x0, x1, y0, y1 calculada ao montar o mapa) ou faixas { x0, x1, y0, y1 } (cantos).
// Áreas: círculos { x, y, raio } ou faixas.
import { pontoNoPoligono } from './terreno.js'

// Sorteio com semente (mulberry32): o mesmo mapa sai igual toda vez
export function criarSorteio(semente) {
  let estado = semente >>> 0
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0
    let t = estado
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const dentroDaFaixa = (faixa, ponto) => ponto.x >= faixa.x0 && ponto.x < faixa.x1 && ponto.y >= faixa.y0 && ponto.y <= faixa.y1

// O ponto está dentro da região? Polígono (com a caixa para ser rápido) ou faixa
export function dentroDaRegiao(regiao, ponto) {
  if (regiao.poligono) {
    if (ponto.x < regiao.x0 || ponto.x > regiao.x1 || ponto.y < regiao.y0 || ponto.y > regiao.y1) return false
    return pontoNoPoligono(regiao.poligono, ponto)
  }
  return dentroDaFaixa(regiao, ponto)
}

// A região em que o ponto está (a primeira da lista, onde duas se sobrepõem); null fora de todas (dentro da mata)
export function regiaoEm(regioes, ponto) {
  return (
    regioes.find((regiao) => dentroDaRegiao(regiao, ponto)) ??
    regioes.find((regiao) => !regiao.poligono && ponto.x === regiao.x1 && dentroDaFaixa({ ...regiao, x1: Infinity }, ponto)) ??
    null
  )
}

// A área com nome em que o ponto está: círculo { x, y, raio } ou faixa
export function areaEm(areas, ponto) {
  return areas.find((area) => (area.raio !== undefined ? Math.hypot(ponto.x - area.x, ponto.y - area.y) <= area.raio : dentroDaFaixa(area, ponto))) ?? null
}

// A borda da taxa (RF48): a maior distância em linha reta do ponto inicial do bioma até o ponto andável mais longe
export function distanciaAteABorda(inicio, regioes) {
  let maior = 0
  for (const regiao of regioes) {
    const cantos = regiao.poligono ?? [
      [regiao.x0, regiao.y0],
      [regiao.x1, regiao.y0],
      [regiao.x0, regiao.y1],
      [regiao.x1, regiao.y1],
    ]
    for (const [x, y] of cantos) maior = Math.max(maior, Math.hypot(x - inicio.x, y - inicio.y))
  }
  return Math.round(maior)
}

// Árvores e pedras espalhadas numa grade com desvio: com o espaçamento bem maior que o maior obstáculo, sempre sobra
// passagem entre eles (ninguém fica preso nem fecha um caminho). Nada nasce perto dos pontos livres (inícios das
// regiões, lugar do Boss) nem saindo da faixa andável.
// config: { espacamento, desvio, densidade: { idDaRegiao: 0..1 }, arvore: { min, max }, pedra: { largura: [min, max],
// altura: [min, max] }, chanceDePedra, margem, passagemMinima (px livres entre dois obstáculos) }
export function gerarObstaculos(regioes, livres, config, semente) {
  const sorteio = criarSorteio(semente)
  const entre = ([min, max]) => Math.round(min + (max - min) * sorteio())
  const obstaculos = []
  for (const regiao of regioes) {
    const densidade = config.densidade[regiao.id] ?? 0
    for (let gx = regiao.x0 + config.espacamento / 2; gx < regiao.x1; gx += config.espacamento) {
      for (let gy = regiao.y0 + config.espacamento / 2; gy < regiao.y1; gy += config.espacamento) {
        // Sorteia sempre os mesmos números por casa, para o mapa não mudar quando a densidade muda
        const vale = sorteio() < densidade
        const x = Math.round(gx + (sorteio() * 2 - 1) * config.desvio)
        const y = Math.round(gy + (sorteio() * 2 - 1) * config.desvio)
        const pedra = sorteio() < config.chanceDePedra
        const largura = pedra ? entre(config.pedra.largura) : entre([config.arvore.min, config.arvore.max])
        const altura = pedra ? entre(config.pedra.altura) : largura
        if (!vale) continue
        const m = config.margem
        const dentro = regiao.poligono
          ? [
              [x - largura / 2 - m, y - altura / 2 - m],
              [x + largura / 2 + m, y - altura / 2 - m],
              [x - largura / 2 - m, y + altura / 2 + m],
              [x + largura / 2 + m, y + altura / 2 + m],
            ].every(([px, py]) => regiaoEm(regioes, { x: px, y: py }) === regiao)
          : x - largura / 2 >= regiao.x0 && x + largura / 2 <= regiao.x1 && y - altura / 2 >= regiao.y0 + m && y + altura / 2 <= regiao.y1 - m
        if (!dentro) continue
        const meiaDiagonal = Math.hypot(largura, altura) / 2
        if (livres.some((livre) => Math.hypot(livre.x - x, livre.y - y) < livre.raio + meiaDiagonal)) continue
        // Passagem garantida entre dois obstáculos vizinhos (o desvio poderia aproximá-los demais)
        const apertado = obstaculos.some(
          (outro) =>
            Math.max(Math.abs(outro.x - x) - (outro.largura + largura) / 2, Math.abs(outro.y - y) - (outro.altura + altura) / 2) <
            (config.passagemMinima ?? 0),
        )
        if (apertado) continue
        obstaculos.push({ x, y, largura, altura, tipo: pedra ? 'pedra' : 'arvore' })
      }
    }
  }
  return obstaculos
}

// ---------- Minimapa que acompanha o Líder (Parte 5) ----------

// O pedaço do mapa que o minimapa do HUD mostra: uma janela do tamanho dado em volta do Líder, sem sair do mapa. No mapa
// que cabe inteiro na janela (a arena), o mapa todo. Devolve { x, y, largura, altura } em px do mundo (x e y no canto).
export function janelaDoMinimapa(centro, tamanho, janela) {
  if (!janela || (tamanho.largura <= janela.largura && tamanho.altura <= janela.altura)) return { x: 0, y: 0, largura: tamanho.largura, altura: tamanho.altura }
  const largura = Math.min(janela.largura, tamanho.largura)
  const altura = Math.min(janela.altura, tamanho.altura)
  const limitar = (valor, maximo) => Math.min(Math.max(valor, 0), maximo)
  return { x: limitar(centro.x - largura / 2, tamanho.largura - largura), y: limitar(centro.y - altura / 2, tamanho.altura - altura), largura, altura }
}

// ---------- Névoa do minimapa (RF40) ----------

// Grade de células sobre o mapa; cada célula começa escura (0) e fica revelada (1)
export function criarNevoa({ largura, altura }, celula, revelada = null) {
  const colunas = Math.ceil(largura / celula)
  const linhas = Math.ceil(altura / celula)
  const bits = new Uint8Array(colunas * linhas)
  if (revelada) bits.set(revelada.subarray(0, bits.length))
  return { colunas, linhas, celula, bits }
}

// Revela as células cujo centro está a até "raio" do ponto. Devolve quantas eram novas.
export function revelarEmVolta(nevoa, ponto, raio) {
  const { colunas, linhas, celula, bits } = nevoa
  const c0 = Math.max(0, Math.floor((ponto.x - raio) / celula))
  const c1 = Math.min(colunas - 1, Math.floor((ponto.x + raio) / celula))
  const l0 = Math.max(0, Math.floor((ponto.y - raio) / celula))
  const l1 = Math.min(linhas - 1, Math.floor((ponto.y + raio) / celula))
  let novas = 0
  for (let l = l0; l <= l1; l++) {
    for (let c = c0; c <= c1; c++) {
      const indice = l * colunas + c
      if (bits[indice]) continue
      if (Math.hypot((c + 0.5) * celula - ponto.x, (l + 0.5) * celula - ponto.y) <= raio) {
        bits[indice] = 1
        novas++
      }
    }
  }
  return novas
}

// Névoa ↔ texto curto para o save: 4 células por caractere hexadecimal
export function codificarNevoa(bits) {
  let texto = ''
  for (let i = 0; i < bits.length; i += 4) {
    const valor = (bits[i] ? 8 : 0) | (bits[i + 1] ? 4 : 0) | (bits[i + 2] ? 2 : 0) | (bits[i + 3] ? 1 : 0)
    texto += valor.toString(16)
  }
  return texto
}

export function decodificarNevoa(texto, total) {
  const bits = new Uint8Array(total)
  if (typeof texto !== 'string') return bits
  for (let i = 0; i < texto.length && i * 4 < total; i++) {
    const valor = parseInt(texto[i], 16)
    if (!Number.isInteger(valor)) continue
    for (let b = 0; b < 4 && i * 4 + b < total; b++) bits[i * 4 + b] = (valor >> (3 - b)) & 1
  }
  return bits
}

// Junta duas névoas (o que já estava salvo e o que a partida revelou)
export function juntarNevoas(textoA, textoB, total) {
  const a = decodificarNevoa(textoA, total)
  const b = decodificarNevoa(textoB, total)
  for (let i = 0; i < total; i++) a[i] = a[i] || b[i] ? 1 : 0
  return codificarNevoa(a)
}

// ---------- Pontos de partida (RF32) ----------

// O início da região de onde se escolheu nascer ("inicio" = a zona segura); sem a região, o ponto inicial do bioma
export function inicioDoPontoDePartida(regioes, idDoPonto) {
  // a Caravana (Parte 7) usa o id da zona neutra; os pontos antigos, o "pontoDePartida" da região
  const regiao = regioes.find((uma) => uma.pontoDePartida === idDoPonto || uma.id === idDoPonto) ?? regioes[0]
  return { ...regiao.inicio }
}
