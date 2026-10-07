import { describe, expect, it } from 'vitest'
import { circuloTocaRetangulo, retangulosSeTocam } from '../regras/combate.js'
import { caminhoNaGrade, criarGrade } from '../regras/movimento.js'
import { areaJogavel, boneco, coresDaArena, faixas, inicio, inimigosIniciais, manchas, pedras, pontosDeSurgimento, tamanhoDaArena } from './arenaDeTeste.js'
import { combateDeTeste } from './balanceamento.js'
import { classes } from './classes.js'

const { largura, altura } = tamanhoDaArena
const topo = areaJogavel.y - areaJogavel.altura / 2
const base = areaJogavel.y + areaJogavel.altura / 2
// Dentro da área jogável: entre a faixa do HUD e a da barra de teste
const dentroDaArea = (x, y, margem = 0) => x >= margem && x <= largura - margem && y >= topo + margem && y <= base - margem
const tamanhoDoPersonagem = combateDeTeste.personagem.tamanho
const corpoEm = (ponto, tamanho) => ({ x: ponto.x, y: ponto.y, largura: tamanho, altura: tamanho })

describe('arena de teste', () => {
  it('a área jogável fica entre a faixa do HUD e a da barra de teste', () => {
    expect(topo).toBe(faixas.hud)
    expect(base).toBe(altura - faixas.barraDeTeste)
    expect(areaJogavel.altura).toBeGreaterThan(altura * 0.7)
  })

  it('pedras, manchas, boneco e pontos ficam dentro da área jogável', () => {
    for (const pedra of pedras) {
      expect(dentroDaArea(pedra.x - pedra.largura / 2, pedra.y - pedra.altura / 2)).toBe(true)
      expect(dentroDaArea(pedra.x + pedra.largura / 2, pedra.y + pedra.altura / 2)).toBe(true)
    }
    for (const mancha of manchas) expect(dentroDaArea(mancha.x, mancha.y)).toBe(true)
    for (const ponto of [inicio, boneco, ...inimigosIniciais, ...pontosDeSurgimento]) {
      expect(dentroDaArea(ponto.x, ponto.y, tamanhoDoPersonagem / 2)).toBe(true)
    }
  })

  it('tem duas pedras coladas formando um canto (teste do travamento)', () => {
    const coladas = pedras.some((a, i) => pedras.some((b, j) => i !== j && retangulosSeTocam(a, b)))
    expect(coladas).toBe(true)
  })

  it('dá para andar de qualquer ponto a qualquer outro (nenhum lugar fechado)', () => {
    const paredes = [...pedras, corpoEm(boneco, combateDeTeste.boneco.tamanho)]
    const grade = criarGrade(areaJogavel, paredes, { celula: combateDeTeste.caminho.celula, folga: tamanhoDoPersonagem / 2 + 2 })
    const pontos = [inicio, ...inimigosIniciais, ...pontosDeSurgimento]
    for (const ponto of pontos) expect(caminhoNaGrade(grade, inicio, ponto).length).toBeGreaterThan(0)
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
