import { describe, expect, it } from 'vitest'
import {
  alvoDoInimigo,
  deveVoltar,
  inimigosPerto,
  maisProximo,
  pontoDeMaisInimigos,
  posicaoADistancia,
  posicaoDoTanque,
  quemCurar,
  vagaEmVoltaDoAlvo,
} from './iaDosAliados.js'

const distancia = (a, b) => Math.hypot(b.x - a.x, b.y - a.y)

describe('com quem lutar', () => {
  const lider = { x: 0, y: 0 }

  it('só inimigos vivos e perto do Líder', () => {
    const inimigos = [{ x: 100, y: 0 }, { x: 900, y: 0 }, { x: 50, y: 0, morto: true }]
    expect(inimigosPerto(inimigos, lider, 380)).toEqual([{ x: 100, y: 0 }])
  })

  it('Guerreiro: o mais próximo dele', () => {
    const guerreiro = { x: 200, y: 0 }
    expect(maisProximo(guerreiro, [{ x: 0, y: 0 }, { x: 250, y: 0 }, { x: 100, y: 0 }])).toEqual({ x: 250, y: 0 })
    expect(maisProximo(guerreiro, [])).toBeNull()
  })

  it('Mago: mira onde há mais mobs juntos, no meio deles', () => {
    const mago = { x: 0, y: 0 }
    const inimigos = [{ x: 100, y: 0 }, { x: 400, y: 0 }, { x: 440, y: 0 }, { x: 420, y: 30 }]
    const ponto = pontoDeMaisInimigos(mago, inimigos, 90)
    expect(ponto.quantos).toBe(3)
    expect(ponto.x).toBeCloseTo(420)
    expect(ponto.y).toBeCloseTo(10)
  })

  it('Mago: sem grupinho, fica com o mais perto; sem inimigos, null', () => {
    expect(pontoDeMaisInimigos({ x: 0, y: 0 }, [{ x: 500, y: 0 }, { x: 100, y: 0 }], 90)).toEqual({ x: 100, y: 0, quantos: 1 })
    expect(pontoDeMaisInimigos({ x: 0, y: 0 }, [], 90)).toBeNull()
  })
})

describe('onde ficar', () => {
  const faixa = { minima: 220, maxima: 320 }

  it('Arqueiro: perto demais do mob, recua para o meio da faixa, do mesmo lado', () => {
    const ponto = posicaoADistancia({ x: 100, y: 0 }, { x: 0, y: 0 }, faixa)
    expect(ponto).toEqual({ x: 270, y: 0 })
  })

  it('Arqueiro: longe demais, chega mais perto; dentro da faixa, fica parado', () => {
    expect(posicaoADistancia({ x: 0, y: 600 }, { x: 0, y: 0 }, faixa)).toEqual({ x: 0, y: 270 })
    expect(posicaoADistancia({ x: 250, y: 0 }, { x: 0, y: 0 }, faixa)).toEqual({ x: 250, y: 0 })
  })

  it('quem luta de perto se espalha em volta do mob: vagas diferentes, todas à mesma distância', () => {
    const alvo = { x: 0, y: 0 }
    const vagas = [0, 1, 2].map((i) => vagaEmVoltaDoAlvo(alvo, i, 3, 60, { x: -200, y: 0 }))
    for (const vaga of vagas) expect(distancia(vaga, alvo)).toBeCloseTo(60)
    for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) expect(distancia(vagas[i], vagas[j])).toBeGreaterThan(40)
    // Um só: fica do lado do Líder
    const sozinho = vagaEmVoltaDoAlvo(alvo, 0, 1, 60, { x: -200, y: 0 })
    expect(sozinho.x).toBeCloseTo(-60)
    expect(sozinho.y).toBeCloseTo(0)
  })

  it('Tanque: entre o mob e o Líder, colado no mob', () => {
    const ponto = posicaoDoTanque({ x: 300, y: 0 }, { x: 0, y: 0 }, 50)
    expect(ponto).toEqual({ x: 250, y: 0 })
  })
})

describe('voltar para o Líder', () => {
  const raios = { raioDaCorrente: 420, raioDeVolta: 160 }

  it('só começa a voltar longe, e só para de voltar perto', () => {
    expect(deveVoltar(false, 400, raios)).toBe(false)
    expect(deveVoltar(false, 430, raios)).toBe(true)
    expect(deveVoltar(true, 300, raios)).toBe(true)
    expect(deveVoltar(true, 150, raios)).toBe(false)
  })
})

describe('quem os inimigos atacam', () => {
  const raios = { raioDeDeteccao: 350, raioDeDesistencia: 550, raioDeAtracao: 260, raioDaProvocacao: 300 }
  const mob = { x: 0, y: 0 }
  const lider = { x: 200, y: 0, classe: 'mago' }
  const guerreiro = { x: 100, y: 0, classe: 'guerreiro' }
  const tanque = { x: 240, y: 0, classe: 'tanque' }

  it('sem Tanque: o mais perto dentro do raio de detecção', () => {
    expect(alvoDoInimigo(mob, [lider, guerreiro], { ...raios, alvoAtual: null })).toBe(guerreiro)
    expect(alvoDoInimigo(mob, [{ x: 400, y: 0 }], { ...raios, alvoAtual: null })).toBeNull()
  })

  it('o Tanque perto atrai o mob, mesmo com outro mais perto (TASK-043)', () => {
    expect(alvoDoInimigo(mob, [lider, guerreiro, tanque], { ...raios, alvoAtual: guerreiro })).toBe(tanque)
  })

  it('perseguindo alguém, continua até ele passar do raio de desistência', () => {
    const fugindo = { x: 500, y: 0, classe: 'arqueiro' }
    expect(alvoDoInimigo(mob, [fugindo], { ...raios, alvoAtual: fugindo })).toBe(fugindo)
    const longe = { x: 600, y: 0, classe: 'arqueiro' }
    expect(alvoDoInimigo(mob, [longe], { ...raios, alvoAtual: longe })).toBeNull()
  })

  it('quem caiu sai da lista: o mob troca de alvo', () => {
    expect(alvoDoInimigo(mob, [lider], { ...raios, alvoAtual: guerreiro })).toBe(lider)
  })

  it('a Provocação puxa os mobs no raio dela, mesmo de longe', () => {
    const provocando = { x: 290, y: 0, classe: 'tanque', provocando: true }
    expect(alvoDoInimigo(mob, [guerreiro, provocando], { ...raios, alvoAtual: guerreiro })).toBe(provocando)
    expect(alvoDoInimigo(mob, [guerreiro, provocando], { ...raios, raioDaProvocacao: 200, alvoAtual: guerreiro })).toBe(guerreiro)
  })
})

describe('Sacerdote: quem curar (TASK-045)', () => {
  const membro = (vida, extra = {}) => ({ vida, vidaMaxima: 100, ...extra })

  it('o Líder primeiro, se ele precisar', () => {
    const lider = membro(60, { lider: true })
    expect(quemCurar([membro(20), lider], 0.7)).toBe(lider)
  })

  it('senão, quem tem a menor fração de vida abaixo do limite', () => {
    const pior = membro(20)
    expect(quemCurar([membro(90, { lider: true }), membro(50), pior], 0.7)).toBe(pior)
  })

  it('ninguém abaixo do limite, ou só caídos: ninguém', () => {
    expect(quemCurar([membro(80), membro(0, { caido: true })], 0.7)).toBeNull()
  })
})
