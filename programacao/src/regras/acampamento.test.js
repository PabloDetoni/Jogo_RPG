import { describe, expect, it } from 'vitest'
import { acampamentoEm, dentroDoAcampamento, diferencaDeAngulo, goblinParaCurar, lugaresNoAcampamento, troncosDaPalicada } from './acampamento.js'

const acampamento = { centro: { x: 1000, y: 1000 }, raio: 300, entradas: [0, Math.PI] }
const medidas = { tronco: 30, larguraDaEntrada: 120 }

describe('acampamento goblin (Parte 6b)', () => {
  it('os troncos ficam no círculo, encostados, sem passagem entre eles', () => {
    const troncos = troncosDaPalicada({ ...acampamento, entradas: [] }, medidas)
    for (const t of troncos) expect(Math.hypot(t.x - 1000, t.y - 1000)).toBeCloseTo(300, -1)
    // a distância entre vizinhos é menor que o tronco (nem o menor corpo passa)
    const vizinhos = Math.hypot(troncos[1].x - troncos[0].x, troncos[1].y - troncos[0].y)
    expect(vizinhos).toBeLessThan(30)
    expect(troncos.every((t) => t.tipo === 'palicada')).toBe(true)
  })

  it('cada entrada é um buraco da largura pedida no arco', () => {
    const troncos = troncosDaPalicada(acampamento, medidas)
    const perto = (angulo) => troncos.filter((t) => Math.abs(diferencaDeAngulo(t.angulo, angulo)) < 0.15)
    expect(perto(0)).toHaveLength(0)
    expect(perto(Math.PI)).toHaveLength(0)
    expect(perto(Math.PI / 2).length).toBeGreaterThan(0)
    // a abertura: entre os troncos dos dois lados da entrada cabe a largura (menos a metade de cada tronco)
    const lados = troncos.map((t) => diferencaDeAngulo(t.angulo, 0)).filter((d) => Math.abs(d) < 1)
    const abertura = (Math.min(...lados.filter((d) => d > 0)) - Math.max(...lados.filter((d) => d < 0))) * 300
    expect(abertura).toBeGreaterThanOrEqual(120)
  })

  it('a diferença de ângulos dá a volta', () => {
    expect(diferencaDeAngulo(0.1, 2 * Math.PI - 0.1)).toBeCloseTo(0.2)
    expect(diferencaDeAngulo(Math.PI, 0)).toBeCloseTo(Math.PI)
  })

  it('dentro do acampamento, com folga; e qual acampamento tem o ponto', () => {
    expect(dentroDoAcampamento(acampamento, { x: 1250, y: 1000 })).toBe(true)
    expect(dentroDoAcampamento(acampamento, { x: 1350, y: 1000 })).toBe(false)
    expect(dentroDoAcampamento(acampamento, { x: 1350, y: 1000 }, 100)).toBe(true)
    expect(acampamentoEm([acampamento], { x: 1100, y: 1100 })).toBe(acampamento)
    expect(acampamentoEm([acampamento], { x: 0, y: 0 })).toBeNull()
  })

  it('os goblins nascem dentro, longe da fogueira e da paliçada, sem ninguém no mesmo lugar', () => {
    const lugares = lugaresNoAcampamento(acampamento, { goblinLanceiro: 3, goblinArqueiro: 2, goblinXama: 1 }, { longeDaFogueira: 90, longeDaPalicada: 80 })
    expect(lugares.map((l) => l.tipo)).toEqual(['goblinLanceiro', 'goblinLanceiro', 'goblinLanceiro', 'goblinArqueiro', 'goblinArqueiro', 'goblinXama'])
    for (const l of lugares) {
      const d = Math.hypot(l.x - 1000, l.y - 1000)
      expect(d).toBeGreaterThanOrEqual(89)
      expect(d).toBeLessThanOrEqual(221)
    }
    for (let a = 0; a < lugares.length; a++)
      for (let b = a + 1; b < lugares.length; b++) expect(Math.hypot(lugares[a].x - lugares[b].x, lugares[a].y - lugares[b].y)).toBeGreaterThan(40)
  })

  it('o xamã cura o mais ferido do bando perto dele (ele mesmo também); ninguém ferido, ninguém', () => {
    const xama = { x: 0, y: 0, vida: 60, vidaMaxima: 60 }
    const a = { x: 100, y: 0, vida: 30, vidaMaxima: 60 }
    const b = { x: 50, y: 0, vida: 60, vidaMaxima: 100 }
    const longe = { x: 900, y: 0, vida: 1, vidaMaxima: 60 }
    const morto = { x: 10, y: 0, vida: 0, vidaMaxima: 60, morto: true }
    expect(goblinParaCurar(xama, [xama, a, b, longe, morto], 450)).toBe(a)
    expect(goblinParaCurar(xama, [xama, { ...a, vida: 60 }], 450)).toBeNull()
    xama.vida = 10
    expect(goblinParaCurar(xama, [xama, a, b], 450)).toBe(xama)
  })
})
