import { describe, expect, it } from 'vitest'
import { aplicarTaxa, calcularTaxa, taxaNaDistancia } from './taxa.js'

// As taxas vêm da documentação (dados/taxas.js), não do balanceamento provisório.
const borda = 1000
const lugar = (distancia, noDominioDeBoss = false) => ({ distancia, noDominioDeBoss })

describe('taxaNaDistancia (RF48, Conceito §12.2)', () => {
  // Tabela do Conceito: situação, início, meio e borda
  const semBoss = [
    ['perdido', 1, 3, 6],
    ['fuga', 7, 18, 30],
    ['todosDesmaiam', 10, 25, 40],
  ]
  const comBoss = [
    ['perdido', 3, 5, 8],
    ['fuga', 14, 25, 37],
    ['todosDesmaiam', 25, 40, 55],
  ]

  it.each(semBoss)('%s sem Boss: %i%% no início, %i%% no meio e %i%% na borda', (situacao, inicio, meio, fim) => {
    expect(taxaNaDistancia(situacao, 0, borda)).toBe(inicio)
    expect(taxaNaDistancia(situacao, borda / 2, borda)).toBe(meio)
    expect(taxaNaDistancia(situacao, borda, borda)).toBe(fim)
  })

  it.each(comBoss)('%s no domínio de Boss: %i%%, %i%% e %i%%', (situacao, inicio, meio, fim) => {
    expect(taxaNaDistancia(situacao, 0, borda, true)).toBe(inicio)
    expect(taxaNaDistancia(situacao, borda / 2, borda, true)).toBe(meio)
    expect(taxaNaDistancia(situacao, borda, borda, true)).toBe(fim)
  })

  it('trunca: 3,5% vira 3%', () => {
    expect(taxaNaDistancia('perdido', 500, 1000)).toBe(3)
  })

  it('cresce em linha reta entre o início e a borda', () => {
    expect(taxaNaDistancia('perdido', 200, 1000)).toBe(2) // 1 + 5 × 0,2 = 2
    expect(taxaNaDistancia('fuga', 250, 1000)).toBe(12) // 7 + 23 × 0,25 = 12,75
  })

  it('depois da borda vale a taxa da borda; antes do início, a do início', () => {
    expect(taxaNaDistancia('perdido', 5000, borda)).toBe(6)
    expect(taxaNaDistancia('perdido', -10, borda)).toBe(1)
  })

  it('não perde um ponto por erro de conta com números quebrados', () => {
    for (let distancia = 0; distancia <= borda; distancia++) {
      expect(taxaNaDistancia('perdido', distancia, borda)).toBe(1 + Math.floor((5 * distancia) / borda))
    }
  })

  it('reclama de uma distância até a borda inválida', () => {
    expect(() => taxaNaDistancia('perdido', 10, 0)).toThrow()
  })
})

describe('calcularTaxa', () => {
  it('soma os perdidos, cada um truncado: 2 perdidos dão 2%, 6% e 12% (tabela do Conceito)', () => {
    for (const [distancia, esperado] of [
      [0, 2],
      [500, 6],
      [1000, 12],
    ]) {
      expect(calcularTaxa({ como: 'retornoNormal', perdidos: [lugar(distancia), lugar(distancia)] }, borda)).toBe(esperado)
    }
  })

  it('4 perdidos dão 4%, 12% e 24%', () => {
    const quatro = (d) => [lugar(d), lugar(d), lugar(d), lugar(d)]
    expect(calcularTaxa({ como: 'retornoNormal', perdidos: quatro(0) }, borda)).toBe(4)
    expect(calcularTaxa({ como: 'retornoNormal', perdidos: quatro(500) }, borda)).toBe(12)
    expect(calcularTaxa({ como: 'retornoNormal', perdidos: quatro(1000) }, borda)).toBe(24)
  })

  it('cada perdido usa a própria distância e o próprio domínio de Boss', () => {
    const perdidos = [lugar(0), lugar(1000, true)] // 1% + (6 + 2)%
    expect(calcularTaxa({ como: 'retornoNormal', perdidos }, borda)).toBe(9)
  })

  it('fuga: uma taxa só, pela posição do Líder, no lugar das dos perdidos', () => {
    const fim = { como: 'fuga', perdidos: [lugar(1000), lugar(1000)], lider: lugar(500) }
    expect(calcularTaxa(fim, borda)).toBe(18)
  })

  it('todos desmaiaram: taxa de "todos desmaiam" pela posição do Líder', () => {
    expect(calcularTaxa({ como: 'todosDesmaiaram', lider: lugar(1000, true) }, borda)).toBe(55)
  })

  it('Líder não levantado: soma dos perdidos, contando o Líder', () => {
    const fim = { como: 'liderNaoLevantado', perdidos: [lugar(500), lugar(500)] }
    expect(calcularTaxa(fim, borda)).toBe(6)
  })

  it('ninguém perdido: taxa zero', () => {
    expect(calcularTaxa({ como: 'retornoNormal', perdidos: [] }, borda)).toBe(0)
  })
})

describe('aplicarTaxa', () => {
  it('exemplo 1 do Conceito: 6% de 8.000 = 480; recebe 7.520', () => {
    expect(aplicarTaxa(8000, 6)).toEqual({ taxaEmOuro: 480, ouroRecebido: 7520 })
  })

  it('exemplo 2 do Conceito: fuga no meio, 18% de 8.000 = 1.440', () => {
    expect(aplicarTaxa(8000, 18)).toEqual({ taxaEmOuro: 1440, ouroRecebido: 6560 })
  })

  it('arredonda a taxa para baixo, a favor do jogador (3% de 99 = 2,97 → 2)', () => {
    expect(aplicarTaxa(99, 3)).toEqual({ taxaEmOuro: 2, ouroRecebido: 97 })
  })

  it('taxa zero não desconta nada', () => {
    expect(aplicarTaxa(1234, 0)).toEqual({ taxaEmOuro: 0, ouroRecebido: 1234 })
  })

  it('ouro ganho zero ou negativo: nada a taxar (TEST-003)', () => {
    expect(aplicarTaxa(0, 55)).toEqual({ taxaEmOuro: 0, ouroRecebido: 0 })
    expect(aplicarTaxa(-100, 18)).toEqual({ taxaEmOuro: 0, ouroRecebido: 0 })
  })
})
