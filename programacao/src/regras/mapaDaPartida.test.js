import { describe, expect, it } from 'vitest'
import { combateDeTeste, mundo } from '../dados/balanceamento.js'
import { mapaDoBioma } from './mapaDaPartida.js'
import { caminhoNaGrade, criarGrade, pontoLivreMaisProximo } from './movimento.js'
import { regiaoEm } from './mundo.js'

const floresta = mapaDoBioma('floresta')
const { personagem } = combateDeTeste

describe('o mapa da Floresta (Fase 3, provisório)', () => {
  it('maior que a tela, com regiões da zona segura até o domínio do Boss', () => {
    expect(floresta.tamanho.largura).toBeGreaterThan(1600 * 3)
    expect(floresta.regioes.map((regiao) => regiao.id)).toEqual(['zonaSegura', 'facil', 'media', 'dificil', 'dominioDoBoss'])
    expect(floresta.regioes.at(-1).dominioDeBoss).toBe(true)
    // começa estreita e se abre
    const alturas = floresta.regioes.slice(0, 4).map((regiao) => regiao.y1 - regiao.y0)
    expect([...alturas].sort((a, b) => a - b)).toEqual(alturas)
  })

  it('a borda da taxa fica no canto andável mais longe do ponto inicial (a zona segura)', () => {
    expect(floresta.inicio).toEqual(floresta.regioes[0].inicio)
    expect(floresta.distanciaAteABorda).toBeGreaterThan(6500)
    expect(floresta.distanciaAteABorda).toBeLessThan(8000)
  })

  it('o início de cada região e o lugar do Boss ficam livres (ninguém nasce em árvore ou pedra)', () => {
    const regras = { area: floresta.area, paredes: floresta.obstaculos, raio: personagem.tamanho / 2, folga: 60 }
    for (const ponto of [...floresta.regioes.map((regiao) => regiao.inicio), floresta.lugarDoBoss]) {
      expect(pontoLivreMaisProximo(ponto, regras)).toEqual(ponto)
      expect(regiaoEm(floresta.regioes, ponto)).not.toBeNull()
    }
  })

  it('dá para andar do ponto inicial até o início de todas as regiões e até o Boss (ninguém fica preso)', () => {
    const grade = criarGrade(floresta.area, floresta.obstaculos, { celula: combateDeTeste.caminho.celula, folga: personagem.tamanho / 2 + 2 })
    for (const destino of [...floresta.regioes.slice(1).map((regiao) => regiao.inicio), floresta.lugarDoBoss]) {
      const caminho = caminhoNaGrade(grade, floresta.inicio, destino)
      expect(caminho.length).toBeGreaterThan(0)
      expect(caminho.at(-1)).toEqual(destino)
    }
  })

  it('árvores e pedras numa quantidade que dá para desenhar e passar', () => {
    const soltos = floresta.obstaculos.filter((obstaculo) => obstaculo.tipo !== 'mata')
    expect(soltos.length).toBeGreaterThan(50)
    expect(soltos.length).toBeLessThan(250)
    for (const obstaculo of soltos) expect(Math.max(obstaculo.largura, obstaculo.altura)).toBeLessThanOrEqual(mundo.obstaculos.pedra.largura[1])
  })
})

describe('a arena de teste continua igual (só no npm run dev)', () => {
  const arena = mapaDoBioma('arena')
  it('sem câmera, com as pedras, o boneco e a borda da taxa de 1400 px', () => {
    expect(arena.comCamera).toBe(false)
    expect(arena.obstaculos).toHaveLength(6)
    expect(arena.boneco).toBeDefined()
    expect(arena.distanciaAteABorda).toBe(1400)
  })

  it('os biomas fora do beta caem na Floresta', () => {
    expect(mapaDoBioma('deserto')).toBe(floresta)
  })
})
