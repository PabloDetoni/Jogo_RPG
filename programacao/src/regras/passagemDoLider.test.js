import { describe, expect, it } from 'vitest'
import { combateDeTeste } from '../dados/balanceamento.js'
import { colisaoVolta, ladoParaSair, liderAtravessa, naFrenteDoLider, saidaDoAliado, velocidadeParaAbrir } from './passagemDoLider.js'

const r = 12.8
const lider = { x: 100, y: 300, raio: r }
const paraADireita = { x: 220, y: 0 }
const area = { x: 500, y: 300, largura: 1000, altura: 600 }

describe('passar pelos aliados: quem está no caminho (ajustes da partida, 14/10)', () => {
  it('à frente e perto da linha do caminho: está no caminho; atrás, longe ou bem ao lado, não', () => {
    expect(naFrenteDoLider(lider, paraADireita, { x: 160, y: 305, raio: r }, 100)).toBe(true)
    expect(naFrenteDoLider(lider, paraADireita, { x: 60, y: 300, raio: r }, 100)).toBe(false)
    expect(naFrenteDoLider(lider, paraADireita, { x: 400, y: 300, raio: r }, 100)).toBe(false)
    expect(naFrenteDoLider(lider, paraADireita, { x: 160, y: 360, raio: r }, 100)).toBe(false)
    expect(naFrenteDoLider(lider, { x: 0, y: 0 }, { x: 130, y: 300, raio: r }, 100)).toBe(false)
  })

  it('sai para o lado em que já está (na linha: a direita do caminho)', () => {
    const embaixo = ladoParaSair(lider, paraADireita, { x: 160, y: 310, raio: r })
    const emCima = ladoParaSair(lider, paraADireita, { x: 160, y: 290, raio: r })
    expect([Math.abs(embaixo.x), embaixo.y]).toEqual([0, 1])
    expect([Math.abs(emCima.x), emCima.y]).toEqual([0, -1])
  })
})

describe('passar pelos aliados: encurralado', () => {
  const aliado = { x: 160, y: 300, raio: r }

  it('em campo aberto, tem para onde sair (não está encurralado)', () => {
    expect(saidaDoAliado(lider, paraADireita, aliado, { paredes: [], area, outros: [] })).not.toBe(null)
  })

  it('num corredor estreito (pedra dos dois lados), está encurralado', () => {
    const paredes = [
      { x: 160, y: 260, largura: 400, altura: 40 }, // de y 240 a 280
      { x: 160, y: 340, largura: 400, altura: 40 }, // de y 320 a 360
    ]
    expect(saidaDoAliado(lider, paraADireita, aliado, { paredes, area, outros: [] })).toBe(null)
  })

  it('com a pedra de um lado, sai pelo outro', () => {
    const paredes = [{ x: 160, y: 340, largura: 400, altura: 40 }] // embaixo
    const saida = saidaDoAliado(lider, paraADireita, aliado, { paredes, area, outros: [] })
    expect([Math.abs(saida.x), saida.y]).toEqual([0, -1])
  })

  it('no canto (borda e outro aliado), está encurralado', () => {
    const noCanto = { x: 160, y: area.y - area.altura / 2 + r + 1, raio: r }
    const liderNoCanto = { ...lider, y: noCanto.y }
    const outros = [{ x: 160, y: noCanto.y + 2 * r + 2, raio: r }]
    expect(saidaDoAliado(liderNoCanto, paraADireita, noCanto, { paredes: [], area, outros })).toBe(null)
  })
})

describe('passar pelos aliados: atravessar e a colisão voltar', () => {
  it('o Líder atravessa o encurralado e, na fuga ou no retorno, todos', () => {
    expect(liderAtravessa({ fugindoOuRetornando: false, encurralado: false })).toBe(false)
    expect(liderAtravessa({ fugindoOuRetornando: false, encurralado: true })).toBe(true)
    expect(liderAtravessa({ fugindoOuRetornando: true, encurralado: false })).toBe(true)
  })

  it('a colisão volta quando os dois já não se tocam', () => {
    expect(colisaoVolta(lider, { x: 110, y: 300, raio: r })).toBe(false)
    expect(colisaoVolta(lider, { x: 100 + 2 * r + 10, y: 300, raio: r })).toBe(true)
  })

  it('a velocidade de abrir: perpendicular, mais forte perto, e a avançada começa mais longe que a básica', () => {
    const lado = { x: 0, y: 1 }
    const perto = velocidadeParaAbrir(lider, { x: 130, y: 300, raio: r }, lado, 'media')
    const longe = velocidadeParaAbrir(lider, { x: 180, y: 300, raio: r }, lado, 'media')
    expect(perto.x).toBe(0)
    expect(perto.y).toBeGreaterThan(longe.y)
    const { alcance, forca } = combateDeTeste.passagemDoLider
    expect(alcance.avancada).toBeGreaterThan(alcance.basica)
    expect(forca.avancada).toBeGreaterThanOrEqual(forca.basica)
    expect(perto.y).toBeLessThanOrEqual(combateDeTeste.personagem.velocidade)
  })
})
