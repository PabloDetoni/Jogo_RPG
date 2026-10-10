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

describe('mapa descoberto no fim da partida (Fase 3, RF40)', () => {
  const descobertas = { bioma: 'floresta', nevoa: 'f0', areas: ['clareiraDasFlores'], regioes: ['facil'] }

  it('a névoa e as áreas somam às de antes; as regiões descobertas liberam o Ponto de partida', () => {
    const antes = { ...progresso, mapasDescobertos: { floresta: { nevoa: '0f', areas: ['trilhaDoReino'] } }, regioesDescobertas: {} }
    const { progresso: depois } = aplicarFimNoProgresso(antes, { descobertas })
    expect(depois.mapasDescobertos.floresta).toEqual({ nevoa: 'ff', areas: ['trilhaDoReino', 'clareiraDasFlores'] })
    expect(depois.regioesDescobertas.floresta).toEqual(['facil'])
  })

  it('primeira vez no bioma: começa do nada; sem descobertas (arena de teste), o mapa não muda', () => {
    const { progresso: depois } = aplicarFimNoProgresso(progresso, { descobertas })
    expect(depois.mapasDescobertos.floresta).toEqual({ nevoa: 'f0', areas: ['clareiraDasFlores'] })
    const { progresso: semNada } = aplicarFimNoProgresso(progresso, { descobertas: null })
    expect(semNada.mapasDescobertos).toEqual(progresso.mapasDescobertos)
  })

  it('descobrir de novo o que já era conhecido não repete nada', () => {
    const antes = { ...progresso, mapasDescobertos: { floresta: { nevoa: 'f0', areas: ['clareiraDasFlores'] } }, regioesDescobertas: { floresta: ['facil'] } }
    const { progresso: depois } = aplicarFimNoProgresso(antes, { descobertas })
    expect(depois.mapasDescobertos.floresta.areas).toEqual(['clareiraDasFlores'])
    expect(depois.regioesDescobertas.floresta).toEqual(['facil'])
  })
})

describe('itens da mochila da partida (TASK-064, RF50)', () => {
  it('vão para a Mochila do Reino, juntando os iguais', () => {
    const antes = { ...progresso, mochila: [{ id: 'cogumelo', quantidade: 2 }] }
    const { progresso: depois } = aplicarFimNoProgresso(antes, { itens: [{ id: 'cogumelo', quantidade: 3 }, { id: 'peleDeLobo', quantidade: 1 }] })
    expect(depois.mochila).toEqual([
      { id: 'cogumelo', quantidade: 5 },
      { id: 'peleDeLobo', quantidade: 1 },
    ])
    expect(antes.mochila).toEqual([{ id: 'cogumelo', quantidade: 2 }]) // o original não muda
  })

  it('item estragado (sem id ou com quantidade zero ou quebrada) não entra', () => {
    const { progresso: depois } = aplicarFimNoProgresso(progresso, { itens: [{ id: '', quantidade: 2 }, { id: 'madeira', quantidade: 0 }, { id: 'madeira', quantidade: 2.7 }, null] })
    expect(depois.mochila).toEqual([{ id: 'madeira', quantidade: 2 }])
  })
})

describe('itens levados da Mochila do Reino (Fase 4, TASK-073)', () => {
  it('o que foi levado sai do Reino; o que sobrou na mochila da partida volta, com o que foi coletado', () => {
    const progresso = { ...progressoInicial(), mochila: [{ id: 'pocaoDeVida', quantidade: 5 }, { id: 'madeira', quantidade: 1 }] }
    // levou 3 poções, usou 2 na partida e coletou 2 peles
    const { progresso: depois } = aplicarFimNoProgresso(progresso, {
      levados: { pocaoDeVida: 3 },
      itens: [{ id: 'pocaoDeVida', quantidade: 1 }, { id: 'peleDeLobo', quantidade: 2 }],
    })
    expect(depois.mochila).toEqual([
      { id: 'pocaoDeVida', quantidade: 3 },
      { id: 'madeira', quantidade: 1 },
      { id: 'peleDeLobo', quantidade: 2 },
    ])
  })

  it('usou tudo o que levou: o item some da Mochila do Reino; nunca tira mais do que havia', () => {
    const progresso = { ...progressoInicial(), mochila: [{ id: 'pocaoDeVida', quantidade: 2 }] }
    expect(aplicarFimNoProgresso(progresso, { levados: { pocaoDeVida: 2 }, itens: [] }).progresso.mochila).toEqual([])
    expect(aplicarFimNoProgresso(progresso, { levados: { pocaoDeVida: 9 }, itens: [] }).progresso.mochila).toEqual([])
  })
})

describe('missão ativa no fim da partida (Fase 4, TASK-078)', () => {
  it('avança com o que a partida contou, em qualquer resultado', () => {
    const missaoAtiva = { id: 'm', tipo: 'matar', alvo: 'lobo', quantidade: 10, progresso: 4, recompensa: { ouro: 80, xp: 100 } }
    const { progresso } = aplicarFimNoProgresso({ ...progressoInicial(), missaoAtiva }, { eventos: { abates: { lobo: 3 } } })
    expect(progresso.missaoAtiva.progresso).toBe(7)
  })

  it('sem eventos (partida antiga, botões de teste), a missão fica como estava', () => {
    const missaoAtiva = { id: 'm', tipo: 'matar', alvo: 'lobo', quantidade: 10, progresso: 4, recompensa: { ouro: 80, xp: 100 } }
    expect(aplicarFimNoProgresso({ ...progressoInicial(), missaoAtiva }, {}).progresso.missaoAtiva).toEqual(missaoAtiva)
  })
})
