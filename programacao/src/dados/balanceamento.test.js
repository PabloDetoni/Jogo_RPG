import { describe, expect, it } from 'vitest'
import { manaMaxima, manaPorSegundo } from '../regras/habilidades.js'
import { capacidadeDaMochila } from '../regras/mochila.js'
import { efeitoDoAtributo } from '../regras/atributos.js'
import { chanceDeCritico } from '../regras/combate.js'
import { taxaNaDistancia } from '../regras/taxa.js'
import { xpParaSubir, xpTotalAteONivel } from '../regras/xp.js'
import {
  atributoMaximo,
  capacidadePorPontoDeForca,
  combateDeTeste,
  contratos,
  mercado,
  critico,
  distanciaAteABorda,
  minimoDaGrandeVitoria,
  pesosDaPontuacao,
} from './balanceamento.js'
import { boneco as lugarDoBoneco, inicio, inimigosIniciais, tamanhoDaArena } from './arenaDeTeste.js'
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
        if (typeof valor === 'string') continue // nomes (ex.: dos níveis da IA)
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

  it('níveis da IA: cobrem do nível 1 ao 100, e o erro só cai (nunca chega a 0)', () => {
    const { niveisDaIA } = combateDeTeste
    expect(niveisDaIA.map((faixa) => faixa.id)).toEqual(['basica', 'media', 'avancada'])
    expect(niveisDaIA.at(-1).ateONivel).toBe(nivelMaximo)
    niveisDaIA.forEach((faixa, i) => {
      expect(faixa.erroNoComeco).toBeLessThanOrEqual(0.5)
      expect(faixa.erroNoFim).toBeGreaterThan(0)
      expect(faixa.erroNoFim).toBeLessThanOrEqual(faixa.erroNoComeco)
      if (i > 0) {
        expect(faixa.ateONivel).toBeGreaterThan(niveisDaIA[i - 1].ateONivel)
        expect(faixa.erroNoComeco).toBeLessThanOrEqual(niveisDaIA[i - 1].erroNoFim)
      }
    })
  })

  it('zona confortável: o aliado parado não encosta no Líder e a vaga do X cabe nela', () => {
    const { zonaConfortavel, raioDaFormacao: raio } = { ...combateDeTeste.ia, raioDaFormacao: combateDeTeste.raioDaFormacao }
    expect(zonaConfortavel.minima).toBeGreaterThan(personagem.tamanho)
    expect(raio).toBeGreaterThanOrEqual(zonaConfortavel.minima)
    expect(raio + zonaConfortavel.toleranciaDaVaga).toBeLessThanOrEqual(zonaConfortavel.maxima)
    expect(zonaConfortavel.maxima).toBeLessThan(combateDeTeste.ia.raioDaCorrente)
  })

  it('tremor: percebe rápido e fica quieto pouco tempo', () => {
    const { tremor } = combateDeTeste.ia
    expect(tremor.msDaJanela).toBeLessThanOrEqual(1000)
    expect(tremor.msQuieto).toBeLessThanOrEqual(3000)
    expect(tremor.razao).toBeGreaterThan(1)
  })

  it('foco e recuo: em foco a avançada erra menos que o normal dela e recua mais do aviso', () => {
    const { foco, chanceDeRecuarDoAviso } = combateDeTeste.ia
    expect(foco.erro).toBeLessThan(combateDeTeste.niveisDaIA.at(-1).erroNoFim)
    expect(foco.chanceDeRecuar).toBeGreaterThanOrEqual(chanceDeRecuarDoAviso)
    expect(foco.chanceDeRecuar).toBeLessThanOrEqual(1)
  })

  it('IA básica: Arqueiro e Mago ficam mais perto da luta que na média, mas não colados no mob', () => {
    const { ia } = combateDeTeste
    expect(ia.distanciaCurtaDoArqueiro.maxima).toBeLessThan(ia.distanciaDoArqueiro.minima)
    expect(ia.distanciaCurtaDoMago.maxima).toBeLessThan(ia.distanciaDoMago.minima)
    expect(ia.distanciaCurtaDoArqueiro.minima).toBeGreaterThan(mobVermelho.alcanceDoBote)
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
    // Cura sem pausa (08/10): a aura nova pode sair assim que a anterior acaba, e duas não se somam
    expect(ataques.sacerdote.recargaMs).toBeLessThanOrEqual(ataques.sacerdote.msDeDuracao)
    expect(ataques.sacerdote.recargaMs).toBeGreaterThanOrEqual(ataques.sacerdote.msDeDuracao * 0.9)
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

describe('limites da parte 5d (Sacerdote e desvio entre níveis)', () => {
  const { ia, ataques, personagem } = combateDeTeste

  it('Sacerdote: o empate é pequeno e a avançada fica dentro da aura, atrás do ferido', () => {
    expect(ia.sacerdote.empate).toBeGreaterThan(0)
    expect(ia.sacerdote.empate).toBeLessThanOrEqual(0.1)
    expect(ia.sacerdote.urgenciaPorAtacante).toBeLessThanOrEqual(0.25)
    // a aura alcança o ferido de onde a avançada fica, e ela não encosta nele
    expect(ataques.sacerdote.raio * ia.sacerdote.distanciaParaCurar).toBeLessThan(ataques.sacerdote.raio * 0.8)
    expect(ataques.sacerdote.raio * ia.sacerdote.distanciaParaCurar).toBeGreaterThan(personagem.tamanho)
  })

  it('desvio: a avançada vê de mais longe que a média, e as duas passam sem encostar', () => {
    expect(ia.desvio.avancada.alcance).toBeGreaterThan(ia.desvio.media.alcance)
    expect(ia.desvio.media.alcance).toBeGreaterThanOrEqual(personagem.tamanho)
    expect(ia.desvio.avancada.folga).toBeGreaterThan(0)
    expect(ia.desvio).not.toHaveProperty('basica')
  })

  it('o Tanque "na frente" é perto do lugar dele, mas não exige estar colado', () => {
    expect(ia.formacaoDeCombate.tanqueNoPosto).toBeGreaterThan(personagem.tamanho)
    expect(ia.formacaoDeCombate.tanqueNoPosto).toBeLessThan(ia.raioDeCombate)
  })
})

describe('limites da parte 5c (crítico, recompensas, borda da arena, mensagens e teste do foco)', () => {
  it('crítico: chance entre 1% e 60% com qualquer Agilidade, e o golpe crítico entre 1,2× e 2,5×', () => {
    expect(chanceDeCritico(0, critico)).toBeGreaterThanOrEqual(0.01)
    expect(chanceDeCritico(atributoMaximo, critico)).toBeLessThanOrEqual(0.6)
    expect(critico.multiplicador).toBeGreaterThanOrEqual(1.2)
    expect(critico.multiplicador).toBeLessThanOrEqual(2.5)
  })

  it('o Arqueiro tem o crítico mais alto do começo (Conceito §5: "dano e crítico altos")', () => {
    const chance = (classe) => chanceDeCritico(atributoInicial(classe, 'agilidade'), critico)
    for (const outra of ['guerreiro', 'mago', 'tanque', 'sacerdote']) expect(chance('arqueiro')).toBeGreaterThan(chance(outra))
  })

  it('XP limitado por monstro: nenhum dá um nível inteiro de uma vez, nem no nível 1', () => {
    for (const mob of [combateDeTeste.mobVermelho, combateDeTeste.atirador]) {
      expect(mob.xp).toBeGreaterThan(0)
      expect(mob.xp).toBeLessThan(xpParaSubir(nivelInicial))
      expect(mob.ouro).toBeGreaterThan(0)
      expect(mob.ouro).toBeLessThanOrEqual(100)
    }
  })

  it('borda da arena: mais longe que os mobs do começo e não maior que a diagonal da arena', () => {
    const { distanciaAteABorda: borda } = combateDeTeste
    const ate = (ponto) => Math.hypot(ponto.x - inicio.x, ponto.y - inicio.y)
    for (const mob of inimigosIniciais) expect(ate(mob)).toBeLessThan(borda)
    expect(ate(lugarDoBoneco)).toBeLessThan(borda)
    expect(borda).toBeLessThanOrEqual(Math.hypot(tamanhoDaArena.largura, tamanhoDaArena.altura))
  })

  it('mensagens do HUD: ficam entre 1 e 6 s, no máximo 6 juntas', () => {
    const { hud } = combateDeTeste
    expect(hud.msDaMensagem).toBeGreaterThanOrEqual(1000)
    expect(hud.msDaMensagem).toBeLessThanOrEqual(6000)
    expect(hud.mensagensNoMaximo).toBeLessThanOrEqual(6)
  })

  it('teste do foco: a vida do Líder fica abaixo do limite do foco, por mais tempo que um foco', () => {
    const { foco } = combateDeTeste.testes
    expect(foco.vidaDoLider).toBeLessThan(combateDeTeste.ia.foco.vidaDoLider)
    expect(foco.msPreso).toBeGreaterThanOrEqual(combateDeTeste.ia.foco.msDeDuracao)
    expect(foco.distancia).toBeLessThan(combateDeTeste.mobVermelho.raioDeDeteccao) // os mobs já vêm atrás do grupo
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

describe('limites do Mercado e da Forja (Fase 4)', () => {
  it('quem vende recebe uma parte do preço (nunca nada, nunca o preço todo)', () => {
    expect(mercado.fracaoDaVenda).toBeGreaterThanOrEqual(0.2)
    expect(mercado.fracaoDaVenda).toBeLessThanOrEqual(0.8)
  })

  it('as ofertas rotativas mudam de vez em quando, com poucas à venda de cada vez', () => {
    expect(Number.isInteger(mercado.partidasPorRotacao) && mercado.partidasPorRotacao >= 1 && mercado.partidasPorRotacao <= 20).toBe(true)
    expect(Number.isInteger(mercado.rotativasAVenda) && mercado.rotativasAVenda >= 1 && mercado.rotativasAVenda <= 8).toBe(true)
  })
})
