import { describe, expect, it } from 'vitest'
import { arvoreDaClasse, raizDaClasse } from '../dados/arvores.js'
import { evolucaoDasHabilidades } from '../dados/balanceamento.js'
import { classes } from '../dados/classes.js'
import { novoPersonagem, progressoInicial } from '../estado/progresso.js'
import {
  bonusDasPassivas,
  estadoDaHabilidade,
  evoluirHabilidade,
  habilidadesNasTeclas,
  numerosNoNivel,
  porNaTecla,
  requisitoDe,
  tirarDaTecla,
  trocarNaTecla,
} from './habilidadesDaArvore.js'

const efeitosQueExistem = ['giro', 'tiroPerfurante', 'meteoro', 'provocacao', 'ressurreicao', 'fortalecer', 'proteger', 'curar']
const efeitosDePassiva = ['vida', 'mana', 'critico', 'defesa', 'cura']

describe('as árvores do beta (TASK-077, provisórias até a TASK-010)', () => {
  it('cada classe: 10 habilidades com a mesma forma (raiz e três ramos de três), 4 no beta', () => {
    for (const classe of classes) {
      const arvore = arvoreDaClasse(classe.id)
      expect(arvore, classe.id).toHaveLength(10)
      expect(arvore.filter((h) => h.ramo === 'raiz' && h.camada === 1)).toHaveLength(1)
      for (const ramo of ['a', 'b', 'c']) expect(arvore.filter((h) => h.ramo === ramo).map((h) => h.camada).sort()).toEqual([2, 3, 4])
      const noBeta = arvore.filter((h) => h.noBeta)
      expect(noBeta.map((h) => h.camada).sort()).toEqual([1, 2, 2, 2])
      expect(new Set(arvore.map((h) => h.id)).size).toBe(10)
    }
  })

  it('as do beta têm efeito que existe e números; as ativas têm custo e recarga', () => {
    for (const classe of classes) {
      for (const h of arvoreDaClasse(classe.id).filter((uma) => uma.noBeta)) {
        if (h.tipo === 'ativa') {
          expect(efeitosQueExistem, `${classe.id}: ${h.id}`).toContain(h.efeito)
          expect(h.numeros.custoDeMana > 0 && h.numeros.recargaMs > 0, h.id).toBe(true)
        } else {
          expect(efeitosDePassiva, `${classe.id}: ${h.id}`).toContain(h.efeito)
          expect(h.porNivel > 0, h.id).toBe(true)
        }
      }
    }
  })

  it('a raiz de cada classe é a antiga habilidade de teste, e no Sacerdote é a Ressurreição (Conceito §7)', () => {
    expect(classes.map((classe) => raizDaClasse(classe.id).id)).toEqual(['guerreiro', 'mago', 'tanque', 'sacerdote', 'arqueiro'].map((id) => raizDaClasse(id).id))
    expect(raizDaClasse('sacerdote').id).toBe('ressurreicao')
    expect(raizDaClasse('mago').id).toBe('meteoro')
  })
})

describe('números de cada nível', () => {
  it('o dano e a cura sobem e a recarga cai a cada nível; no nível 1, iguais aos dados', () => {
    const base = { custoDeMana: 20, recargaMs: 10000, dano: 100, cura: 50, raio: 80 }
    expect(numerosNoNivel(base, 1)).toEqual(base)
    const n5 = numerosNoNivel(base, 5)
    expect(n5.dano).toBeCloseTo(100 * (1 + 4 * evolucaoDasHabilidades.porNivel.dano))
    expect(n5.cura).toBeCloseTo(50 * (1 + 4 * evolucaoDasHabilidades.porNivel.cura))
    expect(n5.recargaMs).toBe(Math.round(10000 * (1 - 4 * evolucaoDasHabilidades.recargaPorNivel)))
    expect(n5.raio).toBe(80)
    expect(n5.custoDeMana).toBe(20)
    expect(numerosNoNivel(base, 9)).toEqual(n5) // nunca passa do nível 5
  })
})

const com = (habilidades, pontos = 10, ativas = Object.keys(habilidades).slice(0, 1)) => ({
  ...progressoInicial(),
  personagens: [{ ...novoPersonagem('guerreiro'), habilidades, ativas, pontosDeHabilidade: pontos }],
})
const guerreiro = (progresso) => progresso.personagens[0]

describe('aprender e evoluir (TASK-077)', () => {
  it('a raiz já vem no nível 1 (gratuita); evoluir gasta 1 ponto por nível', () => {
    const r = evoluirHabilidade(com({ giro: 1 }, 3), 'guerreiro', 'giro')
    expect(guerreiro(r.progresso).habilidades.giro).toBe(2)
    expect(guerreiro(r.progresso).pontosDeHabilidade).toBe(2)
    expect(r.mensagem).toBe('Giro subiu para o nível 2.')
  })

  it('critério do card: com a anterior no nível 4, a seguinte do ramo continua bloqueada; no 5, libera', () => {
    const arvore = arvoreDaClasse('guerreiro')
    const golpe = arvore.find((h) => h.id === 'golpePesado')
    expect(requisitoDe(golpe, arvore).id).toBe('giro')
    expect(estadoDaHabilidade(guerreiro(com({ giro: 4 })), golpe)).toBe('bloqueada')
    expect(evoluirHabilidade(com({ giro: 4 }), 'guerreiro', 'golpePesado').motivo).toBe('Bloqueada: Giro precisa chegar ao nível 5 antes.')
    expect(estadoDaHabilidade(guerreiro(com({ giro: 5 })), golpe)).toBe('liberada')
    const aprendeu = evoluirHabilidade(com({ giro: 5 }), 'guerreiro', 'golpePesado')
    expect(guerreiro(aprendeu.progresso).habilidades.golpePesado).toBe(1)
    expect(aprendeu.mensagem).toBe('Guerreiro aprendeu Golpe pesado.')
  })

  it('os ramos não são exclusivos: com a raiz no 5, os três ramos liberam', () => {
    const personagem = guerreiro(com({ giro: 5, golpePesado: 2 }))
    const arvore = arvoreDaClasse('guerreiro')
    expect(['golpePesado', 'furia', 'peleGrossa'].map((id) => estadoDaHabilidade(personagem, arvore.find((h) => h.id === id)))).toEqual(['aprendida', 'liberada', 'liberada'])
  })

  it('sem pontos, no nível 5 ou fora do beta, não dá', () => {
    expect(evoluirHabilidade(com({ giro: 1 }, 0), 'guerreiro', 'giro').motivo).toContain('Pontos de habilidade insuficientes')
    expect(evoluirHabilidade(com({ giro: 5 }), 'guerreiro', 'giro').motivo).toBe('Giro já está no nível 5.')
    expect(evoluirHabilidade(com({ giro: 5, golpePesado: 5 }), 'guerreiro', 'terremoto').motivo).toBe('Terremoto fica para depois do beta.')
    expect(evoluirHabilidade(com({ giro: 5 }), 'guerreiro', 'meteoro').ok).toBe(false) // de outra classe
  })
})

describe('as 3 teclas (TASK-077)', () => {
  it('põe uma ativa aprendida na tecla livre; passiva e não aprendida não vão', () => {
    const p = com({ giro: 5, golpePesado: 1, peleGrossa: 2 }, 0, ['giro'])
    const r = porNaTecla(p, 'guerreiro', 'golpePesado')
    expect(guerreiro(r.progresso).ativas).toEqual(['giro', 'golpePesado'])
    expect(r.mensagem).toBe('Golpe pesado na tecla 2.')
    expect(porNaTecla(p, 'guerreiro', 'peleGrossa').motivo).toContain('Passiva')
    expect(porNaTecla(p, 'guerreiro', 'furia').motivo).toBe('Aprenda Fúria antes.')
    expect(porNaTecla(p, 'guerreiro', 'giro').ok).toBe(false)
  })

  it('critério do card: com 3 ativas, uma quarta pede para trocar; trocar põe a nova no lugar da que sai', () => {
    // árvore de teste com 4 ativas (no beta de verdade, cada classe tem 3)
    const arvore = [
      { id: 'r', nome: 'R', tipo: 'ativa', ramo: 'raiz', camada: 1, noBeta: true, numeros: {} },
      { id: 'a', nome: 'A', tipo: 'ativa', ramo: 'a', camada: 2, noBeta: true, numeros: {} },
      { id: 'b', nome: 'B', tipo: 'ativa', ramo: 'b', camada: 2, noBeta: true, numeros: {} },
      { id: 'c', nome: 'C', tipo: 'ativa', ramo: 'c', camada: 2, noBeta: true, numeros: {} },
    ]
    const p = com({ r: 5, a: 1, b: 1, c: 1 }, 0, ['r', 'a', 'b'])
    expect(porNaTecla(p, 'guerreiro', 'c', arvore)).toEqual({ ok: false, precisaTrocar: true, motivo: 'As 3 teclas estão ocupadas: escolha qual trocar.' })
    const r = trocarNaTecla(p, 'guerreiro', 'a', 'c', arvore)
    expect(guerreiro(r.progresso).ativas).toEqual(['r', 'c', 'b'])
    expect(r.mensagem).toBe('C na tecla 2.')
  })

  it('tirar da tecla libera o lugar', () => {
    const r = tirarDaTecla(com({ giro: 5, golpePesado: 1 }, 0, ['giro', 'golpePesado']), 'guerreiro', 'giro')
    expect(guerreiro(r.progresso).ativas).toEqual(['golpePesado'])
    expect(tirarDaTecla(r.progresso, 'guerreiro', 'giro').ok).toBe(false)
  })
})

describe('o que vai para a partida', () => {
  it('as teclas levam os números do nível de cada ativa; a raiz é marcada (a IA dos aliados usa a raiz)', () => {
    const teclas = habilidadesNasTeclas({ classe: 'guerreiro', habilidades: { giro: 3, golpePesado: 1 }, ativas: ['golpePesado', 'giro'] })
    expect(teclas[0]).toMatchObject({ id: 'golpePesado', nivel: 1, raiz: false, efeito: 'giro', dano: 70 })
    expect(teclas[1]).toMatchObject({ id: 'giro', nivel: 3, raiz: true })
    expect(teclas[1].dano).toBeCloseTo(numerosNoNivel(arvoreDaClasse('guerreiro')[0].numeros, 3).dano)
    expect(teclas[2]).toBeNull()
  })

  it('as passivas aprendidas somam (sempre ligadas); as de fora do beta não contam', () => {
    expect(bonusDasPassivas({ classe: 'guerreiro', habilidades: { giro: 5, peleGrossa: 3 } })).toEqual({ vida: 0.12, mana: 0, critico: 0, defesa: 0, cura: 0 })
    expect(bonusDasPassivas({ classe: 'tanque', habilidades: { peleDeFerro: 2, vigor: 5 } }).defesa).toBe(4)
    expect(bonusDasPassivas({ classe: 'mago' }).mana).toBe(0)
  })
})
