import { describe, expect, it, vi } from 'vitest'
import { dividirXp, ganharXp, xpParaSubir, xpTotalAteONivel } from './xp.js'

// Valores fixos só para este teste: mudar o balanceamento não quebra o teste da regra
vi.mock('../dados/balanceamento.js', async (importarOriginal) => ({
  ...(await importarOriginal()),
  curvaDeXp: { base: 100, expoente: 1 },
  pontosDeAtributoPorNivel: 3,
  pontosDeHabilidadePorNivel: 1,
}))

const personagem = (nivel = 1, xp = 0) => ({ classe: 'mago', nivel, xp, pontosDeAtributo: 0, pontosDeHabilidade: 0 })

describe('xpParaSubir (RF55)', () => {
  it('segue a curva: 100 × nível', () => {
    expect(xpParaSubir(1)).toBe(100)
    expect(xpParaSubir(2)).toBe(200)
    expect(xpParaSubir(99)).toBe(9900)
  })

  it('no nível máximo não há próximo nível', () => {
    expect(xpParaSubir(100)).toBe(Infinity)
  })
})

describe('xpTotalAteONivel', () => {
  it('soma o XP de todos os níveis anteriores', () => {
    expect(xpTotalAteONivel(1)).toBe(0)
    expect(xpTotalAteONivel(2)).toBe(100)
    expect(xpTotalAteONivel(3)).toBe(300)
    expect(xpTotalAteONivel(100)).toBe(495000)
  })
})

describe('dividirXp (RF50)', () => {
  it('divide igualmente', () => {
    expect(dividirXp(100, ['mago', 'tanque', 'guerreiro', 'arqueiro', 'sacerdote'])).toEqual({
      mago: 20,
      tanque: 20,
      guerreiro: 20,
      arqueiro: 20,
      sacerdote: 20,
    })
    expect(dividirXp(100, ['mago'])).toEqual({ mago: 100 })
  })

  it('a sobra vai para o Líder primeiro (100 ÷ 3 = 34 + 33 + 33)', () => {
    expect(dividirXp(100, ['mago', 'tanque', 'guerreiro'], 'tanque')).toEqual({ tanque: 34, mago: 33, guerreiro: 33 })
  })

  it('nunca perde nem cria XP', () => {
    for (let xp = 0; xp <= 50; xp++) {
      for (const grupo of [['a'], ['a', 'b'], ['a', 'b', 'c'], ['a', 'b', 'c', 'd'], ['a', 'b', 'c', 'd', 'e']]) {
        const partes = Object.values(dividirXp(xp, grupo, 'b'))
        expect(partes.reduce((soma, parte) => soma + parte, 0)).toBe(xp)
        expect(Math.max(...partes) - Math.min(...partes)).toBeLessThanOrEqual(1)
      }
    }
  })

  it('ninguém para receber: nada é dividido', () => {
    expect(dividirXp(100, [])).toEqual({})
  })

  it('XP negativo ou quebrado não estraga a conta', () => {
    expect(dividirXp(-50, ['mago'])).toEqual({ mago: 0 })
    expect(dividirXp(10.9, ['mago'])).toEqual({ mago: 10 })
  })
})

describe('ganharXp (RF55)', () => {
  it('sem chegar ao próximo nível, só junta XP', () => {
    const { personagem: depois, niveisGanhos } = ganharXp(personagem(), 50)
    expect(depois).toMatchObject({ nivel: 1, xp: 50, pontosDeAtributo: 0, pontosDeHabilidade: 0 })
    expect(niveisGanhos).toBe(0)
  })

  it('sobe de nível e ganha pontos de atributo e de habilidade', () => {
    const { personagem: depois, niveisGanhos } = ganharXp(personagem(), 100)
    expect(depois).toMatchObject({ nivel: 2, xp: 0, pontosDeAtributo: 3, pontosDeHabilidade: 1 })
    expect(niveisGanhos).toBe(1)
  })

  it('sobe vários níveis de uma vez e guarda o que sobra', () => {
    // 100 (1→2) + 200 (2→3) = 300; sobram 50
    const { personagem: depois, niveisGanhos } = ganharXp(personagem(), 350)
    expect(depois).toMatchObject({ nivel: 3, xp: 50, pontosDeAtributo: 6, pontosDeHabilidade: 2 })
    expect(niveisGanhos).toBe(2)
  })

  it('para no nível máximo e descarta o XP a mais', () => {
    const { personagem: depois } = ganharXp(personagem(99, 0), 10_000_000)
    expect(depois).toMatchObject({ nivel: 100, xp: 0 })
    const { personagem: noMaximo, niveisGanhos } = ganharXp(depois, 500)
    expect(noMaximo).toMatchObject({ nivel: 100, xp: 0, pontosDeAtributo: 3 })
    expect(niveisGanhos).toBe(0)
  })

  it('soma aos pontos que o personagem já tinha', () => {
    const antes = { ...personagem(), pontosDeAtributo: 2, pontosDeHabilidade: 5 }
    expect(ganharXp(antes, 100).personagem).toMatchObject({ pontosDeAtributo: 5, pontosDeHabilidade: 6 })
  })

  it('XP negativo não tira nível nem XP (TEST-003)', () => {
    expect(ganharXp(personagem(3, 40), -500).personagem).toMatchObject({ nivel: 3, xp: 40 })
  })

  it('não altera o personagem original', () => {
    const antes = personagem()
    ganharXp(antes, 1000)
    expect(antes).toEqual(personagem())
  })
})
