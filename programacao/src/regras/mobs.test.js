import { describe, expect, it } from 'vitest'
import { dentroDoTerritorio, direcaoDeFuga, espalharMobs, fichaNaRegiao, passoNaArea, pontosEmVolta } from './mobs.js'
import { criarSorteio } from './mundo.js'

describe('força do mob pela região (TASK-062)', () => {
  const lobo = { vida: 60, dano: 10, xp: 20, ouro: 8, velocidade: 140, raioDeDeteccao: 350 }

  it('na fácil (força 1) fica igual; nas mais difíceis, vida, dano, XP e ouro crescem juntos', () => {
    expect(fichaNaRegiao(lobo, 1)).toEqual(lobo)
    const dificil = fichaNaRegiao(lobo, 2)
    expect(dificil).toMatchObject({ vida: 120, dano: 20, xp: 40, ouro: 16 })
    // o jeito de andar e de perceber o grupo não muda
    expect(dificil.velocidade).toBe(140)
    expect(dificil.raioDeDeteccao).toBe(350)
  })

  it('nunca chega a zero', () => {
    expect(fichaNaRegiao({ vida: 1, dano: 0, xp: 0, ouro: 0 }, 0.1)).toMatchObject({ vida: 1, dano: 1, xp: 1, ouro: 1 })
  })
})

describe('onde os mobs nascem (RF31, RF32)', () => {
  const regioes = [
    { id: 'zonaSegura', x0: 0, x1: 500, y0: 400, y1: 600 },
    { id: 'facil', x0: 500, x1: 2000, y0: 0, y1: 1000 },
  ]
  const populacao = { facil: { lobo: 6, cervo: 3 } }
  const proibidos = [{ x: 600, y: 500, raio: 400 }]
  const mobs = espalharMobs(regioes, populacao, { proibidos, distanciaEntreMobs: 120, margem: 60 }, criarSorteio(3))

  it('a quantidade de cada tipo, só nas regiões que têm mobs (a zona segura não tem)', () => {
    expect(mobs.filter((mob) => mob.tipo === 'lobo')).toHaveLength(6)
    expect(mobs.filter((mob) => mob.tipo === 'cervo')).toHaveLength(3)
    expect(mobs.every((mob) => mob.regiao === 'facil')).toBe(true)
  })

  it('dentro da região, longe da mata, longe dos inícios e longe uns dos outros (ninguém nasce encostado)', () => {
    for (const mob of mobs) {
      expect(mob.x).toBeGreaterThanOrEqual(560)
      expect(mob.x).toBeLessThanOrEqual(1940)
      expect(mob.y).toBeGreaterThanOrEqual(60)
      expect(mob.y).toBeLessThanOrEqual(940)
      expect(Math.hypot(mob.x - 600, mob.y - 500)).toBeGreaterThanOrEqual(400)
    }
    for (let i = 0; i < mobs.length; i++) {
      for (let j = i + 1; j < mobs.length; j++) expect(Math.hypot(mobs[i].x - mobs[j].x, mobs[i].y - mobs[j].y)).toBeGreaterThanOrEqual(120)
    }
  })

  it('a cada partida o sorteio muda (o bioma reinicia), mas com a mesma semente é igual', () => {
    const outra = espalharMobs(regioes, populacao, { proibidos, distanciaEntreMobs: 120, margem: 60 }, criarSorteio(4))
    expect(outra).not.toEqual(mobs)
    expect(espalharMobs(regioes, populacao, { proibidos, distanciaEntreMobs: 120, margem: 60 }, criarSorteio(3))).toEqual(mobs)
  })

  it('sem lugar (região pequena demais), nasce quem cabe e o resto fica de fora, sem travar', () => {
    const apertada = [{ id: 'facil', x0: 0, x1: 200, y0: 0, y1: 200 }]
    const poucos = espalharMobs(apertada, { facil: { lobo: 20 } }, { distanciaEntreMobs: 150, margem: 20 }, criarSorteio(1))
    expect(poucos.length).toBeGreaterThan(0)
    expect(poucos.length).toBeLessThan(20)
  })
})

describe('território', () => {
  it('dentro até o raio a partir de casa; fora dele, não', () => {
    expect(dentroDoTerritorio({ x: 0, y: 0 }, { x: 300, y: 400 }, 500)).toBe(true)
    expect(dentroDoTerritorio({ x: 0, y: 0 }, { x: 300, y: 401 }, 500)).toBe(false)
  })
})

describe('território pela área, fuga e bando (Parte 6a)', () => {
  // a área: só x < 100
  const naArea = (p) => p.x < 100

  it('o passo que cabe na área passa igual', () => {
    expect(passoNaArea({ x: 0, y: 0 }, { x: 100, y: 50 }, naArea)).toEqual({ x: 100, y: 50 })
  })

  it('na borda, desliza pelo eixo que cabe', () => {
    expect(passoNaArea({ x: 95, y: 0 }, { x: 100, y: 50 }, naArea)).toEqual({ x: 0, y: 50 })
    expect(passoNaArea({ x: 95, y: 0 }, { x: -100, y: 0 }, naArea)).toEqual({ x: -100, y: 0 })
  })

  it('indo reto contra a borda, gira o passo para o lado (90°); num canto sem saída, para', () => {
    const passo = passoNaArea({ x: 95, y: 0 }, { x: 100, y: 0 }, naArea)
    expect(passo.x).toBeCloseTo(0)
    expect(Math.abs(passo.y)).toBeCloseTo(100)
    expect(passoNaArea({ x: 95, y: 0 }, { x: 100, y: 0 }, (p) => p.x < 100 && Math.abs(p.y) < 1)).toEqual({ x: 0, y: 0 })
  })

  it('a fuga vai para longe da ameaça; longe demais, nada', () => {
    const fuga = direcaoDeFuga({ x: 0, y: 0 }, [{ x: 100, y: 0 }], 300)
    expect(fuga.x).toBeCloseTo(-1)
    expect(fuga.y).toBeCloseTo(0)
    expect(direcaoDeFuga({ x: 0, y: 0 }, [{ x: 400, y: 0 }], 300)).toBeNull()
  })

  it('entre duas ameaças, foge para o lado livre; a mais perto pesa mais', () => {
    const fuga = direcaoDeFuga({ x: 0, y: 0 }, [{ x: 100, y: 0 }, { x: 0, y: 250 }], 300)
    expect(fuga.x).toBeLessThan(0)
    expect(fuga.y).toBeLessThan(0)
    expect(Math.abs(fuga.x)).toBeGreaterThan(Math.abs(fuga.y))
    expect(Math.hypot(fuga.x, fuga.y)).toBeCloseTo(1)
  })

  it('o bando em volta do líder: a mesma distância, espalhado', () => {
    const pontos = pontosEmVolta({ x: 500, y: 500 }, 3, 100, criarSorteio(7))
    expect(pontos).toHaveLength(3)
    for (const p of pontos) expect(Math.hypot(p.x - 500, p.y - 500)).toBeCloseTo(100, 0)
    expect(Math.hypot(pontos[0].x - pontos[1].x, pontos[0].y - pontos[1].y)).toBeGreaterThan(150)
  })
})
