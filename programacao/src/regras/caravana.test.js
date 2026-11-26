import { describe, expect, it } from 'vitest'
import { floresta } from '../dados/mundo/floresta.js'
import { mundo } from '../dados/balanceamento.js'
import { fichaDoMob } from './mobs.js'
import { custoDaCaravana, distanciaPeloCaminho, mobsDaRegiaoDoBioma, ouroDaPartidaTipica, paradasComPreco, podeViajar, precoDaParada } from './caravana.js'

const regioes = [
  { id: 'a', inicio: { x: 0, y: 0 } },
  { id: 'b', inicio: { x: 3000, y: 0 } },
  { id: 'c', inicio: { x: 3000, y: 4000 } },
]
const ordem = ['a', 'b', 'c']

describe('Caravana (RF56, Parte 7)', () => {
  it('a distância é a andada pelo caminho, trecho por trecho', () => {
    expect(distanciaPeloCaminho(regioes, ordem, 'a')).toBe(0)
    expect(distanciaPeloCaminho(regioes, ordem, 'b')).toBe(3000)
    expect(distanciaPeloCaminho(regioes, ordem, 'c')).toBe(7000)
    expect(distanciaPeloCaminho(regioes, ordem, 'x')).toBeNull()
  })

  // Parte 11: o preço é o ouro de uma partida típica na região perto da parada
  const bioma = {
    regioes: [
      { id: 'inicio', dificuldade: 'segura' },
      { id: 'n1', dificuldade: 'neutra' },
      { id: 'r1', dificuldade: 'facil' },
      { id: 'n2', dificuldade: 'neutra' },
      { id: 'chefe', dificuldade: 'boss' },
    ],
    ordemDoCaminho: ['inicio', 'n1', 'r1', 'n2', 'chefe'],
    populacao: { r1: { lobo: 10 }, chefe: { lobo: 1 } },
    caravana: [
      { id: 'inicio', regiao: 'inicio' },
      { id: 'n1', regiao: 'n1', regiaoPerto: 'r1' },
      { id: 'n2', regiao: 'n2', regiaoPerto: 'chefe' },
    ],
  }
  const config = { fracaoDosMobs: 0.5, arredondar: 5 }

  it('os mobs de uma região: os soltos, a matilha de cada Alfa, os acampamentos com as torres e o chefe', () => {
    expect(mobsDaRegiaoDoBioma({ populacao: { r: { loboAlfa: 2, lobo: 1 } }, regioes: [] }, 'r')).toEqual({ loboAlfa: 2, lobo: 1 + 2 * mundo.mobs.loboAlfa.matilha.lobos })
    const comForte = { populacao: {}, regioes: [], acampamentos: [{ regiao: 'r', populacao: { orc: 1 }, arqueirosNasTorres: true }, { regiao: 'outra', populacao: { orc: 5 } }] }
    expect(mobsDaRegiaoDoBioma(comForte, 'r')).toEqual({ orc: 1, goblinArqueiro: 4 })
    expect(mobsDaRegiaoDoBioma(bioma, 'chefe')).toEqual({ lobo: 1, chefe: 1 })
  })

  it('a partida típica: a fração do ouro dos mobs da região, mais o chefe inteiro', () => {
    expect(ouroDaPartidaTipica(bioma, 'r1', config)).toBeCloseTo(fichaDoMob('lobo', 'facil').ouro * 10 * 0.5)
    expect(ouroDaPartidaTipica(bioma, 'chefe', config)).toBeCloseTo(fichaDoMob('lobo', 'boss').ouro * 0.5 + mundo.ogro.ouro)
  })

  it('o começo é de graça; o resto custa a partida típica da região perto, arredondada; parada antiga, de graça', () => {
    expect(precoDaParada(bioma, bioma.caravana[0], config)).toBe(0)
    expect(precoDaParada(bioma, bioma.caravana[1], config)).toBe(Math.round(ouroDaPartidaTipica(bioma, 'r1', config) / 5) * 5)
    expect(precoDaParada(bioma, undefined, config)).toBe(0)
    expect(precoDaParada(bioma, { id: 'x', regiao: 'n1' }, config)).toBe(0) // sem região perto
  })

  it('uma parada mais longe nunca custa menos que a de antes', () => {
    const barato = { ...bioma, populacao: { r1: { lobo: 1000 }, chefe: {} } }
    const [, perto, longe] = paradasComPreco(barato, config)
    expect(longe.preco).toBe(perto.preco)
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
      expect(paradas[i].preco).toBeGreaterThanOrEqual(paradas[i - 1].preco)
      expect(paradas[i].preco, paradas[i].id).toBeGreaterThan(0)
      expect(floresta.regioes.find((r) => r.id === paradas[i].regiao).dificuldade).toBe('neutra')
    }
    // "tem que doer para um iniciante": a mais perto já custa mais que o ouro do começo (120)
    expect(paradas[1].preco).toBeGreaterThan(120)
    // cada região custa mais que a de antes (a Fácil, a Média e a Difícil)
    expect(paradas[2].preco).toBeGreaterThan(paradas[1].preco)
    expect(paradas[3].preco).toBeGreaterThan(paradas[2].preco)
    expect(custoDaCaravana(floresta, 'neutraDoFim')).toBe(paradas[4].preco)
    expect(custoDaCaravana(floresta, 'facil')).toBe(0) // ponto de partida antigo
  })
})
