import { describe, expect, it } from 'vitest'
import {
  anguloDoArraste,
  deveLigarModoLeve,
  inimigoMaisPerto,
  miraDoToque,
  modoLeveAtivo,
  pontaDoJoystick,
  precisaGirar,
  textoParaOToque,
  usaToque,
  vetorDoJoystick,
} from './toque.js'

describe('usaToque e precisaGirar', () => {
  it('só o dedo como jeito principal de apontar liga os controles de toque', () => {
    expect(usaToque({ ponteiroGrosso: true })).toBe(true)
    expect(usaToque({ ponteiroGrosso: false })).toBe(false)
    expect(usaToque({})).toBe(false)
  })
  it('gire o celular só com toque e em pé', () => {
    expect(precisaGirar({ toque: true, emPe: true })).toBe(true)
    expect(precisaGirar({ toque: true, emPe: false })).toBe(false)
    expect(precisaGirar({ toque: false, emPe: true })).toBe(false)
  })
})

describe('vetorDoJoystick', () => {
  const raio = 50
  const zonaMorta = 0.2
  it('perto do meio fica parado', () => {
    expect(vetorDoJoystick({ dx: 5, dy: 5, raio, zonaMorta })).toEqual({ x: 0, y: 0, forca: 0 })
  })
  it('na borda, força 1 na direção do dedo', () => {
    const v = vetorDoJoystick({ dx: 50, dy: 0, raio, zonaMorta })
    expect(v.x).toBeCloseTo(1)
    expect(v.y).toBeCloseTo(0)
    expect(v.forca).toBe(1)
  })
  it('passando da borda, a força não passa de 1', () => {
    const v = vetorDoJoystick({ dx: 0, dy: -200, raio, zonaMorta })
    expect(v.forca).toBe(1)
    expect(v.y).toBeCloseTo(-1)
  })
  it('no meio do caminho, força proporcional', () => {
    expect(vetorDoJoystick({ dx: 30, dy: 40, raio: 100, zonaMorta }).forca).toBeCloseTo(0.5)
  })
  it('raio inválido fica parado', () => {
    expect(vetorDoJoystick({ dx: 30, dy: 40, raio: 0, zonaMorta })).toEqual({ x: 0, y: 0, forca: 0 })
  })
  it('o botão do joystick não passa da borda', () => {
    expect(pontaDoJoystick({ dx: 100, dy: 0, raio: 40 })).toEqual({ x: 40, y: 0 })
    expect(pontaDoJoystick({ dx: 10, dy: 0, raio: 40 })).toEqual({ x: 10, y: 0 })
  })
})

describe('inimigoMaisPerto', () => {
  const lider = { x: 0, y: 0 }
  it('acha o mais perto dentro do alcance, contando o corpo dele', () => {
    const inimigos = [
      { x: 100, y: 0, raio: 10 },
      { x: 60, y: 0, raio: 0 },
      { x: 300, y: 0, raio: 10 },
    ]
    expect(inimigoMaisPerto(lider, inimigos, 120)).toBe(inimigos[1])
    // o grande a 110 de distância com 20 de corpo está a 90 (dentro de 95)
    expect(inimigoMaisPerto(lider, [{ x: 110, y: 0, raio: 20 }], 95)).not.toBeNull()
  })
  it('ignora mortos, os que dormem e os longe demais', () => {
    expect(inimigoMaisPerto(lider, [{ x: 10, y: 0, morto: true }, { x: 20, y: 0, dormindo: true }, { x: 500, y: 0 }], 100)).toBeNull()
    expect(inimigoMaisPerto(lider, undefined, 100)).toBeNull()
  })
})

describe('miraDoToque', () => {
  const lider = { x: 0, y: 0 }
  it('o arraste manda na mira', () => {
    const mira = miraDoToque({ lider, inimigos: [{ x: 10, y: 0 }], alcance: 100, arraste: Math.PI / 2 })
    expect(mira.angulo).toBeCloseTo(Math.PI / 2)
    expect(mira.ponto.y).toBeCloseTo(100)
    expect(mira.alvo).toBeNull()
  })
  it('sem arraste, mira no inimigo mais perto (o ponto é o dele)', () => {
    const alvo = { x: 0, y: -50 }
    const mira = miraDoToque({ lider, inimigos: [alvo, { x: 90, y: 0 }], alcance: 100 })
    expect(mira.alvo).toBe(alvo)
    expect(mira.angulo).toBeCloseTo(-Math.PI / 2)
    expect(mira.ponto).toEqual({ x: 0, y: -50 })
  })
  it('sem inimigo perto: para onde anda; parado, o último ângulo', () => {
    expect(miraDoToque({ lider, inimigos: [], alcance: 100, andando: { x: -1, y: 0 } }).angulo).toBeCloseTo(Math.PI)
    expect(miraDoToque({ lider, inimigos: [], alcance: 100, andando: { x: 0, y: 0 }, anguloAnterior: 1 }).angulo).toBe(1)
  })
})

describe('anguloDoArraste', () => {
  it('um toque com o dedo tremendo não vira arraste', () => {
    expect(anguloDoArraste({ dx: 3, dy: 4, minimo: 18 })).toBeNull()
    expect(anguloDoArraste({ dx: 0, dy: 30, minimo: 18 })).toBeCloseTo(Math.PI / 2)
  })
})

describe('textoParaOToque', () => {
  it('"clique" vira "toque" e "clicar" vira "tocar", sem mexer no resto', () => {
    expect(textoParaOToque('Clique em Iniciar jogo; clique rápido.')).toBe('Toque em Iniciar jogo; toque rápido.')
    expect(textoParaOToque('Para clicar, Clicar.')).toBe('Para tocar, Tocar.')
    expect(textoParaOToque('item clicado')).toBe('item clicado')
    expect(textoParaOToque(undefined)).toBeUndefined()
  })
})

describe('modo leve', () => {
  const regra = { limite: 40, segundos: 3 }
  it('liga com o FPS baixo por alguns segundos seguidos', () => {
    expect(deveLigarModoLeve([60, 35, 30, 38], regra)).toBe(true)
    expect(deveLigarModoLeve([35, 30, 45], regra)).toBe(false)
    expect(deveLigarModoLeve([30, 30], regra)).toBe(false)
    expect(deveLigarModoLeve(null, regra)).toBe(false)
  })
  it('o FPS zero (aba escondida, nada medido) não conta', () => {
    expect(deveLigarModoLeve([0, 0, 0], regra)).toBe(false)
  })
  it('a opção das Configurações manda; no automático, o que ele decidiu', () => {
    expect(modoLeveAtivo({ opcao: 'ligado', ligouSozinho: false })).toBe(true)
    expect(modoLeveAtivo({ opcao: 'desligado', ligouSozinho: true })).toBe(false)
    expect(modoLeveAtivo({ opcao: 'automatico', ligouSozinho: true })).toBe(true)
    expect(modoLeveAtivo({ opcao: 'automatico', ligouSozinho: false })).toBe(false)
  })
})
