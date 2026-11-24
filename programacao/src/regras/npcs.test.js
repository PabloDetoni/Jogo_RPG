import { describe, expect, it } from 'vitest'
import { npcDoLugar, npcs } from '../dados/npcs.js'
import { conhecerNpc, falaDaVez } from './npcs.js'

const npc = { apresentacao: ['Oi!', 'Aqui se compra.', 'Volte sempre.'], falas: ['A', 'B', 'C'] }

describe('NPCs do Reino (RF57, Parte 9)', () => {
  it('na primeira visita, a apresentação, parte por parte (sem passar da última)', () => {
    expect(falaDaVez(npc, { conhecido: false })).toMatchObject({ apresentacao: true, texto: 'Oi!', parte: 0, partes: 3 })
    expect(falaDaVez(npc, { conhecido: false, parte: 2 })).toMatchObject({ texto: 'Volte sempre.', parte: 2 })
    expect(falaDaVez(npc, { conhecido: false, parte: 9 }).parte).toBe(2)
  })

  it('depois, uma fala sorteada que não repete a última', () => {
    expect(falaDaVez(npc, { conhecido: true }, () => 0.5)).toMatchObject({ apresentacao: false, texto: 'B', indice: 1 })
    expect(falaDaVez(npc, { conhecido: true, ultima: 1 }, () => 0.5)).toMatchObject({ texto: 'C', indice: 2 })
    expect(falaDaVez(npc, { conhecido: true, ultima: 2 }, () => 0.99).indice).toBe(0)
  })

  it('conhecer o NPC guarda no progresso uma vez só', () => {
    const { progresso } = conhecerNpc({ ouro: 5 }, 'ferreiro')
    expect(progresso.npcsConhecidos).toEqual(['ferreiro'])
    expect(conhecerNpc(progresso, 'ferreiro').progresso).toBe(progresso)
  })

  it('os três NPCs: um por lugar, com apresentação, falas e o menu do lugar', () => {
    expect(npcDoLugar('mercado')).toBe('comerciante')
    expect(npcDoLugar('forja')).toBe('ferreiro')
    expect(npcDoLugar('guilda')).toBe('mestre')
    for (const um of Object.values(npcs)) {
      expect(um.apresentacao.length).toBeGreaterThan(0)
      expect(um.falas.length).toBeGreaterThan(1)
      expect(um.menu.length).toBeGreaterThan(0)
    }
    expect(npcs.comerciante.menu.map((m) => m.rotulo)).toEqual(['Comprar', 'Vender', 'Trocar'])
    expect(npcs.ferreiro.menu.map((m) => m.rotulo)).toEqual(['Equipar', 'Comprar', 'Vender', 'Fabricar'])
    expect(npcs.mestre.menu.map((m) => m.rotulo)).toEqual(['Missões', 'Contratos'])
  })
})
