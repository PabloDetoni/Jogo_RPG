import { describe, expect, it } from 'vitest'
import { combateDeTeste } from '../dados/balanceamento.js'
import {
  cargaDaIA,
  cargaParaAlcance,
  cargaPeloTempo,
  danoDaCargaCheia,
  danoPorSegundo,
  flechaDaCarga,
  msDeRecargaDoArco,
  msParaCargaCheia,
} from './arco.js'

const arco = combateDeTeste.arco
const agilidades = [0, 1, 5, 10, 22, 30, 50, 70, 90, 99, 100]
const forcas = [1, 10, 25, 50, 100]

describe('arco que carrega: a carga (ajustes de 14/10)', () => {
  it('carga mínima: uns 35% do alcance e uns 30% do dano; carga cheia: 100% dos dois', () => {
    const fraca = flechaDaCarga(0, 10)
    const cheia = flechaDaCarga(1, 10)
    expect(fraca.alcance / cheia.alcance).toBeCloseTo(0.35, 2)
    expect(fraca.dano / cheia.dano).toBeGreaterThan(0.25)
    expect(fraca.dano / cheia.dano).toBeLessThan(0.35)
    expect(cheia.alcance).toBe(arco.alcanceMaximo)
    expect(cheia.dano).toBe(Math.round(danoDaCargaCheia(10)))
  })

  it('mais carga: mais longe, mais rápida e mais dano (nunca diminui)', () => {
    let antes = flechaDaCarga(0, 30)
    for (let carga = 0.05; carga <= 1.0001; carga += 0.05) {
      const agora = flechaDaCarga(carga, 30)
      expect(agora.alcance).toBeGreaterThanOrEqual(antes.alcance)
      expect(agora.velocidade).toBeGreaterThan(antes.velocidade)
      expect(agora.dano).toBeGreaterThanOrEqual(antes.dano)
      antes = agora
    }
  })

  it('a carga para no cheio: segurar mais não passa de 1', () => {
    expect(cargaPeloTempo(0, 800)).toBe(0)
    expect(cargaPeloTempo(400, 800)).toBe(0.5)
    expect(cargaPeloTempo(5000, 800)).toBe(1)
  })

  it('a Força dá o dano da carga cheia', () => {
    for (let i = 1; i < forcas.length; i++) expect(danoDaCargaCheia(forcas[i])).toBeGreaterThan(danoDaCargaCheia(forcas[i - 1]))
  })
})

describe('arco que carrega: a Agilidade (equilíbrio)', () => {
  it('o tempo para a carga cheia cai com a Agilidade e nunca fica abaixo do mínimo', () => {
    for (let agi = 0; agi <= 120; agi++) {
      expect(msParaCargaCheia(agi)).toBeGreaterThanOrEqual(arco.msMinimoParaCarregar)
      if (agi > 0 && agi <= 100) expect(msParaCargaCheia(agi)).toBeLessThan(msParaCargaCheia(agi - 1))
    }
    expect(msParaCargaCheia(100)).toBe(arco.msMinimoParaCarregar)
    expect(msParaCargaCheia(0)).toBe(arco.msParaCarregarSemAgilidade)
  })

  it('cada ponto de Agilidade muda pouco (no máximo 8 ms), e a diferença entre pontos vizinhos é suave', () => {
    let passoAnterior = null
    for (let agi = 1; agi <= 100; agi++) {
      const passo = msParaCargaCheia(agi - 1) - msParaCargaCheia(agi)
      expect(passo).toBeGreaterThan(0)
      expect(passo).toBeLessThanOrEqual(8)
      if (passoAnterior !== null) expect(Math.abs(passo - passoAnterior)).toBeLessThan(0.5)
      passoAnterior = passo
    }
  })

  it('quase linear: o meio do caminho fica perto do meio (entre 40% e 60% da queda em Agilidade 50)', () => {
    const queda = msParaCargaCheia(0) - msParaCargaCheia(100)
    const ateOMeio = msParaCargaCheia(0) - msParaCargaCheia(50)
    expect(ateOMeio / queda).toBeGreaterThan(0.4)
    expect(ateOMeio / queda).toBeLessThan(0.6)
  })

  it('em toda Agilidade e Força, carregar cheio rende mais dano por segundo que clicar rápido (e que qualquer carga parcial)', () => {
    for (const agi of agilidades) {
      for (const forca of forcas) {
        const cheio = danoPorSegundo(msParaCargaCheia(agi), agi, forca)
        for (const segurando of [0, 30, 60, 100, 150, 250, 400]) {
          if (segurando >= msParaCargaCheia(agi)) continue
          expect(cheio, `agi ${agi}, força ${forca}, segurando ${segurando} ms`).toBeGreaterThan(danoPorSegundo(segurando, agi, forca))
        }
      }
    }
  })

  it('nenhuma Agilidade deixa "spammar" flechas fortes: uma flecha cheia leva sempre pelo menos o mínimo mais a recarga', () => {
    for (const agi of agilidades) {
      const ciclo = msParaCargaCheia(agi) + msDeRecargaDoArco(agi)
      expect(ciclo).toBeGreaterThanOrEqual(arco.msMinimoParaCarregar * (1 + arco.fracaoDaRecarga) - 1)
    }
  })

  it('a recarga depois de soltar é curta (menos que o tempo da carga cheia)', () => {
    for (const agi of agilidades) expect(msDeRecargaDoArco(agi)).toBeLessThan(msParaCargaCheia(agi))
  })
})

describe('arco que carrega: o Arqueiro aliado', () => {
  const longe = arco.alcanceMaximo * 0.8
  const perto = arco.alcanceMaximo * 0.2

  it('a carga para um alcance: perto não precisa carregar; longe precisa mais', () => {
    expect(cargaParaAlcance(perto)).toBe(0)
    expect(cargaParaAlcance(longe)).toBeGreaterThan(0.5)
    expect(cargaParaAlcance(arco.alcanceMaximo * 2)).toBe(1)
  })

  it('a avançada carrega o suficiente para a distância do alvo (a flecha chega)', () => {
    for (const distancia of [perto, arco.alcanceMaximo * 0.5, longe]) {
      const { carga, msAMais } = cargaDaIA('avancada', distancia, () => 0.5)
      expect(flechaDaCarga(carga, 10).alcance).toBeGreaterThanOrEqual(distancia)
      expect(msAMais).toBe(0)
    }
  })

  it('a média erra um pouco para mais ou para menos', () => {
    const certa = cargaDaIA('avancada', longe, () => 0.5).carga
    const menos = cargaDaIA('media', longe, () => 0).carga
    const mais = cargaDaIA('media', longe, () => 1).carga
    expect(menos).toBeLessThan(certa)
    expect(mais).toBeGreaterThan(certa)
    expect(certa - menos).toBeLessThanOrEqual(arco.ia.erroDaMedia + 0.001)
  })

  it('a básica às vezes carrega pouco (a flecha cai antes) e às vezes demais (segura além do cheio)', () => {
    const pouco = cargaDaIA('basica', longe, () => 0)
    expect(flechaDaCarga(pouco.carga, 10).alcance).toBeLessThan(longe)
    const demais = cargaDaIA('basica', longe, () => 0.99)
    expect(demais.carga).toBe(1)
    expect(demais.msAMais).toBeGreaterThan(0)
  })
})
