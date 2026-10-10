import { describe, expect, it } from 'vitest'
import { contratarTodasAsClasses, mudarNivel, quaseSubir, itensDeTeste, ouroDeTeste, pontosDeTeste } from './ferramentasDeDev.js'
import { itemDoCatalogo } from '../dados/itens.js'
import { novoPersonagem, progressoInicial } from './progresso.js'

// Ferramentas do painel "</> DEV" (só no npm run dev). A regra "só fora da partida" fica no estado do jogo.
describe('ferramentas de teste do painel DEV', () => {
  const comMago = { ...progressoInicial(), personagens: [novoPersonagem('mago')], lider: 'mago' }

  it('contratar todas: um permanente de cada classe que falta, e o temporário dessas classes vai embora', () => {
    const comTemporario = { ...comMago, contratosTemporarios: [{ classe: 'arqueiro', partidasRestantes: 2, nivel: 5 }] }
    const depois = contratarTodasAsClasses(comTemporario)
    expect(depois.personagens).toHaveLength(5)
    expect(depois.personagens.every((personagem) => personagem.nivel === 1)).toBe(true)
    expect(depois.contratosTemporarios).toEqual([])
    expect(contratarTodasAsClasses(depois)).toEqual(depois) // de novo, nada muda
  })

  it('o nível fica entre 1 e 100 e o XP volta a 0', () => {
    expect(mudarNivel(comMago, 'mago', 200).personagens[0]).toMatchObject({ nivel: 100, xp: 0 })
    expect(mudarNivel(comMago, 'mago', -5).personagens[0].nivel).toBe(1)
    expect(mudarNivel(comMago, 'tanque', 5)).toEqual(comMago) // classe que não tem: nada muda
  })

  it('quase subir: a 1 XP do próximo nível; no nível 100, nada muda', () => {
    expect(quaseSubir(comMago, 'mago').personagens[0].xp).toBe(99)
    const noMaximo = mudarNivel(comMago, 'mago', 99)
    expect(quaseSubir(noMaximo, 'mago')).toEqual(noMaximo)
  })
})

describe('itens de teste (Fase 4, só no npm run dev)', () => {
  it('põe uma amostra do catálogo na Mochila e soma o ouro, sem perder o que já havia', () => {
    const antes = { ...progressoInicial(), ouro: 50, mochila: [{ id: 'pocaoDeVida', quantidade: 2 }] }
    const depois = itensDeTeste(antes)
    expect(depois.ouro).toBe(50 + ouroDeTeste)
    expect(depois.mochila.find((item) => item.id === 'pocaoDeVida').quantidade).toBe(5)
    expect(depois.mochila.find((item) => item.id === 'peleDeLobo').quantidade).toBe(10)
    expect(depois.mochila.find((item) => item.id === 'espadaCurta').quantidade).toBe(1)
    expect(depois.mochila.every((item) => itemDoCatalogo(item.id))).toBe(true)
  })

  it('dá pontos livres de atributo e de habilidade a cada permanente', () => {
    const antes = { ...progressoInicial(), personagens: [novoPersonagem('mago')], lider: 'mago' }
    const [mago] = itensDeTeste(antes).personagens
    expect(mago.pontosDeAtributo).toBe(pontosDeTeste.atributo)
    expect(mago.pontosDeHabilidade).toBe(pontosDeTeste.habilidade)
  })
})
