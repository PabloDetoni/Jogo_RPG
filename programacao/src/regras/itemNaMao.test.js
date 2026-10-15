import { describe, expect, it } from 'vitest'
import { acompanharMochila, cliqueDireito, cliqueEsquerdo, completarGrade, devolverAoFechar, guardar, slotsDaLista, soltarFora } from './itemNaMao.js'

const pocao = (quantidade) => ({ id: 'pocaoDeVida', quantidade })
const madeira = (quantidade) => ({ id: 'madeira', quantidade })
const inicio = () => ({ slots: slotsDaLista([pocao(5), madeira(2)], 6), mao: null })

describe('item na mão (ajustes da partida, 14/10)', () => {
  it('a grade sai da lista da mochila, na ordem, com os quadradinhos vazios no fim', () => {
    expect(slotsDaLista([pocao(5), madeira(2)], 4)).toEqual([pocao(5), madeira(2), null, null])
  })

  it('clique esquerdo pega a pilha inteira; noutro vazio, põe tudo', () => {
    let e = cliqueEsquerdo(inicio(), 0)
    expect(e.mao).toEqual(pocao(5))
    expect(e.slots[0]).toBe(null)
    e = cliqueEsquerdo(e, 3)
    expect(e.slots[3]).toEqual(pocao(5))
    expect(e.mao).toBe(null)
  })

  it('clique direito pega a metade (a maior) e deixa o resto', () => {
    const e = cliqueDireito(inicio(), 0)
    expect(e.mao).toEqual(pocao(3))
    expect(e.slots[0]).toEqual(pocao(2))
    const um = cliqueDireito({ slots: [pocao(1)], mao: null }, 0)
    expect([um.mao, um.slots[0]]).toEqual([pocao(1), null])
  })

  it('com item na mão: no mesmo item, junta; noutro item, troca', () => {
    let e = cliqueDireito(inicio(), 0) // mão 3, quadradinho 2
    e = cliqueEsquerdo(e, 0)
    expect([e.slots[0], e.mao]).toEqual([pocao(5), null])
    e = cliqueEsquerdo(e, 0) // pega as 5
    e = cliqueEsquerdo(e, 1) // troca com a madeira
    expect([e.slots[1], e.mao]).toEqual([pocao(5), madeira(2)])
  })

  it('clique direito com item na mão põe 1 (no vazio ou no mesmo item)', () => {
    let e = cliqueEsquerdo(inicio(), 0) // mão 5
    e = cliqueDireito(e, 4)
    expect([e.slots[4], e.mao]).toEqual([pocao(1), pocao(4)])
    expect(cliqueDireito(e, 1)).toEqual(e) // na madeira, nada
  })

  it('soltar fora: a mão vai para o chão', () => {
    const e = cliqueDireito(inicio(), 0)
    const { estado, noChao } = soltarFora(e)
    expect(noChao).toEqual(pocao(3))
    expect(estado.mao).toBe(null)
    expect(estado.slots[0]).toEqual(pocao(2))
  })

  it('fechar com item na mão devolve para a pilha do mesmo item, ou para o primeiro vazio', () => {
    const juntou = devolverAoFechar(cliqueDireito(inicio(), 0))
    expect([juntou.slots[0], juntou.mao]).toEqual([pocao(5), null])
    const vazio = devolverAoFechar(cliqueEsquerdo(inicio(), 1))
    expect(vazio.slots).toEqual([pocao(5), madeira(2), null, null, null, null])
    expect(vazio.mao).toBe(null)
  })

  it('a grade sai da lista inteira, mesmo com mais itens que quadradinhos', () => {
    expect(slotsDaLista([pocao(1), madeira(1), { id: 'cogumelo', quantidade: 1 }], 2)).toHaveLength(3)
  })

  it('a grade sempre tem quadradinho vazio: o mínimo e, cheia, mais uma fileira', () => {
    expect(completarGrade({ slots: [pocao(1)], mao: null }, { minimo: 4 }).slots).toEqual([pocao(1), null, null, null])
    expect(completarGrade({ slots: [pocao(1), madeira(1)], mao: null }, { minimo: 2, passo: 3 }).slots).toHaveLength(5)
    const igual = { slots: [pocao(1), null], mao: null }
    expect(completarGrade(igual, { minimo: 2 })).toBe(igual)
  })

  it('guardar (o cancelar da lixeira): junta no mesmo item ou vai para o primeiro vazio, sem mexer na mão', () => {
    const e = { slots: [null, pocao(2), null], mao: madeira(1) }
    expect(guardar(e, pocao(3)).slots).toEqual([null, pocao(5), null])
    expect(guardar(e, { id: 'cogumelo', quantidade: 1 }).slots[0]).toEqual({ id: 'cogumelo', quantidade: 1 })
    expect(guardar(e, pocao(3)).mao).toEqual(madeira(1))
  })

  it('usou com o mouse em cima de uma pilha: sai dela primeiro', () => {
    const e = { slots: [pocao(2), null, pocao(3)], mao: null }
    expect(acompanharMochila(e, [pocao(4)], 0).slots).toEqual([pocao(1), null, pocao(3)])
    expect(acompanharMochila(e, [pocao(4)]).slots).toEqual([pocao(2), null, pocao(2)]) // sem preferido: a última pilha
  })

  it('a grade acompanha a partida: usou uma poção, pegou madeira, um item acabou', () => {
    let e = cliqueDireito(inicio(), 0) // mão 3 poções, quadradinho 2
    e = acompanharMochila(e, [pocao(4), madeira(3)])
    expect(e.mao).toEqual(pocao(3)) // a poção usada sai da grade antes da mão
    expect(e.slots[0]).toEqual(pocao(1))
    expect(e.slots[1]).toEqual(madeira(3))
    e = acompanharMochila(e, [madeira(3)])
    expect(e.mao).toBe(null)
    expect(e.slots.filter(Boolean)).toEqual([madeira(3)])
    e = acompanharMochila(e, [madeira(3), { id: 'cogumelo', quantidade: 1 }])
    expect(e.slots.slice(0, 2)).toEqual([{ id: 'cogumelo', quantidade: 1 }, madeira(3)]) // o novo entra no primeiro vazio
  })
})
