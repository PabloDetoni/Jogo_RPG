// Terreno da Floresta grande (Parte 5 de 11/2026). Funções puras.
// As regiões e as zonas neutras são polígonos escritos à mão em dados (src/dados/mundo/floresta.js). Ao montar o mapa,
// eles viram uma grade de casas: cada casa é de uma zona (a primeira da lista que contém o centro dela) ou é mata
// fechada. A mata vira retângulos (as paredes de sempre: colisão, caminho e desenho não mudam de formato) e a beira da
// mata dá os pontos das copas desenhadas.
// Polígono: lista de pontos [[x, y], ...] (fechado: o último liga no primeiro). Retângulo de parede: x e y no centro.

// O ponto está dentro do polígono? (raio que cruza as arestas)
export function pontoNoPoligono(pontos, { x, y }) {
  let dentro = false
  for (let i = 0, j = pontos.length - 1; i < pontos.length; j = i++) {
    const [xi, yi] = pontos[i]
    const [xj, yj] = pontos[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) dentro = !dentro
  }
  return dentro
}

// A caixa em volta do polígono: { x0, x1, y0, y1 }
export function caixaDoPoligono(pontos) {
  const xs = pontos.map(([x]) => x)
  const ys = pontos.map(([, y]) => y)
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) }
}

// A zona (índice na lista) que contém o ponto, ou -1 (mata). zonas: [{ poligono, x0, x1, y0, y1 }]
export function zonaQueContem(zonas, ponto) {
  for (let i = 0; i < zonas.length; i++) {
    const z = zonas[i]
    if (ponto.x < z.x0 || ponto.x > z.x1 || ponto.y < z.y0 || ponto.y > z.y1) continue
    if (pontoNoPoligono(z.poligono, ponto)) return i
  }
  return -1
}

// A grade do terreno: tipos[l * colunas + c] = 0 (mata) ou o índice da zona + 1
export function criarTerreno(zonas, { largura, altura }, celula) {
  const colunas = Math.ceil(largura / celula)
  const linhas = Math.ceil(altura / celula)
  const tipos = new Uint8Array(colunas * linhas)
  for (let l = 0; l < linhas; l++) {
    for (let c = 0; c < colunas; c++) {
      tipos[l * colunas + c] = zonaQueContem(zonas, { x: (c + 0.5) * celula, y: (l + 0.5) * celula }) + 1
    }
  }
  return { colunas, linhas, celula, tipos }
}

// A casa do ponto é andável? (fora do mapa, não)
export function andavelNoTerreno(terreno, { x, y }) {
  const c = Math.floor(x / terreno.celula)
  const l = Math.floor(y / terreno.celula)
  if (c < 0 || l < 0 || c >= terreno.colunas || l >= terreno.linhas) return false
  return terreno.tipos[l * terreno.colunas + c] > 0
}

// A zona da casa do ponto (o objeto da lista "zonas", na mesma ordem de criarTerreno), ou null (mata ou fora do mapa).
// Na beira, a casa andável pode passar um pouco do polígono: a região do ponto continua a da casa onde ele pisa.
export function zonaNoTerreno(terreno, zonas, { x, y }) {
  const c = Math.floor(x / terreno.celula)
  const l = Math.floor(y / terreno.celula)
  if (c < 0 || l < 0 || c >= terreno.colunas || l >= terreno.linhas) return null
  const tipo = terreno.tipos[l * terreno.colunas + c]
  return tipo > 0 ? (zonas[tipo - 1] ?? null) : null
}

// A mata em retângulos: junta as casas de mata em faixas por linha e depois junta as faixas iguais de linhas seguidas.
// Devolve retângulos com x e y no centro (o formato das paredes da cena).
export function paredesDoTerreno({ colunas, linhas, celula, tipos }) {
  const abertas = new Map() // "c0,c1" → { c0, c1, l0 } da faixa que ainda pode crescer para baixo
  const paredes = []
  const fechar = ({ c0, c1, l0 }, l1) =>
    paredes.push({ x: ((c0 + c1 + 1) / 2) * celula, y: ((l0 + l1 + 1) / 2) * celula, largura: (c1 - c0 + 1) * celula, altura: (l1 - l0 + 1) * celula })
  for (let l = 0; l <= linhas; l++) {
    const faixas = new Set()
    if (l < linhas) {
      let c = 0
      while (c < colunas) {
        if (tipos[l * colunas + c] !== 0) {
          c++
          continue
        }
        const c0 = c
        while (c < colunas && tipos[l * colunas + c] === 0) c++
        faixas.add(`${c0},${c - 1}`)
      }
    }
    for (const [chave, aberta] of abertas) {
      if (faixas.has(chave)) {
        faixas.delete(chave)
        continue
      }
      fechar(aberta, l - 1)
      abertas.delete(chave)
    }
    for (const chave of faixas) {
      const [c0, c1] = chave.split(',').map(Number)
      abertas.set(chave, { c0, c1, l0: l })
    }
  }
  return paredes
}

// A beira da mata: o meio de cada lado de casa de mata encostado numa casa andável (onde vão as copas). Devolve
// [{ x, y }] em px, um pouco para dentro da mata.
export function beiraDaMata({ colunas, linhas, celula, tipos }, recuo = 0.2) {
  const pontos = []
  const mata = (c, l) => c < 0 || l < 0 || c >= colunas || l >= linhas || tipos[l * colunas + c] === 0
  for (let l = 0; l < linhas; l++) {
    for (let c = 0; c < colunas; c++) {
      if (!mata(c, l)) continue
      const cx = (c + 0.5) * celula
      const cy = (l + 0.5) * celula
      if (!mata(c + 1, l)) pontos.push({ x: (c + 1 - recuo) * celula, y: cy })
      if (!mata(c - 1, l)) pontos.push({ x: (c + recuo) * celula, y: cy })
      if (!mata(c, l + 1)) pontos.push({ x: cx, y: (l + 1 - recuo) * celula })
      if (!mata(c, l - 1)) pontos.push({ x: cx, y: (l + recuo) * celula })
    }
  }
  return pontos
}
