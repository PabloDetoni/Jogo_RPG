import { describe, expect, it } from 'vitest'
import { capacidadeDaMochila } from '../regras/mochila.js'
import { efeitoDoAtributo } from '../regras/atributos.js'
import { taxaNaDistancia } from '../regras/taxa.js'
import { xpParaSubir, xpTotalAteONivel } from '../regras/xp.js'
import {
  atributoMaximo,
  capacidadePorPontoDeForca,
  combateDeTeste,
  contratos,
  distanciaAteABorda,
  minimoDaGrandeVitoria,
  pesosDaPontuacao,
} from './balanceamento.js'
import { biomas } from './biomas.js'
import { atributos, classes } from './classes.js'
import { nivelInicial, nivelMaximo } from './regras.js'

// TESTES DE LIMITE: olham os valores de verdade de balanceamento.js e classes.js.
// Se um deles falhar depois de mudar um número, o número ficou fora do combinado.
// Para passar de um limite de propósito, mude o limite aqui e diga por quê.
const limites = {
  xpTotalAteONivelMaximo: 10_000_000,
  capacidadeDaMochila: 10_000,
  // Vontade do Pablo (05/10/2026): atributo 100 bem mais forte que 50, mas sem exagero
  quantasVezes100ValeMaisQue50: { maisQue: 2, noMaximo: 5 },
}

const atributoInicial = (classe, atributo) => classes.find((c) => c.id === classe).atributosIniciais[atributo]

describe('limites do XP', () => {
  const niveis = Array.from({ length: nivelMaximo - nivelInicial }, (_, i) => nivelInicial + i)

  it('XP para subir é inteiro e positivo em todo nível', () => {
    for (const nivel of niveis) {
      expect(Number.isInteger(xpParaSubir(nivel))).toBe(true)
      expect(xpParaSubir(nivel)).toBeGreaterThan(0)
    }
  })

  it('cada nível exige mais XP que o anterior (RF55)', () => {
    for (const nivel of niveis.slice(1)) expect(xpParaSubir(nivel)).toBeGreaterThan(xpParaSubir(nivel - 1))
  })

  it(`XP total até o nível ${nivelMaximo} não passa de ${limites.xpTotalAteONivelMaximo.toLocaleString('pt-BR')}`, () => {
    expect(xpTotalAteONivel(nivelMaximo)).toBeLessThanOrEqual(limites.xpTotalAteONivelMaximo)
  })
})

describe('limites dos atributos', () => {
  it('toda classe tem os 5 atributos, inteiros entre 1 e o máximo', () => {
    for (const classe of classes) {
      for (const { id } of atributos) {
        const valor = classe.atributosIniciais[id]
        expect(Number.isInteger(valor)).toBe(true)
        expect(valor).toBeGreaterThanOrEqual(1)
        expect(valor).toBeLessThanOrEqual(atributoMaximo)
      }
    }
  })

  it('Tanque, Guerreiro e Arqueiro começam com bem menos mana (Inteligência) que Mago e Sacerdote (Conceito §6)', () => {
    for (const fraco of ['tanque', 'guerreiro', 'arqueiro']) {
      for (const forte of ['mago', 'sacerdote']) {
        expect(atributoInicial(fraco, 'inteligencia')).toBeLessThan(atributoInicial(forte, 'inteligencia'))
      }
    }
  })

  it('Arqueiro começa com mais Agilidade que o Guerreiro e com a menor vida (Conceito §5)', () => {
    expect(atributoInicial('arqueiro', 'agilidade')).toBeGreaterThan(atributoInicial('guerreiro', 'agilidade'))
    for (const outra of ['guerreiro', 'mago', 'tanque', 'sacerdote']) {
      expect(atributoInicial('arqueiro', 'vitalidade')).toBeLessThanOrEqual(atributoInicial(outra, 'vitalidade'))
    }
  })

  it('Tanque começa com a maior Vitalidade (Conceito §5)', () => {
    for (const outra of ['guerreiro', 'mago', 'sacerdote', 'arqueiro']) {
      expect(atributoInicial('tanque', 'vitalidade')).toBeGreaterThan(atributoInicial(outra, 'vitalidade'))
    }
  })

  it('atributo 100 vale mais que o dobro do 50, mas sem exagero', () => {
    const vezes = efeitoDoAtributo(atributoMaximo) / efeitoDoAtributo(atributoMaximo / 2)
    expect(vezes).toBeGreaterThan(limites.quantasVezes100ValeMaisQue50.maisQue)
    expect(vezes).toBeLessThanOrEqual(limites.quantasVezes100ValeMaisQue50.noMaximo)
  })
})

describe('limites das taxas (Conceito §12.2)', () => {
  for (const bioma of biomas) {
    const borda = distanciaAteABorda[bioma.id]

    it(`${bioma.nome}: distância até a borda maior que zero`, () => {
      expect(borda).toBeGreaterThan(0)
    })

    it(`${bioma.nome}: 4 perdidos < fuga < todos desmaiam, em toda distância, com e sem Boss`, () => {
      for (let passo = 0; passo <= 20; passo++) {
        const distancia = (borda * passo) / 20
        for (const boss of [false, true]) {
          const quatroPerdidos = 4 * taxaNaDistancia('perdido', distancia, borda, boss)
          const fuga = taxaNaDistancia('fuga', distancia, borda, boss)
          const todos = taxaNaDistancia('todosDesmaiam', distancia, borda, boss)
          expect(quatroPerdidos).toBeLessThan(fuga)
          expect(fuga).toBeLessThan(todos)
          expect(todos).toBeLessThanOrEqual(55) // o pior caso possível
        }
      }
    })
  }
})

describe('limites da mochila e da pontuação', () => {
  it(`capacidade com o grupo inteiro no máximo de Força não passa de ${limites.capacidadeDaMochila.toLocaleString('pt-BR')}`, () => {
    const grupoNoMaximo = classes.map(() => atributoMaximo)
    expect(capacidadeDaMochila(grupoNoMaximo)).toBeLessThanOrEqual(limites.capacidadeDaMochila)
    expect(capacidadePorPontoDeForca).toBeGreaterThan(0)
  })

  it('pesos da pontuação e mínimo da Grande Vitória são números positivos', () => {
    for (const peso of Object.values(pesosDaPontuacao)) expect(peso).toBeGreaterThanOrEqual(0)
    expect(minimoDaGrandeVitoria).toBeGreaterThan(0)
  })
})

describe('limites do combate de teste (Fase 1, parte 5a)', () => {
  const { personagem, esquiva, ataques, mobVermelho, atirador, boneco } = combateDeTeste

  it('todo número é positivo e finito', () => {
    const conferir = (objeto, caminho) => {
      for (const [chave, valor] of Object.entries(objeto)) {
        if (typeof valor === 'object') conferir(valor, `${caminho}.${chave}`)
        else expect(Number.isFinite(valor) && valor > 0, `${caminho}.${chave} = ${valor}`).toBe(true)
      }
    }
    conferir(combateDeTeste, 'combateDeTeste')
  })

  it('vida de 1 a 1.000 em todo o grupo, até no máximo de Vitalidade', () => {
    const vidaMaxima = atributoMaximo * combateDeTeste.vidaPorPontoDeVitalidade
    expect(vidaMaxima).toBeLessThanOrEqual(1000)
    for (const classe of classes) {
      expect(classe.atributosIniciais.vitalidade * combateDeTeste.vidaPorPontoDeVitalidade).toBeGreaterThanOrEqual(1)
    }
  })

  it('esquiva com recarga curta (até 2 s) e mais rápida que andar', () => {
    expect(esquiva.recargaMs).toBeLessThanOrEqual(2000)
    expect((esquiva.distancia / esquiva.ms) * 1000).toBeGreaterThan(personagem.velocidade)
  })

  it('Mago e Sacerdote têm recarga longa; Guerreiro e Arqueiro, curta', () => {
    for (const curto of ['guerreiro', 'arqueiro']) {
      for (const longo of ['mago', 'sacerdote']) expect(ataques[curto].recargaMs).toBeLessThan(ataques[longo].recargaMs)
    }
  })

  it('a flecha é mais rápida que a bola mágica, e a bola cresce enquanto voa', () => {
    expect(ataques.arqueiro.velocidade).toBeGreaterThan(ataques.mago.velocidade)
    expect(ataques.mago.raioFinal).toBeGreaterThan(ataques.mago.raioInicial)
  })

  it('a aura cura menos do que um Sacerdote tem de vida a cada pulso', () => {
    const vidaDoSacerdote = classes.find((c) => c.id === 'sacerdote').atributosIniciais.vitalidade * combateDeTeste.vidaPorPontoDeVitalidade
    expect(ataques.sacerdote.curaPorPulso).toBeLessThan(vidaDoSacerdote)
    expect(ataques.sacerdote.msDeDuracao).toBeLessThan(ataques.sacerdote.recargaMs)
  })

  it('todo inimigo tem os números que a base dos inimigos usa (sem eles, a posição vira NaN)', () => {
    const exigidos = ['vida', 'tamanho', 'velocidade', 'raioDeDeteccao', 'raioDeDesistencia', 'raioDoPasseio', 'dano', 'empurrao']
    for (const inimigo of [mobVermelho, atirador]) {
      for (const chave of exigidos) expect(inimigo[chave], chave).toBeGreaterThan(0)
    }
  })

  it('os inimigos desistem mais longe do que detectam, e o Líder consegue fugir deles', () => {
    for (const inimigo of [mobVermelho, atirador]) expect(inimigo.raioDeDesistencia).toBeGreaterThan(inimigo.raioDeDeteccao)
    expect(mobVermelho.velocidade).toBeLessThan(personagem.velocidade)
    expect(atirador.distanciaMinima).toBeLessThan(atirador.distanciaMaxima)
    expect(atirador.distanciaMaxima).toBeLessThan(atirador.raioDeDeteccao)
  })

  it('o tiro do atirador é lento o bastante para esquivar, e o aviso do golpe dura pelo menos 0,2 s', () => {
    expect(atirador.velocidadeDoTiro).toBeLessThan(personagem.velocidade * 2)
    expect(mobVermelho.msDeAviso).toBeGreaterThanOrEqual(200)
    expect(atirador.msDeAviso).toBeGreaterThanOrEqual(200)
  })

  it('o boneco aguenta vários golpes', () => {
    expect(boneco.vida).toBeGreaterThan(ataques.mago.dano * 3)
  })
})

describe('limites dos contratos (RF29)', () => {
  it('preços positivos e o temporário mais barato que o permanente', () => {
    expect(contratos.precoDoTemporario).toBeGreaterThan(0)
    expect(contratos.precoDoPermanente).toBeGreaterThan(contratos.precoDoTemporario)
  })

  it('o temporário dura pelo menos uma partida e tem um nível que existe', () => {
    expect(Number.isInteger(contratos.partidasDoTemporario) && contratos.partidasDoTemporario >= 1).toBe(true)
    expect(contratos.nivelDoTemporario).toBeGreaterThanOrEqual(nivelInicial)
    expect(contratos.nivelDoTemporario).toBeLessThanOrEqual(nivelMaximo)
  })
})
