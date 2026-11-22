import { describe, expect, it } from 'vitest'
import { atributosNoCombate, combateDeTeste } from '../dados/balanceamento.js'
import { atributosIniciaisDaClasse, classes } from '../dados/classes.js'
import { fatorDeCura, fatorDeDanoDaClasse, fatorDoAtributo, velocidadePelaAgilidade } from './atributos.js'
import { imuneContra, registrarImunidade } from './combate.js'
import { membroDeTeste } from './grupoDaPartida.js'

// Parte 3 (11/2026): os atributos mudam o dano, a cura e a velocidade (Conceito §6); a imunidade é por atacante

describe('o atributo muda o dano (efeitoDoAtributo, curva 1,5)', () => {
  it('no valor inicial da classe o fator é 1: o nível 1 continua como era', () => {
    for (const classe of classes) {
      expect(fatorDeDanoDaClasse(classe.id, atributosIniciaisDaClasse(classe.id)), classe.id).toBeCloseTo(1)
    }
  })

  it('mais atributo, mais dano; 100 vale bem mais que 50 (e nada passa do máximo)', () => {
    const f50 = fatorDoAtributo(50, 14)
    const f100 = fatorDoAtributo(100, 14)
    expect(fatorDoAtributo(30, 14)).toBeGreaterThan(1)
    expect(f50).toBeGreaterThan(1.7)
    expect(f100).toBeGreaterThan(f50 * 1.6)
    expect(fatorDoAtributo(250, 14)).toBeCloseTo(f100)
  })

  it('cada classe usa o seu atributo: Força (Guerreiro e Tanque), Inteligência (Mago), Sabedoria (Sacerdote)', () => {
    const subir = (classe, atributo) => ({ ...atributosIniciaisDaClasse(classe), [atributo]: 60 })
    expect(fatorDeDanoDaClasse('guerreiro', subir('guerreiro', 'forca'))).toBeGreaterThan(1.5)
    expect(fatorDeDanoDaClasse('guerreiro', subir('guerreiro', 'inteligencia'))).toBeCloseTo(1)
    expect(fatorDeDanoDaClasse('mago', subir('mago', 'inteligencia'))).toBeGreaterThan(1.5)
    expect(fatorDeDanoDaClasse('tanque', subir('tanque', 'forca'))).toBeGreaterThan(1.5)
    expect(fatorDeDanoDaClasse('sacerdote', subir('sacerdote', 'sabedoria'))).toBeGreaterThan(1.3)
    // o Arqueiro já usa a Força no arco (regras/arco.js): aqui fica 1, para não contar duas vezes
    expect(fatorDeDanoDaClasse('arqueiro', subir('arqueiro', 'forca'))).toBe(1)
  })

  it('a cura cresce com a Sabedoria (o Sacerdote inicial cura como antes)', () => {
    expect(fatorDeCura(atributosIniciaisDaClasse('sacerdote'))).toBeCloseTo(1)
    expect(fatorDeCura({ sabedoria: 60 })).toBeGreaterThan(1.5)
  })
})

describe('velocidade pela Agilidade', () => {
  it('170 + 1,5 × Agilidade (provisório)', () => {
    const { base, porPontoDeAgilidade } = atributosNoCombate.velocidade
    expect(velocidadePelaAgilidade(0)).toBe(base)
    expect(velocidadePelaAgilidade(22)).toBeCloseTo(base + 22 * porPontoDeAgilidade)
    expect(velocidadePelaAgilidade(500)).toBe(base + 100 * porPontoDeAgilidade)
  })

  it('o grupo do começo anda entre ~180 e ~205 px/s e mais rápido que os mobs de hoje (dá para fugir)', () => {
    for (const classe of classes) {
      const { velocidade } = membroDeTeste(classe.id)
      expect(velocidade, classe.id).toBeGreaterThanOrEqual(180)
      expect(velocidade, classe.id).toBeLessThanOrEqual(205)
    }
    expect(combateDeTeste.personagem.velocidade).toBeGreaterThan(0)
  })

  it('o membro da partida leva os números novos', () => {
    const membro = membroDeTeste('mago')
    expect(membro.fatorDeDano).toBeCloseTo(1)
    expect(membro.fatorDeCura).toBeGreaterThan(0)
    expect(membro.velocidade).toBeCloseTo(velocidadePelaAgilidade(atributosIniciaisDaClasse('mago').agilidade))
  })
})

describe('imunidade só contra o mesmo atacante', () => {
  it('quem bateu não bate de novo logo em seguida; outro atacante bate', () => {
    const lobo = { id: 'lobo' }
    const aranha = { id: 'aranha' }
    const imunidades = registrarImunidade(null, lobo, 1000, 500)
    expect(imuneContra(imunidades, lobo, 1200)).toBe(true)
    expect(imuneContra(imunidades, aranha, 1200)).toBe(false)
    expect(imuneContra(imunidades, lobo, 1500)).toBe(false)
    expect(imuneContra(null, lobo, 0)).toBe(false)
  })

  it('as imunidades que já acabaram são esquecidas', () => {
    const a = { id: 'a' }
    const b = { id: 'b' }
    let imunidades = registrarImunidade(null, a, 0, 500)
    imunidades = registrarImunidade(imunidades, b, 600, 500)
    expect(imunidades.has(a)).toBe(false)
    expect(imunidades.has(b)).toBe(true)
  })
})
