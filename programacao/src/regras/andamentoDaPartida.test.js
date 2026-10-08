import { describe, expect, it } from 'vitest'
import {
  alternarRetorno,
  avancarFuga,
  avancarRetorno,
  comecarFuga,
  custoDaFuga,
  danoRecente,
  estaEmCombate,
  nivelComOXpDaPartida,
  quemRecebeXp,
  segundosDaContagem,
  somarTempoAtivo,
  somarXpDoAbate,
  xpParaOProximoNivel,
} from './andamentoDaPartida.js'

const cincoSegundos = 5000
const quinzeSegundos = 15000

describe('em combate (RF37)', () => {
  it('sem dano e sem mob perseguindo: fora de combate', () => {
    expect(estaEmCombate({ agora: 10000, ultimoDano: null, perseguidores: 0 }, cincoSegundos)).toBe(false)
  })

  it('dano nos últimos 5 s: em combate; depois de 5 s, não', () => {
    expect(estaEmCombate({ agora: 14999, ultimoDano: 10000, perseguidores: 0 }, cincoSegundos)).toBe(true)
    expect(estaEmCombate({ agora: 15000, ultimoDano: 10000, perseguidores: 0 }, cincoSegundos)).toBe(false)
  })

  it('um mob hostil perseguindo o grupo: em combate, mesmo sem dano', () => {
    expect(estaEmCombate({ agora: 99999, ultimoDano: null, perseguidores: 1 }, cincoSegundos)).toBe(true)
  })

  it('tempo ativo (Conceito §12): só soma com dano nos últimos 5 s; perseguido sem dano não conta', () => {
    expect(somarTempoAtivo(1000, { agora: 12000, ultimoDano: 10000, ms: 16 }, cincoSegundos)).toBe(1016)
    expect(somarTempoAtivo(1000, { agora: 16000, ultimoDano: 10000, ms: 16 }, cincoSegundos)).toBe(1000)
    expect(somarTempoAtivo(1000, { agora: 16000, ultimoDano: null, ms: 16 }, cincoSegundos)).toBe(1000)
    expect(danoRecente(0, null, cincoSegundos)).toBe(false)
  })
})

describe('retorno normal com Q (RF45)', () => {
  const foraDeCombate = { emCombate: false, fugindo: false }

  it('Q fora de combate começa os 15 s; Q de novo cancela', () => {
    const comecou = alternarRetorno(null, foraDeCombate, quinzeSegundos)
    expect(comecou).toEqual({ retorno: { msRestantes: 15000, interrompido: false }, aviso: 'comecou' })
    expect(alternarRetorno(comecou.retorno, foraDeCombate, quinzeSegundos)).toEqual({ retorno: null, aviso: 'cancelado' })
  })

  it('Q em combate não começa', () => {
    expect(alternarRetorno(null, { emCombate: true, fugindo: false }, quinzeSegundos)).toEqual({ retorno: null, aviso: 'emCombate' })
  })

  it('Q em combate com a contagem correndo cancela (Q sempre cancela)', () => {
    const correndo = { msRestantes: 9000, interrompido: true }
    expect(alternarRetorno(correndo, { emCombate: true, fugindo: false }, quinzeSegundos).retorno).toBeNull()
  })

  it('com a fuga correndo, o Q não faz nada', () => {
    expect(alternarRetorno(null, { emCombate: false, fugindo: true }, quinzeSegundos)).toEqual({ retorno: null, aviso: 'fugindo' })
  })

  it('fora de combate a contagem corre e termina em 0', () => {
    let retorno = { msRestantes: 15000, interrompido: false }
    for (let i = 0; i < 14; i++) retorno = avancarRetorno(retorno, { emCombate: false, ms: 1000 }, quinzeSegundos).retorno
    expect(retorno.msRestantes).toBe(1000)
    expect(avancarRetorno(retorno, { emCombate: false, ms: 1000 }, quinzeSegundos)).toEqual({
      retorno: { msRestantes: 0, interrompido: false },
      terminou: true,
    })
  })

  it('o combate a 1 s do fim faz a contagem voltar a 15 s e esperar; fora de combate, ela corre de novo', () => {
    const quaseNoFim = { msRestantes: 1000, interrompido: false }
    const interrompido = avancarRetorno(quaseNoFim, { emCombate: true, ms: 16 }, quinzeSegundos)
    expect(interrompido).toEqual({ retorno: { msRestantes: 15000, interrompido: true }, terminou: false })
    // em combate, fica parado em 15 s
    const aindaEmCombate = avancarRetorno(interrompido.retorno, { emCombate: true, ms: 3000 }, quinzeSegundos)
    expect(aindaEmCombate.retorno.msRestantes).toBe(15000)
    const voltou = avancarRetorno(aindaEmCombate.retorno, { emCombate: false, ms: 500 }, quinzeSegundos)
    expect(voltou).toEqual({ retorno: { msRestantes: 14500, interrompido: false }, terminou: false })
  })

  it('sem retorno, nada acontece', () => {
    expect(avancarRetorno(null, { emCombate: false, ms: 1000 }, quinzeSegundos)).toEqual({ retorno: null, terminou: false })
  })
})

describe('fuga com F (RF46)', () => {
  it('começa com 5 s e corre até em combate (a contagem não depende do combate)', () => {
    let fuga = comecarFuga(null, cincoSegundos)
    expect(fuga).toEqual({ msRestantes: 5000 })
    fuga = avancarFuga(fuga, 4000).fuga
    expect(avancarFuga(fuga, 999)).toEqual({ fuga: { msRestantes: 1 }, terminou: false })
    expect(avancarFuga(fuga, 1000).terminou).toBe(true)
  })

  it('só uma fuga por partida: começar de novo não reinicia a contagem', () => {
    expect(comecarFuga({ msRestantes: 1200 }, cincoSegundos)).toEqual({ msRestantes: 1200 })
  })

  it('a contagem na tela arredonda para cima (14,2 s aparece como 15)', () => {
    expect(segundosDaContagem(14200)).toBe(15)
    expect(segundosDaContagem(15000)).toBe(15)
    expect(segundosDaContagem(1)).toBe(1)
    expect(segundosDaContagem(0)).toBe(0)
  })

  it('custo da fuga: a taxa de fuga pela distância do Líder e quanto ela tira do ouro ganho', () => {
    const inicio = { x: 0, y: 0 }
    expect(custoDaFuga({ lider: { x: 0, y: 0 }, inicio, ouroGanho: 100 }, 1000)).toEqual({ taxa: 7, ouro: 7 })
    // no meio do caminho até a borda: 7 + 23 × 0,5 = 18,5 → 18% (exemplo 2 do Conceito)
    expect(custoDaFuga({ lider: { x: 300, y: 400 }, inicio, ouroGanho: 8000 }, 1000)).toEqual({ taxa: 18, ouro: 1440 })
    expect(custoDaFuga({ lider: { x: 5000, y: 0 }, inicio, ouroGanho: 0 }, 1000)).toEqual({ taxa: 30, ouro: 0 })
  })
})

describe('XP de cada monstro (RF50)', () => {
  const grupo = [
    { classe: 'mago', temporario: false, caido: false, perdido: false },
    { classe: 'tanque', temporario: false, caido: true, perdido: false },
    { classe: 'arqueiro', temporario: true, caido: false, perdido: false },
    { classe: 'guerreiro', temporario: false, caido: false, perdido: false },
  ]

  it('só os permanentes de pé recebem: o temporário e o caído, não', () => {
    expect(quemRecebeXp(grupo)).toEqual(['mago', 'guerreiro'])
  })

  it('o XP é dividido igualmente e a sobra vai primeiro para o Líder; soma ao que já foi ganho', () => {
    const { xpDaPartida, partes } = somarXpDoAbate({ mago: 10 }, 25, grupo, 'guerreiro')
    expect(partes).toEqual({ guerreiro: 13, mago: 12 })
    expect(xpDaPartida).toEqual({ mago: 22, guerreiro: 13 })
  })

  it('ninguém de pé para receber: o XP do monstro se perde', () => {
    const caidos = grupo.map((membro) => ({ ...membro, caido: true }))
    expect(somarXpDoAbate({}, 50, caidos, 'mago').xpDaPartida).toEqual({})
  })

  it('o nível com o XP da partida avisa a subida na hora (o save só muda no fim)', () => {
    // nível 1 com 90 XP: precisa de 100 para o nível 2
    expect(nivelComOXpDaPartida({ nivel: 1, xp: 90 }, 9)).toBe(1)
    expect(nivelComOXpDaPartida({ nivel: 1, xp: 90 }, 10)).toBe(2)
    // nível 29 a 1 XP do 30 (IA básica → média na partida seguinte)
    expect(nivelComOXpDaPartida({ nivel: 29, xp: 2899 }, 1)).toBe(30)
  })

  it('XP para o próximo nível conta o que já foi ganho na partida (botão "Subir nível")', () => {
    expect(xpParaOProximoNivel({ nivel: 1, xp: 0 }, 0)).toBe(100)
    expect(xpParaOProximoNivel({ nivel: 1, xp: 30 }, 50)).toBe(20)
    expect(xpParaOProximoNivel({ nivel: 1, xp: 0 }, 130)).toBe(170) // já no nível 2 com 30: faltam 200 − 30
    expect(xpParaOProximoNivel({ nivel: 100, xp: 0 }, 0)).toBe(0)
  })
})
