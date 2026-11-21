import { describe, expect, it } from 'vitest'
import { armasDosBonecos, pecasDoBoneco, poseDosBonecos, receitasDosBonecos } from '../dados/bonecos.js'
import { classes } from '../dados/classes.js'
import { anguloNoCorpo, armaAtras, balancoDoBoneco, ladoDoCorpo, poseDoAtaque, poseDoBraco, puxadaDaCorda } from './bonecos.js'

const graus = (g) => (g * Math.PI) / 180

describe('receitas dos bonecos (RNF15)', () => {
  it('as 5 classes têm receita, e cada arma existe', () => {
    for (const classe of classes) {
      const receita = receitasDosBonecos[classe.id]
      expect(receita, classe.id).toBeDefined()
      expect(armasDosBonecos[receita.arma], receita.arma).toBeDefined()
    }
  })

  it('cabeçudinho: a cabeça é maior que o corpo, e o desenho cabe perto do tamanho 40 (a hitbox não muda)', () => {
    const { cabeca, corpo, perna } = pecasDoBoneco
    expect(cabeca.largura).toBeGreaterThan(corpo.largura)
    expect(cabeca.y - cabeca.altura / 2).toBeGreaterThanOrEqual(-22)
    expect(perna.y + perna.altura).toBeLessThanOrEqual(22)
  })
})

describe('o lado do corpo e a "viradinha"', () => {
  it('olha para o lado da mira', () => {
    expect(ladoDoCorpo(0)).toBe('direita')
    expect(ladoDoCorpo(Math.PI)).toBe('esquerda')
    expect(ladoDoCorpo(graus(150))).toBe('esquerda')
  })

  it('perto da vertical não vira (sem pisca-pisca)', () => {
    expect(ladoDoCorpo(graus(-90), 'esquerda')).toBe('esquerda')
    expect(ladoDoCorpo(graus(-88), 'esquerda')).toBe('esquerda')
    expect(ladoDoCorpo(graus(95), 'direita')).toBe('direita')
    // passando bem da vertical, vira
    expect(ladoDoCorpo(graus(-60), 'esquerda')).toBe('direita')
  })
})

describe('arma atrás ou na frente do corpo', () => {
  it('mirando para cima vai para trás; para baixo, para a frente', () => {
    expect(armaAtras(graus(-90))).toBe(true)
    expect(armaAtras(graus(-45))).toBe(true)
    expect(armaAtras(graus(90))).toBe(false)
    expect(armaAtras(graus(45))).toBe(false)
  })

  it('perto da horizontal fica onde estava', () => {
    expect(armaAtras(graus(-5), true)).toBe(true)
    expect(armaAtras(graus(5), false)).toBe(false)
    expect(armaAtras(0, true)).toBe(true)
  })
})

describe('o braço que segue a mira (Tanque e Arqueiro)', () => {
  it('no lado esquerdo o ângulo é espelhado: mirar para a esquerda é "para a frente" do corpo', () => {
    expect(anguloNoCorpo(Math.PI, 'esquerda')).toBeCloseTo(0)
    expect(anguloNoCorpo(graus(135), 'esquerda')).toBeCloseTo(graus(45))
    expect(anguloNoCorpo(graus(-135), 'esquerda')).toBeCloseTo(graus(-45))
  })

  it('as 8 direções: lado, frente ou trás e o braço apontando para a mira', () => {
    const casos = [
      [0, 'direita', 0],
      [45, 'direita', 45],
      [90, 'direita', 90],
      [135, 'esquerda', 45],
      [180, 'esquerda', 0],
      [-135, 'esquerda', -45],
      [-90, 'direita', -90],
      [-45, 'direita', -45],
    ]
    for (const [mira, lado, braco] of casos) {
      const pose = poseDoBraco(graus(mira), { lado: 'direita', atras: false })
      expect(pose.lado, `mira ${mira}`).toBe(lado)
      expect(pose.anguloDoBraco, `mira ${mira}`).toBeCloseTo(graus(braco))
    }
    expect(poseDoBraco(graus(-90)).atras).toBe(true)
    expect(poseDoBraco(graus(90)).atras).toBe(false)
  })

  it('o braço nunca passa do limite (não atravessa o corpo)', () => {
    for (let g = -180; g <= 180; g += 5) {
      const { anguloDoBraco } = poseDoBraco(graus(g), { lado: 'direita' })
      expect(Math.abs(anguloDoBraco)).toBeLessThanOrEqual(poseDosBonecos.limiteDoBraco + 1e-9)
    }
  })
})

describe('balanço, golpe e corda', () => {
  it('parado: só respira (as pernas não mexem); andando: as pernas alternam', () => {
    const parado = balancoDoBoneco(1, false)
    expect(parado.pernaDaFrente).toBe(0)
    expect(Math.abs(parado.corpoY)).toBeLessThanOrEqual(poseDosBonecos.parado.corpo)
    const andando = balancoDoBoneco(Math.PI / 2, true)
    expect(andando.pernaDaFrente).toBeCloseTo(poseDosBonecos.andando.perna)
    expect(andando.pernaDeTras).toBeCloseTo(-poseDosBonecos.andando.perna)
    expect(andando.bracoLivre).toBeCloseTo(-poseDosBonecos.andando.braco)
  })

  it('a espada varre de trás para a frente e volta ao descanso; fora do golpe, nada', () => {
    const { giroInicial, giroFinal, pico } = poseDosBonecos.ataques.espada
    expect(poseDoAtaque('espada', 0).giro).toBeCloseTo(giroInicial)
    expect(poseDoAtaque('espada', pico).giro).toBeCloseTo(giroFinal)
    expect(Math.abs(poseDoAtaque('espada', 0.99).giro)).toBeLessThan(0.05)
    expect(poseDoAtaque('espada', 1)).toEqual({ giro: 0, avanco: 0 })
    expect(poseDoAtaque('espada', -0.1)).toEqual({ giro: 0, avanco: 0 })
  })

  it('cajado e cetro sobem; o escudo empurra para a frente', () => {
    expect(poseDoAtaque('cajado', poseDosBonecos.ataques.cajado.pico).giro).toBeLessThan(0)
    expect(poseDoAtaque('cetro', poseDosBonecos.ataques.cetro.pico).giro).toBeLessThan(0)
    expect(poseDoAtaque('escudo', poseDosBonecos.ataques.escudo.pico).avanco).toBeCloseTo(poseDosBonecos.ataques.escudo.avanco)
  })

  it('a corda do arco estica com a carga, até o máximo', () => {
    expect(puxadaDaCorda(0)).toBe(0)
    expect(puxadaDaCorda(0.5)).toBeCloseTo(poseDosBonecos.arco.puxadaMaxima / 2)
    expect(puxadaDaCorda(3)).toBe(poseDosBonecos.arco.puxadaMaxima)
  })
})
