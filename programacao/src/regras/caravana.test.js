import { describe, expect, it } from 'vitest'
import { floresta } from '../dados/mundo/floresta.js'
import { custoDaCaravana, distanciaPeloCaminho, paradasComPreco, podeViajar, precoDaParada } from './caravana.js'

const regioes = [
  { id: 'a', inicio: { x: 0, y: 0 } },
  { id: 'b', inicio: { x: 3000, y: 0 } },
  { id: 'c', inicio: { x: 3000, y: 4000 } },
]
const ordem = ['a', 'b', 'c']
const config = { base: 40, porMilPx: 25, arredondar: 5 }

describe('Caravana (RF56, Parte 7)', () => {
  it('a distância é a andada pelo caminho, trecho por trecho', () => {
    expect(distanciaPeloCaminho(regioes, ordem, 'a')).toBe(0)
    expect(distanciaPeloCaminho(regioes, ordem, 'b')).toBe(3000)
    expect(distanciaPeloCaminho(regioes, ordem, 'c')).toBe(7000)
    expect(distanciaPeloCaminho(regioes, ordem, 'x')).toBeNull()
  })

  it('o começo é de graça; o resto custa base + o andado, arredondado; parada antiga, de graça', () => {
    expect(precoDaParada(regioes, ordem, { regiao: 'a' }, config)).toBe(0)
    expect(precoDaParada(regioes, ordem, { regiao: 'b' }, config)).toBe(115) // 40 + 75
    expect(precoDaParada(regioes, ordem, { regiao: 'c' }, config)).toBe(215) // 40 + 175
    expect(precoDaParada(regioes, ordem, undefined, config)).toBe(0)
  })

  it('só o preço barra, com o motivo', () => {
    expect(podeViajar(100, 100)).toEqual({ ok: true, motivo: null })
    expect(podeViajar(60, 100)).toEqual({ ok: false, motivo: 'Falta 40 de ouro' })
  })

  it('na Floresta: o início de graça e as zonas neutras cada vez mais caras, nenhuma dentro de uma região', () => {
    const paradas = paradasComPreco(floresta)
    expect(paradas[0]).toMatchObject({ id: 'inicio', preco: 0 })
    expect(paradas.length).toBe(5)
    for (let i = 1; i < paradas.length; i++) {
      expect(paradas[i].preco).toBeGreaterThan(paradas[i - 1].preco)
      expect(floresta.regioes.find((r) => r.id === paradas[i].regiao).dificuldade).toBe('neutra')
    }
    // "tem que doer para um iniciante": a mais perto já custa mais que uma partida boa no começo
    expect(paradas[1].preco).toBeGreaterThanOrEqual(50)
    expect(custoDaCaravana(floresta, 'neutraDoFim')).toBe(paradas[4].preco)
    expect(custoDaCaravana(floresta, 'facil')).toBe(0) // ponto de partida antigo
  })
})
