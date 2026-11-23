import { describe, expect, it } from 'vitest'
import { combateDeTeste, mundo } from '../dados/balanceamento.js'
import { mapaDoBioma } from './mapaDaPartida.js'
import { caminhoNaGrade, criarGrade, pontoLivreMaisProximo } from './movimento.js'
import { regiaoEm } from './mundo.js'

const floresta = mapaDoBioma('floresta')
const { personagem } = combateDeTeste

describe('o mapa da Floresta grande e fixa (Parte 5, provisório)', () => {
  const regiao = (id) => floresta.regioes.find((uma) => uma.id === id)
  const neutras = floresta.regioes.filter((uma) => uma.dificuldade === 'neutra')

  it('as regiões da zona segura ao domínio do chefe, com zonas neutras entre elas, como polígonos', () => {
    expect(floresta.regioes.slice(0, 5).map((uma) => uma.id)).toEqual(['zonaSegura', 'facil', 'media', 'dificil', 'dominioDoBoss'])
    expect(regiao('dominioDoBoss').dominioDeBoss).toBe(true)
    expect(neutras.length).toBeGreaterThanOrEqual(4)
    for (const uma of floresta.regioes) {
      // forma natural: um polígono de muitos pontos, não um retângulo
      expect(uma.poligono.length, uma.id).toBeGreaterThanOrEqual(10)
      expect(regiaoEm(floresta.regioes, uma.inicio), uma.id).toBe(uma)
    }
  })

  it('cerca de 3 minutos de ponta a ponta na velocidade do começo (caminho em "S" pela grade do terreno)', () => {
    const t = floresta.terreno
    const idx = (c, l) => l * t.colunas + c
    const casa = (ponto) => [Math.floor(ponto.x / t.celula), Math.floor(ponto.y / t.celula)]
    const distancia = new Int32Array(t.tipos.length).fill(-1)
    const [c0, l0] = casa(floresta.inicio)
    distancia[idx(c0, l0)] = 0
    const fila = [[c0, l0]]
    while (fila.length > 0) {
      const [c, l] = fila.shift()
      for (const [dc, dl] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nc = c + dc
        const nl = l + dl
        if (nc < 0 || nl < 0 || nc >= t.colunas || nl >= t.linhas || !t.tipos[idx(nc, nl)] || distancia[idx(nc, nl)] >= 0) continue
        distancia[idx(nc, nl)] = distancia[idx(c, l)] + 1
        fila.push([nc, nl])
      }
    }
    const ate = distancia[idx(...casa(floresta.lugarDoChefe))] * t.celula
    // a ~190 px/s: entre 2,3 e 3,5 minutos pela grade (andando de verdade, contornando árvores, perto de 3)
    expect(ate / 190).toBeGreaterThan(140)
    expect(ate / 190).toBeLessThan(210)
  })

  it('a borda da taxa (RF48) continua a distância em linha reta do início até o ponto andável mais longe', () => {
    expect(floresta.inicio).toEqual(floresta.regioes[0].inicio)
    expect(floresta.distanciaAteABorda).toBeGreaterThan(10000)
    expect(floresta.distanciaAteABorda).toBeLessThan(13500)
  })

  it('o início de cada zona e o lugar do chefe ficam livres (ninguém nasce em árvore, pedra ou mata)', () => {
    const regras = { area: floresta.area, paredes: floresta.obstaculos, raio: personagem.tamanho / 2, folga: 60 }
    for (const ponto of [...floresta.regioes.map((uma) => uma.inicio), floresta.lugarDoChefe]) {
      expect(pontoLivreMaisProximo(ponto, regras)).toEqual(ponto)
      expect(regiaoEm(floresta.regioes, ponto)).not.toBeNull()
    }
  })

  it('dá para andar do ponto inicial até a zona seguinte (a grade local do caminho acha a passagem)', () => {
    const grade = criarGrade(
      { x: 1500, y: 1450, largura: 3000, altura: 2400 },
      floresta.obstaculos,
      { celula: combateDeTeste.caminho.celula, folga: personagem.tamanho / 2 + 2 },
    )
    const caminho = caminhoNaGrade(grade, floresta.inicio, regiao('neutraDaEntrada').inicio)
    expect(caminho.length).toBeGreaterThan(0)
  })

  it('o chefe fica longe da entrada do domínio dele', () => {
    const entrada = regiao('dominioDoBoss').inicio
    expect(Math.hypot(floresta.lugarDoChefe.x - entrada.x, floresta.lugarDoChefe.y - entrada.y)).toBeGreaterThan(mundo.boss.raioDeDeteccao)
  })

  it('a mata fechada vira poucos retângulos, e há árvores e pedras numa quantidade que dá para desenhar', () => {
    expect(floresta.obstaculos.filter((obstaculo) => obstaculo.tipo === 'mata').length).toBeLessThan(600)
    const soltos = floresta.obstaculos.filter((obstaculo) => obstaculo.tipo !== 'mata')
    expect(soltos.length).toBeGreaterThan(100)
    expect(soltos.length).toBeLessThan(1500)
    expect(floresta.beiraDaMata.length).toBeGreaterThan(300)
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
