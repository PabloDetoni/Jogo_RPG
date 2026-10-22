import { describe, expect, it } from 'vitest'
import { animacoesDoCenario } from '../dados/animacoesDoCenario.js'
import { posicoes } from '../dados/posicoes.js'
import {
  animacoesLigadas,
  brilhoDaLanterna,
  brilhoNaAgua,
  faixaDeVento,
  flocoDeNeve,
  fumacaQueSobe,
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
    expect(pontoNaImagem({ left: 0, top: 0, width: 1366, height: 768 }, 683, 384, imagem)).toEqual({ x: 836, y: 470.5 })
    expect(pontoNaImagem({ left: 100, top: 50, width: 1920, height: 1080 }, 1060, 590, imagem)).toEqual({ x: 836, y: 470.5 })
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

  it('as placas e os lugares do Mapa ficam dentro das imagens; as peças do Reino aparecem (a Árvore passa um pouco da beira)', () => {
    const { reino, mapa } = posicoes
    const dentro = (r, imagem) => r.x >= 0 && r.y >= 0 && r.x + r.largura <= imagem.largura && r.y + r.altura <= imagem.altura
    const aparece = (r, imagem) => r.x < imagem.largura && r.y < imagem.altura && r.x + r.largura > 0 && r.y + r.altura > 0
    const meioDentro = (r, imagem) => dentro({ x: r.x + r.largura / 2, y: r.y + r.altura / 2, largura: 0, altura: 0 }, imagem)
    for (const [id, r] of Object.entries(reino.pecas)) expect(r.enfeite ? aparece(r, reino.imagem) : aparece(r, reino.imagem) && meioDentro(r, reino.imagem), id).toBe(true)
    for (const [id, r] of Object.entries(reino.placas)) expect(dentro(r, reino.imagem), id).toBe(true)
    for (const grupo of [mapa.planalto, mapa.biomas, mapa.enfeites]) {
      for (const [id, r] of Object.entries(grupo)) expect(dentro(r, mapa.imagem), id).toBe(true)
    }
    expect(aparece(mapa.animacoes.fumaca, mapa.imagem)).toBe(true)
    // as pás e o corpo do moinho usam o mesmo quadro (as pás giram em volta do meio, o eixo)
    expect(reino.pecas.moinhoPas).toEqual({ ...reino.pecas.moinhoCorpo, gira: true })
  })
})

describe('animações do cenário: lentas, suaves e respeitando o "reduzir movimento"', () => {
  it('ligadas só com a opção ligada e sem o "reduzir movimento" do sistema', () => {
    expect(animacoesLigadas(true, false)).toBe(true)
    expect(animacoesLigadas(undefined, false)).toBe(true)
    expect(animacoesLigadas(false, false)).toBe(false)
    expect(animacoesLigadas(true, true)).toBe(false)
  })

  it('a nuvem começa no lugar da imagem, anda devagar e, passando da direita, volta por trás da copa', () => {
    const { voltaEm, lista } = posicoes.reino.animacoes.nuvens
    const L = posicoes.reino.imagem.largura
    const { velocidade } = animacoesDoCenario.nuvens
    const nuvem = lista[1]
    expect(posicaoDaNuvem(nuvem, 0, velocidade, voltaEm, L)).toBeCloseTo(nuvem.x)
    expect(posicaoDaNuvem(nuvem, 10, velocidade, voltaEm, L) - nuvem.x).toBeCloseTo(10 * velocidade)
    expect(velocidade).toBeLessThanOrEqual(4) // bem devagar: menos de 4 px por segundo
    const depoisDaBeira = posicaoDaNuvem(nuvem, (L - nuvem.x + 10) / velocidade, velocidade, voltaEm, L)
    expect(depoisDaBeira).toBeLessThan(voltaEm) // saiu pela direita, voltou atrás da copa
    for (const n of lista) expect(posicaoDaNuvem(n, 0, velocidade, voltaEm, L)).toBeCloseTo(n.x)
  })

  it('moinho devagar, lanterna sem piscar forte', () => {
    expect(animacoesDoCenario.pasDoMoinho.voltasPorMinuto).toBeLessThanOrEqual(6) // uma volta a cada 10 s ou mais
    for (let t = 0; t < 20; t += 0.11) {
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

  it('a fumaça do vulcão: no tempo 0 é a peça parada; depois sobe devagar, nunca some e nunca fica mais forte', () => {
    const f = animacoesDoCenario.fumacaDoVulcao
    expect(fumacaQueSobe(0, 0, f)).toEqual({ dy: 0, escala: 1, alfa: 1 })
    expect(fumacaQueSobe(0, 1, f).alfa).toBeCloseTo(0)
    for (let t = 0; t < f.periodo * 2; t += 0.3) {
      const copias = Array.from({ length: f.copias }, (_, i) => fumacaQueSobe(t, i, f))
      // as cópias juntas (uma por cima da outra) cobrem quase como a peça: nunca some
      const cobre = 1 - copias.reduce((resto, copia) => resto * (1 - copia.alfa), 1)
      expect(cobre).toBeGreaterThan(0.85)
      for (const copia of copias) {
        expect(copia.alfa >= 0 && copia.alfa <= 1).toBe(true)
        expect(Math.abs(copia.dy)).toBeLessThanOrEqual(f.subida / 2 + 1e-9)
        expect(Math.abs(copia.escala - 1)).toBeLessThanOrEqual(f.crescimento / 2 + 1e-9)
      }
    }
    // sobe: um pouco depois, a cópia 0 está mais alta (dy menor)
    expect(fumacaQueSobe(1, 0, f).dy).toBeLessThan(0)
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
