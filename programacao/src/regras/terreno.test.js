import { describe, expect, it } from 'vitest'
import { andavelNoTerreno, beiraDaMata, caixaDoPoligono, criarTerreno, paredesDoTerreno, pontoNoPoligono, retangulosDoTipo, zonaNoTerreno, zonaQueContem } from './terreno.js'

const quadrado = [[100, 100], [500, 100], [500, 300], [100, 300]]
const zonas = [{ poligono: quadrado, ...caixaDoPoligono(quadrado) }]
const tamanho = { largura: 600, altura: 400 }

describe('terreno da Floresta grande (Parte 5)', () => {
  it('ponto no polígono e a caixa dele', () => {
    expect(pontoNoPoligono(quadrado, { x: 200, y: 200 })).toBe(true)
    expect(pontoNoPoligono(quadrado, { x: 50, y: 200 })).toBe(false)
    expect(caixaDoPoligono(quadrado)).toEqual({ x0: 100, x1: 500, y0: 100, y1: 300 })
    expect(zonaQueContem(zonas, { x: 200, y: 200 })).toBe(0)
    expect(zonaQueContem(zonas, { x: 550, y: 200 })).toBe(-1)
  })

  it('a grade: as casas com o centro dentro da zona são andáveis; o resto é mata', () => {
    const terreno = criarTerreno(zonas, tamanho, 100)
    expect([terreno.colunas, terreno.linhas]).toEqual([6, 4])
    expect(andavelNoTerreno(terreno, { x: 250, y: 250 })).toBe(true)
    expect(andavelNoTerreno(terreno, { x: 50, y: 50 })).toBe(false)
    expect(andavelNoTerreno(terreno, { x: -10, y: 50 })).toBe(false)
    // a zona da casa: a mesma zona do polígono; mata e fora do mapa, nenhuma
    expect(zonaNoTerreno(terreno, zonas, { x: 250, y: 250 })).toBe(zonas[0])
    expect(zonaNoTerreno(terreno, zonas, { x: 50, y: 50 })).toBeNull()
    expect(zonaNoTerreno(terreno, zonas, { x: 9999, y: 50 })).toBeNull()
  })

  it('a mata vira retângulos que cobrem todas as casas de mata e nenhuma andável', () => {
    const terreno = criarTerreno(zonas, tamanho, 100)
    const paredes = paredesDoTerreno(terreno)
    const naParede = (x, y) => paredes.some((p) => Math.abs(x - p.x) * 2 < p.largura && Math.abs(y - p.y) * 2 < p.altura)
    for (let l = 0; l < terreno.linhas; l++) {
      for (let c = 0; c < terreno.colunas; c++) {
        const x = (c + 0.5) * 100
        const y = (l + 0.5) * 100
        expect(naParede(x, y), `${c},${l}`).toBe(terreno.tipos[l * terreno.colunas + c] === 0)
      }
    }
    // linhas iguais seguidas viram um retângulo só: a faixa de cima (linha 0) e a de baixo (linha 3), e as laterais
    expect(paredes.length).toBeLessThanOrEqual(4)
  })

  it('o chão de uma zona em retângulos: só as casas dela (para a grama com imagem não sair da zona)', () => {
    const terreno = criarTerreno(zonas, tamanho, 100)
    const chao = retangulosDoTipo(terreno, 1)
    expect(chao).toEqual([{ x: 300, y: 200, largura: 400, altura: 200 }])
    expect(retangulosDoTipo(terreno, 2)).toEqual([])
  })

  it('a beira da mata: um ponto por lado de casa de mata encostado no andável', () => {
    const terreno = criarTerreno(zonas, tamanho, 100)
    const beira = beiraDaMata(terreno)
    // a zona andável tem 4 × 2 casas: 4 + 4 (em cima e embaixo) + 2 + 2 (dos lados)
    expect(beira).toHaveLength(12)
  })
})
