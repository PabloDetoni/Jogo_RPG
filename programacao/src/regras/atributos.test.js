import { describe, expect, it, vi } from 'vitest'
import { aplicarPontoDeAtributo, efeitoComExpoente, efeitoDoAtributo, pontosDeAtributoAteONivel } from './atributos.js'

vi.mock('../dados/balanceamento.js', async (importarOriginal) => ({
  ...(await importarOriginal()),
  atributoMaximo: 100,
  curvaDosAtributos: { expoente: 1.5 },
  pontosDeAtributoPorNivel: 3,
}))

describe('efeito dos atributos', () => {
  it('o máximo vale sempre o máximo, seja qual for a curva', () => {
    for (const expoente of [1, 1.25, 1.5, 2]) expect(efeitoComExpoente(100, expoente)).toBe(100)
  })

  it('expoente 1 é linha reta: 50 vale metade de 100', () => {
    expect(efeitoComExpoente(50, 1)).toBe(50)
  })

  it('expoente acima de 1: 100 vale mais que o dobro de 50', () => {
    expect(efeitoComExpoente(50, 2)).toBe(25) // 100 vale 4 vezes
    expect(efeitoComExpoente(50, 1.5)).toBeCloseTo(35.36, 2) // 100 vale 2,83 vezes
  })

  it('fica entre 0 e o máximo', () => {
    expect(efeitoComExpoente(-5, 1.5)).toBe(0)
    expect(efeitoComExpoente(250, 1.5)).toBe(100)
  })

  it('efeitoDoAtributo usa a curva escolhida no balanceamento', () => {
    expect(efeitoDoAtributo(50)).toBeCloseTo(35.36, 2)
  })
})

describe('pontos de atributo', () => {
  it('3 por nível: nenhum no nível 1, 297 no nível 100', () => {
    expect(pontosDeAtributoAteONivel(1)).toBe(0)
    expect(pontosDeAtributoAteONivel(2)).toBe(3)
    expect(pontosDeAtributoAteONivel(100)).toBe(297)
  })

  const comPontos = (pontosDeAtributo, forca = 10) => ({
    classe: 'tanque',
    pontosDeAtributo,
    atributos: { vitalidade: 18, forca, sabedoria: 6, inteligencia: 4, agilidade: 7 },
  })

  it('aplicar um ponto gasta o ponto e sobe o atributo', () => {
    const depois = aplicarPontoDeAtributo(comPontos(2), 'forca')
    expect(depois.pontosDeAtributo).toBe(1)
    expect(depois.atributos.forca).toBe(11)
  })

  it('sem ponto livre, no máximo ou com atributo que não existe, nada muda', () => {
    const semPonto = comPontos(0)
    expect(aplicarPontoDeAtributo(semPonto, 'forca')).toBe(semPonto)
    const noMaximo = comPontos(5, 100)
    expect(aplicarPontoDeAtributo(noMaximo, 'forca')).toBe(noMaximo)
    const qualquer = comPontos(5)
    expect(aplicarPontoDeAtributo(qualquer, 'sorte')).toBe(qualquer)
  })
})
