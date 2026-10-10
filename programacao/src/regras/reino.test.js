import { describe, expect, it } from 'vitest'
import { progressoInicial } from '../estado/progresso.js'
import { aplicarNoReino, descartar, listarItens, textoDaFalta } from './reino.js'

const comItens = (mochila) => ({ ...progressoInicial(), mochila })

describe('operações do Reino (Fase 4)', () => {
  it('textos das mensagens', () => {
    expect(listarItens({ peleDeLobo: 2 })).toBe('2 Pele de lobo')
    expect(listarItens({ peleDeLobo: 2, minerioDeFerro: 1, madeira: 3 })).toBe('2 Pele de lobo, 1 Minério de ferro e 3 Madeira')
    expect(textoDaFalta([{ id: 'peleDeLobo', falta: 1 }])).toBe('Falta 1 Pele de lobo.')
    expect(textoDaFalta([{ id: 'peleDeLobo', falta: 2 }])).toBe('Faltam 2 Pele de lobo.')
  })

  it('operação desconhecida não muda nada', () => {
    expect(aplicarNoReino(progressoInicial(), 'naoExiste')).toEqual({ ok: false, motivo: 'Operação desconhecida.' })
    expect(aplicarNoReino(progressoInicial(), 'toString').ok).toBe(false)
  })
})

describe('Mochila: descartar (TASK-072)', () => {
  it('critério do card: 3 poções, descarta 1 e ficam 2', () => {
    const antes = comItens([{ id: 'pocaoDeVida', quantidade: 3 }])
    const resultado = descartar(antes, 'pocaoDeVida', 1)
    expect(resultado.ok).toBe(true)
    expect(resultado.progresso.mochila).toEqual([{ id: 'pocaoDeVida', quantidade: 2 }])
    expect(resultado.mensagem).toBe('1 Poção de vida descartado.')
    expect(antes.mochila).toEqual([{ id: 'pocaoDeVida', quantidade: 3 }]) // não muda o que recebeu
  })

  it('descartar todos tira o item da lista; sem o bastante ou quantidade inválida, explica e nada muda', () => {
    const antes = comItens([{ id: 'pocaoDeVida', quantidade: 3 }])
    expect(aplicarNoReino(antes, 'descartar', ['pocaoDeVida', 3]).progresso.mochila).toEqual([])
    expect(descartar(antes, 'pocaoDeVida', 4)).toEqual({ ok: false, motivo: 'Você não tem 4 Poção de vida na Mochila.' })
    expect(descartar(antes, 'pocaoDeVida', 0).ok).toBe(false)
    expect(descartar(antes, 'pocaoDeVida', 1.5).ok).toBe(false)
  })

  it('um item fora do catálogo (save antigo) também pode ser descartado', () => {
    expect(descartar(comItens([{ id: 'itemVelho', quantidade: 1 }]), 'itemVelho', 1).progresso.mochila).toEqual([])
  })
})
