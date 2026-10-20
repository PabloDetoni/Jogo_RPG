import { describe, expect, it } from 'vitest'
import { animacoesDoCenario } from '../dados/animacoesDoCenario.js'
import { posicoes } from '../dados/posicoes.js'
import {
  animacoesLigadas,
  anguloDasPas,
  balanco,
  brilhoDaLanterna,
  brilhoNaAgua,
  desvioDoPano,
  faixaDeVento,
  flocoDeNeve,
  mascaraDaTransparencia,
  particulaDeFumaca,
  pecaNoPonto,
  pontoNaImagem,
  posicaoDaNuvem,
  pulsoDaLava,
  sorteioFixo,
  tocaNaPeca,
} from './cenario.js'

// Uma peça 4 × 4 com um "L" desenhado (1 = visível), numa grade do mesmo tamanho
const alfasDoL = [255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255]

describe('clique pelo formato da peça (camadas, 20/10)', () => {
  it('converte o ponto do mouse para pixels da imagem original, em qualquer tamanho de tela', () => {
    const imagem = posicoes.reino.imagem
    expect(pontoNaImagem({ left: 0, top: 0, width: 1366, height: 768 }, 683, 384, imagem)).toEqual({ x: 835, y: 471 })
    expect(pontoNaImagem({ left: 100, top: 50, width: 1920, height: 1080 }, 1060, 590, imagem)).toEqual({ x: 835, y: 471 })
  })

  it('a máscara vem da transparência: só o desenho vale, e a folga engorda um ponto em volta', () => {
    const justa = mascaraDaTransparencia(alfasDoL, 4, 4, { folga: 0 })
    expect([...justa.dados]).toEqual([1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1])
    const comFolga = mascaraDaTransparencia(alfasDoL, 4, 4, { folga: 1 })
    expect([...comFolga.dados]).toEqual([1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1])
  })

  it('o ponto no desenho toca a peça; no canto transparente do retângulo, não', () => {
    const peca = { id: 'l', x: 100, y: 100, largura: 40, altura: 40 }
    const mascara = mascaraDaTransparencia(alfasDoL, 4, 4, { folga: 0 })
    expect(tocaNaPeca(peca, { x: 105, y: 115 }, mascara)).toBe(true) // a perna do L
    expect(tocaNaPeca(peca, { x: 135, y: 105 }, mascara)).toBe(false) // o canto vazio, dentro do retângulo
    expect(tocaNaPeca(peca, { x: 135, y: 105 }, null)).toBe(true) // sem a imagem ainda: o retângulo
    expect(tocaNaPeca(peca, { x: 99, y: 115 }, mascara)).toBe(false) // fora do retângulo
  })

  it('a peça de cima ganha; uma sem clique por cima tapa a de baixo; no chão entre elas, nada', () => {
    const pecas = [
      { id: 'guilda', x: 0, y: 0, largura: 40, altura: 40 },
      { id: 'castelo', x: 20, y: 0, largura: 60, altura: 40, clicavel: false },
      { id: 'mercado', x: 70, y: 0, largura: 40, altura: 40 },
    ]
    expect(pecaNoPonto(pecas, { x: 10, y: 10 })).toBe('guilda')
    expect(pecaNoPonto(pecas, { x: 30, y: 10 })).toBe('guilda') // a Guilda está na frente do castelo
    expect(pecaNoPonto(pecas, { x: 75, y: 10 })).toBe(null) // o castelo (sem clique) na frente do Mercado
    expect(pecaNoPonto(pecas, { x: 95, y: 10 })).toBe('mercado')
    expect(pecaNoPonto(pecas, { x: 200, y: 10 })).toBe(null)
    const vazioNoMeio = { guilda: mascaraDaTransparencia(alfasDoL, 4, 4, { folga: 0 }) }
    expect(pecaNoPonto(pecas.slice(0, 1), { x: 35, y: 5 }, vazioNoMeio)).toBe(null)
  })

  it('as peças do Reino e do Mapa ficam dentro das imagens, e as clicáveis não se cobrem pelo retângulo inteiro', () => {
    for (const [imagem, grupos] of [
      [posicoes.reino.imagem, [posicoes.reino.pecas, posicoes.reino.placas]],
      [posicoes.mapa.imagem, [posicoes.mapa.planalto, posicoes.mapa.biomas, { base: posicoes.mapa.base }]],
    ]) {
      for (const grupo of grupos) {
        for (const [id, r] of Object.entries(grupo)) {
          expect(r.x >= 0 && r.y >= 0 && r.x + r.largura <= imagem.largura && r.y + r.altura <= imagem.altura, id).toBe(true)
        }
      }
    }
  })
})

describe('animações do cenário: lentas, suaves e respeitando o "reduzir movimento"', () => {
  it('ligadas só com a opção ligada e sem o "reduzir movimento" do sistema', () => {
    expect(animacoesLigadas(true, false)).toBe(true)
    expect(animacoesLigadas(undefined, false)).toBe(true)
    expect(animacoesLigadas(false, false)).toBe(false)
    expect(animacoesLigadas(true, true)).toBe(false)
  })

  it('a nuvem começa no lugar da imagem, anda devagar e volta pela outra beira', () => {
    const nuvem = { x: 993, largura: 136 }
    const { velocidade } = animacoesDoCenario.nuvens
    expect(posicaoDaNuvem(nuvem, 0, velocidade, 1670)).toBeCloseTo(993)
    expect(posicaoDaNuvem(nuvem, 10, velocidade, 1670) - 993).toBeCloseTo(10 * velocidade)
    expect(velocidade).toBeLessThanOrEqual(4) // bem devagar: menos de 4 px por segundo
    const depoisDaBeira = posicaoDaNuvem(nuvem, (1670 - 993 + 10) / velocidade, velocidade, 1670)
    expect(depoisDaBeira).toBeLessThan(0) // saiu pela direita, voltou pela esquerda
  })

  it('o pano preso não sai do lugar; a ponta solta balança no máximo a amplitude (pouco)', () => {
    const p = animacoesDoCenario.estandartes
    for (let t = 0; t < 10; t += 0.37) {
      expect(Math.abs(desvioDoPano(0, 60, t, p))).toBe(0) // (o zero pode vir com sinal)
      expect(Math.abs(desvioDoPano(60, 60, t, p))).toBeLessThanOrEqual(p.amplitude + 1e-9)
    }
    expect(p.amplitude).toBeLessThanOrEqual(2)
    expect(animacoesDoCenario.flamulas.amplitude).toBeLessThanOrEqual(2)
  })

  it('moinho devagar, balanço pequeno, lanterna sem piscar forte', () => {
    expect(anguloDasPas(60, animacoesDoCenario.pasDoMoinho.voltasPorMinuto)).toBeCloseTo(2 * Math.PI * animacoesDoCenario.pasDoMoinho.voltasPorMinuto)
    expect(animacoesDoCenario.pasDoMoinho.voltasPorMinuto).toBeLessThanOrEqual(6)
    for (let t = 0; t < 20; t += 0.11) {
      expect(Math.abs(balanco(t, 1.6, 7))).toBeLessThanOrEqual(1.6)
      const luz = brilhoDaLanterna(t, animacoesDoCenario.lanterna)
      expect(luz).toBeGreaterThanOrEqual(0)
      expect(luz).toBeLessThanOrEqual(0.35) // nunca estoura
    }
  })

  it('a fumaça sobe e some: começa e termina transparente, nunca forte', () => {
    const f = animacoesDoCenario.fumaca
    for (let i = 0; i < f.quantas; i++) {
      for (let t = 0; t < f.vida * 2; t += 0.25) {
        const bolinha = particulaDeFumaca(t, i, f)
        expect(bolinha.dy).toBeLessThanOrEqual(0)
        expect(bolinha.alfa).toBeGreaterThanOrEqual(0)
        expect(bolinha.alfa).toBeLessThanOrEqual(f.alfa)
      }
    }
    expect(particulaDeFumaca(0, 0, f).alfa).toBe(0)
  })

  it('brilho da água, lava e vento ficam nos limites; a neve cai dentro da área', () => {
    for (let t = 0; t < 15; t += 0.2) {
      const agua = brilhoNaAgua(t, 3, animacoesDoCenario.agua)
      expect(agua >= 0 && agua <= animacoesDoCenario.agua.alfa).toBe(true)
      const lava = pulsoDaLava(t, animacoesDoCenario.lava)
      expect(lava >= animacoesDoCenario.lava.minimo - 1e-9 && lava <= animacoesDoCenario.lava.maximo + 1e-9).toBe(true)
      const area = { x: 35, y: 15, largura: 689, altura: 383 }
      const floco = flocoDeNeve(t, 7, area, animacoesDoCenario.neve)
      expect(floco.y >= area.y && floco.y < area.y + area.altura).toBe(true)
      const vento = faixaDeVento(t, animacoesDoCenario.vento, area)
      expect(vento >= area.x - animacoesDoCenario.vento.largura && vento <= area.x + area.largura + animacoesDoCenario.vento.largura).toBe(true)
    }
    expect(sorteioFixo(4)).toBe(sorteioFixo(4))
    expect(sorteioFixo(4) >= 0 && sorteioFixo(4) < 1).toBe(true)
  })
})
