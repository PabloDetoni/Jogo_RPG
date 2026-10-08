import { describe, expect, it } from 'vitest'
import { novoPersonagem, progressoInicial } from '../estado/progresso.js'
import { aplicarFimNoProgresso } from './ganhosDaPartida.js'

const progresso = {
  ...progressoInicial(),
  personagens: [novoPersonagem('mago'), { ...novoPersonagem('guerreiro'), nivel: 29, xp: 2890 }],
  contratosTemporarios: [{ classe: 'arqueiro', partidasRestantes: 1, nivel: 5 }],
  lider: 'mago',
  ouro: 50,
  estatisticas: { partidasJogadas: 3, monstrosDerrotados: 10 },
}

describe('aplicarFimNoProgresso (TASK-048)', () => {
  it('ouro recebido, XP com níveis e pontos, monstros e mais uma partida', () => {
    const { progresso: depois, personagens } = aplicarFimNoProgresso(progresso, {
      ouroRecebido: 192,
      xpPorClasse: { mago: 250, guerreiro: 20 },
      monstros: 7,
    })
    expect(depois.ouro).toBe(242)
    expect(depois.estatisticas).toEqual({ partidasJogadas: 4, monstrosDerrotados: 17 })
    // Mago: 250 XP do nível 1 → nível 2 (100) e nível 3 (200)? 100 + 200 = 300 > 250: só o nível 2, com 150
    expect(depois.personagens[0]).toMatchObject({ nivel: 2, xp: 150, pontosDeAtributo: 3, pontosDeHabilidade: 1 })
    // Guerreiro: 2890 + 20 = 2910 ≥ 2900 → nível 30 (a IA dele vira a média na próxima partida)
    expect(depois.personagens[1]).toMatchObject({ nivel: 30, xp: 10 })
    expect(personagens).toEqual([
      { classe: 'mago', xp: 250, nivelAntes: 1, nivel: 2, niveisGanhos: 1 },
      { classe: 'guerreiro', xp: 20, nivelAntes: 29, nivel: 30, niveisGanhos: 1 },
    ])
  })

  it('o contrato temporário perde uma partida e vai embora no zero (RF52)', () => {
    expect(aplicarFimNoProgresso(progresso, {}).progresso.contratosTemporarios).toEqual([])
  })

  it('sem ganhos: só conta a partida (entrar e sair logo também conta, RF34)', () => {
    const { progresso: depois, personagens } = aplicarFimNoProgresso(progresso, {})
    expect(depois.ouro).toBe(50)
    expect(depois.estatisticas.partidasJogadas).toBe(4)
    expect(depois.personagens).toEqual(progresso.personagens)
    expect(personagens.every((personagem) => personagem.xp === 0 && personagem.niveisGanhos === 0)).toBe(true)
  })

  it('números negativos ou quebrados não tiram nada (TEST-003)', () => {
    const { progresso: depois } = aplicarFimNoProgresso(progresso, { ouroRecebido: -40, xpPorClasse: { mago: -5 }, monstros: -2 })
    expect(depois.ouro).toBe(50)
    expect(depois.estatisticas.monstrosDerrotados).toBe(10)
    expect(depois.personagens[0].xp).toBe(0)
  })

  it('XP de uma classe que não é permanente (temporário) não entra em ninguém', () => {
    const { progresso: depois } = aplicarFimNoProgresso(progresso, { xpPorClasse: { arqueiro: 500 } })
    expect(depois.personagens).toEqual(progresso.personagens)
  })

  it('não muda o progresso original', () => {
    const copia = structuredClone(progresso)
    aplicarFimNoProgresso(progresso, { ouroRecebido: 10, xpPorClasse: { mago: 10 }, monstros: 1 })
    expect(progresso).toEqual(copia)
  })
})
