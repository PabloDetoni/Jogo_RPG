import { describe, expect, it } from 'vitest'
import { criarIndice, retangulosEntre, retangulosNaCaixa, retangulosPerto } from './vizinhanca.js'

const pedra = (x, y, largura = 50, altura = 50) => ({ x, y, largura, altura })

describe('busca de obstáculos por perto (Fase 3)', () => {
  const longe = pedra(5000, 5000)
  const perto = pedra(120, 100)
  const grande = pedra(1000, 400, 1800, 100) // atravessa vários baldes
  const indice = criarIndice([longe, perto, grande], 400)

  it('acha só os obstáculos perto do ponto', () => {
    expect(retangulosPerto(indice, { x: 100, y: 100 }, 80)).toEqual([perto])
    expect(retangulosPerto(indice, { x: 5000, y: 5000 }, 10)).toEqual([longe])
  })

  it('um obstáculo grande aparece em qualquer parte dele, e uma vez só', () => {
    expect(retangulosPerto(indice, { x: 1800, y: 400 }, 30)).toEqual([grande])
    expect(retangulosNaCaixa(indice, { x: 1000, y: 400, largura: 3000, altura: 50 })).toEqual([grande])
  })

  it('no caminho de um ponto a outro: tudo o que a caixa do caminho toca', () => {
    const achados = retangulosEntre(indice, { x: 0, y: 100 }, { x: 1000, y: 380 }, 10)
    expect(achados).toContain(perto)
    expect(achados).toContain(grande)
    expect(achados).not.toContain(longe)
  })

  it('nada por perto: lista vazia', () => {
    expect(retangulosPerto(indice, { x: 3000, y: 3000 }, 100)).toEqual([])
  })
})
