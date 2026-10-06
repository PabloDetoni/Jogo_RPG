import { describe, expect, it, vi } from 'vitest'
import { capacidadeDaMochila, guardarNaMochila, pesoTotal } from './mochila.js'

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
