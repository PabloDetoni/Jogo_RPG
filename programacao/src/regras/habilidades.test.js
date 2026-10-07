import { describe, expect, it } from 'vitest'
import { combateDeTeste } from '../dados/balanceamento.js'
import { classes } from '../dados/classes.js'
import { habilidadesDeTeste, habilidadesNasTeclas } from '../dados/habilidades.js'
import { avisoDoMotivo, gastarMana, manaMaxima, manaPorSegundo, podeUsarHabilidade, regenerarMana } from './habilidades.js'

const { mana } = combateDeTeste
const habilidade = { custoDeMana: 20, recargaMs: 5000 }

describe('mana (RF38)', () => {
  it('a mana máxima cresce com a Inteligência', () => {
    expect(manaMaxima(0)).toBe(mana.base)
    expect(manaMaxima(10)).toBe(mana.base + 10 * mana.porInteligencia)
    expect(manaMaxima(18)).toBeGreaterThan(manaMaxima(5))
  })

  it('Tanque, Guerreiro e Arqueiro começam com bem menos mana que Mago e Sacerdote (Conceito §6)', () => {
    const inicial = (id) => manaMaxima(classes.find((classe) => classe.id === id).atributosIniciais.inteligencia)
    for (const pouca of ['tanque', 'guerreiro', 'arqueiro']) {
      for (const muita of ['mago', 'sacerdote']) expect(inicial(pouca)).toBeLessThan(inicial(muita) * 0.7)
    }
  })

  it('a Sabedoria acelera a volta da mana, e ela nunca passa do máximo', () => {
    expect(manaPorSegundo(18)).toBeGreaterThan(manaPorSegundo(6))
    expect(regenerarMana(10, 50, 2, 1.5)).toBe(13)
    expect(regenerarMana(49, 50, 2, 3)).toBe(50)
    expect(regenerarMana(10, 50, 2, -1)).toBe(10)
  })

  it('gastar mana nunca deixa negativo', () => {
    expect(gastarMana(30, 20)).toBe(10)
    expect(gastarMana(5, 20)).toBe(0)
  })
})

describe('podeUsarHabilidade (TASK-046)', () => {
  it('com 10 de mana e custo 20: não sai, e o aviso é de mana (critério do card)', () => {
    const resultado = podeUsarHabilidade({ habilidade, mana: 10, agora: 0, ultimoUso: null })
    expect(resultado).toEqual({ ok: false, motivo: 'semMana' })
    expect(avisoDoMotivo[resultado.motivo]).toBe('SEM MANA')
  })

  it('com mana suficiente, sai', () => {
    expect(podeUsarHabilidade({ habilidade, mana: 20, agora: 0, ultimoUso: null })).toEqual({ ok: true })
  })

  it('em recarga, não sai, até a recarga passar', () => {
    expect(podeUsarHabilidade({ habilidade, mana: 99, agora: 4999, ultimoUso: 0 }).motivo).toBe('recarga')
    expect(podeUsarHabilidade({ habilidade, mana: 99, agora: 5000, ultimoUso: 0 }).ok).toBe(true)
  })

  it('tecla vazia e habilidade sem alvo (Ressurreição sem caídos) também avisam', () => {
    expect(podeUsarHabilidade({ habilidade: null, mana: 99, agora: 0, ultimoUso: null }).motivo).toBe('vazio')
    expect(podeUsarHabilidade({ habilidade, mana: 99, agora: 0, ultimoUso: null, temAlvo: false }).motivo).toBe('semAlvo')
    for (const motivo of ['vazio', 'recarga', 'semMana', 'semAlvo']) expect(avisoDoMotivo[motivo]).toBeTruthy()
  })
})

describe('habilidades de teste (provisórias até a TASK-010)', () => {
  it('cada classe tem uma na tecla 1; as teclas 2 e 3 ficam vazias', () => {
    for (const classe of classes) {
      const teclas = habilidadesNasTeclas(classe.id)
      expect(teclas).toHaveLength(3)
      expect(teclas[0]).toMatchObject({ nome: habilidadesDeTeste[classe.id].nome })
      expect(teclas[0].custoDeMana).toBeGreaterThan(0)
      expect(teclas[0].recargaMs).toBeGreaterThan(0)
      expect(teclas[1]).toBeNull()
      expect(teclas[2]).toBeNull()
    }
  })

  it('só a Ressurreição (que vem da documentação) não é marcada como provisória', () => {
    const naoProvisorias = Object.values(habilidadesDeTeste).filter((h) => !h.provisoria)
    expect(naoProvisorias.map((h) => h.id)).toEqual(['ressurreicao'])
  })
})
