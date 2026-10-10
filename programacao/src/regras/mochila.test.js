import { describe, expect, it, vi } from 'vitest'
import {
  ajustarLevar,
  capacidadeDaMochila,
  deixarNoReino,
  guardarNaMochila,
  itensLevados,
  juntarItens,
  levarNaPartida,
  oQueFalta,
  pesoDeLevar,
  pesoTotal,
  porNaMochila,
  quantidadeNaMochila,
  tirarDaMochila,
} from './mochila.js'

vi.mock('../dados/balanceamento.js', async (importarOriginal) => ({
  ...(await importarOriginal()),
  capacidadePorPontoDeForca: 2,
}))

const pocao = (quantidade) => ({ id: 'pocao', peso: 2, quantidade })
const pele = (quantidade) => ({ id: 'pele', peso: 3, quantidade })

describe('capacidadeDaMochila (RF33)', () => {
  it('soma a Força de todo o grupo e multiplica pela capacidade por ponto', () => {
    expect(capacidadeDaMochila([15, 4])).toBe(38)
    expect(capacidadeDaMochila([])).toBe(0)
  })
})

describe('pesoTotal', () => {
  it('soma peso × quantidade de cada item', () => {
    expect(pesoTotal([pocao(3), pele(2)])).toBe(12)
    expect(pesoTotal([])).toBe(0)
  })
})

describe('guardarNaMochila (RF40)', () => {
  it('quando cabe tudo, nada cai no chão', () => {
    expect(guardarNaMochila([], pocao(5), 20)).toEqual({ itens: [pocao(5)], noChao: null })
  })

  it('entra o que cabe e o resto cai no chão', () => {
    // capacidade 10, já tem 6 de peso: cabem 2 poções de 2
    const { itens, noChao } = guardarNaMochila([pele(2)], pocao(5), 10)
    expect(itens).toEqual([pele(2), pocao(2)])
    expect(noChao).toEqual(pocao(3))
  })

  it('mochila cheia: tudo cai no chão', () => {
    expect(guardarNaMochila([pele(2)], pocao(1), 6)).toEqual({ itens: [pele(2)], noChao: pocao(1) })
  })

  it('itens iguais ficam juntos', () => {
    expect(guardarNaMochila([pocao(1)], pocao(2), 20).itens).toEqual([pocao(3)])
  })

  it('item sem peso sempre cabe', () => {
    const papel = { id: 'papel', peso: 0, quantidade: 4 }
    expect(guardarNaMochila([pele(10)], papel, 0)).toEqual({ itens: [pele(10), papel], noChao: null })
  })

  it('Força ou quantidade negativa contam como zero (TEST-003)', () => {
    expect(capacidadeDaMochila([-10, 5])).toBe(10)
    expect(guardarNaMochila([pocao(1)], pocao(-3), 20)).toEqual({ itens: [pocao(1)], noChao: null })
  })

  it('não altera a mochila original', () => {
    const antes = [pocao(1)]
    guardarNaMochila(antes, pocao(2), 20)
    expect(antes).toEqual([pocao(1)])
  })
})

describe('Mochila do Reino (Fase 4, TASK-072)', () => {
  const mochila = [
    { id: 'pocaoDeVida', quantidade: 3 },
    { id: 'peleDeLobo', quantidade: 5 },
  ]

  it('junta itens repetidos e tira os zerados', () => {
    expect(juntarItens([{ id: 'a', quantidade: 2 }, { id: 'b', quantidade: 1 }, { id: 'a', quantidade: 3 }, { id: 'c', quantidade: 0 }])).toEqual([
      { id: 'a', quantidade: 5 },
      { id: 'b', quantidade: 1 },
    ])
  })

  it('quantidade, pôr e o que falta', () => {
    expect(quantidadeNaMochila(mochila, 'peleDeLobo')).toBe(5)
    expect(quantidadeNaMochila(mochila, 'madeira')).toBe(0)
    expect(porNaMochila(mochila, { peleDeLobo: 2, madeira: 1 })).toEqual([
      { id: 'pocaoDeVida', quantidade: 3 },
      { id: 'peleDeLobo', quantidade: 7 },
      { id: 'madeira', quantidade: 1 },
    ])
    expect(oQueFalta(mochila, { peleDeLobo: 7, pocaoDeVida: 1, madeira: 2 })).toEqual([
      { id: 'peleDeLobo', falta: 2 },
      { id: 'madeira', falta: 2 },
    ])
  })

  it('tirar: com o bastante, tira (e some o que zerou); sem o bastante, nada muda', () => {
    expect(tirarDaMochila(mochila, { pocaoDeVida: 1 })).toEqual({ ok: true, mochila: [{ id: 'pocaoDeVida', quantidade: 2 }, { id: 'peleDeLobo', quantidade: 5 }] })
    expect(tirarDaMochila(mochila, { peleDeLobo: 5 }).mochila).toEqual([{ id: 'pocaoDeVida', quantidade: 3 }])
    expect(tirarDaMochila(mochila, { peleDeLobo: 6, pocaoDeVida: 1 })).toEqual({ ok: false, falta: [{ id: 'peleDeLobo', falta: 1 }] })
  })
})

describe('mochila da partida na Preparação (Fase 4, TASK-073)', () => {
  const reino = [
    { id: 'pocaoDeVida', quantidade: 5 },
    { id: 'pocaoGrandeDeVida', quantidade: 10 },
    { id: 'peleDeLobo', quantidade: 4 },
  ]

  it('leva poções da Mochila do Reino, contando o peso', () => {
    const r = levarNaPartida({}, reino, 'pocaoDeVida', 2, 20)
    expect(r).toEqual({ ok: true, levar: { pocaoDeVida: 2 } })
    expect(pesoDeLevar({ pocaoDeVida: 2, pocaoGrandeDeVida: 3 })).toBe(8)
  })

  it('critério do card: com 18 de 19 usados, um item de peso 2 não entra e aparece o motivo', () => {
    const levar = { pocaoGrandeDeVida: 9 } // 18 de peso
    expect(levarNaPartida(levar, reino, 'pocaoGrandeDeVida', 1, 19)).toEqual({
      ok: false,
      motivo: 'Não cabe: a mochila da partida tem 1 de peso livre e Poção grande de vida pesa 2.',
    })
    expect(levarNaPartida(levar, reino, 'pocaoDeVida', 1, 19).ok).toBe(true) // peso 1 ainda cabe
  })

  it('não leva o que não se usa na partida, nem mais do que existe na Mochila', () => {
    expect(levarNaPartida({}, reino, 'peleDeLobo', 1, 50).motivo).toContain('poções e aceleradores')
    expect(levarNaPartida({ pocaoDeVida: 5 }, reino, 'pocaoDeVida', 1, 50)).toEqual({ ok: false, motivo: 'Você não tem mais Poção de vida na Mochila.' })
    expect(levarNaPartida({}, reino, 'pocaoDeVida', 0, 50).ok).toBe(false)
  })

  it('deixar no Reino tira do que vai (e some quando zera)', () => {
    expect(deixarNoReino({ pocaoDeVida: 2, pocaoDeMana: 1 }, 'pocaoDeVida', 1)).toEqual({ pocaoDeVida: 1, pocaoDeMana: 1 })
    expect(deixarNoReino({ pocaoDeVida: 2 }, 'pocaoDeVida', 2)).toEqual({})
  })

  it('ao começar, ajusta a escolha guardada à Mochila de agora e à capacidade', () => {
    // pediu 8 poções e 3 peles, mas só tem 5 poções e pele não vai; capacidade 4 → 4 poções
    expect(ajustarLevar({ pocaoDeVida: 8, peleDeLobo: 3, itemVelho: 2 }, reino, 4)).toEqual({ pocaoDeVida: 4 })
    expect(ajustarLevar(undefined, reino, 10)).toEqual({})
  })

  it('o que vai vira itens da mochila da partida, com o peso de cada um', () => {
    expect(itensLevados({ pocaoDeVida: 2, itemVelho: 1 })).toEqual([{ id: 'pocaoDeVida', peso: 1, quantidade: 2 }])
    expect(itensLevados(null)).toEqual([])
  })
})
