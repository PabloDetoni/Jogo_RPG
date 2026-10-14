import { describe, expect, it } from 'vitest'
import { dicaSorteada, dicasDoCarregamento } from '../dados/dicasDoCarregamento.js'
import { carregamentoInicial, demorouDemais, etapasDoCarregamento, progressoDoCarregamento } from './carregamento.js'

describe('carregamento da partida (ajustes de 14/10)', () => {
  it('os pesos das etapas somam 1', () => {
    expect(etapasDoCarregamento.reduce((soma, etapa) => soma + etapa.peso, 0)).toBeCloseTo(1)
  })

  it('começa em 0, na primeira etapa, e termina em 1, "Pronto"', () => {
    expect(progressoDoCarregamento(carregamentoInicial())).toEqual({ fracao: 0, etapa: 'Preparando o motor do jogo' })
    expect(progressoDoCarregamento({ motor: 1, arte: 1, som: 1, mundo: 1 })).toEqual({ fracao: 1, etapa: 'Pronto' })
  })

  it('o progresso só sobe e diz a etapa que falta', () => {
    const meio = progressoDoCarregamento({ motor: 1, arte: 0.5, som: 0, mundo: 0 })
    expect(meio.fracao).toBeCloseTo(0.3 + 0.225)
    expect(meio.etapa).toBe('Carregando a arte')
    expect(progressoDoCarregamento({ motor: 1, arte: 1, som: 0.5, mundo: 0 }).fracao).toBeGreaterThan(meio.fracao)
  })

  it('valores estranhos não passam de 0 a 1', () => {
    expect(progressoDoCarregamento({ motor: 5, arte: -2, som: 'x', mundo: null }).fracao).toBeCloseTo(0.3)
  })

  it('demorou demais: só quando o mapa ainda não ficou pronto depois do limite', () => {
    expect(demorouDemais(0, 25000, { mundo: 0 }, 20000)).toBe(true)
    expect(demorouDemais(0, 15000, { mundo: 0 }, 20000)).toBe(false)
    expect(demorouDemais(0, 25000, { mundo: 1 }, 20000)).toBe(false)
  })

  it('a dica sorteada é sempre uma da lista, curta', () => {
    expect(dicasDoCarregamento.every((dica) => dica.length <= 110)).toBe(true)
    expect(dicaSorteada(() => 0)).toBe(dicasDoCarregamento[0])
    expect(dicaSorteada(() => 0.9999)).toBe(dicasDoCarregamento.at(-1))
  })
})
