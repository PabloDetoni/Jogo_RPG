import { describe, expect, it } from 'vitest'
import { mundo } from '../dados/balanceamento.js'
import { aplicarFimNoProgresso } from './ganhosDaPartida.js'
import {
  contaAoPegar,
  estaPiscando,
  expirou,
  fracaoRestante,
  itemDescartado,
  itemDropado,
  itemNatural,
  tempoRestante,
  tiposDeItemNoChao,
} from './itensNoChao.js'
import { descartarDaMochilaDaPartida } from './mochila.js'

const ms = mundo.coleta.msDoItemDropado

describe('itens no chão: natural e dropado (ajustes de 14/10)', () => {
  it('o tempo do item dropado é 30 s, e o pisca dura os últimos 5 s', () => {
    expect(ms).toBe(30000)
    expect(mundo.coleta.msPiscando).toBe(5000)
  })

  it('o item natural nunca some sozinho', () => {
    const natural = itemNatural()
    expect(natural.tipo).toBe(tiposDeItemNoChao.natural)
    expect(expirou(natural, 10 ** 9)).toBe(false)
    expect(tempoRestante(natural, 10 ** 9)).toBe(Infinity)
    expect(fracaoRestante(natural, 10 ** 9)).toBe(1)
    expect(estaPiscando(natural, 10 ** 9)).toBe(false)
  })

  it('o drop de monstro some 30 s depois de cair', () => {
    const drop = itemDropado(1000)
    expect(drop.tipo).toBe(tiposDeItemNoChao.dropado)
    expect(expirou(drop, 1000 + ms - 1)).toBe(false)
    expect(expirou(drop, 1000 + ms)).toBe(true)
    expect(tempoRestante(drop, 1000 + 10000)).toBe(ms - 10000)
  })

  it('o anel vai de cheio (acabou de cair) a vazio (vai sumir)', () => {
    const drop = itemDropado(0)
    expect(fracaoRestante(drop, 0)).toBe(1)
    expect(fracaoRestante(drop, ms / 2)).toBeCloseTo(0.5)
    expect(fracaoRestante(drop, ms)).toBe(0)
    expect(fracaoRestante(drop, ms * 2)).toBe(0)
  })

  it('pisca só nos últimos 5 s, alternando', () => {
    const drop = itemDropado(0)
    expect(estaPiscando(drop, ms - 6000)).toBe(false)
    const nosUltimos = Array.from({ length: 20 }, (_, i) => estaPiscando(drop, ms - 4900 + i * 100))
    expect(nosUltimos.some(Boolean)).toBe(true)
    expect(nosUltimos.every(Boolean)).toBe(false)
    expect(estaPiscando(drop, ms)).toBe(false)
  })

  it('o natural pego e descartado vira dropado, com 30 s a partir do descarte', () => {
    const descartado = itemDescartado(50000)
    expect(descartado.tipo).toBe(tiposDeItemNoChao.dropado)
    expect(descartado.expiraEm).toBe(50000 + ms)
    expect(descartado.jaColetado).toBe(true)
  })

  it('pegar e descartar de novo reinicia o tempo (cai com 30 s novos)', () => {
    const primeiro = itemDescartado(0)
    const segundo = itemDescartado(25000)
    expect(segundo.expiraEm - 25000).toBe(ms)
    expect(segundo.expiraEm).toBeGreaterThan(primeiro.expiraEm)
  })

  it('pegar de novo um item descartado não conta outra vez para a missão', () => {
    expect(contaAoPegar(itemNatural())).toBe(true)
    expect(contaAoPegar(itemDropado(0))).toBe(true)
    expect(contaAoPegar(itemDescartado(0))).toBe(false)
  })
})

describe('descartar na partida: o item cai como dropado (ajustes de 14/10)', () => {
  it('DADO 3 poções QUANDO descarto 2 ENTÃO fica 1 na mochila e 2 caem no chão com 30 s', () => {
    const itens = [{ id: 'pocaoDeVida', quantidade: 3 }, { id: 'madeira', quantidade: 1 }]
    const resultado = descartarDaMochilaDaPartida(itens, 'pocaoDeVida', 2)
    expect(resultado.ok).toBe(true)
    expect(resultado.quantidade).toBe(2)
    expect(resultado.itens).toEqual([{ id: 'pocaoDeVida', quantidade: 1 }, { id: 'madeira', quantidade: 1 }])
    const noChao = itemDescartado(7000)
    expect(noChao.expiraEm - 7000).toBe(30000)
  })

})

describe('fim da partida', () => {
  it('o que ficou no chão se perde: levei 3 poções, descartei 2, volta 1 para a Mochila do Reino', () => {
    const progresso = {
      personagens: [],
      ouro: 0,
      estatisticas: { partidasJogadas: 0, monstrosDerrotados: 0 },
      contratosTemporarios: [],
      mochila: [{ id: 'pocaoDeVida', quantidade: 3 }],
      missaoAtiva: null,
    }
    const naMochila = descartarDaMochilaDaPartida([{ id: 'pocaoDeVida', quantidade: 3 }], 'pocaoDeVida', 2).itens
    const { progresso: depois } = aplicarFimNoProgresso(progresso, { itens: naMochila, levados: { pocaoDeVida: 3 } })
    expect(depois.mochila).toEqual([{ id: 'pocaoDeVida', quantidade: 1 }])
  })
})
