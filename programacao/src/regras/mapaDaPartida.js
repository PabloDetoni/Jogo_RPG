import * as arenaDeTeste from '../dados/arenaDeTeste.js'
import { combateDeTeste, mundo } from '../dados/balanceamento.js'
import { floresta } from '../dados/mundo/floresta.js'
import { distanciaAteABorda, gerarObstaculos, paredesDaMata } from './mundo.js'

// O mapa pronto para a partida (Fase 3): a Floresta, ou a arena de teste da Fase 1 (só no npm run dev).
// Junta o layout (dados/mundo/) com o que sai das regras: a mata fechada em volta, as árvores e pedras, o ponto
// inicial do bioma e a borda da taxa (RF48). A cena da partida só desenha e move o que vem daqui.
//
// Campos: id, nome, tamanho, area (onde dá para andar: { x, y, largura, altura } com o centro), comCamera,
// obstaculos ({ x, y, largura, altura, tipo: 'mata' | 'arvore' | 'pedra' }), regioes, areas, inicio (ponto inicial
// do bioma, de onde a taxa conta) e distanciaAteABorda. A arena tem também boneco, manchas, inimigosIniciais e
// pontosDeSurgimento.

function montarFloresta() {
  const config = mundo.obstaculos
  const livres = [
    ...floresta.regioes.map((regiao) => ({ ...regiao.inicio, raio: config.raioLivreDoInicio })),
    { ...floresta.lugarDoBoss, raio: config.raioLivreDoBoss },
  ]
  const mata = paredesDaMata(floresta.regioes, floresta.tamanho).map((parede) => ({ ...parede, tipo: 'mata' }))
  const soltos = gerarObstaculos(floresta.regioes, livres, config, floresta.semente)
  const { largura, altura } = floresta.tamanho
  const inicio = { ...floresta.regioes[0].inicio }
  return {
    ...floresta,
    comCamera: true,
    area: { x: largura / 2, y: altura / 2, largura, altura },
    obstaculos: [...mata, ...soltos],
    inicio,
    distanciaAteABorda: distanciaAteABorda(inicio, floresta.regioes),
  }
}

function montarArena() {
  const { tamanhoDaArena, areaJogavel, pedras, manchas, inicio, boneco, inimigosIniciais, pontosDeSurgimento } = arenaDeTeste
  return {
    id: 'arena',
    nome: 'Arena de teste',
    soNoDev: true,
    comCamera: false,
    tamanho: tamanhoDaArena,
    area: areaJogavel,
    obstaculos: pedras.map((pedra) => ({ ...pedra, tipo: 'pedra' })),
    regioes: [],
    areas: [],
    manchas,
    inicio,
    boneco,
    inimigosIniciais,
    pontosDeSurgimento,
    distanciaAteABorda: combateDeTeste.distanciaAteABorda,
  }
}

const montados = new Map()

// No beta, só a Floresta existe; os outros biomas (fora do beta) caem nela
export function mapaDoBioma(id) {
  const chave = id === 'arena' ? 'arena' : 'floresta'
  if (!montados.has(chave)) montados.set(chave, chave === 'arena' ? montarArena() : montarFloresta())
  return montados.get(chave)
}
