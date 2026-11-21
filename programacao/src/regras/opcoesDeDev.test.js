import { describe, expect, it } from 'vitest'
import { combateDeTeste } from '../dados/balanceamento.js'
import { saltoMaximoPorQuadro } from './movimento.js'
import { multiplicadorQueVale, multiplicadoresDaSuperVelocidade, pontoDoMinimapa, proximoMultiplicador, saltoMaximoComDev } from './opcoesDeDev.js'

const quadro = 1000 / 60

describe('super velocidade (RF61, só no npm run dev)', () => {
  it('o botão passa por 1×, 3× e 6× e volta ao 1×', () => {
    expect(multiplicadoresDaSuperVelocidade).toEqual([1, 3, 6])
    expect(proximoMultiplicador(1)).toBe(3)
    expect(proximoMultiplicador(3)).toBe(6)
    expect(proximoMultiplicador(6)).toBe(1)
    expect(proximoMultiplicador(42)).toBe(1)
  })

  it('no jogo publicado o multiplicador é sempre 1', () => {
    expect(multiplicadorQueVale(6, false)).toBe(1)
    expect(multiplicadorQueVale(3, false)).toBe(1)
    expect(multiplicadorQueVale(6, true)).toBe(6)
    expect(multiplicadorQueVale(100, true)).toBe(1)
  })
})

describe('a trava "nunca teletransportar" com a exceção de dev', () => {
  it('no jogo de verdade a trava é exatamente a de sempre, mesmo pedindo 6×', () => {
    for (const ms of [0, 8, quadro, 33, 100]) {
      expect(saltoMaximoComDev(ms, { dev: false, multiplicador: 6 })).toBe(saltoMaximoPorQuadro(ms))
      expect(saltoMaximoComDev(ms)).toBe(saltoMaximoPorQuadro(ms))
    }
  })

  it('no dev, em 1×, também é a de sempre', () => {
    expect(saltoMaximoComDev(quadro, { dev: true, multiplicador: 1 })).toBe(saltoMaximoPorQuadro(quadro))
  })

  it('no dev, em 3× e 6×, o maior passo cresce com a velocidade (a correção máxima não muda)', () => {
    const { velocidadeMaxima, correcaoMaximaPorQuadro } = combateDeTeste.movimento
    expect(saltoMaximoComDev(quadro, { dev: true, multiplicador: 6 })).toBeCloseTo((velocidadeMaxima * 6 * quadro) / 1000 + correcaoMaximaPorQuadro)
    expect(saltoMaximoComDev(quadro, { dev: true, multiplicador: 3 })).toBeGreaterThan(saltoMaximoPorQuadro(quadro))
    // o Líder a 6× passa da velocidade máxima do jogo de verdade (a trava conta com ela) e cabe na de dev
    const velocidadeA6x = combateDeTeste.personagem.velocidade * 6
    expect(velocidadeA6x).toBeGreaterThan(velocidadeMaxima)
    expect(velocidadeA6x).toBeLessThanOrEqual(velocidadeMaxima * 6)
  })
})

describe('teletransporte pelo minimapa', () => {
  const tamanho = { largura: 7200, altura: 3600 }
  it('o clique na caixa do minimapa vira o ponto do mapa', () => {
    expect(pontoDoMinimapa({ x: 90, y: 45 }, { largura: 180, altura: 90 }, tamanho)).toEqual({ x: 3600, y: 1800 })
    expect(pontoDoMinimapa({ x: 0, y: 0 }, { largura: 180, altura: 90 }, tamanho)).toEqual({ x: 0, y: 0 })
    // a caixa na tela pode ter outro tamanho (o minimapa estica com a tela)
    expect(pontoDoMinimapa({ x: 270, y: 135 }, { largura: 360, altura: 180 }, tamanho)).toEqual({ x: 5400, y: 2700 })
  })

  it('fora da caixa fica na beira do mapa; caixa sem tamanho não dá ponto', () => {
    expect(pontoDoMinimapa({ x: -10, y: 500 }, { largura: 180, altura: 90 }, tamanho)).toEqual({ x: 0, y: 3600 })
    expect(pontoDoMinimapa({ x: 5, y: 5 }, { largura: 0, altura: 90 }, tamanho)).toBeNull()
  })
})
