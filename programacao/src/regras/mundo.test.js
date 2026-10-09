import { describe, expect, it } from 'vitest'
import {
  areaEm,
  codificarNevoa,
  criarNevoa,
  criarSorteio,
  decodificarNevoa,
  distanciaAteABorda,
  gerarObstaculos,
  inicioDoPontoDePartida,
  juntarNevoas,
  paredesDaMata,
  regiaoEm,
  revelarEmVolta,
} from './mundo.js'

// Um mapa pequeno: corredor estreito à esquerda que se abre à direita
const regioes = [
  { id: 'zonaSegura', pontoDePartida: 'inicio', x0: 0, x1: 500, y0: 400, y1: 600, inicio: { x: 100, y: 500 } },
  { id: 'facil', pontoDePartida: 'facil', x0: 500, x1: 1500, y0: 100, y1: 900, inicio: { x: 600, y: 500 } },
]
const tamanho = { largura: 1500, altura: 1000 }
const dentroDeParede = (ponto, paredes) =>
  paredes.some((p) => Math.abs(ponto.x - p.x) * 2 < p.largura && Math.abs(ponto.y - p.y) * 2 < p.altura)

describe('mata fechada em volta das regiões (TASK-060)', () => {
  const paredes = paredesDaMata(regioes, tamanho)

  it('em cima e embaixo de cada região vira parede; dentro delas, não', () => {
    expect(dentroDeParede({ x: 250, y: 300 }, paredes)).toBe(true) // acima do corredor
    expect(dentroDeParede({ x: 250, y: 700 }, paredes)).toBe(true) // abaixo do corredor
    expect(dentroDeParede({ x: 1000, y: 50 }, paredes)).toBe(true)
    expect(dentroDeParede({ x: 250, y: 500 }, paredes)).toBe(false)
    expect(dentroDeParede({ x: 1000, y: 500 }, paredes)).toBe(false)
    expect(dentroDeParede({ x: 520, y: 200 }, paredes)).toBe(false) // a região larga começa logo depois do corredor
  })

  it('região que vai até a borda do mapa não gera parede vazia', () => {
    const cheia = paredesDaMata([{ x0: 0, x1: 100, y0: 0, y1: 100 }], { largura: 100, altura: 100 })
    expect(cheia).toEqual([])
  })
})

describe('em que região e área o ponto está (TASK-061)', () => {
  it('pela faixa; na divisa, vale a da direita; dentro da mata, nenhuma', () => {
    expect(regiaoEm(regioes, { x: 100, y: 500 }).id).toBe('zonaSegura')
    expect(regiaoEm(regioes, { x: 500, y: 500 }).id).toBe('facil')
    expect(regiaoEm(regioes, { x: 1500, y: 500 }).id).toBe('facil') // a beira da última região
    expect(regiaoEm(regioes, { x: 100, y: 100 })).toBeNull()
  })

  it('áreas com nome dentro das regiões', () => {
    const areas = [{ id: 'clareira', x0: 500, x1: 1000, y0: 100, y1: 900 }]
    expect(areaEm(areas, { x: 700, y: 300 }).id).toBe('clareira')
    expect(areaEm(areas, { x: 1200, y: 300 })).toBeNull()
  })
})

describe('borda da taxa (RF48) e pontos de partida (RF32)', () => {
  it('a borda é a distância até o canto andável mais longe do ponto inicial', () => {
    expect(distanciaAteABorda({ x: 100, y: 500 }, regioes)).toBe(Math.round(Math.hypot(1400, 400)))
  })

  it('cada ponto de partida é o início da região dele; sem a região, o ponto inicial do bioma', () => {
    expect(inicioDoPontoDePartida(regioes, 'facil')).toEqual({ x: 600, y: 500 })
    expect(inicioDoPontoDePartida(regioes, 'dificil')).toEqual({ x: 100, y: 500 })
  })
})

describe('árvores e pedras espalhadas', () => {
  const config = {
    espacamento: 200,
    desvio: 40,
    densidade: { zonaSegura: 0.2, facil: 1 },
    arvore: { min: 40, max: 80 },
    pedra: { largura: [60, 100], altura: [40, 70] },
    chanceDePedra: 0.3,
    margem: 0,
    passagemMinima: 40,
  }
  const livres = [{ x: 600, y: 500, raio: 150 }]
  const obstaculos = gerarObstaculos(regioes, livres, config, 42)

  it('a mesma semente dá o mesmo mapa', () => {
    expect(gerarObstaculos(regioes, livres, config, 42)).toEqual(obstaculos)
    expect(gerarObstaculos(regioes, livres, config, 7)).not.toEqual(obstaculos)
  })

  it('nada perto dos pontos livres nem fora da faixa andável', () => {
    expect(obstaculos.length).toBeGreaterThan(10)
    for (const o of obstaculos) {
      expect(Math.hypot(o.x - 600, o.y - 500)).toBeGreaterThan(150)
      const regiao = regiaoEm(regioes, o)
      expect(regiao).not.toBeNull()
      expect(o.y - o.altura / 2).toBeGreaterThanOrEqual(regiao.y0)
      expect(o.y + o.altura / 2).toBeLessThanOrEqual(regiao.y1)
    }
  })

  it('sempre sobra passagem: dois obstáculos nunca ficam a menos de 40 px um do outro', () => {
    for (let i = 0; i < obstaculos.length; i++) {
      for (let j = i + 1; j < obstaculos.length; j++) {
        const a = obstaculos[i]
        const b = obstaculos[j]
        const folgaX = Math.abs(a.x - b.x) - (a.largura + b.largura) / 2
        const folgaY = Math.abs(a.y - b.y) - (a.altura + b.altura) / 2
        expect(Math.max(folgaX, folgaY)).toBeGreaterThanOrEqual(40)
      }
    }
  })
})

describe('névoa do minimapa (RF40)', () => {
  it('começa escura e revela as células em volta do ponto, uma vez só', () => {
    const nevoa = criarNevoa({ largura: 1000, altura: 500 }, 100)
    expect(nevoa.bits.every((bit) => bit === 0)).toBe(true)
    const novas = revelarEmVolta(nevoa, { x: 250, y: 250 }, 120)
    expect(novas).toBeGreaterThan(0)
    expect(nevoa.bits[2 * nevoa.colunas + 2]).toBe(1) // a célula do ponto
    expect(nevoa.bits[0]).toBe(0) // longe
    expect(revelarEmVolta(nevoa, { x: 250, y: 250 }, 120)).toBe(0)
  })

  it('vai e volta do save sem perder nada, e junta o salvo com o da partida', () => {
    const bits = Uint8Array.from([1, 0, 1, 1, 0, 0, 0, 1, 1])
    const texto = codificarNevoa(bits)
    expect(texto).toBe('b18')
    expect([...decodificarNevoa(texto, 9)]).toEqual([...bits])
    expect(juntarNevoas('8', '1', 4)).toBe('9')
    expect([...decodificarNevoa('zz', 8)]).toEqual([0, 0, 0, 0, 0, 0, 0, 0]) // texto estragado não quebra
  })

  it('criar a névoa a partir do que já foi revelado', () => {
    const salva = decodificarNevoa('f', 4)
    const nevoa = criarNevoa({ largura: 200, altura: 200 }, 100, salva)
    expect([...nevoa.bits]).toEqual([1, 1, 1, 1])
  })

  it('o sorteio com semente se repete', () => {
    const a = criarSorteio(1)
    const b = criarSorteio(1)
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
  })
})
