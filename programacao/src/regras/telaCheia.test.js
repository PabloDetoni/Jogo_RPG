import { describe, expect, it } from 'vitest'
import { devePedirTelaCheia, mostrarVoltarATelaCheia, saidaContaComoEsc } from './telaCheia.js'

describe('tela cheia (ajustes de 14/10)', () => {
  it('pede no clique só com a preferência ligada, no navegador que tem, e fora dela', () => {
    expect(devePedirTelaCheia({ preferencia: true, suportada: true, emTelaCheia: false })).toBe(true)
    expect(devePedirTelaCheia({ preferencia: false, suportada: true, emTelaCheia: false })).toBe(false)
    expect(devePedirTelaCheia({ preferencia: true, suportada: false, emTelaCheia: false })).toBe(false)
    expect(devePedirTelaCheia({ preferencia: true, suportada: true, emTelaCheia: true })).toBe(false)
  })

  it('sair sem pedir, na partida, vale como Esc (mas não o X nem o desligar)', () => {
    expect(saidaContaComoEsc({ naPartida: true, saidaPedida: false })).toBe(true)
    expect(saidaContaComoEsc({ naPartida: true, saidaPedida: true })).toBe(false)
    expect(saidaContaComoEsc({ naPartida: false, saidaPedida: false })).toBe(false)
  })

  it('o Esc segurado (já recebido pelo jogo) não conta duas vezes', () => {
    expect(saidaContaComoEsc({ naPartida: true, saidaPedida: false, msDesdeOUltimoEsc: 2000 })).toBe(false)
    expect(saidaContaComoEsc({ naPartida: true, saidaPedida: false, msDesdeOUltimoEsc: 9000 })).toBe(true)
  })

  it('"Voltar à tela cheia" aparece só depois de sair sem pedir, com a preferência ligada', () => {
    expect(mostrarVoltarATelaCheia({ preferencia: true, suportada: true, emTelaCheia: false, saiuSemPedir: true })).toBe(true)
    expect(mostrarVoltarATelaCheia({ preferencia: true, suportada: true, emTelaCheia: true, saiuSemPedir: true })).toBe(false)
    expect(mostrarVoltarATelaCheia({ preferencia: false, suportada: true, emTelaCheia: false, saiuSemPedir: true })).toBe(false)
    expect(mostrarVoltarATelaCheia({ preferencia: true, suportada: true, emTelaCheia: false, saiuSemPedir: false })).toBe(false)
  })
})
