import { describe, expect, it } from 'vitest'
import { manaMaxima, manaPorSegundo } from '../regras/habilidades.js'
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

  it('separação: zona menor que um corpo e aliado sai da frente do Líder mais rápido do que ele anda', () => {
    const { separacao } = combateDeTeste
    expect(separacao.folga).toBeLessThan(personagem.tamanho / 2)
    const parteDoAliado = separacao.pesoDoLider / (separacao.pesoDoLider + 1)
    expect(separacao.forca * parteDoAliado).toBeGreaterThan(personagem.velocidade)
    expect(separacao.forca).toBeLessThanOrEqual(personagem.velocidade * 2) // afasta sem tranco
  })

  it('travamento: percebe em menos de 1 s e manda ao ponto livre em até 3 s', () => {
    const { travamento } = combateDeTeste
    expect(travamento.msDaJanela).toBeLessThanOrEqual(1000)
    expect(travamento.fracaoMinima).toBeLessThan(1)
    expect(travamento.nivelDoPontoLivre).toBeGreaterThanOrEqual(3) // antes, escorrega e dá a volta
    expect(travamento.msDaJanela * travamento.nivelDoPontoLivre).toBeLessThanOrEqual(3000)
    expect(travamento.msDoDeslize).toBeLessThanOrEqual(300) // desliza depressa, sem parecer teletransporte
  })

  it('a grade do caminho é fina o bastante para passar entre as pedras', () => {
    expect(combateDeTeste.caminho.celula).toBeLessThanOrEqual(personagem.tamanho / 2)
  })

  it('desmaio: a área limpa é maior que o bote do mob, e dá para ficar perto de quem caiu', () => {
    const { desmaio, separacao } = combateDeTeste
    expect(desmaio.raioDaAreaLimpa).toBeGreaterThan(mobVermelho.alcanceDoBote + mobVermelho.distanciaDoBote)
    expect(desmaio.raioDaAreaLimpa).toBeLessThan(mobVermelho.raioDeDeteccao)
    // A zona dos dois corpos acaba antes do raio da ajuda: quem ajuda consegue chegar perto
    expect(desmaio.raioDaAjuda).toBeGreaterThan(personagem.tamanho + separacao.folga + 4)
    expect(desmaio.msDeFragilidade).toBeLessThanOrEqual(30000)
    expect(desmaio.danoExtraFragil).toBeLessThanOrEqual(1)
  })

  it('mana: a habilidade de teste de cada classe cabe na mana inicial, e a mana enche entre 10 s e 90 s', () => {
    for (const classe of classes) {
      const { inteligencia, sabedoria } = classe.atributosIniciais
      const maxima = manaMaxima(inteligencia)
      expect(combateDeTeste.habilidades[classe.id].custoDeMana).toBeLessThanOrEqual(maxima)
      const segundosParaEncher = maxima / manaPorSegundo(sabedoria)
      expect(segundosParaEncher).toBeGreaterThanOrEqual(10)
      expect(segundosParaEncher).toBeLessThanOrEqual(90)
    }
  })

  it('Ressurreição: gasta muita mana e tem recarga longa, de cerca de 3 min (Conceito §7)', () => {
    const { sacerdote } = combateDeTeste.habilidades
    const manaDoSacerdote = manaMaxima(atributoInicial('sacerdote', 'inteligencia'))
    expect(sacerdote.custoDeMana).toBeGreaterThanOrEqual(manaDoSacerdote / 2)
    expect(sacerdote.recargaMs).toBeGreaterThanOrEqual(120000)
    expect(sacerdote.recargaMs).toBeLessThanOrEqual(240000)
    expect(sacerdote.raio).toBeLessThan(ataques.sacerdote.raio) // área pequena: precisa estar perto
  })

  it('habilidades valem mais que o ataque comum da classe', () => {
    const { habilidades } = combateDeTeste
    expect(habilidades.arqueiro.dano).toBeGreaterThanOrEqual(ataques.arqueiro.dano * 2)
    expect(habilidades.arqueiro.velocidade).toBeGreaterThan(ataques.arqueiro.velocidade)
    expect(habilidades.arqueiro.alcance).toBeGreaterThanOrEqual(1600) // cruza o mapa
    expect(habilidades.guerreiro.raio).toBeGreaterThan(ataques.guerreiro.alcance)
    expect(habilidades.mago.raio).toBeGreaterThan(ataques.mago.raioDaExplosao)
    expect(habilidades.tanque.reducaoDeDano).toBeLessThan(1) // provocando, ainda leva algum dano
    for (const habilidade of Object.values(habilidades)) expect(habilidade.recargaMs).toBeGreaterThan(ataques.guerreiro.recargaMs)
  })

  it('IA: a corrente é maior que a luta, e Arqueiro e Mago atacam de longe sem passar do alcance', () => {
    const { ia, raioDaFormacao } = combateDeTeste
    expect(ia.raioDaCorrente).toBeGreaterThan(ia.raioDeCombate)
    expect(ia.raioDeCombate).toBeGreaterThan(raioDaFormacao)
    expect(ia.raioDeVolta).toBeLessThan(ia.raioDaCorrente)
    expect(ia.raioDeVolta).toBeGreaterThan(raioDaFormacao)
    expect(ia.distanciaDoArqueiro.minima).toBeGreaterThan(mobVermelho.alcanceDoBote + mobVermelho.distanciaDoBote)
    expect(ia.distanciaDoArqueiro.maxima).toBeLessThan(ataques.arqueiro.alcance)
    expect(ia.distanciaDoMago.maxima).toBeLessThan(ataques.mago.alcance)
    expect(ia.raioDeAtracaoDoTanque).toBeLessThan(mobVermelho.raioDeDeteccao)
    expect(ia.limiteParaCurar).toBeLessThan(1)
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
