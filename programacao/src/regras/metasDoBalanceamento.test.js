import { describe, expect, it } from 'vitest'
import { mundo } from '../dados/balanceamento.js'
import { floresta } from '../dados/mundo/floresta.js'
import { membroComAtributos } from './grupoDaPartida.js'
import { fichaDoMob } from './mobs.js'
import { atributosNoNivel, bandoDaRegiao, mobsDaRegiao, mobsDoAcampamento, simularLuta } from './simulador.js'
import { xpParaSubir } from './xp.js'

// METAS DO BALANCEAMENTO (Parte 8 de 11/2026), nas palavras do Pablo: "um iniciante consegue a região fácil com muito
// esforço e ainda pode morrer; nunca dá conta da média, da difícil ou do chefe, a não ser desviando com perfeição. A
// fácil ensina a enfrentar um bicho por vez; a média ensina tática. Sem bloqueio artificial: a barreira são os
// atributos." O jogador começa SOZINHO (só a classe inicial): as metas valem primeiro para um personagem e depois
// para o grupo crescendo. Faixas (provisórias, para conversar): Fácil 1 a 6, Média 7 a 15, Difícil 16 a 28, Ogro
// por volta de 30.
// O simulador é um modelo simples (todos ao alcance de todos, sem desviar e sem recuar): as metas de "um personagem"
// usam o Guerreiro e o Tanque, que lutam parados; o Mago, o Arqueiro e o Sacerdote do começo dependem de recuar e
// atirar (os mobs da Fácil são mais lentos que eles), o que o modelo não faz.

const personagem = (classe, nivel) => membroComAtributos(classe, atributosNoNivel(classe, nivel), nivel)
const grupo = (classes, nivel) => classes.map((classe) => personagem(classe, nivel))
const mobs = (tipo, regiao, n) => Array.from({ length: n }, () => mobsDaRegiao(regiao).find((mob) => mob.tipo === tipo))
const quatro = ['guerreiro', 'mago', 'sacerdote', 'tanque']
const cinco = [...quatro, 'arqueiro']

describe('metas da região Fácil (níveis 1 a 6): um bicho por vez', () => {
  it('sozinho, nível 1: vence UM lobo com dificuldade (perde pelo menos 40% da vida)', () => {
    for (const classe of ['guerreiro', 'tanque']) {
      const eu = personagem(classe, 1)
      const luta = simularLuta([eu], mobs('lobo', 'facil', 1))
      expect(luta.venceu, classe).toBe(true)
      expect(luta.membros[0].vidaNoFim / eu.vidaMaxima, classe).toBeLessThanOrEqual(0.6)
    }
  })

  it('sozinho, nível 1: dois lobos ao mesmo tempo o derrubam', () => {
    for (const classe of ['guerreiro', 'tanque']) expect(simularLuta([personagem(classe, 1)], mobs('lobo', 'facil', 2)).venceu, classe).toBe(false)
  })

  it('sozinho, nível 1: o Lobo Alfa ganha; no fim da faixa (nível 6), o Guerreiro vence o Alfa', () => {
    expect(simularLuta([personagem('guerreiro', 1)], mobs('loboAlfa', 'facil', 1)).venceu).toBe(false)
    expect(simularLuta([personagem('guerreiro', 6)], mobs('loboAlfa', 'facil', 1)).venceu).toBe(true)
  })

  it('dá para fugir de um lobo comum: os mobs da Fácil são mais lentos que o Líder do começo', () => {
    const maisLentoDoComeco = Math.min(...['guerreiro', 'mago', 'tanque', 'sacerdote', 'arqueiro'].map((classe) => personagem(classe, 1).velocidade))
    for (const tipo of Object.keys(floresta.populacao.facil)) expect(fichaDoMob(tipo, 'facil').velocidade, tipo).toBeLessThan(maisLentoDoComeco)
  })
})

describe('metas da região Média (níveis 7 a 15): tática', () => {
  it('sozinho, nível 1: perde a luta padrão da Média (3 mobs), e rápido', () => {
    for (const classe of ['guerreiro', 'tanque']) {
      const luta = simularLuta([personagem(classe, 1)], bandoDaRegiao('media', 3))
      expect(luta.venceu, classe).toBe(false)
      expect(luta.segundos, classe).toBeLessThan(20)
    }
  })

  it('o acampamento, no começo da faixa (grupo de 4, nível 7): cai derrubando o xamã primeiro; sem isso, perde ou demora muito e alguém cai', () => {
    const g = grupo(quatro, 7)
    const com = simularLuta(g, mobsDoAcampamento('acampamentoDoRiacho'), { prioridade: true })
    const sem = simularLuta(g, mobsDoAcampamento('acampamentoDoRiacho'), { prioridade: false })
    expect(com.venceu).toBe(true)
    expect(!sem.venceu || (sem.segundos > com.segundos * 1.5 && sem.membros.some((m) => m.caiuEm !== null))).toBe(true)
  })

  it('no meio da faixa (nível 11), o acampamento cai dos dois jeitos, mas o xamã primeiro é mais rápido', () => {
    const g = grupo(quatro, 11)
    const com = simularLuta(g, mobsDoAcampamento('acampamentoDoRiacho'), { prioridade: true })
    const sem = simularLuta(g, mobsDoAcampamento('acampamentoDoRiacho'), { prioridade: false })
    expect(com.venceu && sem.venceu).toBe(true)
    expect(com.segundos).toBeLessThan(sem.segundos)
  })

  it('o acampamento é demais para um grupo no começo da faixa da Fácil (nível 3)', () => {
    expect(simularLuta(grupo(quatro, 3), mobsDoAcampamento('acampamentoDoRiacho'), { prioridade: true }).venceu).toBe(false)
  })

  it('fugir não resolve sempre: os mobs da Média e da Difícil são mais rápidos que o Líder do começo (mais de 185 px/s)', () => {
    const maisRapidoDoComeco = Math.max(...['guerreiro', 'mago', 'tanque', 'sacerdote', 'arqueiro'].map((classe) => personagem(classe, 1).velocidade))
    for (const regiao of ['media', 'dificil']) {
      for (const mob of mobsDaRegiao(regiao)) expect(mob.velocidade, `${regiao} ${mob.tipo}`).toBeGreaterThan(Math.max(185, maisRapidoDoComeco))
    }
  })
})

describe('metas da região Difícil (níveis 16 a 28) e do Ogro (por volta de 30)', () => {
  it('a luta padrão da Difícil: o grupo de 5 no começo da faixa (16) vence; o do meio da Média (11), não', () => {
    expect(simularLuta(grupo(cinco, 16), bandoDaRegiao('dificil', 3)).venceu).toBe(true)
    expect(simularLuta(grupo(cinco, 11), bandoDaRegiao('dificil', 3)).venceu).toBe(false)
  })

  // Parte 11: o forte acorda por partes (Portão, Pátio, Torre); cada uma é uma luta (com os arqueiros das torres do
  // lado dela). O Portão é a entrada (cai antes); o Pátio e a Torre são para o fim da faixa
  it('o forte é para o fim da faixa: cada parte cai para o grupo de 5 no nível 28; no 16, nenhuma; no 22, o Pátio e a Torre ainda não', () => {
    for (const parte of ['portao', 'patio', 'torre']) {
      const leva = mobsDoAcampamento('forteGoblin', parte)
      expect(simularLuta(grupo(cinco, 28), leva, { prioridade: true }).venceu, parte).toBe(true)
      expect(simularLuta(grupo(cinco, 16), leva, { prioridade: true }).venceu, parte).toBe(false)
    }
    for (const parte of ['patio', 'torre']) expect(simularLuta(grupo(cinco, 22), mobsDoAcampamento('forteGoblin', parte), { prioridade: true }).venceu, parte).toBe(false)
  })

  it('nível 1 contra o Ogro perde rápido', () => {
    const luta = simularLuta([personagem('guerreiro', 1)], mobsDaRegiao('boss'))
    expect(luta.venceu).toBe(false)
    expect(luta.segundos).toBeLessThan(15)
  })

  it('o Ogro: o grupo de 5 no nível 30 vence; no 26 e no 22, não', () => {
    expect(simularLuta(grupo(cinco, 30), mobsDaRegiao('boss')).venceu).toBe(true)
    expect(simularLuta(grupo(cinco, 26), mobsDaRegiao('boss')).venceu).toBe(false)
    expect(simularLuta(grupo(cinco, 22), mobsDaRegiao('boss')).venceu).toBe(false)
  })
})

describe('XP: a curva e o XP dos mobs decididos juntos', () => {
  it('do nível 1 para o 2 em uma ou duas partidas na Fácil (uns 6 lobos)', () => {
    const lobo = fichaDoMob('lobo', 'facil').xp
    expect(xpParaSubir(1) / lobo).toBeGreaterThanOrEqual(4)
    expect(xpParaSubir(1) / lobo).toBeLessThanOrEqual(10)
  })

  it('os animais inofensivos dão XP quase zero', () => {
    for (const [tipo, ficha] of Object.entries(mundo.mobs)) if (ficha.hostil === false) expect(fichaDoMob(tipo, 'neutra').xp, tipo).toBeLessThanOrEqual(1)
  })

  it('o XP de um mob cresce com a região (vale a pena ir mais fundo)', () => {
    expect(fichaDoMob('lobo', 'media').xp).toBeGreaterThan(fichaDoMob('lobo', 'facil').xp * 2)
    expect(fichaDoMob('lobo', 'dificil').xp).toBeGreaterThan(fichaDoMob('lobo', 'media').xp)
  })
})
