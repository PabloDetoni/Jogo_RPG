import { describe, expect, it } from 'vitest'
import { minijogos } from '../dados/balanceamento.js'
import {
  contarRodada,
  diaDeBrasilia,
  diferencaDoRelogio,
  msAteRenovar,
  normalizarMinijogosDoDia,
  podeJogarRodada,
  rodadasDoMinijogo,
  textoAteRenovar,
  textoDasRodadas,
} from './rodadasDoDia.js'

// 14/10/2026 às 18:48 em Brasília = 21:48 UTC
const tarde = Date.parse('2026-10-14T21:48:00Z')
const antesDaMeiaNoite = Date.parse('2026-10-15T02:59:30Z') // 23:59:30 em Brasília
const depoisDaMeiaNoite = Date.parse('2026-10-15T03:00:30Z') // 00:00:30 em Brasília do dia 15

describe('minijogos diários (ajustes de 14/10)', () => {
  it('3 rodadas por dia (provisório, no balanceamento)', () => {
    expect(minijogos.rodadasPorDia).toBe(3)
  })

  it('o dia é o de Brasília: 23:00 UTC de um dia ainda é o mesmo dia lá; 03:00 UTC já é o seguinte', () => {
    expect(diaDeBrasilia(tarde)).toBe('2026-10-14')
    expect(diaDeBrasilia(Date.parse('2026-10-15T01:00:00Z'))).toBe('2026-10-14')
    expect(diaDeBrasilia(antesDaMeiaNoite)).toBe('2026-10-14')
    expect(diaDeBrasilia(depoisDaMeiaNoite)).toBe('2026-10-15')
  })

  it('conta as rodadas de cada minijogo separadas e para nas 3', () => {
    let salvo = null
    for (let i = 0; i < 3; i++) {
      expect(podeJogarRodada(salvo, 'fazenda', tarde).ok).toBe(true)
      salvo = contarRodada(salvo, 'fazenda', tarde)
    }
    expect(rodadasDoMinijogo(salvo, 'fazenda', tarde)).toEqual({ jogadas: 3, porDia: 3, sobram: 0 })
    const recusa = podeJogarRodada(salvo, 'fazenda', tarde)
    expect(recusa.ok).toBe(false)
    expect(recusa.motivo).toContain('Renova em 05:12')
    expect(podeJogarRodada(salvo, 'mina', tarde).ok).toBe(true)
  })

  it('virada do dia: à meia-noite de Brasília as rodadas renovam', () => {
    let salvo = null
    for (let i = 0; i < 3; i++) salvo = contarRodada(salvo, 'lago', antesDaMeiaNoite)
    expect(podeJogarRodada(salvo, 'lago', antesDaMeiaNoite).ok).toBe(false)
    expect(rodadasDoMinijogo(salvo, 'lago', depoisDaMeiaNoite).sobram).toBe(3)
    const novo = contarRodada(salvo, 'lago', depoisDaMeiaNoite)
    expect(novo).toEqual({ dia: '2026-10-15', rodadas: { lago: 1 } })
  })

  it('tempo até renovar e o texto da tela', () => {
    expect(msAteRenovar(tarde)).toBe((5 * 60 + 12) * 60 * 1000)
    expect(textoAteRenovar(tarde)).toBe('05:12')
    expect(textoAteRenovar(antesDaMeiaNoite)).toBe('00:01')
    const salvo = contarRodada(null, 'fazenda', tarde)
    expect(textoDasRodadas(salvo, 'fazenda', tarde)).toBe('Rodadas hoje: 2 de 3 · renova em 05:12')
  })

  it('o contador estragado do save vira nada (sem travar)', () => {
    expect(normalizarMinijogosDoDia(null)).toBe(null)
    expect(normalizarMinijogosDoDia({ dia: 'ontem', rodadas: {} })).toBe(null)
    expect(normalizarMinijogosDoDia({ dia: '2026-10-14', rodadas: { fazenda: 2, mina: 'x', lago: -1 } })).toEqual({ dia: '2026-10-14', rodadas: { fazenda: 2 } })
    expect(rodadasDoMinijogo({ dia: '2026-10-14', rodadas: null }, 'fazenda', tarde).sobram).toBe(3)
  })

  it('a hora do servidor corrige o relógio do navegador (meio do pedido)', () => {
    expect(diferencaDoRelogio('2026-10-14T12:00:10Z', Date.parse('2026-10-14T12:00:00Z'), Date.parse('2026-10-14T12:00:02Z'))).toBe(9000)
    expect(diferencaDoRelogio('não é data', 0, 0)).toBe(0)
  })

  it('mudar o relógio do navegador não ganha rodadas quando a hora vem do servidor', () => {
    const servidor = tarde
    const navegadorAdiantado = tarde + 24 * 60 * 60 * 1000
    const diferenca = servidor - navegadorAdiantado
    let salvo = null
    for (let i = 0; i < 3; i++) salvo = contarRodada(salvo, 'mina', navegadorAdiantado + diferenca)
    expect(podeJogarRodada(salvo, 'mina', navegadorAdiantado + diferenca).ok).toBe(false)
  })
})
