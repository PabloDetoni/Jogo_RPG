import { describe, expect, it } from 'vitest'
import { atributoMaximo, equipamentoNaPartida } from '../dados/balanceamento.js'
import { itemDoCatalogo } from '../dados/itens.js'
import { atributosComEquipamento, bonusDoEquipamento, podeEquipar, reducaoPelaDefesa } from './equipamento.js'

describe('equipamento (Fase 4, TASK-075)', () => {
  it('armadura serve para todas as classes; arma e escudo só para a própria', () => {
    expect(podeEquipar(itemDoCatalogo('coleteDeCouro'), 'mago').ok).toBe(true)
    expect(podeEquipar(itemDoCatalogo('cajadoDeCarvalho'), 'mago').ok).toBe(true)
    expect(podeEquipar(itemDoCatalogo('cajadoDeCarvalho'), 'guerreiro')).toEqual({ ok: false, motivo: 'Cajado de carvalho é só para Mago.' })
    expect(podeEquipar(itemDoCatalogo('pocaoDeVida'), 'mago').ok).toBe(false)
    expect(podeEquipar(null, 'mago').ok).toBe(false)
  })

  it('soma bônus, defesa e redução de recarga das peças (com teto); id desconhecido não conta', () => {
    expect(bonusDoEquipamento({ capacete: 'elmoDeFerro', peitoral: 'peitoralDeFerro', botas: 'botasDeVento', arma: 'itemVelho' })).toEqual({
      atributos: { vitalidade: 6, agilidade: 3 },
      defesa: 8,
      reducaoDeRecarga: 0.05,
    })
    expect(bonusDoEquipamento(undefined)).toEqual({ atributos: {}, defesa: 0, reducaoDeRecarga: 0 })
  })

  it('os atributos com o equipamento não passam do máximo', () => {
    const atributos = { vitalidade: 99, forca: 10, sabedoria: 10, inteligencia: 10, agilidade: 10 }
    expect(atributosComEquipamento(atributos, { peitoral: 'peitoralDeFerro', arma: 'espadaCurta' })).toEqual({ ...atributos, vitalidade: atributoMaximo, forca: 13 })
  })

  it('a defesa tira uma parte do dano, até o teto', () => {
    expect(reducaoPelaDefesa(0)).toBe(0)
    expect(reducaoPelaDefesa(5)).toBeCloseTo(5 * equipamentoNaPartida.reducaoPorPontoDeDefesa)
    expect(reducaoPelaDefesa(1000)).toBe(equipamentoNaPartida.reducaoMaximaPelaDefesa)
    expect(reducaoPelaDefesa(-3)).toBe(0)
  })
})
