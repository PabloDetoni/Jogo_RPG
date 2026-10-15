import { describe, expect, it } from 'vitest'
import { itemDoCatalogo } from '../dados/itens.js'
import { aliadoQueMaisPrecisa, itensDaJanela, multiplicadorAtivo, recargaComEfeitos, usarItemEm } from './itensNaPartida.js'

const item = (id) => itemDoCatalogo(id)
const ferido = { vida: 30, vidaMaxima: 100, mana: 10, manaMaxima: 50, caido: false }

describe('itens na partida (Fase 4, TASK-047)', () => {
  it('critério do card: poção com o Líder pela metade da vida → a vida sobe', () => {
    const resultado = usarItemEm(item('pocaoDeVida'), { ...ferido, vida: 50 }, 0)
    expect(resultado).toEqual({ ok: true, mudancas: { vida: 90 }, texto: '+40 de vida' })
  })

  it('a vida e a mana não passam do máximo', () => {
    expect(usarItemEm(item('pocaoGrandeDeVida'), { ...ferido, vida: 90 }, 0).mudancas.vida).toBe(100)
    expect(usarItemEm(item('pocaoDeMana'), ferido, 0).mudancas.mana).toBe(35)
    expect(usarItemEm(item('pocaoDeMana'), { ...ferido, mana: 45 }, 0).mudancas.mana).toBe(50)
  })

  it('poção não levanta quem desmaiou; com a vida ou a mana cheia, nada é gasto', () => {
    expect(usarItemEm(item('pocaoDeVida'), { ...ferido, caido: true }, 0)).toMatchObject({ ok: false, motivo: 'caido', texto: 'Poção de vida não levanta quem desmaiou' })
    expect(usarItemEm(item('pocaoDeVida'), { ...ferido, vida: 100 }, 0)).toMatchObject({ ok: false, motivo: 'vidaCheia' })
    expect(usarItemEm(item('pocaoDeMana'), { ...ferido, mana: 50 }, 0)).toMatchObject({ ok: false, motivo: 'manaCheia' })
    expect(usarItemEm(item('peleDeLobo'), ferido, 0)).toMatchObject({ ok: false, motivo: 'naoUsavel' })
  })

  it('aceleradores valem por um tempo', () => {
    const tonico = usarItemEm(item('tonicoLigeiro'), ferido, 1000)
    expect(tonico.mudancas.efeito).toEqual({ tipo: 'velocidade', multiplicador: 1.25, ate: 21000 })
    const efeitos = { velocidade: tonico.mudancas.efeito }
    expect(multiplicadorAtivo(efeitos, 'velocidade', 20999)).toBe(1.25)
    expect(multiplicadorAtivo(efeitos, 'velocidade', 21000)).toBe(1)
    expect(multiplicadorAtivo(efeitos, 'recarga', 5000)).toBe(1)
    expect(multiplicadorAtivo(undefined, 'recarga', 5000)).toBe(1)
    expect(usarItemEm(item('elixirDoFoco'), ferido, 0).mudancas.efeito).toMatchObject({ tipo: 'recarga', multiplicador: 0.7 })
  })

  it('recarga com o elixir e com a redução do equipamento', () => {
    expect(recargaComEfeitos(10000)).toBe(10000)
    expect(recargaComEfeitos(10000, 0.7)).toBe(7000)
    expect(recargaComEfeitos(10000, 1, 0.05)).toBe(9500)
  })

  it('R (ajustes da partida, 14/10): o aliado de pé que mais precisa daquele item', () => {
    const lider = { x: 0, y: 0 }
    const aliados = [
      { classe: 'mago', x: 100, y: 0, vida: 50, vidaMaxima: 100, mana: 5, manaMaxima: 50, caido: false },
      { classe: 'tanque', x: 10, y: 0, vida: 10, vidaMaxima: 100, mana: 0, manaMaxima: 50, caido: true },
      { classe: 'arqueiro', x: 300, y: 0, vida: 30, vidaMaxima: 100, mana: 40, manaMaxima: 50, caido: false },
      { classe: 'sacerdote', x: 60, y: 0, vida: 90, vidaMaxima: 100, mana: 50, manaMaxima: 50, caido: false },
    ]
    expect(aliadoQueMaisPrecisa(aliados, item('pocaoDeVida'), lider).classe).toBe('arqueiro') // o mais ferido (o caído não conta)
    expect(aliadoQueMaisPrecisa(aliados, item('pocaoDeMana'), lider).classe).toBe('mago') // o com menos mana
    expect(aliadoQueMaisPrecisa(aliados, item('tonicoLigeiro'), lider).classe).toBe('sacerdote') // acelerador: o mais perto
    expect(aliadoQueMaisPrecisa([{ x: 0, y: 0, caido: true }], item('pocaoDeVida'), lider)).toBeNull()
  })

  it('R: empate na vida, o mais perto do Líder', () => {
    const iguais = [
      { classe: 'mago', x: 200, y: 0, vida: 40, vidaMaxima: 100, caido: false },
      { classe: 'arqueiro', x: 50, y: 0, vida: 40, vidaMaxima: 100, caido: false },
    ]
    expect(aliadoQueMaisPrecisa(iguais, item('pocaoDeVida'), { x: 0, y: 0 }).classe).toBe('arqueiro')
  })
})

describe('ordem da janela do Tab', () => {
  it('os usáveis primeiro; id fora do catálogo não aparece', () => {
    const lista = itensDaJanela([{ id: 'madeira', quantidade: 2 }, { id: 'itemVelho', quantidade: 1 }, { id: 'pocaoDeMana', quantidade: 1 }])
    expect(lista.map((item) => item.id)).toEqual(['pocaoDeMana', 'madeira'])
    expect(lista[0].dado.nome).toBe('Poção de mana')
    expect(itensDaJanela(undefined)).toEqual([])
  })
})
