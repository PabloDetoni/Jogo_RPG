// Busca rápida dos obstáculos perto de um ponto ou de um caminho (Fase 3). Num mapa grande há centenas de pedras e
// árvores; olhar todas a cada quadro, para cada corpo, pesaria. O mapa é dividido em baldes quadrados, e cada
// obstáculo fica guardado em todos os baldes que ele toca. Retângulos com x e y no centro.

export function criarIndice(retangulos, balde = 400) {
  const mapa = new Map()
  for (const retangulo of retangulos) {
    const { c0, c1, l0, l1 } = faixaDeBaldes(retangulo, balde)
    for (let l = l0; l <= l1; l++) {
      for (let c = c0; c <= c1; c++) {
        const chave = `${c},${l}`
        if (!mapa.has(chave)) mapa.set(chave, [])
        mapa.get(chave).push(retangulo)
      }
    }
  }
  return { balde, mapa, total: retangulos.length }
}

function faixaDeBaldes(caixa, balde) {
  return {
    c0: Math.floor((caixa.x - caixa.largura / 2) / balde),
    c1: Math.floor((caixa.x + caixa.largura / 2) / balde),
    l0: Math.floor((caixa.y - caixa.altura / 2) / balde),
    l1: Math.floor((caixa.y + caixa.altura / 2) / balde),
  }
}

// Os obstáculos que tocam a caixa (cada um uma vez só)
export function retangulosNaCaixa(indice, caixa) {
  const { c0, c1, l0, l1 } = faixaDeBaldes(caixa, indice.balde)
  const achados = new Set()
  for (let l = l0; l <= l1; l++) {
    for (let c = c0; c <= c1; c++) {
      const lista = indice.mapa.get(`${c},${l}`)
      if (!lista) continue
      for (const retangulo of lista) {
        if (Math.abs(retangulo.x - caixa.x) * 2 <= retangulo.largura + caixa.largura && Math.abs(retangulo.y - caixa.y) * 2 <= retangulo.altura + caixa.altura) {
          achados.add(retangulo)
        }
      }
    }
  }
  return [...achados]
}

// Os obstáculos a até "raio" de um ponto (na verdade, dentro do quadrado em volta dele)
export function retangulosPerto(indice, ponto, raio) {
  return retangulosNaCaixa(indice, { x: ponto.x, y: ponto.y, largura: raio * 2, altura: raio * 2 })
}

// Os obstáculos que podem cortar o caminho reto de a até b (a caixa em volta do caminho, com folga)
export function retangulosEntre(indice, a, b, folga = 0) {
  return retangulosNaCaixa(indice, {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    largura: Math.abs(a.x - b.x) + folga * 2,
    altura: Math.abs(a.y - b.y) + folga * 2,
  })
}
