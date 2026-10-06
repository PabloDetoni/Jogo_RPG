import { describe, expect, it, vi } from 'vitest'
import { calcularFimDaPartida, decidirResultado, pontuacaoBase } from './fimDaPartida.js'

vi.mock('../dados/balanceamento.js', async (importarOriginal) => ({
  ...(await importarOriginal()),
  minimoDaGrandeVitoria: 1000,
  pesosDaPontuacao: { porMonstro: 10, porOuro: 1, porRecurso: 5, porSegundoAtivo: 1 },
}))

const borda = 1000
const meio = { distancia: 500, noDominioDeBoss: false }

describe('pontuacaoBase (RF49)', () => {
  it('soma cada parte com o seu peso', () => {
    // 10 × 10 + 200 + 4 × 5 + 50 + 100
    expect(pontuacaoBase({ monstros: 10, ouroGanho: 200, recursos: 4, bonusDeBoss: 50, segundosAtivos: 100 })).toBe(470)
  })

  it('o que falta conta como zero', () => {
    expect(pontuacaoBase({})).toBe(0)
  })

  it('valores negativos contam como zero (TEST-003)', () => {
    expect(pontuacaoBase({ monstros: -5, ouroGanho: -100, recursos: 2, segundosAtivos: -9 })).toBe(10)
  })

  it('grupo de um personagem só que desmaia é Derrota (RF47)', () => {
    const fim = { como: 'todosDesmaiaram', houveDesmaio: true, lider: meio, ouroGanho: 0 }
    expect(calcularFimDaPartida(fim, borda)).toMatchObject({ resultado: 'derrota', taxa: 25, pontuacaoFinal: 0 })
  })
})

describe('decidirResultado (RF47)', () => {
  it('todos desmaiaram é Derrota', () => {
    expect(decidirResultado({ como: 'todosDesmaiaram', houveDesmaio: true, pontuacaoBase: 5000 })).toBe('derrota')
  })

  it('fuga ou Líder não levantado é Retorno forçado', () => {
    expect(decidirResultado({ como: 'fuga', houveDesmaio: false, pontuacaoBase: 5000 })).toBe('retornoForcado')
    expect(decidirResultado({ como: 'liderNaoLevantado', houveDesmaio: true, pontuacaoBase: 5000 })).toBe('retornoForcado')
  })

  it('retorno normal sem desmaio e acima do mínimo é Grande Vitória', () => {
    expect(decidirResultado({ como: 'retornoNormal', houveDesmaio: false, pontuacaoBase: 1001 })).toBe('grandeVitoria')
  })

  it('retorno normal com desmaio, ou sem passar do mínimo, é Vitória', () => {
    expect(decidirResultado({ como: 'retornoNormal', houveDesmaio: true, pontuacaoBase: 5000 })).toBe('vitoria')
    expect(decidirResultado({ como: 'retornoNormal', houveDesmaio: false, pontuacaoBase: 1000 })).toBe('vitoria')
  })
})

describe('calcularFimDaPartida', () => {
  it('exemplo 1 do Conceito: 2 perdidos no meio, volta com Q → Vitória, taxa 6%, 480 de taxa', () => {
    const fim = { como: 'retornoNormal', houveDesmaio: true, perdidos: [meio, meio], ouroGanho: 8000 }
    expect(calcularFimDaPartida(fim, borda)).toMatchObject({
      resultado: 'vitoria',
      taxa: 6,
      taxaEmOuro: 480,
      ouroRecebido: 7520,
    })
  })

  it('exemplo 2 do Conceito: fuga no meio → Retorno forçado, 18%, 1.440 de taxa', () => {
    const fim = { como: 'fuga', houveDesmaio: true, perdidos: [meio, meio], lider: meio, ouroGanho: 8000 }
    expect(calcularFimDaPartida(fim, borda)).toMatchObject({
      resultado: 'retornoForcado',
      taxa: 18,
      taxaEmOuro: 1440,
      ouroRecebido: 6560,
    })
  })

  it('exemplo de pontuação do Conceito: base 5.100 e Derrota no meio (25%) → 3.825', () => {
    const fim = { como: 'todosDesmaiaram', houveDesmaio: true, lider: meio, ouroGanho: 5100 }
    expect(calcularFimDaPartida(fim, borda)).toMatchObject({ resultado: 'derrota', taxa: 25, pontuacaoBase: 5100, pontuacaoFinal: 3825 })
  })

  it('Grande Vitória: taxa 0 e +10% no ouro e na pontuação', () => {
    const fim = { como: 'retornoNormal', houveDesmaio: false, perdidos: [], ouroGanho: 2000, monstros: 50 }
    expect(calcularFimDaPartida(fim, borda)).toEqual({
      resultado: 'grandeVitoria',
      taxa: 0,
      taxaEmOuro: 0,
      ouroRecebido: 2200,
      pontuacaoBase: 2500,
      pontuacaoFinal: 2750,
    })
  })

  it('sem passar do mínimo não há bônus, mesmo sem desmaio', () => {
    const fim = { como: 'retornoNormal', houveDesmaio: false, perdidos: [], ouroGanho: 500 }
    expect(calcularFimDaPartida(fim, borda)).toMatchObject({ resultado: 'vitoria', ouroRecebido: 500, pontuacaoFinal: 500 })
  })

  it('XP nunca é taxado: o fim da partida não mexe em XP', () => {
    const fim = { como: 'fuga', houveDesmaio: false, lider: meio, ouroGanho: 100 }
    expect(Object.keys(calcularFimDaPartida(fim, borda))).not.toContain('xp')
  })
})
