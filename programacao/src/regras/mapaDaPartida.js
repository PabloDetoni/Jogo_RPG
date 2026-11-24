import * as arenaDeTeste from '../dados/arenaDeTeste.js'
import { combateDeTeste, mundo } from '../dados/balanceamento.js'
import { floresta } from '../dados/mundo/floresta.js'
import { murosDoForte, raioExterno, torresDoForte, troncosDaPalicada } from './acampamento.js'
import { distanciaAteABorda, gerarObstaculos } from './mundo.js'
import { beiraDaMata, caixaDoPoligono, criarTerreno, paredesDoTerreno } from './terreno.js'

// O mapa pronto para a partida (Fase 3): a Floresta, ou a arena de teste da Fase 1 (só no npm run dev).
// Junta o layout (dados/mundo/) com o que sai das regras: a mata fechada em volta, as árvores e pedras, o ponto
// inicial do bioma e a borda da taxa (RF48). A cena da partida só desenha e move o que vem daqui.
//
// Campos: id, nome, tamanho, area (onde dá para andar: { x, y, largura, altura } com o centro), comCamera,
// obstaculos ({ x, y, largura, altura, tipo: 'mata' | 'arvore' | 'pedra' | 'palicada' | 'muro' | 'fogueira' }), acampamentos (o forte com as torres), regioes (na Floresta, polígonos com a
// caixa), terreno e beiraDaMata (regras/terreno.js), areas, inicio (ponto inicial
// do bioma, de onde a taxa conta) e distanciaAteABorda. A arena tem também boneco, manchas, inimigosIniciais e
// pontosDeSurgimento.

function montarFloresta() {
  const config = mundo.obstaculos
  // Floresta grande (Parte 5): cada zona é um polígono; a caixa em volta dele deixa as contas rápidas
  const regioes = floresta.regioes.map((regiao) => ({ ...regiao, ...caixaDoPoligono(regiao.poligono) }))
  const livres = [
    ...regioes.map((regiao) => ({ ...regiao.inicio, raio: config.raioLivreDoInicio })),
    { ...floresta.lugarDoChefe, raio: config.raioLivreDoBoss },
    // os acampamentos goblin (Parte 6b): nada de árvore ou pedra dentro nem encostado na paliçada
    ...(floresta.acampamentos ?? []).map((acampamento) => ({ ...acampamento.centro, raio: raioExterno(acampamento) + mundo.acampamento.longeDosOutros })),
  ]
  // A grade do terreno: a mata fechada vira retângulos (as paredes) e a beira dela dá os pontos das copas
  const terreno = criarTerreno(regioes, floresta.tamanho, floresta.celulaDoTerreno)
  const mata = paredesDoTerreno(terreno).map((parede) => ({ ...parede, tipo: 'mata' }))
  const soltos = gerarObstaculos(regioes, livres, config, floresta.semente)
  // Acampamentos goblin (Parte 6b): a paliçada vira troncos (paredes) e a fogueira do meio também bloqueia. O forte
  // (Parte 6c) tem muros retos com portões e as torres dos arqueiros nos cantos (as torres são só desenho: o arqueiro
  // fica em cima, parado)
  const acampamentos = (floresta.acampamentos ?? []).map((acampamento) =>
    acampamento.forma === 'retangulo' ? { ...acampamento, torres: torresDoForte(acampamento, mundo.forte.recuoDaTorre) } : acampamento,
  )
  const medidas = mundo.acampamento
  const doAcampamento = acampamentos.flatMap((acampamento) => [
    ...(acampamento.forma === 'retangulo' ? murosDoForte(acampamento, mundo.forte) : troncosDaPalicada(acampamento, medidas)),
    { x: acampamento.centro.x, y: acampamento.centro.y, largura: medidas.fogueira, altura: medidas.fogueira, tipo: 'fogueira' },
  ])
  const { largura, altura } = floresta.tamanho
  const inicio = { ...regioes[0].inicio }
  return {
    ...floresta,
    regioes,
    terreno,
    beiraDaMata: beiraDaMata(terreno),
    comCamera: true,
    area: { x: largura / 2, y: altura / 2, largura, altura },
    obstaculos: [...mata, ...soltos, ...doAcampamento],
    acampamentos,
    inicio,
    distanciaAteABorda: distanciaAteABorda(inicio, regioes),
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
