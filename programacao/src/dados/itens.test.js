import { describe, expect, it } from 'vitest'
import { espacosDeEquipamento } from './equipamento.js'
import { itemDoCatalogo, itens } from './itens.js'
import { classes } from './classes.js'

describe('catálogo de itens provisório (TASK-070)', () => {
  it('busca por id: nome, peso e preço; id inexistente devolve null sem travar', () => {
    expect(itemDoCatalogo('peleDeLobo')).toMatchObject({ id: 'peleDeLobo', nome: 'Pele de lobo', peso: 2, preco: 8 })
    expect(itemDoCatalogo('naoExiste')).toBeNull()
    expect(itemDoCatalogo('toString')).toBeNull()
  })

  it('todo item tem os campos básicos, com peso inteiro positivo e preço sem números absurdos', () => {
    for (const item of Object.values(itens)) {
      expect(item.nome.length).toBeGreaterThan(2)
      expect(['recurso', 'material', 'consumivel', 'equipamento']).toContain(item.tipo)
      expect(Number.isInteger(item.peso) && item.peso >= 1 && item.peso <= 20).toBe(true)
      expect(item.preco).toBeGreaterThanOrEqual(0)
      expect(item.preco).toBeLessThanOrEqual(10000)
    }
  })

  it('o equipamento de teste cobre todos os espaços; armadura serve para todas as classes, arma e escudo para uma', () => {
    const deTeste = Object.values(itens).filter((item) => item.raridade === 'teste')
    expect(deTeste.map((item) => item.espaco).sort()).toEqual(espacosDeEquipamento.map((espaco) => espaco.id).sort())
    const ids = new Set(classes.map((classe) => classe.id))
    for (const item of Object.values(itens).filter((um) => um.tipo === 'equipamento')) {
      const espaco = espacosDeEquipamento.find((um) => um.id === item.espaco)
      expect(espaco).toBeDefined()
      if (espaco.armadura) expect(item.classes).toBe('todas')
      else expect(item.classes.every((classe) => ids.has(classe))).toBe(true)
    }
  })
})
