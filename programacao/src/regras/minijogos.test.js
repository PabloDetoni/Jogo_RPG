import { describe, expect, it } from 'vitest'
import { minijogos } from '../dados/balanceamento.js'
import { itemDoCatalogo } from '../dados/itens.js'
import { dadosDosMinijogos } from '../dados/minijogos.js'
import { novoPersonagem, progressoInicial } from '../estado/progresso.js'
import {
  aplicarMinijogo,
  avancarFazenda,
  avancarLago,
  baterNaPedra,
  colherNaFazenda,
  comecarFazenda,
  comecarLago,
  novaPedra,
  puxarNoLago,
  recompensaDaRodada,
  sortearRaros,
} from './minijogos.js'
import { criarSorteio } from './mundo.js'

describe('minijogos: dados (provisórios até a TASK-016)', () => {
  it('cada um tem recurso e raro que existem no catálogo, e números no balanceamento', () => {
    for (const [id, dados] of Object.entries(dadosDosMinijogos)) {
      expect(itemDoCatalogo(dados.item), id).not.toBeNull()
      expect(itemDoCatalogo(dados.raro), id).not.toBeNull()
      expect(minijogos[id].xpPorPonto > 0 && minijogos[id].chanceDoRaro > 0 && minijogos[id].chanceDoRaro < 1, id).toBe(true)
    }
  })
})

describe('Fazenda: colheita', () => {
  it('a planta cresce, fica madura, murcha e volta a crescer; só a madura dá ponto', () => {
    const sorteio = criarSorteio(1)
    let canteiros = comecarFazenda(0, sorteio)
    expect(canteiros).toHaveLength(minijogos.fazenda.canteiros)
    expect(colherNaFazenda(canteiros, 0, 0, sorteio).ponto).toBe(false)
    canteiros = avancarFazenda(canteiros, minijogos.fazenda.msCrescendo[1], sorteio)
    expect(canteiros.every((canteiro) => canteiro.estado === 'madura')).toBe(true)
    const colheu = colherNaFazenda(canteiros, 2, 6000, sorteio)
    expect(colheu.ponto).toBe(true)
    expect(colheu.canteiros[2].estado).toBe('crescendo')
    const murchou = avancarFazenda(canteiros, 6000 + minijogos.fazenda.msMadura, sorteio)
    expect(murchou[0].estado).toBe('murcha')
    expect(colherNaFazenda(murchou, 0, 9000, sorteio).ponto).toBe(false)
  })
})

describe('Mina: pedras', () => {
  it('cada pedra quebra com os cliques dela e dá ponto; vem outra', () => {
    const sorteio = criarSorteio(2)
    let pedra = novaPedra(sorteio)
    for (let i = 1; i < minijogos.mina.cliquesPorPedra; i++) {
      const golpe = baterNaPedra(pedra, sorteio)
      expect(golpe.ponto).toBe(false)
      pedra = golpe.pedra
    }
    const ultimo = baterNaPedra(pedra, sorteio)
    expect(ultimo.ponto).toBe(true)
    expect(ultimo.pedra.golpes).toBe(minijogos.mina.cliquesPorPedra)
  })
})

describe('Lago: pescaria', () => {
  it('puxar na hora da fisgada pega o peixe; antes, o peixe foge (susto)', () => {
    const sorteio = criarSorteio(3)
    const boia = comecarLago(0, sorteio)
    expect(puxarNoLago(boia, 100, sorteio)).toMatchObject({ ponto: false, boia: { estado: 'assustado' } })
    const fisgando = avancarLago(boia, boia.ate, sorteio)
    expect(fisgando.estado).toBe('fisgando')
    expect(puxarNoLago(fisgando, boia.ate + 100, sorteio).ponto).toBe(true)
    const perdeu = avancarLago(fisgando, fisgando.ate, sorteio)
    expect(perdeu.estado).toBe('esperando')
  })
})

describe('resultado da rodada (RF54, RF50)', () => {
  it('cada ponto dá 1 do recurso e o XP do lugar; os raros vêm à parte', () => {
    expect(recompensaDaRodada('fazenda', 10, 2)).toEqual({ itens: { trigo: 10, ervaMedicinal: 2 }, xp: 10 * minijogos.fazenda.xpPorPonto })
    expect(recompensaDaRodada('lago', 0, 0)).toEqual({ itens: {}, xp: 0 })
    expect(recompensaDaRodada('mina', 999, 999).itens.minerioDeFerro).toBe(minijogos.pontosNoMaximo) // nada absurdo
  })

  it('os raros saem pela chance de cada ponto', () => {
    const raros = sortearRaros('mina', 1000, criarSorteio(4))
    expect(raros).toBeGreaterThan(1000 * minijogos.mina.chanceDoRaro * 0.6)
    expect(raros).toBeLessThan(1000 * minijogos.mina.chanceDoRaro * 1.4)
  })

  it('critério do card: os recursos vão para a Mochila e o XP é dividido entre todos os permanentes; não conta partida', () => {
    const antes = { ...progressoInicial(), personagens: [novoPersonagem('mago'), novoPersonagem('tanque')], lider: 'mago' }
    const r = aplicarMinijogo(antes, 'fazenda', 5, 1)
    expect(r.progresso.mochila).toEqual([{ id: 'trigo', quantidade: 5 }, { id: 'ervaMedicinal', quantidade: 1 }])
    expect(r.progresso.personagens.map((personagem) => personagem.xp)).toEqual([10, 10]) // 20 XP para 2
    expect(r.progresso.estatisticas).toEqual(antes.estatisticas)
    expect(r.mensagem).toBe('Fazenda: 5 Trigo e 1 Erva medicinal na Mochila e 20 XP divididos entre os personagens.')
    expect(aplicarMinijogo(antes, 'cassino', 5, 0).ok).toBe(false)
  })
})
