import { describe, expect, it } from 'vitest'
import { combateDeTeste } from '../dados/balanceamento.js'
import { atualizarFoco, chanceDeErro, nivelDaIA, nivelParaTestar, nomeDoNivelDaIA, sortear } from './nivelDaIA.js'

const { foco } = combateDeTeste.ia

describe('nível da IA pelo nível do personagem (5b.1)', () => {
  it('1 a 29 é básica, 30 a 69 é média, 70 a 100 é avançada', () => {
    expect(nivelDaIA(1)).toBe('basica')
    expect(nivelDaIA(29)).toBe('basica')
    expect(nivelDaIA(30)).toBe('media')
    expect(nivelDaIA(69)).toBe('media')
    expect(nivelDaIA(70)).toBe('avancada')
    expect(nivelDaIA(100)).toBe('avancada')
  })

  it('o nome que aparece no HUD', () => {
    expect(['basica', 'media', 'avancada'].map(nomeDoNivelDaIA)).toEqual(['básica', 'média', 'avançada'])
  })

  it('a barra de teste usa um nível do meio de cada faixa', () => {
    for (const id of ['basica', 'media', 'avancada']) expect(nivelDaIA(nivelParaTestar(id))).toBe(id)
  })
})

describe('chance de errar', () => {
  it('cai sempre conforme o nível sobe, sem pular para cima entre as faixas', () => {
    let anterior = 1
    for (let nivel = 1; nivel <= 100; nivel++) {
      const chance = chanceDeErro(nivel)
      expect(chance).toBeLessThanOrEqual(anterior + 1e-9)
      anterior = chance
    }
  })

  it('ninguém é perfeito: nem o nível 100 chega a 0', () => {
    expect(chanceDeErro(100)).toBeGreaterThan(0)
    expect(chanceDeErro(1)).toBeLessThan(0.5)
  })

  it('a média erra menos que a básica e mais que a avançada', () => {
    expect(chanceDeErro(50)).toBeLessThan(chanceDeErro(15))
    expect(chanceDeErro(50)).toBeGreaterThan(chanceDeErro(85))
  })

  it('em foco, a avançada quase não erra; o foco não muda a básica nem a média', () => {
    expect(chanceDeErro(85, { emFoco: true })).toBe(foco.erro)
    expect(chanceDeErro(15, { emFoco: true })).toBe(chanceDeErro(15))
    expect(chanceDeErro(50, { emFoco: true })).toBe(chanceDeErro(50))
  })

  it('"como na básica": o Tanque da média ainda erra como a básica', () => {
    expect(chanceDeErro(50, { comoBasica: true })).toBeGreaterThanOrEqual(chanceDeErro(29))
  })

  it('sortear usa a chance dada', () => {
    expect(sortear(0.3, () => 0.1)).toBe(true)
    expect(sortear(0.3, () => 0.5)).toBe(false)
  })
})

describe('momento de foco (avançada)', () => {
  const base = { focoAte: 0, agora: 10000, fracaoDaVidaDoLider: 1, alguemCaido: false }

  it('sem motivo, não há foco', () => {
    expect(atualizarFoco(base)).toBe(0)
  })

  it('Líder com pouca vida ou alguém caído: foco por um tempo', () => {
    expect(atualizarFoco({ ...base, fracaoDaVidaDoLider: foco.vidaDoLider - 0.01 })).toBe(10000 + foco.msDeDuracao)
    expect(atualizarFoco({ ...base, alguemCaido: true })).toBe(10000 + foco.msDeDuracao)
  })

  it('o foco continua até acabar o tempo, mesmo sem o motivo', () => {
    expect(atualizarFoco({ ...base, focoAte: 15000 })).toBe(15000)
    expect(atualizarFoco({ ...base, focoAte: 9000 })).toBe(0)
  })
})
