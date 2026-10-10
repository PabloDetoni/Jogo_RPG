import { describe, expect, it } from 'vitest'
import { atributoMaximo } from '../dados/balanceamento.js'
import { atributosIniciaisDaClasse } from '../dados/classes.js'
import { novoPersonagem, progressoInicial } from '../estado/progresso.js'
import { distribuirPontos, pontosDistribuidos, usarPergaminho } from './arvores.js'

const comPontos = (pontos, mudancas = {}) => ({
  ...progressoInicial(),
  personagens: [{ ...novoPersonagem('guerreiro'), pontosDeAtributo: pontos }],
  ...mudancas,
})
const guerreiro = (progresso) => progresso.personagens[0]
const forcaInicial = atributosIniciaisDaClasse('guerreiro').forca

describe('Árvores: distribuir pontos de atributo (TASK-076)', () => {
  it('critério do card: com 3 livres, 2 em Força → resta 1 e a Força cresce 2', () => {
    const r = distribuirPontos(comPontos(3), 'guerreiro', { forca: 2 })
    expect(r.ok).toBe(true)
    expect(guerreiro(r.progresso).pontosDeAtributo).toBe(1)
    expect(guerreiro(r.progresso).atributos.forca).toBe(forcaInicial + 2)
    expect(r.mensagem).toBe('2 pontos aplicados em Guerreiro.')
  })

  it('não usa mais pontos do que tem, nem passa do máximo, nem aceita distribuição estranha', () => {
    expect(distribuirPontos(comPontos(1), 'guerreiro', { forca: 2 }).motivo).toBe('Pontos insuficientes: Guerreiro tem 1 livre.')
    const quase = comPontos(5)
    quase.personagens[0].atributos.forca = atributoMaximo - 1
    expect(distribuirPontos(quase, 'guerreiro', { forca: 2 }).motivo).toBe(`Força não passa de ${atributoMaximo}.`)
    expect(distribuirPontos(comPontos(5), 'guerreiro', { voar: 1 }).ok).toBe(false)
    expect(distribuirPontos(comPontos(5), 'guerreiro', { forca: -1 }).ok).toBe(false)
    expect(distribuirPontos(comPontos(5), 'guerreiro', {}).ok).toBe(false)
    expect(distribuirPontos(comPontos(5), 'mago', { forca: 1 }).ok).toBe(false)
  })
})

describe('Árvores: pergaminho de redefinição (TASK-076, RF25)', () => {
  it('critério do card: o pergaminho devolve os pontos, os atributos voltam aos iniciais e ele some', () => {
    const distribuido = distribuirPontos(comPontos(4, { mochila: [{ id: 'pergaminhoDeRedefinicao', quantidade: 1 }] }), 'guerreiro', { forca: 3, agilidade: 1 }).progresso
    expect(pontosDistribuidos(guerreiro(distribuido))).toBe(4)
    const r = usarPergaminho(distribuido, 'guerreiro')
    expect(r.ok).toBe(true)
    expect(guerreiro(r.progresso).atributos).toEqual(atributosIniciaisDaClasse('guerreiro'))
    expect(guerreiro(r.progresso).pontosDeAtributo).toBe(4)
    expect(r.progresso.mochila).toEqual([])
  })

  it('as habilidades não mudam com o pergaminho', () => {
    const base = comPontos(2, { mochila: [{ id: 'pergaminhoDeRedefinicao', quantidade: 1 }] })
    base.personagens[0].habilidades = { giro: 3 }
    const distribuido = distribuirPontos(base, 'guerreiro', { forca: 2 }).progresso
    expect(guerreiro(usarPergaminho(distribuido, 'guerreiro').progresso).habilidades).toEqual({ giro: 3 })
  })

  it('sem pergaminho, ou sem nada distribuído, explica e não gasta nada', () => {
    const distribuido = distribuirPontos(comPontos(2), 'guerreiro', { forca: 2 }).progresso
    expect(usarPergaminho(distribuido, 'guerreiro').motivo).toContain('não tem o pergaminho')
    expect(usarPergaminho(comPontos(2, { mochila: [{ id: 'pergaminhoDeRedefinicao', quantidade: 1 }] }), 'guerreiro').motivo).toContain('ainda não tem pontos')
  })
})
