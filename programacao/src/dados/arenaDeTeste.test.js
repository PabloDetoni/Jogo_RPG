import { describe, expect, it } from 'vitest'
import { circuloTocaRetangulo, retangulosSeTocam } from '../regras/combate.js'
import { boneco, coresDaArena, inicio, inimigosIniciais, manchas, pedras, pontosDeSurgimento, tamanhoDaArena } from './arenaDeTeste.js'
import { combateDeTeste } from './balanceamento.js'
import { classes } from './classes.js'

const { largura, altura } = tamanhoDaArena
const dentroDaArena = (x, y, margem = 0) => x >= margem && x <= largura - margem && y >= margem && y <= altura - margem
const faixaDaBarraDeTeste = 800 // a barra de teste cobre a parte de baixo da arena
const tamanhoDoPersonagem = combateDeTeste.personagem.tamanho
const corpoEm = (ponto, tamanho) => ({ x: ponto.x, y: ponto.y, largura: tamanho, altura: tamanho })

describe('arena de teste', () => {
  it('pedras, manchas, boneco e pontos ficam dentro da arena e acima da barra de teste', () => {
    for (const pedra of pedras) {
      expect(dentroDaArena(pedra.x - pedra.largura / 2, pedra.y - pedra.altura / 2)).toBe(true)
      expect(pedra.y + pedra.altura / 2).toBeLessThanOrEqual(faixaDaBarraDeTeste)
    }
    for (const mancha of manchas) expect(dentroDaArena(mancha.x, mancha.y)).toBe(true)
    for (const ponto of [inicio, boneco, ...inimigosIniciais, ...pontosDeSurgimento]) {
      expect(dentroDaArena(ponto.x, ponto.y, 40)).toBe(true)
      expect(ponto.y).toBeLessThanOrEqual(faixaDaBarraDeTeste)
    }
  })

  it('ninguém começa dentro de uma pedra', () => {
    for (const ponto of [inicio, boneco, ...inimigosIniciais, ...pontosDeSurgimento]) {
      for (const pedra of pedras) expect(retangulosSeTocam(corpoEm(ponto, tamanhoDoPersonagem), pedra)).toBe(false)
    }
  })

  it('o grupo inteiro cabe em volta do início sem cair numa pedra', () => {
    const raio = combateDeTeste.raioDaFormacao + tamanhoDoPersonagem
    for (const pedra of pedras) expect(circuloTocaRetangulo({ ...inicio, raio }, pedra)).toBe(false)
  })

  it('os inimigos começam longe: fora do raio de detecção deles', () => {
    for (const inimigo of inimigosIniciais) {
      const raio = combateDeTeste[inimigo.tipo].raioDeDeteccao
      expect(Math.hypot(inimigo.x - inicio.x, inimigo.y - inicio.y)).toBeGreaterThan(raio)
    }
  })

  it('começa com 3 mobs vermelhos e 1 atirador', () => {
    expect(inimigosIniciais.filter((i) => i.tipo === 'mobVermelho')).toHaveLength(3)
    expect(inimigosIniciais.filter((i) => i.tipo === 'atirador')).toHaveLength(1)
  })
})

describe('cores', () => {
  it('cada classe tem uma cor diferente, e nenhuma é a do chão nem a de um inimigo', () => {
    const cores = classes.map((classe) => classe.cor)
    expect(new Set(cores).size).toBe(classes.length)
    for (const cor of cores) {
      expect([coresDaArena.chao, coresDaArena.mancha, coresDaArena.mobVermelho, coresDaArena.atirador]).not.toContain(cor)
    }
  })
})
