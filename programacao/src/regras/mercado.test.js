import { describe, expect, it } from 'vitest'
import { mercado } from '../dados/balanceamento.js'
import { ofertasFixas, ofertasRotativas } from '../dados/mercado.js'
import { progressoInicial } from '../estado/progresso.js'
import { comprarNoMercado, ofertasDoMomento, precoDeVenda, situacaoDaTroca, trocaDoMercado, trocarNoMercado, venderNoMercado } from './mercado.js'

const com = (mudancas) => ({ ...progressoInicial(), ...mudancas })

describe('ofertas do Mercado (TASK-074, rotação provisória)', () => {
  it('as fixas sempre; as rotativas mudam a cada rodada de partidas, sem repetir na mesma rodada', () => {
    const agora = ofertasDoMomento(0)
    expect(agora.fixas).toEqual(ofertasFixas)
    expect(agora.rotativas).toHaveLength(mercado.rotativasAVenda)
    expect(new Set(agora.rotativas).size).toBe(agora.rotativas.length)
    expect(ofertasDoMomento(mercado.partidasPorRotacao - 1).rotativas).toEqual(agora.rotativas)
    expect(ofertasDoMomento(mercado.partidasPorRotacao).rotativas).not.toEqual(agora.rotativas)
    expect(agora.partidasParaMudar).toBe(mercado.partidasPorRotacao)
    expect(ofertasDoMomento(mercado.partidasPorRotacao + 1).partidasParaMudar).toBe(mercado.partidasPorRotacao - 1)
  })

  it('com o tempo, todas as rotativas aparecem', () => {
    const vistas = new Set()
    for (let partidas = 0; partidas < 200; partidas++) ofertasDoMomento(partidas).rotativas.forEach((id) => vistas.add(id))
    expect([...vistas].sort()).toEqual([...ofertasRotativas].sort())
  })

  it('a venda paga a parte do preço, para baixo', () => {
    expect(precoDeVenda('pocaoDeVida')).toBe(Math.floor(25 * mercado.fracaoDaVenda))
    expect(precoDeVenda('naoExiste')).toBe(0)
  })
})

describe('comprar, vender e trocar (TASK-074)', () => {
  it('critério do card: com 40 de ouro, algo de 50 não dá; comprar desconta o ouro e põe na Mochila', () => {
    expect(comprarNoMercado(com({ ouro: 40 }), 'pergaminhoDeRedefinicao')).toEqual({ ok: false, motivo: 'Ouro insuficiente: custa 300 e você tem 40.' })
    expect(comprarNoMercado(com({ ouro: 40 }), 'pocaoDeVida', 2)).toEqual({ ok: false, motivo: 'Ouro insuficiente: custa 50 e você tem 40.' })
    const resultado = comprarNoMercado(com({ ouro: 100 }), 'pocaoDeVida', 2)
    expect(resultado.progresso.ouro).toBe(50)
    expect(resultado.progresso.mochila).toEqual([{ id: 'pocaoDeVida', quantidade: 2 }])
    expect(resultado.mensagem).toBe('Comprou 2 Poção de vida por 50 de ouro.')
  })

  it('não compra o que não está à venda agora (rotativa de outra rodada ou equipamento)', () => {
    const foraDaRodada = ofertasRotativas.find((id) => !ofertasDoMomento(0).rotativas.includes(id))
    expect(comprarNoMercado(com({ ouro: 9999 }), foraDaRodada).ok).toBe(false)
    expect(comprarNoMercado(com({ ouro: 9999 }), 'espadaCurta').ok).toBe(false)
    expect(comprarNoMercado(com({ ouro: 9999 }), 'pocaoDeVida', 0).ok).toBe(false)
  })

  it('vender soma o ouro e tira da Mochila; equipamento só na Forja', () => {
    const resultado = venderNoMercado(com({ ouro: 10, mochila: [{ id: 'peleDeLobo', quantidade: 3 }] }), 'peleDeLobo', 2)
    expect(resultado.progresso.ouro).toBe(10 + 2 * precoDeVenda('peleDeLobo'))
    expect(resultado.progresso.mochila).toEqual([{ id: 'peleDeLobo', quantidade: 1 }])
    expect(venderNoMercado(com({ mochila: [{ id: 'espadaCurta', quantidade: 1 }] }), 'espadaCurta')).toEqual({ ok: false, motivo: 'Equipamento se vende na Forja.' })
    expect(venderNoMercado(com({ mochila: [] }), 'peleDeLobo').ok).toBe(false)
  })

  it('critério do card: 3 peles e a troca de 3 por 1 → recebe o item e as peles saem da Mochila', () => {
    const resultado = trocarNoMercado(com({ mochila: [{ id: 'peleDeLobo', quantidade: 3 }] }), 'pelesPorPresa')
    expect(resultado.progresso.mochila).toEqual([{ id: 'presaDeJavali', quantidade: 1 }])
    expect(resultado.mensagem).toBe('Trocou 3 Pele de lobo por 1 Presa de javali.')
  })

  it('troca sem os itens diz o que falta; troca que não existe não muda nada', () => {
    expect(trocarNoMercado(com({ mochila: [{ id: 'peleDeLobo', quantidade: 1 }] }), 'pelesPorPresa')).toEqual({ ok: false, motivo: 'Faltam 2 Pele de lobo.' })
    expect(trocarNoMercado(com({}), 'naoExiste').ok).toBe(false)
    const troca = trocaDoMercado('ervasPorPocao')
    expect(situacaoDaTroca(com({ mochila: [{ id: 'cogumelo', quantidade: 5 }] }), troca)).toEqual([
      { id: 'cogumelo', quantidade: 3, tem: 5 },
      { id: 'ervaMedicinal', quantidade: 3, tem: 0 },
    ])
  })
})
